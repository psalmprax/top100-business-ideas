/**
 * AgentOps Domain Types
 */

export interface DashboardAgent {
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
  status: "running" | "stopped" | "error" | "paused";
  environment?: string;
  provider?: string;
  model?: string;
  api_secret?: string;
  provider_api_key?: string;
  org_id?: string;
  control_webhook?: string;
  budget: number;
  daily_spend: number;
  tier: "strategic" | "tactical" | "industrial";
  persistent_memory?: boolean;
  config: {
    provider: string;
    model: string;
    max_tokens: number;
    temperature: number;
    rules: DashboardAgentRule[];
  };
  metrics: DashboardAgentMetrics;
  created_at: string | Date;
  updated_at?: string | Date;
  last_active_at?: string | Date;
  metadata?: Record<string, any>;
}

export interface DashboardAgentRule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface DashboardAgentMetrics {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  avg_latency_ms: number;
  error_rate: number;
  loop_count: number;
  cache_hits: number;
  loops_prevented: number;
  cost_saved: number;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  agent_id: string;
  agent_name: string;
  action: string;
  intent: string;
  outcome: "approved" | "denied" | "modified" | "paused";
  tokens: number;
  cost: number;
  reasoning: string;
  summary: string;
  interaction_id?: string;
}

export interface AlertConfig {
  id: string;
  type: "slack" | "teams" | "email" | "webhook" | "governance";
  channel: string;
  threshold: number;
  enabled: boolean;
  is_active?: boolean;
  limit?: number;
  action?: string;
  priority?: string;
}

export interface LLMMetrics {
  p95_latency_ms: number;
  avg_latency_ms: number;
  throughput: number;
  error_rate: number;
  cost_per_1k: number;
  uptime: number;
}

export interface LLMProviderConfig {
  id: string;
  name: string;
  provider: "deepseek" | "google" | "openai" | "anthropic" | "meta" | "local";
  model: string;
  status: "active" | "degraded" | "down";
  is_primary: boolean;
  failover_priority: number;
  api_key_set: boolean;
  metrics: LLMMetrics;
}

export interface BudgetRule {
  id: string;
  name: string;
  agent_ids: string[];
  daily_limit: number;
  priority: "low" | "medium" | "high";
  action: "pause" | "alert" | "throttle";
  enabled: boolean;
}

export type CategoryType = "core" | "ops" | "gov" | "advanced" | "intelligence";

export interface ComplianceDashboardData {
  overall_score: number;
  total_articles: number;
  compliant_articles: number;
  risk_distribution: Record<string, number>;
  recent_assessments: any[];
  critical_issues: any[];
}

export interface SLADashboardData {
  current_sla: {
    name: string;
    tier: string;
    uptime_guarantee: number;
    response_time_sla: number;
    resolution_time_sla: number;
  };
  current_metrics: {
    uptime_percentage: number;
    avg_response_time: number;
    total_incidents: number;
    breaches_count: number;
    status: string;
  };
  compliance_status: string;
}

export interface PartnerIntegration {
  id: string;
  name: string;
  partner_type: string;
  active: boolean;
  last_sync: string | null;
}

export interface UsageForecast {
  forecast_date: string;
  month: string;
  predicted_usage: number;
  current_usage: number;
  predicted_tokens: number;
  predicted_cost: number;
  confidence_level: number;
  confidence_score: number;
  trend: "up" | "down" | "stable";
}

export interface ROIMetric {
  period: string;
  metric_name: string;
  value: number;
  total_cost: number;
  value_generated: number;
  roi_percentage: number;
  trend_percentage: number;
  cost_savings: number;
  efficiency_gains: number;
}

export interface LocalizationConfig {
  id: string;
  region: string;
  language_code: string;
  region_code: string;
  timezone: string;
  currency: string;
  compliance_framework: string;
  active: boolean;
  status: string;
  accuracy_score: number;
  is_active: boolean;
}

export interface HealingConfig {
  id: string;
  healing_type: string;
  trigger_conditions: Record<string, any>;
  recovery_actions: string[];
  cooldown_period: number;
  max_attempts: number;
  active: boolean;
  error_threshold: number;
  auto_healing_enabled: boolean;
  mitigations_count?: number;
  last_mitigation_time?: string;
  updated_at?: string;
}

export interface StrategicInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  confidence_score: number;
  confidence: number;
  impact_level: string;
  priority: "low" | "medium" | "high";
  recommended_actions: string[];
}

export interface SystemSetting {
  id: string;
  category: string;
  setting_key: string;
  setting_name: string;
  setting_value: string;
  value: string;
  setting_type: string;
  description: string;
}

export interface OnPremDeployment {
  id: string;
  deployment_name: string;
  kubernetes_version: string;
  node_count: number;
  status: string;
  last_health_check: string | null;
}
