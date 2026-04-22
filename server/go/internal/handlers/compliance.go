package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"sync"
	"time"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

var modelIDRegex = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

type ComplianceHandler struct {
	proxyService  *services.ProxyService
	uploadHandler *services.FileUploadHandler
	cache         *complianceCache
}

type complianceCache struct {
	mu     sync.RWMutex
	stats  cacheEntry
	checks cacheEntry
	models cacheEntry
}

type cacheEntry struct {
	data      []byte
	expiresAt time.Time
}

func newComplianceCache() *complianceCache {
	return &complianceCache{}
}

func (c *complianceCache) get(key string) ([]byte, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	var entry cacheEntry
	switch key {
	case "stats":
		entry = c.stats
	case "checks":
		entry = c.checks
	case "models":
		entry = c.models
	}

	if time.Now().After(entry.expiresAt) {
		return nil, false
	}
	return entry.data, true
}

func (c *complianceCache) set(key string, data []byte, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	entry := cacheEntry{
		data:      data,
		expiresAt: time.Now().Add(ttl),
	}
	switch key {
	case "stats":
		c.stats = entry
	case "checks":
		c.checks = entry
	case "models":
		c.models = entry
	}
}

func (c *complianceCache) invalidate(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	switch key {
	case "stats":
		c.stats = cacheEntry{}
	case "checks":
		c.checks = cacheEntry{}
	case "models":
		c.models = cacheEntry{}
	}
}

func NewComplianceHandler(proxyService *services.ProxyService, uploadHandler *services.FileUploadHandler) *ComplianceHandler {
	return &ComplianceHandler{
		proxyService:  proxyService,
		uploadHandler: uploadHandler,
		cache:         newComplianceCache(),
	}
}

func (h *ComplianceHandler) validateModelID(id string) error {
	if id == "" {
		return errors.New("model ID is required")
	}
	if !modelIDRegex.MatchString(id) {
		return errors.New("invalid model ID format")
	}
	return nil
}

func (h *ComplianceHandler) GetStats(c *gin.Context) {
	// Try cache first (TTL: 15 seconds)
	if cached, ok := h.cache.get("stats"); ok {
		c.Data(http.StatusOK, "application/json", cached)
		return
	}

	response, err := h.proxyService.Forward(c, "GET", "/compliance/stats", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance stats", Details: err.Error()})
		return
	}

	h.cache.set("stats", response, 15*time.Second)
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ListChecks(c *gin.Context) {
	// Try cache first (TTL: 30 seconds)
	if cached, ok := h.cache.get("checks"); ok {
		c.Data(http.StatusOK, "application/json", cached)
		return
	}

	response, err := h.proxyService.ListComplianceChecks(c)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance checks", Details: err.Error()})
		return
	}

	var checks []models.ComplianceCheck
	if err := json.Unmarshal(response, &checks); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	h.cache.set("checks", response, 30*time.Second)
	c.JSON(http.StatusOK, checks)
}

func (h *ComplianceHandler) GetCheck(c *gin.Context) {
	id := c.Param("id")

	if err := h.validateModelID(id); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	response, err := h.proxyService.GetComplianceCheck(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Compliance check not found"})
		return
	}

	var check models.ComplianceCheck
	if err := json.Unmarshal(response, &check); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, check)
}

func (h *ComplianceHandler) RunCheck(c *gin.Context) {
	var req models.RunComplianceCheckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	// Validate required fields
	if req.Type == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Type is required"})
		return
	}

	response, err := h.proxyService.RunComplianceCheck(c, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to run compliance check", Details: err.Error()})
		return
	}

	// Invalidate checks cache since a new check was run
	h.cache.invalidate("checks")

	var check models.ComplianceCheck
	if err := json.Unmarshal(response, &check); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusAccepted, check)
}

func (h *ComplianceHandler) GetCategories(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/categories", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch categories", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ExportReport(c *gin.Context) {
	modelID := c.Query("model_id")
	reportType := c.Query("report_type")

	path := "/compliance/reports/export"
	if modelID != "" {
		path = fmt.Sprintf("%s?model_id=%s", path, modelID)
		if reportType != "" {
			path = fmt.Sprintf("%s&report_type=%s", path, reportType)
		}
	} else if reportType != "" {
		path = fmt.Sprintf("%s?report_type=%s", path, reportType)
	}

	response, err := h.proxyService.Forward(c, "GET", path, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to export report", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ListArticles(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/articles", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch articles", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ListArtifacts(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/artifacts", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch artifacts", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ListModels(c *gin.Context) {
	response, err := h.proxyService.ListComplianceModels(c)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance models", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) RegisterModel(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}
	response, err := h.proxyService.RegisterComplianceModel(c, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to register model", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", response)
}

func (h *ComplianceHandler) UpdateGuardrails(c *gin.Context) {
	id := c.Param("id")
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}
	response, err := h.proxyService.UpdateComplianceGuardrails(c, id, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to update guardrails", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetBiasReports(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.GetBiasReports(c, id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch bias reports", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) TriggerBiasScan(c *gin.Context) {
	var req struct {
		ModelID string `json:"modelId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.TriggerBiasScan(c, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to trigger bias scan", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) RedTeamAudit(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward(c, "POST", "/compliance/red-team", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Red team audit failed", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) EURegister(c *gin.Context) {
	var req struct {
		ModelID string `json:"model_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward(c, "POST", "/compliance/eu-register", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to register with EU database", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GenerateDocumentation(c *gin.Context) {
	modelID := c.Param("id")

	response, err := h.proxyService.Forward(c, "GET", fmt.Sprintf("/compliance/reports/export?model_id=%s", modelID), nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to generate documentation", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) UploadArtifact(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "No file uploaded"})
		return
	}

	result, err := h.uploadHandler.UploadFile(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to upload file", Details: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *ComplianceHandler) GetROIMetrics(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/roi", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch ROI metrics", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetVelocityTrends(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/velocity", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch velocity trends", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetDeadlines(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/deadlines", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance deadlines", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetEnterpriseAudits(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/enterprise/audits", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch enterprise audits", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetModelBreakdown(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "GET", fmt.Sprintf("/compliance/models/%s/breakdown", id), nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch model breakdown", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetModelAudits(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "GET", fmt.Sprintf("/compliance/models/%s/audits", id), nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch model audits", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetModelHandshakes(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "GET", fmt.Sprintf("/compliance/models/%s/handshakes", id), nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch model handshakes", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
func (h *ComplianceHandler) GetRegionalReports(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/regional-reports", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch regional reports", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetFinancialMetrics(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/compliance/financial-metrics", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch financial metrics", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ListChecklists(c *gin.Context) {
	category := c.Query("category")
	section := c.Query("section")

	path := "/compliance/checklists"
	if category != "" {
		path = fmt.Sprintf("%s?category=%s", path, category)
		if section != "" {
			path = fmt.Sprintf("%s&section=%s", path, section)
		}
	} else if section != "" {
		path = fmt.Sprintf("%s?section=%s", path, section)
	}

	response, err := h.proxyService.Forward(c, "GET", path, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance checklists", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) UpdateChecklistItem(c *gin.Context) {
	id := c.Param("id")
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward(c, "POST", fmt.Sprintf("/compliance/checklists/%s", id), req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to update checklist item", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// ListAuditLogs proxies to agent-ops audit logs
func (h *ComplianceHandler) ListAuditLogs(c *gin.Context) {
	agentID := c.Query("agentId")
	limit := c.Query("limit")
	search := c.Query("search")
	outcome := c.Query("outcome")

	if limit == "" {
		limit = "50"
	}

	path := fmt.Sprintf("/agent-ops/audit?limit=%s", limit)
	if agentID != "" {
		path = fmt.Sprintf("%s&agent_id=%s", path, agentID)
	}
	if search != "" {
		path = fmt.Sprintf("%s&search=%s", path, search)
	}
	if outcome != "" {
		path = fmt.Sprintf("%s&outcome=%s", path, outcome)
	}

	response, err := h.proxyService.Forward(c, "GET", path, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch audit logs", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

// UpdateIncidentStatus updates status of a compliance incident
func (h *ComplianceHandler) UpdateIncidentStatus(c *gin.Context) {
	id := c.Param("id")
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	// Map to Python's alert resolution path remapped in agent_ops.go
	path := fmt.Sprintf("/agent-ops/compliance/alerts/%s/resolve", id)
	response, err := h.proxyService.Forward(c, "PATCH", path, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to update incident status", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}
