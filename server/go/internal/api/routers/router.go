package routers

import (
	"github.com/gin-gonic/gin"
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
}

// MiddlewareContainer holds all middleware functions
type MiddlewareContainer struct {
	Auth          gin.HandlerFunc
	ProductAccess func(string) gin.HandlerFunc
	RequireRole   func(string) gin.HandlerFunc
}

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine, handlers *HandlerContainer, middleware *MiddlewareContainer) {
	// API v1 group
	v1 := router.Group("/api/v1")

	// Panic routes (Administrative)
	SetupPanicRoutes(v1, handlers.PanicHandler)

	// Public auth routes
	SetupAuthRoutes(v1, handlers.AuthHandler, handlers.UserHandler, middleware.Auth)

	// SSO routes
	SetupSSORoutes(v1, handlers.AgentOpsHandler, middleware.Auth)

	// All protected routes
	protected := v1.Group("")
	protected.Use(middleware.Auth)
	{
		// Agent routes
		SetupAgentRoutes(protected, handlers.AgentOpsHandler, middleware.ProductAccess, middleware.RequireRole)

		// Agent Ops routes including webhooks, alerts, multi-cloud, self-healing, training, governance
		SetupAgentOpsRoutes(
			protected,
			handlers.AgentOpsHandler,
			handlers.WebhookHandler,
			handlers.AlertHandler,
			handlers.MultiCloudHandler,
			handlers.SelfHealingHandler,
			handlers.TrainingHandler,
			handlers.GovernanceHandler,
			middleware.ProductAccess,
			middleware.RequireRole,
		)

		// Compliance routes
		SetupComplianceRoutes(protected, handlers.ComplianceHandler, handlers.AgentOpsHandler, middleware.ProductAccess)

		// Deepfake routes
		SetupDeepfakeRoutes(protected, handlers.DeepfakeHandler, handlers.AgentOpsHandler, middleware.ProductAccess)

		// Denial defense routes
		SetupDenialDefenseRoutes(protected, handlers.DenialDefenseHandler)

		// Enterprise routes
		SetupEnterpriseRoutes(protected, handlers.EnterpriseHandler)

		// Rules routes
		SetupRulesRoutes(protected, handlers.RulesHandler, middleware.ProductAccess)

		// Metrics routes
		SetupMetricsRoutes(protected, handlers.MetricsHandler, middleware.ProductAccess)

		// Billing routes
		SetupBillingRoutes(protected, handlers.BillingHandler, middleware.ProductAccess, middleware.RequireRole)

		// WebSocket routes
		SetupWSRoutes(protected, handlers.WSHandler)
	}
}
