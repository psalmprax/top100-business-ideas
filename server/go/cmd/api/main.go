package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/top100-business-ideas/api/internal/api/routers"
	"github.com/top100-business-ideas/api/internal/config"
	"github.com/top100-business-ideas/api/internal/database"
	"github.com/top100-business-ideas/api/internal/handlers"
	"github.com/top100-business-ideas/api/internal/middleware"
	"github.com/top100-business-ideas/api/internal/repository"
	"github.com/top100-business-ideas/api/internal/services"
)

// @title			Top100 Business Ideas API Gateway
// @version			1.0.0
// @description		High-performance API gateway for Top100 Business Ideas platform
// @termsOfService	http://swagger.io/terms/

// @contact.name	API Support
// @contact.url		http://www.top100businessideas.com/support
// @contact.email	support@top100businessideas.com

// @license.name	MIT
// @license.url		https://opensource.org/licenses/MIT

// @host			localhost:8080
// @BasePath		/api/v1

func main() {
	// Initialize logger first
	logger := zerolog.New(os.Stdout).
		Level(zerolog.InfoLevel).
		With().
		Timestamp().
		Caller().
		Logger()

	// Parent context for the application
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle signals for graceful shutdown
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigCh
		logger.Info().Msg("Shutting down server...")
		cancel()
	}()

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logger.Info().Msg("No .env file found, using environment variables")
	}

	// Load configuration
	cfg := config.Load(&logger)

	// Initialize Redis with retry
	if err := database.ConnectRedis(ctx, cfg.RedisURL, &logger); err != nil {
		logger.Error().Err(err).Msg("Failed to connect to Redis, features like rate limiting and session management will be compromised")
	}
	defer database.CloseRedis()

	// Initialize Database with retry
	if err := database.Connect(ctx, cfg.DatabaseURL, &logger); err != nil {
		logger.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer database.Close()

	// Run database migrations - all tables use IF NOT EXISTS for safety
	if err := database.RunMigrations(context.Background()); err != nil {
		logger.Fatal().Err(err).Msg("Failed to run database migrations")
	}
	logger.Info().Msg("Database migrations completed successfully")

	// Initialize Repositories
	userRepo := repository.NewUserRepository()
	workforceRepo := repository.NewWorkforceRepository()

	// Initialize Services
	authService := services.NewAuthService(cfg.JWTSecret, userRepo)
	proxyService := services.NewProxyService(cfg.PythonBackendURL, &logger)
	wsHub := services.NewWebSocketHub()

	// Hardening: Audit and Integrity Services
	auditService := services.NewSelfHealingAuditService(&logger, proxyService)
	integrityService := services.NewIntegrityService(&logger, database.Pool, database.Redis, proxyService)

	// Perform Startup Integrity Check (Dependency Inventory)
	if err := integrityService.VerifySystemIntegrity(); err != nil {
		logger.Error().Err(err).Msg("System integrity check reported warnings")
	}

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler()
	authHandler := handlers.NewAuthHandler(authService)
	agentOpsHandler := handlers.NewAgentOpsHandler(proxyService)

	// Initialize File Upload Services
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	commonUploadHandler := services.NewFileUploadHandler(uploadDir, 20*1024*1024) // 20MB limit

	complianceHandler := handlers.NewComplianceHandler(proxyService, commonUploadHandler)
	deepfakeHandler := handlers.NewDeepfakeHandler(proxyService, commonUploadHandler)
	wsHandler := handlers.NewWebSocketHandler(wsHub)
	rulesHandler := handlers.NewRulesHandler(proxyService)
	metricsHandler := handlers.NewMetricsHandler(proxyService)
	billingService, err := services.NewBillingService(cfg)
	if err != nil {
		logger.Error().Err(err).Msg("Failed to initialize BillingService, falling back to restricted mode")
	}
	billingHandler := handlers.NewBillingHandler(billingService, proxyService)
	mlHandler := handlers.NewMLHandler(proxyService)

	// New handlers for gap closure
	webhookHandler := handlers.NewWebhookHandler(proxyService)
	alertHandler := handlers.NewAlertHandler(proxyService)
	multiCloudHandler := handlers.NewMultiCloudHandler(proxyService)
	selfHealingHandler := handlers.NewSelfHealingHandler(proxyService)
	trainingHandler := handlers.NewTrainingHandler(proxyService)
	shadowAIHandler := handlers.NewShadowAIHandler(proxyService)
	enterpriseHandler := handlers.NewEnterpriseHandler(proxyService)
	denialDefenseRepo := repository.NewDenialDefenseRepository()
	denialDefenseHandler := handlers.NewDenialDefenseHandler(denialDefenseRepo)
	userHandler := handlers.NewUserHandler(userRepo, authService)
	panicHandler := handlers.NewPanicHandler(cfg.AdminSecret)
	vendorHandler := handlers.NewVendorHandler(proxyService)

	// New domain-specific handlers for production-grade routing
	governanceHandler := handlers.NewGovernanceHandler(proxyService)
	intelligenceHandler := handlers.NewIntelligenceHandler(proxyService)
	workforceHandler := handlers.NewWorkforceHandler(proxyService, workforceRepo)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New() // Use New() instead of Default() for full control

	// Global middleware stack - Hardening Order
	// 1. Security Headers first
	router.Use(middleware.SecurityHeaders())
	// 2. Request ID and Tracing
	router.Use(middleware.RequestID())
	// 3. Structured Logging
	router.Use(middleware.Logger(&logger))
	// 4. Enhanced Self-Healing Recovery
	router.Use(middleware.SelfHealingRecovery(auditService))
	// 5. Infrastructure
	router.Use(middleware.CORS(cfg.AllowedOrigins))
	router.Use(middleware.SystemLock())
	// Distributed Redis rate limiter (falls back to in-memory if Redis unavailable)
	router.Use(middleware.RedisRateLimitMiddleware(cfg.RedisURL, 100))

	// Health check (no auth required)
	router.GET("/health", healthHandler.Health)

	// 135: // ML endpoints (proxy to Python backend) protected by Circuit Breaker
	// Moved to SetupAllRoutes for /api/v1 versioning parity

	// Setup all API routes using modular router system
	handlerContainer := &routers.HandlerContainer{
		PanicHandler:         panicHandler,
		AuthHandler:          authHandler,
		UserHandler:          userHandler,
		AgentOpsHandler:      agentOpsHandler,
		ComplianceHandler:    complianceHandler,
		DeepfakeHandler:      deepfakeHandler,
		DenialDefenseHandler: denialDefenseHandler,
		EnterpriseHandler:    enterpriseHandler,
		RulesHandler:         rulesHandler,
		MetricsHandler:       metricsHandler,
		BillingHandler:       billingHandler,
		WSHandler:            wsHandler,
		WebhookHandler:       webhookHandler,
		AlertHandler:         alertHandler,
		MultiCloudHandler:    multiCloudHandler,
		SelfHealingHandler:   selfHealingHandler,
		ShadowAIHandler:      shadowAIHandler,
		TrainingHandler:      trainingHandler,
		GovernanceHandler:    governanceHandler,
		MLHandler:            mlHandler,
		IntelligenceHandler:  intelligenceHandler,
		WorkforceHandler:     workforceHandler,
		VendorHandler:        vendorHandler,
	}

	middlewareContainer := &routers.MiddlewareContainer{
		Auth:          middleware.Auth(authService),
		ProductAccess: middleware.ProductAccess,
		RequireRole:   middleware.RequireRole,
	}

	routers.SetupAllRoutes(router, handlerContainer, middlewareContainer)

	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start WebSocket hub in background
	go wsHub.Run()

	// Start Compliance Metrics Broadcast Loop (Real-First bridging)
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if wsHub.GetClientCount() > 0 {
					metrics, err := proxyService.Forward(nil, "GET", "/compliance/metrics/live", nil)
					if err == nil {
						var m map[string]interface{}
						if err := json.Unmarshal(metrics, &m); err == nil {
							wsHub.Broadcast(map[string]interface{}{
								"type":    "compliance_metrics",
								"payload": m,
							})
						}
					}
				}
			}
		}
	}()

	// Start server shutdown monitor
	go func() {
		<-ctx.Done()
		_ = srv.Shutdown(context.Background())
	}()

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Fatal().Err(err).Msg("Failed to start server")
	}
}
