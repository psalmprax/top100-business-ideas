import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { extendedApi, rulesApi } from "../lib/api";
import {
  DashboardAgent,
  AuditEntry,
  BudgetRule,
  AlertConfig,
  LLMProviderConfig,
  CategoryType,
  ROIMetric,
  HealingConfig,
  UsageForecast,
} from "../components/AgentOps/types";

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
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [multiCloudStatus, setMultiCloudStatus] = useState<any>(null);
  const [selfHealingEvents, setSelfHealingEvents] = useState<any[]>([]);
  const [clusterNodes, setClusterNodes] = useState<any[]>([]);
  const [llmConfigs, setLlmConfigs] = useState<LLMProviderConfig[]>([]);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([]);
  const [vigilanceAlerts, setVigilanceAlerts] = useState<any[]>([]);
  const [roiMetrics, setRoiMetrics] = useState<ROIMetric[]>([]);
  const [healingConfigs, setHealingConfigs] = useState<HealingConfig[]>([]);
  const [usageForecasts, setUsageForecasts] = useState<UsageForecast[]>([]);
  const [ssoConfig, setSsoConfig] = useState<any>(null);
  const [complianceStatus, setComplianceStatus] = useState({
    hipaa: "PENDING",
    sox: "PENDING",
    gdpr: "PENDING",
  });

  // Real-time metrics
  const [liveMetrics, setLiveMetrics] = useState({
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
  const [researchResult, setResearchResult] = useState<any>(null);
  const [strategyPrompt, setStrategyPrompt] = useState("");
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [strategyResult, setStrategyResult] = useState<any>(null);

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
  const [newAgentData, setNewAgentData] = useState<any>({
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

      if (defaultsRes) setArchitectureDefaults(defaultsRes);

      if (complianceStatusRes) setComplianceStatus(complianceStatusRes);

      if (Array.isArray(roiRes)) setRoiMetrics(roiRes);
      if (Array.isArray(healingConfigRes)) {
        const enriched = healingConfigRes.map((c, i) =>
          i === 0
            ? {
                ...c,
                mitigations_count: healingRes?.mitigations_count || 0,
                last_mitigation_time:
                  healingRes?.recent_recoveries?.[0]?.timestamp,
              }
            : c
        );
        setHealingConfigs(enriched);
      }
      if (Array.isArray(forecastRes)) setUsageForecasts(forecastRes);

      const transformedAgents: DashboardAgent[] = (
        Array.isArray(agentsRes) ? agentsRes : []
      ).map(agent => ({
        ...agent,
        id: agent.id,
        name: agent.name,
        status: agent.status,
        daily_spend: agent.daily_spend || agent.dailySpend || 0,
        budget: agent.budget || 100,
        created_at: new Date(agent.created_at || agent.createdAt || new Date()),
        updated_at: new Date(
          agent.updated_at || agent.created_at || agent.createdAt || new Date()
        ),
        last_active_at: new Date(
          agent.last_active_at ||
            agent.lastActiveAt ||
            agent.updated_at ||
            agent.created_at ||
            new Date()
        ),
        config: {
          provider: agent.config?.provider || agent.provider || "openai",
          model: agent.config?.model || agent.model || "gpt-4o",
          max_tokens:
            agent.config?.max_tokens ||
            agent.config?.maxTokens ||
            architectureDefaults.maxTokens,
          temperature:
            agent.config?.temperature || architectureDefaults.temperature,
          rules: agent.config?.rules || [],
        },
        metrics: {
          tasks_total:
            agent.metrics?.tasks_total || agent.metrics?.tasksTotal || 0,
          tasks_complete:
            agent.metrics?.tasks_complete || agent.metrics?.tasksComplete || 0,
          tasks_failed:
            agent.metrics?.tasks_failed || agent.metrics?.tasksFailed || 0,
          uptime: agent.metrics?.uptime || 0,
          total_requests:
            agent.metrics?.total_requests || agent.metrics?.totalRequests || 0,
          total_tokens:
            agent.metrics?.total_tokens || agent.metrics?.totalTokens || 0,
          total_cost:
            agent.metrics?.total_cost || agent.metrics?.totalCost || 0,
          avg_latency_ms:
            agent.metrics?.avg_latency_ms || agent.metrics?.avgLatencyMs || 0,
          error_rate:
            agent.metrics?.error_rate || agent.metrics?.errorRate || 0,
          loop_count:
            agent.metrics?.loop_count || agent.metrics?.loopCount || 0,
          cache_hits:
            agent.metrics?.cache_hits || agent.metrics?.cacheHits || 0,
          loops_prevented:
            agent.metrics?.loops_prevented ||
            agent.metrics?.loopsPrevented ||
            0,
          cost_saved:
            agent.metrics?.cost_saved || agent.metrics?.costSaved || 0,
        },
      }));
      setAgents(transformedAgents);

      setAuditLog(
        (Array.isArray(auditRes) ? auditRes : []).map((log: any) => ({
          ...log,
          agentId: log.agent_id || log.agentId || "unknown",
          agentName: log.agent_name || log.agentName || "Unknown Agent",
          timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
          summary:
            log.details ||
            log.summary ||
            (log.reasoning
              ? log.reasoning.length > 60
                ? log.reasoning.substring(0, 60) + "..."
                : log.reasoning
              : `Agent ${log.action}`),
          interactionId: log.interaction_id || log.interactionId || log.id,
        }))
      );

      setBudgetRules(rulesRes as any);
      setWebhooks(webhookRes as any);
      setMultiCloudStatus(cloudRes);
      if (healingRes) {
        setSelfHealingEvents(
          (Array.isArray(healingRes.recent_recoveries)
            ? healingRes.recent_recoveries
            : []
          ).map((ev: any) => ({
            ...ev,
            timestamp: new Date(ev.timestamp),
          }))
        );
        if (healingRes.nodes) setClusterNodes(healingRes.nodes);
      }
      setLlmConfigs(
        Array.isArray(llmRes) ? (llmRes as unknown as LLMProviderConfig[]) : []
      );
      setAlertConfigs(alertsRes as any);
      if (Array.isArray(vigilanceRes)) setVigilanceAlerts(vigilanceRes);

      if (isAuthenticated) {
        extendedApi.sso
          .config("default")
          .then(conf => {
            if (conf) setSsoConfig(conf);
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
    } catch (error) {
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
      await extendedApi.agents.update(updatedAgent.id, updatePayload);
      setShowSettingsDialog(false);
      refreshData();
      toast.success("Agent settings synchronized with Sentinel backend.");
    } catch (error) {
      toast.error("Failed to update agent settings.");
    }
  };

  const handleCreateAgent = async () => {
    try {
      const result = await extendedApi.agents.create({
        ...newAgentData,
        config: {
          provider: newAgentData.provider,
          model: newAgentData.model,
          maxTokens: newAgentData.maxTokens || architectureDefaults.maxTokens,
          temperature: architectureDefaults.temperature,
          rules: [],
          ...newAgentData.metadata,
        },
      } as any);

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
    } catch (error) {
      toast.error("Deployment failed.");
    }
  };

  const handlePaperclipResearch = async () => {
    if (!researchTopic) return;
    setIsResearching(true);
    try {
      const data =
        await extendedApi.agents.intelligence.research(researchTopic);
      setResearchResult(data);
      toast.success("Paperclip research complete!");
    } catch (error) {
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
      setStrategyResult(data);
      toast.success("Hermes strategy generated!");
    } catch (error) {
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
    } catch (e: any) {
      toast.error(`Sync Fail: ${e.message}`);
    }
  };

  const handleSelfHealingToggle = async (type: string, enabled: boolean) => {
    try {
      await extendedApi.sentinel.updateHealingConfig({
        [type]: enabled,
      } as any);
      toast.success(`Self-healing ${type} updated.`);
      refreshData();
    } catch (error) {
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
    } catch (error: any) {
      toast.error(`Lockdown failed: ${error.message}`);
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
    } catch (error: any) {
      toast.error(`Reset failed: ${error.message}`);
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
      } as any);
      toast.success("Agent assets and persistent context refresh initiated.");
      refreshData();
    } catch (error) {
      toast.error("Asset synchronization failed. Check cluster health.");
    }
  };

  const handleConfigureStream = async (agent: DashboardAgent) => {
    try {
      await extendedApi.sentinel.updateHealingConfig({
        auto_refine: true, // Specific configuration for streaming stability
        max_retries: 5,
      });
      toast.success("Sentinel stream stability parameters configured.");
      refreshData();
    } catch (error) {
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
