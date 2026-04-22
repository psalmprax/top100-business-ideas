package routers

import (
	"github.com/gin-gonic/gin"
)

// SetupAgentOpsRoutes sets up agent operations routes
func SetupAgentOpsRoutes(
	protected *gin.RouterGroup,
	agentOpsHandler AgentOpsHandler,
	webhookHandler interface {
		GetWebhook(c *gin.Context)
		CreateWebhook(c *gin.Context)
		UpdateWebhook(c *gin.Context)
		DeleteWebhook(c *gin.Context)
		TestWebhook(c *gin.Context)
		GetWebhookExecutions(c *gin.Context)
		ListWebhooks(c *gin.Context)
	},
	alertHandler interface {
		ListAlerts(c *gin.Context)
		CreateAlert(c *gin.Context)
		UpdateAlert(c *gin.Context)
		DeleteAlert(c *gin.Context)
	},
	multiCloudHandler interface {
		GetStatus(c *gin.Context)
		InitiateFailover(c *gin.Context)
	},
	selfHealingHandler interface {
		GetHealingStatus(c *gin.Context)
		GetEvents(c *gin.Context)
		GetStats(c *gin.Context)
		TriggerRecovery(c *gin.Context)
	},
	shadowAIHandler interface {
		ListDetections(c *gin.Context)
		GetShadowAIStats(c *gin.Context)
		AutoDetect(c *gin.Context)
		ScanLogs(c *gin.Context)
		GetReport(c *gin.Context)
		RemediateDetection(c *gin.Context)
		CreateDetection(c *gin.Context)
		BlockTool(c *gin.Context)
		AllowTool(c *gin.Context)
	},
	trainingHandler interface {
		ListModules(c *gin.Context)
		GetModule(c *gin.Context)
		CreateModule(c *gin.Context)
		UpdateProgress(c *gin.Context)
		GetUserProgress(c *gin.Context)
		GetTrainingStats(c *gin.Context)
		DownloadCertificate(c *gin.Context)
	},
	governanceHandler interface {
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
	},
	productAccessMiddleware func(string) gin.HandlerFunc,
	requireRoleMiddleware func(string) gin.HandlerFunc,
) {
	// Webhooks
	webhooks := protected.Group("/webhooks")
	webhooks.Use(productAccessMiddleware("agent-ops"))
	{
		webhooks.GET("/:id", webhookHandler.GetWebhook)

		// Config actions (Management only)
		webhooks.Use(requireRoleMiddleware("management"))
		{
			webhooks.POST("", webhookHandler.CreateWebhook)
			webhooks.PUT("/:id", webhookHandler.UpdateWebhook)
			webhooks.DELETE("/:id", webhookHandler.DeleteWebhook)
			webhooks.POST("/:id/test", webhookHandler.TestWebhook)
		}
		webhooks.GET("/:id/executions", webhookHandler.GetWebhookExecutions)
	}

	// Alerts (Agent Ops UC4)
	alerts := protected.Group("/alerts")
	alerts.Use(productAccessMiddleware("agent-ops"))
	{
		alerts.GET("", alertHandler.ListAlerts)

		// Management only actions
		alerts.Use(requireRoleMiddleware("management"))
		{
			alerts.POST("", alertHandler.CreateAlert)
			alerts.PUT("/:id", alertHandler.UpdateAlert)
			alerts.DELETE("/:id", alertHandler.DeleteAlert)
		}
	}

	// Consolidated Agent Operations (Frontend Alignment)
	agentOps := protected.Group("/agent-ops")
	agentOps.Use(productAccessMiddleware("agent-ops"))
	{
		agentOps.GET("/audit", agentOpsHandler.GetAuditLogs)
		agentOps.POST("/alerts/:id/ignore", agentOpsHandler.ProxyToPython)
		agentOps.GET("/agents", agentOpsHandler.ProxyToPython)
		agentOps.GET("/architecture/defaults", agentOpsHandler.ProxyToPython)
		agentOps.GET("/models/config", agentOpsHandler.ListLLMConfigs)
		agentOps.GET("/rules/budget", agentOpsHandler.ProxyToPython)
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

		// Sensitive Management Actions
		agentOps.Use(requireRoleMiddleware("management"))
		{
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
			agentOps.POST("/skills/install", agentOpsHandler.ProxyToPython)
		}

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
			governance.GET("/compliance/dashboard", governanceHandler.GetComplianceDashboard)
			governance.GET("/compliance/articles", governanceHandler.GetComplianceArticles)
			governance.POST("/compliance/assess/:id", governanceHandler.AssessCompliance)
			governance.GET("/sla/dashboard", governanceHandler.GetSLADashboard)
			governance.GET("/sla/metrics", governanceHandler.GetSLAMetrics)
			governance.GET("/partners", governanceHandler.GetPartners)
			governance.POST("/partners/:id/sync", governanceHandler.SyncPartner)
			governance.GET("/forecast/usage", governanceHandler.GetUsageForecast)
			governance.GET("/analytics/roi", governanceHandler.GetROIAnalytics)
			governance.GET("/localization/configs", governanceHandler.GetLocalizationConfigs)
			governance.GET("/healing/configs", governanceHandler.GetHealingConfigs)
			governance.GET("/insights/strategic", governanceHandler.GetStrategicInsights)
			governance.GET("/settings", governanceHandler.GetSettings)
			governance.PUT("/settings/:id", governanceHandler.UpdateSetting)
			governance.GET("/on-prem/deployments", governanceHandler.GetOnPremDeployments)
			governance.POST("/on-prem/deploy/:id", governanceHandler.DeployOnPrem)
		}
	}

	// Multi-Cloud (Agent Ops UC16)
	multiCloud := protected.Group("/multi-cloud")
	multiCloud.Use(productAccessMiddleware("agent-ops"))
	{
		multiCloud.GET("/status", multiCloudHandler.GetStatus)
		multiCloud.POST("/failover", multiCloudHandler.InitiateFailover)
	}

	// Training (AI Compliance UC10)
	training := protected.Group("/training")
	training.Use(productAccessMiddleware("compliance"))
	{
		training.GET("/modules", trainingHandler.ListModules)
		training.GET("/modules/:id", trainingHandler.GetModule)

		training.Use(requireRoleMiddleware("management"))
		{
			training.POST("/modules", trainingHandler.CreateModule)
		}

		training.POST("/progress", trainingHandler.UpdateProgress)
		training.GET("/progress/:userId", trainingHandler.GetUserProgress)
		training.GET("/stats", trainingHandler.GetTrainingStats)
		training.GET("/modules/:id/certificate", trainingHandler.DownloadCertificate)
	}

	// Shadow AI detection endpoints
	shadowAI := protected.Group("/shadow-ai")
	shadowAI.Use(productAccessMiddleware("compliance"))
	{
		shadowAI.GET("/detections", shadowAIHandler.ListDetections)
		shadowAI.GET("/stats", shadowAIHandler.GetShadowAIStats)
		shadowAI.POST("/detect", shadowAIHandler.AutoDetect)
		shadowAI.POST("/scan-logs", shadowAIHandler.ScanLogs)
		shadowAI.GET("/report", shadowAIHandler.GetReport)

		shadowAI.Use(requireRoleMiddleware("management"))
		{
			shadowAI.POST("/detections", shadowAIHandler.CreateDetection)
			shadowAI.POST("/block/:id", shadowAIHandler.BlockTool)
			shadowAI.POST("/allow/:id", shadowAIHandler.AllowTool)
			shadowAI.PUT("/detections/:id/remediate", shadowAIHandler.RemediateDetection)
		}
	}
}
