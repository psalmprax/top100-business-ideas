package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// ProxyService handles communication with the Python backend
type ProxyService struct {
	baseURL string
	client  *http.Client
}

func NewProxyService(baseURL string) *ProxyService {
	return &ProxyService{
		baseURL: baseURL,
		client: &http.Client{
			Timeout: 30 * time.Minute, // 30 minutes for long-running ML tasks
		},
	}
}

func (p *ProxyService) Forward(method, path string, body interface{}) ([]byte, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	url := p.baseURL + path
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("backend returned status %d: %s", resp.StatusCode, string(responseBody))
	}

	return responseBody, nil
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
