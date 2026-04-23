package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/rs/zerolog"
)

type Config struct {
	// Server
	Host           string
	Port           int
	Environment    string
	AllowedOrigins []string

	// JWT
	JWTSecret string
	JWTExpiry int // hours

	// Database
	DatabaseURL string

	// Python Backend
	PythonBackendURL string

	// Redis
	RedisURL string

	// External Services
	OpenAIAPIKey string

	// Billing
	StripeSecretKey     string
	StripeWebhookSecret string
	PayPalClientID      string
	PayPalSecret        string
	PayPalAppID         string
	PayPalMode          string // "sandbox" or "live"

	// Security Hardening
	AdminSecret string

	// Rate Limiting
	RateLimitRate     int
	RateLimitCapacity int
}

func getEnvAsSlice(key, separator string) []string {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return []string{}
	}
	return strings.Split(valueStr, separator)
}

func Load(logger *zerolog.Logger) *Config {
	cfg := &Config{
		Host:                getEnv("HOST", "0.0.0.0"),
		Port:                getEnvAsInt("PORT", 8080, logger),
		Environment:         getEnv("ENVIRONMENT", "development"),
		AllowedOrigins:      getEnvAsSlice("ALLOWED_ORIGINS", ","),
		JWTSecret:           getEnv("JWT_SECRET", ""),
		JWTExpiry:           getEnvAsInt("JWT_EXPIRY", 24, logger),
		DatabaseURL:         getEnv("DATABASE_URL", ""),
		PythonBackendURL:    getEnv("PYTHON_BACKEND_URL", ""),
		RedisURL:            getEnv("REDIS_URL", "redis://localhost:6379"),
		OpenAIAPIKey:        getEnv("OPENAI_API_KEY", ""),
		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		PayPalClientID:      getEnv("PAYPAL_CLIENT_ID", ""),
		PayPalSecret:        getEnv("PAYPAL_SECRET", ""),
		PayPalAppID:         getEnv("PAYPAL_APP_ID", ""),
		PayPalMode:          getEnv("PAYPAL_MODE", "sandbox"),
		AdminSecret:         getEnv("ADMIN_SECRET", ""),
		RateLimitRate:       getEnvAsInt("RATE_LIMIT_RATE", 100, logger),
		RateLimitCapacity:   getEnvAsInt("RATE_LIMIT_CAPACITY", 200, logger),
	}

	if cfg.JWTSecret == "" {
		logger.Fatal().Msg("JWT_SECRET environment variable is not set. System exiting for security.")
	}

	if cfg.AdminSecret == "" {
		logger.Fatal().Msg("ADMIN_SECRET environment variable is not set. System exiting for security.")
	}

	if cfg.DatabaseURL == "" {
		logger.Fatal().Msg("DATABASE_URL environment variable is not set. System exiting.")
	}

	if cfg.PythonBackendURL == "" {
		logger.Fatal().Msg("PYTHON_BACKEND_URL environment variable is not set. System exiting.")
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int, logger *zerolog.Logger) int {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		logger.Warn().
			Str("key", key).
			Str("value", valueStr).
			Int("default", defaultValue).
			Msg("Invalid integer environment variable, using default")
		return defaultValue
	}
	return value
}
