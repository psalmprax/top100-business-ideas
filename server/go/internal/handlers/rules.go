package handlers

import (
	"net/http"
	"time"

	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type RulesHandler struct {
	proxyService *services.ProxyService
}

func NewRulesHandler(proxyService *services.ProxyService) *RulesHandler {
	return &RulesHandler{
		proxyService: proxyService,
	}
}

func (h *RulesHandler) ListRules(c *gin.Context) {
	// Return mock rules for demo
	rules := []gin.H{
		{
			"id":      "1",
			"name":    "Loop Prevention",
			"type":    "loop_prevention",
			"enabled": true,
			"config":  gin.H{"maxIterations": 10, "semanticCheck": true},
		},
		{
			"id":      "2",
			"name":    "Semantic Cost Cap",
			"type":    "semantic_cost_cap",
			"enabled": true,
			"config":  gin.H{"maxSpend": 50, "preserveState": true},
		},
		{
			"id":      "3",
			"name":    "Memory Optimization",
			"type":    "memory_optimization",
			"enabled": true,
			"config":  gin.H{"compressThreshold": 0.7},
		},
	}
	c.JSON(http.StatusOK, rules)
}

func (h *RulesHandler) CreateRule(c *gin.Context) {
	var req struct {
		Name   string `json:"name"`
		Type   string `json:"type"`
		Config string `json:"config"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	rule := gin.H{
		"id":         "new-" + time.Now().Format("20060102150405"),
		"name":       req.Name,
		"type":       req.Type,
		"enabled":    true,
		"config":     req.Config,
		"created_at": time.Now(),
	}

	c.JSON(http.StatusCreated, rule)
}

func (h *RulesHandler) UpdateRule(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name    string `json:"name"`
		Type    string `json:"type"`
		Config  string `json:"config"`
		Enabled bool   `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	rule := gin.H{
		"id":      id,
		"name":    req.Name,
		"type":    req.Type,
		"enabled": req.Enabled,
		"config":  req.Config,
	}

	c.JSON(http.StatusOK, rule)
}

func (h *RulesHandler) DeleteRule(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Rule deleted"})
}

func (h *RulesHandler) ToggleRule(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Enabled bool `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      id,
		"enabled": req.Enabled,
	})
}
