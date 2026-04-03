package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/repository"
	"github.com/top100-business-ideas/api/internal/services"
)

// WorkforceHandler handles digital workforce and Sovereign operations
type WorkforceHandler struct {
	proxy *services.ProxyService
	repo  *repository.WorkforceRepository
}

func NewWorkforceHandler(proxy *services.ProxyService, repo *repository.WorkforceRepository) *WorkforceHandler {
	return &WorkforceHandler{
		proxy: proxy,
		repo:  repo,
	}
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

// ListDecisions returns historical governance decisions
func (h *WorkforceHandler) ListDecisions(c *gin.Context) {
	userID := c.GetString("user_id")
	decisions, err := h.repo.ListGovernanceDecisions(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to list decisions"})
		return
	}
	c.JSON(http.StatusOK, decisions)
}

// ListTraces returns behavioral forensic traces
func (h *WorkforceHandler) ListTraces(c *gin.Context) {
	userID := c.GetString("user_id")
	traces, err := h.repo.ListForensicTraces(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to list traces"})
		return
	}
	c.JSON(http.StatusOK, traces)
}

// RequestApproval initiates a Sovereign approval request
// POST /api/v1/workforce/sovereign/request
func (h *WorkforceHandler) RequestApproval(c *gin.Context) {
	var req models.SovereignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	userID := c.GetString("user_id")

	// Real-First Hardening: Log the decision initiation
	_ = h.repo.CreateGovernanceDecision(c.Request.Context(), &models.GovernanceDecision{
		UserID:   userID,
		Stage:    1, // Default to initiation stage
		Decision: "INITIATED",
		Status:   "pending",
	})

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

	userID := c.GetString("user_id")

	// Real-First Hardening: Log the finalized decision
	decisionStr := "DENIED"
	if req.Approved {
		decisionStr = "APPROVED"
	}
	_ = h.repo.CreateGovernanceDecision(c.Request.Context(), &models.GovernanceDecision{
		UserID:   userID,
		Stage:    2, // Callback stage
		Decision: decisionStr,
		Status:   "finalized",
	})

	// Forward to Python
	resp, err := h.proxy.Forward("POST", "/workforce/sovereign/callback", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to process sovereign callback", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

// RecoverRevenue handles uncollected revenue detection
func (h *WorkforceHandler) RecoverRevenue(c *gin.Context) {
	var req struct {
		Criteria string `json:"criteria"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	resp, err := h.proxy.Forward("POST", "/workforce/cashclaw/recover", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to recover revenue", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

// RunCampaign triggers a marketing trend research and deployment
func (h *WorkforceHandler) RunCampaign(c *gin.Context) {
	var req struct {
		Topic    string `json:"topic"`
		Audience string `json:"audience"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	resp, err := h.proxy.Forward("POST", "/workforce/campaigns/run", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to run campaign", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

// SourceLeads handles lead generation scraping
func (h *WorkforceHandler) SourceLeads(c *gin.Context) {
	criteria := c.Query("criteria")
	if criteria == "" {
		criteria = "general"
	}

	resp, err := h.proxy.Forward("GET", "/workforce/leads/source?criteria="+criteria, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to source leads", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

// AnalyzeInsights correlates feedback patterns
func (h *WorkforceHandler) AnalyzeInsights(c *gin.Context) {
	var req struct {
		Feedback string `json:"feedback"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	resp, err := h.proxy.Forward("POST", "/workforce/insights/analyze", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to analyze insights", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

// HandleInbound drafts high-quality responses
func (h *WorkforceHandler) HandleInbound(c *gin.Context) {
	var req struct {
		Query string `json:"query"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	resp, err := h.proxy.Forward("POST", "/workforce/inbound/handle", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to handle inbound", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

// ProvideFeedback logs agent performance feedback
func (h *WorkforceHandler) ProvideFeedback(c *gin.Context) {
	var req struct {
		InteractionID string `json:"interaction_id"`
		Status        string `json:"status"`
		Notes         string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	resp, err := h.proxy.Forward("POST", "/workforce/feedback", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to provide feedback", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

// GetSkills returns available skills from the marketplace
func (h *WorkforceHandler) GetSkills(c *gin.Context) {
	resp, err := h.proxy.Forward("GET", "/workforce/skills", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch skills", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// GetJobs returns live job feed from persistence
func (h *WorkforceHandler) GetJobs(c *gin.Context) {
	resp, err := h.proxy.Forward("GET", "/workforce/jobs", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch jobs", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// GetAcquisitions returns growth acquisition wins
func (h *WorkforceHandler) GetAcquisitions(c *gin.Context) {
	resp, err := h.proxy.Forward("GET", "/workforce/acquisitions", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch acquisitions", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// GetContentDrafts returns content factory drafts
func (h *WorkforceHandler) GetContentDrafts(c *gin.Context) {
	resp, err := h.proxy.Forward("GET", "/workforce/content", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch content drafts", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// RunAutosearch triggers the autonomous prospecting loop
func (h *WorkforceHandler) RunAutosearch(c *gin.Context) {
	var req struct {
		Niche   string `json:"niche"`
		Profile string `json:"profile"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	resp, err := h.proxy.Forward("POST", "/workforce/autosearch/run", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to run autosearch", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

// GetOutreachDrafts returns pending outreach messages
func (h *WorkforceHandler) GetOutreachDrafts(c *gin.Context) {
	resp, err := h.proxy.Forward("GET", "/workforce/outreach/drafts", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch outreach drafts", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// ApproveOutreach finalizes and sends an outreach message
func (h *WorkforceHandler) ApproveOutreach(c *gin.Context) {
	id := c.Param("id")
	resp, err := h.proxy.Forward("POST", "/workforce/outreach/"+id+"/approve", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to approve outreach", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// GetInvoices returns workforce-specific financial records
func (h *WorkforceHandler) GetInvoices(c *gin.Context) {
	resp, err := h.proxy.Forward("GET", "/enterprise/invoices", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch workforce invoices", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

