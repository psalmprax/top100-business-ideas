package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"

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
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize logger
	logger := zerolog.New(os.Stdout).
		Level(zerolog.InfoLevel).
		With().
		Timestamp().
		Caller().
		Logger()

	// Load configuration
	cfg := config.Load()

	// Initialize Database
	dbConfig := database.LoadConfig()
	if err := database.Connect(dbConfig); err != nil {
		logger.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer database.Close()

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
	complianceHandler := handlers.NewComplianceHandler(proxyService)
	deepfakeHandler := handlers.NewDeepfakeHandler(proxyService)
	wsHandler := handlers.NewWebSocketHandler(wsHub)
	rulesHandler := handlers.NewRulesHandler(proxyService)
	metricsHandler := handlers.NewMetricsHandler()
	billingHandler := handlers.NewBillingHandler()
	mlHandler := handlers.NewMLHandler(cfg.PythonBackendURL)

	// New handlers for gap closure
	webhookHandler := handlers.NewWebhookHandler(proxyService)
	alertHandler := handlers.NewAlertHandler(proxyService)
	multiCloudHandler := handlers.NewMultiCloudHandler(proxyService)
	selfHealingHandler := handlers.NewSelfHealingHandler(proxyService)
	trainingHandler := handlers.NewTrainingHandler()
	shadowAIHandler := handlers.NewShadowAIHandler()
	wearableHandler := handlers.NewWearableHandler()
	cryptoHandler := handlers.NewCryptoHandler()
	travelKioskHandler := handlers.NewTravelKioskHandler()
	edgeHandler := handlers.NewEdgeHandler()
	vendorHandler := handlers.NewVendorHandler()
	workforceHandler := handlers.NewWorkforceHandler(proxyService)
	enterpriseHandler := handlers.NewEnterpriseHandler(proxyService)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Global middleware
	router.Use(middleware.Logger(&logger))
	router.Use(middleware.Recovery())
	router.Use(middleware.CORS())

	// Health check (no auth required)
	router.GET("/health", healthHandler.Health)

	// ML endpoints (proxy to Python backend)
	router.POST("/ml/infer", mlHandler.ProxyML)
	router.GET("/ml/models", mlHandler.ProxyML)
	router.POST("/ml/agent-ops/classify", mlHandler.ProxyML)
	router.POST("/ml/ai-compliance/check", mlHandler.ProxyML)
	router.POST("/ml/deepfake/detect", mlHandler.ProxyML)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes (no auth required)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// Demo routes - public for demo purposes (no auth)
		// These return mock data for demonstration
		demo := v1.Group("/demo")
		{
			demo.GET("/agents", agentOpsHandler.ListAgents)
			demo.POST("/agents", agentOpsHandler.CreateAgent)
			demo.GET("/rules", rulesHandler.ListRules)
			demo.GET("/metrics/current", metricsHandler.GetCurrentMetrics)
		}

		// SSO (AI Compliance UC1) - Moved outside protected to allow Demo Mode access
		sso := v1.Group("/sso")
		{
			sso.GET("/config/:id", agentOpsHandler.ProxyToPython)
			sso.POST("/config/:id", agentOpsHandler.ProxyToPython)
			sso.GET("/config/:id/liveness-link", agentOpsHandler.ProxyToPython)
			sso.POST("/handshake", agentOpsHandler.ProxyToPython)
			sso.POST("/connect/:provider", agentOpsHandler.ProxyToPython)
			sso.GET("/providers/:id", agentOpsHandler.ProxyToPython)
			sso.GET("/callback/:provider", agentOpsHandler.ProxyToPython)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.Auth(authService))
		{
			// User routes
			protected.GET("/auth/me", authHandler.Me)
			protected.POST("/auth/logout", authHandler.Logout)

			// Agent Operations
			agents := protected.Group("/agents")
			agents.Use(middleware.ProductAccess("agent-ops"))
			{
				agents.GET("", agentOpsHandler.ListAgents)
				agents.GET("/:id", agentOpsHandler.GetAgent)
				agents.POST("", agentOpsHandler.CreateAgent)
				agents.PUT("/:id", agentOpsHandler.UpdateAgent)
				agents.DELETE("/:id", agentOpsHandler.DeleteAgent)
				agents.GET("/:id/logs", agentOpsHandler.GetAgentLogs)
				agents.GET("/:id/forecast", agentOpsHandler.GetForecast)
				agents.POST("/:id/stop", agentOpsHandler.StopAgent)
				agents.POST("/:id/restart", agentOpsHandler.RestartAgent)
			}

			// Agent Metrics
			metrics := protected.Group("/metrics")
			metrics.Use(middleware.ProductAccess("agent-ops"))
			{
				metrics.GET("/agents", agentOpsHandler.GetAgentMetrics)
				metrics.GET("/agents/:id/history", agentOpsHandler.GetAgentHistory)
			}

			// Compliance (AI Act)
			compliance := protected.Group("/compliance")
			compliance.Use(middleware.ProductAccess("compliance"))
			{
				compliance.GET("", complianceHandler.ListChecks)
				compliance.GET("/:id", complianceHandler.GetCheck)
				compliance.POST("/check", complianceHandler.RunCheck)
				compliance.GET("/categories", complianceHandler.GetCategories)
				compliance.GET("/reports/export", complianceHandler.ExportReport)

				// Extended AI Model Compliance
				compliance.GET("/models", complianceHandler.ListModels)
				compliance.POST("/models", complianceHandler.RegisterModel)
				compliance.PATCH("/models/:id/guardrails", complianceHandler.UpdateGuardrails)
				compliance.GET("/bias-reports/:id", complianceHandler.GetBiasReports)
				compliance.POST("/bias-scan", complianceHandler.TriggerBiasScan)
			}

			// Deepfake Defense
			deepfake := protected.Group("/deepfake")
			deepfake.Use(middleware.ProductAccess("deepfake"))
			{
				deepfake.POST("/analyze", deepfakeHandler.Analyze)
				deepfake.GET("/analyses", deepfakeHandler.ListAnalyses)
				deepfake.GET("/analyses/:id", deepfakeHandler.GetAnalysis)
				deepfake.GET("/stats", deepfakeHandler.GetStats)
				deepfake.POST("/challenge", deepfakeHandler.CreateChallenge)
				deepfake.POST("/verify", deepfakeHandler.VerifyAuthSignature)
				deepfake.POST("/analyze/enterprise", deepfakeHandler.AnalyzeEnterprise)
				deepfake.GET("/detectors", deepfakeHandler.ListDetectors)
			}

			// Enterprise
			enterprise := protected.Group("/enterprise")
			{
				enterprise.GET("/partner-config", enterpriseHandler.GetPartnerConfig)
				enterprise.POST("/sla-tier", enterpriseHandler.UpdateSlaTier)
			}

			// WebSocket for real-time updates
			protected.GET("/ws", wsHandler.HandleWebSocket)

			// Rules
			rules := protected.Group("/rules")
			rules.Use(middleware.ProductAccess("agent-ops"))
			{
				rules.GET("", rulesHandler.ListRules)
				rules.POST("", rulesHandler.CreateRule)
				rules.PUT("/:id", rulesHandler.UpdateRule)
				rules.DELETE("/:id", rulesHandler.DeleteRule)
				rules.POST("/:id/toggle", rulesHandler.ToggleRule)
			}

			// Metrics
			metricsGroup := protected.Group("/metrics")
			metricsGroup.Use(middleware.ProductAccess("agent-ops"))
			{
				metricsGroup.GET("/current", metricsHandler.GetCurrentMetrics)
				metricsGroup.GET("/history", metricsHandler.GetMetricsHistory)
				metricsGroup.GET("/agent/:id", metricsHandler.GetAgentMetrics)
			}

			// Billing
			billing := protected.Group("/billing")
			billing.Use(middleware.ProductAccess("billing"))
			{
				billing.GET("/subscription", billingHandler.GetSubscription)
				billing.GET("/invoices", billingHandler.GetInvoices)
				billing.POST("/checkout", billingHandler.CreateCheckout)
				billing.POST("/cancel", billingHandler.CancelSubscription)
				billing.PUT("/payment-method", billingHandler.UpdatePaymentMethod)
			}

			// Webhooks (Agent Ops UC12)
			webhooks := protected.Group("/webhooks")
			webhooks.Use(middleware.ProductAccess("agent-ops"))
			{
				webhooks.GET("", webhookHandler.ListWebhooks)
				webhooks.GET("/:id", webhookHandler.GetWebhook)
				webhooks.POST("", webhookHandler.CreateWebhook)
				webhooks.PUT("/:id", webhookHandler.UpdateWebhook)
				webhooks.DELETE("/:id", webhookHandler.DeleteWebhook)
				webhooks.POST("/:id/test", webhookHandler.TestWebhook)
				webhooks.GET("/:id/executions", webhookHandler.GetWebhookExecutions)
			}

			// Alerts (Agent Ops UC4)
			alerts := protected.Group("/alerts")
			alerts.Use(middleware.ProductAccess("agent-ops"))
			{
				alerts.GET("", alertHandler.ListAlerts)
				alerts.POST("", alertHandler.CreateAlert)
				alerts.PUT("/:id", alertHandler.UpdateAlert)
				alerts.DELETE("/:id", alertHandler.DeleteAlert)
			}

			// Consolidated Agent Operations (Frontend Alignment)
			agentOps := protected.Group("/agent-ops")
			agentOps.Use(middleware.ProductAccess("agent-ops"))
			{
				agentOps.GET("/audit", agentOpsHandler.GetAuditLogs)
				agentOps.GET("/models/config", agentOpsHandler.ListLLMConfigs)
				agentOps.GET("/rules/budget", rulesHandler.ListRules)
				agentOps.GET("/webhooks", webhookHandler.ListWebhooks)
				agentOps.GET("/cloud/health", agentOpsHandler.ProxyToPython)
				agentOps.POST("/cloud/failover", agentOpsHandler.ProxyToPython)
				agentOps.POST("/compliance/hipaa", agentOpsHandler.ProxyToPython)
				agentOps.POST("/compliance/sox", agentOpsHandler.ProxyToPython)
				agentOps.POST("/gateway/gql", agentOpsHandler.ProxyToPython)
			}

			// Multi-Cloud (Agent Ops UC16)
			multiCloud := protected.Group("/multi-cloud")
			multiCloud.Use(middleware.ProductAccess("agent-ops"))
			{
				multiCloud.GET("/status", multiCloudHandler.GetStatus)
				multiCloud.POST("/failover", multiCloudHandler.InitiateFailover)
			}

			// Self-Healing (Agent Ops UC17)
			selfHealing := protected.Group("/self-healing")
			selfHealing.Use(middleware.ProductAccess("agent-ops"))
			{
				selfHealing.GET("/status", selfHealingHandler.GetHealingStatus)
				selfHealing.GET("/events", selfHealingHandler.GetEvents)
				selfHealing.POST("/recover", selfHealingHandler.TriggerRecovery)
			}

			// Training (AI Compliance UC10)
			training := protected.Group("/training")
			training.Use(middleware.ProductAccess("compliance"))
			{
				training.GET("/modules", trainingHandler.ListModules)
				training.GET("/modules/:id", trainingHandler.GetModule)
				training.POST("/modules", trainingHandler.CreateModule)
				training.POST("/progress", trainingHandler.UpdateProgress)
				training.GET("/progress/:userId", trainingHandler.GetUserProgress)
				training.GET("/stats", trainingHandler.GetTrainingStats)
			}

			// Shadow AI (AI Compliance UC15)
			shadowAI := protected.Group("/shadow-ai")
			shadowAI.Use(middleware.ProductAccess("compliance"))
			{
				shadowAI.GET("/detections", shadowAIHandler.ListDetections)
				shadowAI.PUT("/detections/:id/remediate", shadowAIHandler.RemediateDetection)
				shadowAI.GET("/stats", shadowAIHandler.GetShadowAIStats)
			}

			// Edge AI (AI Compliance UC14)
			edge := protected.Group("/edge")
			edge.Use(middleware.ProductAccess("compliance"))
			{
				edge.GET("/deployments", edgeHandler.ListDeployments)
				edge.POST("/deployments/:id/sync", edgeHandler.SyncWeights)
			}

			// Vendors (AI Compliance UC7)
			vendors := protected.Group("/vendors")
			vendors.Use(middleware.ProductAccess("compliance"))
			{
				vendors.GET("", vendorHandler.ListVendors)
				vendors.POST("", vendorHandler.AddVendor)
			}

			// Wearables (Deepfake UC14)
			wearable := protected.Group("/wearable")
			wearable.Use(middleware.ProductAccess("deepfake"))
			{
				wearable.GET("/devices", wearableHandler.ListDevices)
				wearable.POST("/devices", wearableHandler.RegisterDevice)
				wearable.POST("/devices/:id/pair", wearableHandler.PairDevice)
			}

			// Mobile SDK (Deepfake UC10)
			mobileSDK := protected.Group("/mobile-sdk")
			mobileSDK.Use(middleware.ProductAccess("deepfake"))
			{
				mobileSDK.GET("/stats", agentOpsHandler.ProxyToPython)
			}




			// Crypto (Deepfake UC12)
			crypto := protected.Group("/crypto")
			crypto.Use(middleware.ProductAccess("deepfake"))
			{
				crypto.GET("/wallets", cryptoHandler.ListWallets)
				crypto.POST("/wallets", cryptoHandler.ProtectWallet)
				crypto.POST("/wallets/:id/verify", cryptoHandler.VerifyTransaction)
			}

			// Travel (Deepfake UC16)
			travel := protected.Group("/travel")
			travel.Use(middleware.ProductAccess("deepfake"))
			{
				travel.GET("/kiosks", travelKioskHandler.ListKiosks)
				travel.POST("/kiosks/:id/verify", travelKioskHandler.VerifyTraveler)
				travel.GET("/stats", agentOpsHandler.ProxyToPython)
			}

			// Workforce & Sovereign (Digital Workforce Gap)
			workforce := protected.Group("/workforce")
			workforce.Use(middleware.ProductAccess("workforce"))
			{
				workforce.GET("/status", workforceHandler.GetStatus)
				workforce.POST("/sovereign/request", workforceHandler.RequestApproval)
				workforce.POST("/sovereign/callback", workforceHandler.HandleCallback)
			}
			// On-Premise (Agent Ops UC18)
			onPrem := protected.Group("/on-prem")
			onPrem.Use(middleware.ProductAccess("agent-ops"))
			{
				onPrem.POST("/manifest", agentOpsHandler.ProxyToPython)
			}
		}
	}


	// Start WebSocket hub in background
	go wsHub.Run()

	// Start server
	logger.Info().
		Str("host", cfg.Host).
		Int("port", cfg.Port).
		Str("environment", cfg.Environment).
		Msg("Starting API Gateway")

	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Fatal().Err(err).Msg("Failed to start server")
	}
}
