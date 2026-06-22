/**
 * Shared Types for Top 100 Business Ideas Platform
 * High-quality type definitions for frontend/backend/middleware communication
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "user" | "viewer";
  organization_id?: string;
  mfa_enabled?: boolean;
}

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  plan: Plan;
  settings: OrganizationSettings;
}

export type Plan = "free" | "pro" | "enterprise";

export interface OrganizationSettings {
  timezone: string;
  locale: string;
  plan: Plan;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  slack: boolean;
  inApp: boolean;
}

// ============================================================================
// Venture-Specific Types (Alpha Ventures)
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  config: AgentConfig;
  metrics: AgentMetrics;
  created_at: Date;
  last_active_at: Date;
}

export type AgentType = "langgraph" | "crewai" | "autogen" | "custom";
export type AgentStatus = "running" | "stopped" | "error" | "paused" | "active";

export type ComplianceStatus =
  | "passed"
  | "failed"
  | "pending"
  | "review"
  | "compliant"
  | "non_compliant"
  | "verifying"
  | "active"
  | "inactive";

export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";

export type TrainingStatus = "queued" | "training" | "completed" | "failed";

export type Provider = "openai" | "anthropic" | "google" | "custom";

export interface AgentConfig {
  provider: Provider;
  model: string;
  max_tokens: number;
  temperature: number;
  reasoning_budget?: number;
  rules: AgentRule[];
}

export interface AgentRule {
  id: string;
  name: string;
  type: AgentRuleType;
  enabled: boolean;
  config: Record<string, unknown>;
}

export type AgentRuleType =
  | "loop_prevention"
  | "cost_cap"
  | "semantic_cache"
  | "pii_filter";

export interface AgentMetrics {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  avg_latency_ms: number;
  error_rate: number;
  loop_count: number;
  cache_hits: number;
  tasks_total?: number;
  tasks_completed?: number;
  tasks_failed?: number;
  compute_load?: number;
  p99_latency?: number;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  requestId: string;
}

export interface PaginatedRequest {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: number;
}

export type WebSocketMessageType =
  | "agent_update"
  | "metric"
  | "alert"
  | "error";

export interface AgentUpdateEvent {
  agentId: string;
  status: AgentStatus;
  reason?: string;
}

export interface MetricEvent {
  agentId: string;
  metric: keyof AgentMetrics;
  value: number;
  timestamp: number;
}

export interface AlertEvent {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  agentId?: string;
  metadata?: Record<string, unknown>;
}

export type AlertType =
  | "cost_threshold"
  | "loop_detected"
  | "error"
  | "compliance";
export type AlertSeverity =
  | "info"
  | "warning"
  | "critical"
  | "low"
  | "medium"
  | "high";

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthToken;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================================================
// Billing & Monetization Types
// ============================================================================

export interface Subscription {
  id: string;
  plan: Plan;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
}

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  paid_at?: Date;
  created_at: Date;
}

export interface UsageRecord {
  agentId: string;
  metric: string;
  value: number;
  timestamp: Date;
}

export interface UsageSummary {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  period: UsagePeriod;
  start_date: Date;
  end_date: Date;
}

export type UsagePeriod = "daily" | "monthly" | "yearly";

// ============================================================================
// Compliance Types (AI Act & Deepfake)
// ============================================================================

export interface ComplianceCheck {
  id: string;
  type: ComplianceCheckType;
  status: ComplianceStatus;
  score: number;
  findings: ComplianceFinding[];
  checked_at: Date;
}

export type ComplianceCheckType =
  | "ai_act"
  | "deepfake"
  | "privacy"
  | "security";

export interface ComplianceFinding {
  rule: string;
  severity: FindingSeverity;
  description: string;
  recommendation: string;
}

export type FindingSeverity = "low" | "medium" | "high" | "critical";

export interface DeepfakeAnalysis {
  id: string;
  media_url: string;
  media_type: MediaType;
  result: AnalysisResult;
  confidence: number;
  analysis_at: Date;
  details: DeepfakeDetails;
}

export type MediaType = "image" | "video" | "audio";
export type AnalysisResult = "real" | "fake" | "uncertain";

export interface DeepfakeDetails {
  artifacts: number;
  consistency: number;
  sourceMatch?: number;
  flags: string[];
}

// ============================================================================
// Test & Quality Types
// ============================================================================

export interface TestRun {
  id: string;
  venture_id: string;
  type: TestType;
  status: TestStatus;
  started_at: Date;
  completed_at?: Date;
  results: TestResult[];
  coverage?: TestCoverage;
}

export type TestType = "unit" | "integration" | "e2e" | "performance";
export type TestStatus = "running" | "passed" | "failed" | "skipped";

export interface TestResult {
  name: string;
  status: TestStatus;
  duration: number;
  error?: string;
}

export interface TestCoverage {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

// ============================================================================
// Middleware Types (Proxy)
// ============================================================================

export interface ProxyRequest {
  id: string;
  agent_id: string;
  prompt: string;
  model: string;
  max_tokens: number;
  metadata: Record<string, unknown>;
}

export interface ProxyResponse {
  id: string;
  request_id: string;
  response: string;
  tokens: number;
  cost: number;
  cached: boolean;
  latency_ms: number;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstSize: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  semanticSearch: boolean;
}

// ============================================================================
// Venture-specific types for UI
// ============================================================================

export interface VentureCard {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  market: string;
  trend: string;
  probability: number;
  status: "alpha" | "beta" | "live";
}

export interface DashboardMetrics {
  totalVentures: number;
  activeVentures: number;
  totalRevenue: number;
  userCount: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Maybe<T> = T | null;
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;

export type ValueOf<T> = T[keyof T];
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
