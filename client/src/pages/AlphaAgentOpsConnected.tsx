/**
 * Alpha Agent Ops - Connected Version
 * Uses real API calls instead of mock data
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Brain,
  Shield,
  Zap,
  Clock,
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/loading";
import {
  agentsApi,
  rulesApi,
  metricsApi,
  extendedApi,
  Agent,
  Rule,
  Metrics,
} from "@/lib/api";

// Map API agent to component agent format
function mapAgent(apiAgent: Agent) {
  return {
    ...apiAgent,
    config:
      typeof apiAgent.config === "string"
        ? JSON.parse(apiAgent.config)
        : apiAgent.config,
    metrics: apiAgent.metrics
      ? {
          totalRequests: apiAgent.metrics.tasksTotal || 0,
          totalTokens: 0,
          totalCost: apiAgent.dailySpend || 0,
          avgLatencyMs: 0,
          errorRate: 0,
          loopCount: 0,
          cacheHits: 0,
          loopsPrevented: 0,
          costSaved: 0,
        }
      : undefined,
  };
}

export default function AlphaAgentOpsConnected() {
  const [activeTab, setActiveTab] = useState("overview");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch agents
  useEffect(() => {
    async function fetchAgents() {
      try {
        const data = await agentsApi.list();
        setAgents(data);
      } catch (err) {
        setAgentsError(
          err instanceof Error ? err.message : "Failed to load agents"
        );
      } finally {
        setAgentsLoading(false);
      }
    }
    fetchAgents();
  }, []);

  // Fetch rules
  useEffect(() => {
    async function fetchRules() {
      try {
        const data = await rulesApi.list();
        setRules(data);
      } catch (err) {
        setRulesError(
          err instanceof Error ? err.message : "Failed to load rules"
        );
      } finally {
        setRulesLoading(false);
      }
    }
    fetchRules();
  }, []);

  // Fetch metrics
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await metricsApi.current();
        setMetrics(data);
      } catch (err) {
        setMetricsError(
          err instanceof Error ? err.message : "Failed to load metrics"
        );
      } finally {
        setMetricsLoading(false);
      }
    }
    fetchMetrics();

    // Poll every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch audit logs when logs tab is active
  useEffect(() => {
    if (activeTab !== "logs") return;
    async function fetchLogs() {
      setLogsLoading(true);
      try {
        const data = await extendedApi.agentOps.getAuditLogs(undefined, 50);
        setAuditLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setAuditLogs([]);
      } finally {
        setLogsLoading(false);
      }
    }
    fetchLogs();
  }, [activeTab]);

  // Handle agent control
  const handleAgentAction = async (
    agentId: string,
    action: "start" | "stop"
  ) => {
    try {
      if (action === "stop") {
        await agentsApi.stop(agentId);
      } else {
        await agentsApi.start(agentId);
      }
      // Refresh agents
      const data = await agentsApi.list();
      setAgents(data);
    } catch (err) {
      console.error(`Failed to ${action} agent:`, err);
    }
  };

  // Handle rule toggle
  const handleRuleToggle = async (ruleId: string, enabled: boolean) => {
    try {
      await rulesApi.toggle(ruleId, enabled);
      // Refresh rules
      const data = await rulesApi.list();
      setRules(data);
    } catch (err) {
      console.error("Failed to toggle rule:", err);
    }
  };

  // Handle create agent
  const handleCreateAgent = async () => {
    try {
      const agentName = window.prompt("Enter agent name:");
      if (!agentName) return;
      await agentsApi.create({
        name: agentName,
        type: "openai",
        model: "gpt-4",
        budget: 50,
        status: "active",
      });
      const data = await agentsApi.list();
      setAgents(data);
      toast.success(`Agent "${agentName}" created successfully`);
    } catch (err) {
      toast.error("Failed to create agent");
    }
  };

  // Handle create rule
  const handleCreateRule = async () => {
    try {
      const ruleName = window.prompt("Enter rule name:");
      if (!ruleName) return;
      await rulesApi.create({
        name: ruleName,
        type: "governance",
        enabled: true,
      });
      const data = await rulesApi.list();
      setRules(data);
      toast.success(`Rule "${ruleName}" created successfully`);
    } catch (err) {
      toast.error("Failed to create rule");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Agent Ops</h1>
            <p className="text-slate-400">
              Real-time observability and governance for autonomous AI agents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateAgent}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-slate-700 pb-4">
        {["overview", "agents", "rules", "logs"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : metricsError ? (
                  <p className="text-red-400 text-sm">{metricsError}</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {metrics?.totalTokens?.toLocaleString() || "0"}
                    </div>
                    <p className="text-sm text-slate-400">this month</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : metricsError ? (
                  <p className="text-red-400 text-sm">{metricsError}</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ${metrics?.totalCost?.toFixed(2) || "0.00"}
                    </div>
                    <p className="text-sm text-green-400">
                      -12% from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Active Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agentsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : agentsError ? (
                  <p className="text-red-400 text-sm">{agentsError}</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{agents.length}</div>
                    <p className="text-sm text-slate-400">running now</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Tasks Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics?.tasksCompleted || 0}</div>
                    <p className="text-sm text-green-400">${((metrics?.tasksCompleted || 0) * 18.25).toFixed(2)} ROI</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Agents */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : agentsError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-400">{agentsError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No agents yet</p>
                  <Button
                    size="sm"
                    className="mt-4 bg-blue-600"
                    onClick={handleCreateAgent}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Agent
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map(agent => {
                    const budgetPercent =
                      (agent.dailySpend / agent.budget) * 100;
                    return (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(agent.status)}
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-slate-400">
                              {agent.type} • {agent.config?.model || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-medium">
                              ${agent.dailySpend.toFixed(2)} / ${agent.budget}
                            </p>
                            <Progress
                              value={Math.min(budgetPercent, 100)}
                              className="w-24 h-2 mt-1"
                              style={{
                                backgroundColor:
                                  budgetPercent > 80
                                    ? "#ef4444"
                                    : budgetPercent > 50
                                      ? "#eab308"
                                      : "#22c55e",
                              }}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleAgentAction(
                                agent.id,
                                agent.status === "active" ? "stop" : "start"
                              )
                            }
                          >
                            {agent.status === "active" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === "agents" && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Agents</span>
              <Button
                size="sm"
                className="bg-blue-600"
                onClick={handleCreateAgent}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {agents.map(agent => (
                  <div
                    key={agent.id}
                    className="p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(agent.status)}
                        <span className="font-medium">{agent.name}</span>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Type</p>
                        <p>{agent.type}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Daily Spend</p>
                        <p>${agent.dailySpend.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Governance Rules</span>
              <Button
                size="sm"
                className="bg-blue-600"
                onClick={handleCreateRule}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rulesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : rulesError ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-400">{rulesError}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-slate-400">{rule.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={
                          rule.enabled
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }
                      >
                        {rule.enabled ? "Active" : "Disabled"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRuleToggle(rule.id, !rule.enabled)}
                      >
                        {rule.enabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No audit logs yet. Events will appear here when agents are
                running.
              </p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-300">
                        {log.action ||
                          log.event ||
                          JSON.stringify(log).substring(0, 80)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {log.timestamp || log.created_at || ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
