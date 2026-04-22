package routers

import (
	"github.com/gin-gonic/gin"
)

// SetupComplianceRoutes sets up compliance routes
func SetupComplianceRoutes(
	protected *gin.RouterGroup,
	complianceHandler ComplianceHandler,
	agentOpsHandler ProxyHandler,
	productAccessMiddleware func(string) gin.HandlerFunc,
) {
	compliance := protected.Group("/compliance")
	compliance.Use(productAccessMiddleware("compliance"))
	{
		compliance.GET("/stats", complianceHandler.GetStats)
		compliance.GET("", complianceHandler.ListChecks)
		compliance.GET("/:id", complianceHandler.GetCheck)
		compliance.POST("/check", complianceHandler.RunCheck)
		compliance.GET("/categories", complianceHandler.GetCategories)

		// Extended AI Model Compliance & Orchestration
		compliance.PATCH("/models/:id/guardrails", agentOpsHandler.ProxyToPython)
		compliance.POST("/documentation/:id", complianceHandler.GenerateDocumentation)
		compliance.GET("/incidents", agentOpsHandler.ProxyToPython)
		compliance.POST("/incidents", agentOpsHandler.ProxyToPython)
		compliance.POST("/incidents/article-71", agentOpsHandler.ProxyToPython)
		compliance.PATCH("/incidents/:id", complianceHandler.UpdateIncidentStatus)
		compliance.POST("/upload", complianceHandler.UploadArtifact)
		compliance.GET("/artifacts", complianceHandler.ListArtifacts)
		compliance.GET("/roi", complianceHandler.GetROIMetrics)
		compliance.GET("/velocity", complianceHandler.GetVelocityTrends)
		compliance.GET("/deadlines", complianceHandler.GetDeadlines)
		compliance.GET("/enterprise/audits", complianceHandler.GetEnterpriseAudits)
		compliance.GET("/models/:id/breakdown", complianceHandler.GetModelBreakdown)
		compliance.GET("/models/:id/audits", complianceHandler.GetModelAudits)
		compliance.GET("/models/:id/handshakes", complianceHandler.GetModelHandshakes)
		compliance.GET("/regional-reports", complianceHandler.GetRegionalReports)
		compliance.GET("/financial-metrics", complianceHandler.GetFinancialMetrics)
		compliance.GET("/audit", complianceHandler.ListAuditLogs)
		compliance.GET("/checklists", complianceHandler.ListChecklists)
		compliance.POST("/checklists/:id", complianceHandler.UpdateChecklistItem)
		compliance.GET("/checks", complianceHandler.ListChecks)
		compliance.GET("/checks/:id", complianceHandler.GetCheck)
		compliance.POST("/checks/run", complianceHandler.RunCheck)
		compliance.GET("/models", complianceHandler.ListModels)
		compliance.POST("/models", complianceHandler.RegisterModel)
		compliance.GET("/bias-reports/:id", complianceHandler.GetBiasReports)
		compliance.GET("/bias/reports", complianceHandler.GetBiasReports)
		compliance.POST("/bias/scan", complianceHandler.TriggerBiasScan)
		compliance.POST("/red-team", complianceHandler.RedTeamAudit)
		compliance.GET("/reports/export", complianceHandler.ExportReport)
		compliance.GET("/live-metrics", agentOpsHandler.ProxyToPython)
		compliance.POST("/remediate", agentOpsHandler.ProxyToPython)
		compliance.POST("/audit/sox", agentOpsHandler.ProxyToPython)
		compliance.POST("/audit/hipaa", agentOpsHandler.ProxyToPython)
		compliance.POST("/eu-register", complianceHandler.EURegister)
		compliance.POST("/sso/update", complianceHandler.UpdateSSOConfig)
		compliance.POST("/proxy/verify", complianceHandler.VerifyProxy)
		compliance.GET("/connections", complianceHandler.ListConnections)
		compliance.POST("/connect", complianceHandler.ConnectSystem)
		compliance.POST("/scan", complianceHandler.RunGeneralScan)
		compliance.GET("/scans/:id", complianceHandler.ListScans)

		// Vendors under compliance as expected by frontend
		compliance.DELETE("/vendors/:id", complianceHandler.DeleteVendor)
	}
}
