package routers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/middleware"
)

// HandlerContainer holds all handler implementations
type HandlerContainer struct {
	PanicHandler         PanicHandler
	AuthHandler          AuthHandler
	UserHandler          UserHandler
	AgentOpsHandler      AgentOpsHandler
	ComplianceHandler    ComplianceHandler
	DeepfakeHandler      DeepfakeHandler
	DenialDefenseHandler DenialDefenseHandler
	EnterpriseHandler    EnterpriseHandler
	RulesHandler         RulesHandler
	MetricsHandler       MetricsHandler
	BillingHandler       BillingHandler
	WSHandler            WSHandler
	IntelligenceHandler  IntelligenceHandler
	WebhookHandler       interface {
		GetWebhook(c *gin.Context)
		CreateWebhook(c *gin.Context)
		UpdateWebhook(c *gin.Context)
		DeleteWebhook(c *gin.Context)
		TestWebhook(c *gin.Context)
		GetWebhookExecutions(c *gin.Context)
		ListWebhooks(c *gin.Context)
	}
	AlertHandler interface {
		ListAlerts(c *gin.Context)
		CreateAlert(c *gin.Context)
		UpdateAlert(c *gin.Context)
		DeleteAlert(c *gin.Context)
	}
	MultiCloudHandler interface {
		GetStatus(c *gin.Context)
		InitiateFailover(c *gin.Context)
	}
	SelfHealingHandler interface {
		GetHealingStatus(c *gin.Context)
		GetEvents(c *gin.Context)
		GetStats(c *gin.Context)
		TriggerRecovery(c *gin.Context)
	}
	ShadowAIHandler interface {
		ListDetections(c *gin.Context)
		GetShadowAIStats(c *gin.Context)
		AutoDetect(c *gin.Context)
		ScanLogs(c *gin.Context)
		GetReport(c *gin.Context)
		RemediateDetection(c *gin.Context)
	}
	TrainingHandler interface {
		ListModules(c *gin.Context)
		GetModule(c *gin.Context)
		CreateModule(c *gin.Context)
		UpdateProgress(c *gin.Context)
		GetUserProgress(c *gin.Context)
		GetTrainingStats(c *gin.Context)
		DownloadCertificate(c *gin.Context)
	}
	GovernanceHandler interface {
		GetComplianceDashboard(c *gin.Context)
		GetComplianceArticles(c *gin.Context)
		AssessCompliance(c *gin.Context)
		GetSLADashboard(c *gin.Context)
		GetSLAMetrics(c *gin.Context)
		GetPartners(c *gin.Context)
		SyncPartner(c *gin.Context)
		GetUsageForecast(c *gin.Context)
		GetROIAnalytics(c *gin.Context)
		GetLocalizationConfigs(c *gin.Context)
		GetHealingConfigs(c *gin.Context)
		GetStrategicInsights(c *gin.Context)
		GetSettings(c *gin.Context)
		UpdateSetting(c *gin.Context)
		GetOnPremDeployments(c *gin.Context)
		DeployOnPrem(c *gin.Context)
	}
	MLHandler interface {
		ProxyML(c *gin.Context)
		Infer(c *gin.Context)
		ListModels(c *gin.Context)
		ClassifyAgentOperation(c *gin.Context)
		CheckCompliance(c *gin.Context)
		DetectDeepfake(c *gin.Context)
	}
	WorkforceHandler     WorkforceHandler
	VendorHandler        VendorHandler
}

// IntelligenceHandler interface
type IntelligenceHandler interface {
	// Generic Intelligence
	GetStrategicInsights(c *gin.Context)
	GetMarketTrends(c *gin.Context)
	GetRiskAssessment(c *gin.Context)
	GetOptimizationRules(c *gin.Context)
	// Hermes Specific
	HermesSuggestFix(c *gin.Context)
	HermesValidateStrategy(c *gin.Context)
}

// MiddlewareContainer holds all middleware functions
type MiddlewareContainer struct {
	Auth          gin.HandlerFunc
	ProductAccess func(string) gin.HandlerFunc
	RequireRole   func(string) gin.HandlerFunc
}

// SetupAllRoutes configures all API routes
func SetupAllRoutes(router *gin.Engine, handlers *HandlerContainer, mw *MiddlewareContainer) {
	// API v1 group
	v1 := router.Group("/api/v1")

	// Panic routes (Administrative)
	SetupPanicRoutes(v1, handlers.PanicHandler)

	// Public auth routes
	SetupAuthRoutes(v1, handlers.AuthHandler, handlers.UserHandler, mw.Auth)

	// SSO routes
	SetupSSORoutes(v1, handlers.AgentOpsHandler, mw.Auth)

	// All protected routes
	protected := v1.Group("")
	protected.Use(mw.Auth)

	// Apply Circuit Breaker for proxy intensive routes
	proxyCB := middleware.GinCircuitBreakerMiddleware("python-backend", middleware.CircuitBreakerConfig{
		FailureThreshold: 5,
		SuccessThreshold: 2,
		Timeout:          30 * time.Second,
		RequestTimeout:   10 * time.Second,
	})

	{
		// Agent routes (Proxy heavy)
		agentGroup := protected.Group("")
		agentGroup.Use(proxyCB)
		SetupAgentRoutes(agentGroup, handlers.AgentOpsHandler, middleware.ProductAccess, middleware.RequireRole)

		// Agent Ops routes (Proxy heavy)
		opsGroup := protected.Group("")
		opsGroup.Use(proxyCB)
		SetupAgentOpsRoutes(
			opsGroup,
			handlers.AgentOpsHandler,
			handlers.WebhookHandler,
			handlers.AlertHandler,
			handlers.MultiCloudHandler,
			handlers.SelfHealingHandler,
			handlers.ShadowAIHandler,
			handlers.TrainingHandler,
			handlers.GovernanceHandler,
			middleware.ProductAccess,
			middleware.RequireRole,
		)

		// Compliance routes (Proxy heavy)
		complianceGroup := protected.Group("")
		complianceGroup.Use(proxyCB)
		SetupComplianceRoutes(complianceGroup, handlers.ComplianceHandler, handlers.AgentOpsHandler, middleware.ProductAccess)

		// Deepfake routes (Proxy heavy)
		deepfakeGroup := protected.Group("")
		deepfakeGroup.Use(proxyCB)
		SetupDeepfakeRoutes(deepfakeGroup, handlers.DeepfakeHandler, handlers.AgentOpsHandler, middleware.ProductAccess)

		// Metrics routes (Proxy heavy)
		metricsGroup := protected.Group("")
		metricsGroup.Use(proxyCB)
		SetupMetricsRoutes(metricsGroup, handlers.MetricsHandler, middleware.ProductAccess)

		// Other routes (Less proxy intensive or async)
		SetupDenialDefenseRoutes(protected, handlers.DenialDefenseHandler)
		SetupEnterpriseRoutes(protected, handlers.EnterpriseHandler)
		SetupRulesRoutes(protected, handlers.RulesHandler, middleware.ProductAccess)
		SetupBillingRoutes(protected, handlers.BillingHandler, middleware.ProductAccess, middleware.RequireRole)
		SetupWSRoutes(protected, handlers.WSHandler)
		SetupAdditionalRoutes(protected, handlers.IntelligenceHandler)
		SetupWorkforceRoutes(protected, handlers.WorkforceHandler, middleware.ProductAccess, middleware.RequireRole)
		SetupVendorRoutes(protected, handlers.VendorHandler, middleware.ProductAccess)

		// ML routes (Proxied to Python)
		mlGroup := v1.Group("/ml")
		mlGroup.Use(proxyCB)
		{
			mlGroup.POST("/infer", handlers.MLHandler.ProxyML)
			mlGroup.GET("/models", handlers.MLHandler.ListModels)
			mlGroup.POST("/agent-ops/classify", handlers.MLHandler.ClassifyAgentOperation)
			mlGroup.POST("/ai-compliance/check", handlers.MLHandler.CheckCompliance)
			mlGroup.POST("/deepfake/detect", handlers.MLHandler.DetectDeepfake)
		}
	}
}
