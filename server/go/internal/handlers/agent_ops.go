package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"


	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type AgentOpsHandler struct {
	proxyService *services.ProxyService
}

func NewAgentOpsHandler(proxyService *services.ProxyService) *AgentOpsHandler {
	return &AgentOpsHandler{
		proxyService: proxyService,
	}
}

func (h *AgentOpsHandler) ListAgents(c *gin.Context) {
	response, err := h.proxyService.ListAgents()
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch agents from backend", Details: err.Error()})
		return
	}

	if len(response) == 0 || string(response) == "[]" {
		c.JSON(http.StatusOK, []models.Agent{})
		return
	}

	var agents []models.Agent
	if err := json.Unmarshal(response, &agents); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, agents)
}

func (h *AgentOpsHandler) GetAgent(c *gin.Context) {
	id := c.Param("id")

	response, err := h.proxyService.GetAgent(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Agent not found"})
		return
	}

	var agent models.Agent
	if err := json.Unmarshal(response, &agent); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, agent)
}

func (h *AgentOpsHandler) CreateAgent(c *gin.Context) {
	var req models.CreateAgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	response, err := h.proxyService.CreateAgent(req)
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

	response, err := h.proxyService.UpdateAgent(id, req)
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

	_, err := h.proxyService.DeleteAgent(id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to delete agent", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Agent deleted successfully"})
}

func (h *AgentOpsHandler) GetAgentLogs(c *gin.Context) {
	id := c.Param("id")

	response, err := h.proxyService.GetAgentLogs(id)
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

	_, err := h.proxyService.StopAgent(id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to stop agent", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Message: fmt.Sprintf("Agent %s stopped", id)})
}

func (h *AgentOpsHandler) RestartAgent(c *gin.Context) {
	id := c.Param("id")

	_, err := h.proxyService.RestartAgent(id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to restart agent", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Message: fmt.Sprintf("Agent %s restarted", id)})
}

func (h *AgentOpsHandler) GetAgentMetrics(c *gin.Context) {
	response, err := h.proxyService.GetAgentMetrics()
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

	response, err := h.proxyService.GetAgentHistory(id)
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
	if limit == "" {
		limit = "50"
	}

	path := fmt.Sprintf("/agent-ops/audit?limit=%s", limit)
	if agentID != "" {
		path = fmt.Sprintf("%s&agent_id=%s", path, agentID)
	}

	response, err := h.proxyService.Forward("GET", path, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch audit logs", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

// ListLLMConfigs retrieves available LLM configurations
func (h *AgentOpsHandler) ListLLMConfigs(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/ml/models", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch LLM configs", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

// GetForecast retrieves cost and usage forecast for an agent
func (h *AgentOpsHandler) GetForecast(c *gin.Context) {
	id := c.Param("id")
	path := fmt.Sprintf("/agents/%s/forecast", id)

	response, err := h.proxyService.Forward("GET", path, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch forecast", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}
// ProxyToPython forwards generic requests to the Python backend
func (h *AgentOpsHandler) ProxyToPython(c *gin.Context) {
	// Strip /api/v1 prefix from the path
	path := c.Request.URL.Path
	if len(path) > 7 && path[:7] == "/api/v1" {
		path = path[7:]
	}

	// Remap specific /agent-ops paths to Python equivalents
	if len(path) > 10 && path[:10] == "/agent-ops" {
		if len(path) > 15 && path[10:16] == "/bulk/" {
			path = "/agents/bulk/" + path[16:]
		} else if len(path) > 11 && path[len(path)-9:] == "/optimize" {
			path = "/agents" + path[10:]
		} else if len(path) > 5 && path[len(path)-5:] == "/dump" {
			path = "/agents" + path[10:]
		} else if len(path) > 9 && path[len(path)-9:] == "/compress" {
			path = "/agents" + path[10:]
		} else if len(path) > 28 && path[10:29] == "/compliance/alerts/" {
			path = "/compliance/incidents/" + path[29:]
		} else if path == "/agent-ops/compliance/sox" || path == "/agent-ops/compliance/audit/sox" {
			path = "/compliance/audit/sox"
		} else if path == "/agent-ops/governance/healing/configs" {
			path = "/compliance/healing"
		} else if len(path) > 28 && path[10:29] == "/governance/healing/" {
			path = "/compliance/healing/" + path[29:]
		} else if path == "/agent-ops/governance/healing/events" {
			path = "/compliance/healing/events"
		} else if path == "/agent-ops/security/rotate-key" {
			path = "/security/rotate-key"
		} else if path == "/agent-ops/venture/insights" {
			path = "/venture/insights"
		} else if len(path) > 17 && path[10:18] == "/venture/" {
			path = "/venture" + path[10:]
		}
	}

	var body interface{}
	if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
		if err := c.ShouldBindJSON(&body); err != nil && err != io.EOF {
			// Ignore EOF if no body provided
		}
	}

	response, err := h.proxyService.Forward(c.Request.Method, path, body)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Backend proxy error", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}
func (h *AgentOpsHandler) RunForensics(c *gin.Context) {
	agentID := c.Query("agent_id")
	response, err := h.proxyService.RunForensics(agentID)
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

	response, err := h.proxyService.ProvisionClient(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Provisioning failed", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
