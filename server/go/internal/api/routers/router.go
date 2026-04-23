package routers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/middleware"
)

// ComplianceHandler defines the interface for compliance handlers
type ComplianceHandler interface {
	GetStats(c *gin.Context)
	ListChecks(c *gin.Context)
	GetCheck(c *gin.Context)
	RunCheck(c *gin.Context)
	GetCategories(c *gin.Context)
	GenerateDocumentation(c *gin.Context)
	ListAuditLogs(c *gin.Context)
	UpdateIncidentStatus(c *gin.Context)
	UploadArtifact(c *gin.Context)
	ListArtifacts(c *gin.Context)
	GetROIMetrics(c *gin.Context)
	GetVelocityTrends(c *gin.Context)
	GetDeadlines(c *gin.Context)
	GetEnterpriseAudits(c *gin.Context)
	GetModelBreakdown(c *gin.Context)
	GetModelAudits(c *gin.Context)
	GetModelHandshakes(c *gin.Context)
	GetRegionalReports(c *gin.Context)
	GetFinancialMetrics(c *gin.Context)
	ListChecklists(c *gin.Context)
	UpdateChecklistItem(c *gin.Context)
	ListModels(c *gin.Context)
	RegisterModel(c *gin.Context)
	UpdateGuardrails(c *gin.Context)
	GetBiasReports(c *gin.Context)
	TriggerBiasScan(c *gin.Context)
	RedTeamAudit(c *gin.Context)
	ExportReport(c *gin.Context)
	EURegister(c *gin.Context)
	UpdateSSOConfig(c *gin.Context)
	VerifyProxy(c *gin.Context)
	ListConnections(c *gin.Context)
	ConnectSystem(c *gin.Context)
	RunGeneralScan(c *gin.Context)
	ListScans(c *gin.Context)
	DeleteVendor(c *gin.Context)
	ListIncidents(c *gin.Context)
	CreateIncident(c *gin.Context)
	CreateArticle71Incident(c *gin.Context)
	GetLiveMetrics(c *gin.Context)
	Remediate(c *gin.Context)
	RunSoxAudit(c *gin.Context)
	RunHipaaAudit(c *gin.Context)
}

// AgentOpsHandler defines the interface for agent operations handlers
type AgentOpsHandler interface {
	ListAgents(c *gin.Context)
	GetAgentLogs(c *gin.Context)
	GetForecast(c *gin.Context)
	CreateAgent(c *gin.Context)
	UpdateAgent(c *gin.Context)
	DeleteAgent(c *gin.Context)
	StopAgent(c *gin.Context)
	RestartAgent(c *gin.Context)
	CloneConfig(c *gin.Context)
	OptimizeMemory(c *gin.Context)
	GetAgentMetrics(c *gin.Context)
	GetAgentHistory(c *gin.Context)
	ProxyToPython(c *gin.Context)
	GetAuditLogs(c *gin.Context)
	ListLLMConfigs(c *gin.Context)
	SyncLinguisticPackage(c *gin.Context)
	RunForensics(c *gin.Context)
	ProvisionClient(c *gin.Context)
	ListVentureInsights(c *gin.Context)
	AnalyzeVentureScenario(c *gin.Context)
}

// ProxyHandler defines the interface for proxy handlers
type ProxyHandler interface {
	ProxyToPython(c *gin.Context)
}

// PanicHandler interface
type PanicHandler interface {
	Lock(c *gin.Context)
	Reset(c *gin.Context)
}

// DeepfakeHandler interface
type DeepfakeHandler interface {
	Analyze(c *gin.Context)
	Upload(c *gin.Context)
	ListAnalyses(c *gin.Context)
	GetAnalysis(c *gin.Context)
	GetStats(c *gin.Context)
	CreateChallenge(c *gin.Context)
	VerifyAuthSignature(c *gin.Context)
	AnalyzeEnterprise(c *gin.Context)
	ListDetectors(c *gin.Context)
	GetDuressConfig(c *gin.Context)
	UpdateDuressConfig(c *gin.Context)
	ListBiometrics(c *gin.Context)
	CreateBiometric(c *gin.Context)
	RevokeBiometric(c *gin.Context)
	GetThreats(c *gin.Context)
}

// DenialDefenseHandler interface
type DenialDefenseHandler interface {
	ListClaims(c *gin.Context)
	GetStats(c *gin.Context)
	CreateClaim(c *gin.Context)
	UpdateClaim(c *gin.Context)
}

// EnterpriseHandler interface
type EnterpriseHandler interface {
	GetPartnerConfig(c *gin.Context)
	UpdateSlaTier(c *gin.Context)
}

// RulesHandler interface
type RulesHandler interface {
	ListRules(c *gin.Context)
	CreateRule(c *gin.Context)
	UpdateRule(c *gin.Context)
	DeleteRule(c *gin.Context)
	ToggleRule(c *gin.Context)
}

// MetricsHandler interface
type MetricsHandler interface {
	GetCurrentMetrics(c *gin.Context)
	GetMetricsHistory(c *gin.Context)
	GetAgentMetrics(c *gin.Context)
}

// BillingHandler interface
type BillingHandler interface {
	GetSubscription(c *gin.Context)
	GetInvoices(c *gin.Context)
	CreateCheckout(c *gin.Context)
	CancelSubscription(c *gin.Context)
	UpdatePaymentMethod(c *gin.Context)
}

// WSHandler interface
type WSHandler interface {
	HandleWebSocket(c *gin.Context)
}

// AuthHandler interface
type AuthHandler interface {
	Login(c *gin.Context)
	Register(c *gin.Context)
	RefreshToken(c *gin.Context)
	RequestPasswordReset(c *gin.Context)
	ResetPassword(c *gin.Context)
	Me(c *gin.Context)
	Logout(c *gin.Context)
}

// UserHandler interface
type UserHandler interface {
	UpdateProfile(c *gin.Context)
	UpdatePassword(c *gin.Context)
	ListAPIKeys(c *gin.Context)
	CreateAPIKey(c *gin.Context)
	DeleteAPIKey(c *gin.Context)
}

// WorkforceHandler interface
type WorkforceHandler interface {
	GetStatus(c *gin.Context)
	ListDecisions(c *gin.Context)
	ListTraces(c *gin.Context)
	RequestApproval(c *gin.Context)
	HandleCallback(c *gin.Context)
	RecoverRevenue(c *gin.Context)
	RunCampaign(c *gin.Context)
	SourceLeads(c *gin.Context)
	AnalyzeInsights(c *gin.Context)
	HandleInbound(c *gin.Context)
	ProvideFeedback(c *gin.Context)
	GetSkills(c *gin.Context)
	GetJobs(c *gin.Context)
	GetAcquisitions(c *gin.Context)
	GetContentDrafts(c *gin.Context)
	RunAutosearch(c *gin.Context)
	GetOutreachDrafts(c *gin.Context)
	ApproveOutreach(c *gin.Context)
	GetInvoices(c *gin.Context)
	ActivateReferral(c *gin.Context)
	GetReferralStats(c *gin.Context)
	ToggleAutonomy(c *gin.Context)
	DeployCheck(c *gin.Context)
}

// VendorHandler interface
type VendorHandler interface {
	ListVendors(c *gin.Context)
	AddVendor(c *gin.Context)
	DeleteVendor(c *gin.Context)
	AuditVendor(c *gin.Context)
	GetRiskReport(c *gin.Context)
}

// IntelligenceHandler defines the interface for intelligence handlers
type IntelligenceHandler interface {
	// Generic Intelligence
	GetStrategicInsights(c *gin.Context)
	GetMarketTrends(c *gin.Context)
	GetRiskAssessment(c *gin.Context)
	GetOptimizationRules(c *gin.Context)
	// Hermes Specific
	HermesSuggestFix(c *gin.Context)
	HermesValidateStrategy(c *gin.Context)
	HermesChat(c *gin.Context)
	HermesAnalyze(c *gin.Context)
	// Paperclip Specific
	PaperclipResearch(c *gin.Context)
	PaperclipRun(c *gin.Context)
}

// MLHandler interface
type MLHandler interface {
	ProxyML(c *gin.Context)
	Infer(c *gin.Context)
	ListModels(c *gin.Context)
	ClassifyAgentOperation(c *gin.Context)
	CheckCompliance(c *gin.Context)
	DetectDeepfake(c *gin.Context)
}

// InsightOrchestratorHandler interface
type InsightOrchestratorHandler interface {
	AggregateAgentMetrics(c *gin.Context)
	GetTopAgents(c *gin.Context)
	AnomalyDetection(c *gin.Context)
}

// WearableHandler interface
type WearableHandler interface {
	ListDevices(c *gin.Context)
	RegisterDevice(c *gin.Context)
	PairDevice(c *gin.Context)
}

// CryptoHandler interface
type CryptoHandler interface {
	ListWallets(c *gin.Context)
	ProtectWallet(c *gin.Context)
	VerifyTransaction(c *gin.Context)
}

// TravelKioskHandler interface
type TravelKioskHandler interface {
	ListKiosks(c *gin.Context)
	VerifyTraveler(c *gin.Context)
}

// EdgeHandler interface
type EdgeHandler interface {
	ListDeployments(c *gin.Context)
	SyncWeights(c *gin.Context)
	GetEdgeLogs(c *gin.Context)
}

// HandlerContainer holds all handler implementations
type HandlerContainer struct {
	PanicHandler         PanicHandler
	AuthHandler          AuthHandler
	UserHandler          UserHandler
	AgentOpsHandler      AgentOpsHandler
	ComplianceHandler    ComplianceHandler
	DeepfakeHandler      DeepfakeHandler
	DenialDefenseHandler DenialDefenseHandler
	EnterpriseHandler    EnterpriseHandler
	RulesHandler         RulesHandler
	MetricsHandler       MetricsHandler
	BillingHandler       BillingHandler
	WSHandler            WSHandler
	IntelligenceHandler  IntelligenceHandler
	WebhookHandler       interface {
		GetWebhook(c *gin.Context)
		CreateWebhook(c *gin.Context)
		UpdateWebhook(c *gin.Context)
		DeleteWebhook(c *gin.Context)
		TestWebhook(c *gin.Context)
		GetWebhookExecutions(c *gin.Context)
		ListWebhooks(c *gin.Context)
	}
	AlertHandler interface {
		ListAlerts(c *gin.Context)
		CreateAlert(c *gin.Context)
		UpdateAlert(c *gin.Context)
		DeleteAlert(c *gin.Context)
	}
	MultiCloudHandler interface {
		GetStatus(c *gin.Context)
		InitiateFailover(c *gin.Context)
	}
	SelfHealingHandler interface {
		GetHealingStatus(c *gin.Context)
		GetEvents(c *gin.Context)
		GetStats(c *gin.Context)
		TriggerRecovery(c *gin.Context)
	}
	ShadowAIHandler interface {
		ListDetections(c *gin.Context)
		GetShadowAIStats(c *gin.Context)
		AutoDetect(c *gin.Context)
		ScanLogs(c *gin.Context)
		GetReport(c *gin.Context)
		RemediateDetection(c *gin.Context)
		CreateDetection(c *gin.Context)
		BlockTool(c *gin.Context)
		AllowTool(c *gin.Context)
	}
	TrainingHandler interface {
		ListModules(c *gin.Context)
		GetModule(c *gin.Context)
		CreateModule(c *gin.Context)
		UpdateProgress(c *gin.Context)
		GetUserProgress(c *gin.Context)
		GetTrainingStats(c *gin.Context)
		DownloadCertificate(c *gin.Context)
	}
	GovernanceHandler interface {
		GetComplianceDashboard(c *gin.Context)
		GetComplianceArticles(c *gin.Context)
		AssessCompliance(c *gin.Context)
		GetSLADashboard(c *gin.Context)
		GetSLAMetrics(c *gin.Context)
		GetPartners(c *gin.Context)
		SyncPartner(c *gin.Context)
		GetUsageForecast(c *gin.Context)
		GetROIAnalytics(c *gin.Context)
		GetLocalizationConfigs(c *gin.Context)
		GetHealingConfigs(c *gin.Context)
		GetStrategicInsights(c *gin.Context)
		GetSettings(c *gin.Context)
		UpdateSetting(c *gin.Context)
		GetOnPremDeployments(c *gin.Context)
		DeployOnPrem(c *gin.Context)
	}
	MLHandler        MLHandler
	WorkforceHandler WorkforceHandler
	VendorHandler    VendorHandler
	WearableHandler  WearableHandler
	CryptoHandler    CryptoHandler
	TravelKioskHandler TravelKioskHandler
	EdgeHandler      EdgeHandler
	InsightOrchestrator InsightOrchestratorHandler
}

// MiddlewareContainer holds all middleware functions
type MiddlewareContainer struct {
	Auth          gin.HandlerFunc
	ProductAccess func(string) gin.HandlerFunc
	RequireRole   func(string) gin.HandlerFunc
	RateLimit     gin.HandlerFunc
}

// SetupAllRoutes configures all API routes
func SetupAllRoutes(router *gin.Engine, handlers *HandlerContainer, mw *MiddlewareContainer) {
	// API v1 group
	v1 := router.Group("/api/v1")

	// Panic routes (Administrative)
	SetupPanicRoutes(v1, handlers.PanicHandler)

	// Public auth routes
	SetupAuthRoutes(v1, handlers.AuthHandler, handlers.UserHandler, mw.Auth)

	// SSO routes
	SetupSSORoutes(v1, handlers.AgentOpsHandler, mw.Auth)

	// All protected routes
	protected := v1.Group("")
	protected.Use(mw.Auth)
	protected.Use(mw.RateLimit)

	// Apply Circuit Breaker for proxy intensive routes
	proxyCB := middleware.GinCircuitBreakerMiddleware("python-backend", middleware.CircuitBreakerConfig{
		FailureThreshold: 5,
		SuccessThreshold: 2,
		Timeout:          30 * time.Second,
		RequestTimeout:   10 * time.Second,
	})

	{
		// Agent routes (Proxy heavy)
		agentGroup := protected.Group("")
		agentGroup.Use(proxyCB)
		SetupAgentRoutes(agentGroup, handlers.AgentOpsHandler, middleware.ProductAccess, middleware.RequireRole)

		// Agent Ops routes (Proxy heavy)
		opsGroup := protected.Group("")
		opsGroup.Use(proxyCB)
		SetupAgentOpsRoutes(
			opsGroup,
			handlers.AgentOpsHandler,
			handlers.WebhookHandler,
			handlers.AlertHandler,
			handlers.MultiCloudHandler,
			handlers.SelfHealingHandler,
			handlers.ShadowAIHandler,
			handlers.TrainingHandler,
			handlers.GovernanceHandler,
			middleware.ProductAccess,
			middleware.RequireRole,
		)

		// Compliance routes (Proxy heavy)
		complianceGroup := protected.Group("")
		complianceGroup.Use(proxyCB)
		SetupComplianceRoutes(complianceGroup, handlers.ComplianceHandler, middleware.ProductAccess)

		// Deepfake routes (Proxy heavy)
		deepfakeGroup := protected.Group("")
		deepfakeGroup.Use(proxyCB)
		SetupDeepfakeRoutes(deepfakeGroup, handlers.DeepfakeHandler, middleware.ProductAccess)

		// Metrics routes (Proxy heavy)
		metricsGroup := protected.Group("")
		metricsGroup.Use(proxyCB)
		SetupMetricsRoutes(metricsGroup, handlers.MetricsHandler, middleware.ProductAccess)

		// Other routes (Less proxy intensive or async)
		SetupDenialDefenseRoutes(protected, handlers.DenialDefenseHandler)
		SetupEnterpriseRoutes(protected, handlers.EnterpriseHandler)
		SetupRulesRoutes(protected, handlers.RulesHandler, middleware.ProductAccess)
		SetupBillingRoutes(protected, handlers.BillingHandler, middleware.ProductAccess, middleware.RequireRole)
		SetupWSRoutes(protected, handlers.WSHandler)
		SetupAdditionalRoutes(protected, handlers.IntelligenceHandler)
		SetupWorkforceRoutes(protected, handlers.WorkforceHandler, middleware.ProductAccess, middleware.RequireRole)
		SetupVendorRoutes(protected, handlers.VendorHandler, middleware.ProductAccess)
		SetupWearableRoutes(protected, handlers.WearableHandler)
		SetupCryptoRoutes(protected, handlers.CryptoHandler)
		SetupTravelKioskRoutes(protected, handlers.TravelKioskHandler)
		SetupEdgeRoutes(protected, handlers.EdgeHandler)
		SetupIntelligenceRoutes(protected, handlers.InsightOrchestrator)

		// ML routes (Proxied to Python)
		mlGroup := v1.Group("/ml")
		mlGroup.Use(proxyCB)
		{
			mlGroup.POST("/infer", handlers.MLHandler.ProxyML)
			mlGroup.GET("/models", handlers.MLHandler.ListModels)
			mlGroup.POST("/agent-ops/classify", handlers.MLHandler.ClassifyAgentOperation)
			mlGroup.POST("/ai-compliance/check", handlers.MLHandler.CheckCompliance)
			mlGroup.POST("/deepfake/detect", handlers.MLHandler.DetectDeepfake)
		}
	}
}
