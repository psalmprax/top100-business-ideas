package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole restricts access to users with a specific role
func RequireRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Role information missing"})
			c.Abort()
			return
		}

		if role.(string) != requiredRole && role.(string) != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Access denied: Insufficient privileges",
				"message": "Only management users can perform this action",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// ProductAccess restricts access to users with access to a specific product
func ProductAccess(requiredProduct string) gin.HandlerFunc {
	return func(c *gin.Context) {
		allowedProducts, exists := c.Get("user_allowed_products")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Subscription information missing"})
			c.Abort()
			return
		}

		// Admin bypass for product access
		role, _ := c.Get("user_role")
		if role.(string) == "admin" {
			c.Next()
			return
		}

		// Simple slice check
		products := allowedProducts.([]string)
		found := false
		for _, p := range products {
			if p == requiredProduct || p == "*" {
				found = true
				break
			}
		}

		if !found {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Access denied: Product not in subscription",
				"message": "Please upgrade your plan to access this module",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
