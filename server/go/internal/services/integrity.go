package services

import (
	"context"
	"net/http"
	"runtime"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// IntegrityService verifies the health and configuration of system dependencies
type IntegrityService struct {
	logger *zerolog.Logger
	db     *pgxpool.Pool
	redis  *redis.Client
	proxy  *ProxyService
}

func NewIntegrityService(logger *zerolog.Logger, db *pgxpool.Pool, redis *redis.Client, proxy *ProxyService) *IntegrityService {
	return &IntegrityService{
		logger: logger,
		db:     db,
		redis:  redis,
		proxy:  proxy,
	}
}

// VerifySystemIntegrity performs a dependency inventory and connectivity check
func (s *IntegrityService) VerifySystemIntegrity() error {
	s.logger.Info().
		Str("go_version", runtime.Version()).
		Str("os", runtime.GOOS).
		Str("arch", runtime.GOARCH).
		Int("cpus", runtime.NumCPU()).
		Msg("System Inventory initialized")

	// 1. Database Check
	if s.db != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		if err := s.db.Ping(ctx); err != nil {
			s.logger.Error().Err(err).Msg("Database connectivity failure")
		} else {
			s.logger.Info().Msg("Database connection healthy")
		}
	}

	// 2. Redis Check
	if s.redis != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		if err := s.redis.Ping(ctx).Err(); err != nil {
			s.logger.Error().Err(err).Msg("Redis connectivity failure")
		} else {
			s.logger.Info().Msg("Redis connection healthy")
		}
	}

	// 3. Python Backend Check
	if s.proxy != nil {
		go func() {
			resp, err := http.Get(s.proxy.baseURL + "/health")
			if err != nil {
				s.logger.Warn().Err(err).Msg("Python backend unreachable at startup (Sandbox mode active)")
			} else {
				defer resp.Body.Close()
				if resp.StatusCode == http.StatusOK {
					s.logger.Info().Msg("Python backend connected successfully")
				} else {
					s.logger.Warn().Int("status", resp.StatusCode).Msg("Python backend returned non-OK status")
				}
			}
		}()
	}

	s.logger.Info().Msg("Dependency verification completed")
	return nil
}
