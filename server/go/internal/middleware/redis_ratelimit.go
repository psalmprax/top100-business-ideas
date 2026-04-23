package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// RedisRateLimiter implements distributed rate limiting using Redis
type RedisRateLimiter struct {
	client    *redis.Client
	rate      int
	capacity  int
	keyPrefix string
}

// NewRedisRateLimiter creates a Redis-backed rate limiter
func NewRedisRateLimiter(redisURL string, rate, capacity int) (*RedisRateLimiter, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	client := redis.NewClient(opts)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &RedisRateLimiter{
		client:    client,
		rate:      rate,
		capacity:  capacity,
		keyPrefix: "ratelimit:",
	}, nil
}

// Allow checks if request is allowed using sliding window algorithm
func (rl *RedisRateLimiter) Allow(ctx context.Context, key string) (bool, int, error) {
	now := time.Now()
	window := now.Unix()

	redisKey := rl.keyPrefix + key

	// Use sliding window with sorted set
	pipe := rl.client.Pipeline()

	// Remove old entries outside the window
	pipe.ZRemRangeByScore(ctx, redisKey, "0", strconv.FormatInt(window-int64(rl.capacity), 10))

	// Count current requests in window
	countCmd := pipe.ZCard(ctx, redisKey)

	// Add new request
	pipe.ZAdd(ctx, redisKey, redis.Z{
		Score:  float64(window),
		Member: fmt.Sprintf("%d:%s", now.UnixNano(), now.Format("15:04:05.000")),
	})

	// Set expiry
	pipe.Expire(ctx, redisKey, time.Duration(rl.capacity)*time.Second)

	_, err := pipe.Exec(ctx)
	if err != nil {
		return false, 0, err
	}

	count := int(countCmd.Val())
	remaining := rl.capacity - count

	if count >= rl.capacity {
		return false, 0, nil
	}

	return true, remaining, nil
}

// AllowWithBurst allows bursting up to capacity using token bucket
func (rl *RedisRateLimiter) AllowWithBurst(ctx context.Context, key string) (bool, int, error) {
	redisKey := rl.keyPrefix + "burst:" + key

	// Get current tokens
	var tokens float64
	val, err := rl.client.Get(ctx, redisKey).Result()
	if err == redis.Nil {
		tokens = float64(rl.capacity)
	} else if err != nil {
		return false, 0, err
	} else {
		tokens, _ = strconv.ParseFloat(val, 64)
	}

	// Calculate tokens to add based on time passed
	ttl, _ := rl.client.TTL(ctx, redisKey).Result()
	if ttl > 0 {
		elapsed := time.Duration(rl.capacity) - ttl
		tokensAdded := float64(elapsed.Seconds()) * float64(rl.rate)
		tokens = tokens + tokensAdded
		if tokens > float64(rl.capacity) {
			tokens = float64(rl.capacity)
		}
	}

	if tokens >= 1 {
		tokens -= 1
		rl.client.Set(ctx, redisKey, strconv.FormatFloat(tokens, 'f', 2, 64), time.Duration(rl.capacity)*time.Second)
		return true, int(tokens), nil
	}

	return false, int(tokens), nil
}

// GetCurrentCount returns current request count for a key
func (rl *RedisRateLimiter) GetCurrentCount(ctx context.Context, key string) (int, error) {
	redisKey := rl.keyPrefix + key
	now := time.Now()
	window := now.Unix()

	count, err := rl.client.ZCount(ctx, redisKey, "0", strconv.FormatInt(window, 10)).Result()
	if err != nil {
		return 0, err
	}

	return int(count), nil
}

// RedisRateLimitMiddleware creates Gin middleware using Redis
func RedisRateLimitMiddleware(redisURL string, rate, capacity int) gin.HandlerFunc {
	if capacity <= 0 {
		capacity = 200
	}
	if rate <= 0 {
		rate = 100
	}

	limiter, err := NewRedisRateLimiter(redisURL, rate, capacity)
	if err != nil {
		// Fall back to in-memory if Redis unavailable
		return RateLimitMiddleware(rate, capacity)
	}

	return func(c *gin.Context) {
		// Skip for health checks and auth routes
		if c.Request.URL.Path == "/health" || c.Request.URL.Path == "/health/" || 
		   strings.HasPrefix(c.Request.URL.Path, "/api/v1/auth/") {
			c.Next()
			return
		}

		var key string
		apiKey := c.GetHeader("X-API-Key")
		if apiKey != "" {
			key = "api:" + apiKey
		} else {
			key = "ip:" + c.ClientIP()
		}

		ctx := c.Request.Context()
		allowed, remaining, err := limiter.AllowWithBurst(ctx, key)
		if err != nil {
			// Log error but allow request if rate limiting fails
			c.Header("X-RateLimit-Limit", strconv.Itoa(capacity))
			c.Header("X-RateLimit-Remaining", strconv.Itoa(capacity))
			c.Next()
			return
		}

		c.Header("X-RateLimit-Limit", strconv.Itoa(capacity))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))

		if !allowed {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "Rate limit exceeded",
				"message":     "Too many requests. Please try again later.",
				"retry_after": "1 second",
			})
			return
		}

		c.Next()
	}
}

// Close cleans up Redis connection
func (rl *RedisRateLimiter) Close() error {
	return rl.client.Close()
}
