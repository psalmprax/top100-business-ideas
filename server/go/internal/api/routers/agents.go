package routers

import (
	"github.com/gin-gonic/gin"
)



// SetupAgentRoutes sets up agent operations routes
func SetupAgentRoutes(
	protected *gin.RouterGroup,
	agentOpsHandler AgentOpsHandler,
	productAccessMiddleware func(string) gin.HandlerFunc,
	requireRoleMiddleware func(string) gin.HandlerFunc,
) {
	// Agent Operations
	agents := protected.Group("/agents")
	agents.Use(productAccessMiddleware("agent-ops"))
	{
		agents.GET("", agentOpsHandler.ListAgents)
		agents.GET("/:id/logs", agentOpsHandler.GetAgentLogs)
		agents.GET("/:id/forecast", agentOpsHandler.GetForecast)

		// Management only actions
		agents.Use(requireRoleMiddleware("management"))
		{
			agents.POST("", agentOpsHandler.CreateAgent)
			agents.PUT("/:id", agentOpsHandler.UpdateAgent)
			agents.DELETE("/:id", agentOpsHandler.DeleteAgent)
			agents.POST("/:id/stop", agentOpsHandler.StopAgent)
			agents.POST("/:id/restart", agentOpsHandler.RestartAgent)
			agents.POST("/:id/clone", agentOpsHandler.CloneConfig)
			agents.POST("/:id/optimize", agentOpsHandler.OptimizeMemory)
		}
		agents.POST("/:id/hint", agentOpsHandler.ProxyToPython)
	}

	// Agent Metrics
	metrics := protected.Group("/metrics")
	metrics.Use(productAccessMiddleware("agent-ops"))
	{
		metrics.GET("/agents", agentOpsHandler.GetAgentMetrics)
		metrics.GET("/agents/:id/history", agentOpsHandler.GetAgentHistory)
	}
}
