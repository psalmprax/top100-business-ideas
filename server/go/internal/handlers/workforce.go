package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/repository"
	"github.com/top100-business-ideas/api/internal/services"
)

var uuidRegex = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

const (
	RateLimitBurst  = 10
	RateLimitRefill = 100 // per second
)

type rateLimiter struct {
	mu     sync.RWMutex
	tokens map[string]*userRateLimit
}

type userRateLimit struct {
	tokens    int
	lastCheck time.Time
}

func newRateLimiter() *rateLimiter {
	return &rateLimiter{
		tokens: make(map[string]*userRateLimit),
	}
}

func (r *rateLimiter) allow(userID string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	limit, exists := r.tokens[userID]

	if !exists {
		r.tokens[userID] = &userRateLimit{
			tokens:    RateLimitBurst - 1,
			lastCheck: now,
		}
		return true
	}

	elapsed := now.Sub(limit.lastCheck).Seconds()
	refill := int(elapsed * float64(RateLimitRefill))
	limit.tokens = min(RateLimitBurst, limit.tokens+refill)
	limit.lastCheck = now

	if limit.tokens > 0 {
		limit.tokens--
		return true
	}
	return false
}

type WorkforceHandler struct {
	proxy     *services.ProxyService
	repo      *repository.WorkforceRepository
	cache     *workforceCache
	rateLimit *rateLimiter
	enricher  *requestEnricher
}

type requestEnricher struct {
	mu         sync.RWMutex
	commonKeys map[string]string
}

func newRequestEnricher() *requestEnricher {
	return &requestEnricher{
		commonKeys: map[string]string{
			"source":            "go-gateway",
			"gateway_version":   "2.0.0",
			"request_id_prefix": "wfh",
		},
	}
}

func (e *requestEnricher) enrich(req map[string]interface{}, userID string) map[string]interface{} {
	e.mu.RLock()
	defer e.mu.RUnlock()

	enriched := make(map[string]interface{}, len(req)+5)
	for k, v := range req {
		enriched[k] = v
	}

	for k, v := range e.commonKeys {
		enriched[k] = v
	}

	enriched["user_id"] = userID
	enriched["gateway_timestamp"] = time.Now().UTC().Unix()
	enriched["request_id"] = fmt.Sprintf("%s-%d-%s",
		e.commonKeys["request_id_prefix"],
		time.Now().Unix(),
		userID[:8])

	return enriched
}

func (e *requestEnricher) transformResponse(data []byte, endpoint string) ([]byte, error) {
	var raw interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		return data, err
	}

	transformed := e.addResponseMetadata(raw)
	return json.Marshal(transformed)
}

func (e *requestEnricher) addResponseMetadata(raw interface{}) interface{} {
	switch v := raw.(type) {
	case map[string]interface{}:
		v["_gateway_metadata"] = map[string]interface{}{
			"transformed_at":   time.Now().UTC().Unix(),
			"gateway_version":  "2.0.0",
			"response_version": "2.0",
		}
		return v
	case []interface{}:
		for i, item := range v {
			if m, ok := item.(map[string]interface{}); ok {
				m["_item_index"] = i
			}
		}
		return v
	default:
		return raw
	}
}

type workforceCache struct {
	mu         sync.RWMutex
	status     cacheItem
	skills     cacheItem
	ventures   cacheItem
	decisions  cacheItem
	lastUpdate time.Time
}

type cacheItem struct {
	data      []byte
	expiresAt time.Time
}

func newWorkforceCache() *workforceCache {
	return &workforceCache{
		status:     cacheItem{expiresAt: time.Now()},
		skills:     cacheItem{expiresAt: time.Now()},
		ventures:   cacheItem{expiresAt: time.Now()},
		decisions:  cacheItem{expiresAt: time.Now()},
		lastUpdate: time.Now(),
	}
}

func (c *workforceCache) get(key string) ([]byte, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	var entry cacheItem
	switch key {
	case "status":
		entry = c.status
	case "skills":
		entry = c.skills
	case "ventures":
		entry = c.ventures
	case "decisions":
		entry = c.decisions
	}

	if time.Now().After(entry.expiresAt) {
		return nil, false
	}
	return entry.data, true
}

func (c *workforceCache) set(key string, data []byte, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	entry := cacheItem{
		data:      data,
		expiresAt: time.Now().Add(ttl),
	}
	switch key {
	case "status":
		c.status = entry
	case "skills":
		c.skills = entry
	case "ventures":
		c.ventures = entry
	case "decisions":
		c.decisions = entry
	}
}

func (c *workforceCache) invalidate(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	switch key {
	case "status":
		c.status = cacheItem{expiresAt: time.Now()}
	case "ventures":
		c.ventures = cacheItem{expiresAt: time.Now()}
	case "decisions":
		c.decisions = cacheItem{expiresAt: time.Now()}
	}
}

func NewWorkforceHandler(proxy *services.ProxyService, repo *repository.WorkforceRepository) *WorkforceHandler {
	return &WorkforceHandler{
		proxy:     proxy,
		repo:      repo,
		cache:     newWorkforceCache(),
		rateLimit: newRateLimiter(),
		enricher:  newRequestEnricher(),
	}
}

// validateCampaignRequest validates campaign request before forwarding
func (h *WorkforceHandler) validateCampaignRequest(c *gin.Context) error {
	var req struct {
		Topic    string `json:"topic"`
		Audience string `json:"audience"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		return err
	}
	if req.Topic == "" {
		return errors.New("topic is required")
	}
	if len(req.Topic) > 200 {
		return errors.New("topic exceeds maximum length of 200 characters")
	}
	// Additional validation: sanitize inputs
	req.Topic = sanitizeInput(req.Topic)
	req.Audience = sanitizeInput(req.Audience)
	return nil
}

func sanitizeInput(input string) string {
	// Basic XSS prevention
	input = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(input, "")
	input = regexp.MustCompile(`javascript:`).ReplaceAllString(input, "")
	return input
}

// validateLeadCriteria validates lead sourcing criteria
func (h *WorkforceHandler) validateLeadCriteria(c *gin.Context) error {
	criteria := c.Query("criteria")
	if criteria != "" && len(criteria) > 100 {
		return errors.New("criteria exceeds maximum length of 100 characters")
	}
	return nil
}

// checkRateLimit applies rate limiting to endpoint
func (h *WorkforceHandler) checkRateLimit(c *gin.Context) bool {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = c.ClientIP()
	}
	return h.rateLimit.allow(userID)
}

// enrichRequest adds gateway metadata to requests
func (h *WorkforceHandler) enrichRequest(c *gin.Context, reqData map[string]interface{}) map[string]interface{} {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "anonymous"
	}
	return h.enricher.enrich(reqData, userID)
}

// transformResponse adds metadata to API responses
func (h *WorkforceHandler) transformResponse(data []byte, endpoint string) ([]byte, error) {
	return h.enricher.transformResponse(data, endpoint)
}

// GetStatus returns the current status of the digital workforce
// GET /api/v1/workforce/status
func (h *WorkforceHandler) GetStatus(c *gin.Context) {
	// Rate limiting
	if !h.checkRateLimit(c) {
		c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
			Error:   "Rate limit exceeded",
			Details: "Too many requests. Please try again later.",
		})
		return
	}

	// Try cache first (TTL: 30 seconds)
	if cached, ok := h.cache.get("status"); ok {
		// Transform cached response
		transformed, err := h.transformResponse(cached, "/workforce/status")
		if err == nil {
			c.Data(http.StatusOK, "application/json", transformed)
			return
		}
		c.Data(http.StatusOK, "application/json", cached)
		return
	}

	userID := c.GetString("user_id")
	enrichedReq := h.enrichRequest(c, map[string]interface{}{
		"endpoint": "workforce_status",
	})

	resp, err := h.proxy.Forward("GET", "/workforce/status", enrichedReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch workforce status", Details: err.Error()})
		return
	}

	// Cache the response
	h.cache.set("status", resp, 30*time.Second)

	// Transform and return
	transformed, err := h.transformResponse(resp, "/workforce/status")
	if err != nil {
		c.Data(http.StatusOK, "application/json", resp)
		return
	}
	c.Data(http.StatusOK, "application/json", transformed)

	// Log to local database for audit
	if userID != "" {
		go h.repo.CreateGovernanceDecision(c.Request.Context(), &models.GovernanceDecision{
			UserID:   userID,
			Stage:    0,
			Decision: "STATUS_CHECK",
			Status:   "completed",
		})
	}
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
	// Rate limiting
	if !h.checkRateLimit(c) {
		c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
			Error:   "Rate limit exceeded",
			Details: "Too many requests for campaign execution. Please try again later.",
		})
		return
	}

	if err := h.validateCampaignRequest(c); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid campaign request", Details: err.Error()})
		return
	}

	var req struct {
		Topic    string `json:"topic"`
		Audience string `json:"audience"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	// Enrich request with gateway metadata
	userID := c.GetString("user_id")
	enrichedReq := h.enrichRequest(c, map[string]interface{}{
		"topic":         req.Topic,
		"audience":      req.Audience,
		"campaign_type": "marketing",
		"triggered_by":  userID,
	})

	// Transform response to add metadata
	resp, err := h.proxy.Forward("POST", "/workforce/campaigns/run", enrichedReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to run campaign", Details: err.Error()})
		return
	}

	// Invalidate cache since new campaign was created
	h.cache.invalidate("status")

	// Transform response
	transformed, err := h.transformResponse(resp, "/workforce/campaigns/run")
	if err != nil {
		c.Data(http.StatusOK, "application/json", resp)
		return
	}
	c.Data(http.StatusOK, "application/json", transformed)
}

// SourceLeads handles lead generation scraping
func (h *WorkforceHandler) SourceLeads(c *gin.Context) {
	if err := h.validateLeadCriteria(c); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid criteria", Details: err.Error()})
		return
	}

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
	// Try cache first (TTL: 60 seconds)
	if cached, ok := h.cache.get("skills"); ok {
		c.Data(http.StatusOK, "application/json", cached)
		return
	}

	resp, err := h.proxy.Forward("GET", "/workforce/skills", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch skills", Details: err.Error()})
		return
	}

	// Cache the response
	h.cache.set("skills", resp, 60*time.Second)

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
	// Rate limiting for write operations
	if !h.checkRateLimit(c) {
		c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
			Error:   "Rate limit exceeded",
			Details: "Too many outreach approvals. Please try again later.",
		})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Outreach ID is required"})
		return
	}

	// Validate UUID format
	if !uuidRegex.MatchString(id) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid outreach ID format"})
		return
	}

	// Enrich request
	userID := c.GetString("user_id")
	enrichedReq := h.enrichRequest(c, map[string]interface{}{
		"outreach_id":     id,
		"approved_by":     userID,
		"approval_action": "send",
	})

	resp, err := h.proxy.Forward("POST", "/workforce/outreach/"+id+"/approve", enrichedReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to approve outreach", Details: err.Error()})
		return
	}

	// Invalidate cache after approval
	h.cache.invalidate("status")

	// Log the approval decision locally
	if userID != "" {
		go h.repo.CreateGovernanceDecision(c.Request.Context(), &models.GovernanceDecision{
			UserID:   userID,
			Stage:    3,
			Decision: "OUTREACH_APPROVED",
			Status:   "completed",
		})
	}

	// Transform response
	transformed, err := h.transformResponse(resp, "/workforce/outreach/approve")
	if err != nil {
		c.Data(http.StatusOK, "application/json", resp)
		return
	}
	c.Data(http.StatusOK, "application/json", transformed)
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

// ActivateReferral activates the referral program for a user
func (h *WorkforceHandler) ActivateReferral(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not authenticated"})
		return
	}

	req := map[string]interface{}{
		"user_id": userID,
	}
	resp, err := h.proxy.Forward("POST", "/workforce/referral/activate", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to activate referral", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// GetReferralStats returns referral program statistics
func (h *WorkforceHandler) GetReferralStats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "User not authenticated"})
		return
	}

	resp, err := h.proxy.Forward("GET", "/workforce/referral/stats?user_id="+userID.(string), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch referral stats", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// ToggleAutonomy toggles agent autonomy level
func (h *WorkforceHandler) ToggleAutonomy(c *gin.Context) {
	var req struct {
		Level string `json:"level"` // partial, full
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	resp, err := h.proxy.Forward("POST", "/workforce/autonomy/toggle", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to toggle autonomy", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

// DeployCheck runs a deployment health check
func (h *WorkforceHandler) DeployCheck(c *gin.Context) {
	resp, err := h.proxy.Forward("GET", "/workforce/deploy/check", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to run deploy check", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}
