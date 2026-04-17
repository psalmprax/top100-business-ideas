package retry

import (
	"context"
	"math/rand"
	"time"
)

// RetryPolicy defines the parameters for a retry operation
type RetryPolicy struct {
	MaxAttempts int
	BaseDelay   time.Duration
	MaxDelay    time.Duration
	Jitter      bool
}

// DefaultPolicy provides a standard exponential backoff policy
var DefaultPolicy = RetryPolicy{
	MaxAttempts: 3,
	BaseDelay:   100 * time.Millisecond,
	MaxDelay:    2 * time.Second,
	Jitter:      true,
}

// Do executes the given function with retries according to the policy
func (p RetryPolicy) Do(ctx context.Context, fn func() error) error {
	var lastErr error

	for attempt := 0; attempt < p.MaxAttempts; attempt++ {
		if err := fn(); err == nil {
			return nil
		} else {
			lastErr = err
		}

		if attempt < p.MaxAttempts-1 {
			delay := p.calculateDelay(attempt)
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(delay):
			}
		}
	}

	return lastErr
}

func (p RetryPolicy) calculateDelay(attempt int) time.Duration {
	// Exponential backoff: base * 2^attempt
	delay := p.BaseDelay * time.Duration(1<<attempt)

	if p.Jitter {
		// Add some jitter to avoid thundering herd problem
		// We add a random factor between 0.5 and 1.5 of the calculated delay
		jitterRange := float64(delay) * 0.5
		randomJitter := time.Duration(rand.Float64() * jitterRange)
		if rand.Float64() > 0.5 {
			delay += randomJitter
		} else {
			delay -= randomJitter
		}
	}

	if delay > p.MaxDelay {
		delay = p.MaxDelay
	}

	return delay
}
