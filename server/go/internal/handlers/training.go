package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
)

// TrainingHandler handles training module operations for AI Compliance
type TrainingHandler struct{}

func NewTrainingHandler() *TrainingHandler {
	return &TrainingHandler{}
}

// ListModules returns all training modules
// GET /api/v1/training/modules
func (h *TrainingHandler) ListModules(c *gin.Context) {
	modules := []models.TrainingModule{
		{
			ID:          "mod-001",
			Title:       "Introduction to EU AI Act",
			Description: "Learn the fundamentals of the EU AI Act and its requirements",
			Category:    "fundamentals",
			Duration:    30,
			Status:      "published",
			Modules:     5,
			CreatedAt:   time.Now().Add(-30 * 24 * time.Hour),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "mod-002",
			Title:       "High-Risk AI Systems Compliance",
			Description: "Understand requirements for high-risk AI systems under Annex III",
			Category:    "compliance",
			Duration:    60,
			Status:      "published",
			Modules:     8,
			CreatedAt:   time.Now().Add(-20 * 24 * time.Hour),
			UpdatedAt:   time.Now().Add(-2 * 24 * time.Hour),
		},
		{
			ID:          "mod-003",
			Title:       "Technical Documentation Best Practices",
			Description: "How to create Article 11 compliant technical documentation",
			Category:    "documentation",
			Duration:    45,
			Status:      "published",
			Modules:     6,
			CreatedAt:   time.Now().Add(-10 * 24 * time.Hour),
			UpdatedAt:   time.Now().Add(-5 * 24 * time.Hour),
		},
		{
			ID:          "mod-004",
			Title:       "Data Governance & Bias Detection",
			Description: "Identifying and mitigating bias in training data",
			Category:    "data",
			Duration:    50,
			Status:      "published",
			Modules:     7,
			CreatedAt:   time.Now().Add(-5 * 24 * time.Hour),
			UpdatedAt:   time.Now().Add(-1 * 24 * time.Hour),
		},
		{
			ID:          "mod-005",
			Title:       "Post-Market Monitoring",
			Description: "Article 61 requirements for ongoing compliance",
			Category:    "monitoring",
			Duration:    40,
			Status:      "draft",
			Modules:     5,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}
	c.JSON(http.StatusOK, modules)
}

// GetModule returns a single training module
// GET /api/v1/training/modules/:id
func (h *TrainingHandler) GetModule(c *gin.Context) {
	id := c.Param("id")
	module := models.TrainingModule{
		ID:          id,
		Title:       "Introduction to EU AI Act",
		Description: "Learn the fundamentals of the EU AI Act and its requirements",
		Category:    "fundamentals",
		Duration:    30,
		Status:      "published",
		Modules:     5,
		Content: []models.ModuleContent{
			{ModuleID: 1, Title: "What is the AI Act?", Type: "video", Duration: 10},
			{ModuleID: 2, Title: "Risk Categories", Type: "text", Duration: 5},
			{ModuleID: 3, Title: "Prohibited Practices", Type: "video", Duration: 8},
			{ModuleID: 4, Title: "Your Obligations", Type: "quiz", Duration: 5},
			{ModuleID: 5, Title: "Assessment", Type: "quiz", Duration: 2},
		},
		CreatedAt: time.Now().Add(-30 * 24 * time.Hour),
		UpdatedAt: time.Now(),
	}
	c.JSON(http.StatusOK, module)
}

// CreateModule creates a new training module
// POST /api/v1/training/modules
func (h *TrainingHandler) CreateModule(c *gin.Context) {
	var req models.TrainingModule
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	req.ID = "mod-" + generateID()
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()
	c.JSON(http.StatusCreated, req)
}

// UpdateProgress updates user training progress
// POST /api/v1/training/progress
func (h *TrainingHandler) UpdateProgress(c *gin.Context) {
	var req models.TrainingProgress
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	req.ID = "prog-" + generateID()
	req.StartedAt = time.Now()
	req.LastAccessedAt = time.Now()
	c.JSON(http.StatusOK, req)
}

// GetUserProgress returns user's training progress
// GET /api/v1/training/progress/:userId
func (h *TrainingHandler) GetUserProgress(c *gin.Context) {
	userID := c.Param("userId")
	progress := []models.TrainingProgress{
		{
			ID:             "prog-001",
			UserID:         userID,
			ModuleID:       "mod-001",
			Status:         "completed",
			Score:          95,
			TimeSpent:      35,
			CompletedAt:    &[]time.Time{time.Now().Add(-2 * 24 * time.Hour)}[0],
			LastAccessedAt: time.Now().Add(-2 * 24 * time.Hour),
		},
		{
			ID:             "prog-002",
			UserID:         userID,
			ModuleID:       "mod-002",
			Status:         "in_progress",
			Score:          0,
			TimeSpent:      25,
			LastAccessedAt: time.Now(),
		},
		{
			ID:             "prog-003",
			UserID:         userID,
			ModuleID:       "mod-003",
			Status:         "not_started",
			Score:          0,
			TimeSpent:      0,
			LastAccessedAt: time.Now(),
		},
	}
	c.JSON(http.StatusOK, progress)
}

// GetTrainingStats returns training statistics
// GET /api/v1/training/stats
func (h *TrainingHandler) GetTrainingStats(c *gin.Context) {
	stats := models.TrainingStats{
		TotalUsers:       150,
		ActiveUsers:      85,
		CompletedModules: 420,
		InProgress:       65,
		NotStarted:       95,
		AvgScore:         82,
		ByCategory: map[string]int{
			"fundamentals":  120,
			"compliance":    95,
			"documentation": 80,
			"data":          70,
			"monitoring":    55,
		},
	}
	c.JSON(http.StatusOK, stats)
}

// ShadowAIHandler handles Shadow AI detection for AI Compliance
type ShadowAIHandler struct{}

func NewShadowAIHandler() *ShadowAIHandler {
	return &ShadowAIHandler{}
}

// ListDetections returns Shadow AI detections
// GET /api/v1/shadow-ai/detections
func (h *ShadowAIHandler) ListDetections(c *gin.Context) {
	detections := []models.ShadowAIDetection{
		{
			ID:          "sa-001",
			ToolName:    "ChatGPT",
			Domain:      "chat.openai.com",
			UserEmail:   "john.doe@company.com",
			RiskLevel:   "high",
			Status:      "detected",
			Category:    "unauthorized_llm",
			UsageCount:  45,
			FirstSeen:   time.Now().Add(-7 * 24 * time.Hour),
			LastSeen:    time.Now().Add(-1 * time.Hour),
			Description: "Employee using free ChatGPT to process customer data",
		},
		{
			ID:          "sa-002",
			ToolName:    "Claude",
			Domain:      "claude.ai",
			UserEmail:   "jane.smith@company.com",
			RiskLevel:   "medium",
			Status:      "investigating",
			Category:    "unauthorized_llm",
			UsageCount:  12,
			FirstSeen:   time.Now().Add(-3 * 24 * time.Hour),
			LastSeen:    time.Now().Add(-4 * time.Hour),
			Description: "Marketing team testing Claude for content generation",
		},
		{
			ID:          "sa-003",
			ToolName:    "Midjourney",
			Domain:      "discord.com",
			UserEmail:   "design@company.com",
			RiskLevel:   "low",
			Status:      "approved",
			Category:    "unauthorized_image",
			UsageCount:  28,
			FirstSeen:   time.Now().Add(-14 * 24 * time.Hour),
			LastSeen:    time.Now().Add(-2 * 24 * time.Hour),
			Description: "Design team using Midjourney for mockups - pending approval",
		},
		{
			ID:          "sa-004",
			ToolName:    "GitHub Copilot",
			Domain:      "github.com",
			UserEmail:   "dev@company.com",
			RiskLevel:   "low",
			Status:      "approved",
			Category:    "approved_tool",
			UsageCount:  150,
			FirstSeen:   time.Now().Add(-60 * 24 * time.Hour),
			LastSeen:    time.Now(),
			Description: "Developer using approved Copilot for code assistance",
		},
		{
			ID:          "sa-005",
			ToolName:    "Perplexity",
			Domain:      "perplexity.ai",
			UserEmail:   "research@company.com",
			RiskLevel:   "high",
			Status:      "blocked",
			Category:    "unauthorized_llm",
			UsageCount:  8,
			FirstSeen:   time.Now().Add(-2 * 24 * time.Hour),
			LastSeen:    time.Now().Add(-12 * time.Hour),
			Description: "Research team using Perplexity for competitive analysis",
		},
	}
	c.JSON(http.StatusOK, detections)
}

// RemediateDetection remediates a Shadow AI detection
// PUT /api/v1/shadow-ai/detections/:id/remediate
func (h *ShadowAIHandler) RemediateDetection(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Action string `json:"action"` // block, approve, investigate
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}
	detection := models.ShadowAIDetection{
		ID:           id,
		ToolName:     "ChatGPT",
		Status:       req.Action,
		RemediatedAt: &[]time.Time{time.Now()}[0],
	}
	c.JSON(http.StatusOK, detection)
}

// GetShadowAIStats returns Shadow AI detection statistics
// GET /api/v1/shadow-ai/stats
func (h *ShadowAIHandler) GetShadowAIStats(c *gin.Context) {
	stats := models.ShadowAIStats{
		TotalDetections: 156,
		HighRisk:        12,
		MediumRisk:      28,
		LowRisk:         45,
		Approved:        71,
		Blocked:         8,
		ByCategory: map[string]int{
			"unauthorized_llm":   85,
			"unauthorized_image": 42,
			"approved_tool":      29,
		},
		ByStatus: map[string]int{
			"detected":      35,
			"investigating": 28,
			"approved":      71,
			"blocked":       22,
		},
	}
	c.JSON(http.StatusOK, stats)
}
