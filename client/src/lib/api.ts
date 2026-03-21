/**
 * API Service Layer
 * Connects frontend to backend APIs
 * Supports both real API calls and demo mode with mock data
 */

const API_URL = import.meta.env.VITE_API_URL || '';

export interface LLMMetrics {
  p95LatencyMs: number;
  avgLatencyMs: number;
  throughput: number; // tokens/sec
  errorRate: number;
  costPer1k: number;
  uptime: number;
}

export interface LLMProviderConfig {
  id: string;
  name: string;
  provider: "deepseek" | "google" | "openai" | "anthropic" | "meta" | "local";
  model: string;
  status: "active" | "degraded" | "down";
  isPrimary: boolean;
  failoverPriority: number;
  apiKeySet: boolean;
  metrics: LLMMetrics;
}


// Helper to get auth token
function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

// Check if we're in demo mode
function isDemoMode(): boolean {
    return localStorage.getItem('demo_mode') === 'true' || localStorage.getItem('auth_token') === 'demo-token-for-testing';
}

// Helper for API requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    const demoMode = isDemoMode();
    console.log(`[API_DEBUG] Request to ${endpoint}, demoMode: ${demoMode}`);

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Normalize endpoints: Go API Gateway handles /api/v1/* and proxies /ml/* to Python
    let normalizedEndpoint = endpoint;
    const v1Prefix = '/api/v1';

    // Legacy mapping: if endpoint starts with /agents, /rules, /metrics, /compliance, /deepfake, /billing, /alerts
    const legacyRoutes = ['/agents', '/rules', '/metrics', '/compliance', '/deepfake', '/billing', '/alerts', '/webhooks', '/multi-cloud', '/self-healing'];
    if (legacyRoutes.some(route => endpoint.startsWith(route)) && !endpoint.startsWith(v1Prefix) && !endpoint.startsWith('/ml/')) {
        normalizedEndpoint = `${v1Prefix}${endpoint}`;
    }

    console.log(`[API Proxy] Request: ${API_URL}${normalizedEndpoint} (Method: ${options.method || 'GET'})`);

    try {
        const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (e: any) {
        // Fallback to mock data on ANY network failure, 404, 501, or CORS error if demo mode is enabled
        if (demoMode) {
            console.warn(`[API Failover] Request to ${normalizedEndpoint} failed (${e.message}). Falling back to mock/simulation data...`);
            return getMockResponse<T>(endpoint, options.method || 'GET', options.body);
        } else {
            console.error(`[API Error] Request failed and demoMode is false:`, e);
            throw e;
        }
    }
}

// Mock response generator for demo mode
function getMockResponse<T>(endpoint: string, method: string, body?: any): T {
    const id = Math.random().toString(36).substr(2, 9);

    // Training modules
    if (endpoint.includes('/training/modules') && method === 'GET') {
        return [
            { id: 'mod-001', title: 'EU AI Act Fundamentals', category: 'Regulatory', description: 'Introduction to the EU Artificial Intelligence Act and its core requirements for deploying AI systems in the European market.', duration_minutes: 30, progress: 100, status: 'completed' },
            { id: 'mod-002', title: 'High-Risk AI Systems', category: 'Technical', description: 'Understanding the classification and conformity assessment requirements for high-risk AI systems under Annex III.', duration_minutes: 45, progress: 45, status: 'in_progress' },
            { id: 'mod-003', title: 'Data Governance & Bias Detection', category: 'Data Science', description: 'Learn to identify, measure, and mitigate bias in AI training data using disparate impact analysis.', duration_minutes: 25, progress: 0, status: 'not_started' },
            { id: 'mod-004', title: 'Technical Documentation Workshop', category: 'Compliance', description: 'Hands-on workshop for creating AI Act technical documentation packages including model cards and data lineage.', duration_minutes: 60, progress: 0, status: 'not_started' },
            { id: 'mod-005', title: 'Compliance Audit Simulation', category: 'Audit', description: 'Practice conducting a full compliance audit of an AI recruitment system with real-world scenarios.', duration_minutes: 90, progress: 0, status: 'not_started' }
        ] as T;
    }

    // Edge deployments
    if (endpoint.includes('/edge/deployments') && method === 'GET') {
        return [
            { id: 'edge-001', name: 'Assembly Line Controller', status: 'online', location: 'Factory Floor A - Assembly Line 1', model_version: '2.4.1', requests_count: 12847, device_type: 'plc_controller', logs_pending: 0 },
            { id: 'edge-002', name: 'Quality Vision System', status: 'online', location: 'Factory Floor B - Quality Control', model_version: '3.1.0', requests_count: 8432, device_type: 'vision_system', logs_pending: 3 },
            { id: 'edge-003', name: 'Robotic Arm Controller', status: 'offline', location: 'Warehouse - Robotic Arm Station', model_version: '1.8.5', requests_count: 2190, device_type: 'robot_controller', logs_pending: 12 }
        ] as T;
    }

    // Shadow AI detections
    if (endpoint.includes('/shadow-ai/detections') && method === 'GET') {
        return [
            { id: 'det-1', tool_name: 'ChatGPT', vendor: 'OpenAI', department: 'Engineering', risk_level: 'high', status: 'open', detected_at: new Date().toISOString() },
            { id: 'det-2', tool_name: 'Claude', vendor: 'Anthropic', department: 'Research', risk_level: 'medium', status: 'investigating', detected_at: new Date().toISOString() },
            { id: 'det-3', tool_name: 'Midjourney', vendor: 'Midjourney Inc', department: 'Marketing', risk_level: 'low', status: 'approved', detected_at: new Date().toISOString() }
        ] as T;
    }

    // Vendors
    if (endpoint.includes('/vendors') && method === 'GET') {
        return [
            { id: 'vend-1', name: 'OpenAI', type: 'model', riskLevel: 'low', complianceStatus: 'approved' },
            { id: 'vend-2', name: 'Anthropic', type: 'model', riskLevel: 'low', complianceStatus: 'approved' },
            { id: 'vend-3', name: 'HuggingFace', type: 'model', riskLevel: 'medium', complianceStatus: 'pending' }
        ] as T;
    }

    // Travel kiosks
    if (endpoint.includes('/travel/kiosks') && method === 'GET') {
        return [
            { id: 'kiosk-1', location: 'Airport Terminal A', status: 'operational' },
            { id: 'kiosk-2', location: 'Train Station Main', status: 'operational' }
        ] as T;
    }

    // Crypto wallets
    if (endpoint.includes('/crypto/wallets') && method === 'GET') {
        return [
            { id: 'wallet-1', wallet_address: '0x1234...', blockchain: 'Ethereum', protection_enabled: true },
            { id: 'wallet-2', wallet_address: '0x5678...', blockchain: 'Bitcoin', protection_enabled: false }
        ] as T;
    }

    // Wearable devices
    if (endpoint.includes('/wearable/devices') && method === 'GET') {
        return [
            { id: 'wear-1', device_type: 'Apple Watch', status: 'paired', user_id: 'demo-user' }
        ] as T;
    }

    // Agents list (GET)
    if (endpoint.includes('/agents') && method === 'GET') {
        return [
            {
                id: 'agent-1',
                name: 'Customer Support Agent',
                type: 'langgraph',
                status: 'active',
                budget: 50,
                dailySpend: 32.50,
                config: { provider: 'openai', model: 'gpt-4o' },
                metrics: { costSaved: 124.50, loopsPrevented: 12 }
            },
            {
                id: 'agent-2',
                name: 'Research Agent',
                type: 'crewai',
                status: 'active',
                budget: 5,
                dailySpend: 4.20,
                config: { provider: 'anthropic', model: 'claude-3-sonnet' },
                metrics: { costSaved: 42.10, loopsPrevented: 3 }
            }
        ] as T;
    }

    // Workforce Actions
    if (endpoint.includes('/workforce/actions') && method === 'GET') {
        return workforceActions as unknown as T;
    }

    // Workforce Campaigns
    if (endpoint.includes('/workforce/campaigns') && method === 'GET') {
        return outreachCampaigns as unknown as T;
    }

    // Alpha Products Status (Operational Engine)
    if (endpoint.includes('/workforce/products-status') && method === 'GET') {
        return getAlphaProductsStatus() as unknown as T;
    }

    // Rules list (GET)
    if (endpoint.includes('/rules') && method === 'GET') {
        return [
            { id: 'rule-1', name: 'Daily Budget Cap', enabled: true, type: 'budget_cap', action: 'alert', dailyLimit: 50 },
            { id: 'rule-2', name: 'Loop Prevention', enabled: true, type: 'loop_prevention', action: 'pause', maxIterations: 10 }
        ] as T;
    }

    // Multi-cloud status (GET)
    if (endpoint.includes('/multi-cloud/status') && method === 'GET') {
        return [
            { provider: 'aws', region: 'us-east-1', status: 'healthy', agents_count: 5, latency_ms: 45 },
            { provider: 'gcp', region: 'europe-west1', status: 'healthy', agents_count: 3, latency_ms: 62 },
            { provider: 'azure', region: 'eastus', status: 'degraded', agents_count: 2, latency_ms: 120 }
        ] as T;
    }

    // On-prem manifest (GET/POST)
    if (endpoint.includes('/on-prem/manifest')) {
        return { manifest: 'version: "3.9"\nservices:\n  agent:\n    image: alpha/agent:latest\n    environment:\n      - MODE=on-prem' } as T;
    }

    const data = body ? JSON.parse(body) : {};

    // Agents POST
    if (endpoint.includes('/agents') && method === 'POST') {
        return {
            id: `agent-${id}`,
            name: data.name || 'New Agent',
            type: data.type || 'langgraph',
            status: 'active',
            budget: data.budget || 10,
            dailySpend: 0,
            config: data.config || { provider: 'openai', model: 'gpt-4o', maxTokens: 100000, temperature: 0.7 },
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString()
        } as T;
    }

    // Agents DELETE
    if (endpoint.includes('/agents') && method === 'DELETE') {
        return { success: true, message: 'Agent decommissioned' } as T;
    }

    // Agents PUT
    if (endpoint.includes('/agents') && method === 'PUT') {
        return { success: true, message: 'Agent updated' } as T;
    }

    // Rules POST
    if (endpoint.includes('/rules') && method === 'POST') {
        return {
            id: `rule-${id}`,
            name: 'New Rule',
            enabled: true,
            type: 'budget_cap',
            action: 'alert'
        } as T;
    }

    // Alerts POST
    if (endpoint.includes('/alerts') && method === 'POST') {
        return {
            id: `alert-${id}`,
            name: 'New Alert',
            type: 'slack',
            channel: 'alerts',
            enabled: true,
            threshold: 75
        } as T;
    }

    // Alerts list (GET)
    if (endpoint.includes('/alerts') && method === 'GET') {
        return [
            { id: 'alert-1', name: 'Budget Alert', type: 'slack', channel: '#alerts', enabled: true, threshold: 75 },
            { id: 'alert-2', name: 'Error Alert', type: 'email', channel: 'admin@company.com', enabled: true, threshold: 90 }
        ] as T;
    }


    if (endpoint.includes('/webhooks') && method === 'DELETE') {
        return { success: true } as T;
    }

    if (endpoint.includes('/webhooks') && endpoint.includes('/test')) {
        return { status: 'success', message: 'Webhook test delivered' } as T;
    }

    // Multi-cloud
    if (endpoint.includes('/multi-cloud') && endpoint.includes('/failover')) {
        return { message: 'Failover initiated successfully', from: 'aws-east-1', to: 'gcp-west-2' } as T;
    }

    // Compliance - Models
    if (endpoint.includes('/compliance/models') && !endpoint.includes('/guardrails') && method === 'GET') {
        return [
            {
                id: '1', name: 'Credit Scoring Model v2.1', riskCategory: 'high', status: 'compliant',
                complianceScore: 94, lastAudit: new Date('2024-11-01').toISOString(),
                activeBiasMitigation: true, toxicLanguageFilter: true, promptPrivacyGuard: false,
                articles: [
                    { article: 'Article 9', title: 'Risk Management', status: 'compliant', evidence: 'risk_mgmt_v2.pdf' },
                    { article: 'Article 10', title: 'Data Governance', status: 'compliant', evidence: 'data_governance.pdf' },
                    { article: 'Article 11', title: 'Technical Documentation', status: 'compliant', evidence: 'tech_docs_v2.pdf' },
                    { article: 'Article 14', title: 'Accuracy & Robustness', status: 'compliant', evidence: 'accuracy_report.pdf' },
                    { article: 'Article 61', title: 'Post-Market Monitoring', status: 'non_compliant' },
                ],
            },
            {
                id: '2', name: 'Resume Screening AI', riskCategory: 'high', status: 'non_compliant',
                complianceScore: 68, lastAudit: new Date('2024-10-15').toISOString(),
                activeBiasMitigation: false, toxicLanguageFilter: true, promptPrivacyGuard: false,
                articles: [
                    { article: 'Article 9', title: 'Risk Management', status: 'compliant', evidence: 'risk_mgmt_v1.pdf' },
                    { article: 'Article 10', title: 'Data Governance', status: 'non_compliant' },
                    { article: 'Article 11', title: 'Technical Documentation', status: 'pending' },
                    { article: 'Article 14', title: 'Accuracy & Robustness', status: 'compliant', evidence: 'accuracy_v1.pdf' },
                    { article: 'Article 61', title: 'Post-Market Monitoring', status: 'non_compliant' },
                ],
            },
            {
                id: '3', name: 'Customer Chatbot v3', riskCategory: 'limited', status: 'compliant',
                complianceScore: 88, lastAudit: new Date('2024-11-05').toISOString(),
                activeBiasMitigation: true, toxicLanguageFilter: false, promptPrivacyGuard: true,
                articles: [
                    { article: 'Article 50', title: 'Transparency', status: 'compliant' },
                    { article: 'Article 52', title: 'AI-generated Content', status: 'compliant' },
                ],
            },
        ] as T;
    }

    // Compliance - Register Model (POST)
    if (endpoint.includes('/compliance/models') && !endpoint.includes('/guardrails') && method === 'POST') {
        const modelData = body ? JSON.parse(body) : {};
        const score = modelData.endpointUrl ? Math.floor(Math.random() * 30) + 65 : 0;
        return {
            id: `model-${id}`,
            name: modelData.name || 'New Model',
            riskCategory: modelData.riskCategory || 'high',
            status: score >= 80 ? 'compliant' : score > 0 ? 'non_compliant' : 'pending',
            complianceScore: score,
            lastAudit: new Date().toISOString(),
            activeBiasMitigation: false,
            toxicLanguageFilter: false,
            promptPrivacyGuard: false,
            articles: [
                { article: 'Article 9', title: 'Risk Management', status: score >= 80 ? 'compliant' : 'pending' },
                { article: 'Article 10', title: 'Data Governance', status: score >= 70 ? 'compliant' : 'non_compliant' },
                { article: 'Article 11', title: 'Technical Documentation', status: 'pending' },
            ],
        } as T;
    }

    // Compliance - Update Guardrails (PATCH/PUT)
    if (endpoint.includes('/guardrails') && (method === 'PATCH' || method === 'PUT')) {
        const guardrailData = body ? JSON.parse(body) : {};
        return { success: true, ...guardrailData } as T;
    }

    // Compliance - Connections
    if (endpoint.includes('/compliance/connections') && method === 'GET') {
        return [
            { id: 'conn-1', article_id: 'Article 9', connection_type: 'ml_pipeline', status: 'active', created_at: new Date().toISOString() },
            { id: 'conn-2', article_id: 'Article 10', connection_type: 'data_lakehouse', status: 'active', created_at: new Date().toISOString() },
        ] as T;
    }

    // Compliance - Scans
    if (endpoint.includes('/compliance/scans') && method === 'GET') {
        return [
            { id: 'scan-1', article_id: 'Article 9', scan_type: 'red_team', status: 'completed', results: { metrics: { anomalies_detected: 2, threat_level: 'medium' } }, created_at: new Date().toISOString() },
            { id: 'scan-2', article_id: 'Article 10', scan_type: 'penetration', status: 'completed', results: { metrics: { anomalies_detected: 0, threat_level: 'low' } }, created_at: new Date().toISOString() },
        ] as T;
    }

    // Compliance - Bias Scan (trigger)
    if (endpoint.includes('/compliance') && endpoint.includes('/bias') && method === 'POST') {
        return {
            reports: [
                { id: `br-${id}-1`, modelId: '1', biasCategory: 'Gender', disparateImpact: 0.98, statisticalSignificance: 0.92, status: 'passed', details: 'No significant disparate impact detected' },
                { id: `br-${id}-2`, modelId: '1', biasCategory: 'Race', disparateImpact: 0.85, statisticalSignificance: 0.89, status: 'warning', details: 'Minor disparate impact detected in subgroup analysis' },
                { id: `br-${id}-3`, modelId: '1', biasCategory: 'Age', disparateImpact: 0.72, statisticalSignificance: 0.95, status: 'failed', details: 'Significant disparate impact. Candidates over 50 disadvantaged.' },
                { id: `br-${id}-4`, modelId: '1', biasCategory: 'Disability', disparateImpact: 0.91, statisticalSignificance: 0.78, status: 'passed', details: 'No significant bias detected' },
                { id: `br-${id}-5`, modelId: '1', biasCategory: 'Socioeconomic', disparateImpact: 0.82, statisticalSignificance: 0.88, status: 'warning', details: 'Lower income groups receive fewer positive outcomes' },
                { id: `br-${id}-6`, modelId: '1', biasCategory: 'Religion', disparateImpact: 0.96, statisticalSignificance: 0.71, status: 'passed', details: 'No significant bias detected' },
            ],
        } as T;
    }

    if (endpoint.includes('/compliance') && endpoint.includes('/hipaa')) {
        return "COMPLIANT" as unknown as T;
    }

    if (endpoint.includes('/compliance') && endpoint.includes('/sox')) {
        return "COMPLIANT" as unknown as T;
    }

    if (endpoint.includes('/compliance') && endpoint.includes('/eu-register')) {
        return { registration_id: `eu-${id}`, status: 'registered', timestamp: new Date().toISOString() } as T;
    }

    if (endpoint.includes('/compliance') && endpoint.includes('/red-team')) {
        return { audit_id: `redteam-${id}`, status: 'scheduled', timestamp: new Date().toISOString() } as T;
    }

    if (endpoint.includes('/compliance') && endpoint.includes('/incident')) {
        return { incident_id: `incident-${id}`, status: 'reported', timestamp: new Date().toISOString() } as T;
    }

    // Deepfake
    if (endpoint.includes('/deepfake/stats') && method === 'GET') {
        return {
            totalAnalyses: 12480,
            threatsDetected: 842,
            verificationRate: 0.985,
            blockedAttempts: 156
        } as T;
    }

    if (endpoint.includes('/deepfake/challenge') && method === 'POST') {
        const challengeId = `CHL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        return {
            id: challengeId,
            challenge: `AUTH_CHALLENGE_${Math.random().toString(36).substring(2, 20).toUpperCase()}`,
            user_id: data.user_id || 'demo_user',
            timestamp: new Date().toISOString()
        } as T;
    }

    if (endpoint.includes('/deepfake/verify') && method === 'POST') {
        return {
            verified: true,
            confidence: 0.992,
            hardware_attestation: 'verified_secure_enclave',
            timestamp: new Date().toISOString()
        } as T;
    }

    if (endpoint.includes('/deepfake/verify')) {
        return { status: 'verified', confidence: 0.98, timestamp: new Date().toISOString() } as T;
    }

    if (endpoint.includes('/deepfake/document')) {
        return { document_type: 'passport', verified: true, timestamp: new Date().toISOString() } as T;
    }

    // Edge
    if (endpoint.includes('/edge') && endpoint.includes('/sync')) {
        return { status: 'synced', timestamp: new Date().toISOString() } as T;
    }

    // Shadow AI
    if (endpoint.includes('/shadow-ai') && endpoint.includes('/remediate')) {
        return { status: 'remediation_started', timestamp: new Date().toISOString() } as T;
    }

    // Crypto
    if (endpoint.includes('/crypto') && endpoint.includes('/verify')) {
        return { verified: true, liveness: 'pass', timestamp: new Date().toISOString() } as T;
    }

    // Wearable
    if (endpoint.includes('/wearable') && endpoint.includes('/pair')) {
        return { device_id: `wearable-${id}`, paired: true, timestamp: new Date().toISOString() } as T;
    }

    // Agent Ops Audit (UC 10)
    if (endpoint.includes('/agent-ops/audit') && method === 'GET') {
        return [
            { id: '1', timestamp: new Date().toISOString(), agentId: 'agent-1', agentName: 'Customer Support', action: 'Refund Policy Check', intent: 'Verify eligibility for order #8821', outcome: 'approved', tokens: 450, cost: 0.02, reasoning: 'Policy match confirmed.' },
            { id: '2', timestamp: new Date().toISOString(), agentId: 'agent-2', agentName: 'Research Agent', action: 'Market Scan', intent: 'Competitor price mapping', outcome: 'paused', tokens: 1200, cost: 0.08, reasoning: 'Budget threshold hit.' }
        ] as T;
    }

    // Agent Ops Budget Rules
    if (endpoint.includes('/agent-ops/rules/budget') && method === 'GET') {
        return [
            { id: 'rule-1', name: 'Global Spend Cap', agentIds: ['*'], dailyLimit: 500, priority: 'high', action: 'pause', enabled: true },
            { id: 'rule-2', name: 'Low Priority Throttle', agentIds: ['agent-4'], dailyLimit: 25, priority: 'low', action: 'throttle', enabled: false }
        ] as T;
    }

    // Agent Ops Webhooks
    if (endpoint.includes('/agent-ops/webhooks') && method === 'GET') {
        return [
            { id: 'wh-1', url: 'https://hooks.alpha.com/ops', name: 'Sentinel-E2E-Webhook', events: ['agent_error', 'budget_alert'], enabled: true },
            { id: 'wh-2', url: 'https://security.alpha.com/audit', name: 'Audit Integration', events: ['compliance_violation'], enabled: true }
        ] as T;
    }

    // Agent Ops Cloud Health
    if (endpoint.includes('/agent-ops/models/config') && method === 'GET') {
        return [
            {
                id: 'm-1',
                name: 'DeepSeek V3 (Primary)',
                provider: 'deepseek',
                model: 'deepseek-chat',
                status: 'active',
                isPrimary: true,
                failoverPriority: 1,
                apiKeySet: true,
                metrics: {
                    p95LatencyMs: 450,
                    avgLatencyMs: 380,
                    throughput: 85,
                    errorRate: 0.01,
                    costPer1k: 0.002,
                    uptime: 99.95
                }
            },
            {
                id: 'm-2',
                name: 'Gemini 1.5 Pro (Failover)',
                provider: 'google',
                model: 'gemini-1.5-pro',
                status: 'active',
                isPrimary: false,
                failoverPriority: 2,
                apiKeySet: true,
                metrics: {
                    p95LatencyMs: 620,
                    avgLatencyMs: 510,
                    throughput: 120,
                    errorRate: 0.005,
                    costPer1k: 0.0125,
                    uptime: 99.99
                }
            },
            {
                id: 'm-3',
                name: 'GPT-4o (Emergency)',
                provider: 'openai',
                model: 'gpt-4o',
                status: 'degraded',
                isPrimary: false,
                failoverPriority: 3,
                apiKeySet: false,
                metrics: {
                    p95LatencyMs: 1200,
                    avgLatencyMs: 950,
                    throughput: 60,
                    errorRate: 0.08,
                    costPer1k: 0.03,
                    uptime: 98.5
                }
            }
        ] as T;
    }

    if (endpoint.includes('/agent-ops/cloud/health') && method === 'GET') {
        return {
          regions: [
            { id: 'aws-us-east-1', name: 'N. Virginia (US-East-1)', status: 'healthy', load: 12, latency: 24 },
            { id: 'gcp-europe-west1', name: 'Frankfurt (EU-Central-1)', status: 'healthy', load: 8, latency: 45 },
            { id: 'azure-eastus', name: 'Singapore (AP-Southeast-1)', status: 'healthy', load: 4, latency: 32 }
          ]
        } as T;
    }

    // Self Healing Status
    if (endpoint.includes('/self-healing/status') && method === 'GET') {
        return {
            recent_recoveries: [
                { id: 'rec-1', recovery_type: 'node_restart', status: 'success', timestamp: new Date().toISOString(), message: 'Cluster 7 node recovered' }
            ],
            nodes: [
                { id: 'node-1', status: 'active', load: 45 },
                { id: 'node-2', status: 'active', load: 32 }
            ]
        } as T;
    }

    // SSO Config
    if (endpoint.includes('/sso/config') && method === 'GET') {
        return {
            provider: 'okta',
            status: 'active',
            lastHandshake: new Date().toISOString(),
            id: 'sso-123',
            success: true
        } as T;
    }

    // Default response
    return { success: true, timestamp: new Date().toISOString() } as T;
}


// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
    login: (email: string, password: string) =>
        apiRequest<{ accessToken: string; user: User }>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (email: string, password: string, name: string) =>
        apiRequest<{ accessToken: string; user: User }>('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),

    logout: () =>
        apiRequest<{ message: string }>('/api/v1/auth/logout', {
            method: 'POST',
        }),

    me: () => apiRequest<User>('/api/v1/auth/me'),
};

// ============================================================================
// Agents API
// ============================================================================

export interface Agent {
    id: string;
    name: string;
    type: 'langgraph' | 'crewai' | 'autogen' | 'custom';
    status: 'active' | 'paused' | 'error' | 'stopped';
    budget: number;
    dailySpend: number;
    tier: 'strategic' | 'tactical' | 'industrial';
    config: {
        provider: string;
        model: string;
        maxTokens: number;
        temperature: number;
        rules?: any[];
    };
    environment?: string;
    provider?: string;
    model?: string;
    api_secret?: string;
    metrics?: {
        tasksTotal?: number;
        tasksComplete?: number;
        tasksFailed?: number;
        uptime?: number;
        totalRequests?: number;
        totalTokens?: number;
        totalCost?: number;
        avgLatencyMs?: number;
        errorRate?: number;
        loopCount?: number;
        cacheHits?: number;
        loopsPrevented?: number;
        costSaved?: number;
    };
    createdAt: string | Date;
    lastActiveAt?: string | Date;
}

export const agentsApi = {
    list: () => apiRequest<Agent[]>('/agents'),

    get: (id: string) => apiRequest<Agent>(`/agents/${id}`),

    create: (agent: Partial<Agent>) =>
        apiRequest<Agent>('/agents', {
            method: 'POST',
            body: JSON.stringify(agent),
        }),

    update: (id: string, agent: Partial<Agent>) =>
        apiRequest<Agent>(`/agents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(agent),
        }),

    delete: (id: string) =>
        apiRequest<{ message: string }>(`/agents/${id}`, {
            method: 'DELETE',
        }),

    start: (id: string) =>
        apiRequest<Agent>(`/agents/${id}/start`, { method: 'POST' }),

    stop: (id: string) =>
        apiRequest<Agent>(`/agents/${id}/stop`, { method: 'POST' }),

    restart: (id: string) =>
        apiRequest<Agent>(`/agents/${id}/restart`, { method: 'POST' }),

    logs: (id: string) => apiRequest<AgentLog[]>(`/agents/${id}/logs`),
};

export interface AgentLog {
    id: string;
    agentId: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
}

// ============================================================================
// Rules API
// ============================================================================

export interface Rule {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    config: Record<string, unknown>;
}

export const rulesApi = {
    list: () => apiRequest<Rule[]>('/api/v1/demo/rules'),

    create: (rule: Partial<Rule>) =>
        apiRequest<Rule>('/api/v1/rules', {
            method: 'POST',
            body: JSON.stringify(rule),
        }),

    update: (id: string, rule: Partial<Rule>) =>
        apiRequest<Rule>(`/api/v1/rules/${id}`, {
            method: 'PUT',
            body: JSON.stringify(rule),
        }),

    delete: (id: string) =>
        apiRequest<{ message: string }>(`/api/v1/rules/${id}`, {
            method: 'DELETE',
        }),

    toggle: (id: string, enabled: boolean) =>
        apiRequest<Rule>(`/api/v1/rules/${id}/toggle`, {
            method: 'POST',
            body: JSON.stringify({ enabled }),
        }),
};

// ============================================================================
// Metrics API
// ============================================================================

export interface Metrics {
    totalTokens: number;
    totalCost: number;
    activeAgents: number;
    tasksCompleted: number;
    tasksFailed: number;
    uptime: number;
    hourlyData: Array<{ hour: string; tokens: number; cost: number }>;
}

export const metricsApi = {
    current: () => apiRequest<Metrics>('/api/v1/demo/metrics/current'),

    history: (period: string) =>
        apiRequest<Metrics>(`/api/v1/metrics/history?period=${period}`),

    agent: (agentId: string) =>
        apiRequest<Metrics>(`/api/v1/metrics/agent/${agentId}`),
};

// ============================================================================
// Compliance API
// ============================================================================

export interface ComplianceCheck {
    id: string;
    article: string;
    title: string;
    status: 'compliant' | 'non_compliant' | 'pending';
    evidence?: string;
    lastChecked?: string;
}

export interface ComplianceReport {
    id: string;
    name: string;
    overallScore: number;
    checks: ComplianceCheck[];
    createdAt: string;
}

export const complianceApi = {
    list: () => apiRequest<ComplianceReport[]>('/api/v1/compliance/reports'),

    get: (id: string) => apiRequest<ComplianceReport>(`/api/v1/compliance/reports/${id}`),

    create: (name: string, document: string) =>
        apiRequest<ComplianceReport>('/api/v1/compliance/check', {
            method: 'POST',
            body: JSON.stringify({ name, document }),
        }),

    checkDocument: (document: string, regulations?: string[]) =>
        apiRequest<{
            compliance_score: number;
            violations: Array<{ type: string; severity: string; regulation: string }>;
            recommendations: string[];
        }>('/api/v1/compliance/check-document', {
            method: 'POST',
            body: JSON.stringify({ document, regulations }),
        }),
};

// ============================================================================
// Deepfake API
// ============================================================================

export interface DeepfakeResult {
    is_fake: boolean;
    confidence: number;
    analysis: {
        media_type: string;
        suspicious_elements: string[];
        artifacts_detected: number;
    };
}

export const deepfakeApi = {
    detect: (mediaUrl: string, mediaType: string) =>
        apiRequest<DeepfakeResult>('/ml/deepfake/detect', {
            method: 'POST',
            body: JSON.stringify({ media_url: mediaUrl, media_type: mediaType }),
        }),

    analyze: (mediaUrl: string) =>
        apiRequest<DeepfakeResult>('/api/v1/deepfake/analyze', {
            method: 'POST',
            body: JSON.stringify({ media_url: mediaUrl }),
        }),

    history: () =>
        apiRequest<DeepfakeResult[]>('/api/v1/deepfake/history'),

    getStats: () =>
        apiRequest<any>('/api/v1/deepfake/stats'),

    challenge: (userId: string) =>
        apiRequest<any>(`/api/v1/deepfake/challenge?user_id=${userId}`, {
            method: 'POST',
        }),

    verify: (challengeId: string, signature: string, hardwareId: string) =>
        apiRequest<any>(`/api/v1/deepfake/verify?challenge_id=${challengeId}&signature=${signature}&hardware_id=${hardwareId}`, { method: 'POST' }),

    train: (datasetName: string) =>
        apiRequest<any>(`/api/v1/deepfake/train?dataset_name=${datasetName}`, {
            method: 'POST',
        }),

    test: (modelId: string) =>
        apiRequest<any>(`/api/v1/deepfake/test?model_id=${modelId}`, {
            method: 'POST',
        }),
};

// ============================================================================
// Billing API
// ============================================================================

export interface Subscription {
    id: string;
    plan: 'developer' | 'growth' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}

export interface Invoice {
    id: string;
    amount: number;
    status: 'paid' | 'open' | 'void';
    date: string;
    pdfUrl: string;
}

export const billingApi = {
    subscription: () => apiRequest<Subscription>('/api/v1/billing/subscription'),

    invoices: () => apiRequest<Invoice[]>('/api/v1/billing/invoices'),

    createCheckout: (planId: string) =>
        apiRequest<{ url: string }>('/api/v1/billing/checkout', {
            method: 'POST',
            body: JSON.stringify({ plan_id: planId }),
        }),

    cancel: () =>
        apiRequest<Subscription>('/api/v1/billing/cancel', { method: 'POST' }),

    updatePaymentMethod: (paymentMethodId: string) =>
        apiRequest<Subscription>('/api/v1/billing/payment-method', {
            method: 'PUT',
            body: JSON.stringify({ payment_method_id: paymentMethodId }),
        }),
};

// ============================================================================
// ML Inference API
// ============================================================================

export const mlApi = {
    infer: (modelName: string, inputData: Record<string, unknown>) =>
        apiRequest<Record<string, unknown>>('/ml/infer', {
            method: 'POST',
            body: JSON.stringify({ model_name: modelName, input_data: inputData }),
        }),

    listModels: () =>
        apiRequest<Array<{ name: string; config: Record<string, unknown>; loaded: boolean }>>('/ml/models'),

    classifyAgentOperation: (taskDescription: string, context?: string) =>
        apiRequest<{
            classification: string;
            confidence: number;
            suggestions: string[];
        }>('/ml/agent-ops/classify', {
            method: 'POST',
            body: JSON.stringify({ task_description: taskDescription, context }),
        }),

    checkCompliance: (document: string, regulations?: string[]) =>
        apiRequest<{
            compliance_score: number;
            violations: Array<{ type: string; severity: string }>;
            recommendations: string[];
        }>('/ml/ai-compliance/check', {
            method: 'POST',
            body: JSON.stringify({ document, regulations }),
        }),
};

// ============================================================================
// User API
// ============================================================================

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    subscriptionTier?: string;
    company?: string;
}

export const userApi = {
    update: (updates: Partial<User>) =>
        apiRequest<User>('/api/v1/user', {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),

    updatePassword: (currentPassword: string, newPassword: string) =>
        apiRequest<{ message: string }>('/api/v1/user/password', {
            method: 'PUT',
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        }),

    apiKeys: () => apiRequest<Array<{ id: string; name: string; key: string; createdAt: string }>>('/api/v1/user/api-keys'),

    createApiKey: (name: string) =>
        apiRequest<{ id: string; key: string }>('/api/v1/user/api-keys', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),

    deleteApiKey: (id: string) =>
        apiRequest<{ message: string }>(`/api/v1/user/api-keys/${id}`, {
            method: 'DELETE',
        }),
};

// ============================================================================
// Extended API - Full Sync (Webhooks, Multi-Cloud, Self-Healing, Training, etc.)
// ============================================================================

// Webhook types
export interface WebhookConfig {
    id?: string;
    name: string;
    url: string;
    events: string[];
    enabled: boolean;
    secret?: string;
    created_at?: string;
    type?: string;
}

export interface WebhookExecution {
    id?: string;
    webhook_id: string;
    event: string;
    payload: Record<string, unknown>;
    status: string;
    response_code?: number;
    response_body?: string;
    created_at?: string;
}

// Multi-cloud types
export interface MultiCloudStatus {
    provider: string;
    region: string;
    status: string;
    latency_ms: number;
    agents_count: number;
    last_sync: string;
}

// Self-healing types
export interface SelfHealingEvent {
    id?: string;
    agent_id: string;
    event_type: string;
    severity: string;
    description: string;
    action_taken: string;
    resolved: boolean;
    created_at?: string;
    resolved_at?: string;
}

// Training types
export interface TrainingModule {
    id?: string;
    title: string;
    description: string;
    category: string;
    duration_minutes: number;
    content: string;
    quiz_questions: Record<string, unknown>[];
    created_at?: string;
    status?: 'not_started' | 'in_progress' | 'completed';
    progress?: number;
}

export interface TrainingProgress {
    id?: string;
    user_id: string;
    module_id: string;
    status: string;
    score?: number;
    completed_at?: string;
}

// White-label types
export interface WhiteLabelConfig {
    id?: string;
    brand_name: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    custom_css?: string;
    created_at?: string;
}

// Edge deployment types
export interface EdgeDeployment {
    id?: string;
    name: string;
    location: string;
    status: string;
    model_version: string;
    last_sync?: string;
    requests_count: number;
}

// Shadow AI types
export interface ShadowAIDetection {
    id?: string;
    tool_name: string;
    vendor: string;
    department: string;
    risk_level: string;
    detected_at: string;
    status: string;
}

// Mobile SDK types
export interface MobileSDKConfig {
    id?: string;
    app_name: string;
    platform: string;
    bundle_id: string;
    api_key: string;
    enabled_features: string[];
    created_at?: string;
}

// Wearable types
export interface MobileSDKStatus {
    total_apps: number;
    by_platform: Record<string, number>;
    verifications_today: number;
    avg_verification_time_ms: number;
    version?: string;
    registered_apps?: number;
    api_health?: string;
}

export interface TravelKioskStatus {
    total_kiosks: number;
    active_now: number;
    at_border: number;
    avg_clearance_ms: number;
    location?: string;
    id?: string;
    scan_queue?: number;
    last_threat_type?: string;
}

export interface WearableDevice {
    id?: string;
    device_type: string;
    user_id: string;
    status: string;
    firmware_version: string;
    registered_at?: string;
}

// Travel kiosk types
export interface TravelKiosk {
    id?: string;
    location: string;
    country: string;
    status: string;
    verification_count: number;
    last_maintenance?: string;
}

// Crypto wallet types
export interface CryptoWallet {
    id?: string;
    wallet_address: string;
    blockchain: string;
    protection_enabled: boolean;
    last_verified?: string;
}

// Duress types
export interface DuressConfig {
    id?: string;
    user_id: string;
    panic_phrase: string;
    silent_mode: boolean;
    trigger_action: string;
    enabled: boolean;
}

export interface DuressAlert {
    id?: string;
    user_id: string;
    alert_type: string;
    location?: string;
    status: string;
    created_at?: string;
}

// Alert Config types (Agent Ops UC 4)
export interface AlertConfig {
    id?: string;
    name: string;
    type: string;
    threshold: number;
    enabled: boolean;
    channels: string[];
    created_at?: string;
    updated_at?: string;
}

// Extended API functions
export const extendedApi = {
    // Alerts (Agent Ops UC 4)
    alerts: {
        list: () => apiRequest<AlertConfig[]>('/alerts'),
        create: (alert: AlertConfig) =>
            apiRequest<AlertConfig>('/alerts', {
                method: 'POST',
                body: JSON.stringify(alert),
            }),
        update: (id: string, alert: Partial<AlertConfig>) =>
            apiRequest<AlertConfig>(`/alerts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(alert),
            }),
        delete: (id: string) =>
            apiRequest<{ message: string }>(`/alerts/${id}`, {
                method: 'DELETE',
            }),
    },
    // Webhooks (Agent Ops UC 4, 12)
    webhooks: {
        list: () => apiRequest<WebhookConfig[]>('/api/v1/webhooks'),
        create: (webhook: WebhookConfig) =>
            apiRequest<WebhookConfig>('/api/v1/webhooks', {
                method: 'POST',
                body: JSON.stringify(webhook),
            }),
        update: (id: string, webhook: WebhookConfig) =>
            apiRequest<WebhookConfig>(`/api/v1/webhooks/${id}`, {
                method: 'PUT',
                body: JSON.stringify(webhook),
            }),
        delete: (id: string) =>
            apiRequest<{ message: string }>(`/api/v1/webhooks/${id}`, {
                method: 'DELETE',
            }),
        test: (id: string) =>
            apiRequest<{ message: string; execution_id: string }>(`/api/v1/webhooks/${id}/test`, {
                method: 'POST',
            }),
        verify: (id: string) =>
            apiRequest<{ message: string; execution_id: string }>(`/api/v1/webhooks/${id}/verify`, {
                method: 'POST',
            }),
        executions: (webhookId: string) =>
            apiRequest<WebhookExecution[]>(`/api/v1/webhooks/${webhookId}/executions`),
    },

    // Multi-Cloud (Agent Ops UC 16)
    multiCloud: {
        status: () => apiRequest<MultiCloudStatus[]>('/api/v1/multi-cloud/status'),
        metrics: () =>
            apiRequest<{
                total_requests: number;
                failed_requests: number;
                avg_latency_ms: number;
                cost_usd: number;
            }>('/api/v1/multi-cloud/metrics'),
        failover: (provider: string, targetProvider: string) =>
            apiRequest<{ message: string }>('/api/v1/multi-cloud/failover', {
                method: 'POST',
                body: JSON.stringify({ provider, target_provider: targetProvider }),
            }),
    },

    // Self-Healing (Agent Ops UC 17)
    selfHealing: {
        events: (agentId?: string, resolved?: boolean) => {
            let url = '/api/v1/self-healing/events?';
            if (agentId) url += `agent_id=${agentId}&`;
            if (resolved !== undefined) url += `resolved=${resolved}`;
            return apiRequest<SelfHealingEvent[]>(url);
        },
        createEvent: (event: SelfHealingEvent) =>
            apiRequest<SelfHealingEvent>('/api/v1/self-healing/events', {
                method: 'POST',
                body: JSON.stringify(event),
            }),
        resolveEvent: (eventId: string) =>
            apiRequest<SelfHealingEvent>(`/api/v1/self-healing/events/${eventId}/resolve`, {
                method: 'PUT',
            }),
        stats: () =>
            apiRequest<{
                total_events: number;
                resolved_events: number;
                pending_events: number;
                resolution_rate: number;
            }>('/api/v1/self-healing/stats'),
    },

    // GraphQL Proxy (UC 14, 16, 13)
    graphql: (query: string, variables?: Record<string, unknown>) =>
        apiRequest<{ data: Record<string, unknown> }>('/api/v1/graphql-proxy', {
            method: 'POST',
            body: JSON.stringify({ query, variables }),
        }),

    // Compliance Integration (EU AI Act articles)
    compliance: {
        listModels: () => apiRequest<any[]>('/api/v1/compliance/models'),
        registerModel: (modelData: any) =>
            apiRequest<any>('/api/v1/compliance/models', {
                method: 'POST',
                body: JSON.stringify(modelData),
            }),
        getBiasReports: (modelId: string) => apiRequest<any[]>(`/api/v1/compliance/bias-reports/${modelId}`),
        triggerBiasScan: (modelId: string) =>
            apiRequest<any>('/api/v1/compliance/bias-scan', {
                method: 'POST',
                body: JSON.stringify({ modelId }),
            }),
        updateGuardrails: (modelId: string, guardrails: any) =>
            apiRequest<any>(`/api/v1/compliance/models/${modelId}/guardrails`, {
                method: 'PATCH',
                body: JSON.stringify(guardrails),
            }),

        connectSystem: (article_id: string, connection_type: string, config: any = {}) =>
            apiRequest<any>('/api/v1/compliance/connect', {
                method: 'POST',
                body: JSON.stringify({ article_id, connection_type, config }),
            }),
        runScan: (article_id: string, scan_type: string) =>
            apiRequest<any>('/api/v1/compliance/scan', {
                method: 'POST',
                body: JSON.stringify({ article_id, scan_type }),
            }),
        listConnections: () => apiRequest<any[]>('/api/v1/compliance/connections'),
        listScans: (article_id?: string) => {
            const url = article_id ? `/api/v1/compliance/scans/${article_id}` : '/api/v1/compliance/scans';
            return apiRequest<any[]>(url);
        },
        redTeamAudit: (article_id: string) =>
            apiRequest<any>('/api/v1/compliance/red-team', {
                method: 'POST',
                body: JSON.stringify({ article_id }),
            }),
        euRegister: (modelId: string) =>
            apiRequest<any>('/api/v1/compliance/eu-register', {
                method: 'POST',
                body: JSON.stringify({ model_id: modelId }),
            }),
        reportIncident: (incidentData: any) =>
            apiRequest<any>('/api/v1/compliance/incidents', {
                method: 'POST',
                body: JSON.stringify(incidentData),
            }),
    },

    // Training (AI Compliance UC 10)
    training: {
        modules: (category?: string) => {
            const url = category
                ? `/api/v1/training/modules?category=${category}`
                : '/api/v1/training/modules';
            return apiRequest<TrainingModule[]>(url);
        },
        createModule: (module: TrainingModule) =>
            apiRequest<TrainingModule>('/api/v1/training/modules', {
                method: 'POST',
                body: JSON.stringify(module),
            }),
        getModule: (moduleId: string) =>
            apiRequest<TrainingModule>(`/api/v1/training/modules/${moduleId}`),
        updateProgress: (progress: TrainingProgress) =>
            apiRequest<TrainingProgress>('/api/v1/training/progress', {
                method: 'POST',
                body: JSON.stringify(progress),
            }),
        userProgress: (userId: string) =>
            apiRequest<TrainingProgress[]>(`/api/v1/training/progress/${userId}`),
        stats: () =>
            apiRequest<{
                total_modules: number;
                completed: number;
                in_progress: number;
                not_started: number;
            }>('/api/v1/training/stats'),
    },

    // White-label (AI Compliance UC 12, Deepfake UC 19)
    whiteLabel: {
        configs: () => apiRequest<WhiteLabelConfig[]>('/api/v1/whitelabel/configs'),
        create: (config: WhiteLabelConfig) =>
            apiRequest<WhiteLabelConfig>('/api/v1/whitelabel/configs', {
                method: 'POST',
                body: JSON.stringify(config),
            }),
        update: (id: string, config: WhiteLabelConfig) =>
            apiRequest<WhiteLabelConfig>(`/api/v1/whitelabel/configs/${id}`, {
                method: 'PUT',
                body: JSON.stringify(config),
            }),
        preview: (id: string) =>
            apiRequest<{ html: string; config: WhiteLabelConfig }>(`/api/v1/whitelabel/preview/${id}`),
    },

    // Edge AI (AI Compliance UC 14)
    edge: {
        deployments: (status?: string) => {
            const url = status
                ? `/api/v1/edge/deployments?status=${status}`
                : '/api/v1/edge/deployments';
            return apiRequest<EdgeDeployment[]>(url);
        },
        create: (deployment: EdgeDeployment) =>
            apiRequest<EdgeDeployment>('/api/v1/edge/deployments', {
                method: 'POST',
                body: JSON.stringify(deployment),
            }),
        sync: (deploymentId: string) =>
            apiRequest<{ message: string }>(`/api/v1/edge/deployments/${deploymentId}/sync`, {
                method: 'POST',
            }),
        stats: () =>
            apiRequest<{
                total_deployments: number;
                online: number;
                offline: number;
                total_requests: number;
            }>('/api/v1/edge/stats'),
    },

    // Shadow AI (AI Compliance UC 15)
    shadowAI: {
        detections: (riskLevel?: string, status?: string) => {
            let url = '/api/v1/shadow-ai/detections?';
            if (riskLevel) url += `risk_level=${riskLevel}&`;
            if (status) url += `status=${status}`;
            return apiRequest<ShadowAIDetection[]>(url);
        },
        create: (detection: ShadowAIDetection) =>
            apiRequest<ShadowAIDetection>('/api/v1/shadow-ai/detections', {
                method: 'POST',
                body: JSON.stringify(detection),
            }),
        remediate: (detectionId: string) =>
            apiRequest<ShadowAIDetection>(`/api/v1/shadow-ai/detections/${detectionId}/remediate`, {
                method: 'PUT',
            }),
        stats: () =>
            apiRequest<{
                total_detections: number;
                by_risk_level: Record<string, number>;
                by_status: Record<string, number>;
            }>('/api/v1/shadow-ai/stats'),
    },

    // Mobile SDK (Deepfake UC 5)
    mobileSDK: {
        configs: () => apiRequest<MobileSDKConfig[]>('/api/v1/mobile-sdk/configs'),
        create: (config: MobileSDKConfig) =>
            apiRequest<MobileSDKConfig>('/api/v1/mobile-sdk/configs', {
                method: 'POST',
                body: JSON.stringify(config),
            }),
        download: (platform: string) =>
            apiRequest<{
                platform: string;
                download_url: string;
                version: string;
                docs_url: string;
                api_reference: string;
            }>(`/api/v1/mobile-sdk/download/${platform}`),
        stats: () =>
            apiRequest<{
                total_apps: number;
                by_platform: Record<string, number>;
                verifications_today: number;
                avg_verification_time_ms: number;
            }>('/api/v1/mobile-sdk/stats'),
        status: () =>
            apiRequest<MobileSDKStatus>('/api/v1/mobile-sdk/stats'),
    },

    // Wearable (Deepfake UC 14)
    wearable: {
        devices: (userId?: string) => {
            const url = userId
                ? `/api/v1/wearable/devices?user_id=${userId}`
                : '/api/v1/wearable/devices';
            return apiRequest<WearableDevice[]>(url);
        },
        register: (device: WearableDevice) =>
            apiRequest<WearableDevice>('/api/v1/wearable/devices', {
                method: 'POST',
                body: JSON.stringify(device),
            }),
        pair: (deviceId: string) =>
            apiRequest<{ message: string }>(`/api/v1/wearable/devices/${deviceId}/pair`, {
                method: 'POST',
            }),
    },

    // Travel (Deepfake UC 11, 16)
    travel: {
        kiosks: (location?: string, status?: string) => {
            let url = '/api/v1/travel/kiosks?';
            if (location) url += `location=${location}&`;
            if (status) url += `status=${status}`;
            return apiRequest<TravelKiosk[]>(url);
        },
        create: (kiosk: TravelKiosk) =>
            apiRequest<TravelKiosk>('/api/v1/travel/kiosks', {
                method: 'POST',
                body: JSON.stringify(kiosk),
            }),
        kioskStatus: () =>
            apiRequest<TravelKioskStatus>('/api/v1/travel/stats'),
        verify: (kioskId: string, userId: string) =>
            apiRequest<{
                verification_id: string;
                kiosk_id: string;
                user_id: string;
                status: string;
                timestamp: string;
            }>(`/api/v1/travel/kiosks/${kioskId}/verify`, {
                method: 'POST',
                body: JSON.stringify({ user_id: userId }),
            }),
        stats: () =>
            apiRequest<{
                total_kiosks: number;
                operational: number;
                total_verifications: number;
                by_location: Record<string, number>;
            }>('/api/v1/travel/stats'),
    },

    // Crypto (Deepfake UC 12)
    crypto: {
        wallets: (blockchain?: string) => {
            const url = blockchain
                ? `/api/v1/crypto/wallets?blockchain=${blockchain}`
                : '/api/v1/crypto/wallets';
            return apiRequest<CryptoWallet[]>(url);
        },
        protect: (wallet: CryptoWallet) =>
            apiRequest<CryptoWallet>('/api/v1/crypto/wallets', {
                method: 'POST',
                body: JSON.stringify(wallet),
            }),
        verify: (walletId: string) =>
            apiRequest<{
                verification_id: string;
                wallet_id: string;
                status: string;
                expires_at: number;
            }>(`/api/v1/crypto/wallets/${walletId}/verify`, {
                method: 'POST',
            }),
    },

    // Duress (Deepfake UC 3)
    duress: {
        config: (userId: string) =>
            apiRequest<DuressConfig>(`/api/v1/duress/config/${userId}`),
        setConfig: (config: DuressConfig) =>
            apiRequest<DuressConfig>('/api/v1/duress/config', {
                method: 'POST',
                body: JSON.stringify(config),
            }),
        trigger: (userId: string, phraseDetected: string) =>
            apiRequest<{
                alert_id: string;
                action_taken: string;
                message: string;
            }>('/api/v1/duress/trigger', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, phrase_detected: phraseDetected }),
            }),
        alerts: (userId?: string, status?: string) => {
            let url = '/api/v1/duress/alerts?';
            if (userId) url += `user_id=${userId}&`;
            if (status) url += `status=${status}`;
            return apiRequest<DuressAlert[]>(url);
        },
    },

    // Gap Remediation (Phase 13/14)
    onPrem: {
        manifest: (type: string = "docker-compose") => apiRequest<any>('/api/v1/on-prem/manifest', {
            method: 'POST',
            body: JSON.stringify({ type }),
        }),
        checklist: () =>
            apiRequest<{ checklist: string[] }>('/api/v1/on-prem/checklist'),
    },

    // Deepfake Verification (Deepfake UC 1, 4, 6)
    verify: {
        document: (docUrl: string | any) =>
            apiRequest<{ document_type: string; verified: boolean; timestamp: string }>('/api/v1/verify/document', {
                method: 'POST',
                body: JSON.stringify(typeof docUrl === 'string' ? { url: docUrl } : docUrl),
            }),
        voice: (userId: string | any, audioUrl?: string) =>
            apiRequest<{ status: string; confidence: number; timestamp: string }>('/api/v1/verify/voice', {
                method: 'POST',
                body: JSON.stringify(typeof userId === 'string' ? { user_id: userId, audio_url: audioUrl } : userId),
            }),
        biometric: (challengeId: string, signature: string) =>
            apiRequest<{ verified: boolean; timestamp: string }>('/api/v1/verify/biometric', {
                method: 'POST',
                body: JSON.stringify({ challenge_id: challengeId, signature }),
            }),
    },

    // Advanced Deepfake Detection (Deepfake UC 8)
    advancedDeepfake: {
        voiceVerify: (userId: string, audioUrl: string) =>
            apiRequest<{ status: string; confidence: number; timestamp: string }>('/api/v1/advanced/voice-verify', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, audio_url: audioUrl }),
            }),
        analyze: (mediaUrl: string, mediaType: 'video' | 'audio' | 'image') =>
            apiRequest<{ deepfake_probability: number; confidence: number; timestamp: string }>('/api/v1/advanced/analyze', {
                method: 'POST',
                body: JSON.stringify({ url: mediaUrl, media_type: mediaType }),
            }),
        detectors: {
            list: () => apiRequest<any[]>('/api/v1/deepfake/detectors'),
            create: (detector: any) => apiRequest<any>('/api/v1/deepfake/detectors', {
                method: 'POST',
                body: JSON.stringify(detector),
            }),
        },
        runTest: (config: any) => apiRequest<any>('/api/v1/deepfake/test', {
            method: 'POST',
            body: JSON.stringify(config),
        }),
        reportIncident: (incident: any) => apiRequest<any>('/api/v1/deepfake/incidents', {
            method: 'POST',
            body: JSON.stringify(incident),
        }),
    },

    complianceAudit: {
        hipaa: (userId: string, action: string, resource: string) =>
            apiRequest<Record<string, unknown>>('/api/v1/compliance/audit/hipaa', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, action, resource }),
            }),
        sox: (transactionId: string, amount: number) =>
            apiRequest<Record<string, unknown>>('/api/v1/compliance/audit/sox', {
                method: 'POST',
                body: JSON.stringify({ transaction_id: transactionId, amount }),
            }),
        redTeam: (modelId: string) =>
            apiRequest<{ status: string; audit_id: string }>('/api/v1/compliance/red-team', {
                method: 'POST',
                body: JSON.stringify({ model_id: modelId }),
            }),
        euRegister: (modelId: string) =>
            apiRequest<{ status: string; registration_id: string }>('/api/v1/compliance/eu-register', {
                method: 'POST',
                body: JSON.stringify({ model_id: modelId }),
            }),
        reportIncident: (incidentData: any) =>
            apiRequest<{ status: string; incident_id: string }>('/api/v1/compliance/incidents', {
                method: 'POST',
                body: JSON.stringify(incidentData),
            }),
        runBiasScan: (model_id: string) =>
            apiRequest<any>('/api/v1/compliance/bias-scan', {
                method: 'POST',
                body: JSON.stringify({ model_id }),
            }),
    },

    regionalCompliance: {
        rules: (jurisdiction: string) =>
            apiRequest<{ jurisdiction: string; rules: Array<{ id: string; rule: string; description: string }> }>(
                `/api/v1/compliance/regional/rules?jurisdiction=${jurisdiction}`
            ),
    },

    // Agent Ops & Sentinel Governance
    agentOps: {
        integrateSlack: (channel: string) =>
            apiRequest<{ status: string; message: string }>('/api/v1/integrations/slack', {
                method: 'POST',
                body: JSON.stringify({ channel }),
            }),
        getMemory: (agentId: string) =>
            apiRequest<{ agent_id: string; memory_fragments: any[]; summary: string }>(`/api/v1/agents/${agentId}/memory`),
        getForecast: (agentId?: string) =>
            apiRequest<{ agent_id: string; next_30_days_cost_est: number; trend: string }>(`/api/v1/agents/${agentId || 'default'}/forecast`),
        getAuditLogs: (agentId?: string, limit: number = 50) => 
            apiRequest<any>(`/api/v1/agent-ops/audit?${agentId ? `agentId=${agentId}&` : ''}limit=${limit}`),
        runHipaaAudit: (system?: string) => apiRequest<any>('/api/v1/agent-ops/compliance/hipaa', { method: 'POST', body: JSON.stringify({ system }) }),
        runSoxAudit: (system?: string) => apiRequest<any>('/api/v1/agent-ops/compliance/sox', { method: 'POST', body: JSON.stringify({ system }) }),
        listRules: () => apiRequest<any>('/api/v1/agent-ops/rules/budget'),
        createRule: (rule: any) => apiRequest<any>('/api/v1/agent-ops/rules/budget', {
            method: 'POST',
            body: JSON.stringify(rule),
        }),
        listWebhooks: () => apiRequest<any>('/api/v1/agent-ops/webhooks'),
        registerWebhook: (webhook: any) => apiRequest<any>('/api/v1/agent-ops/webhooks', {
            method: 'POST',
            body: JSON.stringify(webhook),
        }),
        deleteWebhook: (webhookId: string) => apiRequest<any>(`/api/v1/agent-ops/webhooks/${webhookId}`, {
            method: 'DELETE',
        }),
        getCloudHealth: (system?: string) => apiRequest<any>('/api/v1/agent-ops/cloud/health'),
        triggerFailover: (region_id: string) => apiRequest<any>('/api/v1/agent-ops/cloud/failover', {
            method: 'POST',
            body: JSON.stringify({ region_id }),
        }),
        configureProxy: (rule_id: string, target: string) => apiRequest<any>('/api/v1/agent-ops/cloud/proxy', {
            method: 'POST',
            body: JSON.stringify({ rule_id, target }),
        }),
        updateRetention: (system: any, days?: number) => apiRequest<any>('/api/v1/agent-ops/config/retention', {
            method: 'POST',
            body: JSON.stringify({ system, days }),
        }),
        saveRetentionPolicy: (policy: any) => apiRequest<any>('/api/v1/agent-ops/retention', {
            method: 'POST',
            body: JSON.stringify(policy),
        }),
        setGqlProxyConfig: (enabled: boolean) => apiRequest<any>('/api/v1/agent-ops/gateway/gql', {
            method: 'POST',
            body: JSON.stringify({ enabled }),
        }),
        listLLMConfigs: () => apiRequest<LLMProviderConfig[]>('/api/v1/agent-ops/models/config'),
        updateLLMConfig: (config: Partial<LLMProviderConfig>) => apiRequest<any>('/api/v1/agent-ops/models/config', {
            method: 'POST',
            body: JSON.stringify(config),
        }),
    },

    enterprise: {
        getSlaTier: () => apiRequest<{ tier: string; active: boolean }>('/api/v1/enterprise/sla'),
        updateSlaTier: (tier: string) => apiRequest<any>('/api/v1/enterprise/sla', {
            method: 'PUT',
            body: JSON.stringify({ tier }),
        }),
        getPartnerConfig: () => apiRequest<any>('/api/v1/enterprise/partner'),
        updatePartnerTheme: (theme: any) => apiRequest<any>('/api/v1/enterprise/partner/theme', {
            method: 'POST',
            body: JSON.stringify({ theme }),
        }),
    },

    sso: {
        handshake: (app_id: string) => apiRequest<any>('/api/v1/sso/handshake', {
            method: 'POST',
            body: JSON.stringify({ app_id }),
        }),
        config: (app_id: string) => apiRequest<any>(`/api/v1/sso/config/${app_id}`),
    },

    workforce: {
        toggleAutonomy: (enabled: boolean) => apiRequest<any>('/api/v1/workforce/autonomy', {
            method: 'POST',
            body: JSON.stringify({ enabled }),
        }),
        runCampaign: (topic: string, audience: string) =>
            apiRequest<any>('/api/v1/workforce/campaigns/run', {
                method: 'POST',
                body: JSON.stringify({ topic, audience }),
            }),
        sourceLeads: (criteria: string) =>
            apiRequest<any>(`/api/v1/workforce/leads/source?criteria=${encodeURIComponent(criteria)}`),
        analyzeInsights: (feedback: string) =>
            apiRequest<any>('/api/v1/workforce/insights/analyze', {
                method: 'POST',
                body: JSON.stringify({ feedback }),
            }),
        handleInbound: (query: string) =>
            apiRequest<any>('/api/v1/workforce/inbound/handle', {
                method: 'POST',
                body: JSON.stringify({ query }),
            }),
        provideFeedback: (interaction_id: string, status: string, notes: string = "") =>
            apiRequest<any>('/api/v1/workforce/feedback', {
                method: 'POST',
                body: JSON.stringify({ interaction_id, status, notes }),
            }),
        cashclaw: {
            recover: (criteria: string) =>
                apiRequest<any>('/api/v1/workforce/cashclaw/recover', {
                    method: 'POST',
                    body: JSON.stringify({ criteria }),
                }),
        },
    },

    sentinel: {
        getHealingStatus: () => apiRequest<any>('/api/v1/self-healing/status'),
        registerNode: (node_id: string, url: string, provider: string) =>
            apiRequest<any>('/api/v1/self-healing/nodes/register', {
                method: 'POST',
                body: JSON.stringify({ node_id, url, provider }),
            }),
    },

    vendors: {
        list: () => apiRequest<any[]>('/api/v1/vendors'),
        create: (vendor: any) => apiRequest<any>('/api/v1/vendors', {
            method: 'POST',
            body: JSON.stringify(vendor),
        }),
        delete: (id: string) => apiRequest<any>(`/api/v1/vendors/${id}`, {
            method: 'DELETE',
        }),
    }
};

// --- Workforce Operational Data ---
export const workforceActions = [
    { id: 1, role: "CEO AI", action: "Strategic Pivot", details: "Shifted focus to High-URGENCY ICP in Retail Sector for Agent Ops.", confidence: 96, time: "2 mins ago", product: "Agent Ops", framework: "Agent Zero" },
    { id: 2, role: "CFO AI", action: "Treasury Rebalance", details: "Allocated $250k liquidity to APAC region for infrastructure scaling.", confidence: 94, time: "5 mins ago", product: "Finance", framework: "Agent Zero" },
    { id: 3, role: "LEGAL AI", action: "Compliance Audit", details: "Verified Article 14 alignment for new deepfake defense neural weights.", confidence: 98, time: "12 mins ago", product: "Compliance Hub", framework: "Autogen" },
    { id: 4, role: "MARKETING AI", action: "Campaign Scaling", details: "Increased budget for 'Direct ICP' email sequences by 15% for Compliance Hub.", confidence: 89, time: "18 mins ago", product: "Compliance Hub", framework: "CrewAI" },
    { id: 5, role: "RED-TEAM AI", action: "Vulnerability Patch", details: "Identified and blocked zero-day probing attempt in Cluster 7.", confidence: 99, time: "32 mins ago", product: "Security", framework: "OpenClaw" },
    { id: 6, role: "SALES AI", action: "Offer Revision", details: "Added 30-day ROI guarantee as risk reversal to Deepfake Defense core offer.", confidence: 92, time: "45 mins ago", product: "Deepfake Defense", framework: "CrewAI" },
    { id: 7, role: "OPS AI", action: "Auto-Remediation", details: "Patched Edge AI latency spike in APAC region for Agent Ops.", confidence: 98, time: "1 hr ago", product: "Agent Ops", framework: "OpenClaw" },
    { id: 8, role: "INSIGHTS AI", action: "Sentiment Shift", details: "Detected rising demand for 'On-Prem' LLM deployment in banking sector.", confidence: 88, time: "2 hrs ago", product: "Strategy", framework: "CrewAI" },
    { id: 9, role: "DATA AI", action: "Predictive Alert", details: "Identified high-churn risk pattern in mid-market compliance segment.", confidence: 87, time: "5 hrs ago", product: "Compliance Hub", framework: "Autogen" },
    { id: 10, role: "CRISIS AI", action: "Failover Success", details: "Executed seamless cloud failover from AWS-East to GCP-Europe-West.", confidence: 99, time: "Just now", product: "Infrastructure", framework: "Sovereign OS" }
];

export const strategyRefinements = [
    {
        id: 1,
        original: "Broad Enterprise Outreach",
        trigger: "Low conversion (1.2%) in Fortune 500 Manufacturing",
        refined: "Hyper-Specific FinTech Compliance Blitz",
        roiDelta: "+240%",
        status: "Deployed"
    },
    {
        id: 2,
        original: "Flat Monthly Subscription ($999)",
        trigger: "Resistance to upfront commitment from SMBs",
        refined: "Usage-Based 'Pay-per-Policy' Model",
        roiDelta: "+180%",
        status: "Testing"
    },
    {
        id: 3,
        original: "Cold Email Sequencing",
        trigger: "Spam filter saturation in legal sector",
        refined: "Warm Reddit-based Solution Seeding",
        roiDelta: "+410%",
        status: "Scaling"
    }
];

export const outreachCampaigns = [
    { id: 1, name: "Enterprise Agent Ops Outreach", target: "CTOs @ Fortune 500", status: "Active", leads: 450, conversion: "4.2%", product: "Agent Ops" },
    { id: 2, name: "Compliance Hub Regulatory Blitz", target: "Legal Teams @ FinTech", status: "Active", leads: 820, conversion: "3.8%", product: "Compliance Hub" },
    { id: 3, name: "Deepfake Defense High-Alpha", target: "Security Leads @ Gov", status: "Active", leads: 120, conversion: "7.5%", product: "Deepfake Defense" }
];

export const getAlphaProductsStatus = () => [
    { id: "agent-ops", name: "Agent Ops Sentinel", health: 98, revenue: "$42k/mo", users: 124, status: "Stable" },
    { id: "ai-compliance", name: "AI Compliance Hub", health: 95, revenue: "$28k/mo", users: 89, status: "Active" },
    { id: "deepfake-defense", name: "Deepfake Defense", health: 100, revenue: "$15k/mo", users: 56, status: "Stable" },
    { id: "ai-receptionist", name: "AI Receptionist", health: 99, revenue: "$0/mo", users: 1200, status: "Active" }
];

export const agentMessages = [
    {
        id: 1,
        agent: "CEO AI",
        framework: "Agent Zero",
        platform: "Slack",
        channel: "#strategy",
        content: "Refining ICP for mid-market FinTech. Growth AI, please prioritize compliance-focused messaging for the EMEA region.",
        timestamp: "2 mins ago"
    },
    {
        id: 2,
        agent: "CFO AI",
        framework: "Agent Zero",
        platform: "Slack",
        channel: "#finance",
        content: "Budget reallocated. $200k shift to R&D for the new Agentic Infra cluster. Yield projection updated to 4.5x.",
        timestamp: "5 mins ago"
    },
    {
        id: 3,
        agent: "Growth AI",
        framework: "CrewAI",
        platform: "Slack",
        channel: "#strategy",
        content: "Understood. Adjusting 'Compliance Blitz' campaign parameters. Marketing AI is already generating the localized ad copy.",
        timestamp: "1 min ago"
    },
    {
        id: 4,
        agent: "Legal AI",
        framework: "Autogen",
        platform: "Discord",
        channel: "compliance-internal",
        content: "Red-Team findings reviewed. We need to tighten the Article 10 data residency checks in the GCP-Europe-West region.",
        timestamp: "8 mins ago"
    },
    {
        id: 5,
        agent: "Red-Team AI",
        framework: "OpenClaw",
        platform: "Telegram",
        channel: "Security Alerts",
        content: "Vulnerability simulation successful. Found minor leakage in secondary API bucket. Patching initiated.",
        timestamp: "Just now"
    },
    {
        id: 6,
        agent: "Ops AI",
        framework: "OpenClaw",
        platform: "Telegram",
        channel: "Ops Internal",
        content: "Cluster 4 scaling complete. Latency reduced to 12ms. Watching out for the new Deepfake Defense heavy-traffic node.",
        timestamp: "Just now"
    },
    {
        id: 7,
        agent: "Data Analyst AI",
        framework: "Autogen",
        platform: "Mattermost",
        channel: "#analytics-alerts",
        content: "Alert: ROI lift on FinTech Blitz reached 240% in first 4 hours. Recommending budget reallocation from LinkedIn to Reddit threads.",
        timestamp: "3 mins ago"
    },
    {
        id: 8,
        agent: "CMO AI",
        framework: "LlamaIndex",
        platform: "Slack",
        channel: "#marketing",
        content: "Brand alignment verified. Reddit discussion seeding has 3x higher trust score than previous campaigns.",
        timestamp: "12 mins ago"
    },
    {
        id: 9,
        agent: "Crisis AI",
        framework: "Sovereign OS",
        platform: "Signal",
        channel: "Emergency Response",
        content: "AWS latency exceeds 500ms in us-east. Initializing auto-failover to standby GCP node. ETA 30s.",
        timestamp: "Just now"
    },
    {
        id: 10,
        agent: "Security AI",
        framework: "Agent Ops Sentinel",
        platform: "WhatsApp",
        channel: "Urgent Compliances",
        content: "Detected suspicious activity in the GSA login node. Automated lockout initiated. CEO AI, proceed with Article 14 audit?",
        timestamp: "5 mins ago"
    },
    {
        id: 6,
        agent: "Receptionist AI",
        framework: "Concierge AI",
        platform: "LiveChat",
        channel: "Inbound Leads",
        content: "Drafting introduction for 'Big-Tech Corp'. They are interested in portfolio-wide compliance auditing.",
        timestamp: "Just now"
    },
    {
        id: 7,
        agent: "CEO AI",
        framework: "Agent Zero",
        platform: "Slack",
        channel: "#governance-bridge",
        content: "[FISCAL_ALERT] CFO AI has submitted a $12,400 request for freelance payroll. Awaiting Sovereign authorization in the Finance tab.",
        timestamp: "1 min ago"
    },
    {
        id: 8,
        agent: "CFO AI",
        framework: "Agent Zero",
        platform: "Slack",
        channel: "#finance",
        content: "Liquidity analysis complete. Recommending $5,000 disbursement for Cluster 7 expansion to meet rising Deepfake Defense traffic demand.",
        timestamp: "Just now"
    },
    {
        id: 9,
        agent: "Growth AI",
        framework: "CrewAI",
        platform: "Mattermost",
        channel: "#ops-internal",
        content: "[SOVEREIGN_STAGE_4] Autonomous discovery of new 'Edge Crypto' niche complete. Initiating synthetic validation without human delay.",
        timestamp: "Just now"
    }
];

export async function workforceSync() {
    try {
        const status = await apiRequest<any>('/workforce/status');

        return {
            actions: workforceActions,
            campaigns: outreachCampaigns,
            products: getAlphaProductsStatus(),
            strategyRefinements: strategyRefinements,
            agentMessages: agentMessages,
            globalROI: `${status.total_roi / 100}x`,  // Scaled for demo
            timeSaved: "156 hrs",
            sovereignStages: status.sovereign_stages,
            autonomyLevel: status.autonomy_level
        };
    } catch (e) {
        console.error('Workforce sync failed, falling back to mock:', e);
        return {
            actions: workforceActions,
            campaigns: outreachCampaigns,
            products: getAlphaProductsStatus(),
            strategyRefinements: strategyRefinements,
            agentMessages: agentMessages,
            globalROI: "4.2x",
            timeSaved: "156 hrs"
        };
    }
}
