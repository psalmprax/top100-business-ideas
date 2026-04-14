package routers

import (
	"github.com/gin-gonic/gin"
)

// IntelligenceHandler defines the interface for intelligence handlers
type IntelligenceHandler interface {
	HermesSuggestFix(c *gin.Context)
	HermesValidateStrategy(c *gin.Context)
}

// SetupAdditionalRoutes sets up additional routes not in main modules
func SetupAdditionalRoutes(protected *gin.RouterGroup, intelligenceHandler IntelligenceHandler) {
	// Intelligence / Hermes routes
	protected.POST("/hermes/suggest-fix", intelligenceHandler.HermesSuggestFix)
	protected.POST("/hermes/validate-strategy", intelligenceHandler.HermesValidateStrategy)
}

// SetupAllRoutes is a wrapper that sets up all routes including additional ones
func SetupAllRoutes(router *gin.Engine, handlers *HandlerContainer, middleware *MiddlewareContainer, intelligenceHandler IntelligenceHandler) {
	SetupRoutes(router, handlers, middleware)

	// Get the protected group again for additional routes
	v1 := router.Group("/api/v1")
	protected := v1.Group("")
	protected.Use(middleware.Auth)
	{
		SetupAdditionalRoutes(protected, intelligenceHandler)
	}
}
