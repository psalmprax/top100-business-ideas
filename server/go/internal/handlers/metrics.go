package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"
)

type MetricsHandler struct {
	proxyService *services.ProxyService
}

func NewMetricsHandler(ps *services.ProxyService) *MetricsHandler {
	return &MetricsHandler{
		proxyService: ps,
	}
}

func (h *MetricsHandler) GetCurrentMetrics(c *gin.Context) {
	resp, err := h.proxyService.GetAgentOpsMetrics()
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{
			Error:   "Metrics service unavailable",
			Details: err.Error(),
		})
		return
	}

	var metrics map[string]interface{}
	if err := json.Unmarshal(resp, &metrics); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to parse metrics response",
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, metrics)
}

func (h *MetricsHandler) GetMetricsHistory(c *gin.Context) {
	period := c.DefaultQuery("period", "24h")

	resp, err := h.proxyService.Forward("GET", "/agent-ops/metrics/history?period="+period, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{
			Error:   "Metrics history service unavailable",
			Details: err.Error(),
		})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}

func (h *MetricsHandler) GetAgentMetrics(c *gin.Context) {
	agentID := c.Param("id")

	resp, err := h.proxyService.Forward("GET", "/agents/"+agentID+"/history", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{
			Error:   "Agent metrics service unavailable",
			Details: err.Error(),
		})
		return
	}

	c.Data(http.StatusOK, "application/json", resp)
}
