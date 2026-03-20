package handlers

import (
	"encoding/json"
	"fmt"
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
	if err != nil || len(response) == 0 || string(response) == "[]" {
		// Fallback to demo agents when Python backend unavailable or returns empty
		demoAgents := []models.Agent{
			{ID: "agent-001", Name: "Data Processing Agent", Status: "running", Type: "data-processing", Config: "{}"},
			{ID: "agent-002", Name: "Customer Support Agent", Status: "running", Type: "customer-support", Config: "{}"},
			{ID: "agent-003", Name: "Content Generation Agent", Status: "stopped", Type: "content-generation", Config: "{}"},
			{ID: "agent-004", Name: "Analytics Agent", Status: "running", Type: "analytics", Config: "{}"},
		}
		c.JSON(http.StatusOK, demoAgents)
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
