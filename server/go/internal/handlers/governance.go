package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type GovernanceHandler struct {
	proxyService *services.ProxyService
}

func NewGovernanceHandler(proxyService *services.ProxyService) *GovernanceHandler {
	return &GovernanceHandler{
		proxyService: proxyService,
	}
}

func (h *GovernanceHandler) GetComplianceDashboard(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/compliance/dashboard", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance dashboard", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetComplianceArticles(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/articles", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance articles", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) AssessCompliance(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Model ID is required"})
		return
	}

	response, err := h.proxyService.Forward("POST", fmt.Sprintf("/compliance/assess/%s", id), nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to assess compliance", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetSLADashboard(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/sla/dashboard", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch SLA dashboard", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetSLAMetrics(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/sla/metrics", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch SLA metrics", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetPartners(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/partners", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch partners", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) SyncPartner(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Partner ID is required"})
		return
	}

	response, err := h.proxyService.Forward("POST", fmt.Sprintf("/governance/partners/%s/sync", id), nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to sync partner", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetUsageForecast(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/forecast/usage", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch usage forecast", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetROIAnalytics(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/analytics/roi", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch ROI analytics", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetLocalizationConfigs(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/localization/configs", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch localization configs", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetHealingConfigs(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/healing/configs", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch healing configs", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetStrategicInsights(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/insights/strategic", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch strategic insights", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetSettings(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/settings", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch settings", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) UpdateSetting(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Setting ID is required"})
		return
	}

	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward("PUT", fmt.Sprintf("/governance/settings/%s", id), req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to update setting", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) GetOnPremDeployments(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/governance/on-prem/deployments", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch on-prem deployments", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *GovernanceHandler) DeployOnPrem(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Deployment ID is required"})
		return
	}

	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward("POST", fmt.Sprintf("/governance/on-prem/deploy/%s", id), req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to deploy on-prem", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
