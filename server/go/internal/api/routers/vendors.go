package routers

import (
	"github.com/gin-gonic/gin"
)

// SetupVendorRoutes sets up vendor compliance routes
func SetupVendorRoutes(
	protected *gin.RouterGroup,
	vendorHandler VendorHandler,
	productAccessMiddleware func(string) gin.HandlerFunc,
) {
	vendors := protected.Group("/vendors")
	vendors.Use(productAccessMiddleware("compliance"))
	{
		vendors.GET("", vendorHandler.ListVendors)
		vendors.POST("", vendorHandler.AddVendor)
		vendors.DELETE("/:id", vendorHandler.DeleteVendor)
		vendors.POST("/:id/audit", vendorHandler.AuditVendor)
		vendors.GET("/report", vendorHandler.GetRiskReport)
	}
}
