package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/services"
)

type MLHandler struct {
	proxyService *services.ProxyService
}

func NewMLHandler(proxyService *services.ProxyService) *MLHandler {
	return &MLHandler{
		proxyService: proxyService,
	}
}

func (h *MLHandler) ProxyML(c *gin.Context) {
	// 1. Get request body
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// 2. Proxied path
	path := "/ml/infer" // Match the Python endpoint. In reality this might be dynamic.

	// 3. Use ProxyService for resilience (Circuit Breaker, Retries, Timeout, Trace propagation)
	status, response, err := h.proxyService.ForwardWithStatus(c, http.MethodPost, path, body, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": fmt.Sprintf("ML service unavailable: %v", err)})
		return
	}

	// 4. Propagate response
	// Attempt to unmarshal as JSON to return structured response
	var jsonResponse interface{}
	if err := json.Unmarshal(response, &jsonResponse); err == nil {
		c.JSON(status, jsonResponse)
	} else {
		// Fallback for non-JSON or raw binary responses (unlikely for /infer but good for safety)
		c.Data(status, "application/json", response)
	}
}

func (h *MLHandler) Infer(c *gin.Context) {
	h.ProxyML(c)
}

func (h *MLHandler) ListModels(c *gin.Context) {
	h.ProxyML(c)
}

func (h *MLHandler) ClassifyAgentOperation(c *gin.Context) {
	h.ProxyML(c)
}

func (h *MLHandler) CheckCompliance(c *gin.Context) {
	h.ProxyML(c)
}

func (h *MLHandler) DetectDeepfake(c *gin.Context) {
	h.ProxyML(c)
}
