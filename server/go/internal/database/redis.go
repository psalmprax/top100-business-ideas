package database

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"github.com/top100-business-ideas/api/internal/pkg/retry"
)

var Redis *redis.Client

func ConnectRedis(ctx context.Context, url string, logger *zerolog.Logger) error {
	opts, err := redis.ParseURL(url)
	if err != nil {
		return fmt.Errorf("unable to parse Redis URL: %w", err)
	}

	// Hardening: Connection Pooling
	opts.PoolSize = 100
	opts.MinIdleConns = 10
	opts.ConnMaxLifetime = 30 * time.Minute
	opts.PoolTimeout = 30 * time.Second

	policy := retry.RetryPolicy{
		MaxAttempts: 5,
		BaseDelay:   200 * time.Millisecond,
		MaxDelay:    3 * time.Second,
		Jitter:      true,
	}

	err = policy.Do(ctx, func() error {
		r := redis.NewClient(opts)
		pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
		defer cancel()

		if err := r.Ping(pingCtx).Err(); err != nil {
			r.Close()
			return err
		}

		Redis = r
		return nil
	})

	if err != nil {
		return fmt.Errorf("unable to connect to Redis: %w", err)
	}

	logger.Info().Msg("Redis connection initialized successfully")
	return nil
}

// Session management
type Session struct {
	UserID       string    `json:"user_id"`
	Email        string    `json:"email"`
	Role         string    `json:"role"`
	ExpiresAt    time.Time `json:"expires_at"`
	RefreshToken string    `json:"refresh_token,omitempty"`
}

func CreateSession(ctx context.Context, sessionID string, session *Session, ttl time.Duration) error {
	data, err := json.Marshal(session)
	if err != nil {
		return err
	}
	return Redis.Set(ctx, fmt.Sprintf("session:%s", sessionID), data, ttl).Err()
}

func GetSession(ctx context.Context, sessionID string) (*Session, error) {
	data, err := Redis.Get(ctx, fmt.Sprintf("session:%s", sessionID)).Bytes()
	if err != nil {
		return nil, err
	}
	var session Session
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

func DeleteSession(ctx context.Context, sessionID string) error {
	return Redis.Del(ctx, fmt.Sprintf("session:%s", sessionID)).Err()
}

// Token bucket for rate limiting
type TokenBucket struct {
	Tokens    int   `json:"tokens"`
	LastFill  int64 `json:"last_fill"`
	MaxTokens int   `json:"max_tokens"`
	Rate      int   `json:"rate"` // tokens per second
}

func GetRateLimit(ctx context.Context, key string) (int, bool, error) {
	data, err := Redis.Get(ctx, fmt.Sprintf("ratelimit:%s", key)).Bytes()
	if err == redis.Nil {
		return 0, true, nil // No rate limit found, allow
	}
	if err != nil {
		return 0, false, err
	}

	var bucket TokenBucket
	if err := json.Unmarshal(data, &bucket); err != nil {
		return 0, false, err
	}

	return bucket.Tokens, bucket.Tokens > 0, nil
}

func SetRateLimit(ctx context.Context, key string, bucket *TokenBucket, ttl time.Duration) error {
	data, err := json.Marshal(bucket)
	if err != nil {
		return err
	}
	return Redis.Set(ctx, fmt.Sprintf("ratelimit:%s", key), data, ttl).Err()
}

// API Key caching
func CacheAPIKey(ctx context.Context, keyHash string, data interface{}, ttl time.Duration) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return Redis.Set(ctx, fmt.Sprintf("apikey:%s", keyHash), jsonData, ttl).Err()
}

func GetCachedAPIKey(ctx context.Context, keyHash string) (string, error) {
	return Redis.Get(ctx, fmt.Sprintf("apikey:%s", keyHash)).Result()
}

// Semantic cache for Agent Ops
func CacheSemanticResult(ctx context.Context, promptHash string, result interface{}, ttl time.Duration) error {
	data, err := json.Marshal(result)
	if err != nil {
		return err
	}
	return Redis.Set(ctx, fmt.Sprintf("semantic_cache:%s", promptHash), data, ttl).Err()
}

func GetCachedSemanticResult(ctx context.Context, promptHash string) ([]byte, error) {
	return Redis.Get(ctx, fmt.Sprintf("semantic_cache:%s", promptHash)).Bytes()
}

// Usage tracking
func IncrementUsage(ctx context.Context, apiKeyID string, tokens int, cost float64) error {
	pipe := Redis.Pipeline()

	pipe.IncrBy(ctx, fmt.Sprintf("usage:%s:tokens", apiKeyID), int64(tokens))
	pipe.IncrByFloat(ctx, fmt.Sprintf("usage:%s:cost", apiKeyID), cost)
	pipe.Expire(ctx, fmt.Sprintf("usage:%s:tokens", apiKeyID), 30*24*time.Hour) // 30 days

	_, err := pipe.Exec(ctx)
	return err
}

func GetUsage(ctx context.Context, apiKeyID string) (int64, float64, error) {
	tokens, err := Redis.Get(ctx, fmt.Sprintf("usage:%s:tokens", apiKeyID)).Int64()
	if err == redis.Nil {
		tokens = 0
	} else if err != nil {
		return 0, 0, err
	}

	cost, err := Redis.Get(ctx, fmt.Sprintf("usage:%s:cost", apiKeyID)).Float64()
	if err == redis.Nil {
		cost = 0
	} else if err != nil {
		return 0, 0, err
	}

	return tokens, cost, nil
}

// WebSocket connection tracking
func TrackWSConnection(ctx context.Context, userID string, connID string) error {
	return Redis.SAdd(ctx, fmt.Sprintf("ws:user:%s", userID), connID).Err()
}

func UntrackWSConnection(ctx context.Context, userID string, connID string) error {
	return Redis.SRem(ctx, fmt.Sprintf("ws:user:%s", userID), connID).Err()
}

func GetWSConnections(ctx context.Context, userID string) ([]string, error) {
	return Redis.SMembers(ctx, fmt.Sprintf("ws:user:%s", userID)).Result()
}

// Pub/Sub for real-time updates
func PublishEvent(ctx context.Context, channel string, message interface{}) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}
	return Redis.Publish(ctx, channel, data).Err()
}

func Subscribe(ctx context.Context, channel string) *redis.PubSub {
	return Redis.Subscribe(ctx, channel)
}

// Cache invalidation
func InvalidateCache(ctx context.Context, pattern string) error {
	iter := Redis.Scan(ctx, 0, pattern, 0).Iterator()
	for iter.Next(ctx) {
		if err := Redis.Del(ctx, iter.Val()).Err(); err != nil {
			return err
		}
	}
	return iter.Err()
}

func CloseRedis() {
	if Redis != nil {
		Redis.Close()
	}
}
