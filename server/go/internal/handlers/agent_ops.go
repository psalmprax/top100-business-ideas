package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

var agentIDRegex = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{12}$`)

type AgentOpsHandler struct {
	proxyService *services.ProxyService
	cache        *agentCache
}

type agentCache struct {
	mu      sync.RWMutex
	agents  agentCacheEntry
	metrics agentCacheEntry
}

type agentCacheEntry struct {
	data      []byte
	expiresAt time.Time
}

func NewAgentOpsHandler(proxyService *services.ProxyService) *AgentOpsHandler {
	return &AgentOpsHandler{
		proxyService: proxyService,
		cache:        newAgentCache(),
	}
}

func newAgentCache() *agentCache {
	return &agentCache{}
}

func (c *agentCache) get(key string) ([]byte, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	var entry agentCacheEntry
	switch key {
	case "agents":
		entry = c.agents
	case "metrics":
		entry = c.metrics
	default:
		return nil, false
	}

	if time.Now().Before(entry.expiresAt) {
		return entry.data, true
	}
	return nil, false
}

func (c *agentCache) set(key string, data []byte, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	entry := agentCacheEntry{
		data:      data,
		expiresAt: time.Now().Add(ttl),
	}

	switch key {
	case "agents":
		c.agents = entry
	case "metrics":
		c.metrics = entry
	}
}

func validateAgentID(id string) error {
	if id == "" {
		return fmt.Errorf("agent ID is required")
	}
	if !agentIDRegex.MatchString(id) {
		return fmt.Errorf("invalid agent ID format")
	}
	return nil
}

func transformAgentList(data []byte) ([]byte, error) {
	var agents []models.Agent
	if err := json.Unmarshal(data, &agents); err != nil {
		return data, err
	}

	transformed := map[string]interface{}{
		"status":    "success",
		"count":     len(agents),
		"agents":    agents,
		"cached":    false,
		"timestamp": time.Now().Unix(),
	}

	return json.Marshal(transformed)
}

func transformAgent(data []byte) ([]byte, error) {
	var agent models.Agent
	if err := json.Unmarshal(data, &agent); err != nil {
		return data, err
	}

	transformed := map[string]interface{}{
		"status":    "success",
		"agent":     agent,
		"timestamp": time.Now().Unix(),
	}

	return json.Marshal(transformed)
}

func transformMetrics(data []byte) ([]byte, error) {
	var metrics models.AgentMetrics
	if err := json.Unmarshal(data, &metrics); err != nil {
		return data, err
	}

	transformed := map[string]interface{}{
		"status":    "success",
		"metrics":   metrics,
		"timestamp": time.Now().Unix(),
	}

	return json.Marshal(transformed)
}

func (h *AgentOpsHandler) ListAgents(c *gin.Context) {
	// Try cache first (TTL: 30 seconds)
	if cached, ok := h.cache.get("agents"); ok {
		var agents []models.Agent
		if err := json.Unmarshal(cached, &agents); err == nil {
			c.JSON(http.StatusOK, agents)
			return
		}
	}

	response, err := h.proxyService.ListAgents(c)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch agents from backend", Details: err.Error()})
		return
	}

	if len(response) == 0 || string(response) == "[]" {
		transformed, _ := transformAgentList([]byte("[]"))
		c.Data(http.StatusOK, "application/json", transformed)
		return
	}

	// Transform and cache response
	transformed, err := transformAgentList(response)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to transform response"})
		return
	}

	h.cache.set("agents", transformed, 30*time.Second)

	var agents []models.Agent
	if err := json.Unmarshal(response, &agents); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, agents)
}

func (h *AgentOpsHandler) GetAgent(c *gin.Context) {
	id := c.Param("id")

	// Input validation
	if err := validateAgentID(id); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	response, err := h.proxyService.GetAgent(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Agent not found"})
		return
	}

	// Transform response
	transformed, err := transformAgent(response)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to transform response"})
		return
	}

	c.Data(http.StatusOK, "application/json", transformed)
}

func (h *AgentOpsHandler) CreateAgent(c *gin.Context) {
	var req models.CreateAgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	response, err := h.proxyService.CreateAgent(c, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to create agent", Details: err.Error()})
		return
	}

	var agent models.Agent
	if err := json.Unmarshal(response, &agent); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusCreated, agent)
}

func (h *AgentOpsHandler) UpdateAgent(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateAgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	response, err := h.proxyService.UpdateAgent(c, id, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to update agent", Details: err.Error()})
		return
	}

	var agent models.Agent
	if err := json.Unmarshal(response, &agent); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, agent)
}

func (h *AgentOpsHandler) DeleteAgent(c *gin.Context) {
	id := c.Param("id")

	_, err := h.proxyService.DeleteAgent(c, id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to delete agent", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Agent deleted successfully"})
}

func (h *AgentOpsHandler) GetAgentLogs(c *gin.Context) {
	id := c.Param("id")

	response, err := h.proxyService.GetAgentLogs(c, id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch logs", Details: err.Error()})
		return
	}

	var logs []models.AgentLog
	if err := json.Unmarshal(response, &logs); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

func (h *AgentOpsHandler) StopAgent(c *gin.Context) {
	id := c.Param("id")

	_, err := h.proxyService.StopAgent(c, id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to stop agent", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Message: fmt.Sprintf("Agent %s stopped", id)})
}

func (h *AgentOpsHandler) RestartAgent(c *gin.Context) {
	id := c.Param("id")

	_, err := h.proxyService.RestartAgent(c, id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to restart agent", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Message: fmt.Sprintf("Agent %s restarted", id)})
}

func (h *AgentOpsHandler) GetAgentMetrics(c *gin.Context) {
	response, err := h.proxyService.GetAgentMetrics(c)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch metrics", Details: err.Error()})
		return
	}

	var metrics map[string]interface{}
	if err := json.Unmarshal(response, &metrics); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, metrics)
}

func (h *AgentOpsHandler) GetAgentHistory(c *gin.Context) {
	id := c.Param("id")

	response, err := h.proxyService.GetAgentHistory(c, id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch history", Details: err.Error()})
		return
	}

	var history []interface{}
	if err := json.Unmarshal(response, &history); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, history)
}

// GetAuditLogs retrieves audit logs for agents
func (h *AgentOpsHandler) GetAuditLogs(c *gin.Context) {
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

	status, response, err := h.proxyService.ForwardWithStatus(c, "GET", path, nil, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch audit logs", Details: err.Error()})
		return
	}

	c.Data(status, "application/json", response)
}

// ListLLMConfigs retrieves available LLM configurations
func (h *AgentOpsHandler) ListLLMConfigs(c *gin.Context) {
	status, response, err := h.proxyService.ForwardWithStatus(c, "GET", "/ml/models", nil, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch LLM configs", Details: err.Error()})
		return
	}

	c.Data(status, "application/json", response)
}

// GetForecast retrieves cost and usage forecast for an agent
func (h *AgentOpsHandler) GetForecast(c *gin.Context) {
	id := c.Param("id")
	path := fmt.Sprintf("/agents/%s/forecast", id)

	status, response, err := h.proxyService.ForwardWithStatus(c, "GET", path, nil, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch forecast", Details: err.Error()})
		return
	}

	c.Data(status, "application/json", response)
}

// CloneConfig handles agent configuration duplication
// POST /api/v1/agents/:id/clone
func (h *AgentOpsHandler) CloneConfig(c *gin.Context) {
	id := c.Param("id")
	path := fmt.Sprintf("/agents/%s/clone", id)

	status, response, err := h.proxyService.ForwardWithStatus(c, "POST", path, nil, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to clone agent", Details: err.Error()})
		return
	}

	c.Data(status, "application/json", response)
}

// SyncLinguisticPackage handles linguistic package deployment
// POST /api/v1/agent-ops/sync-locale
func (h *AgentOpsHandler) SyncLinguisticPackage(c *gin.Context) {
	var req struct {
		Locale string `json:"locale"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	status, response, err := h.proxyService.ForwardWithStatus(c, "POST", "/agent-ops/sync-locale", req, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to sync linguistic package", Details: err.Error()})
		return
	}

	c.Data(status, "application/json", response)
}

// OptimizeMemory triggers agent memory pruning
// POST /api/v1/agents/:id/optimize
func (h *AgentOpsHandler) OptimizeMemory(c *gin.Context) {
	id := c.Param("id")
	path := fmt.Sprintf("/agents/%s/optimize", id)

	status, response, err := h.proxyService.ForwardWithStatus(c, "POST", path, nil, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to optimize agent memory", Details: err.Error()})
		return
	}

	c.Data(status, "application/json", response)
}

// ProxyToPython forwards generic requests to the Python backend
func (h *AgentOpsHandler) ProxyToPython(c *gin.Context) {
	// Strip /api/v1 prefix from the path
	path := c.Request.URL.Path
	if len(path) > 7 && path[:7] == "/api/v1" {
		path = path[7:]
	}

	// Remap specific /agent-ops paths to Python equivalents
	if strings.HasPrefix(path, "/agent-ops") {
		// subPath is everything after "/agent-ops"
		subPath := strings.TrimPrefix(path, "/agent-ops")

		if subPath == "" || subPath == "/" {
			path = "/"
		} else if strings.HasPrefix(subPath, "/bulk/") {
			path = "/agents" + subPath
		} else if strings.HasPrefix(subPath, "/compliance/alerts/") {
			path = "/compliance/incidents/" + strings.TrimPrefix(subPath, "/compliance/alerts/")
		} else if path == "/agent-ops/compliance/sox" || path == "/agent-ops/compliance/audit/sox" {
			path = "/compliance/audit/sox"
		} else if path == "/agent-ops/compliance/hipaa" || path == "/agent-ops/compliance/audit/hipaa" {
			path = "/compliance/audit/hipaa"
		} else if strings.HasPrefix(subPath, "/governance/healing/") || strings.HasPrefix(subPath, "/self-healing/") {
			// Align with AlphaHecta Self-Healing API
			subPathTrimmed := strings.TrimPrefix(subPath, "/governance/healing/")
			subPathTrimmed = strings.TrimPrefix(subPathTrimmed, "/self-healing/")
			path = "/self-healing/healing/" + subPathTrimmed
		} else if strings.HasPrefix(subPath, "/alerts") {
			path = "/agents" + subPath
		} else if strings.HasPrefix(subPath, "/vigilance") {
			if strings.HasPrefix(subPath, "/vigilance/alerts") {
				path = "/agents/vigilance" + strings.TrimPrefix(subPath, "/vigilance/alerts")
			} else {
				path = "/agents" + subPath
			}
		} else if strings.HasPrefix(subPath, "/governance/") {
			if strings.Contains(subPath, "/roi") {
				path = "/governance/analytics/roi"
			} else {
				path = subPath
			}
		} else if strings.HasPrefix(subPath, "/venture") {
			path = subPath
		} else if strings.HasPrefix(subPath, "/compliance/hipaa") {
			path = "/compliance/audit/hipaa"
		} else if strings.HasPrefix(subPath, "/compliance/sox") {
			path = "/compliance/audit/sox"
		} else if strings.HasPrefix(subPath, "/cloud/health") {
			path = "/self-healing/status"
		} else if strings.HasPrefix(subPath, "/cloud/failover") {
			path = "/cloud/failover"
		} else if strings.HasPrefix(subPath, "/audit") {
			path = "/compliance/dashboard"
		} else if subPath == "/architecture/defaults" {
			path = "/governance/architecture/defaults"
		} else {
			path = subPath
		}
	}

	var body interface{}
	if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
		if err := c.ShouldBindJSON(&body); err != nil && err != io.EOF {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body", Details: err.Error()})
			return
		}
	}

	headers := map[string]string{
		"X-User-ID": c.GetString("user_id"),
	}
	status, response, err := h.proxyService.ForwardWithStatus(c, c.Request.Method, path, body, headers)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Backend proxy error", Details: err.Error()})
		return
	}

	c.Data(status, "application/json", response)
}
func (h *AgentOpsHandler) RunForensics(c *gin.Context) {
	agentID := c.Query("agent_id")
	response, err := h.proxyService.RunForensics(c, agentID)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Forensic analysis failed", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *AgentOpsHandler) ProvisionClient(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}

	response, err := h.proxyService.ProvisionClient(c, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Provisioning failed", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
func (h *AgentOpsHandler) ListVentureInsights(c *gin.Context) {
	status1, response1, err1 := h.proxyService.ForwardWithStatus(c, "GET", "/venture/insights", nil, nil)
	if err1 != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch venture insights", Details: err1.Error()})
		return
	}
	c.Data(status1, "application/json", response1)
}

func (h *AgentOpsHandler) AnalyzeVentureScenario(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid scenario data"})
		return
	}

	status2, response2, err2 := h.proxyService.ForwardWithStatus(c, "POST", "/venture/scenario/analyze", req, nil)
	if err2 != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to analyze scenario", Details: err2.Error()})
		return
	}
	c.Data(status2, "application/json", response2)
}
