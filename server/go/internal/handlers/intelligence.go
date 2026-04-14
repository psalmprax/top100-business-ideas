package handlers

import (
	"net/http"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type IntelligenceHandler struct {
	proxyService *services.ProxyService
}

func NewIntelligenceHandler(proxyService *services.ProxyService) *IntelligenceHandler {
	return &IntelligenceHandler{
		proxyService: proxyService,
	}
}

func (h *IntelligenceHandler) HermesChat(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward("POST", "/intelligence/hermes/chat", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to chat with Hermes", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *IntelligenceHandler) HermesAnalyze(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward("POST", "/intelligence/hermes/analyze", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to analyze with Hermes", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *IntelligenceHandler) HermesSuggestFix(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward("POST", "/intelligence/hermes/suggest-fix", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to get fix suggestion from Hermes", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *IntelligenceHandler) HermesValidateStrategy(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward("POST", "/intelligence/hermes/validate-strategy", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to validate strategy with Hermes", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *IntelligenceHandler) PaperclipResearch(c *gin.Context) {
	response, err := h.proxyService.Forward("GET", "/intelligence/paperclip/research", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to get paperclip research", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

func (h *IntelligenceHandler) PaperclipRun(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	response, err := h.proxyService.Forward("POST", "/intelligence/paperclip/run", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to run paperclip research", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
