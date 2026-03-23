package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type EnterpriseHandler struct {
	proxyService *services.ProxyService
}

func NewEnterpriseHandler(proxyService *services.ProxyService) *EnterpriseHandler {
	return &EnterpriseHandler{
		proxyService: proxyService,
	}
}

func (h *EnterpriseHandler) GetPartnerConfig(c *gin.Context) {
	response, err := h.proxyService.GetPartnerConfig()
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch partner config", Details: err.Error()})
		return
	}

	var result interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *EnterpriseHandler) UpdateSlaTier(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	response, err := h.proxyService.UpdateSlaTier(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to update SLA tier", Details: err.Error()})
		return
	}

	var result interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, result)
}
