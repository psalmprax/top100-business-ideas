package middleware

import (
	"testing"
	"time"
)

func TestRateLimiter(t *testing.T) {
	// Create a rate limiter with 10 requests per second, burst of 20
	limiter := NewRateLimiter(10, 20)

	// Should allow first 20 requests
	for i := 0; i < 20; i++ {
		if !limiter.Allow("test-key") {
			t.Errorf("Request %d should be allowed", i+1)
		}
	}

	// 21st request should be denied
	if limiter.Allow("test-key") {
		t.Error("Request 21 should be denied (rate limit exceeded)")
	}
}

func TestRateLimiterDifferentKeys(t *testing.T) {
	limiter := NewRateLimiter(10, 10)

	// Different keys should have independent limits
	for i := 0; i < 10; i++ {
		if !limiter.Allow("key-1") {
			t.Errorf("key-1: Request %d should be allowed", i+1)
		}
		if !limiter.Allow("key-2") {
			t.Errorf("key-2: Request %d should be allowed", i+1)
		}
	}

	// Both keys should be exhausted
	if limiter.Allow("key-1") {
		t.Error("key-1 should be rate limited")
	}
	if limiter.Allow("key-2") {
		t.Error("key-2 should be rate limited")
	}
}

func TestRateLimiterRefill(t *testing.T) {
	limiter := NewRateLimiter(10, 10)

	// Use up all tokens
	for i := 0; i < 10; i++ {
		limiter.Allow("test-key")
	}

	// Wait for refill
	time.Sleep(200 * time.Millisecond)

	// Should have some tokens now
	remaining := limiter.GetRemainingTokens("test-key")
	if remaining <= 0 {
		t.Error("Expected some tokens after refill")
	}
}

func TestRateLimiterGetRemainingTokens(t *testing.T) {
	limiter := NewRateLimiter(10, 10)

	// Initially should have full capacity
	remaining := limiter.GetRemainingTokens("test-key")
	if remaining != 10 {
		t.Errorf("Expected 10 tokens, got %d", remaining)
	}

	// Use 5 tokens
	for i := 0; i < 5; i++ {
		limiter.Allow("test-key")
	}

	remaining = limiter.GetRemainingTokens("test-key")
	if remaining != 5 {
		t.Errorf("Expected 5 tokens, got %d", remaining)
	}
}

func TestRateLimiterCleanup(t *testing.T) {
	limiter := NewRateLimiter(10, 10)

	// Add some buckets
	limiter.Allow("key-1")
	limiter.Allow("key-2")

	// Wait for cleanup interval
	time.Sleep(1 * time.Second)

	// Buckets should still exist (only cleaned after 10 min)
	if limiter.GetRemainingTokens("key-1") <= 0 {
		t.Error("key-1 should still have tokens")
	}
}

func BenchmarkRateLimiterAllow(b *testing.B) {
	limiter := NewRateLimiter(1000, 1000)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		limiter.Allow("bench-key")
	}
}

func BenchmarkRateLimiterGetRemaining(b *testing.B) {
	limiter := NewRateLimiter(1000, 1000)
	limiter.Allow("bench-key")

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		limiter.GetRemainingTokens("bench-key")
	}
}
