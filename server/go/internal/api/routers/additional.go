package routers

import (
	"github.com/gin-gonic/gin"
)

// SetupAdditionalRoutes sets up additional routes not in main modules
func SetupAdditionalRoutes(protected *gin.RouterGroup, intelligenceHandler IntelligenceHandler) {
	// Intelligence / Hermes routes
	protected.POST("/hermes/suggest-fix", intelligenceHandler.HermesSuggestFix)
	protected.POST("/hermes/validate-strategy", intelligenceHandler.HermesValidateStrategy)
}
