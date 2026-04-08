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
	baseURL string
	client  *http.Client
	pool    *sync.Pool
}

func NewProxyService(baseURL string) *ProxyService {
	return &ProxyService{
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
	}
}

const (
	maxRetries     = 3
	retryDelayBase = 100 * time.Millisecond
)

func (p *ProxyService) ForwardWithStatus(method, path string, body interface{}, headers map[string]string) (int, []byte, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	url := p.baseURL + path

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		req, err := http.NewRequestWithContext(ctx, method, url, reqBody)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		for k, v := range headers {
			req.Header.Set(k, v)
		}

		resp, err := p.client.Do(req)
		if err != nil {
			if attempt < maxRetries-1 {
				delay := retryDelayBase * time.Duration(1<<attempt)
				time.Sleep(delay)
				lastErr = err
				continue
			}
			return 0, nil, fmt.Errorf("backend connectivity failure after %d attempts: %w", maxRetries, err)
		}
		defer resp.Body.Close()

		responseBody, err := io.ReadAll(resp.Body)
		if err != nil {
			return resp.StatusCode, nil, fmt.Errorf("failed to read backend response: %w", err)
		}

		// Success case
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			return resp.StatusCode, responseBody, nil
		}

		// Handle structured errors from Python (FastAPI uses "detail" field)
		if resp.StatusCode >= 400 && resp.StatusCode < 500 {
			var pyErr struct {
				Detail interface{} `json:"detail"`
			}
			if err := json.Unmarshal(responseBody, &pyErr); err == nil {
				// We found a structured error, propagate it
				return resp.StatusCode, responseBody, nil
			}
			// Fallback for non-structured 4xx
			return resp.StatusCode, responseBody, nil
		}

		// Handle server errors (5xx) with retries
		if resp.StatusCode >= 500 {
			if attempt < maxRetries-1 {
				delay := retryDelayBase * time.Duration(1<<attempt)
				time.Sleep(delay)
				lastErr = fmt.Errorf("backend server error: %d", resp.StatusCode)
				continue
			}
			return resp.StatusCode, responseBody, nil
		}

		return resp.StatusCode, responseBody, nil
	}

	return 0, nil, fmt.Errorf("proxy operation failed: %w", lastErr)
}

func (p *ProxyService) Forward(method, path string, body interface{}) ([]byte, error) {
	_, response, err := p.ForwardWithStatus(method, path, body, nil)
	return response, err
}

// Agent Operations
func (p *ProxyService) ListAgents() ([]byte, error) {
	return p.Forward("GET", "/agents", nil)
}

func (p *ProxyService) GetAgent(id string) ([]byte, error) {
	return p.Forward("GET", fmt.Sprintf("/agents/%s", id), nil)
}

func (p *ProxyService) CreateAgent(data interface{}) ([]byte, error) {
	return p.Forward("POST", "/agents", data)
}

func (p *ProxyService) UpdateAgent(id string, data interface{}) ([]byte, error) {
	return p.Forward("PUT", fmt.Sprintf("/agents/%s", id), data)
}

func (p *ProxyService) DeleteAgent(id string) ([]byte, error) {
	return p.Forward("DELETE", fmt.Sprintf("/agents/%s", id), nil)
}

func (p *ProxyService) GetAgentMetrics() ([]byte, error) {
	return p.Forward("GET", "/metrics/agents", nil)
}

func (p *ProxyService) GetAgentHistory(id string) ([]byte, error) {
	return p.Forward("GET", fmt.Sprintf("/agents/%s/history", id), nil)
}

func (p *ProxyService) StopAgent(id string) ([]byte, error) {
	return p.Forward("POST", fmt.Sprintf("/agents/%s/stop", id), nil)
}

func (p *ProxyService) RestartAgent(id string) ([]byte, error) {
	return p.Forward("POST", fmt.Sprintf("/agents/%s/restart", id), nil)
}

func (p *ProxyService) GetAgentLogs(id string) ([]byte, error) {
	return p.Forward("GET", fmt.Sprintf("/agents/%s/logs", id), nil)
}

// Compliance
func (p *ProxyService) ListComplianceChecks() ([]byte, error) {
	return p.Forward("GET", "/compliance", nil)
}

func (p *ProxyService) GetComplianceCheck(id string) ([]byte, error) {
	return p.Forward("GET", fmt.Sprintf("/compliance/%s", id), nil)
}

func (p *ProxyService) RunComplianceCheck(data interface{}) ([]byte, error) {
	return p.Forward("POST", "/compliance/check", data)
}

func (p *ProxyService) GetComplianceCategories() ([]byte, error) {
	return p.Forward("GET", "/compliance/categories", nil)
}

// Deepfake
func (p *ProxyService) AnalyzeDeepfake(data interface{}) ([]byte, error) {
	return p.Forward("POST", "/deepfake/analyze", data)
}

func (p *ProxyService) ListDeepfakeAnalyses() ([]byte, error) {
	return p.Forward("GET", "/deepfake/analyses", nil)
}

func (p *ProxyService) GetDeepfakeAnalysis(id string) ([]byte, error) {
	return p.Forward("GET", fmt.Sprintf("/deepfake/analyses/%s", id), nil)
}

func (p *ProxyService) GetDeepfakeStats() ([]byte, error) {
	return p.Forward("GET", "/deepfake/stats", nil)
}

func (p *ProxyService) CreateDeepfakeChallenge(userID string) ([]byte, error) {
	return p.Forward("POST", fmt.Sprintf("/deepfake/challenge?user_id=%s", userID), nil)
}

func (p *ProxyService) VerifyDeepfakeSignature(challengeID, signature, hardwareID string) ([]byte, error) {
	return p.Forward("POST", fmt.Sprintf("/deepfake/verify?challenge_id=%s&signature=%s&hardware_id=%s", challengeID, signature, hardwareID), nil)
}

func (p *ProxyService) AnalyzeDeepfakeEnterprise(data interface{}) ([]byte, error) {
	return p.Forward("POST", "/deepfake/analyze/enterprise", data)
}

func (p *ProxyService) ListDeepfakeDetectors() ([]byte, error) {
	return p.Forward("GET", "/deepfake/detectors", nil)
}

// Enterprise
func (p *ProxyService) GetPartnerConfig() ([]byte, error) {
	return p.Forward("GET", "/enterprise/partner-config", nil)
}

func (p *ProxyService) UpdateSlaTier(data interface{}) ([]byte, error) {
	return p.Forward("POST", "/enterprise/sla-tier", data)
}

// Extended Compliance (AI Act Models)
func (p *ProxyService) ListComplianceModels() ([]byte, error) {
	return p.Forward("GET", "/compliance/models", nil)
}

func (p *ProxyService) RegisterComplianceModel(data interface{}) ([]byte, error) {
	return p.Forward("POST", "/compliance/models", data)
}

func (p *ProxyService) UpdateComplianceGuardrails(id string, data interface{}) ([]byte, error) {
	return p.Forward("PATCH", fmt.Sprintf("/compliance/models/%s/guardrails", id), data)
}

func (p *ProxyService) GetBiasReports(modelID string) ([]byte, error) {
	return p.Forward("GET", fmt.Sprintf("/compliance/bias-reports/%s", modelID), nil)
}

func (p *ProxyService) TriggerBiasScan(data interface{}) ([]byte, error) {
	return p.Forward("POST", "/compliance/bias-scan", data)
}

func (p *ProxyService) RunForensics(agentID string) ([]byte, error) {
	path := "/compliance/forensics"
	if agentID != "" {
		path = fmt.Sprintf("%s?agent_id=%s", path, agentID)
	}
	return p.Forward("POST", path, nil)
}

func (p *ProxyService) ProvisionClient(data interface{}) ([]byte, error) {
	return p.Forward("POST", "/whitelabel/provision", data)
}

func (p *ProxyService) GetAgentOpsMetrics() ([]byte, error) {
	return p.Forward("GET", "/agent-ops/metrics", nil)
}
