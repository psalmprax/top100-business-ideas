package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/database"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/repository"
	"github.com/top100-business-ideas/api/internal/services"
)

type UserHandler struct {
	userRepo    *repository.UserRepository
	authService *services.AuthService
}

func NewUserHandler(userRepo *repository.UserRepository, authService *services.AuthService) *UserHandler {
	return &UserHandler{
		userRepo:    userRepo,
		authService: authService,
	}
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not found"})
		return
	}

	user, err := h.userRepo.GetByID(c.Request.Context(), userID.(string))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "User not found"})
		return
	}

	var req struct {
		Name string `json:"name"`
		Role string `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	user.UpdatedAt = time.Now()

	if err := h.userRepo.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update profile", Details: err.Error()})
		return
	}

	user.Password = ""
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdatePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not found"})
		return
	}

	var req struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	user, err := h.userRepo.GetByID(c.Request.Context(), userID.(string))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "User not found"})
		return
	}

	if !h.authService.CheckPassword(req.CurrentPassword, user.Password) {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Current password is incorrect"})
		return
	}

	hashedPassword, err := h.authService.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to hash password"})
		return
	}

	user.Password = hashedPassword
	user.UpdatedAt = time.Now()

	if err := h.userRepo.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update password", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func generateAPIKey() (string, string, string) {
	raw := make([]byte, 32)
	rand.Read(raw)
	key := hex.EncodeToString(raw)
	prefix := "alpha_" + key[:8]
	hash := sha256.Sum256([]byte(key))
	hashHex := hex.EncodeToString(hash[:])
	return key, prefix, hashHex
}

func (h *UserHandler) ListAPIKeys(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not found"})
		return
	}

	if database.Pool == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database not available"})
		return
	}

	var keys []struct {
		ID        string     `json:"id"`
		Name      string     `json:"name"`
		Prefix    string     `json:"prefix"`
		CreatedAt time.Time  `json:"created_at"`
		IsActive  bool       `json:"is_active"`
		LastUsed  *time.Time `json:"last_used_at"`
	}

	query := `SELECT id, name, prefix, created_at, is_active, last_used_at 
	          FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`
	rows, err := database.Pool.Query(c.Request.Context(), query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch API keys", Details: err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var k struct {
			ID        string     `json:"id"`
			Name      string     `json:"name"`
			Prefix    string     `json:"prefix"`
			CreatedAt time.Time  `json:"created_at"`
			IsActive  bool       `json:"is_active"`
			LastUsed  *time.Time `json:"last_used_at"`
		}
		if err := rows.Scan(&k.ID, &k.Name, &k.Prefix, &k.CreatedAt, &k.IsActive, &k.LastUsed); err != nil {
			continue
		}
		keys = append(keys, k)
	}

	c.JSON(http.StatusOK, keys)
}

func (h *UserHandler) CreateAPIKey(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not found"})
		return
	}

	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	rawKey, prefix, hashHex := generateAPIKey()

	if database.Pool == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database not available"})
		return
	}

	var keyID string
	var createdAt time.Time
	query := `INSERT INTO api_keys (user_id, name, key_hash, prefix, is_active) 
	          VALUES ($1, $2, $3, $4, true) RETURNING id, created_at`
	err := database.Pool.QueryRow(c.Request.Context(), query, userID, req.Name, hashHex, prefix).Scan(&keyID, &createdAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create API key", Details: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":         keyID,
		"name":       req.Name,
		"key":        rawKey,
		"prefix":     prefix,
		"created_at": createdAt,
		"is_active":  true,
	})
}

func (h *UserHandler) DeleteAPIKey(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not found"})
		return
	}

	keyID := c.Param("id")

	if database.Pool == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Database not available"})
		return
	}

	query := `UPDATE api_keys SET is_active = false WHERE id = $1 AND user_id = $2`
	result, err := database.Pool.Exec(c.Request.Context(), query, keyID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete API key", Details: err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "API key not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "API key revoked successfully"})
}
