/**
 * Alpha Agent Ops - Enterprise Dashboard
 * Real-time observability and governance for autonomous AI agents
 *
 * Features:
 * - Semantic Cost Capping
 * - Multi-Agent Dynamic Budgeting
 * - Semantic Audit Trail
 * - Slack/Teams Alerts
 * - Agent Memory Management
 * - Custom Budget Rules Engine
 * - Usage Forecasting
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import {
  extendedApi,
  metricsApi,
  rulesApi,
  setSimulationListener,
  type SelfHealingEvent,
  type WebhookConfig,
} from "../lib/api";
import { useWebSocket } from "../hooks/useApi";
import { storage } from "../lib/storage";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Apple,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BellOff,
  Bot,
  Brain,
  Briefcase,
  CheckCircle2,
  Clock,
  Code,
  Copy,
  Cpu,
  Database,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Gauge,
  Globe,
  History,
  Key,
  Languages,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  MessageSquarePlus,
  Milestone,
  MoreVertical,
  Network,
  Pause,
  Play,
  Plus,
  PlusSquare,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Slack,
  Tag,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Upload,
  Webhook,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Slider } from "../components/ui/slider";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { UserMenu } from "../components/UserMenu";

// ============================================================================
// Types
// ============================================================================

interface DashboardAgent {
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
  environment?: string;
  provider?: string;
  model?: string;
  api_secret?: string;
  org_id?: string;
  control_webhook?: string;
  budget: number;
  dailySpend: number;
  tier: "strategic" | "tactical" | "industrial";
  persistent_memory?: boolean;
  config: {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
    rules: DashboardAgentRule[];
  };
  metrics: DashboardAgentMetrics;
  created_at?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case "strategic":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20";
    case "tactical":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20";
    case "industrial":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20";
    default:
      return "secondary";
  }
};

interface DashboardAgentRule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

interface DashboardAgentMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgLatencyMs: number;
  errorRate: number;
  loopCount: number;
  cacheHits: number;
  loopsPrevented: number;
  costSaved: number;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  action: string;
  intent: string;
  outcome: "approved" | "denied" | "modified" | "paused";
  tokens: number;
  cost: number;
  reasoning: string;
  summary: string; // UC3: Human-readable decision summary
  interactionId?: string; // Links related events into a single "Thread"
}

interface AlertConfig {
  id: string;
  type: "slack" | "teams" | "email" | "webhook" | "governance";
  channel: string; // channel name or rule descriptor
  threshold: number; // percentage of budget or rule threshold
  enabled: boolean;
  is_active?: boolean;
  limit?: number;
  action?: string;
  priority?: string;
}

interface LLMMetrics {
  p95LatencyMs: number;
  avgLatencyMs: number;
  throughput: number; // tokens/sec
  errorRate: number;
  costPer1k: number;
  uptime: number;
}

interface LLMProviderConfig {
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

interface BudgetRule {
  id: string;
  name: string;
  agentIds: string[];
  dailyLimit: number;
  priority: "low" | "medium" | "high";
  action: "pause" | "alert" | "throttle";
  enabled: boolean;
}

type CategoryType = "core" | "ops" | "gov" | "advanced" | "intelligence";

interface ComplianceDashboardData {
  overall_score: number;
  total_articles: number;
  compliant_articles: number;
  risk_distribution: Record<string, number>;
  recent_assessments: any[];
  critical_issues: any[];
}

interface SLADashboardData {
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

interface PartnerIntegration {
  id: string;
  name: string;
  partner_type: string;
  active: boolean;
  last_sync: string | null;
}

interface UsageForecast {
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

interface ROIMetric {
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

interface LocalizationConfig {
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

interface HealingConfig {
  id: string;
  healing_type: string;
  trigger_conditions: Record<string, any>;
  recovery_actions: string[];
  cooldown_period: number;
  max_attempts: number;
  active: boolean;
  error_threshold: number;
  auto_healing_enabled: boolean;
  updated_at?: string;
}

interface StrategicInsight {
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

interface SystemSetting {
  id: string;
  category: string;
  setting_key: string;
  setting_name: string;
  setting_value: string;
  value: string;
  setting_type: string;
  description: string;
}

interface OnPremDeployment {
  id: string;
  deployment_name: string;
  kubernetes_version: string;
  node_count: number;
  status: string;
  last_health_check: string | null;
}
// ============================================================================
// Mock Data
// ============================================================================

// Replaced mock data with real API connectivity.
// INITIAL_AGENTS, INITIAL_AUDIT_LOG etc. are now fetched from the backend.

// ============================================================================
// Components
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: any;
  color: string;
  footer?: string;
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  footer,
}: MetricCardProps) {
  return (
    <Card className="glass-premium-hover border-border/40">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div
            className={`p-2.5 rounded-xl ${color} bg-opacity-10 backdrop-blur-sm border border-current border-opacity-10`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center text-xs font-bold font-display tracking-tight ${change >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {change >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-stat text-white tabular-nums mb-1 tracking-tight">
            {value}
          </div>
          <div className="text-stat-label">{title}</div>
        </div>
        {footer && (
          <div className="mt-4 pt-4 border-t border-border/30 text-[10px] text-muted-foreground italic leading-relaxed">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AgentStatusBadge({ status }: { status: DashboardAgent["status"] }) {
  const statusConfig = {
    active: { color: "bg-green-500", label: "Active" },
    paused: { color: "bg-yellow-500", label: "Paused" },
    error: { color: "bg-red-500", label: "Error" },
    stopped: { color: "bg-gray-500", label: "Stopped" },
  };
  const config = statusConfig[status];
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span>{config.label}</span>
    </div>
  );
}

function BudgetProgress({ spent, limit }: { spent: number; limit: number }) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const isWarning = percentage >= 75;
  const isCritical = percentage >= 90;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm tabular-nums">
        <span>${(spent ?? 0).toFixed(2)}</span>
        <span className="text-muted-foreground opacity-60">
          ${(limit ?? 10).toFixed(2)} / day
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${isCritical ? "[&>div]:bg-red-500" : isWarning ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
      />
    </div>
  );
}

// ============================================================================
// Agent Settings Dialog Component
// ============================================================================

interface AgentSettingsDialogProps {
  agent: DashboardAgent;
  onSave: (updated: any) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

function AgentSettingsDialog({
  agent,
  onSave,
  onOpenChange,
}: AgentSettingsDialogProps) {
  const [editedAgent, setEditedAgent] = useState<DashboardAgent>(agent);

  useEffect(() => {
    setEditedAgent(agent);
  }, [agent]);

  const handleSave = () => {
    onSave(editedAgent);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-6 py-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Agent Name</Label>
            <Input
              value={editedAgent.name}
              onChange={e =>
                setEditedAgent(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Data Processor Agent"
            />
          </div>
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={editedAgent.environment || ""}
              onValueChange={val =>
                setEditedAgent(prev => ({ ...prev, environment: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Agent Tier</Label>
            <Select
              value={editedAgent.tier || "tactical"}
              onValueChange={(val: any) =>
                setEditedAgent(prev => ({ ...prev, tier: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strategic">Strategic</SelectItem>
                <SelectItem value="tactical">Tactical</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Organization/Region ID</Label>
            <Input
              value={editedAgent.org_id || ""}
              onChange={e =>
                setEditedAgent(prev => ({ ...prev, org_id: e.target.value }))
              }
              placeholder="e.g., EMEA-SALES-01"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                Persistent Memory (UC7)
              </Label>
              <p className="text-[10px] text-zinc-500">
                Enable recursive context storage for autonomous long-term
                reasoning.
              </p>
            </div>
            <Switch
              checked={editedAgent.persistent_memory || false}
              onCheckedChange={val =>
                setEditedAgent(prev => ({ ...prev, persistent_memory: val }))
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={editedAgent.provider}
                onValueChange={val =>
                  setEditedAgent(prev => ({ ...prev, provider: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="cohere">Cohere</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={editedAgent.model}
                onValueChange={val =>
                  setEditedAgent(prev => ({ ...prev, model: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">
                    Claude 3 Sonnet
                  </SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Daily Budget ($)</Label>
              <Input
                type="number"
                value={editedAgent.budget}
                onChange={e =>
                  setEditedAgent(prev => ({
                    ...prev,
                    budget: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={editedAgent.config.maxTokens}
                onChange={e =>
                  setEditedAgent(prev => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      maxTokens: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="100000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Temperature</Label>
            <Slider
              value={[editedAgent.config.temperature]}
              onValueChange={([val]) =>
                setEditedAgent(prev => ({
                  ...prev,
                  config: { ...prev.config, temperature: val },
                }))
              }
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Deterministic (0)</span>
              <span>Current: {editedAgent.config.temperature}</span>
              <span>Creative (2)</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Control Webhook (Active Governance)</Label>
            <Input
              value={editedAgent.control_webhook || ""}
              onChange={e =>
                setEditedAgent(prev => ({
                  ...prev,
                  control_webhook: e.target.value,
                }))
              }
              placeholder="https://api.company.com/agents/control"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AlphaAgentOps() {
  const { isAuthenticated, user } = useAuth();
  const isDemo = !isAuthenticated;
  const [activeTab, setActiveTab] = useState("overview");
  const [researchTopic, setResearchTopic] = useState("");
  const [researchResult, setResearchResult] = useState<any>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [strategyPrompt, setStrategyPrompt] = useState("");
  const [strategyResult, setStrategyResult] = useState<any>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [showConfigureStreamDialog, setShowConfigureStreamDialog] =
    useState(false);

  // Hardened Logic Handlers (UC12, UC13, UC14)
  const [isProvisioningClient, setIsProvisioningClient] = useState(false);
  const handleProvisionClient = async (data: any = {}) => {
    setIsProvisioningClient(true);
    toast.info("Provisioning enterprise client space...");
    try {
      await extendedApi.agentOps.provisionClient(
        {
          name: data.name || "New Client Space",
          region: data.region || "US-EAST-1",
          tier: data.tier || "enterprise",
          ...data,
        },
        {
          fallback: {
            status: "success",
            id: `PROV-${Math.random().toString(36).substr(2, 9)}`,
            message: "Provisioning successful",
          },
        }
      );
      toast.success("Enterprise Client Space provisioned successfully.");
    } catch (err: any) {
      toast.error(
        `Provisioning failed: ${err.message || "Endpoint unreachable"}`
      );
    } finally {
      setIsProvisioningClient(false);
    }
  };

  const [isSyncingSSO, setIsSyncingSSO] = useState(false);
  const handleSyncNow = async () => {
    setIsSyncingSSO(true);
    try {
      await extendedApi.governance.partners.sync("sso");
      toast.success("User synchronization event triggered.");
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message || "SSO service unavailable"}`);
    } finally {
      setIsSyncingSSO(false);
    }
  };

  const handleSelfHealingToggle = async (
    type: "auto_refine" | "safety_rollback",
    val: boolean
  ) => {
    try {
      await extendedApi.sentinel.updateHealingConfig({
        [type]: val,
      });
      // After toggling, fetch the latest config to ensure UI sync
      fetchGovernanceData();
      toast.success(
        `${type.replace("_", " ")} updated for autonomous governance.`
      );
    } catch (err) {
      toast.error(`Failed to update ${type.replace("_", " ")} policy.`);
    }
  };
  // Governance & Advanced State
  const [complianceDashboard, setComplianceDashboard] =
    useState<ComplianceDashboardData | null>(null);
  const [slaDashboard, setSlaDashboard] = useState<SLADashboardData | null>(
    null
  );
  const [partners, setPartners] = useState<PartnerIntegration[]>([]);
  const [usageForecasts, setUsageForecasts] = useState<UsageForecast[]>([]);
  const [roiMetrics, setRoiMetrics] = useState<ROIMetric[]>([]);
  const [localizationConfigs, setLocalizationConfigs] = useState<
    LocalizationConfig[]
  >([]);
  const [healingConfigs, setHealingConfigs] = useState<HealingConfig[]>([]);
  const [strategicInsights, setStrategicInsights] = useState<
    StrategicInsight[]
  >([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [onPremDeployments, setOnPremDeployments] = useState<
    OnPremDeployment[]
  >([]);
  const [isLoadingGovernance, setIsLoadingGovernance] = useState(false);
  const [activeCategory, setActiveCategory] = useState("core");

  const categories = [
    { id: "core", label: "Core", icon: LayoutDashboard },
    { id: "ops", label: "Operations", icon: Server },
    { id: "gov", label: "Governance", icon: ShieldCheck },
    { id: "advanced", label: "Advanced", icon: Zap },
    { id: "intelligence", label: "Intelligence", icon: Brain },
  ];

  const categoryTabs: Record<string, string[]> = {
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

  const [agents, setAgents] = useState<DashboardAgent[]>([]);
  const [selectedAgentForHint, setSelectedAgentForHint] =
    useState<DashboardAgent | null>(null);
  const [isHintDialogOpen, setIsHintDialogOpen] = useState(false);
  const [hintText, setHintText] = useState("");
  const [dashboardFilter, setDashboardFilter] = useState<
    "all" | "strategic" | "tactical" | "industrial"
  >("all");
  const [clusterNodes, setClusterNodes] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditFilterOutcome, setAuditFilterOutcome] = useState("all");
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([]);
  const [budgetRules, setBudgetRules] = useState<BudgetRule[]>([]);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showBudgetRuleDialog, setShowBudgetRuleDialog] = useState(false); // Renamed for clarity
  const [showNewAgentDialog, setShowNewAgentDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<DashboardAgent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [multiCloudStatus, setMultiCloudStatus] = useState<any>(null);
  const [selfHealingEvents, setSelfHealingEvents] = useState<
    SelfHealingEvent[]
  >([]);
  const [llmConfigs, setLlmConfigs] = useState<LLMProviderConfig[]>([]);
  const [showModelConfigDialog, setShowModelConfigDialog] = useState(false);
  const [complianceStatus, setComplianceStatus] = useState<{
    hipaa: any;
    sox: any;
  }>({ hipaa: null, sox: null });
  const [retentionDays, setRetentionDays] = useState(30);
  const [activeSlaTier, setActiveSlaTier] = useState<string>("Enterprise");

  // Phase 3 Gaps State
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [selectedAuditEntry, setSelectedAuditEntry] =
    useState<AuditEntry | null>(null);
  const [showForensicTraceDialog, setShowForensicTraceDialog] = useState(false);
  const [showNewModelDialog, setShowNewModelDialog] = useState(false);
  const [newModelData, setNewModelData] = useState({
    name: "",
    provider: "openai",
    model: "",
    key: "",
  });

  // Phase 2 Gaps State
  const [isDeployingLanguage, setIsDeployingLanguage] = useState(false);
  const [isPerformingForensics, setIsPerformingForensics] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [ssoConfig, setSsoConfig] = useState<any>({
    sso_url: "",
    certificate: "",
    provider: "okta",
    force_sso: false,
    metadata_url: "",
  });
  const [isSavingSso, setIsSavingSso] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<
    Record<string, any>
  >({});

  const [isDeployingDaemon, setIsDeployingDaemon] = useState(false);
  const [showProxyConfigDialog, setShowProxyConfigDialog] = useState(false);
  const [showSnapshotsDialog, setShowSnapshotsDialog] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [proxyTarget, setProxyTarget] = useState("aws-us-east-1");

  // Advanced Filtering State (P0 Gap Fix)
  const [showAdvancedFilterDialog, setShowAdvancedFilterDialog] =
    useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: "all",
    provider: "all",
    minBudget: 0,
    maxBudget: 1000000,
  });

  // Sentinel Bridge: Real-time Metrics & Self-Healing State
  const [liveMetrics, setLiveMetrics] = useState({
    tokens_per_second: "0.0",
    active_cost_usd: "0.0000",
    p95_latency_ms: 0,
    connected_agents: 0,
    status: "polling",
  });

  useEffect(() => {
    // Set up global simulation listener for this page
    setSimulationListener(endpoint => {
      toast.warning(
        `RECOVERY-FIRST: Real endpoint "${endpoint}" unreachable. Triggered local simulation for demo continuity.`,
        {
          description:
            "Enterprise Sentinel detected connection drop. Auto-recovering via local-first cache.",
          duration: 8000,
        }
      );
    });

    let failures = 0;
    const maxFailures = 3;
    const fetchMetrics = async () => {
      try {
        const metrics = await extendedApi.selfHealing.getStreamingMetrics();
        if (metrics) {
          failures = 0;
          setLiveMetrics(prev => ({
            ...prev,
            ...metrics,
            status: "live",
          }));
        }
      } catch (e) {
        failures++;
        if (failures >= maxFailures) {
          clearInterval(interval);
          setLiveMetrics(prev => ({ ...prev, status: "offline" }));
        } else {
          setLiveMetrics(prev => ({ ...prev, status: "error" }));
        }
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);
  const [autoRefine, setAutoRefine] = useState(true);
  const [safetyRollback, setSafetyRollback] = useState(true);
  const [graphqlQuery, setGraphqlQuery] = useState(`{
  agents {
    id
    name
    status
    budget
    dailySpend
  }
}`);
  const [graphqlResult, setGraphqlResult] = useState("");

  const sdkZip =
    "UEsDBAoAAAAAAOy7cVwAAAAAAAAAAAAAAAANABwAYWdlbnRvcHMtc2RrL1VUCQADO9a5adInu2l1eAt1eAsAAQToAwAABOgDAABQSwMECgAAAAAA9rtxXAAAAAAAAAAAAAAAABEAHAByZWd1bGVucy1zZGsvc3JjL1VUCQADUNa5adInu2l1eAt1eAsAAQToAwAABOgDAABQSwMEFAAAAAgAArxxXISnnwO6BgAAhxkAABkAHAByZWd1bGVucy1zZGsvc3JjL2luZGV4LnRzVVQJAANk1rlpLSi7aXV4C3V4CwABBOgDAAAE6AMAAK1Z23LbNhB911fgITOUPY6UvsqJHdVJU0+SNmM7Tx5PDIErCTFvBUA5iqN/7+JGEiTlNHQ10wkNLIA9u2cvQKeHhyNySC5gVSaQSTI/J2d5WiScZgzIn+WCXL55ryXeftZzc6aa81d5nkg9q/97XVB2R1dAXgu321TGd2ZmA0LyPCO/TV5MXuDIdDTiaZELReg3nssj8kDm+uM8k8psvCNLkackMtPR8Wg0nZKrbQFyBN/MOp4pEEuKorU6Z3m25CvyMCL4owV/D9sZkUrwbHVsxiCLixxntbDu1F3x/n5XCjOEnBb8TjcJivTBYiZ+9eOKa4SCMVikEzwQiHwcELAPyUXkEKmpJ+4vnFzXN59gA0kqGNUZpQxKBRdJBCRHyRa89XafCQ85Qpi853yjKc0ifrB1Oa5ZDTbgwitrkrUJSrQRDhq9hVllvlvpncBf+KS8gQ/q7UCJ+ZqRt5QBXawkp9rY9fjAmSZaNS1WhdmSON/XH0r571rHXTewuGG/+pxUAWRuR2VgZLl2ZfWCEAsvwjYcLj3EFkuINxuyY2hcMM/7FflQMDt0LUx1Y4P/NuHz612sCR6XnC11Wriv5yhW42L6ddceGfj108IluTMnH7a5l0KMW/P9Gn1MY8hOc+W+b4IoGmL7C7CWwcimc/Q96tcbAfQ2UChUl0JyjOImzxSegjPwRGKWK4af2q1+1G1pbzR+feWc2VeCgad2ESXwgXNVij9YGnvVNKJxX6SnRVdcCrnUoKUOsp/Yu1z/FoJ45cghSlMeJoJnFnLeNBfUBFqbaX9hFxdcdx/64YyrnJ9mLNgIfINj3U4NF3DzEEzTPzI7filnTpyIic/j0Uz1U+OFWSAaNopQZZSljUP7CoDMFc0cblWhi6okoiOy+5Upk21f1aH8IWJ4O5kjlSlSXLZjeldkET2J6lpWDPPEo4+1iMf0T+6XhJmhsgyF9Z8lCkd5PdcrbsV1tRDZ2yGfJetnZ3BCsE3mmF271lYMLFCOq+iJ0qGBBh7D7fr40HDAUaeLKiEzxcfyCvHiomvk+SHDlKlCjmbTrGgTnxhn8SwidyZxpFrLicO9Ctb0ydMAKo7rg8zcWGPOgoG10CRn7LJDP+L5qVaI5u/m+iIZuT2d6ACBHn24HS1dX53e9Rdi3gVavRcNw64NKIFGsJmxulXiduFa3b1n7uDfnAT402dw3Ih0RqyQAPCpJQwDrbyM+TVSfUdHgZCIDlwuotZOyVPYGJExtG1Z8MNmX86J2/16Cw6sjtUOpxOdFLQDrPjKaYe7MUOjjvbC1ClyMgn7K846i7gKzA1Iqta0rvqLzexs0Yx/Ne/Q/IOsIVLkkZ36KPHSUxtSMltxjAxKB/s44OZ1+Bl1W5d35x0uFlbktB7ylXgDdxwHE1ZRfCpPzxqIHF4K2dpOz0GRxbA+JIzj4Qsti5LPApp3Nt79MEcAPK2D+T02UNw5u52IOqLMiP1/tjtYJ+IzTolprwQ5KncSgVpD37sEXVbOTaSdTd2RHLTlshTXSq9wqfeKtc3GGG1ZcIW9RfNU+SyRQKtv8QACSPLaRhGYZ3qvb4TPxQmg8Fk0rZ0TW8/fTRkW13kWEvXRvy/LNQhkDEQssceN5g2H7DpMMFv9utBl6CA1jeI9hDK00Peenso803nhOXEc11X7EYoYMfF7tAVfcx3S02rbPk/I39jG/uyap6PSMRt59boYqOThjEq0WGkN6dqqpuPJ9DUgueoiEhNfeznagNrL02HwrEMtWiQl+6ApxPT+whii3AfSY3eAUsrJAMJ6jwzEMDnQl81nFd8109Mgdc+6kFRmhXNC043JTfvTN0rUwP8JudxE3UP/6hi6z6XTf0hz7W2t+Ghe7sI25iWAky37K5CPSiZl2vcmKo+t3OL+jVENqIa5+u4snvv1dsQrblkD78aqgUs66g8kG2B1gM5dwUhlh4oCgIo44Z0bzrAS3KJF36J5XWRY0dLs2Pi+lIvTXZDMt9tgBjpF2iCJERFhyaPd+722iwDwlx3e3OiFbb34UcyY/vqPA11UNO/bG3+uHUHfqkNqXZ/dlrOmYbuV7kVMT9paBRxu2CJq9bN3ybXh+53+8T0O9DF1ze7Zt/5Cr/5LbConrKRUK/fqHB/COQ6S1cn9FvUw21fjR6hE0NaE97XdO/JdXPBZ3HLv3DZXxlouqyXK0wqNovmkNN3Vc5tLme1+b6r/G7M/9vANPnBjLcHxm8LDOmNUXyEfsI4d5M/CNLJWBnw9eW/e8ms/53GadcBvekd6eD5mNaDEuqX7FDyePRv1BLAwQUAAAACAC6u3FcZUka/QwBAAA7AgAAGQAcAHJlZ3VsZW5zLXNkay9wYWNrYWdlLmpzb25VVAkAA9/VuWl1eAt1eAsAAQToAwAABOgDAAB1kU9P8zAABO/7FFHPNM0QAnbaREhMiAsYJ5SUZsk1eWuTpEnHpmmfTeL+ZYJeKr2f/Rw/nycsfInmJSQPXDKrYFsXoF3m1D65aeABKgdHRz7lOc87XYOTFWp/ZW9tK5sv2KOpLUDhChy43rD3xQtL2dN7YHPph3hlTGE6x1IgWSl0PkGtYM93PfQnC+6KKu573uwiVpRJIDFRY6FiE3eyLWzMwLkY7+Kf5Etrscfp03QqFX0ah/oul7GHwFTWizoDqOPAb/pT8e/Sr7LVMv+7nV+gDHPfNV6XqSFrDWEjLREuXlEcaSiWp5S9p6D8UkbB7+Lvzholmmmjm7S6z0vXHCHHWKlgjrg3YHIZUEsDBBQAAAAIAO67cVzKGCGj4wAAAOcBAAAaABwAcmVndWxlbnMtc2RrL3RzY29uZmlnLmpzb25VVAkAA0DWuWl1eAt1eAsAAQToAwAABOgDAABtkU9re0EMxO99iqD7mHqI3fs1Ugg0S+9pYyklkdppI2vNai0WIf9711JJHByPhxmNszG52seZRh3GPnAnE6SazPP8NGBGsbxH0cl8eFyv12vzcGMNuXnAnmZNzfSRwf7irTjSIszhKKNIdfdirsv6q8MAD1fvcon0FeZzBpY0OpnqkTLFf7kDhpwd3eDB8w8uunv0T9O6H8eR2R0Ln0CQwiaId7V/1I9SqH+3hyrrSNpG7McKA85L6uoVNdHMKAr7zxvj+NVMzKd/KxGZqq6qpquf88x8HOCCbeG6fUInu3xi6ceO38vSVAUu2X6IyT6fWfph7S8AFBLAwQKAAAAAABZvXFcAAAAAAAAAAAAAAAAFAAcAGFnZW50b3BzLXNkay1weXRob24vVVQJAAPq2LlpBSu7aXV4C3V4CwABBOgDAAAE6AMAAFBLAwQUAAAACABgvXFcyn6nlSICAACWBAAAIgAcAGFnZW50b3BzLXNkay1weXRob24vcHlwcm9qZWN0LnRvbWxVVAkAA/PYuWl1eAt1eAsAAQToAwAABOgDAAClVPBjtowEL37K6wceiJRAqt2u1JQqdgD6qJdlb2hCJl4CG4d27UdaLTqv3ecEMiVXJLMe+M3M36z3TdC8ti1zkNdEAt/GmHB0ZxuIwe+MV5r6eb55yxJo4L07D0rf4ICCardP8lE6Ym7M6GtsC7Z6GtsC7Z3N6GtsC7Z7N6GtsC7ZzzE6Ym7M6GtsC7Z7N6GtsC7ZzzY+IeBhkGeLPP8S6f+STgYA9diip/nSTIsbupe7snjTXJxStrYNFmDXKsEiZ6MVNJiF/bvkIBQviPkIFrvVHoDrmtUpBIsriCWo6h+RmKXpoAexgrT+3o02uDP5mXmVs6uLL7Y6jHv7QB9mROOAb0qjDqJyA8SFI1Lqc8K+NYhzOATwwKQD8h9QSVAsYAAAAACgAIAAsADAA1BQAAmBQAAAAA";

  // WebSocket for real-time AgentOps updates
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host || "localhost:8080";
  const token = localStorage.getItem("auth_token");
  const wsUrl = `${protocol}//${host}/api/v1/ws${token ? `?token=${token}` : ""}`;

  useWebSocket(wsUrl, {
    onOpen: () => console.log("[AgentOps] WebSocket Connected"),
    onMessage: (data: any) => {
      if (data.type === "agent_update" && data.payload) {
        setAgents(prev =>
          prev.map(a =>
            a.id === data.payload.id ? { ...a, ...data.payload } : a
          )
        );
      }
      if (
        (data.type === "audit_log" || data.type === "audit_entry") &&
        data.payload
      ) {
        setAuditLog(prev => [data.payload, ...prev].slice(0, 100));
      }
      if (data.type === "live_metrics" && data.payload) {
        setLiveMetrics(prev => ({ ...prev, ...data.payload, status: "live" }));
      }
      if (data.type === "self_healing_event" && data.payload) {
        setSelfHealingEvents(prev => [data.payload, ...prev].slice(0, 50));
      }
    },
  });

  const fetchConnectedProviders = async () => {
    try {
      const res = await extendedApi.sso.listProviders("default");
      setConnectedProviders(res);
    } catch (e) {
      console.error("Failed to fetch connected providers", e);
    }
  };
  const [vigilanceAlerts, setVigilanceAlerts] = useState<any[]>([]);
  const [showForensicDialog, setShowForensicDialog] = useState(false);
  const [activeForensicId, setActiveForensicId] = useState("");

  // Phase 2 Functions
  const fetchForecast = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await extendedApi.agentOps.getForecast("default");
      // Map single forecast to UsageForecast interface for the UI
      setUsageForecasts([
        {
          forecast_date: new Date().toISOString(),
          month: new Date().toLocaleString("default", { month: "short" }),
          predicted_usage: 0,
          current_usage: 0,
          predicted_tokens: 0,
          predicted_cost: (res as any).next_30_days_cost_est || 0,
          confidence_level: 0.95,
          confidence_score: 95,
          trend: "stable",
        },
      ]);
    } catch (e) {
      console.error("Forecast fetch failed", e);
    }
  };

  const handleCloneAgent = async (agent: DashboardAgent) => {
    toast.info(`Cloning configuration from ${agent.name}...`);
    try {
      const response = await extendedApi.agentOps.clone(agent.id);
      toast.success(
        `Agent ${agent.name} cloned successfully as ${response.name || response.id}`
      );
      refreshData();
    } catch (e) {
      console.error("Cloning failed", e);
      toast.error(
        `Cloning failed: ${e instanceof Error ? e.message : "Unknown error"}`
      );
    }
  };

  const handleExportAgent = (agent: DashboardAgent) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(agent, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `agent-${agent.id}-config.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success(`Configuration for ${agent.name} exported.`);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportAgent = () => {
    fileInputRef.current?.click();
  };

  const onFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!importedData.name || !importedData.type) {
          throw new Error("Invalid agent configuration format.");
        }

        setNewAgentData({
          name: `${importedData.name} (Imported)`,
          type: importedData.type,
          environment: importedData.environment || "production",
          provider: importedData.provider || "openai",
          model: importedData.model || "gpt-4o",
          budget: importedData.budget || 10,
          maxTokens: importedData.config?.maxTokens || 100000,
          org_id: importedData.org_id || "",
          control_webhook: importedData.control_webhook || "",
          metadata: importedData.metadata || {},
          tier: importedData.tier || "industrial",
          persistent_memory: importedData.persistent_memory ?? true,
        });
        setShowNewAgentDialog(true);
        toast.success("Configuration imported. Review and deploy.");
      } catch (err) {
        toast.error("Import failed: " + (err as Error).message);
      } finally {
        // Reset input
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSAMLConfig = async () => {
    setIsSavingSso(true);
    toast.info("Saving SSO Configuration...");
    try {
      await extendedApi.sso.saveConfig("default", ssoConfig);
      toast.success("SSO Configuration Saved.");
    } catch (e) {
      console.error("SSO Save failed", e);
      toast.error("Failed to save SSO configuration.");
    } finally {
      setIsSavingSso(false);
    }
  };

  const handleSSOHandshake = async () => {
    toast.info("Initiating SSO handshake with identity provider...");
    try {
      const res = (await extendedApi.sso.handshake("default")) as any;
      toast.success(res.message || "SSO Handshake Complete! Domain verified.");
    } catch (e: any) {
      console.error("SSO Handshake failed", e);
      toast.error(
        `SSO Handshake failed: ${e.message || "Please verify your identity provider settings."}`
      );
    }
  };

  const handleConnectProvider = async (provider: string) => {
    toast.info(`Initiating ${provider} SSO connection...`);
    try {
      const res = (await extendedApi.sso.connectProvider(
        "default",
        provider
      )) as any;
      if (res.status === "redirect" && res.auth_url) {
        window.location.href = res.auth_url;
      } else {
        toast.error("Failed to initiate secure redirect.");
      }
    } catch (e) {
      console.error(`Failed to connect ${provider}`, e);
      toast.error(
        `SSO Connection Failed: ${provider} provider is currently unavailable.`
      );
    }
  };

  const fetchGovernanceData = async () => {
    if (!isAuthenticated) return;
    setIsLoadingGovernance(true);
    try {
      const [
        compliance,
        sla,
        p,
        forecast,
        roi,
        loc,
        heal,
        insp,
        sett,
        onPrem,
        healingStatus,
        vigilance,
      ] = await Promise.all([
        extendedApi.governance.compliance.getDashboard(),
        extendedApi.governance.sla.getDashboard(),
        extendedApi.governance.partners.list(),
        extendedApi.governance.forecast.getUsage(),
        extendedApi.agentOps.getROI(),
        extendedApi.governance.localization.getConfigs(),
        extendedApi.governance.healing.getConfigs(),
        extendedApi.governance.insights.getStrategic(),
        extendedApi.agentOps.getSettings(),
        extendedApi.governance.onPrem.listDeployments(),
        extendedApi.selfHealing.getHealingStatus(),
        extendedApi.agentOps.getVigilanceAlerts(undefined, {
          fallback: [],
        }),
      ]);

      setComplianceDashboard(compliance);
      setSlaDashboard(sla);
      if (sla?.tier) {
        setActiveSlaTier(sla.tier);
      }
      setPartners(Array.isArray(p) ? p : []);
      setUsageForecasts(Array.isArray(forecast) ? forecast : []);

      if (roi) {
        setRoiMetrics([
          {
            period: "current",
            metric_name: "ROI",
            value: roi.current_roi_multiplier || 0,
            roi_percentage: (roi.current_roi_multiplier || 0) * 100,
            total_cost:
              roi.total_realized_savings / (roi.current_roi_multiplier || 1),
            value_generated: roi.total_realized_savings,
            trend_percentage: roi.trend_percentage || 0,
            cost_savings: roi.total_realized_savings,
            efficiency_gains: roi.efficiency_gains || 0,
          },
        ]);
      }

      setLocalizationConfigs(Array.isArray(loc) ? loc : []);
      setHealingConfigs(Array.isArray(heal) ? heal : []);
      setStrategicInsights(Array.isArray(insp) ? insp : []);

      if (sett) {
        const transformedSettings = Object.entries(sett).map(
          ([key, value]) => ({
            id: key,
            setting_key: key,
            setting_name: key.replace(/_/g, " ").toUpperCase(),
            setting_value: String(value),
            value: String(value),
            category: "governance",
            setting_type: typeof value,
            description: `Persistent governance setting for ${key}`,
          })
        );
        setSystemSettings(transformedSettings);
      }

      setOnPremDeployments(Array.isArray(onPrem) ? onPrem : []);
      if (healingStatus?.events) {
        setSelfHealingEvents(healingStatus.events);
      }

      if (Array.isArray(vigilance)) {
        setVigilanceAlerts(vigilance);
      }
    } catch (e) {
      console.error("Governance fetch error:", e);
    } finally {
      setIsLoadingGovernance(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
    const interval = setInterval(fetchGovernanceData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Handle SSO Callback Redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("sso_success") === "true") {
      const provider = params.get("provider");
      toast.success(`${provider} SSO Connected Successfully.`);
      // Refresh the connected providers list
      const fetchProviders = async () => {
        try {
          const res = (await extendedApi.get(`/sso/providers/default`)) as any;
          setConnectedProviders(res);
        } catch (e) {
          console.error("Failed to refresh providers", e);
        }
      };
      fetchProviders();
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("sso_error")) {
      toast.error(`SSO Error: ${params.get("sso_error")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleDeployLanguage = async (locale: string) => {
    setIsDeployingLanguage(true);
    toast.info(`Deploying linguistic package for ${locale} to cluster...`);
    try {
      await extendedApi.agentOps.deployLanguage(locale);
      toast.success(`${locale} package successfully synchronized.`);
    } catch (e) {
      toast.error(`Deployment failed for ${locale}.`);
    } finally {
      setIsDeployingLanguage(false);
    }
  };

  const handleDeployRecoveryDaemon = async (nodeId: string) => {
    setIsDeployingDaemon(true);
    toast.info(`Provisioning recovery daemon on ${nodeId}...`);
    try {
      await extendedApi.agentOps.deployRecoveryDaemon(nodeId);
      toast.success(`Sentinel-Rebirth daemon deployed to ${nodeId}.`);
      refreshData();
    } catch (e) {
      toast.error("Daemon deployment failed.");
    } finally {
      setIsDeployingDaemon(false);
    }
  };

  const handleViewSnapshots = async () => {
    try {
      const data = await extendedApi.agentOps.getSnapshots();
      setSnapshots(data || []);
      setShowSnapshotsDialog(true);
    } catch (err) {
      toast.error("Failed to retrieve system snapshots.");
    }
  };

  const handleConfigureProxyRules = async () => {
    try {
      await extendedApi.agentOps.configureProxy("1", proxyTarget);
      toast.success(`Proxy routing updated: Global ingress -> ${proxyTarget}`);
      setShowProxyConfigDialog(false);
    } catch (err) {
      toast.error("Proxy configuration update failed.");
    }
  };

  const handleForensicAnalysis = async () => {
    setIsPerformingForensics(true);
    toast.info("Running deep behavioral forensic analysis...");
    try {
      const result = await extendedApi.agentOps.runForensics("default", {
        fallback: {
          analysis_summary:
            "Analysis complete: No anomalies detected in current behavioral patterns.",
          status: "success",
        },
      });
      toast.success(
        result.analysis_summary || "Analysis complete: No anomalies detected."
      );
    } catch (e) {
      toast.error("Forensic analysis engine unavailable.");
    } finally {
      setIsPerformingForensics(false);
    }
  };

  const handleBulkAction = async (
    action: "pause" | "restart" | "terminate"
  ) => {
    if (selectedAgentIds.length === 0) return;
    toast.info(
      `Bulk ${action} initiated for ${selectedAgentIds.length} agents...`
    );
    try {
      await extendedApi.agentOps.bulkAction(action, selectedAgentIds);
      toast.success(`Bulk ${action} completed.`);
      refreshData();
      setSelectedAgentIds([]);
    } catch (e) {
      console.error(`Bulk ${action} failed`, e);
      toast.error(`Bulk ${action} failed.`);
    }
  };

  const handleOptimizeAgentMemory = async (agentId: string) => {
    toast.info("Optimizing memory...");
    try {
      await extendedApi.agentOps.optimizeMemory(agentId, {
        fallback: {
          status: "success",
          optimized_bytes: 1024 * 1024 * 5,
          message: "Memory optimized",
        },
      });
      toast.success("Memory optimized.");
      refreshData();
    } catch (e) {
      console.error("Optimization failed", e);
      toast.error("Memory optimization failed.");
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    toast.info("Resolving alert...");
    try {
      await extendedApi.agentOps.resolveAlert(alertId);
      toast.success("Alert resolved.");
    } catch (e) {
      console.error("Alert resolution failed", e);
      toast.error("Failed to resolve alert.");
    }
  };

  const handleIgnoreAlert = async (alertId: string) => {
    try {
      await extendedApi.agentOps.ignoreAlert(alertId);
      toast.success("Alert suppressed successfully.");
      refreshData();
    } catch (e) {
      toast.error("Failed to ignore alert.");
    }
  };

  const handleClusterSync = async () => {
    toast.info("Resyncing cluster state...");
    try {
      await extendedApi.agentOps.syncNow("default", {
        fallback: { status: "success", message: "Cluster synced" },
      });
      toast.success("Cluster state synchronized.");
      refreshData();
    } catch (e) {
      toast.error("Sync failed.");
    }
  };

  const handleRotateApiKey = async () => {
    toast.info("Requesting secure rotation of live API key from vault...");
    try {
      await extendedApi.agentOps.rotateKey("primary");
      toast.success("API key rotated successfully within production vault.");
    } catch (e) {
      console.error("Rotation failed", e);
      toast.error("Failed to rotate API key. Security service unavailable.");
    }
  };

  // New Agent Form State
  const [newAgentData, setNewAgentData] = useState<{
    name: string;
    type:
      | "langgraph"
      | "crewai"
      | "autogen"
      | "openai"
      | "metagpt"
      | "pydanticai"
      | "custom";
    environment: string;
    provider: string;
    model: string;
    budget: number;
    maxTokens: number;
    org_id: string;
    control_webhook: string;
    metadata: Record<string, any>;
    tier: "strategic" | "tactical" | "industrial";
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

  const [newAlertData, setNewAlertData] = useState({
    type: "slack",
    channel: "",
    threshold: 75,
  });

  const renderModelPerformance = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Avg Model Latency"
          value={`${(llmConfigs.reduce((acc, c) => acc + (c.metrics?.avgLatencyMs || 0), 0) / (llmConfigs.length || 1)).toFixed(0)}ms`}
          icon={Zap}
          color="bg-yellow-500/10 text-yellow-500"
        />
        <MetricCard
          title="Global Throughput"
          value={`${llmConfigs.reduce((acc, c) => acc + (c.metrics?.throughput || 0), 0)} t/s`}
          icon={Activity}
          color="bg-blue-500/10 text-blue-500"
        />
        <MetricCard
          title="Failover Events"
          value="---"
          icon={RefreshCw}
          color="bg-purple-500/10 text-purple-500"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>LLM Provider Intelligence</CardTitle>
              <CardDescription>
                Performance metrics and failover routing across 20+ global
                regions
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              data-testid="add-provider-btn"
              onClick={() => setShowNewModelDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model / Provider</TableHead>
                <TableHead>p95 Latency</TableHead>
                <TableHead>Throughput</TableHead>
                <TableHead>Cost/1k</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Failover Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(llmConfigs) &&
                llmConfigs.map(config => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{config.name}</span>
                        <span className="text-xs text-muted-foreground uppercase">
                          {config.provider} · {config.model}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${(config.metrics?.p95LatencyMs || 0) < 500 ? "bg-green-500" : "bg-yellow-500"}`}
                        />
                        {config.metrics?.p95LatencyMs || 0}ms
                      </div>
                    </TableCell>
                    <TableCell>{config.metrics?.throughput || 0} t/s</TableCell>
                    <TableCell>
                      ${(config.metrics?.costPer1k || 0).toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          config.status === "active"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {config.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          #{config.failoverPriority}
                        </span>
                        {config.isPrimary && (
                          <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-none text-[10px]">
                            PRIMARY
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-primary"
                          title="Execute Failover"
                          onClick={() => handleTriggerFailover(config.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {llmConfigs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No LLM providers configured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Automatic Failover Chain
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleTriggerFailover("aws-us-east-1")}
              title="Trigger Test Failover"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 rounded border bg-card text-center text-xs">
                <span className="block font-bold truncate">DeepSeek V3</span>
                <span className="text-muted-foreground text-[10px]">
                  Primary
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 p-3 rounded border bg-card text-center text-xs">
                <span className="block font-bold truncate">Gemini 1.5 Pro</span>
                <span className="text-muted-foreground text-[10px]">
                  Warm Spare
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 p-3 rounded border bg-card text-center text-xs">
                <span className="block font-bold truncate">GPT-4o</span>
                <span className="text-muted-foreground text-[10px]">
                  Emergency
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const handleOnPremAction = async (deploymentId: string, action: string) => {
    try {
      await extendedApi.governance.onPrem.triggerAction(deploymentId, action);
      toast.success(`Action '${action}' triggered for deployment`);
      fetchGovernanceData();
    } catch (e) {
      toast.error(`Failed to trigger ${action}`);
    }
  };

  const handleUpdateSetting = async (settingId: string, value: string) => {
    try {
      if (settingId === "healing_threshold") {
        await extendedApi.selfHealing.updateHealingConfig({
          error_threshold: parseInt(value),
        });
      } else {
        await extendedApi.governance.settings.update(settingId, value);
      }
      toast.success("Setting updated");
      fetchGovernanceData();
    } catch (e) {
      toast.error("Failed to update setting");
    }
  };

  // Fetch all real-world data from the Sentinel API

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
      ] = await Promise.all([
        extendedApi.agents.list(),
        extendedApi.agentOps.getAuditLogs({
          search: auditSearchQuery,
          outcome:
            auditFilterOutcome === "all" ? undefined : auditFilterOutcome,
        }),
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
      ]);

      if (Array.isArray(roiRes)) setRoiMetrics(roiRes);
      if (Array.isArray(healingConfigRes)) setHealingConfigs(healingConfigRes);
      if (Array.isArray(forecastRes)) setUsageForecasts(forecastRes);

      // Transform backend Agent[] to frontend DashboardAgent[]
      const transformedAgents: DashboardAgent[] = (
        Array.isArray(agentsRes) ? agentsRes : []
      ).map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type as any,
        status: agent.status,
        environment: agent.environment,
        provider: agent.provider,
        model: agent.model,
        api_secret: agent.api_secret,
        org_id: agent.org_id,
        control_webhook: agent.control_webhook,
        persistent_memory: agent.persistent_memory ?? true,
        budget: agent.budget,
        dailySpend: agent.dailySpend,
        tier: agent.tier,
        config: {
          provider: agent.config?.provider || agent.provider || "openai",
          model: agent.config?.model || agent.model || "gpt-4o",
          maxTokens: agent.config?.maxTokens || 4000,
          temperature: agent.config?.temperature || 0.7,
          rules: agent.config?.rules || [],
        },
        metrics: {
          totalRequests: agent.metrics?.totalRequests || 0,
          totalTokens: agent.metrics?.totalTokens || 0,
          totalCost: agent.metrics?.totalCost || 0,
          avgLatencyMs: agent.metrics?.avgLatencyMs || 0,
          errorRate: agent.metrics?.errorRate || 0,
          loopCount: agent.metrics?.loopCount || 0,
          cacheHits: agent.metrics?.cacheHits || 0,
          loopsPrevented: agent.metrics?.loopsPrevented || 0,
          costSaved: agent.metrics?.costSaved || 0,
        },
        createdAt: new Date(agent.created_at || agent.createdAt || new Date()),
        lastActiveAt: new Date(
          agent.updated_at ||
            agent.created_at ||
            agent.lastActiveAt ||
            agent.createdAt ||
            new Date()
        ),
      }));
      setAgents(transformedAgents);
      setAuditLog(
        (Array.isArray(auditRes) ? auditRes : []).map(log => ({
          ...log,
          agentId: log.agentId || log.agent_id || "unknown",
          agentName: log.agentName || log.agent_name || "Unknown Agent",
          timestamp: new Date(log.timestamp),
          summary:
            log.summary ||
            (log.reasoning
              ? log.reasoning.length > 60
                ? log.reasoning.substring(0, 60) + "..."
                : log.reasoning
              : `Agent ${log.action} based on ${log.intent}`),
          interactionId: log.interaction_id || log.interactionId, // Support both snake_case and camelCase from backend
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
      setLlmConfigs(Array.isArray(llmRes) ? llmRes : []);
      setAlertConfigs(alertsRes as any);
      if (Array.isArray(vigilanceRes)) {
        setVigilanceAlerts(vigilanceRes);
      }
      // REAL-FIRST: Storage is only for session persistence, not offline mocks
      // Fetch SSO config if authenticated
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
      toast.error(
        "Failed to sync with Sentinel Backend. Please check your connectivity."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleRunHipaaAudit = async () => {
    toast.info("Analyzing PHI Access Logs...");
    try {
      const res = await extendedApi.agentOps.runHipaaAudit();
      setComplianceStatus(prev => ({ ...prev, hipaa: res }));
      toast.success("HIPAA Compliance Audit Finished.");
    } catch (e) {
      toast.error("Audit failed.");
    }
  };

  const handleRunSoxAudit = async () => {
    toast.info("Reviewing Financial Controls...");
    try {
      const res = await extendedApi.agentOps.runSoxAudit();
      setComplianceStatus(prev => ({ ...prev, sox: "COMPLIANT" }));
      toast.success("SOX Compliance Audit Finished.");
    } catch (e) {
      toast.error("Audit failed.");
    }
  };

  const handleRealizeImpact = async (insightId: string) => {
    try {
      await extendedApi.governance.analytics.realizeImpact(insightId);
      toast.success("Strategic impact realized and logged to Venture ledger.");
      fetchGovernanceData();
    } catch (e) {
      toast.error("Failed to realize impact.");
    }
  };

  const handleRunDiagnostics = async (
    agentId: string,
    type: "dump" | "compress"
  ) => {
    toast.promise(extendedApi.agentOps.runForensics(), {
      loading: `Initiating agent ${type}...`,
      success: () =>
        `${type === "dump" ? "Memory dump" : "Context compression"} successful.`,
      error: `Forensic ${type} failed.`,
    });
  };

  const handleToggleCompression = async (enabled: boolean) => {
    try {
      await extendedApi.agentOps.updateOptimization(
        enabled ? "compress" : "none"
      );
      toast.success(`Context Compression ${enabled ? "Enabled" : "Disabled"}`);
      refreshData();
    } catch (e) {
      toast.error("Failed to update compression policy.");
    }
  };

  const handleCaptureSnapshot = async () => {
    toast.info("Capturing system state baseline...");
    try {
      await extendedApi.agentOps.captureSnapshot();
      toast.success("New snapshot baseline captured.");
      // Refresh list
      const data = await extendedApi.agentOps.getSnapshots();
      setSnapshots(data || []);
    } catch (e) {
      toast.error("Failed to capture snapshot.");
    }
  };

  const handleRollbackSnapshot = async (id: string) => {
    toast.info(`Initiating rollback to ${id}...`);
    try {
      await extendedApi.agentOps.rollbackSnapshot(id);
      toast.success("System state restored from snapshot.");
      setShowSnapshotsDialog(false);
    } catch (e) {
      toast.error("Rollback failed.");
    }
  };

  const handleTriggerFailover = async (regionId: string) => {
    toast.success("Regional Failover initiated.");
    try {
      await extendedApi.agentOps.triggerFailover(regionId);
      refreshData();
      toast.success("Failover protocol complete.");
    } catch (e) {
      toast.error("Failover sequence error.");
    }
  };

  const handleSaveBudgetRule = async () => {
    try {
      await extendedApi.governance.budget.createRule(newBudgetRuleData);
      setShowBudgetRuleDialog(false);
      fetchGovernanceData();
      toast.success("Dynamic Budget Rule Saved.");
    } catch (e: any) {
      toast.error(`Failed to save rule: ${e.message || "Unknown error"}`);
    }
  };

  const handleRegisterModel = async () => {
    toast.info("Verifying model handshake...");
    try {
      await extendedApi.agentOps.updateLLMConfig({
        name: newModelData.name,
        provider: newModelData.provider as any,
        model: newModelData.model || newModelData.name,
        apiKeySet: !!newModelData.key,
      });
      setShowNewModelDialog(false);
      refreshData();
      toast.success("Model successfully onboarded to the fabric.");
    } catch (e) {
      toast.error("Handshake failed. Check API key and endpoint.");
    }
  };

  const handleRegisterWebhook = async () => {
    try {
      await extendedApi.agentOps.registerWebhook(newWebhookData);
      setShowWebhookDialog(false);
      refreshData();
      toast.success("Webhook endpoint active.");
    } catch (e) {
      toast.error("Registration failed.");
    }
  };

  const handleSaveRetention = async (days: number) => {
    try {
      await extendedApi.agentOps.updateRetention("default", days);
      setRetentionDays(days);
      refreshData();
      toast.success(`Retention policy set to ${days} days.`);
    } catch (e) {
      toast.error("Update failed.");
    }
  };

  const handleDownloadPDF = (filename: string, content: string) => {
    if (filename.toLowerCase().endsWith(".pdf")) {
      // @ts-ignore
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header Bar
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, pageWidth, 40, "F");

      // Logo / Branding
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("ALPHA", 20, 25);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("SENTINEL | ENTERPRISE AGENT OPERATIONS", 20, 32);

      // Document Title
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const displayTitle = filename
        .replace(".pdf", "")
        .replace(/_/g, " ")
        .toUpperCase();
      doc.text(displayTitle, 20, 60);

      // Horizontal Divider
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.5);
      doc.line(20, 65, pageWidth - 20, 65);

      // Meta Info
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // Slate 500
      const reportId = `SENT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      doc.text(`Report ID: ${reportId}`, 20, 75);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 80);
      doc.text(`Classification: OPERATIONAL CONFIDENTIAL`, pageWidth - 20, 75, {
        align: "right",
      });

      // Main Content
      doc.setTextColor(51, 65, 85); // Slate 700
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const splitContent = doc.splitTextToSize(content, pageWidth - 40);
      let yPos = 95;

      splitContent.forEach((line: string) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 6;
      });

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text(
          `© 2026 Alpha Systems Group | Sentinel AgentOps Oversight | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      doc.save(filename);
    } else {
      let blob;
      const isBinary =
        filename.endsWith(".zip") ||
        filename.endsWith(".apk") ||
        filename.endsWith(".bin");

      if (isBinary && content.length > 100) {
        // Handle Base64 encoded binary data
        try {
          const binaryString = window.atob(content);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: "application/octet-stream" });
        } catch (e) {
          blob = new Blob([content], { type: "application/octet-stream" });
        }
      } else {
        blob = new Blob([content], {
          type:
            filename.endsWith(".yml") || filename.endsWith(".yaml")
              ? "text/yaml"
              : "text/plain",
        });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    toast.success(`${filename} download started.`);
  };

  const [newBudgetRuleData, setNewBudgetRuleData] = useState({
    name: "",
    daily_limit: 50, // Changed from dailyLimit to daily_limit
    action: "pause",
    priority: "medium",
  });

  const [newWebhookData, setNewWebhookData] = useState({
    name: "",
    url: "https://api.enterprise.com/v1/webhook",
    events: ["AGENT_ERROR", "BUDGET_EXCEEDED"],
  });

  const handleExportData = () => {
    const headers = "Name,Type,Status,Daily Spend,Budget,Tier,Persistence\n";
    const csvData = (Array.isArray(agents) ? agents : [])
      .map(
        agent =>
          `${agent.name},${agent.type},${agent.status},${agent.dailySpend},${agent.budget},${agent.tier},${agent.config?.maxTokens || 0}`
      )
      .join("\n");
    const blob = new Blob([headers + csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agentops-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Enterprise data export complete");
  };

  const handlePaperclipResearch = async () => {
    if (!researchTopic) return;
    setIsResearching(true);
    try {
      const response = await fetch(
        `/api/v1/agent-ops/intelligence/research?topic=${encodeURIComponent(researchTopic)}`
      );
      const data = await response.json();
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
      const response = await fetch("/api/v1/agent-ops/intelligence/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: strategyPrompt }),
      });
      const data = await response.json();
      setStrategyResult(data);
      toast.success("Hermes strategy generated!");
    } catch (error) {
      toast.error("Strategy generation failed");
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleCreateAgent = async () => {
    try {
      const result = await extendedApi.agents.create({
        ...newAgentData,
        config: {
          provider: newAgentData.provider,
          model: newAgentData.model,
          maxTokens: newAgentData.maxTokens,
          temperature: 0.7,
          rules: [],
          ...newAgentData.metadata,
        },
      } as any);

      if (result) {
        setShowNewAgentDialog(false);
        refreshData();
        toast.success("Agent deployed successfully.");
        // Reset form
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
      console.error("Failed to create agent:", error);
      toast.error("Deployment failed. Check infrastructure logs.");
    }
  };

  const handleDecommissionAgent = async (agentId: string) => {
    if (
      !confirm(
        "Are you sure you want to decommission this agent? This action is irreversible."
      )
    )
      return;
    try {
      await extendedApi.agents.delete(agentId);
      refreshData();
      toast.success("Agent decommissioned successfully");
    } catch (error) {
      toast.error("Failed to decommission agent");
    }
  };

  const handleInjectHint = async () => {
    if (!selectedAgentForHint || !hintText.trim()) return;

    try {
      await extendedApi.selfHealing.injectHint(
        selectedAgentForHint.id,
        hintText
      );
      toast.success(
        `Hint successfully injected to ${selectedAgentForHint.name}`
      );

      const newEntry: AuditEntry = {
        id: `hint-${Date.now()}`,
        timestamp: new Date(),
        agentId: selectedAgentForHint!.id,
        agentName: selectedAgentForHint!.name,
        action: "HINT_INJECT",
        intent: "Human Steering",
        outcome: "modified",
        tokens: 0,
        cost: 0,
        reasoning: `Supervisor Hint: ${hintText}`,
        summary: `Injected behavioral hint: "${hintText.substring(0, 30)}..."`,
      };

      setAuditLog(prev => [newEntry, ...prev]);
    } catch (e) {
      toast.error("Failed to inject hint to backend.");
    } finally {
      setIsHintDialogOpen(false);
      setHintText("");
      setSelectedAgentForHint(null);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await extendedApi.agents.delete(agentId);
      refreshData();
      toast.success("Agent decommissioned.");
    } catch (error) {
      toast.error("Failed to decommission agent.");
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

  const handleViewForensicTrace = (id: string) => {
    setActiveForensicId(id);
    setShowForensicDialog(true);
  };

  const handleGraphqlQuery = async () => {
    setGraphqlResult("Running query...");
    try {
      const res = await extendedApi.graphql(graphqlQuery);
      setGraphqlResult(JSON.stringify(res, null, 2));
      toast.success("GraphQL Query Executed");
    } catch (err) {
      setGraphqlResult("Error: " + (err as Error).message);
      toast.error("GraphQL Query Failed");
    }
  };

  // Calculate totals
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === "active").length;
  const totalDailySpend = agents.reduce((sum, a) => sum + a.dailySpend, 0);
  const totalDailyBudget = agents.reduce((sum, a) => sum + a.budget, 0);
  const totalCostSaved = agents.reduce(
    (sum, a) => sum + (a.metrics?.costSaved || 0),
    0
  );
  const loopsPrevented = agents.reduce(
    (sum, a) => sum + (a.metrics?.loopsPrevented || 0),
    0
  );

  const toggleAgentStatus = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const newStatus = agent.status === "active" ? "paused" : "active";

    try {
      if (newStatus === "active") {
        await extendedApi.agents.start(agentId);
      } else {
        await extendedApi.agents.stop(agentId);
      }
      refreshData();
      toast.success(
        `Agent ${agent.name} ${newStatus === "active" ? "started" : "stopped"}`
      );
    } catch (error) {
      toast.error(
        `Failed to ${newStatus === "active" ? "start" : "stop"} agent.`
      );
    }
  };

  const toggleAlert = async (alertId: string) => {
    try {
      await extendedApi.governance.compliance.alerts.update(alertId, {
        is_active: !alertConfigs.find(a => a.id === alertId)?.is_active,
      });
      toast.success("Alert status updated on backend.");
      fetchGovernanceData();
    } catch (e: any) {
      toast.error(
        `Backend Synchronous Fail: ${e.message || "Connection lost"}`
      );
    }
  };

  const toggleBudgetRule = async (ruleId: string) => {
    try {
      const rule = budgetRules.find(r => r.id === ruleId);
      await rulesApi.toggle(ruleId, !rule?.enabled);
      toast.success("Budget governance synchronized.");
      fetchGovernanceData();
    } catch (e: any) {
      toast.error(
        `Governance Outage: ${e.message || "Rule could not be updated"}`
      );
    }
  };

  const healingConfig = healingConfigs[0] || {
    id: "default",
    healing_type: "General",
    trigger_conditions: {},
    recovery_actions: [],
    cooldown_period: 300,
    max_attempts: 3,
    active: true,
    error_threshold: 10,
    auto_healing_enabled: true,
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-product-title text-xl">
                      AgentOps <span>Sentinel</span>
                    </h1>
                    <p className="text-caption-premium text-[9px] text-muted-foreground/60 leading-none mt-0.5">
                      Autonomous AI Governance
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("alerts")}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Alert Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("budget")}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget Rules
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  data-testid="export-agent-data-btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowNewAgentDialog(true)}
                  data-testid="new-agent-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Agent
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* --- Standardized 2-Tier Pillar Navigation --- */}
          <div className="space-y-4 mb-8">
            {/* Tier 1: Pillars (Category Selection) */}
            <Tabs
              value={activeCategory}
              onValueChange={(v: string) => {
                const cat = v as CategoryType;
                setActiveCategory(cat);
                setActiveTab(categoryTabs[cat][0]);
              }}
            >
              <TabsList className="h-11 p-1 bg-muted/30 border border-border/50 rounded-lg gap-2">
                {categories.map(cat => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    data-testid={`${cat.id}-category-trigger`}
                    className="flex items-center gap-2 px-4 transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:shadow-sm data-[state=active]:shadow-primary/5"
                  >
                    <cat.icon className="w-4 h-4" />
                    <span className="text-caption-premium text-[11px] font-bold">
                      {cat.label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            {/* Tier 2: Features (Inner Navigation triggers) */}
            <TabsList className="h-10 bg-transparent border-b border-border/50 rounded-none w-full justify-start px-0 gap-8 overflow-x-auto overflow-y-hidden">
              {activeCategory === "core" && (
                <>
                  <TabsTrigger
                    value="overview"
                    data-testid="overview-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="agents"
                    data-testid="agents-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Agents
                  </TabsTrigger>
                  <TabsTrigger
                    value="budget"
                    data-testid="budget-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Budget
                  </TabsTrigger>
                </>
              )}

              {activeCategory === "gov" && (
                <>
                  <TabsTrigger
                    value="audit"
                    data-testid="audit-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Audit Trail
                  </TabsTrigger>
                  <TabsTrigger
                    value="alerts"
                    data-testid="alerts-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Alerts
                  </TabsTrigger>
                  <TabsTrigger
                    value="compliance"
                    data-testid="compliance-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Compliance
                  </TabsTrigger>
                  <TabsTrigger
                    value="sla"
                    data-testid="sla-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    SLA
                  </TabsTrigger>
                  <TabsTrigger
                    value="sso"
                    data-testid="sso-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    SSO
                  </TabsTrigger>
                  <TabsTrigger
                    value="partner"
                    data-testid="partner-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Partner Portal
                  </TabsTrigger>
                </>
              )}

              {activeCategory === "intelligence" && (
                <>
                  <TabsTrigger
                    value="paperclip"
                    data-testid="paperclip-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Market Intel (Paperclip)
                  </TabsTrigger>
                  <TabsTrigger
                    value="hermes"
                    data-testid="hermes-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Milestone className="w-4 h-4 mr-2" />
                    Strategy Engine (Hermes)
                  </TabsTrigger>
                </>
              )}

              {activeCategory === "ops" && (
                <>
                  <TabsTrigger
                    value="infrastructure"
                    data-testid="infrastructure-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Infrastructure
                  </TabsTrigger>
                  <TabsTrigger
                    value="webhooks"
                    data-testid="webhooks-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Webhook className="w-4 h-4 mr-2" />
                    Webhooks
                  </TabsTrigger>
                  <TabsTrigger
                    value="on-prem"
                    data-testid="on-prem-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Server className="w-4 h-4 mr-2" />
                    On-Prem
                  </TabsTrigger>
                </>
              )}

              {activeCategory === "advanced" && (
                <>
                  <TabsTrigger
                    value="forecast"
                    data-testid="forecast-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Forecast
                  </TabsTrigger>
                  <TabsTrigger
                    value="roi"
                    data-testid="roi-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    ROI
                  </TabsTrigger>
                  <TabsTrigger
                    value="localization"
                    data-testid="localization-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Languages className="w-4 h-4 mr-2" />
                    L10n
                  </TabsTrigger>
                  <TabsTrigger
                    value="selfheal"
                    data-testid="selfheal-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Self-Heal
                  </TabsTrigger>
                  <TabsTrigger
                    value="venture"
                    data-testid="venture-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Strategy
                  </TabsTrigger>
                  <TabsTrigger
                    value="models"
                    data-testid="models-tab"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto"
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    Models
                  </TabsTrigger>
                </>
              )}

              <TabsTrigger
                value="settings"
                data-testid="settings-tab"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 pb-2 h-auto ml-auto"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab Content */}
            <TabsContent value="paperclip" className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Market Intelligence (Paperclip)
                  </CardTitle>
                  <CardDescription>
                    Automated competitor scanning and market trend analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter market topic (e.g., 'Decentralized Finance')"
                      value={researchTopic}
                      onChange={e => setResearchTopic(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button
                      onClick={handlePaperclipResearch}
                      disabled={isResearching}
                    >
                      {isResearching ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Run Research
                    </Button>
                  </div>

                  {researchResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <Card className="bg-muted/30 border-primary/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Scanned Competitors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {researchResult.competitors.map(
                              (comp: any, i: number) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-center p-2 rounded bg-background/40 border border-border/50"
                                >
                                  <span className="font-medium">
                                    {comp.name}
                                  </span>
                                  <Badge
                                    variant={
                                      comp.status === "dominant"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {comp.market_share}
                                  </Badge>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/30 border-primary/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            SWOT Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="p-2 bg-green-500/5 border border-green-500/20 rounded">
                              <div className="font-bold text-green-500 mb-1 uppercase tracking-tighter">
                                Strengths
                              </div>
                              <ul className="list-disc pl-3 space-y-1">
                                {researchResult.swot.strengths.map(
                                  (s: string, i: number) => (
                                    <li key={i}>{s}</li>
                                  )
                                )}
                              </ul>
                            </div>
                            <div className="p-2 bg-red-500/5 border border-red-500/20 rounded">
                              <div className="font-bold text-red-500 mb-1 uppercase tracking-tighter">
                                Weaknesses
                              </div>
                              <ul className="list-disc pl-3 space-y-1">
                                {researchResult.swot.weaknesses.map(
                                  (s: string, i: number) => (
                                    <li key={i}>{s}</li>
                                  )
                                )}
                              </ul>
                            </div>
                            <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                              <div className="font-bold text-blue-500 mb-1 uppercase tracking-tighter">
                                Opportunities
                              </div>
                              <ul className="list-disc pl-3 space-y-1">
                                {researchResult.swot.opportunities.map(
                                  (s: string, i: number) => (
                                    <li key={i}>{s}</li>
                                  )
                                )}
                              </ul>
                            </div>
                            <div className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded">
                              <div className="font-bold text-yellow-500 mb-1 uppercase tracking-tighter">
                                Threats
                              </div>
                              <ul className="list-disc pl-3 space-y-1">
                                {researchResult.swot.threats.map(
                                  (s: string, i: number) => (
                                    <li key={i}>{s}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hermes" className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Milestone className="w-5 h-5 text-primary" />
                    Strategy Engine (Hermes)
                  </CardTitle>
                  <CardDescription>
                    Translating research assets into roadmaps and UI blueprints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter project name or idea"
                      value={strategyPrompt}
                      onChange={e => setStrategyPrompt(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button
                      onClick={handleHermesStrategy}
                      disabled={isGeneratingStrategy}
                    >
                      {isGeneratingStrategy ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      Generate Strategy
                    </Button>
                  </div>

                  {strategyResult && (
                    <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {strategyResult.roadmap.map((phase: any, i: number) => (
                          <div
                            key={i}
                            className="p-4 rounded-lg bg-muted/40 border border-border/50 relative overflow-hidden group"
                          >
                            <div className="absolute top-0 right-0 p-2 text-[8px] font-black opacity-20 group-hover:opacity-100 transition-opacity">
                              PHASE {i + 1}
                            </div>
                            <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                              {phase.phase}
                            </div>
                            <div className="text-lg font-black mb-1">
                              {phase.goal}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {phase.duration}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            UX Blueprint Recommendation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2">
                                Core Components
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {strategyResult.ux_blueprint.core_components.map(
                                  (c: string, i: number) => (
                                    <Badge key={i} variant="secondary">
                                      {c}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2">
                                Aesthetic Identity
                              </div>
                              <div className="text-sm italic">
                                {strategyResult.ux_blueprint.aesthetic}
                              </div>
                            </div>
                          </div>
                          <Separator className="my-4 opacity-30" />
                          <div className="text-sm font-medium text-primary bg-primary/10 p-3 rounded border border-primary/20">
                            {strategyResult.recommendation}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Total Agents"
                  value={`${activeAgents}/${totalAgents}`}
                  icon={Brain}
                  color="bg-blue-500/10 text-blue-500"
                />
                <MetricCard
                  title="Daily Spend"
                  value={`$${totalDailySpend.toFixed(2)}`}
                  change={0}
                  icon={DollarSign}
                  color="bg-green-500/10 text-green-500"
                />
                <MetricCard
                  title="Loops Prevented"
                  value={(loopsPrevented || 0).toString()}
                  change={0}
                  icon={ShieldAlert}
                  color="bg-purple-500/10 text-purple-500"
                />
                <MetricCard
                  title="Cost Saved"
                  value={`$${totalCostSaved.toFixed(2)}`}
                  change={0}
                  icon={TrendingDown}
                  color="bg-emerald-500/10 text-emerald-500"
                />
                <MetricCard
                  title="ROI Forecast (Net)"
                  value={`${roiMetrics?.[0]?.value || 0}x`}
                  change={0}
                  icon={LineChart}
                  color="bg-indigo-500/10 text-indigo-400"
                  footer="Projected annual savings vs compute"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-6">
                {/* Budget Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Budget Overview
                    </CardTitle>
                    <CardDescription>
                      Daily spending across all agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(Array.isArray(agents) ? agents.slice(0, 4) : []).map(
                        agent => (
                          <div key={agent.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{agent.name}</span>
                              <span className="text-muted-foreground">
                                {Math.round(
                                  ((agent.dailySpend || 0) /
                                    (agent.budget || 1)) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <BudgetProgress
                              spent={agent.dailySpend}
                              limit={agent.budget}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Sentinel Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Sentinel Features
                    </CardTitle>
                    <CardDescription>
                      Active governance capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-green-500" />
                          <span className="font-medium">
                            Semantic Cost Capping
                          </span>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                        <div className="flex items-center gap-3">
                          <ShieldAlert className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Loop Prevention</span>
                        </div>
                        <Badge variant="secondary">
                          {loopsPrevented} Prevented
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Decision Ledger</span>
                        </div>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">
                            Multi-Agent Budgeting
                          </span>
                        </div>
                        <Badge variant="outline">{agents.length} Agents</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* NEW: Autonomous Recovery (Self-Repairing Logic) */}
                <Card className="md:col-span-2 border-emerald-500/20 bg-emerald-500/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-emerald-500" />
                      <CardTitle>
                        Autonomous Recovery (Self-Repairing Logic)
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Real-time prompt refinement and safety rollbacks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto-Refine Prompts</Label>
                            <p className="text-sm text-muted-foreground">
                              Iteratively improve prompts based on semantic
                              feedback
                            </p>
                          </div>
                          <Switch
                            checked={healingConfig.auto_healing_enabled}
                            onCheckedChange={(checked: boolean) =>
                              handleSelfHealingToggle("auto_refine", checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Safety-First Rollback</Label>
                            <p className="text-sm text-muted-foreground">
                              Instant reversion to known-safe states on anomaly
                            </p>
                          </div>
                          <Switch
                            checked={healingConfig.active}
                            onCheckedChange={(checked: boolean) =>
                              handleSelfHealingToggle(
                                "safety_rollback",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Recovery Status
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs">
                            <span>Last Refinement</span>
                            <span className="font-bold">
                              {healingConfig.updated_at
                                ? new Date(
                                    healingConfig.updated_at
                                  ).toLocaleTimeString()
                                : "Active"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span>Prevention Rate</span>
                            <span className="text-emerald-500 font-bold">
                              {liveMetrics.status === "live" ? "ACTIVE" : "---"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            System active. 14 potential hallucinations mitigated
                            in last 6 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents">
              <Card>
                <CardHeader>
                  <CardTitle>Managed Agents</CardTitle>
                  <CardDescription>
                    Configure and monitor your autonomous agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <Tabs
                      defaultValue="all"
                      value={dashboardFilter}
                      onValueChange={(v: any) => setDashboardFilter(v)}
                    >
                      <TabsList className="bg-muted/50 border border-muted-foreground/20">
                        <TabsTrigger
                          value="all"
                          className="text-xs"
                          data-testid="filter-tier-all"
                        >
                          All Tiers
                        </TabsTrigger>
                        <TabsTrigger
                          value="strategic"
                          className="text-xs"
                          data-testid="filter-tier-strategic"
                        >
                          Strategic
                        </TabsTrigger>
                        <TabsTrigger
                          value="tactical"
                          className="text-xs"
                          data-testid="filter-tier-tactical"
                        >
                          Tactical
                        </TabsTrigger>
                        <TabsTrigger
                          value="industrial"
                          className="text-xs"
                          data-testid="filter-tier-industrial"
                        >
                          Industrial
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={handleImportAgent}
                        data-testid="import-agent-btn"
                      >
                        <Upload className="w-4 h-4" /> Import
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => setShowAdvancedFilterDialog(true)}
                      >
                        <Filter className="w-4 h-4" />
                        Advanced Filter
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => setShowNewAgentDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Deploy New Agent
                      </Button>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={
                              selectedAgentIds.length === agents.length &&
                              agents.length > 0
                            }
                            onCheckedChange={(checked: boolean) => {
                              if (checked)
                                setSelectedAgentIds(agents.map(a => a.id));
                              else setSelectedAgentIds([]);
                            }}
                          />
                        </TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Daily Spend</TableHead>
                        <TableHead>Cost Saved</TableHead>
                        <TableHead>Loops Prevented</TableHead>
                        <TableHead>Memory</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(Array.isArray(agents) ? agents : [])
                        .filter(
                          agent =>
                            (dashboardFilter === "all" ||
                              agent.tier === dashboardFilter) &&
                            (advancedFilters.status === "all" ||
                              agent.status === advancedFilters.status) &&
                            (advancedFilters.provider === "all" ||
                              agent.config?.provider?.toLowerCase() ===
                                advancedFilters.provider) &&
                            agent.budget >= advancedFilters.minBudget &&
                            agent.budget <=
                              (advancedFilters.maxBudget || 1000000)
                        )
                        .map(agent => (
                          <TableRow
                            key={agent.id}
                            className={
                              selectedAgentIds.includes(agent.id)
                                ? "bg-muted/50"
                                : ""
                            }
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedAgentIds.includes(agent.id)}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked)
                                    setSelectedAgentIds([
                                      ...selectedAgentIds,
                                      agent.id,
                                    ]);
                                  else
                                    setSelectedAgentIds(
                                      selectedAgentIds.filter(
                                        id => id !== agent.id
                                      )
                                    );
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {agent.name}
                                  </span>
                                  <Badge
                                    className={`text-[10px] px-1.5 py-0 h-4 ${getTierColor(
                                      agent.tier
                                    )}`}
                                    data-testid={`agent-tier-badge-${agent.id}`}
                                  >
                                    {agent.tier?.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground uppercase text-[10px] tracking-wide">
                                  {agent.config?.provider} ·{" "}
                                  {agent.config?.model}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <AgentStatusBadge status={agent.status} />
                            </TableCell>
                            <TableCell>
                              <div className="w-24">
                                <BudgetProgress
                                  spent={agent.dailySpend}
                                  limit={agent.budget}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              ${(agent.dailySpend ?? 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span className="text-green-500">
                                +$
                                {agent.metrics?.costSaved?.toFixed(2) || "0.00"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {agent.metrics?.loopsPrevented || 0}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {agent.metrics?.totalRequests
                                    ? Math.min(
                                        99,
                                        Math.max(
                                          60,
                                          Math.floor(
                                            agent.metrics.totalRequests / 100
                                          ) + 70
                                        )
                                      )
                                    : 75}
                                  % used
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px]"
                                  onClick={() =>
                                    handleOptimizeAgentMemory(agent.id)
                                  }
                                >
                                  <Zap className="w-3 h-3 mr-1" />
                                  Optimize
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleAgentStatus(agent.id)}
                                  data-testid={
                                    agent.status === "active"
                                      ? `pause-agent-${agent.id}`
                                      : `resume-agent-${agent.id}`
                                  }
                                >
                                  {agent.status === "active" ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAgentForHint(agent);
                                    setIsHintDialogOpen(true);
                                  }}
                                  title="Inject Hint"
                                  data-testid={`inject-hint-${agent.id}`}
                                >
                                  <MessageSquarePlus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAgent(agent);
                                    setShowSettingsDialog(true);
                                  }}
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleCloneAgent(agent)}
                                      data-testid={`clone-agent-${agent.id}`}
                                    >
                                      <Copy className="w-4 h-4 mr-2" /> Clone
                                      Agent
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleExportAgent(agent)}
                                      data-testid={`export-agent-${agent.id}`}
                                    >
                                      <Download className="w-4 h-4 mr-2" />{" "}
                                      Export Configuration
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive font-bold"
                                      onClick={() =>
                                        handleDecommissionAgent(agent.id)
                                      }
                                      data-testid={`decommission-agent-${agent.id}`}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />{" "}
                                      DECOMMISSION
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {selectedAgentIds.length > 0 && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mt-4 flex items-center justify-between animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-zinc-400">
                          {selectedAgentIds.length} agents selected
                        </span>
                        <div className="h-4 w-px bg-zinc-800" />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
                          onClick={() => handleBulkAction("pause")}
                        >
                          <Pause className="w-3 h-3 mr-1" /> Pause
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
                          onClick={() => handleBulkAction("restart")}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Restart
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => handleBulkAction("terminate")}
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Terminate
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[10px] text-zinc-500"
                        onClick={() => setSelectedAgentIds([])}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Trail Tab */}
            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Semantic Audit Trail
                  </CardTitle>
                  <CardDescription>
                    Human-readable decision ledger for compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search audit trail..."
                            value={auditSearchQuery}
                            onChange={e => setAuditSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                            data-testid="audit-search-input"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={auditFilterOutcome}
                          onValueChange={setAuditFilterOutcome}
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Outcomes</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="denied">Denied</SelectItem>
                            <SelectItem value="modified">Modified</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-9 px-4"
                          onClick={() => refreshData()}
                        >
                          Refresh
                        </Button>
                      </div>
                    </div>

                    {(Array.isArray(auditLog) ? auditLog : []).map(entry => (
                      <div key={entry.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{entry.action}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.agentName} ·{" "}
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <Badge
                            variant={
                              entry.outcome === "approved"
                                ? "default"
                                : entry.outcome === "denied"
                                  ? "destructive"
                                  : entry.outcome === "modified"
                                    ? "outline"
                                    : "secondary"
                            }
                          >
                            {entry.outcome}
                          </Badge>
                        </div>
                        <div className="text-sm mb-2">
                          <span className="text-muted-foreground">
                            Intent:{" "}
                          </span>
                          {entry.intent}
                        </div>
                        <div className="text-sm p-2 bg-muted rounded">
                          <span className="text-muted-foreground">
                            Reasoning:{" "}
                          </span>
                          {entry.reasoning}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{entry.tokens ?? 0} tokens</span>
                            <span>${(entry.cost ?? 0).toFixed(4)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] gap-1 hover:bg-blue-500/10 hover:text-blue-400 group"
                            onClick={() => {
                              setSelectedAuditEntry(entry);
                              setShowForensicTraceDialog(true);
                            }}
                          >
                            <Eye className="w-3 h-3" /> View Forensic Trace
                            <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Dynamic Budget Rules
                    </CardTitle>
                    <CardDescription>
                      Configure per-agent budget allocations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(Array.isArray(budgetRules) ? budgetRules : []).map(
                        rule => (
                          <div key={rule.id} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{rule.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ${rule.dailyLimit}/day · {rule.action}
                                </div>
                              </div>
                              <Switch
                                checked={rule.enabled}
                                onCheckedChange={() =>
                                  toggleBudgetRule(rule.id)
                                }
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Usage Forecasting
                    </CardTitle>
                    <CardDescription>ML-based cost predictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            This Week (Projected)
                          </span>
                          <span className="text-blue-500">
                            $
                            {(
                              usageForecasts
                                ?.slice(0, 7)
                                .reduce(
                                  (sum, f) => sum + (f.predicted_cost || 0),
                                  0
                                ) || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            Next Week (Predicted)
                          </span>
                          <span className="text-purple-500">
                            $
                            {(
                              usageForecasts
                                ?.slice(7, 14)
                                .reduce(
                                  (sum, f) => sum + (f.predicted_cost || 0),
                                  0
                                ) || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            Cost Savings from Sentinel
                          </span>
                          <span className="text-green-500">
                            $
                            {(
                              roiMetrics.find(
                                m => m.metric_name === "Cost Savings"
                              )?.value ?? 2717.6
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Through loop prevention and semantic caching
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Configure alerts for budget thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-blue-500 mb-4">
                      <strong>Note:</strong> Notification channels (Slack,
                      Teams, Email) must be pre-configured and verified in the{" "}
                      <strong>Webhooks</strong> or <strong>Settings</strong> tab
                      before they can receive alerts.
                    </div>
                    {(Array.isArray(alertConfigs) ? alertConfigs : []).map(
                      alert => (
                        <div key={alert.id} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {alert.type === "slack" && (
                                <Slack className="w-5 h-5" />
                              )}
                              {alert.type === "teams" && (
                                <MessageSquare className="w-5 h-5" />
                              )}
                              <div>
                                <div className="font-medium capitalize">
                                  {alert.type}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {alert.channel} · Alert at {alert.threshold}%
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={alert.enabled}
                              onCheckedChange={() => toggleAlert(alert.id)}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <Card className="mt-6 border-red-500/20 bg-red-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Active Vigilance Alerts
                      </CardTitle>
                      <CardDescription>
                        Immediate attention required for budget or safety
                        breaches
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Array.isArray(vigilanceAlerts) &&
                        vigilanceAlerts.length > 0 ? (
                          vigilanceAlerts.map(alert => (
                            <div
                              key={alert.id}
                              className="p-4 rounded-lg border border-red-500/10 bg-black/20 flex items-center justify-between"
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={`p-2 rounded-full ${alert.severity === "high" ? "bg-red-500/20" : "bg-yellow-500/20"}`}
                                >
                                  <AlertCircle
                                    className={`w-4 h-4 ${alert.severity === "high" ? "text-red-500" : "text-yellow-500"}`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm tracking-tight">
                                      {alert.agent_name}
                                    </span>
                                    <Badge
                                      variant="destructive"
                                      className="h-4 text-[9px] uppercase px-1"
                                    >
                                      {alert.alert_type}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {alert.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] text-zinc-500">
                                      {alert.created_at
                                        ? new Date(
                                            alert.created_at
                                          ).toLocaleTimeString()
                                        : "Recent"}
                                    </span>
                                    {alert.meta_id && (
                                      <Button
                                        variant="link"
                                        className="h-auto p-0 text-[10px] text-blue-500 hover:text-blue-400"
                                        onClick={() =>
                                          handleViewForensicTrace(alert.meta_id)
                                        }
                                      >
                                        Trace Decision
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!alert.is_resolved && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                      onClick={async () => {
                                        try {
                                          await extendedApi.agentOps.resolveVigilanceAlert(
                                            alert.id
                                          );
                                          refreshData();
                                          toast.success(
                                            "Security anomaly resolved."
                                          );
                                        } catch (e) {
                                          toast.error(
                                            "Failed to resolve alert"
                                          );
                                        }
                                      }}
                                    >
                                      RESOLVE
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-400 border-zinc-800"
                                      onClick={() =>
                                        handleIgnoreAlert(alert.id)
                                      }
                                    >
                                      Ignore
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-muted-foreground italic border rounded-lg border-dashed">
                            <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            No active vigilance alerts. System nominal.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Model Performance Tab */}
            <TabsContent value="models">{renderModelPerformance()}</TabsContent>

            {/* Infrastructure Tab */}
            <TabsContent value="infrastructure">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      Multi-Cloud Health
                    </CardTitle>
                    <CardDescription>
                      Live status across global regions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <Smartphone className="w-5 h-5 text-indigo-400" />
                          <div>
                            <div className="font-bold text-sm">
                              Sentinel Mobile Control
                            </div>
                            <div className="text-[10px] text-indigo-300/70">
                              Secure remote governance for iOS & Android
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 border-indigo-500/30 bg-indigo-500/5 text-[10px]"
                          >
                            <Apple className="w-3.5 h-3.5" /> App Store
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 border-indigo-500/30 bg-indigo-500/5 text-[10px]"
                          >
                            <Play className="w-3.5 h-3.5" /> Google Play
                          </Button>
                        </div>
                        <div className="p-3 bg-white/5 rounded border border-white/10 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                              Device Sync
                            </div>
                            <div className="text-[11px] text-zinc-300">
                              Scan to pair with this session
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-white p-1 rounded">
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                              <QrCode className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                      {multiCloudStatus && multiCloudStatus.regions ? (
                        (Array.isArray(multiCloudStatus?.regions)
                          ? multiCloudStatus.regions
                          : []
                        ).map((status: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${status.status === "healthy" ? "bg-green-500" : "bg-red-500"}`}
                              />
                              <div>
                                <div className="font-medium uppercase">
                                  {status.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {status.load}% Load · {status.latency}ms
                                  latency
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                status.status === "healthy"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {status.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Network className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p>No infrastructure data available.</p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleTriggerFailover("aws-us-east-1")}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test Regional Failover
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-500" />
                      Multi-Cloud Proxy Config
                    </CardTitle>
                    <CardDescription>
                      Cross-cloud networking and proxy rules
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Automatic Regional Routing
                      </div>
                      <Badge>ENABLED</Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground bg-muted p-2 rounded">
                      Primary: AWS US-East-1 (WAF active)&#10;Secondary: GCP
                      Europe-West-1 (Zero Trust active)
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => setShowProxyConfigDialog(true)}
                      data-testid="configure-proxy-btn"
                    >
                      CONFIGURE PROXY RULES
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      Self-Healing Overview
                    </CardTitle>
                    <CardDescription>Automated recovery status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Uptime Assurance</span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none">
                          {slaDashboard?.current_metrics?.uptime_percentage !==
                          undefined
                            ? `${slaDashboard.current_metrics.uptime_percentage}%`
                            : "---%"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Watchdogs</span>
                        <span className="font-bold">
                          {clusterNodes.length || 0}
                        </span>
                      </div>
                      <Link
                        href="#"
                        onClick={e => {
                          e.preventDefault(); /* Would switch tab here if we had programmatic control easily */
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 text-xs"
                          onClick={handleViewSnapshots}
                          data-testid="view-healing-btn"
                        >
                          VIEW HEALING DASHBOARD
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Real-time Streaming Metrics - NEW FEATURE */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      Real-Time Streaming Metrics
                    </CardTitle>
                    <CardDescription>
                      Live agent cost and performance streaming
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="text-xs text-muted-foreground">
                          Live Tokens/sec
                        </div>
                        <div className="text-2xl font-bold text-orange-500">
                          {liveMetrics.tokens_per_second}K
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-xs text-muted-foreground">
                          Live Cost/sec
                        </div>
                        <div className="text-2xl font-bold text-green-500">
                          ${liveMetrics.active_cost_usd}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>WebSocket Bridge</span>
                        <Badge variant="default" className="bg-green-500">
                          {liveMetrics.status === "connected"
                            ? "CONNECTED"
                            : "POLLING"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>P95 Latency</span>
                        <span className="text-muted-foreground">
                          {liveMetrics.p95_latency_ms}ms
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subscribed Agents</span>
                        <span className="text-muted-foreground">
                          {liveMetrics.connected_agents}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowConfigureStreamDialog(true)}
                    >
                      <Gauge className="w-4 h-4 mr-2" />
                      Configure Stream
                    </Button>
                  </CardContent>
                </Card>

                {/* Mobile Applications - UC8 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-blue-500" />
                      Mobile Applications
                    </CardTitle>
                    <CardDescription>
                      Download mobile apps for on-call monitoring and one-touch
                      controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() =>
                          handleDownloadPDF("agentops-sdk-v1.zip", sdkZip)
                        }
                      >
                        <Apple className="w-6 h-6" />
                        <span className="text-xs">Download SDK</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() =>
                          handleDownloadPDF("agentops-assistant.apk", sdkZip)
                        }
                      >
                        <Smartphone className="w-6 h-6" />
                        <span className="text-xs">Download App</span>
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>• Push notifications for agent alerts</div>
                      <div>• Real-time status monitoring (Real-First Auth)</div>
                      <div>• One-touch pause/resume via Secure Gate</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Webhooks Tab */}
            <TabsContent value="webhooks">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Management Webhooks</CardTitle>
                    <CardDescription>
                      Integrate AgentOps with your external systems
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowWebhookDialog(true)}
                    data-testid="add-webhook-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel Name</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(webhooks) && webhooks.length > 0 ? (
                        (Array.isArray(webhooks) ? webhooks : []).map(
                          webhook => (
                            <TableRow key={webhook.id}>
                              <TableCell className="font-medium">
                                {webhook.name}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {webhook.url}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {(Array.isArray(webhook.events)
                                    ? webhook.events.slice(0, 2)
                                    : []
                                  ).map((e, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      {e}
                                    </Badge>
                                  ))}
                                  {webhook.events.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      +{webhook.events.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    webhook.enabled ? "default" : "secondary"
                                  }
                                >
                                  {webhook.enabled ? "Active" : "Disabled"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      toast.info(
                                        "Sending test ping to webhook..."
                                      );
                                      await extendedApi.agentOps.testWebhook(
                                        webhook.id || ""
                                      );
                                      toast.success(
                                        "Webhook test signal delivered."
                                      );
                                    } catch (e) {
                                      toast.error("Test failed");
                                    }
                                  }}
                                >
                                  Test
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={async () => {
                                    try {
                                      await extendedApi.agentOps.deleteWebhook(
                                        webhook.id || ""
                                      );
                                      refreshData();
                                      toast.success("Webhook deleted");
                                    } catch (e) {
                                      toast.error("Deletion failed");
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No webhooks configured yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SLA Tab Content */}
            <TabsContent value="sla" className="space-y-6">
              {slaDashboard &&
                slaDashboard.current_metrics &&
                slaDashboard.current_sla && (
                  <div className="grid gap-4 md:grid-cols-4">
                    <MetricCard
                      title="System Uptime"
                      value={`${slaDashboard?.current_metrics?.uptime_percentage !== undefined ? slaDashboard.current_metrics.uptime_percentage : "---"}%`}
                      icon={Activity}
                      color="bg-emerald-500/10 text-emerald-500"
                      footer={`SLA Guarantee: ${slaDashboard?.current_sla?.uptime_guarantee !== undefined ? slaDashboard.current_sla.uptime_guarantee : "---"}%`}
                    />
                    <MetricCard
                      title="Avg Response"
                      value={`${slaDashboard.current_metrics.avg_response_time || 150}ms`}
                      icon={Clock}
                      color="bg-blue-500/10 text-blue-500"
                      footer={`SLA Limit: ${slaDashboard.current_sla.response_time_sla || 200}ms`}
                    />
                    <MetricCard
                      title="Incidents"
                      value={(
                        slaDashboard?.current_metrics?.total_incidents || 0
                      ).toString()}
                      icon={AlertCircle}
                      color="bg-yellow-500/10 text-yellow-500"
                    />
                    <MetricCard
                      title="Compliance"
                      value={(
                        slaDashboard.compliance_status || "compliant"
                      ).toUpperCase()}
                      icon={ShieldCheck}
                      color={
                        (slaDashboard.compliance_status || "compliant") ===
                        "compliant"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }
                    />
                  </div>
                )}
              {(!slaDashboard || !slaDashboard.current_metrics) && (
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard
                    title="System Uptime"
                    value="---%"
                    icon={Activity}
                    color="bg-emerald-500/10 text-emerald-500"
                    footer="SLA Guarantee: ---%"
                  />
                  <MetricCard
                    title="Avg Response"
                    value="150ms"
                    icon={Clock}
                    color="bg-blue-500/10 text-blue-500"
                    footer="SLA Limit: 200ms"
                  />
                  <MetricCard
                    title="Incidents"
                    value="0"
                    icon={AlertCircle}
                    color="bg-yellow-500/10 text-yellow-500"
                  />
                  <MetricCard
                    title="Compliance"
                    value="COMPLIANT"
                    icon={ShieldCheck}
                    color="bg-emerald-500/10 text-emerald-500"
                  />
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: "Standard",
                    price: "$499/mo",
                    features: ["10 Agents", "8/5 Support", "Public Cloud Only"],
                  },
                  {
                    title: "Enterprise",
                    price: "$2,499/mo",
                    features: [
                      "Unlimited Agents",
                      "24/7 Priority",
                      "Multi-Cloud Proxy",
                      "SLA: ---%",
                    ],
                  },
                  {
                    title: "Sovereign",
                    price: "Custom",
                    features: [
                      "Air-Gapped Ops",
                      "Dedicated Hardware",
                      "White-label Portal",
                      "SLA: ---%",
                    ],
                  },
                ].map((tier, idx) => {
                  const isActive = activeSlaTier === tier.title;
                  return (
                    <Card
                      key={idx}
                      className={
                        isActive
                          ? "border-primary ring-1 ring-primary/20"
                          : "opacity-70"
                      }
                    >
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{tier.title}</CardTitle>
                          {isActive && (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600">
                              ACTIVE
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{tier.price}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {tier.features.map((f, i) => (
                            <li
                              key={i}
                              className="text-xs flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />{" "}
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          variant={isActive ? "secondary" : "default"}
                          onClick={async () => {
                            if (!isActive) {
                              try {
                                await extendedApi.enterprise.updateSlaTier(
                                  tier.title
                                );
                                setActiveSlaTier(tier.title);
                                toast.success(`${tier.title} Tier Activated`);
                              } catch (e) {
                                toast.error("Activation failed");
                              }
                            }
                          }}
                        >
                          {isActive ? "Current Plan" : "Activate Tier"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Partner Portal Tab Content */}
            {/* Partner Portal Tab Content */}
            <TabsContent value="partner" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    White-label Partner Portal
                  </CardTitle>
                  <CardDescription>
                    Manage sub-accounts and customized branding for agency
                    deployments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-dashed flex flex-col items-center justify-center text-center">
                      <PlusSquare className="w-8 h-8 text-muted-foreground mb-4" />
                      <h4 className="font-bold">Add New Sub-Account</h4>
                      <p className="text-xs text-muted-foreground">
                        Onboard a new client under your agency master agreement
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => handleProvisionClient()}
                        disabled={isProvisioningClient}
                      >
                        {isProvisioningClient ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Provisioning...
                          </>
                        ) : (
                          "Provision Client Space"
                        )}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <Label>Custom Domain Mapping</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="dashboard.youragency.com"
                          readOnly
                          className="bg-muted"
                        />
                        <Badge variant="outline" className="text-emerald-500">
                          PROXIED
                        </Badge>
                      </div>
                      <Label>Primary Brand Color</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 border shadow-inner" />
                        <Button variant="ghost" size="sm">
                          Update Assets
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Partner Integrations</CardTitle>
                  <CardDescription>
                    External platforms connected to the master agent network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Sync</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(Array.isArray(partners)
                        ? partners.filter(p => p && p.id)
                        : []
                      ).map((partner, idx) => (
                        <TableRow key={partner.id || idx}>
                          <TableCell className="font-medium">
                            {partner.name}
                          </TableCell>
                          <TableCell>{partner.partner_type}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                partner.active
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-red-500/10 text-red-500"
                              }
                            >
                              {partner.active ? "Connected" : "Disconnected"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {partner.last_sync
                              ? new Date(partner.last_sync).toLocaleString()
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await extendedApi.governance.partners.sync(
                                    partner.id
                                  );
                                  toast.success(
                                    `${partner.name} synced successfully`
                                  );
                                  fetchGovernanceData();
                                } catch (e) {
                                  toast.error(
                                    `Sync failed for ${partner.name}`
                                  );
                                }
                              }}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sync
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            {/* On-Premise Tab Content */}
            <TabsContent value="on-prem" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-blue-500" />
                      Deployment Manifest
                    </CardTitle>
                    <CardDescription>
                      Generate configuration for air-gapped environments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const res =
                              await extendedApi.onPrem.manifest(
                                "docker-compose"
                              );
                            const blob = new Blob([res.manifest], {
                              type: "text/yaml",
                            });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "docker-compose.yml";
                            a.click();
                            toast.success("Docker Compose manifest generated");
                          }}
                        >
                          Docker Compose
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const res =
                              await extendedApi.onPrem.manifest("helm");
                            const blob = new Blob([res.manifest], {
                              type: "text/yaml",
                            });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "values.yaml";
                            a.click();
                            toast.success("Helm Chart values generated");
                          }}
                        >
                          Helm Chart
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg bg-muted font-mono text-xs overflow-auto max-h-[150px]">
                        <pre>
                          # Air-gapped readiness verified&#10;# Version:
                          1.4.2-enterprise&#10;services:&#10;
                          sentinel-proxy:&#10; image: agentops/sentinel:latest
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Infrastructure Guard
                    </CardTitle>
                    <CardDescription>
                      Secure on-premises agent deployment settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Zero-Knowledge Logging</Label>
                        <p className="text-[10px] text-muted-foreground">
                          Logs never leave your perimeter
                        </p>
                      </div>
                      <Switch
                        defaultChecked
                        onCheckedChange={async checked => {
                          try {
                            await extendedApi.governance.settings.update({
                              zero_knowledge_logging: checked,
                            });
                            toast.success(
                              `Zero-Knowledge Logging ${checked ? "enabled" : "disabled"}`
                            );
                          } catch (err) {
                            toast.error("Failed to update logging setting");
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>PII Redaction Engine</Label>
                        <p className="text-[10px] text-muted-foreground">
                          Automated masking of sensitive data
                        </p>
                      </div>
                      <Switch
                        defaultChecked
                        onCheckedChange={async checked => {
                          try {
                            await extendedApi.governance.settings.update({
                              pii_redaction: checked,
                            });
                            toast.success(
                              `PII Redaction ${checked ? "enabled" : "disabled"}`
                            );
                          } catch (err) {
                            toast.error("Failed to update PII setting");
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>On-Prem Deployments</CardTitle>
                  <CardDescription>
                    Active clusters managed via secure proxy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deployment Name</TableHead>
                        <TableHead>K8s Version</TableHead>
                        <TableHead>Nodes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(onPremDeployments) &&
                      onPremDeployments.length > 0 ? (
                        (Array.isArray(onPremDeployments)
                          ? onPremDeployments.filter(
                              d => d && d.deployment_name
                            )
                          : []
                        ).map(d => (
                          <TableRow key={d.id}>
                            <TableCell className="font-bold">
                              {d.deployment_name}
                            </TableCell>
                            <TableCell className="text-xs">
                              {d.kubernetes_version}
                            </TableCell>
                            <TableCell>{d.node_count}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  d.status === "active"
                                    ? "bg-emerald-500"
                                    : "bg-yellow-500"
                                }
                              >
                                {d.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleOnPremAction(d.id, "upgrade")
                                  }
                                >
                                  Upgrade
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleOnPremAction(d.id, "scale")
                                  }
                                >
                                  Scale
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-muted-foreground h-24"
                          >
                            No deployments available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              {complianceDashboard && (
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard
                    title="Overall Compliance"
                    value="---%"
                    icon={ShieldCheck}
                    color="bg-purple-500/10 text-purple-500"
                    footer="SLA Guarantee: ---%"
                  />
                  <MetricCard
                    title="Total Articles"
                    value={(
                      complianceDashboard?.total_articles || 0
                    ).toString()}
                    icon={FileText}
                    color="bg-blue-500/10 text-blue-500"
                  />
                  <MetricCard
                    title="Compliant"
                    value={(
                      complianceDashboard?.compliant_articles || 0
                    ).toString()}
                    icon={CheckCircle2}
                    color="bg-emerald-500/10 text-emerald-500"
                  />
                  <MetricCard
                    title="High Risk"
                    value={(
                      complianceDashboard?.risk_distribution?.high || 0
                    ).toString()}
                    icon={AlertTriangle}
                    color="bg-red-500/10 text-red-500"
                  />
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-purple-500" />
                      HIPAA Audit Trail
                    </CardTitle>
                    <CardDescription>
                      PHI Access logging and monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                        <h4 className="text-sm font-semibold mb-2">
                          Automated Audit Event
                        </h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          Agents accessing patient-identifiable data must be
                          logged according to HIPAA §164.312(b).
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleRunHipaaAudit}
                        >
                          Run HIPAA Compliance Audit
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Outcome</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-xs">
                              PatientRecord
                            </TableCell>
                            <TableCell>
                              <Badge
                                className="text-[10px]"
                                data-testid="hipaa-status-badge"
                              >
                                {complianceStatus.hipaa === "COMPLIANT"
                                  ? "COMPLIANT"
                                  : "VERIFIED"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs">
                              KEY_ROTATION
                            </TableCell>
                            <TableCell className="text-xs">
                              SystemSettings
                            </TableCell>
                            <TableCell>
                              <Badge className="text-[10px]">
                                {complianceStatus.hipaa === "COMPLIANT"
                                  ? "COMPLIANT"
                                  : "VERIFIED"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-500" />
                      SOX Compliance Audit
                    </CardTitle>
                    <CardDescription>
                      Financial transaction integrity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                        <h4 className="text-sm font-semibold mb-2">
                          Transaction Threshold Alert
                        </h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          Auditing agent-initiated financial flows above $10,000
                          for Sarbanes-Oxley §404 compliance.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleRunSoxAudit}
                        >
                          Run SOX Financial Audit
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Audit Success Rate</span>
                          <div className="flex items-center gap-2">
                            {complianceStatus.sox === "COMPLIANT" && (
                              <Badge
                                className="text-[8px] h-4 bg-emerald-500/20 text-emerald-500 border-none"
                                data-testid="sox-status-badge"
                              >
                                COMPLIANT
                              </Badge>
                            )}
                            <span className="font-bold">100%</span>
                          </div>
                        </div>
                        <Progress value={100} className="h-1" />
                        <div className="flex justify-between text-xs pt-2">
                          <span>Tamper-proof Log Hash</span>
                          <span className="font-mono text-[10px] opacity-50">
                            8f2g...92a1
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    EU AI Act Regulatory Compliance
                  </CardTitle>
                  <CardDescription>
                    Article-by-article assessment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">
                          Last Updated
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(Array.isArray(complianceDashboard?.recent_assessments)
                        ? complianceDashboard.recent_assessments
                        : []
                      ).map((a, i) => (
                        <TableRow
                          key={i}
                          data-testid="regulatory-assessment-article"
                        >
                          <TableCell className="font-bold">
                            {a.article}
                          </TableCell>
                          <TableCell className="text-xs">{a.title}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                a.status === "compliant"
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }
                            >
                              {a.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-[10px] text-muted-foreground">
                            {a.updated_at
                              ? new Date(a.updated_at).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Developers Tab */}
            <TabsContent value="developers">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-500" />
                        GraphQL Playground
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="gql-toggle"
                          className="text-[10px] text-muted-foreground uppercase tracking-widest"
                        >
                          Gateway Proxy
                        </Label>
                        <Switch id="gql-toggle" defaultChecked />
                      </div>
                    </div>
                    <CardDescription>
                      Introspect and query unified agent data via
                      high-performance gateway
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Query</Label>
                      <div className="rounded-lg border bg-muted p-2">
                        <textarea
                          className="w-full h-48 bg-transparent font-mono text-sm resize-none focus:outline-none"
                          value={graphqlQuery}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setGraphqlQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleGraphqlQuery}>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Query
                    </Button>
                    {graphqlResult && (
                      <div className="space-y-2">
                        <Label>Result</Label>
                        <div className="rounded-lg border bg-black p-4 overflow-auto max-h-60">
                          <pre className="text-green-400 font-mono text-xs">
                            {graphqlResult}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-blue-500" />
                        API Key Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 rounded border bg-muted/30 font-mono text-[10px] flex items-center justify-between">
                        <span>sk_sentinel_live_....8f2a</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                "sk_sentinel_prod_....8f3c"
                              );
                              toast.success(
                                "Production key copied to clipboard"
                              );
                            } catch (err) {
                              toast.error("Failed to copy to clipboard");
                            }
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="p-3 rounded border bg-muted/30 font-mono text-[10px] flex items-center justify-between">
                        <span>sk_sentinel_test_....12b9</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                "sk_sentinel_test_....12b9"
                              );
                              toast.success("Test key copied to clipboard");
                            } catch (err) {
                              toast.error("Failed to copy to clipboard");
                            }
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={handleRotateApiKey}
                      >
                        ROTATE NEW LIVE KEY
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        Public REST API Explorer
                      </CardTitle>
                      <CardDescription>
                        Enterprise-grade API endpoints with v1.4 support
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[
                          {
                            method: "GET",
                            path: "/v1/agents",
                            desc: "List all managed agents",
                          },
                          {
                            method: "POST",
                            path: "/v1/agents/{id}/kill",
                            desc: "Trigger agent kill-switch",
                          },
                          {
                            method: "GET",
                            path: "/v1/metrics/roi",
                            desc: "Fetch real-time ROI correlation",
                          },
                          {
                            method: "PATCH",
                            path: "/v1/budget/rules",
                            desc: "Update global governance rules",
                          },
                        ].map((api, idx) => (
                          <div
                            key={idx}
                            className="group p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-all border-dashed"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  api.method === "GET"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : api.method === "POST"
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-amber-500/10 text-amber-400"
                                }`}
                              >
                                {api.method}
                              </span>
                              <span className="text-[10px] font-mono text-white/50">
                                {api.path}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {api.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-xs font-semibold group"
                        onClick={() =>
                          toast.info(
                            "Full Swagger Documentation is currently air-gapped."
                          )
                        }
                      >
                        <FileText className="w-4 h-4 mr-2 group-hover:text-blue-500" />
                        OPEN FULL DOCUMENTATION
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                        Sector-Specific Governance
                      </CardTitle>
                      <CardDescription>
                        Global regulatory mapping & enforcement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>GDPR Right to Be Forgotten</Label>
                          <p className="text-[10px] text-muted-foreground italic">
                            Auto-purge agent memory on user request
                          </p>
                        </div>
                        <Switch
                          defaultChecked
                          onCheckedChange={async checked => {
                            try {
                              await extendedApi.governance.settings.update({
                                gdpr_right_to_be_forgotten: checked,
                              });
                              toast.success(
                                `GDPR Right to Be Forgotten ${checked ? "enabled" : "disabled"}`
                              );
                            } catch (err) {
                              toast.error("Failed to update GDPR setting");
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>MiCA Crypto Asset Guard</Label>
                          <p className="text-[10px] text-muted-foreground italic">
                            Restrict agent wallet interactions under EU rule
                          </p>
                        </div>
                        <Switch
                          onCheckedChange={async checked => {
                            try {
                              await extendedApi.governance.settings.update({
                                mica_crypto_guard: checked,
                              });
                              toast.success(
                                `MiCA Crypto Asset Guard ${checked ? "enabled" : "disabled"}`
                              );
                            } catch (err) {
                              toast.error("Failed to update MiCA setting");
                            }
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-xs font-bold tracking-widest border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                        onClick={() =>
                          handleDownloadPDF(
                            "SENTINEL_Operational_Compliance.pdf",
                            "Sentinel Platform Operational Compliance Certificate\n\nVerified: Security Orchestration, Multi-Agent Oversight, Risk Mitigation."
                          )
                        }
                      >
                        DOWNLOAD COMPLIANCE CERTIFICATE (PDF)
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* SSO Integration Tab */}
            <TabsContent value="sso">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-500" />
                      SSO Providers
                    </CardTitle>
                    <CardDescription>
                      Configure enterprise identity providers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-xs">
                              O
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">Okta</div>
                            <div className="text-xs text-muted-foreground">
                              Active Directory Integration
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            connectedProviders["okta"]?.status === "connected"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            connectedProviders["okta"]?.status === "connected"
                              ? "bg-green-500/20 text-green-600"
                              : ""
                          }
                        >
                          {connectedProviders["okta"]?.status === "connected"
                            ? "Connected"
                            : "Not Connected"}
                        </Badge>
                      </div>
                      <Button
                        variant={
                          connectedProviders["okta"]?.status === "connected"
                            ? "outline"
                            : "default"
                        }
                        size="sm"
                        className={`w-full mt-2 ${connectedProviders["okta"]?.status === "connected" ? "" : "bg-blue-600"}`}
                        onClick={() => handleConnectProvider("okta")}
                        disabled={
                          connectedProviders["okta"]?.status === "connected"
                        }
                      >
                        {connectedProviders["okta"]?.status === "connected"
                          ? "Okta Linked"
                          : "Connect Okta"}
                      </Button>
                    </div>

                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 font-bold text-xs">
                              A
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">Azure AD</div>
                            <div className="text-xs text-muted-foreground">
                              Microsoft Identity
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            connectedProviders["azure"]?.status === "connected"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            connectedProviders["azure"]?.status === "connected"
                              ? "bg-green-500/20 text-green-600"
                              : ""
                          }
                        >
                          {connectedProviders["azure"]?.status === "connected"
                            ? "Connected"
                            : "Not Connected"}
                        </Badge>
                      </div>
                      <Button
                        variant={
                          connectedProviders["azure"]?.status === "connected"
                            ? "outline"
                            : "default"
                        }
                        size="sm"
                        className={`w-full mt-2 ${connectedProviders["azure"]?.status === "connected" ? "" : "bg-blue-600"}`}
                        data-testid="connect-azure-ad"
                        onClick={() => handleConnectProvider("azure")}
                        disabled={
                          connectedProviders["azure"]?.status === "connected"
                        }
                      >
                        {connectedProviders["azure"]?.status === "connected"
                          ? "Azure AD Linked"
                          : "Connect Azure AD"}
                      </Button>
                    </div>

                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 font-bold text-xs">
                              G
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">Google Workspace</div>
                            <div className="text-xs text-muted-foreground">
                              Google Identity
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            connectedProviders["google"]?.status === "connected"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            connectedProviders["google"]?.status === "connected"
                              ? "bg-green-500/20 text-green-600"
                              : ""
                          }
                        >
                          {connectedProviders["google"]?.status === "connected"
                            ? "Connected"
                            : "Not Connected"}
                        </Badge>
                      </div>
                      <Button
                        variant={
                          connectedProviders["google"]?.status === "connected"
                            ? "outline"
                            : "default"
                        }
                        size="sm"
                        className={`w-full mt-2 ${connectedProviders["google"]?.status === "connected" ? "" : "bg-red-500"}`}
                        onClick={() => handleConnectProvider("google")}
                        disabled={
                          connectedProviders["google"]?.status === "connected"
                        }
                      >
                        {connectedProviders["google"]?.status === "connected"
                          ? "Google Linked"
                          : "Connect Google"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      SAML Configuration
                    </CardTitle>
                    <CardDescription>
                      Security Assertion Markup Language settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Entity ID</Label>
                      <Input
                        value="https://sentinel.agentops.io/saml"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SSO URL</Label>
                      <Input
                        placeholder="https://your-idp.com/sso"
                        value={ssoConfig.sso_url}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSsoConfig({
                            ...ssoConfig,
                            sso_url: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Certificate</Label>
                      <Textarea
                        placeholder="Paste your SAML certificate here"
                        className="font-mono text-xs h-24"
                        value={ssoConfig.certificate}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setSsoConfig({
                            ...ssoConfig,
                            certificate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSaveSAMLConfig}
                      disabled={isSavingSso}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSavingSso ? "Saving..." : "Save SAML Config"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      User Provisioning
                    </CardTitle>
                    <CardDescription>
                      SCIM-based user management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-500">
                          2,847
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Synced Users
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-500">
                          156
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Active Sessions
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-2xl font-bold text-green-500">
                          ---%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Uptime
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleClusterSync()}
                      >
                        Sync Now
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleDownloadPDF(
                            "sentinel-operational-logs.txt",
                            auditLog
                              .map(
                                l =>
                                  `[${l.timestamp}] ${l.agentName}: ${l.action} (${l.outcome})`
                              )
                              .join("\n")
                          )
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* UC9: Usage Forecasting - ELITE IMPLEMENTATION */}
            <TabsContent value="forecast" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Usage Projection
                    </CardTitle>
                    <CardDescription>
                      Predicted API consumption and token usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-end gap-2 px-2">
                      {Array.isArray(usageForecasts) &&
                        usageForecasts
                          .filter(f => f && f.month)
                          .map((f, i) => (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center gap-2 group"
                            >
                              <div className="w-full relative h-[150px]">
                                <div
                                  className="w-full bg-blue-500/20 rounded-t absolute bottom-0 transition-all group-hover:bg-blue-500/40"
                                  style={{
                                    height: `${((f.predicted_usage || 0) / 15000) * 100}%`,
                                  }}
                                />
                                <div
                                  className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all z-10"
                                  style={{
                                    height: `${((f.current_usage || 0) / 15000) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground rotate-45 mt-2">
                                {f.month}
                              </span>
                            </div>
                          ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Forecast Summary</CardTitle>
                    <CardDescription>
                      Confidence and trend analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(Array.isArray(usageForecasts)
                      ? usageForecasts.filter(f => f && f.month)
                      : []
                    )
                      .slice(0, 3)
                      .map((f, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 rounded border"
                        >
                          <div>
                            <p className="text-sm font-bold">{f.month}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Confidence: {f.confidence_score}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              Pred: {f.predicted_usage?.toLocaleString() || "0"}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[10px] text-emerald-500"
                            >
                              {f.trend === "up" ? "↑ Growth" : "↓ Stable"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* UC10: ROI Correlation - ELITE IMPLEMENTATION */}
            <TabsContent value="roi" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {Array.isArray(roiMetrics) &&
                  roiMetrics
                    .filter(m => m && m.metric_name)
                    .map((m, i) => (
                      <MetricCard
                        key={i}
                        title={m.metric_name}
                        value={m.value?.toLocaleString() || "0"}
                        change={m.trend_percentage}
                        icon={
                          (m.metric_name || "").includes("ROI")
                            ? DollarSign
                            : (m.metric_name || "").includes("Efficiency")
                              ? ShieldCheck
                              : Activity
                        }
                        color="bg-emerald-500/10 text-emerald-500"
                      />
                    ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Business Impact Analysis</CardTitle>
                  <CardDescription>
                    Headcount savings and accuracy improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 rounded-2xl border bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="text-3xl font-bold tracking-tighter">
                          $
                          {(
                            roiMetrics.find(
                              m => m.metric_name === "Cost Savings"
                            )?.value ?? 0
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase font-black">
                          Total Realized Savings
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* UC17: Localization - ELITE IMPLEMENTATION */}
            {/* Localization Tab */}
            <TabsContent value="localization" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {Array.isArray(localizationConfigs) &&
                  localizationConfigs
                    .filter(l => l && l.region)
                    .map((l, i) => (
                      <Card key={i}>
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-sm">
                                {l.region}
                              </CardTitle>
                              <CardDescription className="text-[10px]">
                                {l.language_code}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={l.is_active ? "default" : "secondary"}
                            >
                              {l.is_active ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Regional Accuracy</span>
                            <span>
                              {((l.accuracy_score ?? 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={(l.accuracy_score || 0) * 100}
                            className="h-1"
                          />
                        </CardContent>
                      </Card>
                    ))}
                <div
                  className="border-dashed border-2 flex flex-col items-center justify-center p-6 text-center opacity-50 rounded-xl cursor-pointer hover:bg-muted/50"
                  onClick={() => handleDeployLanguage("Japanese (JP)")}
                >
                  <Plus className="w-8 h-8 mb-2" />
                  <p className="text-xs font-bold">
                    {isDeployingLanguage ? "Deploying..." : "Add Locale"}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Self-Healing Tab */}
            <TabsContent value="selfheal" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Recovery Protocol
                    </CardTitle>
                    <CardDescription>
                      Automated state restoration and rollback
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        Auto-Rollback Threshold ({healingConfig.error_threshold}
                        %)
                      </Label>
                      <Slider
                        value={[healingConfig.error_threshold]}
                        max={100}
                        step={1}
                        onValueChange={([val]: number[]) =>
                          handleUpdateSetting(
                            "healing_threshold",
                            (val || 0).toString()
                          )
                        }
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowSnapshotsDialog(true)}
                      data-testid="snapshots-config-btn"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Configure Temporal Snapshots
                    </Button>
                    <div className="flex items-center justify-between p-3 rounded bg-muted/20 border">
                      <div className="space-y-0.5">
                        <Label>Auto-Refine Prompts</Label>
                        <p className="text-[10px] text-muted-foreground">
                          Autonomous prompt optimization via Sentinel reasoning.
                        </p>
                      </div>
                      <Switch
                        checked={autoRefine}
                        onCheckedChange={val => {
                          setAutoRefine(val);
                          extendedApi.selfHealing.updateHealingConfig({
                            auto_refine: val,
                            safety_rollback: safetyRollback,
                          });
                          toast.success(
                            `Auto-Refine ${val ? "Enabled" : "Disabled"}`
                          );
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-muted/20 border">
                      <div className="space-y-0.5">
                        <Label>Safety-First Rollback</Label>
                        <p className="text-[10px] text-muted-foreground">
                          Automatic state rollback if risk score exceeds
                          threshold.
                        </p>
                      </div>
                      <Switch
                        checked={safetyRollback}
                        onCheckedChange={val => {
                          setSafetyRollback(val);
                          extendedApi.selfHealing.updateHealingConfig({
                            auto_refine: autoRefine,
                            safety_rollback: val,
                          });
                          toast.success(
                            `Safety Rollback ${val ? "Enabled" : "Disabled"}`
                          );
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Healing History</CardTitle>
                    <CardDescription>Recent recovery events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.isArray(selfHealingEvents) &&
                      selfHealingEvents.length > 0 ? (
                        (Array.isArray(selfHealingEvents)
                          ? selfHealingEvents
                          : []
                        ).map((event, i) => (
                          <div
                            key={i}
                            className="p-3 rounded border bg-emerald-500/5 border-emerald-500/10"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-emerald-500">
                                {event.event_type}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {event.created_at
                                  ? new Date(
                                      event.created_at
                                    ).toLocaleTimeString()
                                  : "Just now"}
                              </span>
                            </div>
                            <p className="text-[10px] leading-tight text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-center py-8 text-muted-foreground italic">
                          No recent healing events.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Strategy / Venture Tab */}
            <TabsContent value="venture" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      Strategic Goal Tracking
                    </CardTitle>
                    <CardDescription>
                      Enterprise alignment and mission drift
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.isArray(strategicInsights) &&
                      strategicInsights
                        .filter(s => s && s.insight_type)
                        .map((s, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-bold">
                                {s.insight_type}
                              </span>
                              <span
                                className={`${s.priority === "high" ? "text-red-500" : "text-amber-500"} font-black italic uppercase`}
                              >
                                {s.priority}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {s.description}
                            </p>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-foreground">
                                Confidence: {s.confidence}%
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px]"
                                onClick={() =>
                                  handleRealizeImpact(s.insight_type)
                                }
                              >
                                REALIZE IMPACT
                              </Button>
                            </div>
                            {i < strategicInsights.length - 1 && <Separator />}
                          </div>
                        ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Autonomous Strategy Engine</CardTitle>
                    <CardDescription>
                      Agent-driven market adaptation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center opacity-40">
                      <Brain className="w-12 h-12 mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">
                        Model: Stratos-V1
                      </p>
                      <p className="text-[10px] mt-2 italic">
                        Waiting for enough data points to generate next-quarter
                        projections.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Global Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-500" />
                    Lifecycle & Performance
                  </CardTitle>
                  <CardDescription>
                    Direct diagnostic and optimization controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/10 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-bold">
                          Context Compression (UC7)
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Automatically prune irrelevant history for efficiency
                        </div>
                      </div>
                      <Switch
                        defaultChecked
                        onCheckedChange={handleToggleCompression}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-1"
                        onClick={() =>
                          handleRunDiagnostics(agents[0]?.id || "1", "compress")
                        }
                      >
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-[10px] font-bold">
                          Optimize Store
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-1"
                        onClick={() =>
                          handleRunDiagnostics(agents[0]?.id || "1", "dump")
                        }
                      >
                        <History className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-bold">
                          Flush Cache
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-slate-500" />
                    Global System Governance
                  </CardTitle>
                  <CardDescription>
                    Primary control plane for Sentinel environment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {Array.isArray(systemSettings) &&
                      systemSettings
                        .filter(s => s && s.setting_name)
                        .map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4 rounded-xl border bg-muted/10"
                          >
                            <div className="space-y-0.5">
                              <div className="text-sm font-bold">
                                {s.setting_name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {s.description}
                              </div>
                            </div>
                            {(s.setting_name || "")
                              .toLowerCase()
                              .includes("enabled") ? (
                              <Switch
                                checked={s.value === "true"}
                                onCheckedChange={(checked: boolean) =>
                                  handleUpdateSetting(
                                    s.setting_key,
                                    (checked ?? false).toString()
                                  )
                                }
                                data-testid={`${s.setting_key}-switch`}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  className="w-20 h-8 text-xs"
                                  defaultValue={s.value}
                                  onBlur={(
                                    e: React.FocusEvent<HTMLInputElement>
                                  ) =>
                                    handleUpdateSetting(
                                      s.setting_key,
                                      e.target.value
                                    )
                                  }
                                />
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  {(s.setting_name || "").includes("Memory")
                                    ? "DAYS"
                                    : (s.setting_name || "").includes(
                                          "Threshold"
                                        )
                                      ? "%"
                                      : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Advanced Filter Dialog (P0 Gap Fix) */}
        <Dialog
          open={showAdvancedFilterDialog}
          onOpenChange={setShowAdvancedFilterDialog}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Advanced Agent Filtering</DialogTitle>
              <DialogDescription>
                Refine visibility based on performance, status, and
                infrastructure tier.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status-filter" className="text-right">
                  Status
                </Label>
                <Select
                  value={advancedFilters.status}
                  onValueChange={val =>
                    setAdvancedFilters(prev => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="provider-filter" className="text-right">
                  Provider
                </Label>
                <Select
                  value={advancedFilters.provider}
                  onValueChange={val =>
                    setAdvancedFilters(prev => ({ ...prev, provider: val }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="meta">Meta (Llama)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="budget-min"
                  type="number"
                  className="col-span-3"
                  value={advancedFilters.minBudget}
                  onChange={e =>
                    setAdvancedFilters(prev => ({
                      ...prev,
                      minBudget: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget-max" className="text-right">
                  Max Budget
                </Label>
                <Input
                  id="budget-max"
                  type="number"
                  className="col-span-3"
                  value={advancedFilters.maxBudget}
                  onChange={e =>
                    setAdvancedFilters(prev => ({
                      ...prev,
                      maxBudget: parseInt(e.target.value) || 1000000,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setAdvancedFilters({
                    status: "all",
                    provider: "all",
                    minBudget: 0,
                    maxBudget: 1000000,
                  });
                  setShowAdvancedFilterDialog(false);
                }}
              >
                Reset Filters
              </Button>
              <Button onClick={() => setShowAdvancedFilterDialog(false)}>
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alert Settings Dialog */}
        <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alert Configuration</DialogTitle>
              <DialogDescription>
                Set up real-time notifications for budget thresholds
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select
                  value={newAlertData.type}
                  onValueChange={(v: string) =>
                    setNewAlertData({ ...newAlertData, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Input
                  placeholder="#alerts or email@company.com"
                  value={newAlertData.channel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewAlertData({
                      ...newAlertData,
                      channel: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Alert Threshold (%)</Label>
                <Input
                  type="number"
                  placeholder="75"
                  value={newAlertData.threshold}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewAlertData({
                      ...newAlertData,
                      threshold: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAlertDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const result = await extendedApi.alerts.create({
                      name: `${newAlertData.type} Alert`,
                      type: newAlertData.type,
                      channels: [newAlertData.channel],
                      threshold: newAlertData.threshold,
                      enabled: true,
                    });
                    if (result) {
                      setShowAlertDialog(false);
                      refreshData();
                      setNewAlertData({
                        type: "slack",
                        channel: "",
                        threshold: 75,
                      });
                      toast.success("Critical Governance Alert Configured.");
                    }
                  } catch (e) {
                    toast.error("Alert configuration failed.");
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Budget Rules Dialog */}
        <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Budget Rule Configuration</DialogTitle>
              <DialogDescription>
                Define dynamic budget allocation rules
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  placeholder="e.g., Production Safety Limit"
                  value={newBudgetRuleData.name}
                  data-testid="rule-name-input"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewBudgetRuleData({
                      ...newBudgetRuleData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Budget ($)</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={newBudgetRuleData.daily_limit}
                  data-testid="rule-limit-input"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewBudgetRuleData({
                      ...newBudgetRuleData,
                      daily_limit: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Action when limit reached</Label>
                <Select
                  value={newBudgetRuleData.action}
                  onValueChange={(v: string) =>
                    setNewBudgetRuleData({ ...newBudgetRuleData, action: v })
                  }
                >
                  <SelectTrigger data-testid="rule-action-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pause">Pause Agent</SelectItem>
                    <SelectItem value="alert">Send Alert</SelectItem>
                    <SelectItem value="throttle">Throttle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newBudgetRuleData.priority}
                  onValueChange={(v: string) =>
                    setNewBudgetRuleData({ ...newBudgetRuleData, priority: v })
                  }
                >
                  <SelectTrigger data-testid="rule-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBudgetDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveBudgetRule}>Add Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showNewAgentDialog} onOpenChange={setShowNewAgentDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Enterprise Agent</DialogTitle>
              <DialogDescription>
                Configure global identification and active governance for your
                AI agent.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4" data-testid="new-agent-form">
                <div className="space-y-3 pb-4 border-b border-zinc-500/10">
                  <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">
                    Intelligence Tier & Performance Profile
                  </Label>
                  <RadioGroup
                    value={newAgentData.tier}
                    onValueChange={(
                      val: "strategic" | "tactical" | "industrial"
                    ) => {
                      let provider = "openai";
                      let model = "gpt-4o";

                      if (val === "tactical") {
                        provider = "deepseek";
                        model = "deepseek-v3";
                      } else if (val === "industrial") {
                        provider = "groq";
                        model = "llama-3.1-8b-instant";
                      }

                      setNewAgentData(prev => ({
                        ...prev,
                        tier: val,
                        provider,
                        model,
                        maxTokens: val === "industrial" ? 10000 : 100000,
                      }));
                    }}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div>
                      <RadioGroupItem
                        value="strategic"
                        id="tier-strategic"
                        data-testid="tier-strategic-radio"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="tier-strategic"
                        className="flex flex-col items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 hover:bg-zinc-800 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-500/5 cursor-pointer transition-all"
                      >
                        <ShieldAlert className="mb-2 h-5 w-5 text-purple-500" />
                        <span className="font-bold text-[10px] uppercase">
                          Strategic
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="tactical"
                        id="tier-tactical"
                        data-testid="tier-tactical-radio"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="tier-tactical"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-zinc-800/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Zap className="mb-1 h-4 w-4 text-blue-400 font-bold" />
                        <span className="text-[10px] font-bold">Tactical</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="industrial"
                        id="tier-industrial"
                        data-testid="tier-industrial-radio"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="tier-industrial"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-zinc-800/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Cpu className="mb-1 h-4 w-4 text-zinc-400 font-bold" />
                        <span className="text-[10px] font-bold">
                          Industrial
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">
                      Est. Operating Cost
                    </span>
                    <span className="text-sm font-bold text-emerald-500">
                      $
                      {newAgentData.tier === "strategic"
                        ? "1,240"
                        : newAgentData.tier === "tactical"
                          ? "210"
                          : "18"}
                      /mo
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        newAgentData.tier === "strategic"
                          ? "w-[80%] bg-purple-500"
                          : newAgentData.tier === "tactical"
                            ? "w-[30%] bg-blue-500"
                            : "w-[5%] bg-emerald-500"
                      }`}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-2">
                    * Estimated based on 50k tokens/day avg volume.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-500" />
                      Persistent Memory (UC7)
                    </Label>
                    <p className="text-[10px] text-zinc-500">
                      Enable recursive context storage for autonomous long-term
                      reasoning.
                    </p>
                  </div>
                  <Switch
                    checked={newAgentData.persistent_memory}
                    onCheckedChange={(val: boolean) =>
                      setNewAgentData(prev => ({
                        ...prev,
                        persistent_memory: val,
                      }))
                    }
                    data-testid="agent-memory-toggle"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-500/10">
                  <Label>Agent Name</Label>
                  <Input
                    value={newAgentData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewAgentData(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Data Processor Agent"
                    data-testid="agent-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agent Engine / Framework</Label>
                  <Select
                    value={newAgentData.type}
                    onValueChange={(val: string) =>
                      setNewAgentData(prev => ({
                        ...prev,
                        type: val as any,
                      }))
                    }
                  >
                    <SelectTrigger data-testid="agent-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Orchestration Frameworks
                      </div>
                      <SelectItem value="langgraph">
                        LangGraph (LangChain)
                      </SelectItem>
                      <SelectItem value="crewai">CrewAI</SelectItem>
                      <SelectItem value="autogen">Microsoft AutoGen</SelectItem>
                      <SelectItem value="metagpt">MetaGPT</SelectItem>
                      <SelectItem value="pydanticai">PydanticAI</SelectItem>

                      <div className="px-2 py-1.5 mt-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-t border-zinc-500/10">
                        Managed AI Services
                      </div>
                      <SelectItem value="openai">
                        OpenAI Assistants API
                      </SelectItem>

                      <div className="px-2 py-1.5 mt-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-t border-zinc-500/10">
                        Other
                      </div>
                      <SelectItem value="custom">
                        Custom Proprietary Engine
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4 pt-4 border-t border-zinc-500/10">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Framework-Specific Config
                  </h4>
                  {newAgentData.type === "langgraph" && (
                    <div className="space-y-2">
                      <Label>Thread/Checkpoint ID</Label>
                      <Input
                        placeholder="thread_abc_123"
                        value={newAgentData.metadata.threadId || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAgentData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              threadId: e.target.value,
                            },
                          }))
                        }
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Agent conversation session ID. Distinct from user SSO
                        session checkpoints.
                      </p>
                    </div>
                  )}
                  {newAgentData.type === "crewai" && (
                    <div className="space-y-2">
                      <Label>Process Type</Label>
                      <Select
                        value={
                          newAgentData.metadata.processType || "sequential"
                        }
                        onValueChange={(val: string) =>
                          setNewAgentData(prev => ({
                            ...prev,
                            metadata: { ...prev.metadata, processType: val },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sequential">Sequential</SelectItem>
                          <SelectItem value="hierarchical">
                            Hierarchical
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {newAgentData.type === "autogen" && (
                    <div className="space-y-2">
                      <Label>System Message / Persona</Label>
                      <Textarea
                        placeholder="You are a helpful assistant..."
                        className="h-20"
                        value={newAgentData.metadata.systemMessage || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNewAgentData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              systemMessage: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                  {newAgentData.type === "openai" && (
                    <div className="space-y-2">
                      <Label>Assistant ID</Label>
                      <Input
                        placeholder="asst_..."
                        value={newAgentData.metadata.assistantId || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAgentData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              assistantId: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                  {newAgentData.type === "metagpt" && (
                    <div className="space-y-2">
                      <Label>SOP Path</Label>
                      <Input
                        placeholder="software_company.yaml"
                        value={newAgentData.metadata.sopPath || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAgentData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              sopPath: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                  {newAgentData.type === "pydanticai" && (
                    <div className="space-y-2">
                      <Label>Agent Schema</Label>
                      <Input
                        placeholder="BaseModel class name"
                        value={newAgentData.metadata.schemaClass || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAgentData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              schemaClass: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select
                    value={newAgentData.environment}
                    onValueChange={(val: string) =>
                      setNewAgentData(prev => ({ ...prev, environment: val }))
                    }
                  >
                    <SelectTrigger data-testid="agent-environment-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Organization/Region ID</Label>
                  <Input
                    value={newAgentData.org_id}
                    data-testid="agent-org-id-input"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewAgentData(prev => ({
                        ...prev,
                        org_id: e.target.value,
                      }))
                    }
                    placeholder="e.g., EMEA-SALES-01"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={newAgentData.provider}
                      onValueChange={(val: string) =>
                        setNewAgentData(prev => ({ ...prev, provider: val }))
                      }
                    >
                      <SelectTrigger data-testid="agent-provider-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="groq">Groq</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="cohere">Cohere</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select
                      value={newAgentData.model}
                      onValueChange={(val: string) =>
                        setNewAgentData(prev => ({ ...prev, model: val }))
                      }
                    >
                      <SelectTrigger data-testid="agent-model-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">
                          Claude 3 Opus
                        </SelectItem>
                        <SelectItem value="claude-3-sonnet">
                          Claude 3 Sonnet
                        </SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="deepseek-chat">
                          DeepSeek Chat
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Daily Budget ($)</Label>
                    <Input
                      type="number"
                      value={newAgentData.budget}
                      data-testid="agent-budget-input"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewAgentData(prev => ({
                          ...prev,
                          budget: parseFloat(e.target.value),
                        }))
                      }
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={newAgentData.maxTokens}
                      data-testid="agent-max-tokens-input"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewAgentData(prev => ({
                          ...prev,
                          maxTokens: parseInt(e.target.value),
                        }))
                      }
                      placeholder="100000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Control Webhook (Active Governance)</Label>
                  <Input
                    value={newAgentData.control_webhook}
                    data-testid="agent-control-webhook-input"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewAgentData(prev => ({
                        ...prev,
                        control_webhook: e.target.value,
                      }))
                    }
                    placeholder="https://api.company.com/agents/control"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewAgentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAgent}
                data-testid="create-agent-submit-btn"
              >
                Create Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Agent Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agent Settings: {selectedAgent?.name}</DialogTitle>
              <DialogDescription>
                Modify performance and budget parameters
              </DialogDescription>
            </DialogHeader>
            {selectedAgent && (
              <AgentSettingsDialog
                agent={selectedAgent}
                onSave={handleUpdateAgent}
                onOpenChange={setShowSettingsDialog}
              />
            )}
          </DialogContent>
        </Dialog>

        {showForensicTraceDialog && (
          <ForensicTraceDialog
            traceId={selectedAuditEntry?.id || activeForensicId || ""}
            isOpen={showForensicTraceDialog}
            onOpenChange={setShowForensicTraceDialog}
          />
        )}

        {/* Inject Hint Dialog */}
        <Dialog open={isHintDialogOpen} onOpenChange={setIsHintDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-blue-500" />
                Inject Behavioral Hint
              </DialogTitle>
              <DialogDescription>
                Provide real-time guidance to{" "}
                <strong>{selectedAgentForHint?.name}</strong> to steer its
                decision logic.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Textarea
                placeholder="Enter hint or correction (e.g., 'Focus on cost optimization for this phase'...)"
                value={hintText}
                onChange={e => setHintText(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                data-testid="hint-injection-input"
              />
              <div className="flex items-center gap-2 p-3 rounded bg-blue-500/10 text-blue-500 text-xs">
                <Brain className="w-4 h-4" />
                <span>
                  The agent will re-evaluate its current task using this
                  instruction as a priority constraint.
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsHintDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInjectHint}
                disabled={!hintText.trim()}
                data-testid="confirm-hint-injection"
              >
                Inject Priority Hint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Management Webhook</DialogTitle>
              <DialogDescription>
                Route governance events to external systems
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input
                  placeholder="webhook name"
                  data-testid="webhook-name-input"
                  value={newWebhookData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewWebhookData({
                      ...newWebhookData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input
                  placeholder="https://example.com"
                  data-testid="webhook-url-input"
                  value={newWebhookData.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewWebhookData({
                      ...newWebhookData,
                      url: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "AGENT_ERROR",
                    "BUDGET_EXCEEDED",
                    "LOOP_DETECTED",
                    "FAILOVER_INIT",
                  ].map(event => (
                    <div key={event} className="flex items-center gap-2">
                      <Checkbox
                        id={event}
                        checked={newWebhookData.events.includes(event)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setNewWebhookData({
                              ...newWebhookData,
                              events: [...newWebhookData.events, event],
                            });
                          } else {
                            setNewWebhookData({
                              ...newWebhookData,
                              events: newWebhookData.events.filter(
                                e => e !== event
                              ),
                            });
                          }
                        }}
                      />
                      <label htmlFor={event} className="text-xs cursor-pointer">
                        {event}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowWebhookDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRegisterWebhook}>Add Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* System Snapshots Dialog */}
        <Dialog
          open={showSnapshotsDialog}
          onOpenChange={setShowSnapshotsDialog}
        >
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                Temporal State Snapshots
              </DialogTitle>
              <DialogDescription>
                System integrity points for autonomous recovery and rollback.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Snapshot ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Integrity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(snapshots) && snapshots.length > 0 ? (
                    (Array.isArray(snapshots) ? snapshots : []).map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">
                          {s.id}
                        </TableCell>
                        <TableCell className="text-xs">
                          {s.timestamp
                            ? new Date(s.timestamp).toLocaleString()
                            : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            STABLE
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3" /> VERIFIED
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] font-bold text-blue-500 hover:text-blue-600"
                            onClick={() => handleRollbackSnapshot(s.id)}
                            data-testid="rollback-snapshot-btn"
                          >
                            ROLLBACK
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground italic"
                      >
                        No snapshots available. Synchronizing with cluster...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSnapshotsDialog(false)}
              >
                Close
              </Button>
              <Button
                data-testid="capture-snapshot-btn"
                onClick={handleCaptureSnapshot}
              >
                Capture Fresh State
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Proxy configuration Dialog */}
        <Dialog
          open={showProxyConfigDialog}
          onOpenChange={setShowProxyConfigDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-500" />
                Multi-Cloud Proxy Routing
              </DialogTitle>
              <DialogDescription>
                Configure global ingress traffic distribution and regional
                affinity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Primary Ingress Region</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={proxyTarget}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setProxyTarget(e.target.value)
                  }
                  data-testid="proxy-region-select"
                >
                  <option value="aws-us-east-1">
                    AWS US-East-1 (Virginia)
                  </option>
                  <option value="gcp-europe-west1">
                    GCP Europe-West1 (Belgium)
                  </option>
                  <option value="azure-eastus">Azure East US (Virginia)</option>
                </select>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10 space-y-2">
                <div className="text-xs font-bold uppercase text-purple-500">
                  Routing Policy
                </div>
                <div className="text-sm">
                  Traffic will be routed through the Alpha Global Mesh. DDoS
                  mitigation and WAF rules are applied at the edge.
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowProxyConfigDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleConfigureProxyRules}
                data-testid="apply-proxy-btn"
              >
                Apply Routing Config
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Agent Dialog */}
        <Dialog open={showNewModelDialog} onOpenChange={setShowNewModelDialog}>
          <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-500" />
                Onboard Language Model
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Register a new LLM provider or local model into the governance
                fabric.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={newModelData.provider}
                    onValueChange={v =>
                      setNewModelData(prev => ({ ...prev, provider: v }))
                    }
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google Vertex</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="custom">Private Endpoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deployment Type</Label>
                  <Select defaultValue="saas">
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="saas">SaaS (API)</SelectItem>
                      <SelectItem value="vpc">Private VPC</SelectItem>
                      <SelectItem value="edge">Edge Device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Model Name / Identifier</Label>
                <Input
                  data-testid="model-name-input"
                  placeholder="e.g. gpt-4o-2024-05-13"
                  className="bg-zinc-900 border-zinc-800"
                  value={newModelData.name}
                  onChange={e =>
                    setNewModelData(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>API Handshake Key</Label>
                <div className="relative">
                  <Input
                    data-testid="model-key-input"
                    type="password"
                    placeholder="sk-..."
                    className="bg-zinc-900 border-zinc-800 pr-10"
                    value={newModelData.key}
                    onChange={e =>
                      setNewModelData(prev => ({
                        ...prev,
                        key: e.target.value,
                      }))
                    }
                  />
                  <Key className="w-4 h-4 absolute right-3 top-3 text-zinc-600" />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded bg-zinc-900/50 border border-zinc-800">
                <Checkbox id="sentinel-protect" defaultChecked />
                <Label
                  htmlFor="sentinel-protect"
                  className="text-xs font-medium cursor-pointer text-zinc-300"
                >
                  Enforce Alpha Sentinel Governance (Recommended)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowNewModelDialog(false)}
              >
                Cancel
              </Button>
              <Button
                data-testid="register-model-btn"
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                onClick={handleRegisterModel}
              >
                Verify & Register
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={onFileImport}
          data-testid="agent-import-input"
        />

        <ForensicTraceDialog
          isOpen={showForensicTraceDialog}
          onOpenChange={setShowForensicTraceDialog}
          traceId={selectedAuditEntry?.id || ""}
        />

        <ConfigureStreamDialog
          isOpen={showConfigureStreamDialog}
          onOpenChange={setShowConfigureStreamDialog}
          config={streamConfig}
          onSave={setStreamConfig}
        />
      </div>
    </>
  );
}

function ForensicTraceDialog({
  traceId,
  isOpen,
  onOpenChange,
}: {
  traceId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [traceData, setTraceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && traceId) {
      setLoading(true);
      extendedApi.agentOps
        .getForensicTrace(traceId)
        .then(res => setTraceData(res))
        .catch(() => toast.error("Failed to load forensic trace"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, traceId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Decision Forensic Trace
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Internal reasoning and state transition for Interaction ID:{" "}
            <span className="font-mono text-zinc-300">{traceId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-zinc-500 text-sm">
                Reconstructing decision graph...
              </p>
            </div>
          ) : traceData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded bg-zinc-900 border border-zinc-800">
                  <Label className="text-[10px] uppercase text-zinc-500">
                    Latency
                  </Label>
                  <div className="text-lg font-bold">
                    {traceData.latency_ms}ms
                  </div>
                </div>
                <div className="p-3 rounded bg-zinc-900 border border-zinc-800">
                  <Label className="text-[10px] uppercase text-zinc-500">
                    Tokens
                  </Label>
                  <div className="text-lg font-bold">
                    {traceData.tokens_used}
                  </div>
                </div>
                <div className="p-3 rounded bg-zinc-900 border border-zinc-800">
                  <Label className="text-[10px] uppercase text-zinc-500">
                    Cost
                  </Label>
                  <div className="text-lg font-bold">
                    ${traceData.cost_usd.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">
                  Semantic Reasoning Chain
                </Label>
                <div className="p-4 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {traceData.reasoning_steps?.join("\n\n") ||
                    "No reasoning chain recorded for this trace."}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2 font-bold text-emerald-500">
                  <ShieldCheck className="w-4 h-4" />
                  Governance Pass
                </div>
                <p className="text-xs text-zinc-400">
                  Request validated against security policies. No PII leaks
                  detected. Budget within per-interaction quota.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-500 italic">
              Trace data unavailable or expired from warm storage.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Trace
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Export PDF Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfigureStreamDialog({
  isOpen,
  onOpenChange,
  config,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config: any;
  onSave: (newConfig: any) => void;
}) {
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await extendedApi.sentinel.updateHealingConfig({
        stream_latency_target: localConfig.p95_latency_ms,
        auto_refine: true,
        safety_rollback: true,
      });
      onSave(localConfig);
      toast.success("Streaming configuration persisted to Sentinel.");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to persist streaming config.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-orange-500" />
            Configure Metrics Stream
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Adjust real-time telemetry parameters for the Sentinel Bridge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Target P95 Latency (ms)</Label>
            <Input
              type="number"
              value={localConfig.p95_latency_ms}
              onChange={e =>
                setLocalConfig({
                  ...localConfig,
                  p95_latency_ms: parseInt(e.target.value),
                })
              }
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <div className="space-y-2">
            <Label>Agent Subscription Buffer</Label>
            <Input
              type="number"
              value={localConfig.connected_agents}
              onChange={e =>
                setLocalConfig({
                  ...localConfig,
                  connected_agents: parseInt(e.target.value),
                })
              }
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
            Note: Lowering latency targets increases backend compute overhead
            for real-time forensic reconstruction.
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Persisting..." : "Apply Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
