package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type InsightOrchestrator struct {
	proxyService *services.ProxyService
}

func NewInsightOrchestrator(proxyService *services.ProxyService) *InsightOrchestrator {
	return &InsightOrchestrator{
		proxyService: proxyService,
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// AggregateAgentMetrics fetches and aggregates metrics from Python backend
// Applies business logic: calculates trends, identifies anomalies, derives insights
func (h *InsightOrchestrator) AggregateAgentMetrics(c *gin.Context) {
	response, err := h.proxyService.GetAgentMetrics(c)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch agent metrics", Details: err.Error()})
		return
	}

	var rawMetrics map[string]interface{}
	if err := json.Unmarshal(response, &rawMetrics); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse metrics"})
		return
	}

	aggregated := h.processMetrics(rawMetrics)
	c.JSON(http.StatusOK, aggregated)
}

func (h *InsightOrchestrator) processMetrics(raw map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	for k, v := range raw {
		result[k] = v
	}

	totalAgents := 0
	if ta, ok := raw["total_agents"].(float64); ok {
		totalAgents = int(ta)
	}

	running := 0
	if r, ok := raw["running"].(float64); ok {
		running = int(r)
	}

	if totalAgents > 0 {
		healthScore := float64(running) / float64(totalAgents) * 100
		result["health_score"] = healthScore

		if healthScore >= 80 {
			result["health_status"] = "healthy"
		} else if healthScore >= 50 {
			result["health_status"] = "degraded"
		} else {
			result["health_status"] = "critical"
		}
	}

	totalCost := 0.0
	if tc, ok := raw["total_cost"].(float64); ok {
		totalCost = tc
	}
	result["daily_burn_rate"] = totalCost
	result["cost_per_agent"] = totalCost / float64(max(totalAgents, 1))

	totalRequests := 0.0
	if tr, ok := raw["total_requests"].(float64); ok {
		totalRequests = tr
	}

	if totalAgents > 0 && totalCost > 0 {
		requestsPerDollar := totalRequests / totalCost
		result["efficiency"] = requestsPerDollar
	}

	result["aggregated_at"] = time.Now().UTC().Format(time.RFC3339)
	result["source"] = "go-aggregator"

	return result
}

func (h *InsightOrchestrator) GetTopAgents(c *gin.Context) {
	sortBy := c.DefaultQuery("sort", "cost")
	limit := c.DefaultQuery("limit", "10")

	limitInt, _ := strconv.Atoi(limit)

	response, err := h.proxyService.ListAgents(c)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch agents", Details: err.Error()})
		return
	}

	var agents []models.Agent
	if err := json.Unmarshal(response, &agents); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse agents"})
		return
	}

	switch sortBy {
	case "cost":
		sort.Slice(agents, func(i, j int) bool {
			if agents[i].Metrics == nil || agents[j].Metrics == nil {
				return false
			}
			return agents[i].Metrics.TasksTotal > agents[j].Metrics.TasksTotal
		})
	case "requests":
		sort.Slice(agents, func(i, j int) bool {
			if agents[i].Metrics == nil || agents[j].Metrics == nil {
				return false
			}
			return agents[i].Metrics.TasksTotal > agents[j].Metrics.TasksTotal
		})
	case "errors":
		sort.Slice(agents, func(i, j int) bool {
			if agents[i].Metrics == nil || agents[j].Metrics == nil {
				return false
			}
			return agents[i].Metrics.TasksFailed > agents[j].Metrics.TasksFailed
		})
	}

	if len(agents) > limitInt {
		agents = agents[:limitInt]
	}

	c.JSON(http.StatusOK, gin.H{
		"agents":  agents,
		"sort_by": sortBy,
		"limit":   limitInt,
	})
}

func (h *InsightOrchestrator) AnomalyDetection(c *gin.Context) {
	response, err := h.proxyService.GetAgentMetrics(c)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch metrics", Details: err.Error()})
		return
	}

	var raw map[string]interface{}
	if err := json.Unmarshal(response, &raw); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse metrics"})
		return
	}

	anomalies := []map[string]interface{}{}

	if errRate, ok := raw["error"].(float64); ok {
		if errRate > 10 {
			anomalies = append(anomalies, map[string]interface{}{
				"type":      "high_error_rate",
				"severity":  "high",
				"value":     errRate,
				"threshold": 10,
				"message":   fmt.Sprintf("Error count %d exceeds threshold", int(errRate)),
			})
		}
	}

	if mem, ok := raw["avg_memory_usage"].(float64); ok {
		if mem > 90 {
			anomalies = append(anomalies, map[string]interface{}{
				"type":     "high_memory",
				"severity": "medium",
				"value":    mem,
				"message":  fmt.Sprintf("Memory usage %.1f%% exceeds threshold", mem),
			})
		}
	}

	running := 0
	if r, ok := raw["running"].(float64); ok {
		running = int(r)
	}

	totalAgents := 0
	if ta, ok := raw["total_agents"].(float64); ok {
		totalAgents = int(ta)
	}

	if running > 0 && totalAgents > running {
		idleCount := totalAgents - running
		anomalies = append(anomalies, map[string]interface{}{
			"type":     "idle_agents",
			"severity": "low",
			"value":    idleCount,
			"message":  fmt.Sprintf("%d agents are running but idle", idleCount),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"anomalies":     anomalies,
		"analyzed_at":   time.Now().UTC().Format(time.RFC3339),
		"total_agents":  totalAgents,
		"anomaly_count": len(anomalies),
	})
}
