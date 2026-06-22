package retry

import (
	"context"
	"crypto/rand"
	"math/big"
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
	delay := p.BaseDelay * time.Duration(1<<attempt)

	if p.Jitter {
		jitterRange := float64(delay) * 0.5
		n, _ := rand.Int(rand.Reader, big.NewInt(1<<53))
		randFloat := float64(n.Int64()) / float64(1<<53)
		randomJitter := time.Duration(randFloat * jitterRange)
		n2, _ := rand.Int(rand.Reader, big.NewInt(1<<53))
		if float64(n2.Int64())/float64(1<<53) > 0.5 {
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
