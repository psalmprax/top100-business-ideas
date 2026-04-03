package main

import (
	"context"
	"encoding/json"
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
	workforceRepo := repository.NewWorkforceRepository()

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
	shadowAIHandler := handlers.NewShadowAIHandler(proxyService)
	wearableHandler := handlers.NewWearableHandler(proxyService)
	cryptoHandler := handlers.NewCryptoHandler(proxyService)
	travelKioskHandler := handlers.NewTravelKioskHandler(proxyService)
	edgeHandler := handlers.NewEdgeHandler(proxyService)
	vendorHandler := handlers.NewVendorHandler(proxyService)
	workforceHandler := handlers.NewWorkforceHandler(proxyService, workforceRepo)
	enterpriseHandler := handlers.NewEnterpriseHandler(proxyService)
	denialDefenseRepo := repository.NewDenialDefenseRepository()
	denialDefenseHandler := handlers.NewDenialDefenseHandler(denialDefenseRepo)

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

		// Public SSO routes for login
		ssoPublic := v1.Group("/sso")
		{
			ssoPublic.POST("/connect/:provider", agentOpsHandler.ProxyToPython)
			ssoPublic.GET("/callback/:provider", agentOpsHandler.ProxyToPython)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.Auth(authService))
		{
			// User routes
			protected.GET("/auth/me", authHandler.Me)
			protected.POST("/auth/logout", authHandler.Logout)

			// Protected SSO configuration
			ssoProtected := protected.Group("/sso")
			{
				ssoProtected.GET("/config/:id", agentOpsHandler.ProxyToPython)
				ssoProtected.POST("/config/:id", agentOpsHandler.ProxyToPython)
				ssoProtected.GET("/config/:id/liveness-link", agentOpsHandler.ProxyToPython)
				ssoProtected.POST("/handshake", agentOpsHandler.ProxyToPython)
				ssoProtected.GET("/providers/:id", func(c *gin.Context) {
					id := c.Param("id")
					c.Request.URL.Path = "/api/v1/sso/config/" + id
					agentOpsHandler.ProxyToPython(c)
				})
			}

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
				agents.POST("/:id/clone", agentOpsHandler.CloneConfig)
				agents.POST("/:id/optimize", agentOpsHandler.OptimizeMemory)
				agents.POST("/:id/hint", agentOpsHandler.ProxyToPython)
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
				compliance.GET("/stats", complianceHandler.GetStats)
				compliance.GET("", complianceHandler.ListChecks)
				compliance.GET("/:id", complianceHandler.GetCheck)
				compliance.POST("/check", complianceHandler.RunCheck)
				compliance.GET("/categories", complianceHandler.GetCategories)

				// Extended AI Model Compliance & Orchestration
				compliance.PATCH("/models/:id/guardrails", agentOpsHandler.ProxyToPython)
				compliance.POST("/documentation/:id", complianceHandler.GenerateDocumentation)
				compliance.GET("/incidents", complianceHandler.ListAuditLogs)
				compliance.PATCH("/incidents/:id", complianceHandler.UpdateIncidentStatus)
				compliance.POST("/upload", complianceHandler.UploadArtifact)
				compliance.GET("/artifacts", complianceHandler.ListArtifacts)
				compliance.GET("/roi", complianceHandler.GetROIMetrics)
				compliance.GET("/velocity", complianceHandler.GetVelocityTrends)
				compliance.GET("/deadlines", complianceHandler.GetDeadlines)
				compliance.GET("/enterprise-audits", complianceHandler.GetEnterpriseAudits)
				compliance.GET("/models/:id/breakdown", complianceHandler.GetModelBreakdown)
				compliance.GET("/models/:id/audits", complianceHandler.GetModelAudits)
				compliance.GET("/models/:id/handshakes", complianceHandler.GetModelHandshakes)
				compliance.GET("/regional-reports", complianceHandler.GetRegionalReports)
				compliance.GET("/financial-metrics", complianceHandler.GetFinancialMetrics)
				compliance.GET("/audit", complianceHandler.ListAuditLogs)
				compliance.GET("/checks", complianceHandler.ListChecks)
				compliance.GET("/checks/:id", complianceHandler.GetCheck)
				compliance.POST("/checks/run", complianceHandler.RunCheck)
				compliance.GET("/models", complianceHandler.ListModels)
				compliance.POST("/models", complianceHandler.RegisterModel)
				compliance.GET("/bias-reports/:id", complianceHandler.GetBiasReports)
				compliance.GET("/reports/export", complianceHandler.ExportReport)
				compliance.GET("/live-metrics", agentOpsHandler.ProxyToPython)
				compliance.POST("/remediate", agentOpsHandler.ProxyToPython)
			}

			// Deepfake Defense
			deepfake := protected.Group("/deepfake")
			deepfake.Use(middleware.ProductAccess("deepfake"))
			{
				deepfake.POST("/analyze", deepfakeHandler.Analyze)
				deepfake.POST("/upload", deepfakeHandler.Upload)
				deepfake.GET("/analyses", deepfakeHandler.ListAnalyses)
				deepfake.GET("/analyses/:id", deepfakeHandler.GetAnalysis)
				deepfake.GET("/stats", deepfakeHandler.GetStats)
				deepfake.POST("/challenge", deepfakeHandler.CreateChallenge)
				deepfake.POST("/verify", deepfakeHandler.VerifyAuthSignature)
				deepfake.POST("/analyze/enterprise", deepfakeHandler.AnalyzeEnterprise)
				deepfake.GET("/detectors", deepfakeHandler.ListDetectors)
				deepfake.GET("/threats", agentOpsHandler.ProxyToPython)
				deepfake.GET("/duress", deepfakeHandler.GetDuressConfig)
				deepfake.POST("/duress", deepfakeHandler.UpdateDuressConfig)
			}

			// Denial Defense
			denialDefense := protected.Group("/denial-defense")
			{
				denialDefense.GET("/claims", denialDefenseHandler.ListClaims)
				denialDefense.POST("/claims", denialDefenseHandler.CreateClaim)
				denialDefense.PUT("/claims", denialDefenseHandler.UpdateClaim)
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
				agentOps.POST("/alerts/:id/ignore", agentOpsHandler.ProxyToPython)
				agentOps.GET("/agents", agentOpsHandler.ProxyToPython)
				agentOps.GET("/models/config", agentOpsHandler.ListLLMConfigs)
				agentOps.GET("/rules/budget", rulesHandler.ListRules)
				agentOps.GET("/webhooks", webhookHandler.ListWebhooks)
				agentOps.POST("/webhooks", webhookHandler.CreateWebhook)
				agentOps.PUT("/webhooks/:id", webhookHandler.UpdateWebhook)
				agentOps.DELETE("/webhooks/:id", webhookHandler.DeleteWebhook)
				agentOps.GET("/cloud/health", agentOpsHandler.ProxyToPython)
				agentOps.POST("/cloud/failover", agentOpsHandler.ProxyToPython)
				agentOps.POST("/compliance/hipaa", agentOpsHandler.ProxyToPython)
				agentOps.POST("/compliance/sox", agentOpsHandler.ProxyToPython)
				agentOps.POST("/gateway/gql", agentOpsHandler.ProxyToPython)
				agentOps.POST("/deploy/language", agentOpsHandler.ProxyToPython)
				agentOps.POST("/sync-locale", agentOpsHandler.SyncLinguisticPackage)
				agentOps.POST("/self-healing/deploy", agentOpsHandler.ProxyToPython)
				agentOps.GET("/snapshots", agentOpsHandler.ProxyToPython)
				agentOps.POST("/proxy/config", agentOpsHandler.ProxyToPython)
				agentOps.POST("/retention", agentOpsHandler.ProxyToPython)
				agentOps.GET("/metrics/stream", agentOpsHandler.ProxyToPython)
				agentOps.POST("/forensics", agentOpsHandler.RunForensics)
				agentOps.POST("/whitelabel/provision", agentOpsHandler.ProvisionClient)
				agentOps.POST("/bulk/:action", agentOpsHandler.ProxyToPython)
				agentOps.POST("/:id/optimize", agentOpsHandler.ProxyToPython)
				agentOps.POST("/:id/dump", agentOpsHandler.ProxyToPython)
				agentOps.POST("/:id/compress", agentOpsHandler.ProxyToPython)
				agentOps.PATCH("/compliance/alerts/:id/resolve", agentOpsHandler.ProxyToPython)
				agentOps.POST("/compliance/audit/sox", agentOpsHandler.ProxyToPython)
				agentOps.POST("/security/rotate-key", agentOpsHandler.ProxyToPython)
				agentOps.POST("/venture/realize/:id", agentOpsHandler.ProxyToPython)

				// Vigilance (Sentinel Monitoring)
				vigilance := agentOps.Group("/vigilance")
				{
					vigilance.GET("/alerts", agentOpsHandler.ProxyToPython)
					vigilance.POST("/alerts/:id/acknowledge", agentOpsHandler.ProxyToPython)
				}

				// Self-Healing (Agent Ops UC17)
				selfHealing := agentOps.Group("/self-healing")
				{
					selfHealing.GET("/status", selfHealingHandler.GetHealingStatus)
					selfHealing.GET("/events", selfHealingHandler.GetEvents)
					selfHealing.GET("/stats", selfHealingHandler.GetStats)
					selfHealing.GET("/metrics/streaming", agentOpsHandler.ProxyToPython)
					selfHealing.POST("/config", agentOpsHandler.ProxyToPython)
					selfHealing.POST("/recover", selfHealingHandler.TriggerRecovery)
					selfHealing.POST("/hint", agentOpsHandler.ProxyToPython)
				}

				// Venture Intelligence (Market Intelligence)
				venture := agentOps.Group("/venture")
				{
					venture.GET("/insights", agentOpsHandler.ListVentureInsights)
					venture.POST("/scenario/analyze", agentOpsHandler.AnalyzeVentureScenario)
				}

				// Governance & Advanced Analytics (Sentinel)
				governance := agentOps.Group("/governance")
				{
					governance.GET("/compliance/dashboard", agentOpsHandler.ProxyToPython)
					governance.GET("/compliance/articles", agentOpsHandler.ProxyToPython)
					governance.POST("/compliance/assess/:id", agentOpsHandler.ProxyToPython)
					governance.GET("/sla/dashboard", agentOpsHandler.ProxyToPython)
					governance.GET("/sla/metrics", agentOpsHandler.ProxyToPython)
					governance.GET("/partners", agentOpsHandler.ProxyToPython)
					governance.POST("/partners/:id/sync", agentOpsHandler.ProxyToPython)
					governance.GET("/forecast/usage", agentOpsHandler.ProxyToPython)
					governance.GET("/analytics/roi", agentOpsHandler.ProxyToPython)
					governance.GET("/localization/configs", agentOpsHandler.ProxyToPython)
					governance.GET("/healing/configs", agentOpsHandler.ProxyToPython)
					governance.GET("/insights/strategic", agentOpsHandler.ProxyToPython)
					governance.GET("/settings", agentOpsHandler.ProxyToPython)
					governance.PUT("/settings/:id", agentOpsHandler.ProxyToPython)
					governance.GET("/on-prem/deployments", agentOpsHandler.ProxyToPython)
					governance.POST("/on-prem/deploy/:id", agentOpsHandler.ProxyToPython)
				}
			}

			// Multi-Cloud (Agent Ops UC16)
			multiCloud := protected.Group("/multi-cloud")
			multiCloud.Use(middleware.ProductAccess("agent-ops"))
			{
				multiCloud.GET("/status", multiCloudHandler.GetStatus)
				multiCloud.POST("/failover", multiCloudHandler.InitiateFailover)
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
				training.GET("/modules/:id/certificate", trainingHandler.DownloadCertificate)
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
			edgeGroup := protected.Group("/edge")
			edgeGroup.Use(middleware.ProductAccess("compliance"))
			{
				edgeGroup.GET("/deployments", edgeHandler.ListDeployments)
				edgeGroup.GET("/deployments/:id/logs", edgeHandler.GetEdgeLogs)
				edgeGroup.POST("/deployments/:id/sync", edgeHandler.SyncWeights)
			}

			// Vendors (AI Compliance UC7)
			vendors := protected.Group("/vendors")
			vendors.Use(middleware.ProductAccess("compliance"))
			{
				vendors.GET("", vendorHandler.ListVendors)
				vendors.POST("", vendorHandler.AddVendor)
			}

			// Wearables (Deepfake UC14)
			wearable := protected.Group("/wearables")
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
			}

			// Workforce & Sovereign (Digital Workforce Gap)
			workforce := protected.Group("/workforce")
			workforce.Use(middleware.ProductAccess("workforce"))
			{
				workforce.GET("/status", workforceHandler.GetStatus)
				workforce.POST("/sovereign/request", workforceHandler.RequestApproval)
				workforce.POST("/sovereign/callback", workforceHandler.HandleCallback)

				// Real-First Hardening
				workforce.POST("/cashclaw/recover", workforceHandler.RecoverRevenue)
				workforce.POST("/campaigns/run", workforceHandler.RunCampaign)
				workforce.GET("/leads/source", workforceHandler.SourceLeads)
				workforce.POST("/insights/analyze", workforceHandler.AnalyzeInsights)
				workforce.POST("/inbound/handle", workforceHandler.HandleInbound)
				workforce.POST("/feedback", workforceHandler.ProvideFeedback)
				workforce.GET("/skills", workforceHandler.GetSkills)
				workforce.GET("/jobs", workforceHandler.GetJobs)
				workforce.GET("/acquisitions", workforceHandler.GetAcquisitions)
				workforce.GET("/content", workforceHandler.GetContentDrafts)
				workforce.GET("/decisions", workforceHandler.ListDecisions)
				workforce.GET("/traces", workforceHandler.ListTraces)

				// Autosearch & Outreach
				workforce.POST("/autosearch/run", workforceHandler.RunAutosearch)
				workforce.GET("/outreach/drafts", workforceHandler.GetOutreachDrafts)
				workforce.POST("/outreach/:id/approve", workforceHandler.ApproveOutreach)
				workforce.GET("/invoices", workforceHandler.GetInvoices)
			}

			// On-Premise (Agent Ops UC18)
			onPrem := protected.Group("/on-prem")
			onPrem.Use(middleware.ProductAccess("agent-ops"))
			{
				onPrem.POST("/manifest", agentOpsHandler.ProxyToPython)
				onPrem.GET("/manifest", agentOpsHandler.ProxyToPython)
				onPrem.GET("/checklist", agentOpsHandler.ProxyToPython)
				onPrem.GET("/deployments", agentOpsHandler.ProxyToPython)
				onPrem.POST("/deploy/:id", agentOpsHandler.ProxyToPython)
			}
		}
	}


	// Start WebSocket hub in background
	go wsHub.Run()

	// Start Compliance Metrics Broadcast Loop (Real-First bridging)
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			if wsHub.GetClientCount() > 0 {
				metrics, err := proxyService.Forward("GET", "/compliance/live-metrics", nil)
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
	}()

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
