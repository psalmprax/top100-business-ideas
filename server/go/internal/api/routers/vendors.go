package routers

import (
	"github.com/gin-gonic/gin"
)

// VendorHandler defines the interface for vendor handlers
type VendorHandler interface {
	ListVendors(c *gin.Context)
	AddVendor(c *gin.Context)
	DeleteVendor(c *gin.Context)
	AuditVendor(c *gin.Context)
	GetRiskReport(c *gin.Context)
}

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
