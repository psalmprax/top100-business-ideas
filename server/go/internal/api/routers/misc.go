package routers

import (
	"github.com/gin-gonic/gin"
)



// SetupPanicRoutes sets up administrative panic routes
func SetupPanicRoutes(v1 *gin.RouterGroup, panicHandler PanicHandler) {
	panicGroup := v1.Group("/panic")
	{
		panicGroup.POST("/lock", panicHandler.Lock)
		panicGroup.POST("/reset", panicHandler.Reset)
	}
}

// SetupDeepfakeRoutes sets up deepfake defense routes
func SetupDeepfakeRoutes(
	protected *gin.RouterGroup,
	deepfakeHandler DeepfakeHandler,
	agentOpsHandler ProxyHandler,
	productAccessMiddleware func(string) gin.HandlerFunc,
) {
	deepfake := protected.Group("/deepfake")
	deepfake.Use(productAccessMiddleware("deepfake"))
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
		deepfake.GET("/biometrics", agentOpsHandler.ProxyToPython)
		deepfake.POST("/biometrics", agentOpsHandler.ProxyToPython)
		deepfake.DELETE("/biometrics/:id/revoke", agentOpsHandler.ProxyToPython)
	}
}

// SetupDenialDefenseRoutes sets up denial defense routes
func SetupDenialDefenseRoutes(protected *gin.RouterGroup, denialDefenseHandler DenialDefenseHandler) {
	denialDefense := protected.Group("/denial-defense")
	{
		denialDefense.GET("/claims", denialDefenseHandler.ListClaims)
		denialDefense.GET("/stats", denialDefenseHandler.GetStats)
		denialDefense.POST("/claims", denialDefenseHandler.CreateClaim)
		denialDefense.PUT("/claims", denialDefenseHandler.UpdateClaim)
	}
}

// SetupEnterpriseRoutes sets up enterprise routes
func SetupEnterpriseRoutes(protected *gin.RouterGroup, enterpriseHandler EnterpriseHandler) {
	enterprise := protected.Group("/enterprise")
	{
		enterprise.GET("/partner-config", enterpriseHandler.GetPartnerConfig)
		enterprise.POST("/sla-tier", enterpriseHandler.UpdateSlaTier)
	}
}

// SetupRulesRoutes sets up rules routes
func SetupRulesRoutes(
	protected *gin.RouterGroup,
	rulesHandler RulesHandler,
	productAccessMiddleware func(string) gin.HandlerFunc,
) {
	rules := protected.Group("/rules")
	rules.Use(productAccessMiddleware("agent-ops"))
	{
		rules.GET("", rulesHandler.ListRules)
		rules.POST("", rulesHandler.CreateRule)
		rules.PUT("/:id", rulesHandler.UpdateRule)
		rules.DELETE("/:id", rulesHandler.DeleteRule)
		rules.POST("/:id/toggle", rulesHandler.ToggleRule)
	}
}

// SetupMetricsRoutes sets up metrics routes
func SetupMetricsRoutes(
	protected *gin.RouterGroup,
	metricsHandler MetricsHandler,
	productAccessMiddleware func(string) gin.HandlerFunc,
) {
	metricsGroup := protected.Group("/metrics")
	metricsGroup.Use(productAccessMiddleware("agent-ops"))
	{
		metricsGroup.GET("/current", metricsHandler.GetCurrentMetrics)
		metricsGroup.GET("/history", metricsHandler.GetMetricsHistory)
		metricsGroup.GET("/agent/:id", metricsHandler.GetAgentMetrics)
	}
}

// SetupBillingRoutes sets up billing routes
func SetupBillingRoutes(
	protected *gin.RouterGroup,
	billingHandler BillingHandler,
	productAccessMiddleware func(string) gin.HandlerFunc,
	requireRoleMiddleware func(string) gin.HandlerFunc,
) {
	billing := protected.Group("/billing")
	billing.Use(productAccessMiddleware("billing"))
	{
		billing.GET("/subscription", billingHandler.GetSubscription)
		billing.GET("/invoices", billingHandler.GetInvoices)

		// Financial actions (Management only)
		billing.Use(requireRoleMiddleware("management"))
		{
			billing.POST("/checkout", billingHandler.CreateCheckout)
			billing.POST("/cancel", billingHandler.CancelSubscription)
			billing.PUT("/payment-method", billingHandler.UpdatePaymentMethod)
		}
	}
}

// SetupWSRoutes sets up websocket routes
func SetupWSRoutes(protected *gin.RouterGroup, wsHandler WSHandler) {
	protected.GET("/ws", wsHandler.HandleWebSocket)
}
