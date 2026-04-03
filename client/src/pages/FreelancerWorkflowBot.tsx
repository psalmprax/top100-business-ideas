import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/UserMenu";
import {
  Clock,
  Sparkles,
  Briefcase,
  Calendar,
  Mail,
  CreditCard,
  Zap,
  MessageCircle,
  CheckCircle2,
  Search,
  Plus,
  BarChart3,
  History,
  Settings,
  ArrowRight,
  Play,
  Timer,
  LayoutDashboard,
  FileText,
  Smartphone,
  Download,
  Shield,
  Users,
  Activity,
  Globe,
  Lock,
  TrendingUp,
  FileCheck,
  Layers,
  Box,
  Milestone,
  Tag,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Mic,
  RefreshCw,
  Trash2,
  DollarSign,
  ExternalLink,
  Link2,
  Unlink,
  Target,
  Send,
  Phone,
  MapPin,
  Plane,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { storage } from "@/lib/storage";
import {
  billingApi,
  extendedApi,
  agentsApi,
  metricsApi,
  type Agent,
  type Task,
  type Client,
  type Integration,
  type ScheduleEvent,
  type BotSetting,
} from "@/lib/api";

// ============================================================================
// Types & Components
// ============================================================================

type CategoryType = "ops" | "fin" | "log" | "strat";

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  change,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  change?: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <Badge
              variant={change >= 0 ? "default" : "destructive"}
              className="text-[10px] h-4"
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <div className="text-stat text-white tabular-nums mb-1">{value}</div>
          <div className="text-stat-label mt-0.5">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FreelancerWorkflowBot() {
  const { isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("ops");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isStripeConnecting, setIsStripeConnecting] = useState(false);
  const [timeSaved, setTimeSaved] = useState(0);

  // Real data state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [botSettings, setBotSettings] = useState<any>({
    autoReply: true,
    autoInvoice: false,
    smartScheduling: true,
    leadScoring: false,
    nlpModel: "gpt-4",
  });
  const [earningsData, setEarningsData] = useState<any>(null);
  const [taxEstimate, setTaxEstimate] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data from real APIs
        const [
          agentsData,
          metricsData,
          tasksData,
          clientsData,
          integrationsData,
          scheduleData,
          botSettingsData,
          insightsData,
          taxDataResp,
          invoicesData,
        ] = await Promise.all([
          agentsApi.list(),
          metricsApi.current(),
          extendedApi.workforce.getTasks(),
          extendedApi.workforce.getClients(),
          extendedApi.workforce.getIntegrations(),
          extendedApi.workforce.getScheduleEvents(),
          extendedApi.workforce.getBotSettings("current_user"), 
          extendedApi.workforce.getInsights(),
          extendedApi.workforce.getTaxEstimate(),
          extendedApi.workforce.getInvoices(),
        ]);

        setAgents(Array.isArray(agentsData) ? agentsData : []);
        if (metricsData) setMetrics(metricsData);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setIntegrations(
          Array.isArray(integrationsData) ? integrationsData : []
        );
        setScheduleEvents(Array.isArray(scheduleData) ? scheduleData : []);
        // Convert BotSetting[] to object for the UI
        if (Array.isArray(botSettingsData)) {
          const settingsObj = { ...botSettings };
          botSettingsData.forEach((s: any) => {
            if (s.setting_key && s.setting_value !== undefined) {
              settingsObj[s.setting_key] =
                s.setting_type === "boolean"
                  ? s.setting_value === "true" || s.setting_value === true
                  : s.setting_value;
            }
          });
          setBotSettings(settingsObj);
        }
        setEarningsData(insightsData || null);
        setTaxEstimate(taxDataResp || null);
        if (Array.isArray(invoicesData)) setInvoices(invoicesData);
      } catch (error) {
        console.error("Failed to fetch workforce bot data:", error);
        // In a real app, we might show an error state here
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = async () => {
    const title = window.prompt("Task title:");
    if (!title) return;

    try {
      const newTask = await extendedApi.workforce.createTask({
        title,
        status: "pending",
        priority: "medium",
        assigned_to: "WorkflowBot",
        created_at: new Date().toISOString(),
      });

      setTasks(prev => [...prev, newTask]);
      toast.success(`Task created: ${title}`);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please try again.");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const updatedTask = await extendedApi.workforce.updateTask(taskId, {
        status: "completed",
        completed_at: new Date().toISOString(),
      });

      setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));
      toast.success("Task completed");
    } catch (error) {
      console.error("Failed to complete task:", error);
      toast.error("Failed to complete task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await extendedApi.workforce.deleteTask(taskId);

      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.info("Task removed");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    try {
      // First, get the current integration to toggle
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;

      const updatedIntegration = await extendedApi.workforce.updateIntegration(
        integrationId,
        {
          connected: !integration.connected,
        }
      );

      setIntegrations(prev =>
        prev.map(i => (i.id === integrationId ? updatedIntegration : i))
      );
      toast.success(
        `${updatedIntegration.name} ${updatedIntegration.connected ? "connected" : "disconnected"}`
      );
    } catch (error) {
      console.error("Failed to toggle integration:", error);
      toast.error("Failed to toggle integration. Please try again.");
    }
  };

  const handleAddClient = async () => {
    const name = window.prompt("Client name:");
    if (!name) return;
    const email = window.prompt("Client email:") || "";

    try {
      const newClient = await extendedApi.workforce.createClient({
        name,
        email,
        status: "prospect",
        created_at: new Date().toISOString(),
      });

      setClients(prev => [...prev, newClient]);
      toast.success(`Client added: ${name}`);
    } catch (error) {
      console.error("Failed to add client:", error);
      toast.error("Failed to add client. Please try again.");
    }
  };

  const handleAddEvent = async () => {
    const title = window.prompt("Event title:");
    if (!title) return;

    const dateStr = window.prompt("Date (e.g., 2026-04-01 10:00):");
    const date = dateStr ? new Date(dateStr) : new Date();

    if (isNaN(date.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    try {
      const newEvent = await extendedApi.workforce.createScheduleEvent({
        title,
        description: "",
        start_time: date.toISOString(),
        end_time: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        event_type: "meeting",
        location: "",
        is_all_day: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setScheduleEvents(prev => [...prev, newEvent]);
      toast.success(`Event scheduled: ${title}`);
    } catch (error) {
      console.error("Failed to add event:", error);
      toast.error("Failed to add event. Please try again.");
    }
  };

  const handleSaveBotSettings = async () => {
    try {
      // Convert botSettings object to BotSetting array format for API
      const settingsToSave = Object.entries(botSettings).map(
        ([key, value]) => ({
          setting_key: key,
          setting_value: String(value),
          setting_type: typeof value,
          user_id: "current_user",
          description: `${key} setting`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      // Save all bot settings
      const savePromises = settingsToSave.map(setting =>
        extendedApi.workforce.createBotSetting(setting).catch(() => {
          // If create fails, setting might already exist
          console.log(`Setting ${setting.setting_key} might already exist`);
        })
      );

      await Promise.all(savePromises);
      toast.success("Bot settings saved");
    } catch (error) {
      console.error("Failed to save bot settings:", error);
      toast.error("Failed to save bot settings. Please try again.");
    }
  };

  const handleAuthorizeAgent = async () => {
    setIsAuthorizing(true);
    toast.promise(extendedApi.workforce.deployCheck(), {
      loading: "Drafting legal authorization and deploying agent...",
      success: (data: any) => {
        setIsAuthorizing(false);
        setTimeSaved(prev => {
          const newVal = prev + 14.0;
          storage.set("fwb_time_saved", newVal);
          return newVal;
        });
        return data?.message || "Agent authorized. CRM automation is now live.";
      },
      error: () => {
        setIsAuthorizing(false);
        return "Authorization failed. Service unavailable.";
      },
    });
  };

  const handleStripeConnect = async () => {
    setIsStripeConnecting(true);
    toast.promise(billingApi.createCheckout("starter", "stripe"), {
      loading: "Redirecting to Stripe OAuth...",
      success: (data: any) => {
        setIsStripeConnecting(false);
        if (data?.url) {
          window.open(data.url, "_blank");
        }
        return "Stripe account connected. Billing Bot active.";
      },
      error: () => {
        setIsStripeConnecting(false);
        return "Connection failed. Service unavailable.";
      },
    });
  };

  const categories: {
    id: CategoryType;
    label: string;
    icon: any;
    description: string;
  }[] = [
    { id: "ops", label: "Operations", icon: Zap, description: "Tasks & Inbox" },
    {
      id: "fin",
      label: "Finance",
      icon: CreditCard,
      description: "Billing & ROI",
    },
    {
      id: "log",
      label: "Logistics",
      icon: Calendar,
      description: "Travel & Hub",
    },
    {
      id: "strat",
      label: "Strategy",
      icon: Sparkles,
      description: "Growth & Insights",
    },
  ];

  const categoryTabs: Record<
    CategoryType,
    { value: string; label: string; icon: any }[]
  > = {
    ops: [
      { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { value: "inbox", label: "Inbox Manager", icon: Mail },
      { value: "tasks", label: "Task Queue", icon: Briefcase },
      { value: "logs", label: "Automation Logs", icon: History },
    ],
    fin: [
      { value: "billing", label: "Billing Bot", icon: CreditCard },
      { value: "invoices", label: "Invoice Chasing", icon: FileCheck },
      { value: "earnings", label: "Earnings ROI", icon: TrendingUp },
      { value: "taxes", label: "Tax Provisioning", icon: Shield },
    ],
    log: [
      { value: "schedule", label: "Smart Schedule", icon: Timer },
      { value: "travel", label: "Travel Agent", icon: Globe },
      { value: "integrations", label: "Integration Hub", icon: Layers },
      { value: "crm", label: "Client CRM", icon: Users },
    ],
    strat: [
      { value: "intelligence", label: "AI Insights", icon: Sparkles },
      { value: "growth", label: "Growth Engine", icon: Zap },
      { value: "settings", label: "Bot Settings", icon: Settings },
    ],
  };

  const handleDownload = (filename: string, content: string) => {
    const isBinary =
      filename.endsWith(".zip") ||
      filename.endsWith(".apk") ||
      filename.endsWith(".bin");
    let url;

    if (isBinary && content.length > 50) {
      const cleanBase64 = content.replace(/[^A-Za-z0-9+/=]/g, "");
      url = `data:application/zip;base64,${cleanBase64}`;
    } else {
      const blob = new Blob([content], { type: "text/plain" });
      url = URL.createObjectURL(blob);
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelegateTask = () => {
    const taskDescription = window.prompt("Describe the task to delegate:");
    if (!taskDescription) return;
    toast.promise(
      extendedApi.workforce.runCampaign(taskDescription, "freelancer"),
      {
        loading: "Delegating task to workflow agent...",
        success: (data: any) => {
          return (
            data?.message ||
            `Task delegated: "${taskDescription.substring(0, 40)}..."`
          );
        },
        error: () => "Task delegation failed. Service unavailable.",
      }
    );
  };

  const handleOpenInbox = () => {
    setActiveCategory("ops");
    setActiveTab("inbox");
    toast.info("Inbox Manager activated. Monitoring communications...");
  };

  const sdkZip =
    "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";

  return (
    <div className="min-h-screen bg-muted/30 text-foreground font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              {isDemo && (
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    ← Back
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-product-title text-white text-xl">
                    WorkflowBot <span>PRO</span>
                  </h1>
                  <p className="text-feature text-muted-foreground">
                    Autonomous Freelance Engine
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-indigo-200"
                onClick={() => handleDownload("workflowbot-sdk-v1.zip", sdkZip)}
              >
                <Download className="w-4 h-4 mr-2 text-indigo-600" />
                SDK
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-indigo-200"
                onClick={() =>
                  handleDownload("workflowbot-assistant.apk", sdkZip)
                }
              >
                <Smartphone className="w-4 h-4 mr-2 text-indigo-600" />
                App
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-caption-premium h-9 px-6 shadow-lg shadow-indigo-600/20"
                onClick={handleDelegateTask}
              >
                <Plus className="w-4 h-4 mr-2" /> Delegate Task
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Pillar Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              data-testid={`btn-pillar-${cat.id}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveTab(categoryTabs[cat.id][0].value);
              }}
              className={`flex flex-col items-start p-5 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                activeCategory === cat.id
                  ? "bg-indigo-600/5 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                  : "bg-card hover:bg-muted/50 border-border/50"
              }`}
            >
              <div
                className={`p-2.5 rounded-xl mb-4 transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/20"
                    : "bg-muted text-muted-foreground group-hover:bg-indigo-100 group-hover:text-indigo-600"
                }`}
              >
                <cat.icon className="w-5 h-5" />
              </div>
              <div className="text-overline text-muted-foreground mb-1">
                {cat.label}
              </div>
              <div className="text-caption-premium">{cat.description}</div>

              {activeCategory === cat.id && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <ScrollArea className="w-full whitespace-nowrap mb-8 pb-2">
            <TabsList className="inline-flex h-11 items-center justify-start gap-2 p-1 bg-muted/50 border border-border/50 rounded-xl overflow-hidden">
              {categoryTabs[activeCategory].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-background data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm px-6 h-9 text-caption-premium transition-all"
                  data-testid={`tab-${tab.value}`}
                >
                  <tab.icon className="w-3.5 h-3.5 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>

          {/* Operations Pillar */}
          <TabsContent value="dashboard" className="mt-0">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="Active Automations"
                    value="12/15"
                    icon={Zap}
                    color="bg-amber-500/10 text-amber-500"
                    change={14}
                  />
                  <MetricCard
                    title="Reliability"
                    value="99.9%"
                    icon={ShieldCheck}
                    color="bg-emerald-500/10 text-emerald-500"
                  />
                  <MetricCard
                    title="Time Saved"
                    value={`${(metrics?.time_saved || timeSaved).toFixed(1)}h`}
                    icon={Clock}
                    color="bg-indigo-500/10 text-indigo-500"
                    change={metrics?.time_saved_change || 22}
                  />
                  <MetricCard
                    title="Queue Pressure"
                    value="Low"
                    icon={Activity}
                    color="bg-blue-500/10 text-blue-500"
                  />
                </div>

                <Card className="border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-card-title flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-600" />
                        Live Execution Feed
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="text-caption-premium bg-background"
                      >
                        REAL-TIME
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {(tasks || []).slice(0, 5).map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-6 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                            {item.type === "Docs" || !item.type ? (
                              <FileText className="w-5 h-5 text-indigo-600" />
                            ) : item.type === "Billing" ? (
                              <CreditCard className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Calendar className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-card-title">{item.title}</div>
                            <div className="text-caption-premium mt-0.5">
                              {item.assigned_to || "WorkflowBot"} &middot; {new Date(item.created_at || item.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${item.status === "completed" || item.status === "Done" ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"} text-white border-none text-caption-premium h-4 rounded-sm font-black uppercase tracking-tighter px-1.5`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(!tasks || tasks.length === 0) && (
                      <div className="p-8 text-center text-muted-foreground text-sm italic">
                        No active execution cycles in current buffer.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl shadow-indigo-600/20 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                  <CardContent className="p-6 relative z-10">
                    <Sparkles className="w-8 h-8 text-indigo-200 mb-6" />
                    <h3 className="text-section-headline italic mb-4">
                      Optimization Insight
                    </h3>
                    <p className="text-body-sm text-indigo-50 mb-6">
                      I've detected you spend ~14 hours monthly on repetitive
                      CRM updates. Authorize an autonomous agent to handle this
                      permanently?
                    </p>
                    <Button
                      className="w-full bg-white text-indigo-600 hover:bg-indigo-50 text-caption-premium h-10"
                      data-testid="btn-authorize-agent"
                      onClick={handleAuthorizeAgent}
                      disabled={isAuthorizing}
                    >
                      {isAuthorizing ? "AUTHORIZING..." : "Authorize Agent"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-caption-premium text-muted-foreground">
                      Queue Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-body-sm font-bold">
                          12 Tasks Pending
                        </span>
                        <span className="text-body-sm">3.5h left</span>
                      </div>
                      <Progress value={65} className="h-1.5" />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <div className="text-lg font-bold">4</div>
                          <div className="text-caption-premium">Priority</div>
                        </div>
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <div className="text-lg font-bold">8</div>
                          <div className="text-caption-premium">Routine</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inbox">
            <Card className="border-border/50 min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-section-headline">Inbox Manager Hub</h3>
                <p className="text-body-sm mt-2 max-w-sm">
                  Smart email filtering and auto-reply drafting is ready for
                  activation.
                </p>
                <Button
                  className="mt-6 bg-indigo-600 font-bold uppercase text-[10px]"
                  onClick={handleOpenInbox}
                >
                  Open Inbox Console
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Finance Pillar Content */}
          <TabsContent value="billing">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-muted/10 border-indigo-500/20 border-2 border-dashed flex flex-col items-center justify-center p-12 text-center">
                <div className="p-4 rounded-full bg-indigo-100 mb-6">
                  <CreditCard className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-section-headline mb-2">Connect Stripe</h3>
                <p className="text-body-sm max-w-xs mb-8">
                  Authorizing Stripe allows WorkflowBot to automatically
                  generate and chase invoices on your behalf.
                </p>
                <Button
                  className="bg-[#635BFF] hover:bg-[#635BFF]/90 text-white font-black px-10 h-11"
                  onClick={handleStripeConnect}
                  disabled={isStripeConnecting}
                >
                  {isStripeConnecting
                    ? "CONNECTING..."
                    : "Link account via Stripe"}
                </Button>
              </Card>
              <div className="space-y-6">
                <MetricCard
                  title="Outstanding Invoices"
                  value={`$${(earningsData?.pendingPayments || 0).toLocaleString()}`}
                  icon={FileCheck}
                  color="bg-orange-500/10 text-orange-500"
                  change={metrics?.outstanding_change || -12}
                />
                <Card>
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-caption-premium">
                      Recent Invoices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {(invoices || []).slice(0, 5).map((inv: any) => (
                      <div
                        key={inv.id}
                        className="p-4 border-b border-border/30 last:border-0 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-background border flex items-center justify-center text-caption-premium font-bold">
                            INV
                          </div>
                          <div>
                            <div className="text-body-sm font-bold">
                              {inv.invoice_number || `INV-${inv.id.substring(0, 4)}`}
                            </div>
                            <div className="text-caption-premium">
                              {inv.client_name || "Enterprise Client"} &middot; {new Date(inv.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={inv.status === "paid" ? "default" : "outline"}
                          className={`text-caption-premium uppercase ${inv.status === "paid" ? "bg-emerald-500" : ""}`}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    ))}
                    {(!invoices || invoices.length === 0) && (
                      <div className="p-8 text-center text-muted-foreground text-sm italic">
                        No invoices generated in current cycle.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-caption-premium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Task Queue
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-indigo-600 h-8 text-[10px] uppercase"
                    onClick={handleCreateTask}
                  >
                    <Plus className="w-3 h-3 mr-1" /> New Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {tasks.length === 0 ? (
                  <div className="p-12 text-center">
                    <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-body-sm">
                      No tasks yet. Create your first task.
                    </p>
                  </div>
                ) : (
                  tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border-b border-border/30 last:border-0 hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === "completed" ? "bg-green-500 border-green-500" : "border-muted-foreground hover:border-indigo-500"}`}
                        >
                          {task.status === "completed" && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <div>
                          <div
                            className={`text-body-sm font-bold ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </div>
                          <div className="text-caption-premium">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-caption-premium"
                        >
                          {task.priority}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-caption-premium flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  Automation Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {agents.length > 0 ? (
                  agents.map((agent: any) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-4 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-body-sm font-bold">
                            {agent.name}
                          </div>
                          <div className="text-caption-premium">
                            {agent.type} · {agent.model}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={
                          agent.status === "active"
                            ? "bg-green-500 text-white text-caption-premium"
                            : "bg-muted text-caption-premium"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <History className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-body-sm">
                      No agents deployed yet. Authorize an agent to see logs.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-caption-premium flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  Invoice Chasing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <div className="text-caption-premium">Outstanding</div>
                    <div className="text-stat text-orange-500">
                      $
                      {invoices
                        .filter(i => i.status === "pending")
                        .reduce((s, i) => s + (i.amount || 0), 0)
                        .toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="text-caption-premium">Collected</div>
                    <div className="text-stat text-green-500">
                      $
                      {invoices
                        .filter(i => i.status === "paid")
                        .reduce((s, i) => s + (i.amount || 0), 0)
                        .toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-body-sm text-center">
                  Connect Stripe to enable automatic invoice generation and
                  chasing.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader className="py-4 border-b border-border/50">
                  <CardTitle className="text-caption-premium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Earnings ROI
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Revenue</span>
                    <span className="text-xl font-bold text-green-500">
                      ${earningsData.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      (earningsData.totalRevenue / 50000) * 100
                    )}
                    className="h-2"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Revenue</span>
                    <span className="font-bold">
                      ${earningsData.monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Payments</span>
                    <span className="font-bold text-orange-500">
                      ${earningsData.pendingPayments.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Project Value</span>
                    <span className="font-bold">
                      ${earningsData.avgProjectValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">YoY Growth</span>
                    <Badge className="bg-green-500/10 text-green-500">
                      +{earningsData.yoyGrowth}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader className="py-4 border-b border-border/50">
                  <CardTitle className="text-caption-premium">
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        label: "Revenue Target",
                        value: `${Math.round((earningsData.totalRevenue / 50000) * 100)}%`,
                        progress: (earningsData.totalRevenue / 50000) * 100,
                      },
                      { label: "Client Retention", value: "92%", progress: 92 },
                      { label: "Utilization Rate", value: "78%", progress: 78 },
                    ].map(m => (
                      <div key={m.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {m.label}
                          </span>
                          <span className="font-bold">{m.value}</span>
                        </div>
                        <Progress value={m.progress} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-caption-premium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Tax Provisioning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="text-caption-premium">Estimated Tax</div>
                    <div className="text-stat text-red-500">
                      ${taxEstimate.estimatedTax.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="text-caption-premium">Deductible</div>
                    <div className="text-stat text-green-500">
                      ${taxEstimate.deductible.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { q: "Q1", amount: taxEstimate.q1Paid, status: "Paid" },
                    { q: "Q2", amount: taxEstimate.q2Paid, status: "Paid" },
                    { q: "Q3", amount: taxEstimate.q3Due, status: "Due" },
                    { q: "Q4", amount: taxEstimate.q4Due, status: "Upcoming" },
                  ].map(item => (
                    <div
                      key={item.q}
                      className="flex items-center justify-between p-3 rounded bg-muted/30"
                    >
                      <span className="text-body-sm font-bold">
                        {item.q} Estimated
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold">
                          ${item.amount.toLocaleString()}
                        </span>
                        <Badge
                          className={
                            item.status === "Paid"
                              ? "bg-green-500/10 text-green-500 text-caption-premium"
                              : "bg-orange-500/10 text-orange-500 text-caption-premium"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-caption-premium flex items-center gap-2">
                    <Timer className="w-4 h-4 text-indigo-600" />
                    Smart Schedule
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-indigo-600 h-8 text-[10px] uppercase"
                    onClick={handleAddEvent}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {scheduleEvents.length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-body-sm">
                      No events scheduled. Add your first event.
                    </p>
                  </div>
                ) : (
                  scheduleEvents.map((evt: any) => (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between p-4 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-body-sm font-bold">
                            {evt.title}
                          </div>
                          <div className="text-caption-premium">{evt.date}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-caption-premium">
                        {evt.type}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Travel Tab */}
          <TabsContent value="travel">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-caption-premium flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Travel Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Flights",
                      icon: Plane,
                      desc: "Search and book flights",
                      action: () =>
                        toast.info(
                          "Flight search: Connect your travel provider"
                        ),
                    },
                    {
                      label: "Hotels",
                      icon: MapPin,
                      desc: "Find accommodation",
                      action: () =>
                        toast.info(
                          "Hotel search: Connect your travel provider"
                        ),
                    },
                    {
                      label: "Itinerary",
                      icon: FileText,
                      desc: "View trip plans",
                      action: () => toast.info("No trips planned yet"),
                    },
                    {
                      label: "Expenses",
                      icon: DollarSign,
                      desc: "Track travel costs",
                      action: () =>
                        toast.info("Travel expense tracking active"),
                    },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="p-6 rounded-lg border border-border/50 hover:bg-muted/50 text-left transition-colors"
                    >
                      <item.icon className="w-6 h-6 text-indigo-600 mb-3" />
                      <div className="text-card-title">{item.label}</div>
                      <div className="text-caption-premium mt-1">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-caption-premium flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Integration Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {integrations.map(integration => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <div className="text-card-title">
                            {integration.name}
                          </div>
                          <div className="text-caption-premium">
                            {integration.connected
                              ? "Connected"
                              : "Not connected"}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={
                          integration.connected ? "destructive" : "outline"
                        }
                        size="sm"
                        className="h-8 text-[10px]"
                        onClick={() => handleToggleIntegration(integration.id)}
                      >
                        {integration.connected ? (
                          <>
                            <Unlink className="w-3 h-3 mr-1" /> Disconnect
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3 h-3 mr-1" /> Connect
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRM Tab */}
          <TabsContent value="crm">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-caption-premium flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Client CRM
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-indigo-600 h-8 text-[10px] uppercase"
                    onClick={handleAddClient}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Client
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {clients.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-body-sm">
                      No clients yet. Add your first client.
                    </p>
                  </div>
                ) : (
                  clients.map((client: any) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 border-b border-border/30 last:border-0 hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-body-sm font-bold text-indigo-600">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-body-sm font-bold">
                            {client.name}
                          </div>
                          <div className="text-caption-premium">
                            {client.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-body-sm">
                          {client.projects} projects
                        </span>
                        <Badge
                          className={
                            client.status === "active"
                              ? "bg-green-500/10 text-green-500 text-caption-premium"
                              : "bg-amber-500/10 text-amber-500 text-caption-premium"
                          }
                        >
                          {client.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="intelligence">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-caption-premium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                    <div className="text-body-sm font-bold text-indigo-500 mb-2">
                      Revenue Optimization
                    </div>
                    <p className="text-body-sm">
                      Based on your project history, consider raising rates for
                      long-term clients by 12-15%. Average industry rate for
                      your skillset has increased.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="text-body-sm font-bold text-green-500 mb-2">
                      Client Health
                    </div>
                    <p className="text-body-sm">
                      Acme Corp engagement is strong. Consider upselling
                      compliance automation services based on their recent
                      activity.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="text-body-sm font-bold text-amber-500 mb-2">
                      Capacity Alert
                    </div>
                    <p className="text-body-sm">
                      You're at 78% utilization. Adding one more active project
                      may impact delivery quality. Consider delegating to
                      agents.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Growth Tab */}
          <TabsContent value="growth">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-caption-premium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  Growth Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
                    <div className="text-caption-premium">Active Clients</div>
                    <div className="text-2xl font-bold">
                      {clients.filter(c => c.status === "active").length}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-center">
                    <div className="text-caption-premium">Prospects</div>
                    <div className="text-2xl font-bold">
                      {clients.filter(c => c.status === "prospect").length}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      toast.info(
                        "Lead sourcing: Connect to prospecting service"
                      )
                    }
                  >
                    <Target className="w-4 h-4 mr-2" /> Source New Leads
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDelegateTask()}
                  >
                    <Send className="w-4 h-4 mr-2" /> Launch Outreach Campaign
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={async () => {
                      try {
                        const result =
                          await extendedApi.workforce.activateReferral();
                        toast.success(
                          "Referral program activated! Your unique referral code has been generated."
                        );
                      } catch (err: any) {
                        toast.error(
                          err.message || "Failed to activate referral program"
                        );
                      }
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" /> Activate Referral Program
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-border/50">
              <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-caption-premium flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  Bot Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {[
                  {
                    key: "autoReply",
                    label: "Auto-Reply",
                    desc: "Automatically respond to client emails",
                  },
                  {
                    key: "autoInvoice",
                    label: "Auto-Invoice",
                    desc: "Generate invoices upon project completion",
                  },
                  {
                    key: "smartScheduling",
                    label: "Smart Scheduling",
                    desc: "Auto-schedule meetings based on availability",
                  },
                  {
                    key: "leadScoring",
                    label: "Lead Scoring",
                    desc: "AI-powered lead qualification",
                  },
                ].map(setting => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{setting.label}</p>
                      <p className="text-caption-premium">{setting.desc}</p>
                    </div>
                    <Switch
                      checked={(botSettings as any)[setting.key]}
                      onCheckedChange={checked =>
                        setBotSettings({
                          ...botSettings,
                          [setting.key]: checked,
                        })
                      }
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label className="text-sm">NLP Model</Label>
                  <select
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm"
                    value={botSettings.nlpModel}
                    onChange={e =>
                      setBotSettings({
                        ...botSettings,
                        nlpModel: e.target.value,
                      })
                    }
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5">GPT-3.5 Turbo</option>
                    <option value="claude-3">Claude 3</option>
                  </select>
                </div>
                <Button
                  className="w-full bg-indigo-600"
                  onClick={handleSaveBotSettings}
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-body-sm font-black uppercase tracking-[0.2em] opacity-40">
            Alpha Sentinel &middot; WorkflowBot Strategic Autonomy &middot; 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
