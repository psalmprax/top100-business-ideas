package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type MetricsHandler struct {
	startTime time.Time
}

func NewMetricsHandler() *MetricsHandler {
	return &MetricsHandler{
		startTime: time.Now(),
	}
}

func (h *MetricsHandler) GetCurrentMetrics(c *gin.Context) {
	metrics := gin.H{
		"total_tokens":    2450000,
		"total_cost":      127.50,
		"active_agents":   4,
		"tasks_completed": 1247,
		"tasks_failed":    23,
		"uptime":          99.9,
		"hourly_data": []gin.H{
			{"hour": "00:00", "tokens": 45000, "cost": 2.25},
			{"hour": "01:00", "tokens": 38000, "cost": 1.90},
			{"hour": "02:00", "tokens": 32000, "cost": 1.60},
			{"hour": "03:00", "tokens": 28000, "cost": 1.40},
			{"hour": "04:00", "tokens": 25000, "cost": 1.25},
			{"hour": "05:00", "tokens": 30000, "cost": 1.50},
			{"hour": "06:00", "tokens": 52000, "cost": 2.60},
			{"hour": "07:00", "tokens": 78000, "cost": 3.90},
			{"hour": "08:00", "tokens": 95000, "cost": 4.75},
			{"hour": "09:00", "tokens": 112000, "cost": 5.60},
			{"hour": "10:00", "tokens": 125000, "cost": 6.25},
			{"hour": "11:00", "tokens": 118000, "cost": 5.90},
			{"hour": "12:00", "tokens": 105000, "cost": 5.25},
			{"hour": "13:00", "tokens": 98000, "cost": 4.90},
			{"hour": "14:00", "tokens": 115000, "cost": 5.75},
			{"hour": "15:00", "tokens": 132000, "cost": 6.60},
			{"hour": "16:00", "tokens": 128000, "cost": 6.40},
			{"hour": "17:00", "tokens": 95000, "cost": 4.75},
			{"hour": "18:00", "tokens": 72000, "cost": 3.60},
			{"hour": "19:00", "tokens": 68000, "cost": 3.40},
			{"hour": "20:00", "tokens": 62000, "cost": 3.10},
			{"hour": "21:00", "tokens": 55000, "cost": 2.75},
			{"hour": "22:00", "tokens": 48000, "cost": 2.40},
			{"hour": "23:00", "tokens": 42000, "cost": 2.10},
		},
	}
	c.JSON(http.StatusOK, metrics)
}

func (h *MetricsHandler) GetMetricsHistory(c *gin.Context) {
	period := c.DefaultQuery("period", "24h")

	metrics := gin.H{
		"period":          period,
		"total_tokens":    2450000,
		"total_cost":      127.50,
		"avg_daily_cost":  5.31,
		"projected_month": 159.30,
	}
	c.JSON(http.StatusOK, metrics)
}

func (h *MetricsHandler) GetAgentMetrics(c *gin.Context) {
	agentID := c.Param("id")

	metrics := gin.H{
		"agent_id":       agentID,
		"total_tokens":   612500,
		"total_cost":     30.62,
		"tasks_total":    312,
		"tasks_complete": 298,
		"tasks_failed":   14,
		"success_rate":   95.5,
		"avg_latency_ms": 1250,
	}
	c.JSON(http.StatusOK, metrics)
}
