package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type ComplianceHandler struct {
	proxyService  *services.ProxyService
	uploadHandler *services.FileUploadHandler
}

func NewComplianceHandler(proxyService *services.ProxyService, uploadHandler *services.FileUploadHandler) *ComplianceHandler {
	return &ComplianceHandler{
		proxyService:  proxyService,
		uploadHandler: uploadHandler,
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
	modelID := c.Query("model_id")
	reportType := c.Query("report_type")

	path := "/compliance/reports/export"
	if modelID != "" {
		path = fmt.Sprintf("%s?model_id=%s", path, modelID)
		if reportType != "" {
			path = fmt.Sprintf("%s&report_type=%s", path, reportType)
		}
	} else if reportType != "" {
		path = fmt.Sprintf("%s?report_type=%s", path, reportType)
	}

	response, err := h.proxyService.Forward("GET", path, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to export report", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) ListArtifacts(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/artifacts", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch artifacts", Details: err.Error()})
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

func (h *ComplianceHandler) UploadArtifact(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "No file uploaded"})
		return
	}

	result, err := h.uploadHandler.UploadFile(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to upload file", Details: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *ComplianceHandler) GetROIMetrics(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/roi", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch ROI metrics", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetVelocityTrends(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/velocity", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch velocity trends", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetDeadlines(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/deadlines", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch compliance deadlines", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetEnterpriseAudits(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/enterprise-audits", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch enterprise audits", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetModelBreakdown(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward("GET", fmt.Sprintf("/compliance/models/%s/breakdown", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch model breakdown", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetModelAudits(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward("GET", fmt.Sprintf("/compliance/models/%s/audits", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch model audits", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetModelHandshakes(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward("GET", fmt.Sprintf("/compliance/models/%s/handshakes", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch model handshakes", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
func (h *ComplianceHandler) GetRegionalReports(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/regional-reports", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch regional reports", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *ComplianceHandler) GetFinancialMetrics(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/compliance/financial-metrics", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch financial metrics", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// ListAuditLogs proxies to agent-ops audit logs
func (h *ComplianceHandler) ListAuditLogs(c *gin.Context) {
	agentID := c.Query("agentId")
	limit := c.Query("limit")
	search := c.Query("search")
	outcome := c.Query("outcome")

	if limit == "" {
		limit = "50"
	}

	path := fmt.Sprintf("/agent-ops/audit?limit=%s", limit)
	if agentID != "" {
		path = fmt.Sprintf("%s&agent_id=%s", path, agentID)
	}
	if search != "" {
		path = fmt.Sprintf("%s&search=%s", path, search)
	}
	if outcome != "" {
		path = fmt.Sprintf("%s&outcome=%s", path, outcome)
	}

	response, err := h.proxyService.Forward("GET", path, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch audit logs", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

// UpdateIncidentStatus updates status of a compliance incident
func (h *ComplianceHandler) UpdateIncidentStatus(c *gin.Context) {
	id := c.Param("id")
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	// Map to Python's alert resolution path remapped in agent_ops.go
	path := fmt.Sprintf("/agent-ops/compliance/alerts/%s/resolve", id)
	response, err := h.proxyService.Forward("PATCH", path, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update incident status", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

// DeleteVendor deletes a vendor via Python proxy
func (h *ComplianceHandler) DeleteVendor(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward("DELETE", fmt.Sprintf("/vendors/%s", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete vendor", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
