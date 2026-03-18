package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type MLHandler struct {
	PythonBackendURL string
}

func NewMLHandler(pythonBackendURL string) *MLHandler {
	return &MLHandler{
		PythonBackendURL: pythonBackendURL,
	}
}

func (h *MLHandler) ProxyML(c *gin.Context) {
	// Get the ML endpoint from the request path
	path := strings.TrimPrefix(c.Request.URL.Path, "/ml")

	// Forward request to Python backend
	url := h.PythonBackendURL + path

	// Read request body
	bodyBytes, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	// Forward the request
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(bodyBytes))
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to ML service"})
		return
	}
	defer resp.Body.Close()

	// Parse response
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to parse ML response"})
		return
	}

	c.JSON(http.StatusOK, result)
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
