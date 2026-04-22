package routers

import (
	"github.com/gin-gonic/gin"
)

// ComplianceHandler defines the interface for compliance handlers
type ComplianceHandler interface {
	GetStats(c *gin.Context)
	ListChecks(c *gin.Context)
	GetCheck(c *gin.Context)
	RunCheck(c *gin.Context)
	GetCategories(c *gin.Context)
	GenerateDocumentation(c *gin.Context)
	ListAuditLogs(c *gin.Context)
	UpdateIncidentStatus(c *gin.Context)
	UploadArtifact(c *gin.Context)
	ListArtifacts(c *gin.Context)
	GetROIMetrics(c *gin.Context)
	GetVelocityTrends(c *gin.Context)
	GetDeadlines(c *gin.Context)
	GetEnterpriseAudits(c *gin.Context)
	GetModelBreakdown(c *gin.Context)
	GetModelAudits(c *gin.Context)
	GetModelHandshakes(c *gin.Context)
	GetRegionalReports(c *gin.Context)
	GetFinancialMetrics(c *gin.Context)
	ListChecklists(c *gin.Context)
	UpdateChecklistItem(c *gin.Context)
	ListModels(c *gin.Context)
	RegisterModel(c *gin.Context)
	GetBiasReports(c *gin.Context)
	TriggerBiasScan(c *gin.Context)
	RedTeamAudit(c *gin.Context)
	ExportReport(c *gin.Context)
}

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
	}
}
