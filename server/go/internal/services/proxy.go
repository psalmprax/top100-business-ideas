package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/top100-business-ideas/api/internal/pkg/retry"
)

var (
	defaultTransport = &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 20,
		IdleConnTimeout:     90 * time.Second,
	}
)

// ProxyService handles communication with the Python backend
type ProxyService struct {
	baseURL     string
	client      *http.Client
	pool        *sync.Pool
	logger      *zerolog.Logger
	sandboxMode bool
	mu          sync.RWMutex
}

func NewProxyService(baseURL string, logger *zerolog.Logger) *ProxyService {
	ps := &ProxyService{
		baseURL: baseURL,
		client: &http.Client{
			Timeout:   60 * time.Second,
			Transport: defaultTransport,
		},
		pool: &sync.Pool{
			New: func() interface{} {
				return &bytes.Buffer{}
			},
		},
		logger: logger,
	}

	// Start health check loop for Sandbox Mode
	go ps.monitorHealth()

	return ps
}

func (p *ProxyService) monitorHealth() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		resp, err := p.client.Get(p.baseURL + "/health")
		p.mu.Lock()
		if err != nil {
			if !p.sandboxMode {
				p.logger.Warn().Err(err).Msg("Backend lost connectivity. Entering Sandbox Mode.")
				p.sandboxMode = true
			}
		} else {
			resp.Body.Close()
			if p.sandboxMode && resp.StatusCode == http.StatusOK {
				p.logger.Info().Msg("Backend connectivity restored. Exiting Sandbox Mode.")
				p.sandboxMode = false
			}
		}
		p.mu.Unlock()
		<-ticker.C
	}
}

func (p *ProxyService) SetSandboxMode(enabled bool) {
	p.mu.Lock()
	p.sandboxMode = enabled
	p.mu.Unlock()
}

func (p *ProxyService) IsSandbox() bool {
	p.mu.RLock()
	defer p.mu.RUnlock()
	return p.sandboxMode
}

const (
	maxRetries     = 3
	retryDelayBase = 100 * time.Millisecond
)

func (p *ProxyService) ForwardWithStatus(c *gin.Context, method, path string, body interface{}, headers map[string]string) (int, []byte, error) {
	// Hardening: Sandbox Mode Fallback
	if p.IsSandbox() {
		p.logger.Debug().Str("path", path).Msg("Serving Sandbox Mode mock response")
		return http.StatusOK, []byte(`{"status":"sandbox","message":"Backend unreachable, serving simulation data","data":[]}`), nil
	}

	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	url := p.baseURL + path

	// Trace Propagation: Extract RequestID from context if it exists
	var requestID string
	if c != nil {
		if ctxVal := c.Value("RequestID"); ctxVal != nil {
			if rid, ok := ctxVal.(string); ok {
				requestID = rid
			}
		}
	}

	policy := retry.RetryPolicy{
		MaxAttempts: 3,
		BaseDelay:   100 * time.Millisecond,
		MaxDelay:    2 * time.Second,
		Jitter:      true,
	}

	var responseBody []byte
	var statusCode int

	err := policy.Do(context.Background(), func() error {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		req, err := http.NewRequestWithContext(ctx, method, url, reqBody)
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		if requestID != "" {
			req.Header.Set("X-Request-ID", requestID)
		}
		for k, v := range headers {
			req.Header.Set(k, v)
		}

		resp, err := p.client.Do(req)
		if err != nil {
			p.logger.Warn().
				Str("request_id", requestID).
				Str("path", path).
				Err(err).
				Msg("Retrying backend request after connectivity failure")
			return err
		}
		defer resp.Body.Close()

		statusCode = resp.StatusCode
		responseBody, err = io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read backend response: %w", err)
		}

		// Success case
		if statusCode >= 200 && statusCode < 300 {
			return nil
		}

		// Handle client errors (4xx) - no retry
		if statusCode >= 400 && statusCode < 500 {
			p.logger.Warn().
				Str("request_id", requestID).
				Int("status", statusCode).
				Str("path", path).
				Msg("Backend returned client error (4xx)")
			return nil // Don't retry 4xx
		}

		// Handle server errors (5xx) with retries
		if statusCode >= 500 {
			p.logger.Warn().
				Str("request_id", requestID).
				Int("status", statusCode).
				Str("path", path).
				Msg("Retrying backend request after 5xx error")
			return fmt.Errorf("backend server error: %d", statusCode)
		}

		return nil
	})

	if err != nil {
		p.logger.Error().
			Str("request_id", requestID).
			Str("path", path).
			Err(err).
			Msg("Backend connectivity failure after max retries")

		// Auto-trigger Sandbox Mode transition
		p.SetSandboxMode(true)

		return 0, nil, fmt.Errorf("backend connectivity failure: %w", err)
	}

	return statusCode, responseBody, nil
}

func (p *ProxyService) Forward(c *gin.Context, method, path string, body interface{}) ([]byte, error) {
	_, response, err := p.ForwardWithStatus(c, method, path, body, nil)
	return response, err
}

// Agent Operations
func (p *ProxyService) ListAgents(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/agents", nil)
}

func (p *ProxyService) GetAgent(c *gin.Context, id string) ([]byte, error) {
	return p.Forward(c, "GET", fmt.Sprintf("/agents/%s", id), nil)
}

func (p *ProxyService) CreateAgent(c *gin.Context, data interface{}) ([]byte, error) {
	return p.Forward(c, "POST", "/agents", data)
}

func (p *ProxyService) UpdateAgent(c *gin.Context, id string, data interface{}) ([]byte, error) {
	return p.Forward(c, "PUT", fmt.Sprintf("/agents/%s", id), data)
}

func (p *ProxyService) DeleteAgent(c *gin.Context, id string) ([]byte, error) {
	return p.Forward(c, "DELETE", fmt.Sprintf("/agents/%s", id), nil)
}

func (p *ProxyService) GetAgentMetrics(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/metrics/agents", nil)
}

func (p *ProxyService) GetAgentHistory(c *gin.Context, id string) ([]byte, error) {
	return p.Forward(c, "GET", fmt.Sprintf("/agents/%s/history", id), nil)
}

func (p *ProxyService) StopAgent(c *gin.Context, id string) ([]byte, error) {
	return p.Forward(c, "POST", fmt.Sprintf("/agents/%s/stop", id), nil)
}

func (p *ProxyService) RestartAgent(c *gin.Context, id string) ([]byte, error) {
	return p.Forward(c, "POST", fmt.Sprintf("/agents/%s/restart", id), nil)
}

func (p *ProxyService) GetAgentLogs(c *gin.Context, id string) ([]byte, error) {
	return p.Forward(c, "GET", fmt.Sprintf("/agents/%s/logs", id), nil)
}

// Compliance
func (p *ProxyService) ListComplianceChecks(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/compliance", nil)
}

func (p *ProxyService) GetComplianceCheck(c *gin.Context, id string) ([]byte, error) {
	return p.Forward(c, "GET", fmt.Sprintf("/compliance/%s", id), nil)
}

func (p *ProxyService) RunComplianceCheck(c *gin.Context, data interface{}) ([]byte, error) {
	return p.Forward(c, "POST", "/compliance/check", data)
}

func (p *ProxyService) GetComplianceCategories(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/compliance/categories", nil)
}

// Deepfake
func (p *ProxyService) AnalyzeDeepfake(c *gin.Context, data interface{}) ([]byte, error) {
	return p.Forward(c, "POST", "/deepfake/analyze", data)
}

func (p *ProxyService) ListDeepfakeAnalyses(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/deepfake/analyses", nil)
}

func (p *ProxyService) GetDeepfakeAnalysis(c *gin.Context, id string) ([]byte, error) {
	return p.Forward(c, "GET", fmt.Sprintf("/deepfake/analyses/%s", id), nil)
}

func (p *ProxyService) GetDeepfakeStats(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/deepfake/stats", nil)
}

func (p *ProxyService) CreateDeepfakeChallenge(c *gin.Context, userID string) ([]byte, error) {
	return p.Forward(c, "POST", fmt.Sprintf("/deepfake/challenge?user_id=%s", userID), nil)
}

func (p *ProxyService) VerifyDeepfakeSignature(c *gin.Context, challengeID, signature, hardwareID string) ([]byte, error) {
	return p.Forward(c, "POST", fmt.Sprintf("/deepfake/verify?challenge_id=%s&signature=%s&hardware_id=%s", challengeID, signature, hardwareID), nil)
}

func (p *ProxyService) AnalyzeDeepfakeEnterprise(c *gin.Context, data interface{}) ([]byte, error) {
	return p.Forward(c, "POST", "/deepfake/analyze/enterprise", data)
}

func (p *ProxyService) ListDeepfakeDetectors(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/deepfake/detectors", nil)
}

// Enterprise
func (p *ProxyService) GetPartnerConfig(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/enterprise/partner-config", nil)
}

func (p *ProxyService) UpdateSlaTier(c *gin.Context, data interface{}) ([]byte, error) {
	return p.Forward(c, "POST", "/enterprise/sla-tier", data)
}

// Extended Compliance (AI Act Models)
func (p *ProxyService) ListComplianceModels(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/compliance/models", nil)
}

func (p *ProxyService) RegisterComplianceModel(c *gin.Context, data interface{}) ([]byte, error) {
	return p.Forward(c, "POST", "/compliance/models", data)
}

func (p *ProxyService) UpdateComplianceGuardrails(c *gin.Context, id string, data interface{}) ([]byte, error) {
	return p.Forward(c, "PATCH", fmt.Sprintf("/compliance/models/%s/guardrails", id), data)
}

func (p *ProxyService) GetBiasReports(c *gin.Context, modelID string) ([]byte, error) {
	return p.Forward(c, "GET", fmt.Sprintf("/compliance/bias-reports/%s", modelID), nil)
}

func (p *ProxyService) TriggerBiasScan(c *gin.Context, data interface{}) ([]byte, error) {
	return p.Forward(c, "POST", "/compliance/bias-scan", data)
}

func (p *ProxyService) RunForensics(c *gin.Context, agentID string) ([]byte, error) {
	path := "/compliance/forensics"
	if agentID != "" {
		path = fmt.Sprintf("%s?agent_id=%s", path, agentID)
	}
	return p.Forward(c, "POST", path, nil)
}

func (p *ProxyService) ProvisionClient(c *gin.Context, data interface{}) ([]byte, error) {
	return p.Forward(c, "POST", "/whitelabel/provision", data)
}

func (p *ProxyService) GetAgentOpsMetrics(c *gin.Context) ([]byte, error) {
	return p.Forward(c, "GET", "/agent-ops/metrics", nil)
}
