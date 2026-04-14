package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// CircuitState represents the state of a circuit breaker
type CircuitState int

const (
	CircuitStateClosed CircuitState = iota
	CircuitStateOpen
	CircuitStateHalfOpen
)

// CircuitBreakerConfig holds configuration for the circuit breaker
type CircuitBreakerConfig struct {
	FailureThreshold int           // Number of failures before opening the circuit
	SuccessThreshold int           // Number of successes needed to close from half-open
	Timeout          time.Duration // How long the circuit stays open
	RequestTimeout   time.Duration // Timeout for each request
}

// CircuitBreaker implements the circuit breaker pattern
type CircuitBreaker struct {
	failures        int
	successes       int
	state           CircuitState
	lastFailureTime time.Time
	mu              sync.RWMutex
	config          CircuitBreakerConfig
}

// NewCircuitBreaker creates a new circuit breaker with the given config
func NewCircuitBreaker(config CircuitBreakerConfig) *CircuitBreaker {
	return &CircuitBreaker{
		failures:  0,
		successes: 0,
		state:     CircuitStateClosed,
		config:    config,
	}
}

// Execute runs the given function with circuit breaker protection
func (cb *CircuitBreaker) Execute(fn func() error) error {
	if !cb.allowRequest() {
		return &CircuitOpenError{Message: "circuit breaker is open"}
	}

	// Execute with timeout
	errChan := make(chan error, 1)
	go func() {
		errChan <- fn()
	}()

	select {
	case err := <-errChan:
		cb.onResult(err)
		return err
	case <-time.After(cb.config.RequestTimeout):
		cb.onResult(&CircuitTimeoutError{Message: "request timed out"})
		return &CircuitTimeoutError{Message: "request timed out"}
	}
}

// allowRequest checks if a request should be allowed
func (cb *CircuitBreaker) allowRequest() bool {
	cb.mu.RLock()
	defer cb.mu.RUnlock()

	switch cb.state {
	case CircuitStateClosed:
		return true
	case CircuitStateOpen:
		// Check if timeout has passed to transition to half-open
		if time.Since(cb.lastFailureTime) > cb.config.Timeout {
			return true
		}
		return false
	case CircuitStateHalfOpen:
		return true
	default:
		return true
	}
}

// onResult handles the result of a request
func (cb *CircuitBreaker) onResult(err error) {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	if err != nil {
		cb.failures++
		cb.lastFailureTime = time.Now()

		if cb.state == CircuitStateHalfOpen {
			// Failed during half-open, go back to open
			cb.state = CircuitStateOpen
			cb.successes = 0
		} else if cb.failures >= cb.config.FailureThreshold {
			// Too many failures, open the circuit
			cb.state = CircuitStateOpen
		}
	} else {
		cb.successes++
		cb.failures = 0

		if cb.state == CircuitStateHalfOpen {
			// Successful in half-open, close the circuit
			if cb.successes >= cb.config.SuccessThreshold {
				cb.state = CircuitStateClosed
				cb.successes = 0
			}
		}
	}
}

// GetState returns the current state of the circuit breaker
func (cb *CircuitBreaker) GetState() CircuitState {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return cb.state
}

// Reset resets the circuit breaker to closed state
func (cb *CircuitBreaker) Reset() {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	cb.state = CircuitStateClosed
	cb.failures = 0
	cb.successes = 0
}

// CircuitOpenError is returned when the circuit is open
type CircuitOpenError struct {
	Message string
}

func (e *CircuitOpenError) Error() string {
	return e.Message
}

// CircuitTimeoutError is returned when a request times out
type CircuitTimeoutError struct {
	Message string
}

func (e *CircuitTimeoutError) Error() string {
	return e.Message
}

// CircuitBreakerMiddleware creates a middleware that applies circuit breaker to stdlib handlers
func CircuitBreakerMiddleware(config CircuitBreakerConfig) func(http.Handler) http.Handler {
	breaker := NewCircuitBreaker(config)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			err := breaker.Execute(func() error {
				next.ServeHTTP(w, r)
				return nil
			})

			if err != nil {
				switch err.(type) {
				case *CircuitOpenError:
					http.Error(w, "Service temporarily unavailable", http.StatusServiceUnavailable)
				case *CircuitTimeoutError:
					http.Error(w, "Request timed out", http.StatusGatewayTimeout)
				}
			}
		})
	}
}

// GinCircuitBreakerMiddleware creates a Gin middleware for circuit breaking
func GinCircuitBreakerMiddleware(serviceName string, config CircuitBreakerConfig) gin.HandlerFunc {
	breaker := GetOrCreateBreaker(serviceName, config)

	return func(c *gin.Context) {
		err := breaker.Execute(func() error {
			c.Next()
			
			// If the handler set an error or status >= 500, we count it as a failure
			if len(c.Errors) > 0 || c.Writer.Status() >= 500 {
				return fmt.Errorf("request failed with status %d", c.Writer.Status())
			}
			return nil
		})

		if err != nil {
			if _, ok := err.(*CircuitOpenError); ok {
				c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{
					"error":   "Circuit Breaker Open",
					"message": fmt.Sprintf("Service '%s' is temporarily unavailable to prevent cascading failure.", serviceName),
					"status":  "isolated",
				})
				return
			}
			// Other errors (like timeout) are already handled by the logic above or c.Next()
		}
	}
}

// GlobalCircuitBreakerRegistry holds circuit breakers for different services
type GlobalCircuitBreakerRegistry struct {
	breakers map[string]*CircuitBreaker
	mu       sync.RWMutex
}

var globalBreakerRegistry = &GlobalCircuitBreakerRegistry{
	breakers: make(map[string]*CircuitBreaker),
}

// GetOrCreateBreaker gets or creates a circuit breaker for a service
func GetOrCreateBreaker(serviceName string, config CircuitBreakerConfig) *CircuitBreaker {
	globalBreakerRegistry.mu.Lock()
	defer globalBreakerRegistry.mu.Unlock()

	if breaker, exists := globalBreakerRegistry.breakers[serviceName]; exists {
		return breaker
	}

	breaker := NewCircuitBreaker(config)
	globalBreakerRegistry.breakers[serviceName] = breaker
	return breaker
}

// GetAllBreakerStates returns the states of all circuit breakers
func GetAllBreakerStates() map[string]string {
	globalBreakerRegistry.mu.RLock()
	defer globalBreakerRegistry.mu.RUnlock()

	states := make(map[string]string)
	for name, breaker := range globalBreakerRegistry.breakers {
		switch breaker.GetState() {
		case CircuitStateClosed:
			states[name] = "closed"
		case CircuitStateOpen:
			states[name] = "open"
		case CircuitStateHalfOpen:
			states[name] = "half-open"
		}
	}
	return states
}
