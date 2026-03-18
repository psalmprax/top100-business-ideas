package agentops

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// AgentOpsClient represents a client for the Agent Ops API
type AgentOpsClient struct {
	APIKey     string
	Endpoint   string
	HTTPClient *http.Client
	AgentID    string
}

// Config holds configuration for creating a new client
type Config struct {
	APIKey     string
	Endpoint   string
	MaxRetries int
}

// Agent represents an AI agent
type Agent struct {
	ID         string       `json:"id"`
	Name       string       `json:"name"`
	Status     string       `json:"status"`
	Type       string       `json:"type"`
	CreatedAt  time.Time    `json:"createdAt"`
	LastActive time.Time    `json:"lastActive"`
	Metrics    AgentMetrics `json:"metrics"`
}

// AgentMetrics holds metrics for an agent
type AgentMetrics struct {
	TotalTasks     int     `json:"totalTasks"`
	CompletedTasks int     `json:"completedTasks"`
	FailedTasks    int     `json:"failedTasks"`
	AverageLatency float64 `json:"averageLatency"`
	TokensUsed     int     `json:"tokensUsed"`
	CostUSD        float64 `json:"costUSD"`
}

// Alert represents an alert
type Alert struct {
	ID           string    `json:"id"`
	AgentID      string    `json:"agentId"`
	Severity     string    `json:"severity"`
	Message      string    `json:"message"`
	Timestamp    time.Time `json:"timestamp"`
	Acknowledged bool      `json:"acknowledged"`
}

// DashboardMetrics holds dashboard metrics
type DashboardMetrics struct {
	TotalAgents    int     `json:"totalAgents"`
	ActiveAgents   int     `json:"activeAgents"`
	TotalTasks     int     `json:"totalTasks"`
	SuccessRate    float64 `json:"successRate"`
	AverageLatency float64 `json:"averageLatency"`
	TotalCost      float64 `json:"totalCost"`
	Uptime         float64 `json:"uptime"`
}

// LogLevel represents log levels
type LogLevel string

const (
	LogLevelDebug LogLevel = "debug"
	LogLevelInfo  LogLevel = "info"
	LogLevelWarn  LogLevel = "warn"
	LogLevelError LogLevel = "error"
)

// TraceStatus represents trace status
type TraceStatus string

const (
	TraceStatusRunning   TraceStatus = "running"
	TraceStatusCompleted TraceStatus = "completed"
	TraceStatusFailed    TraceStatus = "failed"
)

// NewClient creates a new Agent Ops client
func NewClient(apiKey string, endpoint string) *AgentOpsClient {
	if endpoint == "" {
		endpoint = "https://api.agentops.dev"
	}

	return &AgentOpsClient{
		APIKey:   apiKey,
		Endpoint: endpoint,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// RegisterAgent registers an agent with Agent Ops
func (c *AgentOpsClient) RegisterAgent(name, agentType string) (*Agent, error) {
	data := map[string]string{
		"name": name,
		"type": agentType,
	}

	body, err := c.doRequest("POST", "/agents", data)
	if err != nil {
		return nil, err
	}

	var agent Agent
	if err := json.Unmarshal(body, &agent); err != nil {
		return nil, err
	}

	c.AgentID = agent.ID
	return &agent, nil
}

// Heartbeat sends a heartbeat to indicate the agent is alive
func (c *AgentOpsClient) Heartbeat() error {
	if c.AgentID == "" {
		return fmt.Errorf("agent not registered")
	}

	data := map[string]string{
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	_, err := c.doRequest("POST", fmt.Sprintf("/agents/%s/heartbeat", c.AgentID), data)
	return err
}

// ReportTaskComplete reports a task completion
func (c *AgentOpsClient) ReportTaskComplete(taskID string, metadata map[string]interface{}) error {
	if c.AgentID == "" {
		return fmt.Errorf("agent not registered")
	}

	data := map[string]interface{}{
		"taskId":   taskID,
		"status":   "completed",
		"metadata": metadata,
	}

	_, err := c.doRequest("POST", fmt.Sprintf("/agents/%s/tasks", c.AgentID), data)
	return err
}

// ReportTaskFailed reports a task failure
func (c *AgentOpsClient) ReportTaskFailed(taskID, errorMsg string) error {
	if c.AgentID == "" {
		return fmt.Errorf("agent not registered")
	}

	data := map[string]string{
		"taskId": taskID,
		"status": "failed",
		"error":  errorMsg,
	}

	_, err := c.doRequest("POST", fmt.Sprintf("/agents/%s/tasks", c.AgentID), data)
	return err
}

// Log sends a log entry
func (c *AgentOpsClient) Log(level LogLevel, message string, metadata map[string]interface{}) error {
	if c.AgentID == "" {
		return fmt.Errorf("agent not registered")
	}

	data := map[string]interface{}{
		"level":    level,
		"message":  message,
		"metadata": metadata,
	}

	_, err := c.doRequest("POST", fmt.Sprintf("/agents/%s/logs", c.AgentID), data)
	return err
}

// StartTrace starts a trace for distributed tracing
func (c *AgentOpsClient) StartTrace(name string) (string, error) {
	if c.AgentID == "" {
		return "", fmt.Errorf("agent not registered")
	}

	data := map[string]string{
		"name":      name,
		"startTime": time.Now().UTC().Format(time.RFC3339),
	}

	body, err := c.doRequest("POST", fmt.Sprintf("/agents/%s/traces", c.AgentID), data)
	if err != nil {
		return "", err
	}

	var response map[string]interface{}
	if err := json.Unmarshal(body, &response); err != nil {
		return "", err
	}

	traceID, ok := response["id"].(string)
	if !ok {
		return "", fmt.Errorf("failed to get trace ID")
	}

	return traceID, nil
}

// EndTrace ends a trace
func (c *AgentOpsClient) EndTrace(traceID string, status TraceStatus) error {
	if c.AgentID == "" {
		return fmt.Errorf("agent not registered")
	}

	data := map[string]string{
		"endTime": time.Now().UTC().Format(time.RFC3339),
		"status":  string(status),
	}

	_, err := c.doRequest("PATCH", fmt.Sprintf("/agents/%s/traces/%s", c.AgentID, traceID), data)
	return err
}

// GetAgents returns all agents
func (c *AgentOpsClient) GetAgents() ([]Agent, error) {
	body, err := c.doRequest("GET", "/agents", nil)
	if err != nil {
		return nil, err
	}

	var agents []Agent
	if err := json.Unmarshal(body, &agents); err != nil {
		return nil, err
	}

	return agents, nil
}

// GetAgent returns a specific agent
func (c *AgentOpsClient) GetAgent(agentID string) (*Agent, error) {
	body, err := c.doRequest("GET", fmt.Sprintf("/agents/%s", agentID), nil)
	if err != nil {
		return nil, err
	}

	var agent Agent
	if err := json.Unmarshal(body, &agent); err != nil {
		return nil, err
	}

	return &agent, nil
}

// GetDashboardMetrics returns dashboard metrics
func (c *AgentOpsClient) GetDashboardMetrics() (*DashboardMetrics, error) {
	body, err := c.doRequest("GET", "/dashboard/metrics", nil)
	if err != nil {
		return nil, err
	}

	var metrics DashboardMetrics
	if err := json.Unmarshal(body, &metrics); err != nil {
		return nil, err
	}

	return &metrics, nil
}

// GetAlerts returns alerts
func (c *AgentOpsClient) GetAlerts(agentID string) ([]Alert, error) {
	path := "/alerts"
	if agentID != "" {
		path = fmt.Sprintf("/alerts?agentId=%s", agentID)
	}

	body, err := c.doRequest("GET", path, nil)
	if err != nil {
		return nil, err
	}

	var alerts []Alert
	if err := json.Unmarshal(body, &alerts); err != nil {
		return nil, err
	}

	return alerts, nil
}

// AcknowledgeAlert acknowledges an alert
func (c *AgentOpsClient) AcknowledgeAlert(alertID string) error {
	data := map[string]bool{"acknowledged": true}
	_, err := c.doRequest("PATCH", fmt.Sprintf("/alerts/%s", alertID), data)
	return err
}

func (c *AgentOpsClient) doRequest(method, path string, data interface{}) ([]byte, error) {
	var body []byte
	if data != nil {
		body, _ = json.Marshal(data)
	}

	req, err := http.NewRequest(method, c.Endpoint+path, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}

	return nil, json.NewDecoder(resp.Body).Decode(&body)
}
