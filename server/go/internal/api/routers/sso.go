package routers

import (
	"github.com/gin-gonic/gin"
)

// ProxyHandler defines the interface for proxy handlers
type ProxyHandler interface {
	ProxyToPython(c *gin.Context)
}

// SetupSSORoutes sets up SSO and identity routes
func SetupSSORoutes(v1 *gin.RouterGroup, agentOpsHandler ProxyHandler, authMiddleware gin.HandlerFunc) {
	// Public SSO routes
	ssoPublic := v1.Group("/sso")
	{
		ssoPublic.POST("/connect/:provider", agentOpsHandler.ProxyToPython)
		ssoPublic.GET("/callback/:provider", agentOpsHandler.ProxyToPython)
	}

	// Protected SSO configuration
	protected := v1.Group("")
	protected.Use(authMiddleware)
	{
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
	}
}
