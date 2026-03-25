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
