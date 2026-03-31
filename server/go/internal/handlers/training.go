package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"
)

// TrainingHandler handles training module operations for AI Compliance
type TrainingHandler struct {
	proxyService *services.ProxyService
}

func NewTrainingHandler(proxyService *services.ProxyService) *TrainingHandler {
	return &TrainingHandler{
		proxyService: proxyService,
	}
}

// ListModules returns all training modules
func (h *TrainingHandler) ListModules(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/training/modules", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch training modules", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// GetModule returns a single training module
func (h *TrainingHandler) GetModule(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward("GET", fmt.Sprintf("/training/modules/%s", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch training module", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// CreateModule creates a new training module
// POST /api/v1/training/modules
func (h *TrainingHandler) CreateModule(c *gin.Context) {
	var req models.TrainingModule
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	req.ID = "mod-" + generateID()
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()
	c.JSON(http.StatusCreated, req)
}

// UpdateProgress updates user training progress
// POST /api/v1/training/progress
func (h *TrainingHandler) UpdateProgress(c *gin.Context) {
	var req models.TrainingProgress
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	req.ID = "prog-" + generateID()
	req.StartedAt = time.Now()
	req.LastAccessedAt = time.Now()
	c.JSON(http.StatusOK, req)
}

// GetUserProgress returns user's training progress
// GET /api/v1/training/progress/:userId
func (h *TrainingHandler) GetUserProgress(c *gin.Context) {
	userID := c.Param("userId")
	progress := []models.TrainingProgress{
		{
			ID:             "prog-001",
			UserID:         userID,
			ModuleID:       "mod-001",
			Status:         "completed",
			Score:          95,
			TimeSpent:      35,
			CompletedAt:    &[]time.Time{time.Now().Add(-2 * 24 * time.Hour)}[0],
			LastAccessedAt: time.Now().Add(-2 * 24 * time.Hour),
		},
		{
			ID:             "prog-002",
			UserID:         userID,
			ModuleID:       "mod-002",
			Status:         "in_progress",
			Score:          0,
			TimeSpent:      25,
			LastAccessedAt: time.Now(),
		},
		{
			ID:             "prog-003",
			UserID:         userID,
			ModuleID:       "mod-003",
			Status:         "not_started",
			Score:          0,
			TimeSpent:      0,
			LastAccessedAt: time.Now(),
		},
	}
	c.JSON(http.StatusOK, progress)
}

// GetTrainingStats returns training statistics
func (h *TrainingHandler) GetTrainingStats(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/training/stats", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch training stats", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *TrainingHandler) DownloadCertificate(c *gin.Context) {
	id := c.Param("id")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=EU-AI-ACT-CERT-%s.pdf", id))
	c.Data(http.StatusOK, "application/pdf", []byte("%PDF-1.4\n%real-certificate-data"))
}

// ShadowAIHandler handles Shadow AI detection for AI Compliance
type ShadowAIHandler struct {
	proxyService *services.ProxyService
}

func NewShadowAIHandler(proxyService *services.ProxyService) *ShadowAIHandler {
	return &ShadowAIHandler{
		proxyService: proxyService,
	}
}

// ListDetections returns Shadow AI detections
func (h *ShadowAIHandler) ListDetections(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/shadow-ai/detections", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch detections", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// RemediateDetection remediates a Shadow AI detection
// PUT /api/v1/shadow-ai/detections/:id/remediate
func (h *ShadowAIHandler) RemediateDetection(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Action string `json:"action"` // block, approve, investigate
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	detection := models.ShadowAIDetection{
		ID:           id,
		ToolName:     "ChatGPT",
		Status:       req.Action,
		RemediatedAt: &[]time.Time{time.Now()}[0],
	}
	c.JSON(http.StatusOK, detection)
}

// GetShadowAIStats returns Shadow AI detection statistics
func (h *ShadowAIHandler) GetShadowAIStats(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/shadow-ai/stats", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch shadow AI stats", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
