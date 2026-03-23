package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
)

// ProductAccess middleware restricts access to specific products
func ProductAccess(productName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Admin bypass
		role, exists := c.Get("user_role")
		if exists && role == "admin" {
			c.Next()
			return
		}

		// Check allowed products
		allowedProductsRaw, exists := c.Get("user_allowed_products")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, models.ErrorResponse{
				Error: "Access denied",
				Details: "No product access information found",
			})
			return
		}

		allowedProducts, ok := allowedProductsRaw.([]string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, models.ErrorResponse{
				Error: "Internal server error",
				Details: "Invalid product access format",
			})
			return
		}

		// Check if the user has access to all products (*) or the specific product
		hasAccess := false
		for _, p := range allowedProducts {
			if p == "*" || p == productName {
				hasAccess = true
				break
			}
		}

		if !hasAccess {
			c.AbortWithStatusJSON(http.StatusForbidden, models.ErrorResponse{
				Error: "Access denied",
				Details: "You do not have access to this product: " + productName,
			})
			return
		}

		c.Next()
	}
}
