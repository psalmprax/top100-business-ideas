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
	response, err := h.proxyService.Forward("GET", "/compliance/categories", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch categories", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ExportReport(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/reports/export", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to export report", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ListModels(c *gin.Context) {
	response, err := h.proxyService.ListComplianceModels()
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch compliance models", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) RegisterModel(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}
	response, err := h.proxyService.RegisterComplianceModel(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to register model", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", response)
}

func (h *ComplianceHandler) UpdateGuardrails(c *gin.Context) {
	id := c.Param("id")
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}
	response, err := h.proxyService.UpdateComplianceGuardrails(id, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to update guardrails", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetBiasReports(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.GetBiasReports(id)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch bias reports", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) TriggerBiasScan(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}
	response, err := h.proxyService.TriggerBiasScan(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to trigger bias scan", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
