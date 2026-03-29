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
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { storage } from "@/lib/storage";
import { billingApi, extendedApi } from "@/lib/api";

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
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {title}
          </div>
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
  const [timeSaved, setTimeSaved] = useState(
    storage.get("fwb_time_saved", 88.4)
  );

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
                  <h1
                    className="text-sm font-black uppercase tracking-tight"
                    data-testid="product-title"
                  >
                    WorkflowBot <span className="text-indigo-600">PRO</span>
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-bold">
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase h-9 px-6 shadow-lg shadow-indigo-600/20"
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
              <div className="font-black text-xs uppercase tracking-widest leading-none mb-1">
                {cat.label}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">
                {cat.description}
              </div>

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
                  className="data-[state=active]:bg-background data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm px-6 h-9 font-black text-[10px] uppercase tracking-wider transition-all"
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
                    value={`${timeSaved.toFixed(1)}h`}
                    icon={Clock}
                    color="bg-indigo-500/10 text-indigo-500"
                    change={22}
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
                      <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-600" />
                        Live Execution Feed
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="text-[8px] bg-background"
                      >
                        REAL-TIME
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {[
                      {
                        task: "Drafting Weekly Status Report",
                        client: "Acme Corp",
                        type: "Docs",
                        time: "2m ago",
                        status: "Done",
                      },
                      {
                        task: "Resolving Stripe Dispute #4921",
                        client: "Self",
                        type: "Billing",
                        time: "14m ago",
                        status: "Working",
                      },
                      {
                        task: "Booking Travel (SFO to NYC)",
                        client: "Personal",
                        type: "Admin",
                        time: "45m ago",
                        status: "Done",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-6 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                            {item.type === "Docs" && (
                              <FileText className="w-5 h-5 text-indigo-600" />
                            )}
                            {item.type === "Billing" && (
                              <CreditCard className="w-5 h-5 text-indigo-600" />
                            )}
                            {item.type === "Admin" && (
                              <Calendar className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground tracking-tight">
                              {item.task}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                              {item.client} &middot; {item.time}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${item.status === "Done" ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"} text-white border-none text-[8px] h-4 rounded-sm font-black uppercase tracking-tighter px-1.5`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl shadow-indigo-600/20 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                  <CardContent className="p-6 relative z-10">
                    <Sparkles className="w-8 h-8 text-indigo-200 mb-6" />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4">
                      Optimization Insight
                    </h3>
                    <p className="text-indigo-50 text-xs leading-relaxed mb-6">
                      I've detected you spend ~14 hours monthly on repetitive
                      CRM updates. Authorize an autonomous agent to handle this
                      permanently?
                    </p>
                    <Button
                      className="w-full bg-white text-indigo-600 font-black hover:bg-indigo-50 text-[10px] uppercase h-10 tracking-widest"
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
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Queue Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">
                          12 Tasks Pending
                        </span>
                        <span className="text-xs text-muted-foreground">
                          3.5h left
                        </span>
                      </div>
                      <Progress value={65} className="h-1.5" />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <div className="text-lg font-bold">4</div>
                          <div className="text-[8px] text-muted-foreground font-black uppercase">
                            Priority
                          </div>
                        </div>
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <div className="text-lg font-bold">8</div>
                          <div className="text-[8px] text-muted-foreground font-black uppercase">
                            Routine
                          </div>
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
                <h3 className="text-lg font-black uppercase tracking-widest">
                  Inbox Manager Hub
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
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
                <h3 className="text-xl font-black uppercase mb-2">
                  Connect Stripe
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-8">
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
                  value="$4,250"
                  icon={FileCheck}
                  color="bg-orange-500/10 text-orange-500"
                  change={-12}
                />
                <Card>
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest">
                      Recent Invoices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="p-4 border-b border-border/30 last:border-0 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-background border flex items-center justify-center text-[10px] font-bold">
                            INV
                          </div>
                          <div>
                            <div className="text-xs font-bold">INV-029{i}</div>
                            <div className="text-[8px] text-muted-foreground uppercase font-black">
                              Hooli Corp &middot; Dec 2024
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[8px] uppercase"
                        >
                          Paid
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Default fallback for other tabs */}
          {[
            "tasks",
            "logs",
            "invoices",
            "earnings",
            "taxes",
            "schedule",
            "travel",
            "integrations",
            "crm",
            "intelligence",
            "growth",
            "settings",
          ].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card className="border-border/50 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest">
                  {tab.replace("_", " ")} Module
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This module is currently in development. Check back soon for
                  advanced autonomous workflow capabilities.
                </p>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
            Alpha Sentinel &middot; WorkflowBot Strategic Autonomy &middot; 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
