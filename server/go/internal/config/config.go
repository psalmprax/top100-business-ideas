package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	// Server
	Host        string
	Port        int
	Environment string

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
}

func Load() *Config {
	cfg := &Config{
		Host:                getEnv("HOST", "0.0.0.0"),
		Port:                getEnvAsInt("PORT", 8080),
		Environment:         getEnv("ENVIRONMENT", "development"),
		JWTSecret:           getEnv("JWT_SECRET", ""),
		JWTExpiry:           getEnvAsInt("JWT_EXPIRY", 24),
		DatabaseURL:         getEnv("DATABASE_URL", "postgres://localhost:5432/top100ideas"),
		PythonBackendURL:    getEnv("PYTHON_BACKEND_URL", "http://127.0.0.1:8000"),
		RedisURL:            getEnv("REDIS_URL", "redis://localhost:6379"),
		OpenAIAPIKey:        getEnv("OPENAI_API_KEY", ""),
		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		PayPalClientID:      getEnv("PAYPAL_CLIENT_ID", ""),
		PayPalSecret:        getEnv("PAYPAL_SECRET", ""),
		PayPalAppID:         getEnv("PAYPAL_APP_ID", ""),
		PayPalMode:          getEnv("PAYPAL_MODE", "sandbox"),
		AdminSecret:         getEnv("ADMIN_SECRET", ""),
	}

	if cfg.JWTSecret == "" {
		fmt.Println("FATAL: JWT_SECRET environment variable is not set. System exiting for security.")
		os.Exit(1)
	}

	if cfg.AdminSecret == "" {
		fmt.Println("FATAL: ADMIN_SECRET environment variable is not set. System exiting for security.")
		os.Exit(1)
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
