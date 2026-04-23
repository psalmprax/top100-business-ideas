package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"
)

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
	response, err := h.proxyService.Forward(c, "GET", "/shadow-ai/detections", nil)
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
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	response, err := h.proxyService.Forward(c, "PUT", fmt.Sprintf("/shadow-ai/detections/%s/remediate", id), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to remediate detection", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// GetShadowAIStats returns Shadow AI detection statistics
func (h *ShadowAIHandler) GetShadowAIStats(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/shadow-ai/stats", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch shadow AI stats", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// AutoDetect performs Shadow AI detection on a URL
// POST /api/v1/shadow-ai/detect
func (h *ShadowAIHandler) AutoDetect(c *gin.Context) {
	url := c.Query("url")
	sourceIP := c.Query("source_ip")
	userEmail := c.Query("user_email")

	body := map[string]interface{}{
		"url":        url,
		"source_ip":  sourceIP,
		"user_email": userEmail,
	}

	response, err := h.proxyService.Forward(c, "POST", "/shadow-ai/detect", body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to auto-detect", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// ScanLogs scans logs for Shadow AI usage
// POST /api/v1/shadow-ai/scan-logs
func (h *ShadowAIHandler) ScanLogs(c *gin.Context) {
	var req struct {
		Logs []string `json:"logs"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body", Details: err.Error()})
		return
	}

	response, err := h.proxyService.Forward(c, "POST", "/shadow-ai/scan-logs", req.Logs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to scan logs", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// GetReport returns comprehensive Shadow AI detection report
// GET /api/v1/shadow-ai/report
func (h *ShadowAIHandler) GetReport(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/shadow-ai/report", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate report", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// CreateDetection manually adds a Shadow AI detection
// POST /api/v1/shadow-ai/detections
func (h *ShadowAIHandler) CreateDetection(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body", Details: err.Error()})
		return
	}
	response, err := h.proxyService.Forward(c, "POST", "/shadow-ai/detections", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create detection", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", response)
}

// BlockTool blocks a Shadow AI tool
// POST /api/v1/shadow-ai/block/:id
func (h *ShadowAIHandler) BlockTool(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "POST", fmt.Sprintf("/shadow-ai/block/%s", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to block tool", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// AllowTool allows/approves a Shadow AI tool
// POST /api/v1/shadow-ai/allow/:id
func (h *ShadowAIHandler) AllowTool(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "POST", fmt.Sprintf("/shadow-ai/allow/%s", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to allow tool", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
