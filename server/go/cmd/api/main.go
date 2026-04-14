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

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logger.Info().Msg("No .env file found, using environment variables")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize Database
	dbConfig := database.LoadConfig()
	if err := database.Connect(dbConfig); err != nil {
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

	// Initialize Services
	authService := services.NewAuthService(cfg.JWTSecret, userRepo)
	proxyService := services.NewProxyService(cfg.PythonBackendURL)
	wsHub := services.NewWebSocketHub()

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
	mlHandler := handlers.NewMLHandler(cfg.PythonBackendURL)

	// New handlers for gap closure
	webhookHandler := handlers.NewWebhookHandler(proxyService)
	alertHandler := handlers.NewAlertHandler(proxyService)
	multiCloudHandler := handlers.NewMultiCloudHandler(proxyService)
	selfHealingHandler := handlers.NewSelfHealingHandler(proxyService)
	trainingHandler := handlers.NewTrainingHandler(proxyService)
	enterpriseHandler := handlers.NewEnterpriseHandler(proxyService)
	denialDefenseRepo := repository.NewDenialDefenseRepository()
	denialDefenseHandler := handlers.NewDenialDefenseHandler(denialDefenseRepo)
	userHandler := handlers.NewUserHandler(userRepo, authService)
	panicHandler := handlers.NewPanicHandler(cfg.AdminSecret)

	// New domain-specific handlers for production-grade routing
	governanceHandler := handlers.NewGovernanceHandler(proxyService)
	intelligenceHandler := handlers.NewIntelligenceHandler(proxyService)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Global middleware
	router.Use(middleware.Logger(&logger))
	router.Use(middleware.Recovery())
	router.Use(middleware.CORS())
	router.Use(middleware.SystemLock())
	router.Use(middleware.RateLimitMiddleware(100))

	// Health check (no auth required)
	router.GET("/health", healthHandler.Health)

	// ML endpoints (proxy to Python backend)
	router.POST("/ml/infer", mlHandler.ProxyML)
	router.GET("/ml/models", mlHandler.ProxyML)
	router.POST("/ml/agent-ops/classify", mlHandler.ProxyML)
	router.POST("/ml/ai-compliance/check", mlHandler.ProxyML)
	router.POST("/ml/deepfake/detect", mlHandler.ProxyML)

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
		TrainingHandler:      trainingHandler,
		GovernanceHandler:    governanceHandler,
	}

	middlewareContainer := &routers.MiddlewareContainer{
		Auth:          middleware.Auth(authService),
		ProductAccess: middleware.ProductAccess,
		RequireRole:   middleware.RequireRole,
	}

	routers.SetupAllRoutes(router, handlerContainer, middlewareContainer, intelligenceHandler)

	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Setup signal handling for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigCh
		logger.Info().Msg("Shutting down server...")
		cancel()
		_ = srv.Shutdown(context.Background())
	}()

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
					metrics, err := proxyService.Forward("GET", "/compliance/metrics/live", nil)
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

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Fatal().Err(err).Msg("Failed to start server")
	}
}
