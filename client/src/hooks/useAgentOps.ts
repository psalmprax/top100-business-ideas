import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { extendedApi, type Agent } from "../lib/api";

// ── Inline types (previously in components/AgentOps/types.ts) ──
interface DashboardAgent {
  id: string;
  name: string;
  status: string;
  environment?: string;
  org_id?: string;
  persistent_memory?: boolean;
  provider?: string;
  model?: string;
  metadata?: Record<string, unknown>;
  daily_spend?: number;
  budget?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  last_active_at?: Date | string;
  config: {
    provider: string;
    model: string;
    max_tokens: number;
    temperature: number;
    rules: Record<string, unknown>[];
  };
  metrics: {
    tasks_total: number;
    tasks_completed: number;
    tasks_failed: number;
    uptime: number;
    total_requests: number;
    total_tokens: number;
    total_cost: number;
    avg_latency_ms: number;
    error_rate: number;
    loop_count: number;
    cache_hits: number;
    loops_prevented: number;
    cost_saved: number;
  };
}

interface AuditEntry {
  agentId: string;
  agentName: string;
  timestamp: Date;
  summary: string;
  interactionId: string;
  action?: string;
  reasoning?: string;
  details?: string;
  [key: string]: unknown;
}

interface BudgetRule {
  id: string;
  [key: string]: unknown;
}

interface AlertConfig {
  id: string;
  is_active: boolean;
  [key: string]: unknown;
}

interface LLMProviderConfig {
  id: string;
  [key: string]: unknown;
}

type CategoryType = "core" | "ops" | "gov" | "advanced" | "intelligence";

interface ROIMetric {
  id: string;
  [key: string]: unknown;
}

interface HealingConfig {
  id: string;
  type: string;
  active: boolean;
  auto_healing_enabled: boolean;
  mitigations_count?: number;
  last_mitigation_time?: string;
  [key: string]: unknown;
}

interface UsageForecast {
  id: string;
  [key: string]: unknown;
}

export function useAgentOps() {
  const { user, isAuthenticated } = useAuth();
  const [agents, setAgents] = useState<DashboardAgent[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("core");
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditFilterOutcome, setAuditFilterOutcome] = useState("all");

  // Feature specific states
  const [budgetRules, setBudgetRules] = useState<BudgetRule[]>([]);
  const [webhooks, setWebhooks] = useState<Record<string, unknown>[]>([]);
  const [multiCloudStatus, setMultiCloudStatus] = useState<Record<string, unknown> | null>(null);
  const [selfHealingEvents, setSelfHealingEvents] = useState<Record<string, unknown>[]>([]);
  const [clusterNodes, setClusterNodes] = useState<Record<string, unknown>[]>([]);
  const [llmConfigs, setLlmConfigs] = useState<LLMProviderConfig[]>([]);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([]);
  const [vigilanceAlerts, setVigilanceAlerts] = useState<Record<string, unknown>[]>([]);
  const [roiMetrics, setRoiMetrics] = useState<ROIMetric[]>([]);
  const [healingConfigs, setHealingConfigs] = useState<HealingConfig[]>([]);
  const [usageForecasts, setUsageForecasts] = useState<UsageForecast[]>([]);
  const [ssoConfig, setSsoConfig] = useState<Record<string, unknown> | null>(null);
  const [complianceStatus, setComplianceStatus] = useState({
    hipaa: "PENDING",
    sox: "PENDING",
    gdpr: "PENDING",
  });

  // Real-time metrics
  const [liveMetrics] = useState({
    throughput: 0,
    latency: 0,
    status: "inactive",
    active_connections: 0,
    cpu_usage: 0,
    memory_usage: 0,
    uptime: 0,
  });

  // Intel states
  const [researchTopic, setResearchTopic] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<Record<string, unknown> | null>(null);
  const [strategyPrompt, setStrategyPrompt] = useState("");
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [strategyResult, setStrategyResult] = useState<Record<string, unknown> | null>(null);

  // Dialog states
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<DashboardAgent | null>(
    null
  );
  const [showNewAgentDialog, setShowNewAgentDialog] = useState(false);
  const [architectureDefaults, setArchitectureDefaults] = useState({
    temperature: 0.7,
    maxTokens: 4000,
    budget: 10,
  });
  const [newAgentData, setNewAgentData] = useState<{
    name: string;
    type: string;
    environment: string;
    provider: string;
    model: string;
    budget: number;
    maxTokens: number;
    org_id: string;
    control_webhook: string;
    metadata: Record<string, unknown>;
    tier: string;
    persistent_memory: boolean;
  }>({
    name: "",
    type: "langgraph",
    environment: "production",
    provider: "openai",
    model: "gpt-4o",
    budget: 10,
    maxTokens: 100000,
    org_id: "",
    control_webhook: "",
    metadata: {},
    tier: "industrial",
    persistent_memory: true,
  });

  const refreshData = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      const [
        agentsRes,
        auditRes,
        rulesRes,
        webhookRes,
        cloudRes,
        healingRes,
        llmRes,
        alertsRes,
        vigilanceRes,
        roiRes,
        healingConfigRes,
        forecastRes,
        complianceStatusRes,
        defaultsRes,
      ] = await Promise.all([
        extendedApi.agents.list(),
        extendedApi.agentOps.getAuditLogs(
          undefined,
          auditSearchQuery,
          auditFilterOutcome === "all" ? undefined : auditFilterOutcome
        ),
        extendedApi.governance.budget.listRules(),
        extendedApi.agentOps.listWebhooks(),
        extendedApi.agentOps.getCloudHealth(),
        extendedApi.sentinel.getHealingStatus(),
        extendedApi.agentOps.listLLMConfigs(),
        extendedApi.alerts.list(),
        extendedApi.agentOps.getVigilanceAlerts(),
        extendedApi.governance.analytics.getROI(),
        extendedApi.governance.healing.getConfigs(),
        extendedApi.governance.forecast.getUsage(),
        extendedApi.governance.compliance.getStatus(),
        extendedApi.agentOps.getArchitectureDefaults(),
      ]);

      if (defaultsRes) setArchitectureDefaults(defaultsRes as typeof architectureDefaults);

      if (complianceStatusRes) setComplianceStatus(complianceStatusRes as typeof complianceStatus);

      if (Array.isArray(roiRes)) setRoiMetrics(roiRes as ROIMetric[]);
      if (Array.isArray(healingConfigRes)) {
        const enriched = (healingConfigRes as HealingConfig[]).map((c, i) =>
          i === 0
            ? {
                ...c,
                mitigations_count: (healingRes as Record<string, unknown>)?.mitigations_count as number || 0,
                last_mitigation_time:
                  ((healingRes as Record<string, unknown>)?.recent_recoveries as Record<string, unknown>[])?.[0]?.timestamp as string,
              }
            : c
        );
        setHealingConfigs(enriched);
      }
      if (Array.isArray(forecastRes)) setUsageForecasts(forecastRes as UsageForecast[]);

      const transformedAgents: DashboardAgent[] = (
        Array.isArray(agentsRes) ? agentsRes : []
      ).map(agent => ({
        ...agent,
        id: agent.id,
        name: agent.name,
        status: agent.status,
        daily_spend: agent.daily_spend || 0,
        budget: agent.budget || 100,
        created_at: new Date(agent.created_at || new Date()),
        updated_at: new Date(
          agent.updated_at || agent.created_at || new Date()
        ),
        last_active_at: new Date(
          agent.last_active_at ||
            agent.updated_at ||
            agent.created_at ||
            new Date()
        ),
        config: {
          provider: agent.config?.provider || agent.provider || "openai",
          model: agent.config?.model || agent.model || "gpt-4o",
          max_tokens:
            agent.config?.max_tokens || architectureDefaults.maxTokens,
          temperature:
            agent.config?.temperature || architectureDefaults.temperature,
          rules: agent.config?.rules || [],
        },
        metrics: {
          tasks_total: agent.metrics?.tasks_total || 0,
          tasks_completed: agent.metrics?.tasks_completed || 0,
          tasks_failed: agent.metrics?.tasks_failed || 0,
          uptime: agent.metrics?.uptime || 0,
          total_requests: agent.metrics?.total_requests || 0,
          total_tokens: agent.metrics?.total_tokens || 0,
          total_cost: agent.metrics?.total_cost || 0,
          avg_latency_ms: agent.metrics?.avg_latency_ms || 0,
          error_rate: agent.metrics?.error_rate || 0,
          loop_count: agent.metrics?.loop_count || 0,
          cache_hits: agent.metrics?.cache_hits || 0,
          loops_prevented: agent.metrics?.loops_prevented || 0,
          cost_saved: agent.metrics?.cost_saved || 0,
        },
      }));
      setAgents(transformedAgents);

      setAuditLog(
        ((Array.isArray(auditRes) ? auditRes : []) as unknown as Record<string, unknown>[]).map((log) => ({
          ...log,
          agentId: (log.agent_id as string) || (log.agentId as string) || "unknown",
          agentName: (log.agent_name as string) || (log.agentName as string) || "Unknown Agent",
          timestamp: log.timestamp ? new Date(log.timestamp as string) : new Date(),
          summary:
            (log.details as string) ||
            (log.summary as string) ||
            (log.reasoning
              ? (log.reasoning as string).length > 60
                ? (log.reasoning as string).substring(0, 60) + "..."
                : (log.reasoning as string)
              : `Agent ${log.action}`),
          interactionId: (log.interaction_id as string) || (log.interactionId as string) || (log.id as string),
        }))
      );

      setBudgetRules(rulesRes as BudgetRule[]);
      setWebhooks(webhookRes as Record<string, unknown>[]);
      setMultiCloudStatus(cloudRes as Record<string, unknown>);
      if (healingRes) {
        const healingData = healingRes as Record<string, unknown>;
        setSelfHealingEvents(
          (Array.isArray(healingData.recent_recoveries)
            ? healingData.recent_recoveries
            : []
          ).map((ev: Record<string, unknown>) => ({
            ...ev,
            timestamp: new Date(ev.timestamp as string),
          }))
        );
        if (healingData.nodes) setClusterNodes(healingData.nodes as Record<string, unknown>[]);
      }
      setLlmConfigs(
        Array.isArray(llmRes) ? (llmRes as unknown as LLMProviderConfig[]) : []
      );
      setAlertConfigs(alertsRes as unknown as AlertConfig[]);
      if (Array.isArray(vigilanceRes)) setVigilanceAlerts(vigilanceRes as Record<string, unknown>[]);

      if (isAuthenticated) {
        extendedApi.sso
          .config("default")
          .then(conf => {
            if (conf) setSsoConfig(conf as Record<string, unknown>);
          })
          .catch(() => {});
      }
    } catch (error) {
      console.error("Critical Sentinel Sync Failure:", error);
      toast.error("Failed to sync with Sentinel Backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, auditSearchQuery, auditFilterOutcome]);

  const toggleAgentStatus = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    const newStatus = agent.status === "running" ? "paused" : "running";
    try {
      if (newStatus === "running") await extendedApi.agents.start(agentId);
      else await extendedApi.agents.stop(agentId);
      refreshData();
      toast.success(
        `Agent ${agent.name} ${newStatus === "running" ? "started" : "stopped"}`
      );
    } catch {
      toast.error(
        `Failed to ${newStatus === "running" ? "start" : "stop"} agent.`
      );
    }
  };

  const handleUpdateAgent = async (updatedAgent: DashboardAgent | null) => {
    if (!updatedAgent) {
      setShowSettingsDialog(false);
      return;
    }
    try {
      const updatePayload: Partial<DashboardAgent> = {
        name: updatedAgent.name,
        budget: updatedAgent.budget,
        status: updatedAgent.status,
        environment: updatedAgent.environment,
        org_id: updatedAgent.org_id,
        persistent_memory: updatedAgent.persistent_memory,
        config: {
          ...updatedAgent.config,
          provider: updatedAgent.provider || "openai",
          model: updatedAgent.model || "gpt-4o",
        },
      };
      await extendedApi.agents.update(updatedAgent.id, updatePayload as Partial<import("../lib/api").Agent>);
      setShowSettingsDialog(false);
      refreshData();
      toast.success("Agent settings synchronized with Sentinel backend.");
    } catch {
      toast.error("Failed to update agent settings.");
    }
  };

  const handleCreateAgent = async () => {
    try {
      const result = await extendedApi.agents.create({
        name: newAgentData.name,
        type: newAgentData.type as Agent["type"],
        environment: newAgentData.environment,
        provider: newAgentData.provider,
        model: newAgentData.model,
        budget: newAgentData.budget,
        org_id: newAgentData.org_id,
        control_webhook: newAgentData.control_webhook,
        persistent_memory: newAgentData.persistent_memory,
        tier: newAgentData.tier as Agent["tier"],
        config: {
          provider: newAgentData.provider,
          model: newAgentData.model,
          max_tokens: newAgentData.maxTokens || architectureDefaults.maxTokens,
          temperature: architectureDefaults.temperature,
        },
      });

      if (result) {
        setShowNewAgentDialog(false);
        refreshData();
        toast.success("Agent deployed successfully.");
        setNewAgentData({
          name: "",
          type: "langgraph",
          environment: "production",
          provider: "openai",
          model: "gpt-4o",
          budget: 10,
          maxTokens: 100000,
          org_id: "",
          control_webhook: "",
          metadata: {},
          tier: "industrial",
          persistent_memory: true,
        });
      }
    } catch {
      toast.error("Deployment failed.");
    }
  };

  const handlePaperclipResearch = async () => {
    if (!researchTopic) return;
    setIsResearching(true);
    try {
      const data =
        await extendedApi.agents.intelligence.research(researchTopic);
      setResearchResult(data as Record<string, unknown>);
      toast.success("Paperclip research complete!");
    } catch {
      toast.error("Research failed");
    } finally {
      setIsResearching(false);
    }
  };

  const handleHermesStrategy = async () => {
    if (!strategyPrompt) return;
    setIsGeneratingStrategy(true);
    try {
      const data =
        await extendedApi.agents.intelligence.strategy(strategyPrompt);
      setStrategyResult(data as Record<string, unknown>);
      toast.success("Hermes strategy generated!");
    } catch {
      toast.error("Strategy generation failed");
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const toggleAlert = async (alertId: string) => {
    try {
      await extendedApi.governance.compliance.alerts.update(alertId, {
        is_active: !alertConfigs.find(a => a.id === alertId)?.is_active,
      });
      toast.success("Alert status updated.");
      refreshData();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(`Sync Fail: ${message}`);
    }
  };

  const handleSelfHealingToggle = async (type: string, enabled: boolean) => {
    try {
      await extendedApi.sentinel.updateHealingConfig({
        [type]: enabled,
      } as Record<string, unknown>);
      toast.success(`Self-healing ${type} updated.`);
      refreshData();
    } catch {
      toast.error("Failed to update healing configuration.");
    }
  };

  const handleTriggerPanic = async () => {
    try {
      const res = await extendedApi.panic.lock();
      if (res.success) {
        toast.error("GLOBAL SYSTEM LOCK ENGAGED", {
          description: res.message,
          duration: 10000,
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Lockdown failed";
      toast.error(`Lockdown failed: ${message}`);
    }
  };

  const handleSystemReset = async () => {
    const secret = window.prompt("Enter Administrative Reset Secret:");
    if (!secret) return;

    try {
      const res = await extendedApi.panic.reset(secret);
      if (res.success) {
        toast.success("SYSTEM RESET SUCCESSFUL", {
          description: res.message,
        });
        refreshData();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Reset failed";
      toast.error(`Reset failed: ${message}`);
    }
  };

  const handleDecommissionAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    if (
      !window.confirm(
        `PERMANENTLY DECOMMISSION NODE ${agent.name} (${agent.id})? This action cannot be undone and will purge all transient state.`
      )
    ) {
      return;
    }

    try {
      await extendedApi.agents.delete(agentId);
      toast.success(
        `Agent ${agent.name} decommissioned and purged from cluster.`
      );
      refreshData();
    } catch {
      toast.error("Failed to decommission agent. Enclave restricted.");
    }
  };

  const handleRunComplianceAudit = async (type: "hipaa" | "sox") => {
    try {
      if (type === "hipaa") {
        await extendedApi.governance.compliance.runHipaaAudit();
      } else {
        await extendedApi.governance.compliance.runSoxAudit();
      }
      toast.success(`${type.toUpperCase()} audit initiated successfully.`);
      refreshData();
    } catch {
      toast.error(`Failed to initiate ${type.toUpperCase()} audit.`);
    }
  };

  const handleInjectHint = async (agent: DashboardAgent) => {
    const hint = window.prompt(
      "Enter administrative hint/instruction for this agent:"
    );
    if (!hint) return;

    try {
      await extendedApi.agents.injectHint(agent.id, hint);
      toast.success("Governance hint injected into agent execution context.");
      refreshData();
    } catch {
      toast.error("Failed to inject hint. Security policy restriction.");
    }
  };

  const handleUpdateAssets = async (agent: DashboardAgent) => {
    try {
      await extendedApi.agents.update(agent.id, {
        metadata: {
          ...agent.metadata,
          assets_sync_initiated: new Date().toISOString(),
        },
      } as Partial<import("../lib/api").Agent>);
      toast.success("Agent assets and persistent context refresh initiated.");
      refreshData();
    } catch {
      toast.error("Asset synchronization failed. Check cluster health.");
    }
  };

  const handleConfigureStream = async (_agent: DashboardAgent) => {
    try {
      await extendedApi.sentinel.updateHealingConfig({
        auto_refine: true,
        max_retries: 5,
      });
      toast.success("Sentinel stream stability parameters configured.");
      refreshData();
    } catch {
      toast.error("Stream configuration failed. Telemetry offline.");
    }
  };

  const categories = [
    { id: "core", label: "Core", icon: "LayoutDashboard" },
    { id: "ops", label: "Operations", icon: "Server" },
    { id: "gov", label: "Governance", icon: "ShieldCheck" },
    { id: "advanced", label: "Advanced", icon: "Zap" },
    { id: "intelligence", label: "Intelligence", icon: "Brain" },
  ];

  const categoryTabs: Record<CategoryType, string[]> = {
    core: ["overview", "agents", "budget"],
    ops: ["infrastructure", "webhooks", "on-prem"],
    gov: ["audit", "alerts", "compliance", "sla", "sso"],
    advanced: [
      "forecast",
      "roi",
      "localization",
      "selfheal",
      "venture",
      "models",
    ],
    intelligence: ["paperclip", "hermes"],
  };

  return {
    user,
    isAuthenticated,
    agents,
    auditLog,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    isLoading,
    auditSearchQuery,
    setAuditSearchQuery,
    auditFilterOutcome,
    setAuditFilterOutcome,
    budgetRules,
    webhooks,
    multiCloudStatus,
    selfHealingEvents,
    clusterNodes,
    llmConfigs,
    alertConfigs,
    vigilanceAlerts,
    roiMetrics,
    healingConfigs,
    usageForecasts,
    ssoConfig,
    complianceStatus,
    liveMetrics,
    researchTopic,
    setResearchTopic,
    isResearching,
    researchResult,
    strategyPrompt,
    setStrategyPrompt,
    isGeneratingStrategy,
    strategyResult,
    showSettingsDialog,
    setShowSettingsDialog,
    selectedAgent,
    setSelectedAgent,
    showNewAgentDialog,
    setShowNewAgentDialog,
    newAgentData,
    setNewAgentData,
    refreshData,
    toggleAgentStatus,
    handleUpdateAgent,
    handleCreateAgent,
    handlePaperclipResearch,
    handleHermesStrategy,
    toggleAlert,
    handleSelfHealingToggle,
    handleTriggerPanic,
    handleSystemReset,
    handleDecommissionAgent,
    handleRunComplianceAudit,
    handleInjectHint,
    handleUpdateAssets,
    handleConfigureStream,
    categories,
    categoryTabs,
  };
}
