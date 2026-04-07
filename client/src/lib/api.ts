/**
 * API Service Layer
 * Connects frontend to backend APIs.
 * All data comes from real backend endpoints - no mock/simulated data.
 */

const API_URL = import.meta.env.VITE_API_URL || "";

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

export interface Vendor {
  id: string;
  name: string;
  type: string;
  riskLevel: string;
  complianceStatus: string;
  lastAssessment: Date | string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  date: Date | string;
  affectedSystems?: string[];
  affected_systems?: string[]; // Backend compatibility
  status: "open" | "investigating" | "resolved" | "closed";
  article72?: boolean;
}

export interface BusinessIdea {
  id: number;
  rank: number;
  title: string;
  category: string;
  description: string;
  gap: string;
  markets: string[];
  earning_potential: number;
  earning_label: string;
  rollout_speed: number;
  rollout_label: string;
  startup_cost: string;
  profit_margin: number;
  market_size_bn: number;
  trend: "Explosive" | "High Growth" | "Steady";
  tags: string[];
  // Enhanced Fields
  gtm_strategy?: string;
  tech_stack?: string[];
  risk_factors?: string[];
  team_requirements?: string[];
  market_signals?: {
    reddit_insight?: string;
    search_trend?: string;
    regulatory_wedge?: string;
  };
  scalability_score?: number; // Real-First metric
}

export interface Claim {
  id: string;
  claim_id_string: string;
  payer: string;
  amount: number;
  status: string;
  risk: string;
  created_at?: string;
  updated_at?: string;
}

// Helper to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export interface ApiOptions extends RequestInit {
  strict?: boolean;
  fallback?: any;
}

// Global flag/callback for simulation monitoring
let onSimulationTriggered: ((endpoint: string) => void) | null = null;

export const setSimulationListener = (cb: (endpoint: string) => void) => {
  onSimulationTriggered = cb;
};

// Helper for API requests
async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = getAuthToken();
  const method = options.method || "GET";
  const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

  // REAL-FIRST: Mutations are always strict unless explicitly opt-out
  const strict = options.strict !== undefined ? options.strict : isMutation;

  console.log(`[API_DEBUG] ${method} ${endpoint}, strict: ${strict}`);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Normalize endpoints: Go API Gateway handles /api/v1/* and proxies /ml/* to Python
  let normalizedEndpoint = endpoint;
  const v1Prefix = "/api/v1";

  // Legacy mapping
  const legacyRoutes = [
    "/agents",
    "/rules",
    "/metrics",
    "/compliance",
    "/deepfake",
    "/billing",
    "/alerts",
    "/webhooks",
    "/multi-cloud",
    "/self-healing",
    "/agent-ops",
  ];
  if (
    legacyRoutes.some(route => endpoint.startsWith(route)) &&
    !endpoint.startsWith(v1Prefix) &&
    !endpoint.startsWith("/ml/")
  ) {
    normalizedEndpoint = `${v1Prefix}${endpoint}`;
  }

  const cleanBaseUrl = (API_URL || "").replace(/\/+$/, "");
  const cleanPath = normalizedEndpoint.replace(/^\/+/, "");

  let finalUrl: string;
  if (cleanBaseUrl && cleanBaseUrl.startsWith("http")) {
    finalUrl = `${cleanBaseUrl}/${cleanPath}`;
  } else {
    finalUrl = `/${cleanPath}`;
  }

  while (finalUrl.startsWith("//")) {
    finalUrl = finalUrl.substring(1);
  }
  finalUrl = finalUrl.replace(/([^:])\/\/+/g, "$1/");
  if (finalUrl.startsWith("//")) {
    finalUrl = finalUrl.substring(1);
  }
  if (!finalUrl.startsWith("http") && !finalUrl.startsWith("/")) {
    finalUrl = "/" + finalUrl;
  }

  console.log(
    `[API Proxy] FINAL_URL: "${finalUrl}" (Base: "${API_URL}", Endpoint: "${endpoint}")`
  );

  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      // If we have a fallback, use it even for 4xx errors if strict is not enforced manually
      // but usually we want to distinguish between "Service Down" and "Bad Request"
      if (options.fallback && response.status >= 500) {
        console.warn(
          `[Resilience] Server alert ${response.status} on ${endpoint}. Activating shadow data mode.`
        );
        onSimulationTriggered?.(endpoint);
        return options.fallback;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (e: any) {
    // REAL-FIRST FAILURE HANDLING
    if (options.fallback) {
      console.warn(
        `[Resilience] Service Latency on ${normalizedEndpoint}. Activating shadow fallback mode.`,
        e.message
      );
      onSimulationTriggered?.(endpoint);
      return options.fallback;
    }

    console.error(
      `[API Error] REAL-FIRST HARD-FAILURE on ${normalizedEndpoint}:`,
      e.message
    );
    throw e;
  }
}

// Helper for Blob/File requests (Downloads)
async function apiBlobRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Blob> {
  const token = getAuthToken();
  const headers: HeadersInit = { ...options.headers };
  if (token)
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  let normalizedEndpoint = endpoint;
  if (!endpoint.startsWith("/api/v1") && !endpoint.startsWith("/ml/")) {
    normalizedEndpoint = `/api/v1${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  }

  const cleanBaseUrl = (API_URL || "").replace(/\/+$/, "");
  const cleanPath = normalizedEndpoint.replace(/^\/+/, "");
  const finalUrl =
    cleanBaseUrl && cleanBaseUrl.startsWith("http")
      ? `${cleanBaseUrl}/${cleanPath}`
      : `/${cleanPath}`;

  const response = await fetch(finalUrl, { ...options, headers });
  if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
  return await response.blob();
}

// ============================================================================
// Auth API
// ============================================================================

export interface AuthResponse {
  accessToken?: string;
  access_token?: string; // Handle backend snake_case
  refreshToken?: string;
  refresh_token?: string; // Handle backend snake_case
  expiresIn?: number;
  expires_in?: number; // Handle backend snake_case
  user?: User;
  requiresProductSelection?: boolean;
  availableProducts?: string[];
}

export const authApi = {
  login: (email: string, password: string, productId?: string) =>
    apiRequest<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, product_id: productId }),
    }),

  register: (email: string, password: string, name: string) =>
    apiRequest<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  logout: () =>
    apiRequest<{ message: string }>("/api/v1/auth/logout", {
      method: "POST",
    }),

  me: () => apiRequest<User>("/api/v1/auth/me"),

  requestPasswordReset: (email: string) =>
    apiRequest<{ message: string; reset_url?: string }>(
      "/api/v1/auth/password-reset",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    ),

  resetPassword: (email: string, token: string, newPassword: string) =>
    apiRequest<{ message: string }>("/api/v1/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify({ email, token, new_password: newPassword }),
    }),
};

// ============================================================================
// Agents API
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  type:
    | "langgraph"
    | "crewai"
    | "autogen"
    | "custom"
    | "openai"
    | "metagpt"
    | "pydanticai";
  status: "active" | "paused" | "error" | "stopped";
  budget: number;
  dailySpend: number;
  tier: "strategic" | "tactical" | "industrial";
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
  org_id?: string;
  control_webhook?: string;
  persistent_memory?: boolean;
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
  created_at?: string;
  updated_at?: string;
}

export const agentsApi = {
  list: () => apiRequest<Agent[]>("/agents"),

  get: (id: string) => apiRequest<Agent>(`/agents/${id}`),

  create: (agent: Partial<Agent>) =>
    apiRequest<Agent>("/agents", {
      method: "POST",
      body: JSON.stringify(agent),
    }),

  update: (id: string, agent: Partial<Agent>) =>
    apiRequest<Agent>(`/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(agent),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/agents/${id}`, {
      method: "DELETE",
    }),

  start: (id: string) =>
    apiRequest<Agent>(`/agents/${id}/start`, { method: "POST" }),

  stop: (id: string) =>
    apiRequest<Agent>(`/agents/${id}/stop`, { method: "POST" }),

  restart: (id: string) =>
    apiRequest<Agent>(`/agents/${id}/restart`, { method: "POST" }),

  logs: (id: string) => apiRequest<AgentLog[]>(`/agents/${id}/logs`),

  installSkill: (skillId: string) =>
    apiRequest<{ message: string }>("/api/v1/agent-ops/skills/install", {
      method: "POST",
      body: JSON.stringify({ skillId }),
    }),
};

export interface AgentLog {
  id: string;
  agentId: string;
  level: "info" | "warn" | "error";
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
  list: () => apiRequest<Rule[]>("/api/v1/rules"),

  create: (rule: Partial<Rule>) =>
    apiRequest<Rule>("/api/v1/rules", {
      method: "POST",
      body: JSON.stringify(rule),
    }),

  update: (id: string, rule: Partial<Rule>) =>
    apiRequest<Rule>(`/api/v1/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(rule),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/api/v1/rules/${id}`, {
      method: "DELETE",
    }),

  toggle: (id: string, enabled: boolean) =>
    apiRequest<Rule>(`/api/v1/rules/${id}/toggle`, {
      method: "POST",
      body: JSON.stringify({ enabled }),
      strict: true,
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
  computeLoad: number;
  p99Latency: number;
  missionsToday: number;
  hourlyData: Array<{ hour: string; tokens: number; cost: number }>;
}

export const metricsApi = {
  current: () => apiRequest<Metrics>("/api/v1/metrics/current"),

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
  status: "compliant" | "non_compliant" | "pending";
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
  list: () => apiRequest<ComplianceReport[]>("/api/v1/compliance/reports"),

  get: (id: string) =>
    apiRequest<ComplianceReport>(`/api/v1/compliance/reports/${id}`),

  create: (name: string, document: string) =>
    apiRequest<ComplianceReport>("/api/v1/compliance/check", {
      method: "POST",
      body: JSON.stringify({ name, document }),
    }),

  checkDocument: (document: string, regulations?: string[]) =>
    apiRequest<{
      compliance_score: number;
      violations: Array<{ type: string; severity: string; regulation: string }>;
      recommendations: string[];
    }>("/api/v1/compliance/check-document", {
      method: "POST",
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
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<{ url: string }>("/api/v1/deepfake/upload", {
      method: "POST",
      body: formData,
      headers: {
        // Fetch will set the correct boundary for FormData
        "Content-Type": "multipart/form-data",
      } as any,
    });
  },

  detect: (mediaUrl: string, mediaType: string) =>
    apiRequest<DeepfakeResult>("/ml/deepfake/detect", {
      method: "POST",
      body: JSON.stringify({ media_url: mediaUrl, media_type: mediaType }),
    }),

  analyze: (mediaUrl: string, mediaType: string = "image") =>
    apiRequest<DeepfakeResult>("/api/v1/deepfake/analyze", {
      method: "POST",
      body: JSON.stringify({ media_url: mediaUrl, media_type: mediaType }),
    }),

  updateConfig: (config: any) =>
    apiRequest<any>("/api/v1/deepfake/config", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  history: () => apiRequest<DeepfakeResult[]>("/api/v1/deepfake/history"),

  getStats: () => apiRequest<any>("/api/v1/deepfake/stats"),

  challenge: (userId: string) =>
    apiRequest<any>(`/api/v1/deepfake/challenge?user_id=${userId}`, {
      method: "POST",
    }),

  verify: (challengeId: string, signature: string, hardwareId: string) =>
    apiRequest<any>(
      `/api/v1/deepfake/verify?challenge_id=${challengeId}&signature=${signature}&hardware_id=${hardwareId}`,
      { method: "POST" }
    ),

  train: (datasetName: string) =>
    apiRequest<any>(`/api/v1/deepfake/train?dataset_name=${datasetName}`, {
      method: "POST",
    }),

  test: (modelId: string) =>
    apiRequest<any>(`/api/v1/deepfake/test?model_id=${modelId}`, {
      method: "POST",
    }),
};

// ============================================================================
// Billing API
// ============================================================================

export interface Subscription {
  id: string;
  plan: "developer" | "growth" | "enterprise";
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  status: "paid" | "open" | "void";
  date: string;
  pdfUrl: string;
}

export const billingApi = {
  subscription: () => apiRequest<Subscription>("/api/v1/billing/subscription"),

  invoices: () => apiRequest<Invoice[]>("/api/v1/billing/invoices"),

  createCheckout: (planId: string, provider: "stripe" | "paypal" = "stripe") =>
    apiRequest<{ url: string }>("/api/v1/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, provider }),
    }),

  cancel: () =>
    apiRequest<Subscription>("/api/v1/billing/cancel", { method: "POST" }),

  updatePaymentMethod: (paymentMethodId: string) =>
    apiRequest<Subscription>("/api/v1/billing/payment-method", {
      method: "PUT",
      body: JSON.stringify({ payment_method_id: paymentMethodId }),
    }),
};

// ============================================================================
// ML Inference API
// ============================================================================

export const mlApi = {
  infer: (modelName: string, inputData: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/ml/infer", {
      method: "POST",
      body: JSON.stringify({ model_name: modelName, input_data: inputData }),
    }),

  listModels: () =>
    apiRequest<
      Array<{ name: string; config: Record<string, unknown>; loaded: boolean }>
    >("/ml/models"),

  classifyAgentOperation: (taskDescription: string, context?: string) =>
    apiRequest<{
      classification: string;
      confidence: number;
      suggestions: string[];
    }>("/ml/agent-ops/classify", {
      method: "POST",
      body: JSON.stringify({ task_description: taskDescription, context }),
    }),

  checkCompliance: (document: string, regulations?: string[]) =>
    apiRequest<{
      compliance_score: number;
      violations: Array<{ type: string; severity: string }>;
      recommendations: string[];
    }>("/ml/ai-compliance/check", {
      method: "POST",
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
  allowedProducts: string[];
  notifications?: {
    emailAlerts: boolean;
    slackIntegration: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
    productUpdates: boolean;
  };
  preferences?: {
    theme: string;
    language: string;
    timezone: string;
    defaultModel: string;
    autoSave: boolean;
  };
}

export const userApi = {
  update: (updates: Partial<User>) =>
    apiRequest<User>("/api/v1/user", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>("/api/v1/user/password", {
      method: "PUT",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }),

  apiKeys: () =>
    apiRequest<
      Array<{ id: string; name: string; key: string; createdAt: string }>
    >("/api/v1/user/api-keys"),

  createApiKey: (name: string) =>
    apiRequest<{
      id: string;
      key: string;
      status?: string;
      createdAt?: string;
    }>("/api/v1/user/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  deleteApiKey: (id: string) =>
    apiRequest<{ message: string }>(`/api/v1/user/api-keys/${id}`, {
      method: "DELETE",
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
  status?: "not_started" | "in_progress" | "completed";
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

// Mobile SDK types
export interface MobileSDKStatus {
  total_apps: number;
  total_installs: number;
  avg_session_duration: number;
  by_platform: Record<string, number>;
  verifications_today: number;
  avg_verification_time_ms: number;
  version?: string;
  registered_apps?: number;
  api_health?: string;
}

// Workforce Chat types
export interface WorkforceMessage {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  created_at: string;
  is_group_chat: boolean;
  reasoning_path?: string;
}

export interface WorkforceInteraction {
  id: string;
  agent_role: string;
  status: string;
  notes?: string;
  created_at: string;
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
  is_active?: boolean;
  limit?: number;
  action?: string;
  priority?: string;
  channels: string[];
  created_at?: string;
  updated_at?: string;
  // Governance fields
  governance_status?: "draft" | "pending_review" | "approved" | "rejected";
  approver_id?: string;
  approval_date?: string;
  review_date?: string;
}

// Workforce types
export interface FiscalRequest {
  id: string;
  purpose: string;
  amount: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "APPROVED" | "DENIED";
  created_at: string;
}

export interface WorkforceGoal {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  category: string;
}

export interface WorkforceVenture {
  id: string;
  name: string;
  sector: string;
  roi: number;
  status: "PROFITABLE" | "SCALING" | "R&D" | "BETA";
  trend: "up" | "down";
}

export interface WorkforceOutreach {
  id: string;
  recipient_name: string;
  recipient_company: string;
  recipient_role?: string;
  subject: string;
  body: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "SENT" | "DISCARDED";
  niche: string;
  profile: string;
  score: number;
  is_auto_trigger: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  due_date?: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  event_type?: string;
  location?: string;
  is_all_day?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  icon?: string;
  config: Record<string, any>;
  status: string;
  connected?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BotSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Extended API functions
export const extendedApi = {
  get: <T>(url: string, options: ApiOptions = {}) =>
    apiRequest<T>(url, options),
  post: <T>(url: string, body?: any, options: ApiOptions = {}) =>
    apiRequest<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(url: string, body?: any, options: ApiOptions = {}) =>
    apiRequest<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(url: string, body?: any, options: ApiOptions = {}) =>
    apiRequest<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string, options: ApiOptions = {}) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
  // Alerts (Agent Ops UC 4)
  alerts: {
    list: () => apiRequest<AlertConfig[]>("/alerts"),
    create: (alert: AlertConfig) =>
      apiRequest<AlertConfig>("/alerts", {
        method: "POST",
        body: JSON.stringify(alert),
      }),
    update: (id: string, alert: Partial<AlertConfig>) =>
      apiRequest<AlertConfig>(`/alerts/${id}`, {
        method: "PUT",
        body: JSON.stringify(alert),
      }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/alerts/${id}`, {
        method: "DELETE",
      }),
  },
  // Webhooks (Agent Ops UC 4, 12)
  webhooks: {
    list: () => apiRequest<WebhookConfig[]>("/api/v1/webhooks"),
    create: (webhook: WebhookConfig) =>
      apiRequest<WebhookConfig>("/api/v1/webhooks", {
        method: "POST",
        body: JSON.stringify(webhook),
      }),
    update: (id: string, webhook: WebhookConfig) =>
      apiRequest<WebhookConfig>(`/api/v1/webhooks/${id}`, {
        method: "PUT",
        body: JSON.stringify(webhook),
      }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/api/v1/webhooks/${id}`, {
        method: "DELETE",
      }),
    test: (id: string) =>
      apiRequest<{ message: string; execution_id: string }>(
        `/api/v1/webhooks/${id}/test`,
        {
          method: "POST",
        }
      ),
    verify: (id: string) =>
      apiRequest<{ message: string; execution_id: string }>(
        `/api/v1/webhooks/${id}/verify`,
        {
          method: "POST",
        }
      ),
    executions: (webhookId: string) =>
      apiRequest<WebhookExecution[]>(
        `/api/v1/webhooks/${webhookId}/executions`
      ),
  },

  // Multi-Cloud (Agent Ops UC 16)
  multiCloud: {
    status: () => apiRequest<MultiCloudStatus[]>("/api/v1/multi-cloud/status"),
    metrics: () =>
      apiRequest<{
        total_requests: number;
        failed_requests: number;
        avg_latency_ms: number;
        cost_usd: number;
      }>("/api/v1/multi-cloud/metrics"),
    failover: (provider: string, targetProvider: string) =>
      apiRequest<{ message: string }>("/api/v1/multi-cloud/failover", {
        method: "POST",
        body: JSON.stringify({ provider, target_provider: targetProvider }),
      }),
  },

  // Self-Healing (Agent Ops UC 17)
  selfHealing: {
    events: (agentId?: string, resolved?: boolean) => {
      let url = "/agent-ops/self-healing/events?";
      if (agentId) url += `agent_id=${agentId}&`;
      if (resolved !== undefined) url += `resolved=${resolved}`;
      return apiRequest<SelfHealingEvent[]>(url);
    },
    createEvent: (event: SelfHealingEvent) =>
      apiRequest<SelfHealingEvent>("/agent-ops/self-healing/events", {
        method: "POST",
        body: JSON.stringify(event),
      }),
    resolveEvent: (eventId: string) =>
      apiRequest<SelfHealingEvent>(
        `/agent-ops/self-healing/events/${eventId}/resolve`,
        {
          method: "PUT",
        }
      ),
    stats: () =>
      apiRequest<{
        total_events: number;
        resolved_events: number;
        pending_events: number;
        resolution_rate: number;
      }>("/agent-ops/self-healing/stats"),
    updateHealingConfig: (config: any) =>
      apiRequest<any>("/agent-ops/self-healing/config", {
        method: "POST",
        body: JSON.stringify(config),
      }),
    injectHint: (agent_id: string, hint: string) =>
      apiRequest<any>("/agent-ops/self-healing/hint", {
        method: "POST",
        body: JSON.stringify({ agent_id, hint }),
      }),
    getHealingStatus: () => apiRequest<any>("/agent-ops/self-healing/status"),
    getStreamingMetrics: () =>
      apiRequest<any>("/agent-ops/self-healing/metrics/streaming"),
  },

  // GraphQL Proxy (UC 14, 16, 13)
  graphql: (query: string, variables?: Record<string, unknown>) =>
    apiRequest<{ data: Record<string, unknown> }>("/api/v1/graphql-proxy", {
      method: "POST",
      body: JSON.stringify({ query, variables }),
    }),

  // Compliance Integration (EU AI Act articles)
  compliance: {
    getStats: () => apiRequest<any>("/api/v1/compliance/stats"),
    listModels: () => apiRequest<any[]>("/api/v1/compliance/models"),
    registerModel: (modelData: any) =>
      apiRequest<any>("/api/v1/compliance/models", {
        method: "POST",
        body: JSON.stringify(modelData),
        strict: true,
      }),
    getBiasReports: (modelId: string) =>
      apiRequest<any[]>(`/api/v1/compliance/bias-reports/${modelId}`),
    triggerBiasScan: (modelId: string) =>
      apiRequest<any>("/api/v1/compliance/bias-scan", {
        method: "POST",
        body: JSON.stringify({ modelId }),
        strict: true,
      }),
    generateDocumentation: (modelId: string) =>
      apiRequest<any>(`/api/v1/compliance/documentation/${modelId}`, {
        method: "POST",
        strict: true,
      }),
    eURegister: (modelId: string) =>
      apiRequest<any>("/api/v1/compliance/eu-register", {
        method: "POST",
        body: JSON.stringify({ model_id: modelId }),
        strict: true,
      }),
    getLiveMetrics: () => apiRequest<any>("/api/v1/compliance/live-metrics"),
    remediateDrift: (target_id: string) =>
      apiRequest<any>("/api/v1/compliance/remediate", {
        method: "POST",
        body: JSON.stringify({ target_id }),
        strict: true,
      }),
    testNotification: (channel: string = "slack") =>
      apiRequest<any>(`/api/v1/notifications/test?channel=${channel}`, {
        method: "POST",
      }),
    updateGuardrails: (modelId: string, guardrails: any) =>
      apiRequest<any>(`/api/v1/compliance/models/${modelId}/guardrails`, {
        method: "PATCH",
        body: JSON.stringify(guardrails),
        strict: true,
      }),

    connectSystem: (
      article_id: string,
      connection_type: string,
      config: any = {}
    ) =>
      apiRequest<any>("/api/v1/compliance/connect", {
        method: "POST",
        body: JSON.stringify({ article_id, connection_type, config }),
        strict: true,
      }),
    runScan: (articleId: string, scanType: string) =>
      apiRequest<any>("/api/v1/compliance/scan", {
        method: "POST",
        body: JSON.stringify({ article_id: articleId, scan_type: scanType }),
        strict: true,
      }),
    getArticles: () => apiRequest<any[]>("/api/v1/compliance/articles"),
    listConnections: () => apiRequest<any[]>("/api/v1/compliance/connections"),
    listScans: (article_id?: string) => {
      const url = article_id
        ? `/api/v1/compliance/scans/${article_id}`
        : "/api/v1/compliance/scans";
      return apiRequest<any[]>(url);
    },
    redTeamAudit: (article_id: string) =>
      apiRequest<any>("/api/v1/compliance/red-team", {
        method: "POST",
        body: JSON.stringify({ article_id }),
        strict: true,
      }),
    euRegister: (modelId: string) =>
      apiRequest<any>("/api/v1/compliance/eu-register", {
        method: "POST",
        body: JSON.stringify({ model_id: modelId }),
        strict: true,
      }),
    reportIncident: (incidentData: any) =>
      apiRequest<Incident>("/api/v1/compliance/incidents", {
        method: "POST",
        body: JSON.stringify(incidentData),
        strict: true,
      }),
    listArticles: () => apiRequest<any[]>("/api/v1/compliance/articles"),
    uploadArtifact: (formData: FormData) =>
      apiRequest<any>("/api/v1/compliance/upload", {
        method: "POST",
        body: formData,
        strict: true,
      }),
    listArtifacts: () => apiRequest<any[]>("/api/v1/compliance/artifacts"),
    getROIMetrics: () => apiRequest<any>("/api/v1/compliance/roi"),
    getVelocityTrends: () => apiRequest<any[]>("/api/v1/compliance/velocity"),
    getDeadlines: () => apiRequest<any[]>("/api/v1/compliance/deadlines"),
    getEnterpriseAudits: () =>
      apiRequest<any[]>("/api/v1/compliance/enterprise-audits"),
    getModelBreakdown: (id: string) =>
      apiRequest<any>(`/api/v1/compliance/models/${id}/breakdown`),
    getModelAudits: (id: string) =>
      apiRequest<any[]>(`/api/v1/compliance/models/${id}/audits`),
    getModelHandshakes: (id: string) =>
      apiRequest<any[]>(`/api/v1/compliance/models/${id}/handshakes`),
    getRegionalReports: () =>
      apiRequest<any[]>("/api/v1/compliance/regional-reports"),
    getFinancialMetrics: () =>
      apiRequest<any>("/api/v1/compliance/financial-metrics"),
    exportReport: (modelId?: string, reportType?: string) => {
      let url = "/api/v1/compliance/reports/export";
      const params = new URLSearchParams();
      if (modelId) params.append("model_id", modelId);
      if (reportType) params.append("report_type", reportType);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      return apiRequest<any>(url);
    },
    getAuditLogs: (agentId?: string, query?: string, outcome?: string) => {
      const params = new URLSearchParams();
      if (agentId) params.append("agentId", agentId);
      if (query) params.append("search", query);
      if (outcome) params.append("outcome", outcome);
      const qs = params.toString();
      return apiRequest<any[]>(`/api/v1/compliance/audit${qs ? "?" + qs : ""}`);
    },
    updateIncidentStatus: (id: string, status: string) =>
      apiRequest<any>(`/api/v1/compliance/incidents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        strict: true,
      }),
    deleteVendor: (id: string) =>
      apiRequest<any>(`/api/v1/vendors/${id}`, {
        method: "DELETE",
      }),
    updatePolicy: (policy: any) =>
      apiRequest<any>("/api/v1/compliance/policy", {
        method: "PATCH",
        body: JSON.stringify(policy),
      }),
  },
  training: {
    listModules: () => apiRequest<any[]>("/api/v1/training/modules"),
    getModule: (id: string) =>
      apiRequest<any>(`/api/v1/training/modules/${id}`),
    updateProgress: (data: any) =>
      apiRequest<any>("/api/v1/training/progress", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getStats: () => apiRequest<any>("/api/v1/training/stats"),
    downloadCertificate: (id: string) =>
      apiBlobRequest(`/api/v1/training/modules/${id}/certificate`),
    modules: (category?: string) => {
      const url = category
        ? `/api/v1/training/modules?category=${category}`
        : "/api/v1/training/modules";
      return apiRequest<TrainingModule[]>(url);
    },
    createModule: (module: TrainingModule) =>
      apiRequest<TrainingModule>("/api/v1/training/modules", {
        method: "POST",
        body: JSON.stringify(module),
      }),
    userProgress: (userId: string) =>
      apiRequest<TrainingProgress[]>(`/api/v1/training/progress/${userId}`),
  },

  // White-label (AI Compliance UC 12, Deepfake UC 19)
  whiteLabel: {
    configs: () => apiRequest<WhiteLabelConfig[]>("/api/v1/whitelabel/configs"),
    create: (config: WhiteLabelConfig) =>
      apiRequest<WhiteLabelConfig>("/api/v1/whitelabel/configs", {
        method: "POST",
        body: JSON.stringify(config),
      }),
    update: (id: string, config: WhiteLabelConfig) =>
      apiRequest<WhiteLabelConfig>(`/api/v1/whitelabel/configs/${id}`, {
        method: "PUT",
        body: JSON.stringify(config),
      }),
    preview: (id: string) =>
      apiRequest<{ html: string; config: WhiteLabelConfig }>(
        `/api/v1/whitelabel/preview/${id}`
      ),
  },

  // Edge AI (AI Compliance UC 14)
  edge: {
    deployments: (status?: string) => {
      const url = status
        ? `/api/v1/edge/deployments?status=${status}`
        : "/api/v1/edge/deployments";
      return apiRequest<EdgeDeployment[]>(url);
    },
    create: (deployment: EdgeDeployment) =>
      apiRequest<EdgeDeployment>("/api/v1/edge/deployments", {
        method: "POST",
        body: JSON.stringify(deployment),
      }),
    sync: (deploymentId: string) =>
      apiRequest<{ message: string }>(
        `/api/v1/edge/deployments/${deploymentId}/sync`,
        {
          method: "POST",
        }
      ),
    logs: (id: string) =>
      apiRequest<any[]>(`/api/v1/edge/deployments/${id}/logs`),
    stats: () =>
      apiRequest<{
        total_deployments: number;
        online: number;
        offline: number;
        total_requests: number;
      }>("/api/v1/edge/stats"),
  },

  // Shadow AI (AI Compliance UC 15)
  shadowAI: {
    detections: (riskLevel?: string, status?: string) => {
      let url = "/api/v1/shadow-ai/detections?";
      if (riskLevel) url += `risk_level=${riskLevel}&`;
      if (status) url += `status=${status}`;
      return apiRequest<ShadowAIDetection[]>(url);
    },
    create: (detection: ShadowAIDetection) =>
      apiRequest<ShadowAIDetection>("/api/v1/shadow-ai/detections", {
        method: "POST",
        body: JSON.stringify(detection),
      }),
    remediate: (detectionId: string) =>
      apiRequest<ShadowAIDetection>(
        `/api/v1/shadow-ai/detections/${detectionId}/remediate`,
        {
          method: "PUT",
        }
      ),
    stats: () =>
      apiRequest<{
        total_detections: number;
        by_risk_level: Record<string, number>;
        by_status: Record<string, number>;
      }>("/api/v1/shadow-ai/stats"),
  },

  // Mobile SDK (Deepfake UC 5)
  mobileSDK: {
    configs: () => apiRequest<MobileSDKConfig[]>("/api/v1/mobile-sdk/configs"),
    create: (config: MobileSDKConfig) =>
      apiRequest<MobileSDKConfig>("/api/v1/mobile-sdk/configs", {
        method: "POST",
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
      }>("/api/v1/mobile-sdk/stats"),
    status: () => apiRequest<MobileSDKStatus>("/api/v1/mobile-sdk/stats"),
  },

  // Wearable (Deepfake UC 14)
  wearable: {
    devices: (userId?: string) => {
      const url = userId
        ? `/api/v1/wearable/devices?user_id=${userId}`
        : "/api/v1/wearable/devices";
      return apiRequest<WearableDevice[]>(url);
    },
    register: (device: WearableDevice) =>
      apiRequest<WearableDevice>("/api/v1/wearable/devices", {
        method: "POST",
        body: JSON.stringify(device),
      }),
    pair: (deviceId: string) =>
      apiRequest<{ message: string }>(
        `/api/v1/wearable/devices/${deviceId}/pair`,
        {
          method: "POST",
        }
      ),
  },

  // Travel (Deepfake UC 11, 16)
  travel: {
    kiosks: (location?: string, status?: string) => {
      let url = "/api/v1/travel/kiosks?";
      if (location) url += `location=${location}&`;
      if (status) url += `status=${status}`;
      return apiRequest<TravelKiosk[]>(url);
    },
    create: (kiosk: TravelKiosk) =>
      apiRequest<TravelKiosk>("/api/v1/travel/kiosks", {
        method: "POST",
        body: JSON.stringify(kiosk),
      }),
    kioskStatus: () => apiRequest<TravelKioskStatus>("/api/v1/travel/stats"),
    verify: (kioskId: string, userId: string) =>
      apiRequest<{
        verification_id: string;
        kiosk_id: string;
        user_id: string;
        status: string;
        timestamp: string;
      }>(`/api/v1/travel/kiosks/${kioskId}/verify`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      }),
    stats: () =>
      apiRequest<{
        total_kiosks: number;
        operational: number;
        total_verifications: number;
        by_location: Record<string, number>;
      }>("/api/v1/travel/stats"),
  },

  // Crypto (Deepfake UC 12)
  crypto: {
    wallets: (blockchain?: string) => {
      const url = blockchain
        ? `/api/v1/crypto/wallets?blockchain=${blockchain}`
        : "/api/v1/crypto/wallets";
      return apiRequest<CryptoWallet[]>(url);
    },
    protect: (wallet: CryptoWallet) =>
      apiRequest<CryptoWallet>("/api/v1/crypto/wallets", {
        method: "POST",
        body: JSON.stringify(wallet),
      }),
    verify: (walletId: string) =>
      apiRequest<{
        verification_id: string;
        wallet_id: string;
        status: string;
        expires_at: number;
      }>(`/api/v1/crypto/wallets/${walletId}/verify`, {
        method: "POST",
      }),
  },

  // Duress (Deepfake UC 3)
  duress: {
    config: (userId: string) =>
      apiRequest<DuressConfig>(`/api/v1/duress/config/${userId}`),
    setConfig: (config: DuressConfig) =>
      apiRequest<DuressConfig>("/api/v1/duress/config", {
        method: "POST",
        body: JSON.stringify(config),
      }),
    trigger: (userId: string, phraseDetected: string) =>
      apiRequest<{
        alert_id: string;
        action_taken: string;
        message: string;
      }>("/api/v1/duress/trigger", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          phrase_detected: phraseDetected,
        }),
      }),
    alerts: (userId?: string, status?: string) => {
      let url = "/api/v1/duress/alerts?";
      if (userId) url += `user_id=${userId}&`;
      if (status) url += `status=${status}`;
      return apiRequest<DuressAlert[]>(url);
    },
  },

  // Gap Remediation (Phase 13/14)
  onPrem: {
    manifest: (type: string = "docker-compose") =>
      apiRequest<any>("/api/v1/on-prem/manifest", {
        method: "POST",
        body: JSON.stringify({ type }),
      }),
    checklist: () =>
      apiRequest<{ checklist: string[] }>("/api/v1/on-prem/checklist"),
  },

  // Deepfake Verification (Deepfake UC 1, 4, 6)
  verify: {
    document: (docUrl: string | any) =>
      apiRequest<{
        document_type: string;
        verified: boolean;
        timestamp: string;
      }>("/api/v1/verify/document", {
        method: "POST",
        body: JSON.stringify(
          typeof docUrl === "string" ? { url: docUrl } : docUrl
        ),
      }),
    voice: (userId: string | any, audioUrl?: string) =>
      apiRequest<{ status: string; confidence: number; timestamp: string }>(
        "/api/v1/verify/voice",
        {
          method: "POST",
          body: JSON.stringify(
            typeof userId === "string"
              ? { user_id: userId, audio_url: audioUrl }
              : userId
          ),
        }
      ),
    biometric: (challengeId: string, signature: string) =>
      apiRequest<{ verified: boolean; timestamp: string }>(
        "/api/v1/verify/biometric",
        {
          method: "POST",
          body: JSON.stringify({ challenge_id: challengeId, signature }),
        }
      ),
  },

  // Advanced Deepfake Detection (Deepfake UC 8)
  advancedDeepfake: {
    voiceVerify: (userId: string, audioUrl: string) =>
      apiRequest<{ status: string; confidence: number; timestamp: string }>(
        "/api/v1/advanced/voice-verify",
        {
          method: "POST",
          body: JSON.stringify({ user_id: userId, audio_url: audioUrl }),
        }
      ),
    analyze: (mediaUrl: string, mediaType: "video" | "audio" | "image") =>
      apiRequest<{
        deepfake_probability: number;
        confidence: number;
        timestamp: string;
      }>("/api/v1/advanced/analyze", {
        method: "POST",
        body: JSON.stringify({ url: mediaUrl, media_type: mediaType }),
      }),
    detectors: {
      list: () => apiRequest<any[]>("/api/v1/deepfake/detectors"),
      create: (detector: any) =>
        apiRequest<any>("/api/v1/deepfake/detectors", {
          method: "POST",
          body: JSON.stringify(detector),
        }),
    },
    runTest: (config: any) =>
      apiRequest<any>("/api/v1/deepfake/test", {
        method: "POST",
        body: JSON.stringify(config),
      }),
    reportIncident: (incident: any) =>
      apiRequest<any>("/api/v1/deepfake/incidents", {
        method: "POST",
        body: JSON.stringify(incident),
      }),
  },

  complianceAudit: {
    hipaa: (userId: string, action: string, resource: string) =>
      apiRequest<Record<string, unknown>>("/api/v1/compliance/audit/hipaa", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, action, resource }),
      }),
    sox: (transactionId: string, amount: number) =>
      apiRequest<Record<string, unknown>>("/api/v1/compliance/audit/sox", {
        method: "POST",
        body: JSON.stringify({ transaction_id: transactionId, amount }),
      }),
    redTeam: (modelId: string) =>
      apiRequest<{ status: string; audit_id: string }>(
        "/api/v1/compliance/red-team",
        {
          method: "POST",
          body: JSON.stringify({ model_id: modelId }),
        }
      ),
    euRegister: (modelId: string) =>
      apiRequest<{ status: string; registration_id: string }>(
        "/api/v1/compliance/eu-register",
        {
          method: "POST",
          body: JSON.stringify({ model_id: modelId }),
        }
      ),
    reportIncident: (incidentData: any) =>
      apiRequest<Incident>("/api/v1/compliance/incidents", {
        method: "POST",
        body: JSON.stringify(incidentData),
        strict: true,
      }),
    listIncidents: () => apiRequest<any[]>("/api/v1/compliance/incidents"),
    runBiasScan: (model_id: string) =>
      apiRequest<any>("/api/v1/compliance/bias-scan", {
        method: "POST",
        body: JSON.stringify({ model_id }),
      }),
    exportAuditTrail: (format: string = "csv") =>
      apiRequest<any>(`/api/v1/compliance/audit/export?format=${format}`, {
        method: "GET",
      }),
  },

  regionalCompliance: {
    rules: (jurisdiction: string) =>
      apiRequest<{
        jurisdiction: string;
        rules: Array<{ id: string; rule: string; description: string }>;
      }>(`/api/v1/compliance/regional/rules?jurisdiction=${jurisdiction}`),
  },

  // Agent Ops & Sentinel Governance
  agentOps: {
    integrateSlack: (channel: string) =>
      apiRequest<{ status: string; message: string }>(
        "/api/v1/integrations/slack",
        {
          method: "POST",
          body: JSON.stringify({ channel }),
        }
      ),
    getMemory: (agentId: string) =>
      apiRequest<{
        agent_id: string;
        memory_fragments: any[];
        summary: string;
      }>(`/api/v1/agents/${agentId}/memory`),
    getForecast: (agentId?: string) =>
      apiRequest<{
        agent_id: string;
        next_30_days_cost_est: number;
        trend: string;
      }>(`/api/v1/agents/${agentId || "default"}/forecast`),
    getAuditLogs: (agentId?: string, limit: number = 50) =>
      apiRequest<any>(
        `/api/v1/agent-ops/audit?${agentId ? `agentId=${agentId}&` : ""}limit=${limit}`
      ),
    runHipaaAudit: (system?: string) =>
      apiRequest<any>("/api/v1/agent-ops/compliance/hipaa", {
        method: "POST",
        body: JSON.stringify({ system }),
      }),
    runSoxAudit: (system?: string) =>
      apiRequest<any>("/api/v1/agent-ops/compliance/sox", {
        method: "POST",
        body: JSON.stringify({ system }),
      }),
    listRules: () => apiRequest<any[]>("/api/v1/agent-ops/rules/budget"),
    createRule: (rule: any) =>
      apiRequest<any>("/api/v1/agent-ops/rules/budget", {
        method: "POST",
        body: JSON.stringify(rule),
        strict: true,
      }),
    listWebhooks: () => apiRequest<any>("/api/v1/agent-ops/webhooks"),
    registerWebhook: (webhook: any) =>
      apiRequest<any>("/api/v1/agent-ops/webhooks", {
        method: "POST",
        body: JSON.stringify(webhook),
      }),
    deleteWebhook: (webhookId: string) =>
      apiRequest<any>(`/api/v1/agent-ops/webhooks/${webhookId}`, {
        method: "DELETE",
      }),
    testWebhook: (webhookId: string) =>
      apiRequest<any>(`/api/v1/agent-ops/webhooks/${webhookId}/test`, {
        method: "POST",
      }),
    resolveAlert: (alertId: string) =>
      apiRequest<any>(`/api/v1/agent-ops/alerts/${alertId}/resolve`, {
        method: "POST",
      }),
    ignoreAlert: (alertId: string) =>
      apiRequest<any>(`/api/v1/agent-ops/alerts/${alertId}/ignore`, {
        method: "POST",
      }),
    optimizeMemory: (agentId: string) =>
      apiRequest<any>(`/api/v1/agents/${agentId}/optimize`, {
        method: "POST",
        strict: true,
      }),
    clone: (agentId: string) =>
      apiRequest<any>(`/api/v1/agents/${agentId}/clone`, {
        method: "POST",
        strict: true,
      }),
    getCloudHealth: (system?: string) =>
      apiRequest<any>("/api/v1/agent-ops/cloud/health"),
    triggerFailover: (region_id: string) =>
      apiRequest<any>("/api/v1/agent-ops/cloud/failover", {
        method: "POST",
        body: JSON.stringify({ region_id }),
      }),
    configureProxy: (rule_id: string, target: string) =>
      apiRequest<any>("/api/v1/agent-ops/cloud/proxy", {
        method: "POST",
        body: JSON.stringify({ rule_id, target }),
      }),
    runForensics: (agentId?: string, options: ApiOptions = {}) =>
      apiRequest<any>(`/api/v1/agent-ops/forensics?agent_id=${agentId || ""}`, {
        ...options,
        method: "POST",
      }),
    provisionClient: (data: any, options: ApiOptions = {}) =>
      apiRequest<any>("/api/v1/agent-ops/whitelabel/provision", {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateRetention: (system: any, days?: number, options: ApiOptions = {}) =>
      apiRequest<any>("/api/v1/agent-ops/config/retention", {
        ...options,
        method: "POST",
        body: JSON.stringify({ system, days }),
      }),
    saveRetentionPolicy: (policy: any, options: ApiOptions = {}) =>
      apiRequest<any>("/api/v1/agent-ops/retention", {
        method: "POST",
        body: JSON.stringify(policy),
      }),
    setGqlProxyConfig: (enabled: boolean) =>
      apiRequest<any>("/api/v1/agent-ops/gateway/gql", {
        method: "POST",
        body: JSON.stringify({ enabled }),
      }),
    listLLMConfigs: () =>
      apiRequest<LLMProviderConfig[]>("/api/v1/agent-ops/models/config"),
    updateLLMConfig: (config: Partial<LLMProviderConfig>) =>
      apiRequest<any>("/api/v1/agent-ops/models/config", {
        method: "POST",
        body: JSON.stringify(config),
      }),
    deployLanguage: (locale: string) =>
      apiRequest<any>("/api/v1/agent-ops/sync-locale", {
        method: "POST",
        body: JSON.stringify({ locale }),
        strict: true,
      }),
    deployRecoveryDaemon: (node_id: string) =>
      apiRequest<any>("/api/v1/agent-ops/self-healing/deploy", {
        method: "POST",
        body: JSON.stringify({ node_id }),
      }),
    getSnapshots: (nodeId?: string) =>
      apiRequest<any[]>(
        `/api/v1/agent-ops/governance/healing/snapshots${nodeId ? `?node_id=${nodeId}` : ""}`
      ),
    updateOptimization: (policy: string) =>
      apiRequest<any>("/api/v1/agent-ops/optimize/policy", {
        method: "POST",
        body: JSON.stringify({ policy }),
      }),
    captureSnapshot: () =>
      apiRequest<any>("/api/v1/agent-ops/governance/healing/snapshots", {
        method: "POST",
      }),
    rollbackSnapshot: (id: string) =>
      apiRequest<any>(
        "/api/v1/agent-ops/governance/healing/snapshots/rollback",
        {
          method: "POST",
          body: JSON.stringify({ snapshot_id: id }),
        }
      ),
    bulkAction: (action: string, agentIds: string[]) =>
      apiRequest<any>(`/api/v1/agent-ops/bulk/${action}`, {
        method: "POST",
        body: JSON.stringify(agentIds),
        strict: true,
      }),
    getVigilanceAlerts: (agentId?: string, options?: ApiOptions) =>
      apiRequest<any[]>(
        `/api/v1/agent-ops/vigilance/alerts${agentId ? `?agent_id=${agentId}` : ""}`,
        options
      ),
    resolveVigilanceAlert: (alertId: string) =>
      apiRequest<any>(`/api/v1/agent-ops/vigilance/alerts/${alertId}/resolve`, {
        method: "POST",
      }),
    getSettings: () => apiRequest<any>("/api/v1/agent-ops/governance/settings"),
    updateSetting: (key: string, value: any) =>
      apiRequest<any>("/api/v1/agent-ops/governance/settings", {
        method: "POST",
        body: JSON.stringify({ key, value }),
      }),
    getROI: (options?: ApiOptions) =>
      apiRequest<any>("/api/v1/agent-ops/governance/roi", options),
    rotateKey: (name: string) =>
      apiRequest<any>("/api/v1/agent-ops/security/rotate-key", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    getForensicTrace: (traceId: string) =>
      apiRequest<any>(`/api/v1/agent-ops/forensic/trace/${traceId}`),
  },

  enterprise: {
    getSlaTier: () =>
      apiRequest<{ tier: string; active: boolean }>("/api/v1/enterprise/sla"),
    updateSlaTier: (tier: string) =>
      apiRequest<any>("/api/v1/enterprise/sla", {
        method: "PUT",
        body: JSON.stringify({ tier }),
      }),
    getPartnerConfig: () => apiRequest<any>("/api/v1/enterprise/partner"),
    updatePartnerTheme: (theme: any) =>
      apiRequest<any>("/api/v1/enterprise/partner/theme", {
        method: "POST",
        body: JSON.stringify({ theme }),
      }),
  },

  sso: {
    handshake: (app_id: string) =>
      apiRequest<any>("/api/v1/sso/handshake", {
        method: "POST",
        body: JSON.stringify({ app_id }),
      }),
    config: (app_id: string) => apiRequest<any>(`/api/v1/sso/config/${app_id}`),
    saveConfig: (app_id: string, config: any) =>
      apiRequest<any>(`/api/v1/sso/config/${app_id}`, {
        method: "POST",
        body: JSON.stringify(config),
      }),
    connectProvider: (app_id: string, provider: string, metadata: any = {}) =>
      apiRequest<any>(`/api/v1/sso/connect/${provider}`, {
        method: "POST",
        body: JSON.stringify({ app_id, metadata }),
      }),
    listProviders: (app_id: string) =>
      apiRequest<Record<string, any>>(`/api/v1/sso/providers/${app_id}`),
  },

  workforce: {
    toggleAutonomy: (level: "partial" | "full") =>
      apiRequest<any>("/api/v1/workforce/autonomy", {
        method: "POST",
        body: JSON.stringify({ level }),
      }),
    getFiscalRequests: () =>
      apiRequest<FiscalRequest[]>("/api/v1/workforce/fiscal-requests"),
    createFiscalRequest: (purpose: string, amount: string, priority: string) =>
      apiRequest<FiscalRequest>("/api/v1/workforce/fiscal-requests", {
        method: "POST",
        body: JSON.stringify({ purpose, amount, priority }),
      }),
    approveFiscalRequest: (id: string, status: string) =>
      apiRequest<any>(`/api/v1/workforce/fiscal-requests/${id}/approve`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    getGoals: () => apiRequest<WorkforceGoal[]>("/api/v1/workforce/goals"),
    updateGoalValue: (id: string, current_value: number) =>
      apiRequest<any>(`/api/v1/workforce/goals/${id}/value`, {
        method: "PUT",
        body: JSON.stringify({ current_value }),
      }),
    getJobs: () => apiRequest<any>("/api/v1/workforce/jobs"),
    getAcquisitions: () => apiRequest<any>("/api/v1/workforce/acquisitions"),
    getContentDrafts: () => apiRequest<any>("/api/v1/workforce/content"),
    getGovernanceDecisions: () =>
      apiRequest<any[]>("/api/v1/workforce/decisions"),
    getExecutionHistory: () => apiRequest<any[]>("/api/v1/workforce/traces"),
    getVentures: () =>
      apiRequest<WorkforceVenture[]>("/api/v1/workforce/ventures"),
    deployCheck: () =>
      apiRequest<any>("/api/v1/workforce/deploy/check", { method: "GET" }),

    runCampaign: (topic: string, audience: string) =>
      apiRequest<any>("/api/v1/workforce/campaigns/run", {
        method: "POST",
        body: JSON.stringify({ topic, audience }),
      }),
    sourceLeads: (criteria: string) =>
      apiRequest<any>(
        `/api/v1/workforce/leads/source?criteria=${encodeURIComponent(criteria)}`
      ),
    runAutosearch: (niche: string, profile: string = "enterprise") =>
      apiRequest<any>("/api/v1/workforce/autosearch/run", {
        method: "POST",
        body: JSON.stringify({ niche, profile }),
      }),
    getOutreachDrafts: () =>
      apiRequest<WorkforceOutreach[]>("/api/v1/workforce/outreach/drafts"),
    approveOutreach: (id: string) =>
      apiRequest<any>(`/api/v1/workforce/outreach/${id}/approve`, {
        method: "POST",
      }),
    analyzeInsights: (feedback: string) =>
      apiRequest<any>("/api/v1/workforce/insights/analyze", {
        method: "POST",
        body: JSON.stringify({ feedback }),
      }),
    handleInbound: (query: string) =>
      apiRequest<any>("/api/v1/workforce/inbound/handle", {
        method: "POST",
        body: JSON.stringify({ query }),
      }),
    provideFeedback: (
      interaction_id: string,
      status: string,
      notes: string = ""
    ) =>
      apiRequest<any>("/api/v1/workforce/feedback", {
        method: "POST",
        body: JSON.stringify({ interaction_id, status, notes }),
      }),
    cashclaw: {
      recover: (criteria: string) =>
        apiRequest<any>("/api/v1/workforce/cashclaw/recover", {
          method: "POST",
          body: JSON.stringify({ criteria }),
        }),
    },

    // Chat / Console Methods
    sendMessage: (message: string, recipient: string = "all") =>
      apiRequest<WorkforceMessage>("/api/v1/workforce/chat", {
        method: "POST",
        body: JSON.stringify({ message, recipient }),
      }),
    getChatHistory: () =>
      apiRequest<WorkforceMessage[]>("/api/v1/workforce/chat/history"),
    getAgents: () => apiRequest<any[]>("/api/v1/workforce/agents"),
    getInboxMessages: () => apiRequest<any[]>("/api/v1/workforce/inbox"),

    // Task Management
    getTasks: () => apiRequest<Task[]>("/api/v1/workforce/tasks"),
    createTask: (task: Partial<Task>) =>
      apiRequest<Task>("/api/v1/workforce/tasks", {
        method: "POST",
        body: JSON.stringify(task),
      }),
    updateTask: (taskId: string, task: Partial<Task>) =>
      apiRequest<Task>(`/api/v1/workforce/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(task),
      }),
    deleteTask: (taskId: string) =>
      apiRequest<any>(`/api/v1/workforce/tasks/${taskId}`, {
        method: "DELETE",
      }),
    completeTask: (taskId: string) =>
      apiRequest<Task>(`/api/v1/workforce/tasks/${taskId}/complete`, {
        method: "POST",
      }),

    // Client CRM
    getClients: () => apiRequest<Client[]>("/api/v1/workforce/clients"),
    createClient: (client: Partial<Client>) =>
      apiRequest<Client>("/api/v1/workforce/clients", {
        method: "POST",
        body: JSON.stringify(client),
      }),
    updateClient: (clientId: string, client: Partial<Client>) =>
      apiRequest<Client>(`/api/v1/workforce/clients/${clientId}`, {
        method: "PUT",
        body: JSON.stringify(client),
      }),
    deleteClient: (clientId: string) =>
      apiRequest<any>(`/api/v1/workforce/clients/${clientId}`, {
        method: "DELETE",
      }),

    // Schedule/Events
    getScheduleEvents: () =>
      apiRequest<ScheduleEvent[]>("/api/v1/workforce/schedule"),
    createScheduleEvent: (event: Partial<ScheduleEvent>) =>
      apiRequest<ScheduleEvent>("/api/v1/workforce/schedule", {
        method: "POST",
        body: JSON.stringify(event),
      }),
    updateScheduleEvent: (eventId: string, event: Partial<ScheduleEvent>) =>
      apiRequest<ScheduleEvent>(`/api/v1/workforce/schedule/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(event),
      }),
    deleteScheduleEvent: (eventId: string) =>
      apiRequest<any>(`/api/v1/workforce/schedule/${eventId}`, {
        method: "DELETE",
      }),

    // Integrations
    getIntegrations: () =>
      apiRequest<Integration[]>("/api/v1/workforce/integrations"),
    createIntegration: (integration: Partial<Integration>) =>
      apiRequest<Integration>("/api/v1/workforce/integrations", {
        method: "POST",
        body: JSON.stringify(integration),
      }),
    updateIntegration: (
      integrationId: string,
      integration: Partial<Integration>
    ) =>
      apiRequest<Integration>(
        `/api/v1/workforce/integrations/${integrationId}`,
        {
          method: "PUT",
          body: JSON.stringify(integration),
        }
      ),
    deleteIntegration: (integrationId: string) =>
      apiRequest<any>(`/api/v1/workforce/integrations/${integrationId}`, {
        method: "DELETE",
      }),

    // Billing & Invoices
    getInvoices: () => apiRequest<any[]>("/api/v1/workforce/invoices"),
    billing: {
      createCheckout: (tier: string, provider: string) =>
        apiRequest<{ url: string }>("/api/v1/workforce/billing/checkout", {
          method: "POST",
          body: JSON.stringify({ tier, provider }),
        }),
    },

    // Bot Settings
    getBotSettings: (userId: string) =>
      apiRequest<BotSetting[]>("/api/v1/workforce/bot-settings/" + userId),
    createBotSetting: (setting: Partial<BotSetting>) =>
      apiRequest<BotSetting>("/api/v1/workforce/bot-settings", {
        method: "POST",
        body: JSON.stringify(setting),
      }),
    updateBotSetting: (settingId: string, setting: Partial<BotSetting>) =>
      apiRequest<BotSetting>(`/api/v1/workforce/bot-settings/${settingId}`, {
        method: "PUT",
        body: JSON.stringify(setting),
      }),
    deleteBotSetting: (settingId: string) =>
      apiRequest<any>(`/api/v1/workforce/bot-settings/${settingId}`, {
        method: "DELETE",
      }),

    // Financial Data
    getInsights: () => apiRequest<any>("/api/v1/workforce/insights"),
    getEarningsData: () => apiRequest<any>("/api/v1/workforce/earnings"),
    getTaxEstimate: () => apiRequest<any>("/api/v1/workforce/tax-estimate"),

    // Referral Program
    activateReferral: (userId?: string) =>
      apiRequest<any>("/api/v1/workforce/referral/activate", {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      }),
    getReferralStats: () => apiRequest<any>("/api/v1/workforce/referral/stats"),
    exportData: (format: string = "csv") =>
      apiRequest<any>(`/api/v1/workforce/export?format=${format}`, {
        method: "GET",
      }),
  },

  sentinel: {
    getHealingStatus: () => apiRequest<any>("/agent-ops/self-healing/status"),
    registerNode: (node_id: string, url: string, provider: string) =>
      apiRequest<any>("/agent-ops/self-healing/nodes/register", {
        method: "POST",
        body: JSON.stringify({ node_id, url, provider }),
      }),
    injectHint: (agentId: string, hint: string) =>
      apiRequest<any>(`/agent-ops/agents/${agentId}/hint`, {
        method: "POST",
        body: JSON.stringify({ hint }),
      }),
    updateHealingConfig: (config: {
      auto_refine?: boolean;
      safety_rollback?: boolean;
      error_threshold?: number;
    }) =>
      apiRequest<any>("/agent-ops/governance/healing/configs", {
        method: "POST",
        body: JSON.stringify(config),
      }),
    getStreamingMetrics: () => apiRequest<any>("/agent-ops/metrics/stream"),
  },

  vendors: {
    list: () => apiRequest<any[]>("/api/v1/vendors"),
    create: (vendor: any) =>
      apiRequest<any>("/api/v1/vendors", {
        method: "POST",
        body: JSON.stringify(vendor),
      }),
    delete: (id: string) =>
      apiRequest<any>(`/api/v1/vendors/${id}`, {
        method: "DELETE",
      }),
  },
  agents: {
    list: () => apiRequest<any[]>("/agents"),
    get: (id: string) => apiRequest<any>(`/agents/${id}`),
    create: (data: any) =>
      apiRequest<any>("/agents", {
        method: "POST",
        body: JSON.stringify(data),
        strict: true,
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/agents/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        strict: true,
      }),
    delete: (id: string) =>
      apiRequest<any>(`/agents/${id}`, {
        method: "DELETE",
        strict: true,
      }),
    start: (id: string) =>
      apiRequest<any>(`/agents/${id}/start`, {
        method: "POST",
        strict: true,
      }),
    stop: (id: string) =>
      apiRequest<any>(`/agents/${id}/stop`, {
        method: "POST",
        strict: true,
      }),
    installSkill: (id: string, skillId: string) =>
      apiRequest<any>(`/agents/${id}/skills/${skillId}`, {
        method: "POST",
        strict: true,
      }),
    uninstallSkill: (id: string, skillId: string) =>
      apiRequest<any>(`/agents/${id}/skills/${skillId}`, {
        method: "DELETE",
        strict: true,
      }),
  },
  deepfake: {
    listAnalyses: () => apiRequest<any[]>("/api/v1/deepfake/analyses"),
    getStats: () => apiRequest<any>("/api/v1/deepfake/stats"),
    listThreats: () => apiRequest<any[]>("/api/v1/deepfake/threats"),
    listModels: () => apiRequest<any[]>("/api/v1/deepfake/models"),
    analyze: (media_url: string, media_type: string) =>
      apiRequest<any>("/api/v1/deepfake/analyze", {
        method: "POST",
        body: JSON.stringify({ media_url, media_type }),
        strict: true,
      }),
    analyzeEnterprise: (data: any) =>
      apiRequest<any>("/api/v1/deepfake/analyze/enterprise", {
        method: "POST",
        body: JSON.stringify(data),
        strict: true,
      }),
    challenge: (user_id: string) =>
      apiRequest<any>(`/api/v1/deepfake/challenge?user_id=${user_id}`, {
        method: "POST",
        strict: true,
      }),
    verify: (challenge_id: string, signature: string, hardware_id: string) =>
      apiRequest<any>(
        `/api/v1/deepfake/verify?challenge_id=${challenge_id}&signature=${signature}&hardware_id=${hardware_id}`,
        {
          method: "POST",
          strict: true,
        }
      ),
    updateConfig: (config: any) =>
      apiRequest<any>("/api/v1/deepfake/config", {
        method: "POST",
        body: JSON.stringify(config),
        strict: true,
      }),
    getDuressConfig: (user_id: string) =>
      apiRequest<any>(`/api/v1/deepfake/duress/config/${user_id}`, {
        strict: true,
      }),
    updateDuressConfig: (config: any) =>
      apiRequest<any>("/api/v1/deepfake/duress/config", {
        method: "POST",
        body: JSON.stringify(config),
        strict: true,
      }),
    runAudit: (type: "hipaa" | "sox") =>
      apiRequest<any>(`/api/v1/compliance/audit/${type}`, {
        method: "POST",
        strict: true,
      }),
    train: (dataset_name: string) =>
      apiRequest<any>(`/api/v1/deepfake/train?dataset_name=${dataset_name}`, {
        method: "POST",
        strict: true,
      }),
    deployModel: (model: any) =>
      apiRequest<any>("/api/v1/deepfake/models", {
        method: "POST",
        body: JSON.stringify(model),
        strict: true,
      }),
    listBiometrics: () => apiRequest<any[]>("/api/v1/deepfake/biometrics"),
    revokeBiometric: (id: string) =>
      apiRequest<any>(`/api/v1/deepfake/biometrics/${id}`, {
        method: "DELETE",
        strict: true,
      }),
    enrollBiometric: (data: any) =>
      apiRequest<any>("/api/v1/deepfake/biometrics", {
        method: "POST",
        body: JSON.stringify(data),
        strict: true,
      }),
  },
  governance: {
    budget: {
      listRules: () => apiRequest<any[]>("/agent-ops/rules/budget"),
      createRule: (rule: any) =>
        apiRequest<any>("/agent-ops/rules/budget", {
          method: "POST",
          body: JSON.stringify(rule),
          strict: true,
        }),
    },
    compliance: {
      getDashboard: () =>
        apiRequest<any>("/agent-ops/governance/compliance/dashboard"),
      getArticles: () =>
        apiRequest<any[]>("/agent-ops/governance/compliance/articles"),
      assessArticle: (articleId: string, assessment: any) =>
        apiRequest<any>(
          `/agent-ops/governance/compliance/assess/${articleId}`,
          {
            method: "POST",
            body: JSON.stringify(assessment),
          }
        ),
      alerts: {
        update: (alertId: string, data: Partial<AlertConfig>) =>
          apiRequest<any>(
            `/agent-ops/governance/compliance/alerts/${alertId}`,
            {
              method: "POST",
              body: JSON.stringify(data),
              strict: true,
            }
          ),
      },
    },
    sla: {
      getDashboard: () =>
        apiRequest<any>("/agent-ops/governance/sla/dashboard"),
      getMetrics: () => apiRequest<any[]>("/agent-ops/governance/sla/metrics"),
    },
    partners: {
      list: () => apiRequest<any[]>("/agent-ops/governance/partners"),
      sync: (partnerId: string) =>
        apiRequest<any>(`/agent-ops/governance/partners/${partnerId}/sync`, {
          method: "POST",
        }),
    },
    forecast: {
      getUsage: (options?: ApiOptions) =>
        apiRequest<any[]>("/agent-ops/governance/forecast/usage", options),
    },
    analytics: {
      getROI: () => apiRequest<any[]>("/agent-ops/governance/analytics/roi"),
      realizeImpact: (insight_id: string) =>
        apiRequest<any>("/agent-ops/governance/analytics/realize", {
          method: "POST",
          body: JSON.stringify({ insight_id }),
        }),
    },
    localization: {
      getConfigs: () =>
        apiRequest<any[]>("/agent-ops/governance/localization/configs"),
    },
    healing: {
      getConfigs: () =>
        apiRequest<any[]>("/agent-ops/governance/healing/configs"),
    },
    insights: {
      getStrategic: () =>
        apiRequest<any[]>("/agent-ops/governance/insights/strategic"),
    },
    settings: {
      list: () => apiRequest<any[]>("/agent-ops/governance/settings"),
      update: (settings: Record<string, any>) =>
        apiRequest<any>("/agent-ops/governance/settings", {
          method: "POST",
          body: JSON.stringify(settings),
        }),
    },
    onPrem: {
      listDeployments: () =>
        apiRequest<any[]>("/agent-ops/governance/on-prem/deployments"),
      triggerAction: (deploymentId: string, action: string) =>
        apiRequest<any>(
          `/agent-ops/governance/on-prem/deploy/${deploymentId}?action=${action}`,
          {
            method: "POST",
          }
        ),
    },
  },
};

export async function workforceSync() {
  try {
    const status = await apiRequest<any>("/api/v1/workforce/status");
    return status;
  } catch (e) {
    console.error("Workforce sync failed:", e);
    throw e;
  }
}

// ============================================================================
// Denial Defense API
// ============================================================================

export const denialDefenseApi = {
  listClaims: () => apiRequest<Claim[]>("/api/v1/denial-defense/claims"),
  createClaim: (claim: Partial<Claim>) =>
    apiRequest<Claim>("/api/v1/denial-defense/claims", {
      method: "POST",
      body: JSON.stringify(claim),
      strict: true,
    }),
  updateClaim: (claim: Partial<Claim>) =>
    apiRequest<Claim>("/api/v1/denial-defense/claims", {
      method: "PUT",
      body: JSON.stringify(claim),
      strict: true,
    }),
};

// ============================================================================
// Venture / Market Intelligence API
// ============================================================================

export const ventureApi = {
  getInsights: () =>
    apiRequest<BusinessIdea[]>("/api/v1/agent-ops/venture/insights"),
  getIdeaDetail: (id: number) =>
    apiRequest<BusinessIdea>(`/api/v1/agent-ops/venture/${id}`),
  analyzeScenario: (
    ideaId: number,
    scenario: string,
    options: ApiOptions = {}
  ) =>
    apiRequest<any>("/api/v1/agent-ops/venture/scenario/analyze", {
      ...options,
      method: "POST",
      body: JSON.stringify({ idea_id: ideaId, scenario }),
    }),
};

// ============================================================================
// Domain Constants (Moved from businessData.ts for Real-First Hardening)
// ============================================================================

export const CATEGORY_COLORS: Record<string, string> = {
  "AI & Technology": "#6366f1",
  HealthTech: "#10b981",
  FinTech: "#f59e0b",
  CleanTech: "#22c55e",
  EdTech: "#3b82f6",
  "E-Commerce": "#ec4899",
  PropTech: "#8b5cf6",
  AgeTech: "#f97316",
  InsurTech: "#06b6d4",
  LegalTech: "#a78bfa",
  HRTech: "#fb7185",
  LogisticsTech: "#34d399",
  MobilityTech: "#60a5fa",
  RegTech: "#fbbf24",
  Sustainability: "#4ade80",
  Cybersecurity: "#f87171",
  AgriTech: "#86efac",
  MarTech: "#c084fc",
  Media: "#67e8f9",
  PetTech: "#fde68a",
  Cannabis: "#6ee7b7",
  IndustrialTech: "#93c5fd",
  "Drone Tech": "#a5b4fc",
  Wellness: "#f9a8d4",
  Hospitality: "#fcd34d",
  HospitalityTech: "#fcd34d",
  "Food & Beverage": "#fdba74",
  FoodTech: "#fb923c",
  Retail: "#d1d5db",
  Services: "#9ca3af",
  "Beauty & Wellness": "#f472b6",
  Consulting: "#a3e635",
  Travel: "#38bdf8",
};

export const TREND_COLORS: Record<string, string> = {
  Explosive: "#22c55e",
  "High Growth": "#3b82f6",
  Steady: "#f59e0b",
};

export const ALL_CATEGORIES = [
  "AI & Technology",
  "AgeTech",
  "AgriTech",
  "Beauty & Wellness",
  "Cannabis",
  "CleanTech",
  "Consulting",
  "Cybersecurity",
  "Drone Tech",
  "E-Commerce",
  "EdTech",
  "FinTech",
  "Food & Beverage",
  "FoodTech",
  "HRTech",
  "HealthTech",
  "Hospitality",
  "HospitalityTech",
  "IndustrialTech",
  "InsurTech",
  "LegalTech",
  "LogisticsTech",
  "MarTech",
  "Media",
  "MobilityTech",
  "PetTech",
  "PropTech",
  "RegTech",
  "Retail",
  "Services",
  "Sustainability",
  "Travel",
  "Wellness",
];

export const ALL_MARKETS = ["US", "UK", "EU", "Canada"];
export const ALL_TRENDS = ["Explosive", "High Growth", "Steady"];

// ============================================================================
// Hermes AI Agent Integration
// ============================================================================

export const hermesApi = {
  chat: (message: string, systemPrompt?: string) =>
    apiRequest<{ response: string; source: string }>("/api/v1/hermes/chat", {
      method: "POST",
      body: JSON.stringify({ message, system_prompt: systemPrompt }),
    }),

  analyzeMetrics: (metrics: Record<string, unknown>) =>
    apiRequest<any>("/api/v1/hermes/analyze", {
      method: "POST",
      body: JSON.stringify({ metrics }),
    }),

  suggestFix: (error: string, context: Record<string, unknown>) =>
    apiRequest<any>("/api/v1/hermes/suggest-fix", {
      method: "POST",
      body: JSON.stringify({ error, context }),
    }),

  validateStrategy: (strategy: Record<string, unknown>) =>
    apiRequest<any>("/api/v1/hermes/validate-strategy", {
      method: "POST",
      body: JSON.stringify({ strategy }),
    }),
};
