package routers

import (
	"github.com/gin-gonic/gin"
)



// SetupWorkforceRoutes sets up digital workforce management routes
func SetupWorkforceRoutes(
	protected *gin.RouterGroup,
	workforceHandler WorkforceHandler,
	productAccessMiddleware func(string) gin.HandlerFunc,
	requireRoleMiddleware func(string) gin.HandlerFunc,
) {
	workforce := protected.Group("/workforce")
	workforce.Use(productAccessMiddleware("workforce"))
	{
		workforce.GET("/status", workforceHandler.GetStatus)
		workforce.GET("/decisions", workforceHandler.ListDecisions)
		workforce.GET("/traces", workforceHandler.ListTraces)
		workforce.GET("/skills", workforceHandler.GetSkills)
		workforce.GET("/jobs", workforceHandler.GetJobs)
		workforce.GET("/acquisitions", workforceHandler.GetAcquisitions)
		workforce.GET("/content", workforceHandler.GetContentDrafts)
		workforce.GET("/invoices", workforceHandler.GetInvoices)
		workforce.GET("/deploy/check", workforceHandler.DeployCheck)

		// Sovereign & Governance
		sovereign := workforce.Group("/sovereign")
		{
			sovereign.POST("/request", workforceHandler.RequestApproval)
			sovereign.POST("/callback", workforceHandler.HandleCallback)
		}

		// Revenue Recovery (CashClaw)
		workforce.POST("/cashclaw/recover", workforceHandler.RecoverRevenue)

		// Marketing & Campaigns
		workforce.POST("/campaigns/run", workforceHandler.RunCampaign)
		workforce.GET("/leads/source", workforceHandler.SourceLeads)
		workforce.POST("/insights/analyze", workforceHandler.AnalyzeInsights)

		// Outreach & Prospecting
		workforce.POST("/autosearch/run", workforceHandler.RunAutosearch)
		workforce.GET("/outreach/drafts", workforceHandler.GetOutreachDrafts)
		workforce.POST("/outreach/:id/approve", workforceHandler.ApproveOutreach)

		// Inbound & Feedback
		workforce.POST("/inbound/handle", workforceHandler.HandleInbound)
		workforce.POST("/feedback", workforceHandler.ProvideFeedback)

		// Administrative Actions
		workforce.Use(requireRoleMiddleware("management"))
		{
			workforce.POST("/autonomy/toggle", workforceHandler.ToggleAutonomy)
			workforce.POST("/referral/activate", workforceHandler.ActivateReferral)
			workforce.GET("/referral/stats", workforceHandler.GetReferralStats)
		}
	}
}
