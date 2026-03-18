package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type ComplianceHandler struct {
	proxyService *services.ProxyService
}

func NewComplianceHandler(proxyService *services.ProxyService) *ComplianceHandler {
	return &ComplianceHandler{
		proxyService: proxyService,
	}
}

func (h *ComplianceHandler) ListChecks(c *gin.Context) {
	response, err := h.proxyService.ListComplianceChecks()
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance checks", Details: err.Error()})
		return
	}

	var checks []models.ComplianceCheck
	if err := json.Unmarshal(response, &checks); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, checks)
}

func (h *ComplianceHandler) GetCheck(c *gin.Context) {
	id := c.Param("id")

	response, err := h.proxyService.GetComplianceCheck(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Compliance check not found"})
		return
	}

	var check models.ComplianceCheck
	if err := json.Unmarshal(response, &check); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, check)
}

func (h *ComplianceHandler) RunCheck(c *gin.Context) {
	var req models.RunComplianceCheckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	response, err := h.proxyService.RunComplianceCheck(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to run compliance check", Details: err.Error()})
		return
	}

	var check models.ComplianceCheck
	if err := json.Unmarshal(response, &check); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusAccepted, check)
}

func (h *ComplianceHandler) GetCategories(c *gin.Context) {
	// Return predefined AI Act categories
	categories := []models.ComplianceCategory{
		{
			ID:          "unacceptable",
			Name:        "Unacceptable Risk",
			Color:       "red",
			Description: "Banned AI systems that pose unacceptable risk to people",
		},
		{
			ID:          "high",
			Name:        "High Risk",
			Color:       "orange",
			Description: "AI systems that pose high risk to fundamental rights",
		},
		{
			ID:          "limited",
			Name:        "Limited Risk",
			Color:       "yellow",
			Description: "AI systems with limited transparency obligations",
		},
		{
			ID:          "minimal",
			Name:        "Minimal Risk",
			Color:       "green",
			Description: "Low-risk AI systems with minimal requirements",
		},
	}

	c.JSON(http.StatusOK, categories)
}

func (h *ComplianceHandler) ExportReport(c *gin.Context) {
	// TODO: Generate and export compliance report
	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Report export initiated",
		Data: map[string]interface{}{
			"download_url": "/api/v1/compliance/reports/download/report-123.pdf",
		},
	})
}
