package middleware

import (
	"net/http"
	"os"
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

	// Calculate how many tokens to add since last fill
	elapsed := now.Sub(b.lastFill)
	tokensToAdd := int(elapsed.Seconds()) * rl.rate

	// Refill tokens
	b.tokens += tokensToAdd
	if b.tokens > rl.capacity {
		b.tokens = rl.capacity
	}
	b.lastFill = now

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

	// Calculate current tokens
	elapsed := now.Sub(b.lastFill)
	tokensToAdd := int(elapsed.Seconds()) * rl.rate
	tokens := b.tokens + tokensToAdd
	if tokens > rl.capacity {
		tokens = rl.capacity
	}

	return tokens
}

// RateLimitMiddleware creates a Gin middleware for rate limiting
func RateLimitMiddleware(rateLimit int) gin.HandlerFunc {
	// Default: 100 requests per second, burst of 200
	rate := 100
	capacity := 200
	if rateLimit > 0 {
		capacity = rateLimit
	}

	limiter := NewRateLimiter(rate, capacity)

	return func(c *gin.Context) {
		// Skip rate limiting for health checks
		if c.Request.URL.Path == "/health" || c.Request.URL.Path == "/health/" {
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
			c.Header("X-RateLimit-Remaining", string(rune(remaining)))
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
		c.Header("X-RateLimit-Limit", string(rune(capacity)))
		c.Header("X-RateLimit-Remaining", string(rune(remaining)))

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

// CORSMiddleware handles CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")

		// Validate origin if provided
		validOrigin := false
		if origin != "" {
			for _, ao := range allowedOrigins {
				if strings.TrimSpace(ao) == origin || ao == "*" {
					validOrigin = true
					break
				}
			}
		}

		// If no origin or valid origin, set it
		if validOrigin || (len(allowedOrigins) == 1 && strings.TrimSpace(allowedOrigins[0]) == "") {
			if origin != "" && (len(allowedOrigins) > 0 && allowedOrigins[0] != "") {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
			}
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}

		// Only allow credentials with specific origins, not wildcard
		if c.Writer.Header().Get("Access-Control-Allow-Origin") != "*" {
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-API-Key")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// RequestIDMiddleware adds a unique request ID to each request
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

func generateRequestID() string {
	return strings.ReplaceAll(time.Now().Format("20060102150405.000000"), ".", "")
}
