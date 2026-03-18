/**
 * Agent Ops Sentinel SDK
 * AI Agent Monitoring & Management Platform
 * 
 * @package @agentops/sdk
 * @version 1.0.0
 */

import axios, { AxiosInstance } from 'axios';

// WebSocket type for browser/Node.js compatibility
type WebSocketType = {
    on(event: string, handler: (data: unknown) => void): void;
    send(data: string): void;
    close(): void;
};

// WebSocket implementation - uses a simple fallback
// For production, install the 'ws' package and use it in Node.js environments
type WebSocketImplementation = new (url: string) => WebSocketType;

// Default implementation - works in browser with native WebSocket
// For Node.js, you would use the 'ws' package
class DefaultWebSocket implements WebSocketType {
    private ws: unknown = null;

    constructor(url: string) {
        // This will use native WebSocket in browser
        // In Node.js, you'll need to use the 'ws' package
        try {
            // @ts-ignore - WebSocket is available in browser
            this.ws = new WebSocket(url);
        } catch {
            // Fallback for non-browser environments
        }
    }

    on(event: string, handler: (data: unknown) => void): void {
        if (this.ws && typeof this.ws === 'object') {
            const ws = this.ws as { onmessage?: (e: { data: unknown }) => void };
            if (ws.onmessage === undefined && event === 'message') {
                // @ts-ignore
                this.ws.onmessage = handler;
            }
        }
    }

    send(data: string): void {
        if (this.ws && typeof this.ws === 'object') {
            const ws = this.ws as { send?: (d: string) => void };
            ws.send?.(data);
        }
    }

    close(): void {
        if (this.ws && typeof this.ws === 'object') {
            const ws = this.ws as { close?: () => void };
            ws.close?.();
        }
    }
}

let WebSocketImpl: WebSocketImplementation = DefaultWebSocket;

// Types
export interface AgentConfig {
    apiKey: string;
    endpoint?: string;
    environment?: 'production' | 'staging' | 'development';
}

export interface Agent {
    id: string;
    name: string;
    status: 'active' | 'idle' | 'error' | 'paused';
    type: string;
    createdAt: Date;
    lastActive: Date;
    metrics: AgentMetrics;
}

export interface AgentMetrics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageLatency: number;
    tokensUsed: number;
    costUSD: number;
}

export interface Alert {
    id: string;
    agentId: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    acknowledged: boolean;
}

export interface LogEntry {
    id: string;
    agentId: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

export interface Trace {
    id: string;
    agentId: string;
    name: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    status: 'running' | 'completed' | 'failed';
    spans: Span[];
}

export interface Span {
    id: string;
    traceId: string;
    name: string;
    startTime: Date;
    endTime?: number;
    duration?: number;
    attributes?: Record<string, unknown>;
}

export interface DashboardMetrics {
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    successRate: number;
    averageLatency: number;
    totalCost: number;
    uptime: number;
}

export interface SSOConfig {
    provider: 'okta' | 'azure-ad' | 'google' | 'saml';
    clientId: string;
    clientSecret: string;
    tenantId?: string;
    metadataUrl?: string;
}

export interface SCIMConfig {
    enabled: boolean;
    baseUrl: string;
    secret: string;
}

/**
 * AgentOps Client
 * Main SDK client for interacting with Agent Ops Sentinel
 */
export class AgentOpsClient {
    private client: AxiosInstance;
    private ws?: WebSocketType;
    private apiKey: string;
    private agentId?: string;

    constructor(config: AgentConfig) {
        this.apiKey = config.apiKey;
        const baseURL = config.endpoint || 'https://api.agentops.dev';

        this.client = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        // Add interceptors for error handling
        this.client.interceptors.response.use(
            response => response,
            error => {
                console.error('[AgentOps] API Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Initialize agent registration with Agent Ops
     * @param agentName - Name of the AI agent
     * @param agentType - Type/category of the agent
     */
    async registerAgent(agentName: string, agentType: string): Promise<Agent> {
        try {
            const response = await this.client.post('/agents', {
                name: agentName,
                type: agentType,
            });
            this.agentId = response.data.id;
            return response.data;
        } catch (error) {
            console.error('[AgentOps] Failed to register agent:', error);
            throw error;
        }
    }

    /**
     * Track agent heartbeat - call periodically to show agent is alive
     */
    async heartbeat(): Promise<void> {
        if (!this.agentId) {
            throw new Error('Agent not registered. Call registerAgent() first.');
        }
        await this.client.post(`/agents/${this.agentId}/heartbeat`, {
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Report task completion
     */
    async reportTaskComplete(taskId: string, metadata?: Record<string, unknown>): Promise<void> {
        if (!this.agentId) throw new Error('Agent not registered');
        await this.client.post(`/agents/${this.agentId}/tasks`, {
            taskId,
            status: 'completed',
            metadata,
        });
    }

    /**
     * Report task failure
     */
    async reportTaskFailed(taskId: string, error: string): Promise<void> {
        if (!this.agentId) throw new Error('Agent not registered');
        await this.client.post(`/agents/${this.agentId}/tasks`, {
            taskId,
            status: 'failed',
            error,
        });
    }

    /**
     * Log an event
     */
    async log(level: LogEntry['level'], message: string, metadata?: Record<string, unknown>): Promise<void> {
        if (!this.agentId) throw new Error('Agent not registered');
        await this.client.post(`/agents/${this.agentId}/logs`, {
            level,
            message,
            metadata,
        });
    }

    /**
     * Start a trace
     */
    async startTrace(name: string): Promise<string> {
        if (!this.agentId) throw new Error('Agent not registered');
        const response = await this.client.post(`/agents/${this.agentId}/traces`, {
            name,
            startTime: new Date().toISOString(),
        });
        return response.data.id;
    }

    /**
     * End a trace
     */
    async endTrace(traceId: string, status: Trace['status']): Promise<void> {
        if (!this.agentId) throw new Error('Agent not registered');
        await this.client.patch(`/agents/${this.agentId}/traces/${traceId}`, {
            endTime: new Date().toISOString(),
            status,
        });
    }

    /**
     * Add span to trace
     */
    async addSpan(traceId: string, name: string, attributes?: Record<string, unknown>): Promise<string> {
        if (!this.agentId) throw new Error('Agent not registered');
        const response = await this.client.post(`/agents/${this.agentId}/traces/${traceId}/spans`, {
            name,
            attributes,
        });
        return response.data.id;
    }

    /**
     * Get all agents
     */
    async getAgents(): Promise<Agent[]> {
        const response = await this.client.get('/agents');
        return response.data;
    }

    /**
     * Get specific agent
     */
    async getAgent(agentId: string): Promise<Agent> {
        const response = await this.client.get(`/agents/${agentId}`);
        return response.data;
    }

    /**
     * Get agent metrics
     */
    async getAgentMetrics(agentId: string): Promise<AgentMetrics> {
        const response = await this.client.get(`/agents/${agentId}/metrics`);
        return response.data;
    }

    /**
     * Get dashboard metrics
     */
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        const response = await this.client.get('/dashboard/metrics');
        return response.data;
    }

    /**
     * Get alerts
     */
    async getAlerts(agentId?: string): Promise<Alert[]> {
        const params = agentId ? { agentId } : {};
        const response = await this.client.get('/alerts', { params });
        return response.data;
    }

    /**
     * Acknowledge alert
     */
    async acknowledgeAlert(alertId: string): Promise<void> {
        await this.client.patch(`/alerts/${alertId}`, { acknowledged: true });
    }

    /**
     * Get logs
     */
    async getLogs(agentId: string, options?: { level?: string; limit?: number }): Promise<LogEntry[]> {
        const response = await this.client.get(`/agents/${agentId}/logs`, { params: options });
        return response.data;
    }

    /**
     * Get traces
     */
    async getTraces(agentId: string): Promise<Trace[]> {
        const response = await this.client.get(`/agents/${agentId}/traces`);
        return response.data;
    }

    /**
     * Configure SSO
     */
    async configureSSO(config: SSOConfig): Promise<void> {
        await this.client.post('/sso/configure', config);
    }

    /**
     * Configure SCIM
     */
    async configureSCIM(config: SCIMConfig): Promise<void> {
        await this.client.post('/scim/configure', config);
    }

    /**
     * Connect WebSocket for real-time updates
     */
    connectWebSocket(onMessage: (data: unknown) => void): void {
        const wsUrl = `wss://api.agentops.dev/ws?apiKey=${this.apiKey}`;
        this.ws = new WebSocketImpl(wsUrl);

        this.ws.on('message', (data: unknown) => {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            onMessage(parsed);
        });

        this.ws.on('error', (error) => {
            console.error('[AgentOps] WebSocket error:', error);
        });
    }

    /**
     * Disconnect WebSocket
     */
    disconnectWebSocket(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    }

    /**
     * Destroy client
     */
    destroy(): void {
        this.disconnectWebSocket();
    }
}

// Convenience function to create client
export function createAgentOpsClient(config: AgentConfig): AgentOpsClient {
    return new AgentOpsClient(config);
}

export default AgentOpsClient;
