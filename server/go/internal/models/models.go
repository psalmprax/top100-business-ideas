package models

import "time"

// User represents a registered user
type User struct {
	ID        string    `json:"id" db:"id"`
	Email     string    `json:"email" db:"email"`
	Name      string    `json:"name" db:"name"`
	Password  string    `json:"-" db:"password_hash"`
	Role              string    `json:"role" db:"role"`
	SubscriptionTier  string    `json:"subscription_tier" db:"subscription_tier"`
	SubscriptionStatus string    `json:"subscription_status" db:"subscription_status"`
	AllowedProducts   []string  `json:"allowed_products" db:"allowed_products"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// Agent represents an AI agent
type Agent struct {
	ID             string        `json:"id" db:"id"`
	Name           string        `json:"name" db:"name"`
	Type           string        `json:"type" db:"type"`
	Status         string        `json:"status" db:"status"` // running, stopped, error
	Environment    string        `json:"environment" db:"environment"`
	Provider       string        `json:"provider" db:"provider"`
	Model          string        `json:"model" db:"model"`
	OrgID          string        `json:"org_id" db:"org_id"`
	ControlWebhook string        `json:"control_webhook" db:"control_webhook"`
	APISecret      string        `json:"api_secret" db:"api_secret"`
	Config         string        `json:"config" db:"config"` // JSON string
	Metrics        *AgentMetrics `json:"metrics"`
	CreatedAt      time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at" db:"updated_at"`
}

// AgentMetrics represents agent performance metrics
type AgentMetrics struct {
	CPUUsage      float64   `json:"cpu_usage"`
	MemoryUsage   float64   `json:"memory_usage"`
	TasksTotal    int       `json:"tasks_total"`
	TasksComplete int       `json:"tasks_complete"`
	TasksFailed   int       `json:"tasks_failed"`
	Uptime        float64   `json:"uptime"` // seconds
	LastUpdated   time.Time `json:"last_updated"`
}

// AgentLog represents agent execution log
type AgentLog struct {
	ID        string    `json:"id" db:"id"`
	AgentID   string    `json:"agent_id" db:"agent_id"`
	Level     string    `json:"level" db:"level"` // info, warn, error
	Message   string    `json:"message" db:"message"`
	Timestamp time.Time `json:"timestamp" db:"timestamp"`
}

// ComplianceCheck represents an AI Act compliance check
type ComplianceCheck struct {
	ID        string    `json:"id" db:"id"`
	Type      string    `json:"type" db:"type"`     // ai_act, privacy, security
	Status    string    `json:"status" db:"status"` // passed, failed, pending, review
	Score     int       `json:"score" db:"score"`
	Findings  []Finding `json:"findings"`
	CheckedAt time.Time `json:"checked_at" db:"checked_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// Finding represents a compliance finding
type Finding struct {
	Rule           string `json:"rule"`
	Severity       string `json:"severity"` // critical, high, medium, low
	Description    string `json:"description"`
	Recommendation string `json:"recommendation"`
}

// ComplianceCategory represents AI Act risk category
type ComplianceCategory struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Color       string `json:"color"`
	Description string `json:"description"`
}

// DeepfakeAnalysis represents a deepfake detection result
type DeepfakeAnalysis struct {
	ID         string          `json:"id" db:"id"`
	MediaURL   string          `json:"media_url" db:"media_url"`
	MediaType  string          `json:"media_type" db:"media_type"` // image, video, audio
	Result     string          `json:"result" db:"result"`         // real, fake, uncertain
	Confidence int             `json:"confidence" db:"confidence"`
	Details    AnalysisDetails `json:"details"`
	AnalysisAt time.Time       `json:"analysis_at" db:"analysis_at"`
	CreatedAt  time.Time       `json:"created_at" db:"created_at"`
}

// AnalysisDetails represents detailed analysis metrics
type AnalysisDetails struct {
	Artifacts   int      `json:"artifacts"`
	Consistency int      `json:"consistency"`
	SourceMatch int      `json:"source_match,omitempty"`
	Flags       []string `json:"flags"`
}

// HardwareChallenge represents a FIDO2-style hardware challenge
type HardwareChallenge struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Challenge string    `json:"challenge"`
	Status    string    `json:"status"` // pending, verified, failed, expired
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// BiometricSignature represents a cryptographically signed proof of presence
type BiometricSignature struct {
	ID          string    `json:"id"`
	ChallengeID string    `json:"challenge_id"`
	Signature   string    `json:"signature"`
	HardwareID  string    `json:"hardware_id"`
	Verified    bool      `json:"verified"`
	CreatedAt   time.Time `json:"created_at"`
}

// API Request/Response types

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	User         *User  `json:"user"`
}

type CreateAgentRequest struct {
	Name           string  `json:"name" binding:"required"`
	Type           string  `json:"type" binding:"required"`
	Environment    string  `json:"environment"`
	Provider       string  `json:"provider"`
	Model          string  `json:"model"`
	OrgID          string  `json:"org_id"`
	ControlWebhook string  `json:"control_webhook"`
	Budget         float64 `json:"budget"`
	MaxTokens      int     `json:"maxTokens"`
	Config         string  `json:"config"`
}

type UpdateAgentRequest struct {
	Name   string `json:"name"`
	Type   string `json:"type"`
	Config string `json:"config"`
	Status string `json:"status"`
}

type RunComplianceCheckRequest struct {
	Type string `json:"type" binding:"required"` // ai_act, privacy, security
	URL  string `json:"url"`
}

type AnalyzeDeepfakeRequest struct {
	MediaURL  string `json:"media_url" binding:"required"`
	MediaType string `json:"media_type" binding:"required,oneof=image video audio"`
}

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

type ErrorResponse struct {
	Error   string      `json:"error"`
	Code    string      `json:"code,omitempty"`
	Details interface{} `json:"details,omitempty"`
}

type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// WebhookConfig represents a webhook configuration
type WebhookConfig struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	URL       string    `json:"url" db:"url"`
	EventType string    `json:"event_type" db:"event_type"`
	Secret    string    `json:"secret" db:"secret"`
	IsActive  bool      `json:"is_active" db:"is_active"`
	Headers   string    `json:"headers,omitempty" db:"headers"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// WebhookExecution represents a webhook execution log
type WebhookExecution struct {
	ID         string    `json:"id" db:"id"`
	WebhookID  string    `json:"webhook_id" db:"webhook_id"`
	EventType  string    `json:"event_type" db:"event_type"`
	Payload    string    `json:"payload" db:"payload"`
	Status     string    `json:"status" db:"status"` // success, failed, pending
	Response   string    `json:"response" db:"response"`
	HTTPStatus int       `json:"http_status" db:"http_status"`
	Duration   int       `json:"duration" db:"duration"` // ms
	Timestamp  time.Time `json:"timestamp" db:"timestamp"`
}

// AlertConfig represents an alert configuration
type AlertConfig struct {
	ID         string    `json:"id" db:"id"`
	Name       string    `json:"name" db:"name"`
	Type       string    `json:"type" db:"type"` // budget, agent_failure, rate_limit
	Threshold  int       `json:"threshold" db:"threshold"`
	IsActive   bool      `json:"is_active" db:"is_active"`
	Channels   []string  `json:"channels" db:"channels"` // slack, email, pagerduty
	Recipients string    `json:"recipients,omitempty" db:"recipients"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

// ProviderStatus represents a cloud provider status
type ProviderStatus struct {
	Name      string    `json:"name"`
	Status    string    `json:"status"`  // healthy, degraded, down
	Latency   int       `json:"latency"` // ms
	LastCheck time.Time `json:"last_check"`
}

// MultiCloudStatus represents multi-cloud provider status
type MultiCloudStatus struct {
	Primary     string                    `json:"primary"`
	Providers   map[string]ProviderStatus `json:"providers"`
	LastUpdated time.Time                 `json:"last_updated"`
}

// FailoverResult represents the result of a failover operation
type FailoverResult struct {
	Success      bool      `json:"success"`
	FromProvider string    `json:"from_provider"`
	ToProvider   string    `json:"to_provider"`
	Duration     int       `json:"duration"` // ms
	Timestamp    time.Time `json:"timestamp"`
}

// SelfHealingEvent represents a self-healing event
type SelfHealingEvent struct {
	ID          string    `json:"id" db:"id"`
	EventType   string    `json:"event_type" db:"event_type"` // connection_recovery, schema_update, rate_limit_recovery
	Description string    `json:"description" db:"description"`
	AgentID     string    `json:"agent_id" db:"agent_id"`
	ActionTaken string    `json:"action_taken" db:"action_taken"`
	Status      string    `json:"status" db:"status"` // resolved, pending, failed
	Timestamp   time.Time `json:"timestamp" db:"timestamp"`
}

// RecoveryResult represents the result of a recovery action
type RecoveryResult struct {
	Success   bool      `json:"success"`
	AgentID   string    `json:"agent_id"`
	Action    string    `json:"action"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

// TrainingModule represents a training module
type TrainingModule struct {
	ID          string          `json:"id" db:"id"`
	Title       string          `json:"title" db:"title"`
	Description string          `json:"description" db:"description"`
	Category    string          `json:"category" db:"category"`
	Duration    int             `json:"duration" db:"duration"`
	Status      string          `json:"status" db:"status"`
	Modules     int             `json:"modules" db:"modules"`
	Content     []ModuleContent `json:"content,omitempty"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}

// ModuleContent represents content within a training module
type ModuleContent struct {
	ModuleID int    `json:"module_id"`
	Title    string `json:"title"`
	Type     string `json:"type"`
	Duration int    `json:"duration"`
}

// TrainingProgress represents user progress in a training module
type TrainingProgress struct {
	ID             string     `json:"id" db:"id"`
	UserID         string     `json:"user_id" db:"user_id"`
	ModuleID       string     `json:"module_id" db:"module_id"`
	Status         string     `json:"status" db:"status"`
	Score          int        `json:"score" db:"score"`
	TimeSpent      int        `json:"time_spent" db:"time_spent"`
	CompletedAt    *time.Time `json:"completed_at" db:"completed_at"`
	LastAccessedAt time.Time  `json:"last_accessed_at" db:"last_accessed_at"`
	StartedAt      time.Time  `json:"started_at"`
}

// TrainingStats represents training statistics
type TrainingStats struct {
	TotalUsers       int            `json:"total_users"`
	ActiveUsers      int            `json:"active_users"`
	CompletedModules int            `json:"completed_modules"`
	InProgress       int            `json:"in_progress"`
	NotStarted       int            `json:"not_started"`
	AvgScore         int            `json:"avg_score"`
	ByCategory       map[string]int `json:"by_category"`
}

// ShadowAIDetection represents a detected Shadow AI tool
type ShadowAIDetection struct {
	ID           string     `json:"id" db:"id"`
	ToolName     string     `json:"tool_name" db:"tool_name"`
	Domain       string     `json:"domain" db:"domain"`
	UserEmail    string     `json:"user_email" db:"user_email"`
	RiskLevel    string     `json:"risk_level" db:"risk_level"`
	Status       string     `json:"status" db:"status"`
	Category     string     `json:"category" db:"category"`
	UsageCount   int        `json:"usage_count" db:"usage_count"`
	FirstSeen    time.Time  `json:"first_seen" db:"first_seen"`
	LastSeen     time.Time  `json:"last_seen" db:"last_seen"`
	Description  string     `json:"description" db:"description"`
	RemediatedAt *time.Time `json:"remediated_at" db:"remediated_at"`
}

// ShadowAIStats represents Shadow AI detection statistics
type ShadowAIStats struct {
	TotalDetections int            `json:"total_detections"`
	HighRisk        int            `json:"high_risk"`
	MediumRisk      int            `json:"medium_risk"`
	LowRisk         int            `json:"low_risk"`
	Approved        int            `json:"approved"`
	Blocked         int            `json:"blocked"`
	ByCategory      map[string]int `json:"by_category"`
	ByStatus        map[string]int `json:"by_status"`
}

// WearableDevice represents a wearable biometric device
type WearableDevice struct {
	ID           string    `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	Type         string    `json:"type" db:"type"`     // vision_pro, apple_watch, oculus, custom
	Status       string    `json:"status" db:"status"` // paired, unpaired, active
	DeviceID     string    `json:"device_id" db:"device_id"`
	UserID       string    `json:"user_id" db:"user_id"`
	LastVerified time.Time `json:"last_verified" db:"last_verified"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// CryptoWallet represents a protected cryptocurrency wallet
type CryptoWallet struct {
	ID           string    `json:"id" db:"id"`
	Address      string    `json:"address" db:"address"`
	Blockchain   string    `json:"blockchain" db:"blockchain"` // ethereum, solana, bitcoin
	Status       string    `json:"status" db:"status"`         // protected, unprotected
	UserID       string    `json:"user_id" db:"user_id"`
	LastVerified time.Time `json:"last_verified" db:"last_verified"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// TravelKiosk represents a travel/border verification kiosk
type TravelKiosk struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Location  string    `json:"location" db:"location"`
	Airport   string    `json:"airport" db:"airport"`
	Status    string    `json:"status" db:"status"` // online, offline, maintenance
	LastPing  time.Time `json:"last_ping" db:"last_ping"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// VerificationResult represents a biometric verification result
type VerificationResult struct {
	Verified        bool      `json:"verified"`
	WalletID        string    `json:"wallet_id"`
	TransactionHash string    `json:"transaction_hash"`
	BiometricScore  int       `json:"biometric_score"`
	ExpiresAt       time.Time `json:"expires_at"`
}

// TravelVerificationResult represents a travel verification result
type TravelVerificationResult struct {
	Verified         bool      `json:"verified"`
	KioskID          string    `json:"kiosk_id"`
	PassportNumber   string    `json:"passport_number"`
	ConfidenceScore  int       `json:"confidence_score"`
	VerificationType string    `json:"verification_type"` // liveness, passport_nfc, both
	ExpiresAt        time.Time `json:"expires_at"`
}

// EdgeDeployment represents an edge AI deployment
type EdgeDeployment struct {
	ID           string    `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	Type         string    `json:"type" db:"type"`     // industrial, retail, iot
	Status       string    `json:"status" db:"status"` // running, stopped, updating
	Location     string    `json:"location" db:"location"`
	ModelVersion string    `json:"model_version" db:"model_version"`
	LastSync     time.Time `json:"last_sync" db:"last_sync"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// EdgeSyncResult represents the result of an edge sync operation
type EdgeSyncResult struct {
	Success      bool      `json:"success"`
	DeploymentID string    `json:"deployment_id"`
	ModelVersion string    `json:"model_version"`
	SyncDuration int       `json:"sync_duration"` // seconds
	Timestamp    time.Time `json:"timestamp"`
}

// Vendor represents a third-party vendor
type Vendor struct {
	ID               string    `json:"id" db:"id"`
	Name             string    `json:"name" db:"name"`
	Category         string    `json:"category" db:"category"`                   // llm_provider, data_provider, tool_provider
	ComplianceStatus string    `json:"compliance_status" db:"compliance_status"` // compliant, pending_review, non_compliant
	RiskLevel        string    `json:"risk_level" db:"risk_level"`               // low, medium, high
	ContractEnd      time.Time `json:"contract_end" db:"contract_end"`
	LastAudit        time.Time `json:"last_audit" db:"last_audit"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}

// WorkforceStatus represents the status of the digital workforce
type WorkforceStatus struct {
	TotalAgents     int            `json:"total_agents"`
	ActiveAgents    int            `json:"active_agents"`
	TotalROI        float64        `json:"total_roi"`
	MonthlyBurn     float64        `json:"monthly_burn"`
	AutonomyLevel   string         `json:"autonomy_level"` // partial, full
	SovereignStages []SovereignStage `json:"sovereign_stages"`
	LastSync        time.Time      `json:"last_sync"`
}

// SovereignStage represents a stage in the Sovereign Autonomy Matrix
type SovereignStage struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Level       string `json:"level"` // review_required, fully_autonomous
	Status      string `json:"status"` // healthy, pending_review, alert
	Description string `json:"description"`
}

// SovereignRequest represents a request for human approval
type SovereignRequest struct {
	ID        string    `json:"id"`
	StageID   string    `json:"stage_id"`
	Action    string    `json:"action"`
	Reasoning string    `json:"reasoning"`
	Context   string    `json:"context"` // JSON string or text
	Status    string    `json:"status"`  // pending, approved, denied
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
