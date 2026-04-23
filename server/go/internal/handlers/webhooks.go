package handlers

import (
	"crypto/rand"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"
)

// WebhookHandler handles webhook CRUD operations for Agent Ops
type WebhookHandler struct {
	proxy *services.ProxyService
}

func NewWebhookHandler(proxy *services.ProxyService) *WebhookHandler {
	return &WebhookHandler{proxy: proxy}
}

// ListWebhooks returns all webhooks
// GET /api/v1/webhooks
func (h *WebhookHandler) ListWebhooks(c *gin.Context) {
	resp, err := h.proxy.Forward(c, "GET", "/webhooks", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch webhooks", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// GetWebhook returns a single webhook by ID
// GET /api/v1/webhooks/:id
func (h *WebhookHandler) GetWebhook(c *gin.Context) {
	id := c.Param("id")
	resp, err := h.proxy.Forward(c, "GET", "/webhooks/"+id, nil)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Webhook not found", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// CreateWebhook creates a new webhook
// POST /api/v1/webhooks
func (h *WebhookHandler) CreateWebhook(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	resp, err := h.proxy.Forward(c, "POST", "/webhooks", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create webhook", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", resp)
}

// UpdateWebhook updates an existing webhook
// PUT /api/v1/webhooks/:id
func (h *WebhookHandler) UpdateWebhook(c *gin.Context) {
	id := c.Param("id")
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	resp, err := h.proxy.Forward(c, "PUT", "/webhooks/"+id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update webhook", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// DeleteWebhook deletes a webhook
// DELETE /api/v1/webhooks/:id
func (h *WebhookHandler) DeleteWebhook(c *gin.Context) {
	id := c.Param("id")
	_, err := h.proxy.Forward(c, "DELETE", "/webhooks/"+id, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete webhook", Details: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Webhook deleted successfully"})
}

// TestWebhook sends a test event to the webhook
// POST /api/v1/webhooks/:id/test
func (h *WebhookHandler) TestWebhook(c *gin.Context) {
	id := c.Param("id")
	resp, err := h.proxy.Forward(c, "POST", "/webhooks/"+id+"/test", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to test webhook", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// GetWebhookExecutions returns webhook execution history
// GET /api/v1/webhooks/:id/executions
func (h *WebhookHandler) GetWebhookExecutions(c *gin.Context) {
	id := c.Param("id")
	resp, err := h.proxy.Forward(c, "GET", "/webhooks/"+id+"/executions", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch executions", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// AlertHandler handles alert configuration
type AlertHandler struct {
	proxy *services.ProxyService
}

func NewAlertHandler(proxy *services.ProxyService) *AlertHandler {
	return &AlertHandler{proxy: proxy}
}

// ListAlerts returns all alert configurations
// GET /api/v1/alerts
func (h *AlertHandler) ListAlerts(c *gin.Context) {
	resp, err := h.proxy.Forward(c, "GET", "/alerts", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch alerts", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// CreateAlert creates a new alert configuration
// POST /api/v1/alerts
func (h *AlertHandler) CreateAlert(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	resp, err := h.proxy.Forward(c, "POST", "/alerts", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create alert", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", resp)
}

// UpdateAlert updates an alert configuration
// PUT /api/v1/alerts/:id
func (h *AlertHandler) UpdateAlert(c *gin.Context) {
	id := c.Param("id")
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	resp, err := h.proxy.Forward(c, "PUT", "/alerts/"+id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update alert", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// DeleteAlert deletes an alert
// DELETE /api/v1/alerts/:id
func (h *AlertHandler) DeleteAlert(c *gin.Context) {
	id := c.Param("id")
	_, err := h.proxy.Forward(c, "DELETE", "/alerts/"+id, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete alert", Details: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Alert deleted successfully"})
}

// MultiCloudHandler handles multi-cloud operations
type MultiCloudHandler struct {
	proxy *services.ProxyService
}

func NewMultiCloudHandler(proxy *services.ProxyService) *MultiCloudHandler {
	return &MultiCloudHandler{proxy: proxy}
}

// GetStatus returns multi-cloud provider status
// GET /api/v1/multi-cloud/status
func (h *MultiCloudHandler) GetStatus(c *gin.Context) {
	resp, err := h.proxy.Forward(c, "GET", "/multi-cloud/status", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch cloud status", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// InitiateFailover switches to a backup provider
// POST /api/v1/multi-cloud/failover
func (h *MultiCloudHandler) InitiateFailover(c *gin.Context) {
	var req struct {
		TargetProvider string `json:"target_provider"`
		Reason         string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	resp, err := h.proxy.Forward(c, "POST", "/multi-cloud/failover", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to initiate failover", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}



// generateID generates a cryptographically random hex ID
func generateID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		panic(fmt.Sprintf("failed to generate random ID: %v", err))
	}
	return fmt.Sprintf("%x", b)
}
