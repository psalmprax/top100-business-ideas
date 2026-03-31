package handlers

import (
	"fmt"
	"net/http"

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
	response, err := h.proxyService.Forward("GET", "/agents/alerts", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch rules", "details": err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *RulesHandler) CreateRule(c *gin.Context) {
	var body interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := h.proxyService.Forward("POST", "/agents/alerts", body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to create rule", "details": err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", response)
}

func (h *RulesHandler) UpdateRule(c *gin.Context) {
	id := c.Param("id")
	var body interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := h.proxyService.Forward("PUT", fmt.Sprintf("/agents/alerts/%s", id), body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to update rule", "details": err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *RulesHandler) DeleteRule(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward("DELETE", fmt.Sprintf("/agents/alerts/%s", id), nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to delete rule", "details": err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *RulesHandler) ToggleRule(c *gin.Context) {
	id := c.Param("id")
	var body interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := h.proxyService.Forward("PATCH", fmt.Sprintf("/agents/alerts/%s", id), body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to toggle rule", "details": err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
