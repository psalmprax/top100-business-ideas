using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace AgentOpsSdk
{
    /// <summary>
    /// Agent Ops Sentinel SDK - C# Client
    /// AI Agent Monitoring & Management Platform
    /// </summary>
    public class AgentOpsClient
    {
        private readonly string _apiKey;
        private readonly string _endpoint;
        private readonly HttpClient _httpClient;
        private string? _agentId;

        public AgentOpsClient(string apiKey, string? endpoint = null)
        {
            _apiKey = apiKey;
            _endpoint = endpoint ?? "https://api.agentops.dev";
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_endpoint)
            };
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
            _httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
        }

        /// <summary>
        /// Register an agent with Agent Ops
        /// </summary>
        public async Task<Agent> RegisterAgentAsync(string name, string agentType)
        {
            var data = new Dictionary<string, string>
            {
                { "name", name },
                { "type", agentType }
            };

            var response = await _httpClient.PostAsJsonAsync("/agents", data);
            response.EnsureSuccessStatusCode();

            var agent = await response.Content.ReadFromJsonAsync<Agent>();
            if (agent != null)
            {
                _agentId = agent.Id;
            }
            return agent ?? throw new Exception("Failed to register agent");
        }

        /// <summary>
        /// Send a heartbeat to indicate the agent is alive
        /// </summary>
        public async Task HeartbeatAsync()
        {
            if (_agentId == null)
                throw new InvalidOperationException("Agent not registered");

            var data = new Dictionary<string, string>
            {
                { "timestamp", DateTime.UtcNow.ToString("o") }
            };

            var response = await _httpClient.PostAsJsonAsync($"/agents/{_agentId}/heartbeat", data);
            response.EnsureSuccessStatusCode();
        }

        /// <summary>
        /// Report a task completion
        /// </summary>
        public async Task ReportTaskCompleteAsync(string taskId, Dictionary<string, object>? metadata = null)
        {
            if (_agentId == null)
                throw new InvalidOperationException("Agent not registered");

            var data = new Dictionary<string, object>
            {
                { "taskId", taskId },
                { "status", "completed" },
                { "metadata", metadata ?? new Dictionary<string, object>() }
            };

            var response = await _httpClient.PostAsJsonAsync($"/agents/{_agentId}/tasks", data);
            response.EnsureSuccessStatusCode();
        }

        /// <summary>
        /// Report a task failure
        /// </summary>
        public async Task ReportTaskFailedAsync(string taskId, string error)
        {
            if (_agentId == null)
                throw new InvalidOperationException("Agent not registered");

            var data = new Dictionary<string, string>
            {
                { "taskId", taskId },
                { "status", "failed" },
                { "error", error }
            };

            var response = await _httpClient.PostAsJsonAsync($"/agents/{_agentId}/tasks", data);
            response.EnsureSuccessStatusCode();
        }

        /// <summary>
        /// Log an event
        /// </summary>
        public async Task LogAsync(string level, string message, Dictionary<string, object>? metadata = null)
        {
            if (_agentId == null)
                throw new InvalidOperationException("Agent not registered");

            var data = new Dictionary<string, object>
            {
                { "level", level },
                { "message", message },
                { "metadata", metadata ?? new Dictionary<string, object>() }
            };

            var response = await _httpClient.PostAsJsonAsync($"/agents/{_agentId}/logs", data);
            response.EnsureSuccessStatusCode();
        }

        /// <summary>
        /// Get all agents
        /// </summary>
        public async Task<List<Agent>> GetAgentsAsync()
        {
            var response = await _httpClient.GetAsync("/agents");
            response.EnsureSuccessStatusCode();

            var agents = await response.Content.ReadFromJsonAsync<List<Agent>>();
            return agents ?? new List<Agent>();
        }

        /// <summary>
        /// Get a specific agent
        /// </summary>
        public async Task<Agent> GetAgentAsync(string agentId)
        {
            var response = await _httpClient.GetAsync($"/agents/{agentId}");
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<Agent>() 
                ?? throw new Exception("Agent not found");
        }

        /// <summary>
        /// Get dashboard metrics
        /// </summary>
        public async Task<DashboardMetrics> GetDashboardMetricsAsync()
        {
            var response = await _httpClient.GetAsync("/dashboard/metrics");
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<DashboardMetrics>()
                ?? throw new Exception("Failed to get metrics");
        }

        /// <summary>
        /// Get alerts
        /// </summary>
        public async Task<List<Alert>> GetAlertsAsync(string? agentId = null)
        {
            var path = agentId != null ? $"/alerts?agentId={agentId}" : "/alerts";
            var response = await _httpClient.GetAsync(path);
            response.EnsureSuccessStatusCode();

            var alerts = await response.Content.ReadFromJsonAsync<List<Alert>>();
            return alerts ?? new List<Alert>();
        }

        /// <summary>
        /// Acknowledge an alert
        /// </summary>
        public async Task AcknowledgeAlertAsync(string alertId)
        {
            var data = new Dictionary<string, bool>
            {
                { "acknowledged", true }
            };

            var response = await _httpClient.PatchAsJsonAsync($"/alerts/{alertId}", data);
            response.EnsureSuccessStatusCode();
        }
    }

    // Data classes
    public class Agent
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Status { get; set; }
        public string? Type { get; set; }
        public string? CreatedAt { get; set; }
        public string? LastActive { get; set; }
        public AgentMetrics? Metrics { get; set; }
    }

    public class AgentMetrics
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int FailedTasks { get; set; }
        public double AverageLatency { get; set; }
        public int TokensUsed { get; set; }
        public double CostUSD { get; set; }
    }

    public class Alert
    {
        public string? Id { get; set; }
        public string? AgentId { get; set; }
        public string? Severity { get; set; }
        public string? Message { get; set; }
        public string? Timestamp { get; set; }
        public bool Acknowledged { get; set; }
    }

    public class DashboardMetrics
    {
        public int TotalAgents { get; set; }
        public int ActiveAgents { get; set; }
        public int TotalTasks { get; set; }
        public double SuccessRate { get; set; }
        public double AverageLatency { get; set; }
        public double TotalCost { get; set; }
        public double Uptime { get; set; }
    }
}
