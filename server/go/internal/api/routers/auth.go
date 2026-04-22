package routers

import (
	"github.com/gin-gonic/gin"
)



// SetupAuthRoutes sets up authentication and user routes
func SetupAuthRoutes(v1 *gin.RouterGroup, authHandler AuthHandler, userHandler UserHandler, authMiddleware gin.HandlerFunc) {
	// Public auth routes
	auth := v1.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/register", authHandler.Register)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/password-reset", authHandler.RequestPasswordReset)
		auth.POST("/password-reset/confirm", authHandler.ResetPassword)
	}

	// Protected user routes
	protected := v1.Group("")
	protected.Use(authMiddleware)
	{
		protected.GET("/auth/me", authHandler.Me)
		protected.POST("/auth/logout", authHandler.Logout)
		protected.PUT("/user", userHandler.UpdateProfile)
		protected.PUT("/user/password", userHandler.UpdatePassword)
		protected.GET("/user/api-keys", userHandler.ListAPIKeys)
		protected.POST("/user/api-keys", userHandler.CreateAPIKey)
		protected.DELETE("/user/api-keys/:id", userHandler.DeleteAPIKey)
	}
}
