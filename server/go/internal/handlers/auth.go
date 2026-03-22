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

	// TODO: Look up user in database
	// For demo purposes, create a mock user
	mockUser := &models.User{
		ID:              "user-1",
		Email:           req.Email,
		Name:            "Demo User",
		Role:            "admin",
		AllowedProducts: []string{"*"}, // Admin has access to everything
	}

	// Generate tokens
	accessToken, err := h.authService.GenerateToken(mockUser.ID, mockUser.Email, mockUser.Role, mockUser.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	refreshToken, err := h.authService.GenerateToken(mockUser.ID, mockUser.Email, mockUser.Role, mockUser.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    86400,
		User:         mockUser,
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	// TODO: Create user in database
	// For demo purposes, return success
	newUser := &models.User{
		ID:              "user-" + req.Email,
		Email:           req.Email,
		Name:            req.Name,
		Role:            "user",
		AllowedProducts: []string{"agent-ops"}, // New users only get Agent-Ops by default
	}

	accessToken, err := h.authService.GenerateToken(newUser.ID, newUser.Email, newUser.Role, newUser.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	refreshToken, err := h.authService.GenerateToken(newUser.ID, newUser.Email, newUser.Role, newUser.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    86400,
		User:         newUser,
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

	// TODO: Look up user in database
	// For demo purposes, return mock user
	user := &models.User{
		ID:              userID.(string),
		Email:           "demo@alphaai.com",
		Name:            "Demo User",
		Role:            "admin",
		AllowedProducts: []string{"*"},
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// TODO: Invalidate token in Redis
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}
