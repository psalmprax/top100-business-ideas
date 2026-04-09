package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

var IS_SYSTEM_LOCKED = false

func SystemLock() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		
		// Allow health, auth, and reset routes
		if IS_SYSTEM_LOCKED && 
		   !strings.Contains(path, "/api/v1/auth") && 
		   !strings.Contains(path, "/health") && 
		   !strings.Contains(path, "/api/v1/panic/reset") {
			
			c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{
				"error":   "System Lock Active",
				"message": "The AlphaAI infrastructure is currently under defensive lockdown. All agentic operations are suspended.",
			})
			return
		}
		
		c.Next()
	}
}

func SetLock(locked bool) {
	IS_SYSTEM_LOCKED = locked
}
