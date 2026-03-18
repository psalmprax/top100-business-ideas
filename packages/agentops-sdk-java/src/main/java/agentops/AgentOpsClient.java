package agentops;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.apache.hc.client5.http.classic.methods.*;
import org.apache.hc.client5.http.impl.classic.*;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

/**
 * Agent Ops Sentinel SDK - Java Client
 * AI Agent Monitoring & Management Platform
 */
public class AgentOpsClient {
    
    private final String apiKey;
    private final String endpoint;
    private final CloseableHttpClient httpClient;
    private final Gson gson;
    private String agentId;
    
    public AgentOpsClient(String apiKey) {
        this(apiKey, "https://api.agentops.dev");
    }
    
    public AgentOpsClient(String apiKey, String endpoint) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.httpClient = HttpClients.createDefault();
        this.gson = new Gson();
    }
    
    /**
     * Register an agent with Agent Ops
     */
    public Agent registerAgent(String name, String agentType) throws IOException {
        JsonObject data = new JsonObject();
        data.addProperty("name", name);
        data.addProperty("type", agentType);
        
        JsonObject response = doRequest("POST", "/agents", data);
        
        Agent agent = gson.fromJson(response, Agent.class);
        this.agentId = agent.getId();
        return agent;
    }
    
    /**
     * Send a heartbeat to indicate the agent is alive
     */
    public void heartbeat() throws IOException {
        if (agentId == null) {
            throw new IllegalStateException("Agent not registered");
        }
        
        JsonObject data = new JsonObject();
        data.addProperty("timestamp", Instant.now().toString());
        
        doRequest("POST", "/agents/" + agentId + "/heartbeat", data);
    }
    
    /**
     * Report a task completion
     */
    public void reportTaskComplete(String taskId, Map<String, Object> metadata) throws IOException {
        if (agentId == null) {
            throw new IllegalStateException("Agent not registered");
        }
        
        JsonObject data = new JsonObject();
        data.addProperty("taskId", taskId);
        data.addProperty("status", "completed");
        data.add("metadata", gson.toJsonTree(metadata != null ? metadata : new HashMap<>()));
        
        doRequest("POST", "/agents/" + agentId + "/tasks", data);
    }
    
    /**
     * Report a task failure
     */
    public void reportTaskFailed(String taskId, String error) throws IOException {
        if (agentId == null) {
            throw new IllegalStateException("Agent not registered");
        }
        
        JsonObject data = new JsonObject();
        data.addProperty("taskId", taskId);
        data.addProperty("status", "failed");
        data.addProperty("error", error);
        
        doRequest("POST", "/agents/" + agentId + "/tasks", data);
    }
    
    /**
     * Log an event
     */
    public void log(String level, String message, Map<String, Object> metadata) throws IOException {
        if (agentId == null) {
            throw new IllegalStateException("Agent not registered");
        }
        
        JsonObject data = new JsonObject();
        data.addProperty("level", level);
        data.addProperty("message", message);
        data.add("metadata", gson.toJsonTree(metadata != null ? metadata : new HashMap<>()));
        
        doRequest("POST", "/agents/" + agentId + "/logs", data);
    }
    
    /**
     * Get all agents
     */
    public List<Agent> getAgents() throws IOException {
        JsonArray response = doRequestArray("GET", "/agents", null);
        
        List<Agent> agents = new ArrayList<>();
        for (int i = 0; i < response.size(); i++) {
            agents.add(gson.fromJson(response.get(i), Agent.class));
        }
        return agents;
    }
    
    /**
     * Get a specific agent
     */
    public Agent getAgent(String agentId) throws IOException {
        JsonObject response = doRequest("GET", "/agents/" + agentId, null);
        return gson.fromJson(response, Agent.class);
    }
    
    /**
     * Get dashboard metrics
     */
    public DashboardMetrics getDashboardMetrics() throws IOException {
        JsonObject response = doRequest("GET", "/dashboard/metrics", null);
        return gson.fromJson(response, DashboardMetrics.class);
    }
    
    /**
     * Get alerts
     */
    public List<Alert> getAlerts(String agentId) throws IOException {
        String path = agentId != null ? "/alerts?agentId=" + agentId : "/alerts";
        JsonArray response = doRequestArray("GET", path, null);
        
        List<Alert> alerts = new ArrayList<>();
        for (int i = 0; i < response.size(); i++) {
            alerts.add(gson.fromJson(response.get(i), Alert.class));
        }
        return alerts;
    }
    
    /**
     * Acknowledge an alert
     */
    public void acknowledgeAlert(String alertId) throws IOException {
        JsonObject data = new JsonObject();
        data.addProperty("acknowledged", true);
        
        doRequest("PATCH", "/alerts/" + alertId, data);
    }
    
    private JsonObject doRequest(String method, String path, JsonObject data) throws IOException {
        HttpRequestBase request;
        
        switch (method) {
            case "POST":
                HttpPost post = new HttpPost(endpoint + path);
                if (data != null) {
                    post.setEntity(new org.apache.hc.core5.http.StringEntity(data.toString()));
                }
                request = post;
                break;
            case "PATCH":
                HttpPatch patch = new HttpPatch(endpoint + path);
                if (data != null) {
                    patch.setEntity(new org.apache.hc.core5.http.StringEntity(data.toString()));
                }
                request = patch;
                break;
            case "GET":
            default:
                request = new HttpGet(endpoint + path);
        }
        
        request.setHeader("Authorization", "Bearer " + apiKey);
        request.setHeader("Content-Type", "application/json");
        
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() >= 400) {
                throw new IOException("API request failed with status: " + response.getCode());
            }
            
            if (response.getEntity() == null) {
                return new JsonObject();
            }
            
            return gson.fromJson(
                new java.io.BufferedReader(
                    new java.io.InputStreamReader(response.getEntity().getContent())
                ),
                JsonObject.class
            );
        }
    }
    
    private JsonArray doRequestArray(String method, String path, JsonObject data) throws IOException {
        HttpGet request = new HttpGet(endpoint + path);
        request.setHeader("Authorization", "Bearer " + apiKey);
        request.setHeader("Content-Type", "application/json");
        
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() >= 400) {
                throw new IOException("API request failed with status: " + response.getCode());
            }
            
            if (response.getEntity() == null) {
                return new JsonArray();
            }
            
            return gson.fromJson(
                new java.io.BufferedReader(
                    new java.io.InputStreamReader(response.getEntity().getContent())
                ),
                JsonArray.class
            );
        }
    }
    
    // Data classes
    public static class Agent {
        private String id;
        private String name;
        private String status;
        private String type;
        private String createdAt;
        private String lastActive;
        private AgentMetrics metrics;
        
        public String getId() { return id; }
        public String getName() { return name; }
        public String getStatus() { return status; }
        public String getType() { return type; }
    }
    
    public static class AgentMetrics {
        private int totalTasks;
        private int completedTasks;
        private int failedTasks;
        private double averageLatency;
        private int tokensUsed;
        private double costUSD;
        
        public int getTotalTasks() { return totalTasks; }
    }
    
    public static class Alert {
        private String id;
        private String agentId;
        private String severity;
        private String message;
        private String timestamp;
        private boolean acknowledged;
        
        public String getId() { return id; }
    }
    
    public static class DashboardMetrics {
        private int totalAgents;
        private int activeAgents;
        private int totalTasks;
        private double successRate;
        private double averageLatency;
        private double totalCost;
        private double uptime;
        
        public int getTotalAgents() { return totalAgents; }
    }
}
