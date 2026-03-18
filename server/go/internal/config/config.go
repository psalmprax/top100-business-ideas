package config

import (
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
}

func Load() *Config {
	return &Config{
		Host:             getEnv("HOST", "0.0.0.0"),
		Port:             getEnvAsInt("PORT", 8080),
		Environment:      getEnv("ENVIRONMENT", "development"),
		JWTSecret:        getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiry:        getEnvAsInt("JWT_EXPIRY", 24),
		DatabaseURL:      getEnv("DATABASE_URL", "postgres://localhost:5432/top100ideas"),
		PythonBackendURL: getEnv("PYTHON_BACKEND_URL", "http://127.0.0.1:8000"),
		RedisURL:         getEnv("REDIS_URL", "redis://localhost:6379"),
		OpenAIAPIKey:     getEnv("OPENAI_API_KEY", ""),
	}
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
