package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

// File validation constants
const (
	MaxFileSize     = 50 * 1024 * 1024 // 50MB
	AllowedImageExt = ".jpg,.jpeg,.png,.bmp,.tiff,.webp"
	AllowedVideoExt = ".mp4,.avi,.mov,.wmv,.flv,.webm"
	AllowedAudioExt = ".mp3,.wav,.flac,.aac,.ogg,.m4a"
)

type DeepfakeHandler struct {
	proxyService     *services.ProxyService
	uploadHandler    *services.FileUploadHandler
	httpClient       *http.Client
	pythonServiceURL string
}

func NewDeepfakeHandler(proxyService *services.ProxyService, uploadHandler *services.FileUploadHandler) *DeepfakeHandler {
	return &DeepfakeHandler{
		proxyService:  proxyService,
		uploadHandler: uploadHandler,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		pythonServiceURL: "http://localhost:8000", // Python service URL
	}
}

// validateFile performs comprehensive file validation
func (h *DeepfakeHandler) validateFile(file *multipart.FileHeader, mediaType string) error {
	// Check file size
	if file.Size > MaxFileSize {
		return fmt.Errorf("file size exceeds maximum allowed size of %d MB", MaxFileSize/(1024*1024))
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	var allowedExt string
	switch mediaType {
	case "image":
		allowedExt = AllowedImageExt
	case "video":
		allowedExt = AllowedVideoExt
	case "audio":
		allowedExt = AllowedAudioExt
	default:
		return fmt.Errorf("unsupported media type: %s", mediaType)
	}

	if !strings.Contains(allowedExt, ext) {
		return fmt.Errorf("file extension %s not allowed for %s files. Allowed: %s", ext, mediaType, allowedExt)
	}

	// Basic content validation by reading file header
	f, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open file for validation: %w", err)
	}
	defer f.Close()

	header := make([]byte, 512)
	n, err := f.Read(header)
	if err != nil && err != io.EOF {
		return fmt.Errorf("failed to read file header: %w", err)
	}

	contentType := http.DetectContentType(header[:n])
	expectedTypes := map[string][]string{
		"image": {"image/jpeg", "image/png", "image/bmp", "image/tiff", "image/webp"},
		"video": {"video/mp4", "video/avi", "video/quicktime", "video/x-ms-wmv", "video/webm"},
		"audio": {"audio/mpeg", "audio/wav", "audio/flac", "audio/aac", "audio/ogg"},
	}

	if allowedTypes, ok := expectedTypes[mediaType]; ok {
		valid := false
		for _, allowedType := range allowedTypes {
			if strings.HasPrefix(contentType, allowedType) {
				valid = true
				break
			}
		}
		if !valid {
			return fmt.Errorf("file content type %s does not match expected %s types", contentType, mediaType)
		}
	}

	return nil
}

// callPythonService makes HTTP call to Python deepfake detection service
func (h *DeepfakeHandler) callPythonService(mediaURL, mediaType string) (*models.DeepfakeAnalysis, error) {
	requestBody := map[string]interface{}{
		"media_url":  mediaURL,
		"media_type": mediaType,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", h.pythonServiceURL+"/api/v1/deepfake/analyze", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := h.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call Python service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Python service returned status %d", resp.StatusCode)
	}

	var analysis models.DeepfakeAnalysis
	if err := json.NewDecoder(resp.Body).Decode(&analysis); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &analysis, nil
}

func (h *DeepfakeHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "No file uploaded"})
		return
	}

	// Get media type from form data
	mediaType := c.PostForm("media_type")
	if mediaType == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "media_type is required"})
		return
	}

	// Validate file
	if err := h.validateFile(file, mediaType); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "File validation failed",
			Details: err.Error(),
		})
		return
	}

	result, err := h.uploadHandler.UploadFile(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to save file", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":       "/api/v1" + result.URL,
		"filename":  file.Filename,
		"size":      file.Size,
		"validated": true,
	})
}

func (h *DeepfakeHandler) Analyze(c *gin.Context) {
	var req models.AnalyzeDeepfakeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	// Perform actual detection by calling Python service
	analysis, err := h.callPythonService(req.MediaURL, req.MediaType)
	if err != nil {
		// Fallback to proxy service if Python service is unavailable
		response, proxyErr := h.proxyService.AnalyzeDeepfake(req)
		if proxyErr != nil {
			c.JSON(http.StatusBadGateway, models.ErrorResponse{
				Error:   "Failed to analyze media",
				Details: fmt.Sprintf("Python service error: %v, Proxy error: %v", err, proxyErr),
			})
			return
		}

		if err := json.Unmarshal(response, analysis); err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
			return
		}
	}

	// Set analysis timestamp
	analysis.AnalysisAt = time.Now()
	analysis.CreatedAt = time.Now()

	c.JSON(http.StatusAccepted, analysis)
}

func (h *DeepfakeHandler) ListAnalyses(c *gin.Context) {
	response, err := h.proxyService.ListDeepfakeAnalyses()
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch analyses", Details: err.Error()})
		return
	}

	var analyses []models.DeepfakeAnalysis
	if err := json.Unmarshal(response, &analyses); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, analyses)
}

func (h *DeepfakeHandler) GetAnalysis(c *gin.Context) {
	id := c.Param("id")

	response, err := h.proxyService.GetDeepfakeAnalysis(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Analysis not found"})
		return
	}

	var analysis models.DeepfakeAnalysis
	if err := json.Unmarshal(response, &analysis); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, analysis)
}

func (h *DeepfakeHandler) GetStats(c *gin.Context) {
	response, err := h.proxyService.GetDeepfakeStats()
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch stats", Details: err.Error()})
		return
	}

	var stats map[string]interface{}
	if err := json.Unmarshal(response, &stats); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *DeepfakeHandler) CreateChallenge(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "user_id is required"})
		return
	}

	response, err := h.proxyService.CreateDeepfakeChallenge(userID)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to create challenge", Details: err.Error()})
		return
	}

	var challenge models.HardwareChallenge
	if err := json.Unmarshal(response, &challenge); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusCreated, challenge)
}

func (h *DeepfakeHandler) VerifyAuthSignature(c *gin.Context) {
	challengeID := c.Query("challenge_id")
	signature := c.Query("signature")
	hardwareID := c.Query("hardware_id")

	if challengeID == "" || signature == "" || hardwareID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "challenge_id, signature, and hardware_id are required"})
		return
	}

	response, err := h.proxyService.VerifyDeepfakeSignature(challengeID, signature, hardwareID)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to verify signature", Details: err.Error()})
		return
	}

	var sig models.BiometricSignature
	if err := json.Unmarshal(response, &sig); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, sig)
}

func (h *DeepfakeHandler) AnalyzeEnterprise(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	response, err := h.proxyService.Forward("POST", "/deepfake/analyze/enterprise", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to analyze enterprise deepfake", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

func (h *DeepfakeHandler) ListDetectors(c *gin.Context) {
	response, err := h.proxyService.ListDeepfakeDetectors()
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch detectors", Details: err.Error()})
		return
	}

	var result interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *DeepfakeHandler) GetDuressConfig(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "user_id is required"})
		return
	}

	response, err := h.proxyService.Forward("GET", "/deepfake/duress/config/"+userID, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to fetch duress config", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}

func (h *DeepfakeHandler) UpdateDuressConfig(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}

	response, err := h.proxyService.Forward("POST", "/deepfake/duress/config", req)
	if err != nil {
		c.JSON(http.StatusBadGateway, models.ErrorResponse{Error: "Failed to update duress config", Details: err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", response)
}
