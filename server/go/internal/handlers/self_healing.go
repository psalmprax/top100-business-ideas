package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"
)

// SelfHealingHandler handles self-healing operations
type SelfHealingHandler struct {
	proxy *services.ProxyService
}

func NewSelfHealingHandler(proxy *services.ProxyService) *SelfHealingHandler {
	return &SelfHealingHandler{proxy: proxy}
}

func (h *SelfHealingHandler) GetEvents(c *gin.Context) {
	response, err := h.proxy.Forward(c, "GET", "/self-healing/healing/events", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch healing events", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *SelfHealingHandler) TriggerRecovery(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid recovery request"})
		return
	}

	response, err := h.proxy.Forward(c, "POST", "/self-healing/healing/recover", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to trigger recovery", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *SelfHealingHandler) GetHealingStatus(c *gin.Context) {
	response, err := h.proxy.Forward(c, "GET", "/self-healing/healing/status", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch healing status", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *SelfHealingHandler) GetStats(c *gin.Context) {
	response, err := h.proxy.Forward(c, "GET", "/self-healing/healing/stats", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch healing stats", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
