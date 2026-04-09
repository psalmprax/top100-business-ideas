package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/top100-business-ideas/api/internal/database"
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

	// Generate tokens - access token and refresh token with different types
	accessToken, err := h.authService.GenerateToken(user.ID, user.Email, user.Role, user.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate access token"})
		return
	}

	refreshToken, err := h.authService.GenerateRefreshToken(user.ID, user.Email, user.Role, user.AllowedProducts)
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
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate access token"})
		return
	}

	refreshToken, err := h.authService.GenerateRefreshToken(user.ID, user.Email, user.Role, user.AllowedProducts)
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
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Refresh token required"})
		return
	}

	// Validate the refresh token and check it's actually a refresh token
	claims, err := h.authService.ValidateToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid or expired refresh token"})
		return
	}

	// Verify this is a refresh token, not an access token
	if claims.TokenType != "refresh" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid token type: expected refresh token"})
		return
	}

	// Revoke the old refresh token (token rotation)
	h.authService.RevokeToken(claims.ID)

	// Generate new access and refresh tokens
	newAccessToken, err := h.authService.GenerateToken(claims.UserID, claims.Email, claims.Role, claims.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to rotate access token"})
		return
	}

	newRefreshToken, err := h.authService.GenerateRefreshToken(claims.UserID, claims.Email, claims.Role, claims.AllowedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to rotate refresh token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    86400,
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
	tokenStr := c.GetHeader("Authorization")
	if tokenStr != "" && len(tokenStr) > 7 {
		tokenStr = tokenStr[7:]
	}

	if tokenStr != "" {
		claims, err := h.authService.ValidateToken(tokenStr)
		if err == nil {
			h.authService.RevokeToken(claims.ID)
		}

		if database.Redis != nil {
			ctx := context.Background()
			key := fmt.Sprintf("blacklist:%s", claims.ID)
			ttl := time.Until(claims.ExpiresAt.Time)
			if ttl > 0 {
				database.Redis.Set(ctx, key, "1", ttl)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Logged out successfully (session invalidated)",
	})
}

func (h *AuthHandler) RequestPasswordReset(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Valid email required"})
		return
	}

	user, err := h.authService.Authenticate(c.Request.Context(), req.Email, "")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "If an account with that email exists, a reset link has been sent.",
		})
		return
	}

	resetToken := generateResetToken()
	expiresAt := time.Now().Add(1 * time.Hour)

	if database.Pool != nil {
		query := `INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)
		          ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, used = false`
		_, _ = database.Pool.Exec(c.Request.Context(), query, user.ID, resetToken, expiresAt)
	}

	resetURL := fmt.Sprintf("%s/reset-password?token=%s&email=%s",
		getFrontendURL(), resetToken, req.Email)

	c.JSON(http.StatusOK, gin.H{
		"message":    "If an account with that email exists, a reset link has been sent.",
		"reset_url":  resetURL,
		"expires_in": "1 hour",
	})
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Email       string `json:"email" binding:"required,email"`
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	if database.Pool == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database not available"})
		return
	}

	var userID string
	var expiresAt time.Time
	var used bool
	query := `SELECT user_id, expires_at, used FROM password_resets WHERE token = $1`
	err := database.Pool.QueryRow(c.Request.Context(), query, req.Token).Scan(&userID, &expiresAt, &used)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid or expired reset token"})
		return
	}
	if used {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Reset token has already been used"})
		return
	}
	if time.Now().After(expiresAt) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Reset token has expired"})
		return
	}

	user, err := h.authService.GetUserByID(c.Request.Context(), userID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "User not found"})
		return
	}

	hashedPassword, err := h.authService.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to process password"})
		return
	}

	user.Password = hashedPassword
	user.UpdatedAt = time.Now()
	if database.Pool != nil {
		_, err = database.Pool.Exec(c.Request.Context(),
			`UPDATE "users" SET password = $1, updated_at = $2 WHERE id = $3`,
			hashedPassword, user.UpdatedAt, user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update password", Details: err.Error()})
			return
		}
	} else {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database not available"})
		return
	}

	_, _ = database.Pool.Exec(c.Request.Context(), `UPDATE password_resets SET used = true WHERE token = $1`, req.Token)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}

func generateResetToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func getFrontendURL() string {
	if url := os.Getenv("FRONTEND_URL"); url != "" {
		return url
	}
	return "http://localhost:5173"
}
