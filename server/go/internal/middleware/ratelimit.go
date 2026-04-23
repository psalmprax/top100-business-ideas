package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter implements a token bucket rate limiting algorithm
type RateLimiter struct {
	mu              sync.Mutex
	buckets         map[string]*bucket
	rate            int // tokens per second
	capacity        int // max tokens
	cleanupInterval time.Duration
}

type bucket struct {
	tokens   int
	lastFill time.Time
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(rate, capacity int) *RateLimiter {
	rl := &RateLimiter{
		buckets:         make(map[string]*bucket),
		rate:            rate,
		capacity:        capacity,
		cleanupInterval: 5 * time.Minute,
	}

	// Start cleanup goroutine
	go rl.cleanup()

	return rl
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(rl.cleanupInterval)
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, b := range rl.buckets {
			// Remove buckets that haven't been accessed in 10 minutes
			if now.Sub(b.lastFill) > 10*time.Minute {
				delete(rl.buckets, key)
			}
		}
		rl.mu.Unlock()
	}
}

// getBucket returns the bucket for a given key, creating one if it doesn't exist
func (rl *RateLimiter) getBucket(key string) *bucket {
	b, exists := rl.buckets[key]
	if !exists {
		b = &bucket{
			tokens:   rl.capacity,
			lastFill: time.Now(),
		}
		rl.buckets[key] = b
	}
	return b
}

// Allow checks if a request is allowed and consumes a token if so
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	b := rl.getBucket(key)
	now := time.Now()

	// Calculate how many tokens to add since last fill using high precision float math
	elapsed := now.Sub(b.lastFill)
	tokensToAdd := float64(elapsed.Nanoseconds()) * float64(rl.rate) / 1e9

	// Update bucket status
	// We only increment by whole tokens, but we keep the fractional remainder by 
	// NOT updating lastFill to 'now' exactly, but rather to 'lastFill + (tokensAdded / rate)'
	// OR, simpler: just use float arithmetic for tokens in the bucket but cast to int for comparison.
	
	// Let's use the fractional token approach by storing tokens as float64 in the bucket
	// but keeping the API the same (int).
	
	// Actually, a better way without changing struct types:
	if tokensToAdd >= 1 {
		intTokens := int(tokensToAdd)
		b.tokens += intTokens
		if b.tokens > rl.capacity {
			b.tokens = rl.capacity
		}
		// Move lastFill forward by the amount of time consumed by added whole tokens
		timeConsumed := time.Duration(int64(intTokens) * 1e9 / int64(rl.rate))
		b.lastFill = b.lastFill.Add(timeConsumed)
	}

	// Check if we have tokens available
	if b.tokens > 0 {
		b.tokens--
		return true
	}

	return false
}

// GetRemainingTokens returns the number of tokens remaining for a key
func (rl *RateLimiter) GetRemainingTokens(key string) int {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	b := rl.getBucket(key)
	now := time.Now()

	// Calculate tokens currently in bucket including fractional time
	elapsed := now.Sub(b.lastFill)
	tokensToAdd := int(float64(elapsed.Nanoseconds()) * float64(rl.rate) / 1e9)
	tokens := b.tokens + tokensToAdd
	if tokens > rl.capacity {
		tokens = rl.capacity
	}

	return tokens
}

// RateLimitMiddleware creates a Gin middleware for rate limiting
func RateLimitMiddleware(rate, capacity int) gin.HandlerFunc {
	if rate <= 0 {
		rate = 100
	}
	if capacity <= 0 {
		capacity = 200
	}

	limiter := NewRateLimiter(rate, capacity)

	return func(c *gin.Context) {
		fmt.Printf("[RateLimit Debug In-Mem] Path: %s\n", c.Request.URL.Path)
		// Skip rate limiting for health checks and auth routes
		if c.Request.URL.Path == "/health" || c.Request.URL.Path == "/health/" || 
		   strings.HasPrefix(c.Request.URL.Path, "/api/v1/auth/") {
			fmt.Printf("[RateLimit Debug In-Mem] Skipping auth/health route: %s\n", c.Request.URL.Path)
			c.Next()
			return
		}

		// Get client identifier (API key or IP)
		var key string
		apiKey := c.GetHeader("X-API-Key")
		if apiKey != "" {
			key = "api:" + apiKey
		} else {
			// Fall back to IP address
			key = "ip:" + c.ClientIP()
		}

		// Check rate limit
		if !limiter.Allow(key) {
			remaining := limiter.GetRemainingTokens(key)
			c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
			c.Header("X-RateLimit-Reset", "1")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "Rate limit exceeded",
				"message":     "Too many requests. Please try again later.",
				"retry_after": "1 second",
			})
			return
		}

		// Set rate limit headers
		remaining := limiter.GetRemainingTokens(key)
		c.Header("X-RateLimit-Limit", strconv.Itoa(capacity))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))

		c.Next()
	}
}

// APIKeyRateLimitMiddleware creates rate limiting based on API key tier
func APIKeyRateLimitMiddleware(getRateLimit func(apiKey string) int) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.Next()
			return
		}

		// Get custom rate limit for this API key
		rateLimit := 100 // default
		if getRateLimit != nil {
			rateLimit = getRateLimit(apiKey)
		}

		limiter := NewRateLimiter(rateLimit, rateLimit)

		if !limiter.Allow("api:" + apiKey) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "API rate limit exceeded",
				"message": "You have exceeded your API rate limit",
			})
			return
		}

		c.Next()
	}
}
