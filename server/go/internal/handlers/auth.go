package handlers

import (
	"net/http"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	// Authenticate user
	user, err := h.authService.Authenticate(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication Failed",
			Details: err.Error(),
		})
		return
	}

	// Validation Logic for product access
	if user.Role != "admin" {
		if req.ProductID != "" {
			// Check if user has access to this specific product
			hasAccess := false
			for _, p := range user.AllowedProducts {
				if p == req.ProductID || p == "*" {
					hasAccess = true
					break
				}
			}

			if !hasAccess {
				c.JSON(http.StatusForbidden, models.ErrorResponse{
					Error:   "Access Denied",
					Details: "You do not have an active subscription for " + req.ProductID,
				})
				return
			}
		} else {
			// No ProductID provided, check if selection is needed
			if len(user.AllowedProducts) > 1 {
				c.JSON(http.StatusOK, models.AuthResponse{
					RequiresProductSelection: true,
					AvailableProducts:        user.AllowedProducts,
					User:                     user,
				})
				return
			}
			// If only one product, use it as default
			if len(user.AllowedProducts) == 1 {
				req.ProductID = user.AllowedProducts[0]
			}
		}
	}

	// Generate tokens
	accessToken, err := h.authService.GenerateToken(user.ID, user.Email, user.Role, user.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	refreshToken, err := h.authService.GenerateToken(user.ID, user.Email, user.Role, user.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    86400,
		User:         user,
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	// Create user in database
	user, err := h.authService.Register(c.Request.Context(), req.Email, req.Password, req.Name)
	if err != nil {
		c.JSON(http.StatusConflict, models.ErrorResponse{
			Error:   "Registration Failed",
			Details: err.Error(),
		})
		return
	}

	accessToken, err := h.authService.GenerateToken(user.ID, user.Email, user.Role, user.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	refreshToken, err := h.authService.GenerateToken(user.ID, user.Email, user.Role, user.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    86400,
		User:         user,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	// TODO: Implement refresh token logic
	c.JSON(http.StatusOK, gin.H{
		"message": "Token refresh not implemented yet",
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	// Get user from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not found"})
		return
	}

	// Look up user in database
	user, err := h.authService.GetUserByID(c.Request.Context(), userID.(string))
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}


func (h *AuthHandler) Logout(c *gin.Context) {
	// TODO: Invalidate token in Redis
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}
