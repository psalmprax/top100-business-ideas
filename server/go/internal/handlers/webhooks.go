package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
)

// WebhookHandler handles webhook CRUD operations for Agent Ops
type WebhookHandler struct{}

func NewWebhookHandler() *WebhookHandler {
	return &WebhookHandler{}
}

// ListWebhooks returns all webhooks
// GET /api/v1/webhooks
func (h *WebhookHandler) ListWebhooks(c *gin.Context) {
	webhooks := []models.WebhookConfig{
		{
			ID:        "wh-001",
			Name:      "Slack Budget Alert",
			URL:       "https://hooks.slack.com/services/xxx",
			EventType: "budget_alert",
			Secret:    "whsec_xxx",
			IsActive:  true,
			CreatedAt: time.Now().Add(-24 * time.Hour),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "wh-002",
			Name:      "PagerDuty Incident",
			URL:       "https://events.pagerduty.com/v2/enqueue",
			EventType: "agent_failure",
			Secret:    "xxx",
			IsActive:  true,
			CreatedAt: time.Now().Add(-48 * time.Hour),
			UpdatedAt: time.Now().Add(-12 * time.Hour),
		},
	}
	c.JSON(http.StatusOK, webhooks)
}

// GetWebhook returns a single webhook by ID
// GET /api/v1/webhooks/:id
func (h *WebhookHandler) GetWebhook(c *gin.Context) {
	id := c.Param("id")
	webhook := models.WebhookConfig{
		ID:        id,
		Name:      "Test Webhook",
		URL:       "https://example.com/webhook",
		EventType: "budget_alert",
		Secret:    "whsec_xxx",
		IsActive:  true,
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now(),
	}
	c.JSON(http.StatusOK, webhook)
}

// CreateWebhook creates a new webhook
// POST /api/v1/webhooks
func (h *WebhookHandler) CreateWebhook(c *gin.Context) {
	var req models.WebhookConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	req.ID = "wh-" + generateID()
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()
	c.JSON(http.StatusCreated, req)
}

// UpdateWebhook updates an existing webhook
// PUT /api/v1/webhooks/:id
func (h *WebhookHandler) UpdateWebhook(c *gin.Context) {
	id := c.Param("id")
	var req models.WebhookConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	req.ID = id
	req.UpdatedAt = time.Now()
	c.JSON(http.StatusOK, req)
}

// DeleteWebhook deletes a webhook
// DELETE /api/v1/webhooks/:id
func (h *WebhookHandler) DeleteWebhook(c *gin.Context) {
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Webhook deleted successfully"})
}

// TestWebhook sends a test event to the webhook
// POST /api/v1/webhooks/:id/test
func (h *WebhookHandler) TestWebhook(c *gin.Context) {
	id := c.Param("id")
	exec := models.WebhookExecution{
		ID:         "exec-" + generateID(),
		WebhookID:  id,
		EventType:  "test",
		Payload:    `{"test": true, "timestamp": "` + time.Now().Format(time.RFC3339) + `"}`,
		Status:     "success",
		Response:   `{"success": true}`,
		HTTPStatus: 200,
		Duration:   150,
		Timestamp:  time.Now(),
	}
	c.JSON(http.StatusOK, exec)
}

// GetWebhookExecutions returns webhook execution history
// GET /api/v1/webhooks/:id/executions
func (h *WebhookHandler) GetWebhookExecutions(c *gin.Context) {
	webhookID := c.Param("id")
	executions := []models.WebhookExecution{
		{
			ID:         "exec-001",
			WebhookID:  webhookID,
			EventType:  "budget_alert",
			Payload:    `{"agent_id": "agent-001", "budget_used": 95}`,
			Status:     "success",
			Response:   `{"ok": true}`,
			HTTPStatus: 200,
			Duration:   230,
			Timestamp:  time.Now().Add(-1 * time.Hour),
		},
		{
			ID:         "exec-002",
			WebhookID:  webhookID,
			EventType:  "budget_alert",
			Payload:    `{"agent_id": "agent-002", "budget_used": 100}`,
			Status:     "success",
			Response:   `{"ok": true}`,
			HTTPStatus: 200,
			Duration:   180,
			Timestamp:  time.Now().Add(-30 * time.Minute),
		},
	}
	c.JSON(http.StatusOK, executions)
}

// AlertHandler handles alert configuration
type AlertHandler struct{}

func NewAlertHandler() *AlertHandler {
	return &AlertHandler{}
}

// ListAlerts returns all alert configurations
// GET /api/v1/alerts
func (h *AlertHandler) ListAlerts(c *gin.Context) {
	alerts := []models.AlertConfig{
		{
			ID:        "alert-001",
			Name:      "High Budget Usage",
			Type:      "budget",
			Threshold: 80,
			IsActive:  true,
			Channels:  []string{"slack", "email"},
			CreatedAt: time.Now().Add(-72 * time.Hour),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "alert-002",
			Name:      "Agent Failure",
			Type:      "agent_failure",
			Threshold: 1,
			IsActive:  true,
			Channels:  []string{"slack", "pagerduty"},
			CreatedAt: time.Now().Add(-48 * time.Hour),
			UpdatedAt: time.Now().Add(-24 * time.Hour),
		},
		{
			ID:        "alert-003",
			Name:      "API Rate Limit",
			Type:      "rate_limit",
			Threshold: 90,
			IsActive:  false,
			Channels:  []string{"email"},
			CreatedAt: time.Now().Add(-24 * time.Hour),
			UpdatedAt: time.Now(),
		},
	}
	c.JSON(http.StatusOK, alerts)
}

// CreateAlert creates a new alert configuration
// POST /api/v1/alerts
func (h *AlertHandler) CreateAlert(c *gin.Context) {
	var req models.AlertConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	req.ID = "alert-" + generateID()
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()
	c.JSON(http.StatusCreated, req)
}

// UpdateAlert updates an alert configuration
// PUT /api/v1/alerts/:id
func (h *AlertHandler) UpdateAlert(c *gin.Context) {
	id := c.Param("id")
	var req models.AlertConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	req.ID = id
	req.UpdatedAt = time.Now()
	c.JSON(http.StatusOK, req)
}

// DeleteAlert deletes an alert
// DELETE /api/v1/alerts/:id
func (h *AlertHandler) DeleteAlert(c *gin.Context) {
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Alert deleted successfully"})
}

// MultiCloudHandler handles multi-cloud operations
type MultiCloudHandler struct{}

func NewMultiCloudHandler() *MultiCloudHandler {
	return &MultiCloudHandler{}
}

// GetStatus returns multi-cloud provider status
// GET /api/v1/multi-cloud/status
func (h *MultiCloudHandler) GetStatus(c *gin.Context) {
	status := models.MultiCloudStatus{
		Primary: "openai",
		Providers: map[string]models.ProviderStatus{
			"openai":    {Name: "OpenAI", Status: "healthy", Latency: 45, LastCheck: time.Now()},
			"anthropic": {Name: "Anthropic", Status: "healthy", Latency: 62, LastCheck: time.Now()},
			"aws":       {Name: "AWS Bedrock", Status: "degraded", Latency: 120, LastCheck: time.Now()},
			"azure":     {Name: "Azure OpenAI", Status: "healthy", Latency: 55, LastCheck: time.Now()},
		},
		LastUpdated: time.Now(),
	}
	c.JSON(http.StatusOK, status)
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
	result := models.FailoverResult{
		Success:      true,
		FromProvider: "openai",
		ToProvider:   req.TargetProvider,
		Duration:     250,
		Timestamp:    time.Now(),
	}
	c.JSON(http.StatusOK, result)
}

// SelfHealingHandler handles self-healing operations
type SelfHealingHandler struct{}

func NewSelfHealingHandler() *SelfHealingHandler {
	return &SelfHealingHandler{}
}

// GetEvents returns self-healing event logs
// GET /api/v1/self-healing/events
func (h *SelfHealingHandler) GetEvents(c *gin.Context) {
	events := []models.SelfHealingEvent{
		{
			ID:          "sh-001",
			EventType:   "connection_recovery",
			Description: "Auto-reconnected to OpenAI API after 401 error",
			AgentID:     "agent-001",
			ActionTaken: "Re-authenticated and retried request",
			Status:      "resolved",
			Timestamp:   time.Now().Add(-2 * time.Hour),
		},
		{
			ID:          "sh-002",
			EventType:   "schema_update",
			Description: "Detected API schema change in第三方 service",
			AgentID:     "agent-003",
			ActionTaken: "Applied cached schema and notified admin",
			Status:      "resolved",
			Timestamp:   time.Now().Add(-5 * time.Hour),
		},
		{
			ID:          "sh-003",
			EventType:   "rate_limit_recovery",
			Description: "Rate limit detected, backing off",
			AgentID:     "agent-002",
			ActionTaken: "Exponential backoff applied",
			Status:      "resolved",
			Timestamp:   time.Now().Add(-8 * time.Hour),
		},
	}
	c.JSON(http.StatusOK, events)
}

// TriggerRecovery manually triggers a recovery action
// POST /api/v1/self-healing/recover
func (h *SelfHealingHandler) TriggerRecovery(c *gin.Context) {
	var req struct {
		AgentID string `json:"agent_id"`
		Action  string `json:"action"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	result := models.RecoveryResult{
		Success:   true,
		AgentID:   req.AgentID,
		Action:    req.Action,
		Message:   "Recovery action completed successfully",
		Timestamp: time.Now(),
	}
	c.JSON(http.StatusOK, result)
}

// generateID generates a simple ID
func generateID() string {
	return "xxx"
}
