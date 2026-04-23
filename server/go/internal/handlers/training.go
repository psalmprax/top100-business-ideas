package handlers

import (
	"fmt"
	"net/http"

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
	response, err := h.proxyService.Forward(c, "GET", "/training/modules", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch training modules", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// GetModule returns a single training module
func (h *TrainingHandler) GetModule(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "GET", fmt.Sprintf("/training/modules/%s", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch training module", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// CreateModule creates a new training module
// POST /api/v1/training/modules
func (h *TrainingHandler) CreateModule(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	response, err := h.proxyService.Forward(c, "POST", "/training/modules", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create training module", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", response)
}

// UpdateProgress updates user training progress
// POST /api/v1/training/progress
func (h *TrainingHandler) UpdateProgress(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	response, err := h.proxyService.Forward(c, "POST", "/training/progress", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update progress", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// GetUserProgress returns user's training progress
// GET /api/v1/training/progress/:userId
func (h *TrainingHandler) GetUserProgress(c *gin.Context) {
	userID := c.Param("userId")
	response, err := h.proxyService.Forward(c, "GET", fmt.Sprintf("/training/progress/%s", userID), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch progress", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// GetTrainingStats returns training statistics
func (h *TrainingHandler) GetTrainingStats(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/training/stats", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch training stats", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *TrainingHandler) DownloadCertificate(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "GET", fmt.Sprintf("/training/modules/%s/certificate", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate certificate", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/pdf", response)
}


