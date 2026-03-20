package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"
)

// WorkforceHandler handles digital workforce and Sovereign operations
type WorkforceHandler struct {
	proxy *services.ProxyService
}

func NewWorkforceHandler(proxy *services.ProxyService) *WorkforceHandler {
	return &WorkforceHandler{proxy: proxy}
}

// GetStatus returns the current status of the digital workforce
// GET /api/v1/workforce/status
func (h *WorkforceHandler) GetStatus(c *gin.Context) {
	resp, err := h.proxy.Forward("GET", "/workforce/status", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch workforce status", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// RequestApproval initiates a Sovereign approval request
// POST /api/v1/workforce/sovereign/request
func (h *WorkforceHandler) RequestApproval(c *gin.Context) {
	var req models.SovereignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	// Proxy to Python SovereignService
	resp, err := h.proxy.Forward("POST", "/workforce/sovereign/request", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create sovereign request", Details: err.Error()})
		return
	}

	var result models.SovereignRequest
	if err := json.Unmarshal(resp, &result); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse backend response"})
		return
	}

	c.JSON(http.StatusCreated, result)
}

// HandleCallback receives approval/denial from external systems (Slack)
// POST /api/v1/workforce/sovereign/callback
func (h *WorkforceHandler) HandleCallback(c *gin.Context) {
	var req struct {
		RequestID string `json:"request_id"`
		Approved  bool   `json:"approved"`
		Reviewer  string `json:"reviewer"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	// Forward to Python
	resp, err := h.proxy.Forward("POST", "/workforce/sovereign/callback", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to process sovereign callback", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}
