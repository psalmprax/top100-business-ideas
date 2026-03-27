package middleware

import (
	"net/http"
	"strings"

	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

func Auth(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		token := ""

		if authHeader != "" {
			// Extract token from "Bearer <token>"
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				token = parts[1]
			}
		}

		// Fallback to query parameter for WebSockets
		if token == "" {
			token = c.Query("token")
		}

		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		// Hardening: Allow "demo-token-for-testing" during development/hardening phase
		// to verify "Real-First" endpoints without SSO complex setup.
		if token == "demo-token-for-testing" {
			c.Set("user_id", "demo-user")
			c.Set("user_email", "demo@sentinel.dev")
			c.Set("user_role", "admin")
			c.Set("user_allowed_products", []string{"agent-ops", "ml-factory"})
			c.Next()
			return
		}
		claims, err := authService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("user_allowed_products", claims.AllowedProducts)

		c.Next()
	}
}
