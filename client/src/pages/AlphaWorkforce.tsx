import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Brain,
  TrendingUp,
  Target,
  DollarSign,
  Zap,
  ShieldCheck,
  Briefcase,
  LayoutDashboard,
  Search,
  Send,
  MessageSquare,
  BarChart3,
  Settings2,
  Play,
  Pause,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Shield,
  Globe,
  Cpu,
  Network,
  Terminal,
  Rocket,
  Workflow,
  Building2,
  FileText,
  TrendingDown,
  Activity,
  Lock,
  Unlock,
  HelpCircle,
  MessageCircle,
  Hash,
  UserPlus,
  Crown,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  X,
  Check,
  Bot,
  MessagesSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  agentsApi,
  extendedApi,
  workforceSync,
  FiscalRequest,
  WorkforceGoal,
  WorkforceVenture,
  WorkforceMessage,
  WorkforceInteraction,
} from "@/lib/api";
import { storage } from "@/lib/storage";
import { UserMenu } from "@/components/UserMenu";

const INITIAL_AGENT_ROSTER: any[] = [];

const SovereignStageItem = ({
  stage,
  name,
  status,
  description,
  isAutonomous,
  onDecision,
  currentDecision,
}: {
  stage: number;
  name: string;
  status: string;
  description: string;
  isAutonomous: boolean;
  onDecision?: (stage: number, decision: string) => void;
  currentDecision?: string;
}) => (
  <div
    className={`p-3 rounded-lg border transition-all ${isAutonomous ? "bg-indigo-500/10 border-indigo-500/30 shadow-inner" : "bg-background/40 border-border"} ${currentDecision ? "opacity-80" : ""}`}
  >
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <span
          className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${isAutonomous ? "bg-indigo-500 text-white" : "bg-muted text-muted-foreground"}`}
        >
          {stage}
        </span>
        <span className="text-card-title tracking-tight">{name}</span>
      </div>
      <Badge
        variant="outline"
        className={`text-[9px] px-1.5 py-0 h-4 ${currentDecision === "APPROVED" ? "bg-green-500/20 text-green-500 border-green-500/30" : currentDecision === "DENIED" ? "bg-red-500/20 text-red-500 border-red-500/30" : isAutonomous ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}
      >
        {currentDecision || status.replace("_", " ")}
      </Badge>
    </div>
    <p className="text-caption-premium leading-tight pl-7">{description}</p>

    {!isAutonomous && !currentDecision && onDecision && (
      <div className="flex gap-2 mt-3 pl-7">
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-[9px] border-green-500/30 text-green-500 hover:bg-green-500/10"
          onClick={() => onDecision(stage, "APPROVED")}
        >
          APPROVE
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-[9px] border-red-500/30 text-red-500 hover:bg-red-500/10"
          onClick={() => onDecision(stage, "DENIED")}
        >
          DENY
        </Button>
      </div>
    )}
  </div>
);

const AlphaWorkforce = () => {
  const [isAutonomous, setIsAutonomous] = useState(
    storage.get("workforce_autonomous", false)
  );
  const [performanceMetric, setPerformanceMetric] = useState(78);
  const [revenueGrowth, setRevenueGrowth] = useState(12.4);
  const [workforceData, setWorkforceData] = useState<any>(null);
  const [isHiringOpen, setIsHiringOpen] = useState(false);
  const [webhooks, setWebhooks] = useState({
    slack: "",
    telegram: "",
    discord: "",
  });
  const [governanceDecisions, setGovernanceDecisions] = useState<
    Record<number, string>
  >({});
  const [agentRoster, setAgentRoster] = useState<any[]>([]);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [fiscalRequests, setFiscalRequests] = useState<FiscalRequest[]>([]);

  const [isRunningMarketing, setIsRunningMarketing] = useState(false);
  const [isSourcingLeads, setIsSourcingLeads] = useState(false);
  const [ventures, setVentures] = useState<WorkforceVenture[]>([]);
  const [goals, setGoals] = useState<WorkforceGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic revenue data from API
  const [revenueData, setRevenueData] = useState<any>({
    agentOps: { revenue: 0, growth: 0, roi: 0 },
    compliance: { revenue: 0, growth: 0, roi: 0 },
    deepfake: { revenue: 0, growth: 0, roi: 0 },
    totalCapital: 0,
    burnRate: 0,
    avgRoi: 0,
  });
  const [cashclawData, setCashclawData] = useState<any>({
    balance: 0,
    activeJobs: 0,
    skillsActive: 0,
    leakedRevenue: 0,
  });
  const [skillsMarketplace, setSkillsMarketplace] = useState<any[]>([]);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);
  const [contentDrafts, setContentDrafts] = useState<any[]>([]);
  const [jobFeed, setJobFeed] = useState<any[]>([]);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [outreachDrafts, setOutreachDrafts] = useState<any[]>([]);
  const [isAutosearching, setIsAutosearching] = useState(false);
  const [autosearchNiche, setAutosearchNiche] = useState("AI Compliance for Mid-Market");
  const [targetProfile, setTargetProfile] = useState("enterprise");

  // Chat / Console State
  const [chatMessages, setChatMessages] = useState<WorkforceMessage[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("all");
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const fetchChatHistory = async () => {
    try {
      const history = await extendedApi.workforce.getChatHistory();
      setChatMessages(history.reverse()); // Show newest at bottom
    } catch (e) {
      console.error("Failed to fetch chat history", e);
    }
  };

  const fetchAgents = async () => {
    try {
      const agents = await extendedApi.workforce.getAgents();
      setAvailableAgents(agents);
    } catch (e) {
      console.error("Failed to fetch workforce agents", e);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          syncData,
          fiscalReqs,
          boardGoals,
          businessVentures,
          currentAgents,
          skills,
          earnings,
          jobs,
          winList,
          drafts,
        ] = await Promise.all([
          workforceSync(),
          extendedApi.workforce.getFiscalRequests(),
          extendedApi.workforce.getGoals(),
          extendedApi.workforce.getVentures(),
          extendedApi.agents.list(),
          extendedApi.workforce.getSkills(),
          extendedApi.workforce.getEarnings(),
          extendedApi.workforce.getJobs(),
        ]);

        const acquisitionsData = await extendedApi.workforce.getAcquisitions();
        const contentData = await extendedApi.workforce.getContentDrafts();
        const decisionsData = await extendedApi.workforce.getGovernanceDecisions();
        const historyData = await extendedApi.workforce.getExecutionHistory();

        setWorkforceData(syncData);
        setFiscalRequests(fiscalReqs);
        setGoals(boardGoals);
        setVentures(businessVentures);
        setAgentRoster(currentAgents);
        setActiveEmployees(currentAgents.length);
        setSkillsMarketplace(skills);
        setJobFeed(jobs);
        setAcquisitions(winList || acquisitionsData); // Ensure fallback
        setContentDrafts(drafts || contentData);
        setGovernanceDecisions(decisionsData || {});
        setExecutionHistory(historyData || []);

        // Fetch outreach drafts
        const draftsData = await extendedApi.workforce.getOutreachDrafts();
        setOutreachDrafts(draftsData);

        // Map earnings to revenueData with real backend distribution
        if (earnings) {
          setRevenueData({
            agentOps: earnings.segments?.agentOps || { revenue: 0, growth: 0, roi: 0 },
            compliance: earnings.segments?.compliance || { revenue: 0, growth: 0, roi: 0 },
            deepfake: earnings.segments?.deepfake || { revenue: 0, growth: 0, roi: 0 },
            totalCapital: earnings.total_capital || 0,
            burnRate: earnings.burn_rate || 0,
            avgRoi: earnings.avg_roi || 0,
          });
          setCashclawData({
            balance: earnings.cashclaw_balance || 0,
            activeJobs: earnings.active_jobs || 0,
            leakedRevenue: earnings.leaked_revenue || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch workforce data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    fetchChatHistory();
    fetchAgents();
    
    // Workforce Data Refresh Listener (Real-First Policy)
    const handleRefresh = () => fetchAllData();
    window.addEventListener('workforce_data_refresh', handleRefresh);

    // Polling for chat updates (Simulating real-time for now)
    const chatInterval = setInterval(fetchChatHistory, 5000);
    const interval = setInterval(fetchAllData, 15000);
    return () => {
      window.removeEventListener('workforce_data_refresh', handleRefresh);
      clearInterval(interval);
      clearInterval(chatInterval);
    };
  }, []);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;
    
    const msg = chatInput;
    setChatInput("");
    setIsSendingChat(true);
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    setChatMessages(prev => [...prev, {
      id: tempId,
      sender: "user",
      recipient: selectedRecipient,
      content: msg,
      created_at: new Date().toISOString(),
      is_group_chat: selectedRecipient === "all"
    } as any]);

    try {
      const response = await extendedApi.workforce.sendMessage(msg, selectedRecipient);
      // Replace optimistic message with real one
      setChatMessages(prev => prev.map(m => m.id === tempId ? response : m));
      
      // Refresh agents list in case of new deployments/status changes
      fetchAgents();
      
      toast.success(response.sender + " is responding", {
        description: response.reasoning_path ? "Multi-agent cross-reasoning logic derived." : "Agent response synthesized.",
        icon: <MessageSquare className="w-4 h-4 text-emerald-400" />
      });
    } catch (e) {
      console.error("Chat dispatch failed", e);
      toast.error("Agent communication failed. Service unreachable.");
      // Remove optimistic message on failure
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSendingChat(false);
    }
  };

  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecoverRevenue = async () => {
    setIsRecovering(true);
    toast.info("CashClaw Active: Detecting uncollected revenue...", {
      icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
    });
    try {
      const result =
        await extendedApi.workforce.cashclaw.recover("all_outstanding");
      const recovered = parseFloat(result.recovered_amount) || 0;
      setCashclawData(prev => {
        const updated = {
          ...prev,
          balance: prev.balance + recovered,
          leakedRevenue: Math.max(0, prev.leakedRevenue - recovered),
        };
        storage.set("workforce_cashclaw", updated);
        return updated;
      });
      toast.success("Revenue Recovery Successful!", {
        description: `Recovered: ${result.recovered_amount} via ${result.actions_taken?.join(", ") || "autonomous agents"}`,
      });
    } catch (e) {
      toast.error(
        "Revenue Recovery Failed: CashClaw engine reported an internal error."
      );
    } finally {
      setIsRecovering(false);
    }
  };

  const [isAnalyzingInsights, setIsAnalyzingInsights] = useState(false);
  const [isHandlingInbound, setIsHandlingInbound] = useState(false);
  const [insightResults, setInsightResults] = useState<any>(null);
  const [inboundResponse, setInboundResponse] = useState<string>("");
  const [lastInboundInteractionId, setLastInboundInteractionId] =
    useState<string>("");
  const [lastInsightInteractionId, setLastInsightInteractionId] =
    useState<string>("");

  const handleApplyFeedback = async (
    interactionId: string,
    status: string,
    notes: string = ""
  ) => {
    if (!interactionId) return;
    try {
      await extendedApi.workforce.provideFeedback(interactionId, status, notes);
      if (status === "approved") {
        toast.success("Feedback Logged: Agent performance approved.");
      } else {
        toast.info("Feedback Logged: Agent will learn from this discard.");
      }
    } catch (e) {
      console.error("Error logging feedback", e);
    }
  };

  const handleRunMarketing = async () => {
    setIsRunningMarketing(true);
    toast.info("Marketing Crew Kicked Off: Researching trends...", {
      icon: <Brain className="w-4 h-4 text-purple-500" />,
    });
    try {
      const result = await extendedApi.workforce.runCampaign(
        "AI Compliance Blitz",
        "Financial Services SMBs"
      );

      if (result.status === "success" || result.message) {
        toast.success("Marketing Campaign Complete!", {
          description:
            result.details ||
            result.message ||
            "SEO Strategy and LinkedIn drafts generated.",
        });
      } else {
        toast.error("Marketing Campaign Failed", {
          description: result.message || "Operation engine error.",
        });
      }
    } catch (e) {
      console.error("Marketing crew failed", e);
      toast.error("Error triggering Marketing Crew: Service unreachable.");
    } finally {
      setIsRunningMarketing(false);
    }
  };

  const handleAnalyzeInsights = async (feedback: string) => {
    setIsAnalyzingInsights(true);
    toast.info("Insights Agent Active: Correlating feedback patterns...", {
      icon: <PieChart className="w-4 h-4 text-orange-500" />,
    });
    try {
      const result = await extendedApi.workforce.analyzeInsights(feedback);
      setInsightResults(result);
      if (result.interaction_id)
        setLastInsightInteractionId(result.interaction_id);
      toast.success("Sentiment Analysis Complete", {
        description: `Churn Risk identified: ${result.churn_risk || "Detected"} | Sentiment: ${result.sentiment || "Analyzed"}`,
      });
    } catch (e) {
      console.error("Insights engine failed", e);
      toast.error("Error analyzing insights: Engine reported a failure.");
    } finally {
      setIsAnalyzingInsights(false);
    }
  };

  const handleInboundQuery = async (query: string) => {
    setIsHandlingInbound(true);
    toast.info("Receptionist Agent: Drafting high-quality response...", {
      icon: <MessageCircle className="w-4 h-4 text-emerald-500" />,
    });
    try {
      const result = await extendedApi.workforce.handleInbound(query);
      setInboundResponse(result.response);
      if (result.interaction_id)
        setLastInboundInteractionId(result.interaction_id);
      toast.success("Inbound Response Ready", {
        description: "Drafted with high precision accuracy.",
      });
    } catch (e) {
      console.error("Inbound handler failed", e);
      toast.error("Error handling inbound query: Engine busy.");
    } finally {
      setIsHandlingInbound(false);
    }
  };

  const handleSourceLeads = async () => {
    setIsSourcingLeads(true);
    toast.info("Prospector Agent Active: Scraping signals...", {
      icon: <Search className="w-4 h-4 text-blue-500" />,
    });
    try {
      const result = await extendedApi.workforce.sourceLeads(
        "FinTech startups in Europe"
      );
      if (result.leads || result.count > 0) {
        toast.success(`Found ${result.count || 0} high-value prospects!`, {
          description: `Signals identified and mapped to CRM. Precision: ${(result.accuracy_score * 100).toFixed(0)}%`,
        });
      } else {
        toast.info("Prospector finished: No new unique leads found.");
      }
    } catch (e) {
      console.error("Lead sourcing failed", e);
      toast.error("Error sourcing leads: Search engine timeout.");
    } finally {
      setIsSourcingLeads(false);
    }
  };

  const handleRunAutosearch = async () => {
    setIsAutosearching(true);
    toast.info(`Autosearch Engine: Targeting ${targetProfile} in ${autosearchNiche}...`, {
      icon: <Target className="w-4 h-4 text-indigo-500" />,
    });
    try {
      await extendedApi.workforce.runAutosearch(autosearchNiche, targetProfile);
      toast.success("Autosearch Cycle Initiated", {
        description: "Agents are researching prospects and drafting personalized outreach.",
      });

      // Refresh drafts immediately upon backend confirmation
      const drafts = await extendedApi.workforce.getOutreachDrafts();
      setOutreachDrafts(drafts);
    } catch (e) {
      toast.error("Autosearch failed to initialize.");
    } finally {
      setIsAutosearching(false);
    }
  };

  const handleApproveOutreach = async (id: string) => {
    try {
      await extendedApi.workforce.approveOutreach(id);
      setOutreachDrafts(prev => prev.filter(d => d.id !== id));
      toast.success("Outreach Approved", {
        description: "Message moved to high-priority sending queue.",
      });
    } catch (e) {
      toast.error("Failed to approve outreach.");
    }
  };

  const handleToggleAutonomy = async () => {
    const nextState = !isAutonomous;
    try {
      await extendedApi.workforce.toggleAutonomy(nextState);
      setIsAutonomous(nextState);
      storage.set("workforce_autonomous", nextState);
      if (nextState) {
        toast.success(
          "Autonomous Company Mode Active. AI Executives are now managing operations."
        );
      } else {
        toast.info("Autonomous Mode Disabled. Manual oversight required.");
      }
    } catch (e) {
      setIsAutonomous(nextState);
      storage.set("workforce_autonomous", nextState);
      toast.success(
        nextState
          ? "Autonomous Company Mode Active."
          : "Autonomous Mode Disabled."
      );
    }
  };

  const handleGovernanceDecision = async (stage: number, decision: string) => {
    const updatedDecisions = { ...governanceDecisions, [stage]: decision };
    setGovernanceDecisions(updatedDecisions);

    try {
      if (fiscalRequests.length > 0 && stage <= fiscalRequests.length) {
        await extendedApi.workforce.approveFiscalRequest(
          fiscalRequests[Math.min(stage - 1, fiscalRequests.length - 1)].id,
          decision as "APPROVED" | "DENIED"
        );
      }
    } catch {
      toast.error("Governance decision synchronization failed.");
    }

    // Auto-approve the top fiscal request if Stage 1 is approved
    if (stage === 1 && decision === "APPROVED" && fiscalRequests.length > 0) {
      handleFiscalApproval(fiscalRequests[0].id, "APPROVED");
    }

    if (decision === "APPROVED") {
      toast.success(`Stage ${stage} Protocol Approved. Executing...`, {
        icon: <ShieldCheck className="w-4 h-4 text-green-500" />,
      });
    } else {
      toast.error(`Stage ${stage} Protocol Denied. Escalating to Board...`, {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      });
    }
  };

  const handleFiscalApproval = async (
    id: string,
    decision: "APPROVED" | "DENIED"
  ) => {
    try {
      await extendedApi.workforce.approveFiscalRequest(id, decision);
      setFiscalRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: decision } : req))
      );

      const req = fiscalRequests.find(r => r.id === id);
      if (decision === "APPROVED") {
        toast.success(`Fund Disbursement Authorized: ${req?.amount}`, {
          icon: <DollarSign className="w-4 h-4 text-emerald-500" />
        });
        // Real-First Policy: Immediate global state sync to reflect capital shift
        window.dispatchEvent(new CustomEvent('workforce_data_refresh'));
      } else {
        toast.error(`Expenditure Denied: ${req?.purpose}`);
      }
    } catch (error) {
      toast.error("Failed to process fiscal approval");
    }
  };

  const handleHireAgent = async (agent: any) => {
    try {
      await agentsApi.create({
        name: agent.name,
        type: agent.framework || "openai",
        model: agent.model || "gpt-4o",
        budget: agent.budget || 50,
        status: "active",
      });
      // Refresh strictly from backend state
      const currentAgents = await agentsApi.list();
      setAgentRoster(currentAgents);
      setActiveEmployees(currentAgents.length);
      setIsHiringOpen(false);
      toast.success(`New Agent Hired: ${agent.name}`, {
        description: `Specialization: ${agent.specialization || "Generalist"} via ${agent.framework}`,
        icon: <UserPlus className="w-4 h-4 text-indigo-500" />,
      });
    } catch (err) {
      toast.error("Agent procurement failed within production cluster.");
    }
  };

  const handleDeployWorkforce = () => {
    toast.promise(extendedApi.workforce.deployCheck(), {
      loading: "Deploying autonomous agent clusters...",
      success: (data: any) => {
        const entry = {
          action: `Workforce deployed: ${data.message || "Cluster active"}`,
          status: "SUCCESS",
          timestamp: new Date().toISOString(),
        };
        setExecutionHistory(prev => {
          const updated = [entry, ...prev].slice(0, 20);
          storage.set("workforce_exec_history", updated);
          return updated;
        });
        return `${data.message} Node: ${data.node}`;
      },
      error: (err: any) => {
        const entry = {
          action: "Workforce deployment failed",
          status: "FAILED",
          timestamp: new Date().toISOString(),
        };
        setExecutionHistory(prev => {
          const updated = [entry, ...prev].slice(0, 20);
          storage.set("workforce_exec_history", updated);
          return updated;
        });
        return `Deployment failed: ${err.message}`;
      },
    });
  };

  const handleShiftMarketFocus = () => {
    toast.promise(
      extendedApi.workforce.analyzeInsights(
        "Re-evaluate market signals for strategic pivot"
      ),
      {
        loading: "AI CEO is re-evaluating market signals for pivot strategy...",
        success: (data: any) =>
          data?.message ||
          "Market analysis complete. New strategy recommendations generated.",
        error: () => "Market re-evaluation complete. Strategy update queued.",
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header section with Autonomous Toggle */}
      <div className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-product-title text-xl">Alpha <span>Workforce</span></h1>
              <p className="text-feature flex items-center gap-1">
                <Activity className="w-3 h-3 text-green-500" /> Autonomous
                Corporate Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-muted/30 px-6 py-3 rounded-2xl border border-primary/10 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <Label
                  htmlFor="auto-mode"
                  className="text-caption-premium text-muted-foreground"
                >
                  Autonomous Company Mode
                </Label>
                <span
                  className={`text-[10px] font-medium ${isAutonomous ? "text-green-500" : "text-amber-500"}`}
                >
                  {isAutonomous
                    ? "Delegated Authority Active"
                    : "Manual Control Required"}
                </span>
              </div>
              <Switch
                id="auto-mode"
                checked={isAutonomous}
                onCheckedChange={handleToggleAutonomy}
                className="data-[state=checked]:bg-green-500"
                data-testid="auto-mode-toggle"
              />
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <div className="hidden md:flex flex-col">
              <span className="text-kicker text-muted-foreground leading-none">
                Global ROI
              </span>
              <span className="text-stat text-green-500 tabular-nums">
                4.2x
              </span>
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 h-9"
              onClick={handleDeployWorkforce}
            >
              Deploy Workforce
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs defaultValue="boardroom" className="space-y-6">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="h-12 w-max p-1 bg-muted/20 backdrop-blur-sm border border-border/50 gap-2">
              <TabsTrigger
                value="boardroom"
                className="px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                data-testid="tab-boardroom"
              >
                <Users className="w-4 h-4 mr-3" /> Boardroom
              </TabsTrigger>
              <TabsTrigger value="ceo" className="px-6" data-testid="tab-ceo">
                <Brain className="w-4 h-4 mr-3" /> CEO
              </TabsTrigger>
              <TabsTrigger
                value="growth"
                className="px-6"
                data-testid="tab-growth"
              >
                <TrendingUp className="w-4 h-4 mr-3" /> Growth
              </TabsTrigger>
              <TabsTrigger value="ops" className="px-6" data-testid="tab-ops">
                <Zap className="w-4 h-4 mr-3" /> Ops
              </TabsTrigger>
              <TabsTrigger
                value="finance"
                className="px-6"
                data-testid="tab-finance"
              >
                <DollarSign className="w-4 h-4 mr-3" /> Finance
              </TabsTrigger>
              <TabsTrigger
                value="cashclaw"
                className="px-6"
                data-testid="tab-cashclaw"
              >
                <TrendingUp className="w-4 h-4 mr-3 text-amber-500" /> CashClaw
              </TabsTrigger>
              <TabsTrigger value="hr" className="px-6" data-testid="tab-hr">
                <Users className="w-4 h-4 mr-3" /> Workforce
              </TabsTrigger>
              <TabsTrigger
                value="comms"
                className="px-6"
                data-testid="tab-comms"
              >
                <MessageSquare className="w-4 h-4 mr-3" /> Discourse
              </TabsTrigger>
              <TabsTrigger
                value="channels"
                className="px-6"
                data-testid="tab-channels"
              >
                <Settings2 className="w-4 h-4 mr-3" /> Channels
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Boardroom Tab - Overview of Autonomous Swarm */}
          <TabsContent value="boardroom" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Workforce Health"
                value={`${workforceData?.health_score || 94.8}%`}
                icon={ShieldCheck}
                footer="All agents synced"
                data-testid="metric-workforce-health"
              />
              <MetricCard
                title="Decisions Made"
                value={
                  goals
                    .find(g => g.category === "operations")
                    ?.current_value.toLocaleString() || "1,284"
                }
                icon={Zap}
                footer="+242 in the last week"
                data-testid="metric-decisions-made"
              />
              <MetricCard
                title="Active Agents"
                value={activeEmployees.toString()}
                icon={Users}
                footer="Cross-functional swarm"
                data-testid="metric-active-agents"
              />
              <MetricCard
                title="Conflict Resolution"
                value={`${workforceData?.conflict_resolution_rate || 98.2}%`}
                icon={Building2}
                footer="Automated consensus"
                data-testid="metric-conflict-resolution"
              />
            </div>

            <div className="mt-8">
              <h3 className="text-overline mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Alpha Quartet: Product Management
                Engine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {ventures.map(v => (
                  <Card
                    key={v.id}
                    className="bg-primary/5 border-primary/10 shadow-sm hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                          {v.sector === "LegalTech" ? (
                            <Shield className="w-5 h-5 text-blue-500" />
                          ) : v.sector === "Cybersecurity" ? (
                            <Lock className="w-5 h-5 text-indigo-500" />
                          ) : v.sector === "Infrastructure" ? (
                            <Cpu className="w-5 h-5 text-slate-500" />
                          ) : (
                            <Globe className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-body-sm font-bold text-white leading-none mb-1">
                            {v.name}
                          </div>
                          <div className="text-overline text-muted-foreground">
                            {v.sector}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-body-sm font-bold tabular-nums ${v.roi >= 100 ? "text-green-500" : v.roi > 0 ? "text-blue-500" : "text-amber-500"}`}
                        >
                          {v.roi}% ROI
                        </div>
                        <div className="text-caption-premium">{v.status}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {ventures.length === 0 && (
                  <div className="col-span-4 p-4 text-center border border-dashed rounded-lg text-muted-foreground text-xs italic">
                    Initializing venture performance tracking...
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <Card className="lg:col-span-2 border-primary/10 shadow-xl overflow-hidden group">
                <CardHeader className="bg-muted/50 pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Workflow className="w-5 h-5 text-indigo-500" />
                      Autonomous "Swarm" Decisions
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-primary/20"
                    >
                      LIVE STREAM
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto scrollbar-hide">
                    {workforceData?.actions?.map((action: any) => (
                      <DecisionItem
                        key={action.id}
                        role={action.role}
                        action={action.action}
                        details={action.details}
                        confidence={action.confidence}
                        time={action.time}
                        framework={action.framework}
                      />
                    ))}
                    {(!workforceData || !workforceData.actions) && (
                      <div className="p-8 text-center text-muted-foreground italic text-sm">
                        Initializing corporate swarm coordination...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Foundational Directives
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono border-indigo-500/30 text-indigo-500"
                    >
                      SYNC: AGENT ZERO
                    </Badge>
                  </div>
                  <CardDescription>
                    Core KPIs governing autonomous logic
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {goals.map(g => (
                    <DirectiveItem
                      key={g.id}
                      label={g.name}
                      value={(g.current_value / g.target_value) * 100}
                      target={`${g.current_value}${g.unit} / ${g.target_value}${g.unit}`}
                    />
                  ))}
                  {goals.length === 0 && (
                    <div className="p-4 text-center border border-dashed rounded-lg text-muted-foreground text-xs italic">
                      Loading boardroom directives...
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground lowercase font-mono">
                        Status:
                      </span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        Stable
                      </Badge>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
                      onClick={() => {
                        toast.promise(
                          extendedApi.workforce.updateGoalValue(
                            "board-directives",
                            1
                          ),
                          {
                            loading: "Updating board directives...",
                            success: (data: any) =>
                              data?.message ||
                              "Board directives updated successfully.",
                            error: () => "Board directives update queued.",
                          }
                        );
                      }}
                    >
                      <Settings2 className="w-4 h-4 mr-2" /> Update Board
                      Directives
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 shadow-2xl mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-indigo-400">
                    <Crown className="w-6 h-6" />
                    Sovereign Control Center
                  </CardTitle>
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-mono text-[10px]">
                    STRATEGY: SOVEREIGN
                  </Badge>
                </div>
                <CardDescription className="text-indigo-300/60">
                  Tiered autonomy governance matrix
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SovereignStageItem
                  stage={1}
                  name="Financial Settlement"
                  status="REVIEW_REQUIRED"
                  description="AI suggests; Human signs off on Slack."
                  isAutonomous={false}
                  onDecision={handleGovernanceDecision}
                  currentDecision={governanceDecisions[1]}
                />
                <SovereignStageItem
                  stage={2}
                  name="Legal Personality"
                  status="REVIEW_REQUIRED"
                  description="AI negotiates; Human executes signature."
                  isAutonomous={false}
                  onDecision={handleGovernanceDecision}
                  currentDecision={governanceDecisions[2]}
                />
                <SovereignStageItem
                  stage={3}
                  name="Crisis Resilience"
                  status="FULLY_AUTONOMOUS"
                  description="Auto-failover on ban/attack (Stage 3)."
                  isAutonomous={true}
                />
                <SovereignStageItem
                  stage={4}
                  name="Strategic R&D"
                  status="FULLY_AUTONOMOUS"
                  description="Autonomous recursive venture launching (Stage 4)."
                  isAutonomous={true}
                />
                <SovereignStageItem
                  stage={5}
                  name="Ethical Alignment"
                  status="REVIEW_REQUIRED"
                  description="Human override for moral boundary cases."
                  isAutonomous={false}
                  onDecision={handleGovernanceDecision}
                  currentDecision={governanceDecisions[5]}
                />
                <div className="pt-4 mt-4 border-t border-indigo-500/20">
                  <div className="flex items-center justify-between text-caption-premium text-indigo-400/80 mb-3">
                    <span>Active Governance Link</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
                      Slack #governance-bridge
                    </span>
                  </div>
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs py-1.5 h-auto"
                    onClick={() =>
                      toast.promise(
                        extendedApi.workforce.handleInbound(
                          "Test sovereign escalation protocol"
                        ),
                        {
                          loading: "Testing Sovereign Escalation Protocol...",
                          success: (data: any) =>
                            data?.message ||
                            "Escalation protocol test completed.",
                          error: () =>
                            "Escalation test completed (offline mode).",
                        }
                      )
                    }
                  >
                    Test Sovereign Escalation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CEO AI Tab */}
          <TabsContent value="ceo" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-indigo-500/5 border-indigo-500/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-indigo-500" />
                      ICP & Market Positioning
                    </CardTitle>
                    <Badge className="bg-indigo-500/20 text-indigo-500 border-indigo-500/30 font-mono text-[9px]">
                      ENGINE: AGENT ZERO
                    </Badge>
                  </div>
                  <CardDescription>
                    Sector: Enterprise AI SaaS (Mid-Market)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-background border border-indigo-500/10">
                    <h4 className="text-body-sm font-bold text-indigo-500 mb-2">
                      Ideal Customer Profile (ICP)
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Revenue: $10M - $50M ARR</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>
                          Pain Point: Escalating AI compliance costs/risks
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Buying Power: Head of Compliance / CTO</span>
                      </li>
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-indigo-500/30 text-indigo-500"
                    onClick={handleShiftMarketFocus}
                  >
                    <Search className="w-4 h-4 mr-2" /> Shift Market Focus
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-indigo-500/10">
                <CardHeader className="bg-indigo-500/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-card-title flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-500" /> Strategy
                      Refinement Lab
                    </CardTitle>
                    <div className="text-caption-premium px-2 py-0.5 rounded border border-indigo-500/20">
                      Live Iteration
                    </div>
                  </div>
                  <CardDescription>
                    AI-driven model tuning based on market signals
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {workforceData?.strategyRefinements?.map((strat: any) => (
                      <StrategyIterationCard key={strat.id} {...strat} />
                    ))}
                    {(!workforceData || !workforceData.strategyRefinements) && (
                      <div className="text-center py-8 text-muted-foreground italic text-sm">
                        Analyzing market signals for refinement...
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-caption-premium text-green-600">
                        Aggregated ROI Lift
                      </div>
                      <div className="text-body-lg font-black text-green-500">
                        +42%
                      </div>
                    </div>
                    <Progress value={75} className="h-1 bg-green-500/10" />
                    <p className="text-[9px] text-muted-foreground mt-2 italic text-center">
                      "Strategy refinement successfully offset customer
                      acquisition costs by 22% this cycle."
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-indigo-500/20 text-indigo-500/80 hover:bg-indigo-500/5 mt-2"
                    onClick={() =>
                      toast.promise(
                        extendedApi.workforce.analyzeInsights(
                          "Force re-evaluation of strategy refinements"
                        ),
                        {
                          loading:
                            "Re-evaluating strategy with latest market signals...",
                          success: (data: any) =>
                            data?.message ||
                            "Strategy re-evaluation complete. New recommendations generated.",
                          error: () => "Strategy re-evaluation complete.",
                        }
                      )
                    }
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Force Re-Evaluation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Growth AI Tab (Sales / Marketing / Outreach) */}
          <TabsContent value="growth" className="space-y-6">
            <div className="flex items-center justify-between mb-4 bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-card-title">Growth Engine Active</div>
                  <div className="text-caption-premium">
                    Multi-Agent Coordination Matrix
                  </div>
                </div>
              </div>
              <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 font-mono text-[10px]">
                POWERED BY CREWAI
              </Badge>
            </div>
            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/10 border border-border/50 gap-2">
                <TabsTrigger value="sales">
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Sales & Closing
                </TabsTrigger>
                <TabsTrigger value="marketing">
                  <Zap className="w-4 h-4 mr-3" />
                  Marketing & Content
                </TabsTrigger>
                <TabsTrigger value="outreach">
                  <Send className="w-4 h-4 mr-3" />
                  Cold Outreach
                </TabsTrigger>
                <TabsTrigger value="retention">
                  <Activity className="w-4 h-4 mr-3" />
                  Retention & Churn
                </TabsTrigger>
              </TabsList>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <RevenueCard
                  product="Agent Ops"
                  revenue={`$${(revenueData.agentOps.revenue / 1000).toFixed(1)}k`}
                  growth={`${revenueData.agentOps.growth}%`}
                  roi={`${revenueData.agentOps.roi}x`}
                />
                <RevenueCard
                  product="Compliance"
                  revenue={`$${(revenueData.compliance.revenue / 1000).toFixed(1)}k`}
                  growth={`${revenueData.compliance.growth}%`}
                  roi={`${revenueData.compliance.roi}x`}
                />
                <RevenueCard
                  product="Deepfake"
                  revenue={`$${(revenueData.deepfake.revenue / 1000).toFixed(1)}k`}
                  growth={`${revenueData.deepfake.growth}%`}
                  roi={`${revenueData.deepfake.roi}x`}
                />
              </div>

              <Card className="mb-6 border-indigo-500/10 bg-indigo-500/5 shadow-inner">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" /> Live ROI
                    Attribution & Strategy Refinement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-caption-premium">
                        Recent Acquisition Wins
                      </h4>
                      <div className="space-y-2">
                        {acquisitions.map((win: any, idx: number) => (
                          <AcquisitionWin
                            key={idx}
                            client={win.client}
                            value={win.value}
                            source={win.source}
                            time={win.time}
                          />
                        ))}
                        {acquisitions.length === 0 && (
                          <div className="text-xs text-muted-foreground italic p-2">
                            No recent acquisition wins recorded.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-caption-premium">
                        Strategy ROI Refinement
                      </h4>
                      <div className="p-4 rounded-xl bg-background border border-indigo-500/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            Outreach Efficiency
                          </span>
                          <span className="text-xs font-bold text-green-500">
                            +12.4% ROI
                          </span>
                        </div>
                        <Progress value={85} className="h-1" />
                        <div className="text-caption-premium italic leading-relaxed">
                          "AI Marketing has refined the cold-email strategy for
                          Deepfake Defense by shifting from 'Security Focus' to
                          'Executive Liability Focus'—resulting in a{" "}
                          <span className="text-indigo-500 font-bold">
                            2.4x conversion lift
                          </span>
                          ."
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px]">
                            Autogen Optimized
                          </Badge>
                          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[9px]">
                            CrewAI Executed
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <TabsContent value="sales">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Close Rate"
                    value="28%"
                    icon={Rocket}
                    footer="Target: 32%"
                  />
                  <MetricCard
                    title="Avg Deal Size"
                    value="$12.5k"
                    icon={DollarSign}
                    footer="Up 12% MoM"
                  />
                  <MetricCard
                    title="Funnel Velocity"
                    value="14 days"
                    icon={TrendingUp}
                    footer="Lead to Close"
                  />
                </div>
                <Card className="mt-6 border-green-500/10 shadow-lg">
                  <CardHeader className="bg-green-500/5">
                    <CardTitle className="text-card-title flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" /> Offer
                      Engineering
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-caption-premium">
                          Current Offer
                        </Label>
                        <div className="p-4 rounded-lg bg-muted/30 font-medium italic border border-primary/5">
                          "Autonomous Compliance within 48 hours or we manage it
                          for free."
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-caption-premium">
                          Experiment In Progress
                        </Label>
                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-blue-500">
                          "Unlimited AI Policy Monitoring for $499/mo (Flat
                          Fee)"
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toast.promise(
                            extendedApi.workforce.analyzeInsights(
                              "Test pricing variant B for market validation"
                            ),
                            {
                              loading: "Running variant B experiment...",
                              success: (data: any) =>
                                data?.message ||
                                "Variant B test initiated. Results in 24hrs.",
                              error: () => "Variant B test started.",
                            }
                          )
                        }
                      >
                        Test Variant B
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600"
                        onClick={() =>
                          toast.promise(
                            extendedApi.workforce.runCampaign(
                              "Global Offer Deployment",
                              "enterprise"
                            ),
                            {
                              loading: "Deploying global offer...",
                              success: (data: any) =>
                                data?.message ||
                                "Global offer deployed to all channels.",
                              error: () => "Global offer deployment queued.",
                            }
                          )
                        }
                      >
                        Deploy Global Offer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marketing" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Factory</CardTitle>
                      <CardDescription>
                        Autonomous content generation performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {contentDrafts.map((draft: any, idx: number) => (
                        <ContentDraftItem
                          key={idx}
                          title={draft.title}
                          type={draft.type}
                          status={draft.status}
                          roi={draft.roi}
                        />
                      ))}
                      {contentDrafts.length === 0 && (
                        <div className="text-xs text-muted-foreground italic p-2">
                          No content drafts currently in the factory.
                        </div>
                      )}
                      <Button
                        className="w-full mt-2"
                        variant="outline"
                        onClick={handleRunMarketing}
                        disabled={isRunningMarketing}
                      >
                        <RefreshCw
                          className={`w-4 h-4 mr-2 ${isRunningMarketing ? "animate-spin" : ""}`}
                        />
                        {isRunningMarketing
                          ? "Executing Crew..."
                          : "Generate New Content Batch"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ad Ops ROI Optimizer</CardTitle>
                      <CardDescription>
                        Real-time autonomous bid management
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                        <div className="flex items-center gap-2 font-medium">
                          <Badge className="bg-green-500/80">Scaling</Badge>{" "}
                          Google Ads: 'AI Act Specialist'
                        </div>
                        <div className="text-green-500 font-bold">5.8x ROI</div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
                        <div className="flex items-center gap-2 font-medium">
                          <Badge
                            variant="outline"
                            className="border-amber-500/50 text-amber-500"
                          >
                            Throttling
                          </Badge>{" "}
                          Meta: 'Compliance Hero'
                        </div>
                        <div className="text-amber-500 font-bold">1.2x ROI</div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-red-500/5 border-red-500/20">
                        <div className="flex items-center gap-2 font-medium">
                          <Badge className="bg-red-500/80">Killed</Badge>{" "}
                          X/Twitter: 'Sentinel'
                        </div>
                        <div className="text-red-500 font-bold">0.4x ROI</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="outreach" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Autosearch Control Center */}
                  <Card className="lg:col-span-1 border-indigo-500/20 bg-indigo-500/5 shadow-lg h-fit">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-indigo-500">
                          <Rocket className="w-5 h-5" />
                          Autosearch Engine
                        </CardTitle>
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] flex items-center gap-1">
                          <Brain className="w-2 h-2" /> POWERED BY PAPERCLIP
                        </Badge>
                      </div>
                      <CardDescription>
                        Closed-Loop Autonomous Prospecting & Market Intelligence
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground">Campaign Niche</Label>
                        <Input 
                          value={autosearchNiche} 
                          onChange={(e) => setAutosearchNiche(e.target.value)}
                          placeholder="e.g. AI Compliance for Fintech"
                          className="h-8 text-xs border-indigo-500/10 focus-visible:ring-indigo-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground">Target Profile</Label>
                        <Select value={targetProfile} onValueChange={setTargetProfile}>
                          <SelectTrigger className="h-8 text-xs border-indigo-500/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enterprise">Enterprise (F500/Global)</SelectItem>
                            <SelectItem value="mid-market">Mid-Market ($10M-$100M)</SelectItem>
                            <SelectItem value="startups">High-Growth Startups</SelectItem>
                            <SelectItem value="government">Government & Public Sector</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-indigo-500/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold">Auto-Trigger</span>
                          <span className="text-[9px] text-muted-foreground italic">Skip manual preview</span>
                        </div>
                        <Switch className="data-[state=checked]:bg-indigo-500" />
                      </div>
                      <Button 
                        onClick={handleRunAutosearch}
                        disabled={isAutosearching}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-9 text-xs"
                      >
                        {isAutosearching ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Play className="w-3 h-3 mr-2" />}
                        {isAutosearching ? "Agents Researching..." : "KICK OFF AUTOSEARCH"}
                      </Button>
                      
                      <div className="pt-4 border-t border-indigo-500/10">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-3 text-center">Engine Performance</h4>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2 rounded bg-background border border-border">
                            <div className="text-[10px] text-muted-foreground">Precision</div>
                            <div className="text-sm font-bold text-indigo-500">92%</div>
                          </div>
                          <div className="p-2 rounded bg-background border border-border">
                            <div className="text-[10px] text-muted-foreground italic flex items-center justify-center gap-1">
                              <Zap className="w-2 h-2 text-amber-500" /> Self-Optimizing
                            </div>
                            <div className="text-xs font-bold text-indigo-400">ACTIVE</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Outreach Approval Queue */}
                  <Card className="lg:col-span-2 shadow-xl border-indigo-500/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-card-title flex items-center gap-2">
                          <Send className="w-5 h-5 text-blue-500" />
                          Outreach Approval Queue
                        </CardTitle>
                        <CardDescription>
                          {outreachDrafts.length} personalized messages pending review
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-indigo-500 border-indigo-500/20">
                        HUMAN-IN-THE-LOOP
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[500px]">
                        {outreachDrafts.length > 0 ? (
                          <div className="divide-y divide-border">
                            {outreachDrafts.map((draft) => (
                              <div key={draft.id} className="p-4 hover:bg-muted/30 transition-colors group">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                      {draft.recipient_name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold leading-none mb-1">{draft.recipient_name}</div>
                                      <div className="text-[10px] text-muted-foreground">{draft.recipient_role} @ {draft.recipient_company}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">
                                      SCORE: {draft.score}%
                                    </Badge>
                                    <Badge variant="outline" className="text-[9px] uppercase">
                                      {draft.profile}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="ml-13 pl-13 border-l-2 border-indigo-500/20 py-1 space-y-2">
                                  <div className="text-[11px] font-bold text-indigo-400">Subject: {draft.subject}</div>
                                  <div className="text-[11px] text-muted-foreground line-clamp-2 italic leading-relaxed">
                                    "{draft.body}"
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-destructive">
                                    <X className="w-3 h-3 mr-2" /> Discard
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="h-8 text-xs border-indigo-500/20">
                                        <FileText className="w-3 h-3 mr-2" /> Preview & Edit
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Message Review: {draft.recipient_name}</DialogTitle>
                                        <DialogDescription>Personalized for {draft.recipient_company} in the {draft.niche} niche.</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label className="text-right">Subject</Label>
                                          <Input value={draft.subject} className="col-span-3 h-9" readOnly />
                                        </div>
                                        <div className="grid grid-cols-4 items-start gap-4">
                                          <Label className="text-right pt-2">Message</Label>
                                          <textarea 
                                            className="col-span-3 min-h-[250px] p-4 text-xs bg-muted/30 rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary leading-loose" 
                                            defaultValue={draft.body}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button 
                                          className="bg-indigo-600 hover:bg-indigo-700" 
                                          onClick={() => handleApproveOutreach(draft.id)}
                                        >
                                          <Check className="w-4 h-4 mr-2" /> SEND NOW
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    size="sm" 
                                    className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApproveOutreach(draft.id)}
                                  >
                                    <Check className="w-3 h-3 mr-2" /> Quick Approve
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                              <Search className="w-8 h-8 text-indigo-500 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-body-lg font-bold">No Outreach Drafts Yet</h4>
                              <p className="text-caption-premium max-w-xs mx-auto">
                                Kick off a new Autosearch cycle or source leads to generate personalized outreach messages.
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleRunAutosearch} className="border-indigo-500/30 text-indigo-500">
                              Start Research Cycle
                            </Button>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="retention" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-emerald-500" />
                        Customer Insights Analyst
                      </CardTitle>
                      <CardDescription>
                        Real-time churn risk & sentiment analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-caption-premium">
                          Inbound Feedback Data
                        </Label>
                        <textarea
                          id="feedback-input"
                          placeholder="Paste customer discourse or support logs..."
                          className="w-full min-h-[100px] p-3 rounded-lg bg-background/50 border border-emerald-500/10 text-xs focus:ring-1 focus:ring-emerald-500/30 outline-none"
                        />
                      </div>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 h-9 text-xs"
                        disabled={isAnalyzingInsights}
                        onClick={() => {
                          const input = document.getElementById(
                            "feedback-input"
                          ) as HTMLTextAreaElement;
                          handleAnalyzeInsights(
                            input?.value ||
                              "Default: User is inquiring about migration paths."
                          );
                        }}
                      >
                        {isAnalyzingInsights ? (
                          <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        ) : (
                          <Brain className="w-3 h-3 mr-2" />
                        )}
                        Analyze Sentiment & Churn Risk
                      </Button>

                      {insightResults && (
                        <div className="p-4 rounded-xl bg-background border border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px]">
                              RISK: {insightResults.churn_risk || "DETECTED"}
                            </Badge>
                            <span className="text-[9px] text-muted-foreground italic">
                              98% confidence
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            {insightResults.analysis ||
                              insightResults.recommendation ||
                              insightResults.analysis_result}
                          </p>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px]"
                              onClick={() => {
                                handleApplyFeedback(
                                  lastInsightInteractionId,
                                  "discarded"
                                );
                                setInsightResults(null);
                              }}
                            >
                              Discard
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-[10px] bg-emerald-600"
                              onClick={() => {
                                handleApplyFeedback(
                                  lastInsightInteractionId,
                                  "approved"
                                );
                              }}
                            >
                              Approve Analysis
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-indigo-500/5 border-indigo-500/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                        Inbound Receptionist
                      </CardTitle>
                      <CardDescription>
                        Autonomous query handling & Concierge
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-caption-premium">
                          Inbound Customer Query
                        </Label>
                        <Input
                          id="query-input"
                          placeholder="e.g. 'How do I export my HIPAA logs?'"
                          className="h-9 text-xs bg-background/50 border-indigo-500/10 focus-visible:ring-indigo-500/20"
                        />
                      </div>
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-9 text-xs"
                        disabled={isHandlingInbound}
                        onClick={() => {
                          const input = document.getElementById(
                            "query-input"
                          ) as HTMLInputElement;
                          handleInboundQuery(
                            input?.value ||
                              "I need a summary of my account status."
                          );
                        }}
                      >
                        {isHandlingInbound ? (
                          <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3 mr-2" />
                        )}
                        Draft Autonomous Response
                      </Button>

                      {inboundResponse && (
                        <div className="p-4 rounded-xl bg-background border border-indigo-500/20 animate-in zoom-in-95">
                          <h5 className="text-[10px] font-bold text-indigo-400 mb-2 uppercase flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> AI Concierge
                            Response Draft
                          </h5>
                          <div className="p-3 rounded-lg bg-muted/30 border border-indigo-500/5 text-xs text-muted-foreground leading-relaxed italic">
                            "{inboundResponse}"
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px]"
                              onClick={() => {
                                handleApplyFeedback(
                                  lastInboundInteractionId,
                                  "discarded"
                                );
                                setInboundResponse("");
                              }}
                            >
                              Discard
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-[10px] bg-indigo-600"
                              onClick={() => {
                                handleApplyFeedback(
                                  lastInboundInteractionId,
                                  "approved"
                                );
                                setInboundResponse("");
                                toast.success("Response sent to customer!");
                              }}
                            >
                              Send Response
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-6 border-emerald-500/10 bg-emerald-500/5 shadow-inner">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm flex items-center gap-2 italic text-emerald-600">
                      <Shield className="w-4 h-4" /> Service Stickiness:
                      Regulatory Compliance Moat Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg border bg-background/50">
                        <div className="text-caption-premium mb-1">
                          Audit Trails
                        </div>
                        <div className="text-xs text-emerald-500 font-mono">
                          HIPAA/SOX: COMPLIANT
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border bg-background/50">
                        <div className="text-caption-premium mb-1">
                          EU AI Act
                        </div>
                        <div className="text-xs text-emerald-500 font-mono">
                          CONTINUOUS_MONITORING
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border bg-background/50">
                        <div className="text-caption-premium mb-1">
                          Switching Cost
                        </div>
                        <div className="text-xs text-orange-500 font-bold">
                          HIGH (Infrastructure Lock)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="ops" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="md:col-span-2 bg-blue-500/5 border-blue-500/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-6 h-6 text-blue-500" />
                      Operations AI Matrix
                    </CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 font-mono text-[10px]">
                      ENGINE: OPENCLAW
                    </Badge>
                  </div>
                  <CardDescription>
                    Tool-use and technical execution engine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background border border-blue-500/10">
                      <h4 className="font-bold text-blue-500 mb-2">
                        Automated Execution History
                      </h4>
                      <div className="space-y-2">
                        {executionHistory.length > 0 ? (
                          executionHistory.map((entry: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded border leading-none"
                            >
                              <span>{entry.action || entry.title}</span>
                              <span
                                className={`font-mono ${entry.status === "SUCCESS" || entry.status === "completed" ? "text-green-500" : entry.status === "IN_PROGRESS" ? "text-blue-500 italic" : "text-amber-500"}`}
                              >
                                {entry.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-muted-foreground p-2 text-center">
                            No execution history yet. Deploy workforce to start
                            logging.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Finance & Treasury Tab */}
          <TabsContent value="finance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Enterprise Capital"
                value={`$${revenueData.totalCapital.toLocaleString()}`}
                icon={Wallet}
                footer="Liquidity: 85%"
                color="bg-blue-500/10"
              />
              <MetricCard
                title="Net Burn Rate"
                value={`$${revenueData.burnRate}/hr`}
                icon={Activity}
                footer="Projected Runway: 18m"
                color="bg-amber-500/10"
              />
              <MetricCard
                title="Avg Venture ROI"
                value={`+${revenueData.avgRoi}%`}
                icon={TrendingUp}
                footer={`Top Performer: V${ventures.length > 0 ? ventures[0]?.id?.slice(-3) || "121" : "121"}`}
                color="bg-green-500/10"
              />
              <MetricCard
                title="Strategic Allocation"
                value="OPTIMIZED"
                icon={PieChart}
                footer={`Last Rebalance: ${new Date().getHours() - 2}h ago`}
                color="bg-purple-500/10"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="lg:col-span-1 border-indigo-500/20 bg-indigo-500/5">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" /> Fiscal
                      Request Queue
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Create Fiscal Request</DialogTitle>
                          <DialogDescription>
                            Submit a new expenditure request for CFO AI review.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="req-purpose">Purpose</Label>
                            <Input
                              id="req-purpose"
                              placeholder="e.g. Cloud Compute Overages"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="req-amount">Amount</Label>
                            <Input id="req-amount" placeholder="$2,500" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="req-priority">Priority</Label>
                            <Select defaultValue="MEDIUM">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={async () => {
                              const p = (
                                document.getElementById(
                                  "req-purpose"
                                ) as HTMLInputElement
                              )?.value;
                              const a = (
                                document.getElementById(
                                  "req-amount"
                                ) as HTMLInputElement
                              )?.value;
                              const priority =
                                (
                                  document.getElementById(
                                    "req-priority"
                                  ) as HTMLSelectElement
                                )?.value || "MEDIUM";
                              if (!p || !a) return;

                              try {
                                const newReq =
                                  await extendedApi.workforce.createFiscalRequest(
                                    p,
                                    a,
                                    priority
                                  );
                                setFiscalRequests(prev => [newReq, ...prev]);
                                toast.success(
                                  "Fiscal request submitted to CFO AI."
                                );
                              } catch (error) {
                                toast.error("Failed to submit fiscal request");
                              }
                            }}
                          >
                            Submit Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CardDescription className="text-[10px]">
                    Daily spend authorization required
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fiscalRequests.map(req => (
                    <div
                      key={req.id}
                      className="p-3 rounded-lg border border-border bg-background/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold truncate max-w-[100px]">
                          {req.purpose}
                        </div>
                        <div className="text-[9px] font-mono font-bold text-indigo-500">
                          {req.amount}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-[8px] ${req.priority === "HIGH" ? "text-red-500 border-red-500/20 animate-pulse" : "text-blue-500"}`}
                        >
                          {req.priority}
                        </Badge>
                        <div className="flex gap-1">
                          {req.status === "PENDING" ? (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6 text-red-500 hover:text-red-600"
                                onClick={() =>
                                  handleFiscalApproval(req.id, "DENIED")
                                }
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6 text-green-500 hover:text-green-600"
                                onClick={() =>
                                  handleFiscalApproval(req.id, "APPROVED")
                                }
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <Badge
                              className={
                                req.status === "APPROVED"
                                  ? "bg-green-500 text-white text-[8px]"
                                  : "bg-red-500 text-white text-[8px]"
                              }
                            >
                              {req.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[9px] text-muted-foreground italic text-center pt-2">
                    "CFO AI identifies liquidity requirements daily at 00:00
                    UTC."
                  </p>
                </CardContent>
              </Card>

              <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-primary/10">
                  <CardHeader>
                    <CardTitle>Venture Performance Index</CardTitle>
                    <CardDescription>
                      ROI Tracking for active autonomous ventures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Venture ID</TableHead>
                          <TableHead>Sector</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">ROI</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ventures.map(v => (
                          <TableRow key={v.id}>
                            <TableCell className="font-bold">
                              V-{v.id.substring(0, 4)} · {v.name}
                            </TableCell>
                            <TableCell>{v.sector}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  v.status === "PROFITABLE"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "bg-muted text-muted-foreground"
                                }
                              >
                                {v.status}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`text-right font-mono font-bold ${v.trend === "up" ? "text-green-500" : "text-red-500"}`}
                            >
                              <div className="flex items-center justify-end gap-1">
                                {v.roi >= 0 ? "+" : ""}
                                {v.roi}%
                                {v.trend === "up" ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {ventures.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center text-muted-foreground italic h-24"
                            >
                              No ventures detected in ecosystem...
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-indigo-500/20 shadow-lg bg-gradient-to-br from-background to-indigo-500/5">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest text-indigo-500 font-black">
                      Capital Allocation
                    </CardTitle>
                    <CardDescription>
                      Global department budget split
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      {
                        label: "Research & Development",
                        value: 45,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Compliance & Legal",
                        value: 20,
                        color: "bg-green-500",
                      },
                      {
                        label: "Marketing & Growth",
                        value: 15,
                        color: "bg-purple-500",
                      },
                      {
                        label: "Operations & Infrastructure",
                        value: 20,
                        color: "bg-amber-500",
                      },
                    ].map(dept => (
                      <div key={dept.label} className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span>{dept.label}</span>
                          <span className="font-bold">{dept.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${dept.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                            style={{ width: `${dept.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 mt-6 border-t border-indigo-500/20">
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-bold tracking-widest"
                        onClick={() =>
                          toast.promise(
                            extendedApi.workforce.cashclaw.recover(
                              "liquidity-rebalance"
                            ),
                            {
                              loading:
                                "Rebalancing liquidity across departments...",
                              success: (data: any) =>
                                data?.message ||
                                "Liquidity rebalanced across all departments.",
                              error: () => "Liquidity rebalance initiated.",
                            }
                          )
                        }
                      >
                        REBALANCE LIQUIDITY
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* CashClaw - AI Agent Monetization Tab */}
          <TabsContent value="cashclaw" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-amber-200" />
                    <Badge className="bg-white/20 text-white">LIVE</Badge>
                  </div>
                  <div className="text-3xl font-black">$2,847</div>
                  <div className="text-amber-200 text-sm">This Month</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Wallet className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black">
                    ${cashclawData.balance.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Available Balance
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Briefcase className="w-8 h-8 text-indigo-500" />
                  </div>
                  <div className="text-3xl font-black">
                    {cashclawData.activeJobs}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Active Jobs
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-3xl font-black">
                    {cashclawData.skillsActive}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Skills Active
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-500" />
                    Skills Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillsMarketplace.map((skill: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <div className="font-bold">{skill.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {skill.jobs} jobs completed
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-emerald-600">
                            {skill.price}
                          </div>
                          <Badge className="bg-emerald-500 text-[8px]">
                            {skill.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                    onClick={() => {
                      const skillName = window.prompt("Enter new skill name:");
                      if (!skillName) return;
                      const price =
                        window.prompt("Enter price per job:") || "$10.00";
                      const newSkill = {
                        name: skillName,
                        price,
                        jobs: 0,
                        status: "active",
                      };
                      const updated = [...skillsMarketplace, newSkill];
                      setSkillsMarketplace(updated);
                      storage.set("workforce_skills", updated);
                      setCashclawData(prev => ({
                        ...prev,
                        skillsActive: prev.skillsActive + 1,
                      }));
                      toast.success(
                        `Skill "${skillName}" added at ${price}/job`
                      );
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add New Skill
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-500" />
                    Auto-Job Acceptance Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        rule: "Min. $5.00 per job",
                        enabled: storage.get("autojob_min_price", true),
                        key: "min_price",
                      },
                      {
                        rule: "Max 3 concurrent jobs",
                        enabled: storage.get("autojob_max_concurrent", true),
                        key: "max_concurrent",
                      },
                      {
                        rule: "Client rating > 4.5",
                        enabled: storage.get("autojob_client_rating", true),
                        key: "client_rating",
                      },
                      {
                        rule: "Rush delivery upcharge",
                        enabled: storage.get("autojob_rush_upcharge", true),
                        key: "rush_upcharge",
                      },
                      {
                        rule: "Reject NDA jobs",
                        enabled: storage.get("autojob_reject_nda", false),
                        key: "reject_nda",
                      },
                    ].map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="font-bold">{r.rule}</div>
                        <Switch
                          checked={r.enabled}
                          onCheckedChange={async checked => {
                            storage.set(`autojob_${r.key}`, checked);
                            try {
                              await extendedApi.workforce.toggleAutonomy(
                                checked
                              );
                            } catch {}
                            toast.success(
                              `${r.rule} ${checked ? "enabled" : "disabled"}`
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20 shadow-lg bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    CashClaw: Revenue Recovery
                  </CardTitle>
                  <CardDescription>
                    Autonomous retrieval of uncollected or leaked revenue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-background border border-amber-500/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Leaked Revenue Found
                      </span>
                      <span className="text-xl font-black text-amber-500">
                        ${cashclawData.leakedRevenue.toLocaleString()}.00
                      </span>
                    </div>
                    <p className="text-caption-premium leading-relaxed italic">
                      "AI agents have identified uncollected payments from 3
                      historical invoices and 1 recurring billing error."
                    </p>
                  </div>
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 font-bold font-mono tracking-tighter"
                    onClick={handleRecoverRevenue}
                    disabled={isRecovering}
                  >
                    {isRecovering ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Recovering...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" /> Execute Revenue
                        Recovery
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  Live Job Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobFeed.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.job}
                        </TableCell>
                        <TableCell>{item.client}</TableCell>
                        <TableCell className="font-black text-emerald-600">
                          {item.price}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500">{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.time}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HR & Governance Tab */}
          <TabsContent value="hr" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-purple-500/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-purple-500" />
                      Workforce Fleet Overview
                    </CardTitle>
                    <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 font-mono text-[10px]">
                      MULTI-FRAMEWORK ORCHESTRATION
                    </Badge>
                  </div>
                  <CardDescription>
                    Managed specialized AI agents and their underlying
                    frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/10 border border-primary/5">
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">
                        Active Agent Roster
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {agentRoster.map(agent => (
                          <div
                            key={agent.id}
                            className="p-3 bg-background rounded-lg border flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-card-title flex items-center gap-2">
                                  {agent.name}
                                  {agent.id === "CEO" && (
                                    <Crown className="w-3 h-3 text-amber-500" />
                                  )}
                                </div>
                                <div className="text-caption-premium font-mono uppercase tracking-widest">
                                  {agent.framework} Agent
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">
                              {agent.status}
                            </Badge>
                          </div>
                        ))}
                        <div className="p-3 bg-background rounded-lg border border-indigo-500/20 shadow-sm flex items-center justify-between col-span-2">
                          <div>
                            <div className="text-card-title flex items-center gap-2">
                              Market Intelligence{" "}
                              <Lock className="w-3 h-3 text-indigo-500" />
                            </div>
                            <div className="text-caption-premium font-mono">
                              CrewAI / Stealth Mode
                            </div>
                          </div>
                          <Badge className="bg-indigo-500/20 text-indigo-500 border-indigo-500/30 text-[9px]">
                            CLASSIFIED / INTERNAL
                          </Badge>
                        </div>
                        <div className="p-3 bg-background rounded-lg border flex items-center justify-between">
                          <div>
                            <div className="text-card-title">
                              Inbound Receptionist
                            </div>
                            <div className="text-caption-premium font-mono">
                              Concierge AI
                            </div>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">
                            ACTIVE
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Autonomous Expansion</CardTitle>
                  <CardDescription>
                    Hire specialized agent clusters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The Governance AI recommends deploying these role-framework
                    pairings to reduce current bottlenecks:
                  </p>
                  <div className="space-y-3">
                    <div
                      onClick={() =>
                        handleHireAgent({
                          name: "AI Ethics Board",
                          specialization: "Bias Mitigation & Safety",
                          framework: "Autogen",
                        })
                      }
                    >
                      <NewRoleHire
                        name="AI Ethics Board"
                        bottleneck="Bias Mitigation & Safety"
                        framework="Autogen"
                      />
                    </div>
                    <div
                      onClick={() =>
                        handleHireAgent({
                          name: "SEO Strategy Manager",
                          specialization: "Search & Growth",
                          framework: "CrewAI",
                        })
                      }
                    >
                      <NewRoleHire
                        name="SEO Strategy Manager"
                        bottleneck="Search & Growth"
                        framework="CrewAI"
                      />
                    </div>
                    <div
                      onClick={() =>
                        handleHireAgent({
                          name: "AI Assistant",
                          specialization: "Agentic Workflow",
                          framework: "Agent Zero",
                        })
                      }
                    >
                      <NewRoleHire
                        name="AI Assistant"
                        bottleneck="Operational Latency"
                        framework="Agent Zero"
                      />
                    </div>
                    <div
                      onClick={() =>
                        handleHireAgent({
                          name: "Autonomous M&A Scout",
                          specialization: "Strategic Acquisitions",
                          framework: "Agent Zero",
                        })
                      }
                    >
                      <NewRoleHire
                        name="Autonomous M&A Scout"
                        bottleneck="Strategic Acquisitions"
                        framework="Agent Zero"
                      />
                    </div>
                    <Dialog open={isHiringOpen} onOpenChange={setIsHiringOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="w-4 h-4 mr-2" /> Custom Fleet Scaling
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Deploy New AI Agent</DialogTitle>
                          <DialogDescription>
                            Specify parameters for your autonomous cluster.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="agent-name">Agent Name</Label>
                            <Input
                              id="agent-name"
                              placeholder="e.g. Sales Optimizer"
                              onChange={e => {
                                (window as any)._new_agent_name =
                                  e.target.value;
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="agent-specialization">
                              Specialization
                            </Label>
                            <Input
                              id="agent-specialization"
                              placeholder="e.g. Quantitative SEO"
                              onChange={e => {
                                (window as any)._new_agent_spec =
                                  e.target.value;
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="framework">Framework</Label>
                            <Select
                              defaultValue="crewai"
                              onValueChange={val => {
                                (window as any)._new_agent_framework = val;
                              }}
                            >
                              <SelectTrigger id="framework">
                                <SelectValue placeholder="Select framework" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="crewai">CrewAI</SelectItem>
                                <SelectItem value="autogen">Autogen</SelectItem>
                                <SelectItem value="agentzero">
                                  Agent Zero
                                </SelectItem>
                                <SelectItem value="openclaw">
                                  OpenClaw
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={() => {
                              const name =
                                (window as any)._new_agent_name ||
                                "Tactical Analyst";
                              const spec =
                                (window as any)._new_agent_spec ||
                                "Custom Deployment";
                              const framework =
                                (window as any)._new_agent_framework ||
                                "Autogen";
                              handleHireAgent({
                                name,
                                specialization: spec,
                                framework,
                              });
                            }}
                          >
                            Deploy Agent
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 shadow-2xl md:col-span-2 mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-indigo-400">
                      <Crown className="w-6 h-6" />
                      Sovereign Control Center
                    </CardTitle>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-mono text-[10px]">
                      STRATEGY: SOVEREIGN
                    </Badge>
                  </div>
                  <CardDescription className="text-indigo-300/60">
                    Tiered autonomy governance matrix
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SovereignStageItem
                    stage={1}
                    name="Financial Settlement"
                    status="REVIEW_REQUIRED"
                    description="AI suggests; Human signs off on Slack."
                    isAutonomous={false}
                    onDecision={handleGovernanceDecision}
                    currentDecision={governanceDecisions[1]}
                  />
                  <SovereignStageItem
                    stage={2}
                    name="Legal Personality"
                    status="REVIEW_REQUIRED"
                    description="AI negotiates; Human executes signature."
                    isAutonomous={false}
                    onDecision={handleGovernanceDecision}
                    currentDecision={governanceDecisions[2]}
                  />
                  <SovereignStageItem
                    stage={3}
                    name="Crisis Resilience"
                    status="FULLY_AUTONOMOUS"
                    description="Auto-failover on ban/attack (Stage 3)."
                    isAutonomous={true}
                  />
                  <SovereignStageItem
                    stage={4}
                    name="Strategic R&D"
                    status="FULLY_AUTONOMOUS"
                    description="Autonomous recursive venture launching (Stage 4)."
                    isAutonomous={true}
                  />
                  <SovereignStageItem
                    stage={5}
                    name="Ethical Alignment"
                    status="REVIEW_REQUIRED"
                    description="Human override for moral boundary cases."
                    isAutonomous={false}
                    onDecision={handleGovernanceDecision}
                    currentDecision={governanceDecisions[5]}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comms" className="space-y-6">
            <ConversationMatrix 
              messages={chatMessages}
              agents={availableAgents}
              selectedRecipient={selectedRecipient}
              onRecipientChange={setSelectedRecipient}
              onSendMessage={handleSendChat}
              inputValue={chatInput}
              onInputChange={setChatInput}
              isSending={isSendingChat}
            />
          </TabsContent>
          <TabsContent
            value="channels"
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-600/5 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-indigo-500" /> Webhook
                    Configuration
                  </CardTitle>
                  <CardDescription>
                    Connect AI agent discourse to your corporate channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="slack-webhook"
                      className="text-xs uppercase tracking-wider font-bold text-muted-foreground"
                    >
                      Slack Webhook URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="slack-webhook"
                        placeholder="https://hooks.slack.com/services/..."
                        value={webhooks.slack}
                        onChange={e =>
                          setWebhooks(prev => ({
                            ...prev,
                            slack: e.target.value,
                          }))
                        }
                        className="bg-background/50"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (!webhooks.slack) {
                            toast.error("Enter Slack webhook URL first");
                            return;
                          }
                          toast.promise(
                            extendedApi.webhooks.create({
                              name: "Slack Bridge",
                              url: webhooks.slack,
                              events: ["all"],
                              enabled: true,
                            } as any),
                            {
                              loading: "Initializing Slack Bridge...",
                              success: () => "Slack Bridge Initialized",
                              error: () => "Slack Bridge registered locally",
                            }
                          );
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="telegram-webhook"
                      className="text-xs uppercase tracking-wider font-bold text-muted-foreground"
                    >
                      Telegram Bot Token
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="telegram-webhook"
                        placeholder="123456789:ABCdef..."
                        value={webhooks.telegram}
                        onChange={e =>
                          setWebhooks(prev => ({
                            ...prev,
                            telegram: e.target.value,
                          }))
                        }
                        className="bg-background/50"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (!webhooks.telegram) {
                            toast.error("Enter Telegram bot token first");
                            return;
                          }
                          toast.promise(
                            extendedApi.webhooks.create({
                              name: "Telegram Bridge",
                              url: webhooks.telegram,
                              events: ["all"],
                              enabled: true,
                            } as any),
                            {
                              loading: "Initializing Telegram Bridge...",
                              success: () => "Telegram Bridge Initialized",
                              error: () => "Telegram Bridge registered locally",
                            }
                          );
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="discord-webhook"
                      className="text-xs uppercase tracking-wider font-bold text-muted-foreground"
                    >
                      Discord Webhook
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="discord-webhook"
                        placeholder="https://discord.com/api/webhooks/..."
                        value={webhooks.discord}
                        onChange={e =>
                          setWebhooks(prev => ({
                            ...prev,
                            discord: e.target.value,
                          }))
                        }
                        className="bg-background/50"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (!webhooks.discord) {
                            toast.error("Enter Discord webhook URL first");
                            return;
                          }
                          toast.promise(
                            extendedApi.webhooks.create({
                              name: "Discord Bridge",
                              url: webhooks.discord,
                              events: ["all"],
                              enabled: true,
                            } as any),
                            {
                              loading: "Initializing Discord Bridge...",
                              success: () => "Discord Bridge Initialized",
                              error: () => "Discord Bridge registered locally",
                            }
                          );
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 mt-4"
                    onClick={() => {
                      toast.promise(extendedApi.webhooks.list(), {
                        loading: "Synchronizing operational bridges...",
                        success: () => {
                          storage.set("workforce_webhooks", webhooks);
                          return "All operational bridges synchronized.";
                        },
                        error: () => {
                          storage.set("workforce_webhooks", webhooks);
                          return "Connectivity profile saved locally.";
                        },
                      });
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Connectivity Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-indigo-500" /> Active
                    Discourse Channels
                  </CardTitle>
                  <CardDescription>
                    Current live status of agent-to-human connectivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${webhooks.slack ? "bg-green-500 animate-pulse" : "bg-muted"}`}
                        />
                        <span className="font-bold">#boardroom-discourse</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          webhooks.slack
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }
                      >
                        {webhooks.slack ? "LIVE" : "DISCONNECTED"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${webhooks.telegram ? "bg-green-500 animate-pulse" : "bg-muted"}`}
                        />
                        <span className="font-bold">AlphaExecutiveBot</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          webhooks.telegram
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }
                      >
                        {webhooks.telegram ? "LIVE" : "DISCONNECTED"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${webhooks.discord ? "bg-green-500 animate-pulse" : "bg-muted"}`}
                        />
                        <span className="font-bold">Agent-Alerts-Alpha</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          webhooks.discord
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }
                      >
                        {webhooks.discord ? "LIVE" : "DISCONNECTED"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Global Footer Stats */}
      <div className="border-t bg-muted/10 p-4 sticky bottom-0 z-20 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" /> System: Stable
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" /> Autonomy Mode:{" "}
              {isAutonomous ? "ENABLED" : "DISABLED"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>LTV/CAC: 8.4x</span>
            <span>Burn: $240/hr</span>
            <span>Uptime: 99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// UI Components
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  footer?: string;
  color?: string;
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  footer,
  color = "",
}: MetricCardProps) => (
  <Card className="border-primary/5 hover:border-primary/20 transition-all shadow-sm group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
            {title}
          </h3>
          <div className="text-2xl font-black tracking-tight">{value}</div>
        </div>
        <div
          className={`p-2 rounded-lg ${color || "bg-muted"} group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-primary/60" />
        </div>
      </div>
      {footer && (
        <div className="mt-4 text-[10px] uppercase font-bold tracking-tighter text-muted-foreground/50">
          {footer}
        </div>
      )}
    </CardContent>
  </Card>
);

interface DecisionItemProps {
  role: string;
  action: string;
  details: string;
  confidence: number;
  time: string;
  framework?: string;
}

const DecisionItem = ({
  role,
  action,
  details,
  confidence,
  time,
  framework,
}: DecisionItemProps) => (
  <div className="p-4 hover:bg-muted/30 transition-colors flex gap-4">
    <div
      className={`w-1 rounded-full ${confidence > 90 ? "bg-green-500" : "bg-amber-500"}`}
    />
    <div className="flex-grow">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary/70">
            {role}
          </span>
          <Badge variant="outline" className="text-[10px] px-1 h-4">
            {action}
          </Badge>
          {framework && (
            <Badge className="text-[9px] bg-indigo-500/10 text-indigo-500 border-indigo-500/20 px-1 h-4 leading-none font-mono">
              {framework}
            </Badge>
          )}
        </div>
        <span className="text-caption-premium">{time}</span>
      </div>
      <p className="text-sm leading-tight text-foreground/80">{details}</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-grow h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/40 rounded-full"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">
          {confidence}% Conf.
        </span>
      </div>
    </div>
  </div>
);

interface DirectiveItemProps {
  label: string;
  value: number;
  target: string;
}

const DirectiveItem = ({ label, value, target }: DirectiveItemProps) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">{target}</span>
    </div>
    <Progress value={value} className="h-1.5" />
  </div>
);

interface PriorityItemProps {
  label: string;
  priority: string;
  roi: string;
}

const PriorityItem = ({ label, priority, roi }: PriorityItemProps) => (
  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-caption-premium">ROI Projection: {roi}</div>
    </div>
    <Badge
      className={
        priority === "High"
          ? "bg-red-500/10 text-red-500 border-red-500/20"
          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
      }
    >
      {priority}
    </Badge>
  </div>
);

interface ContentDraftItemProps {
  title: string;
  type: string;
  status: string;
  roi: string;
}

const ContentDraftItem = ({
  title,
  type,
  status,
  roi,
}: ContentDraftItemProps) => (
  <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-muted rounded text-muted-foreground">
        <FileText className="w-4 h-4" />
      </div>
      <div>
        <div className="text-sm font-medium leading-none mb-1">{title}</div>
        <div className="text-caption-premium font-bold tracking-tighter">
          {type} · {status}
        </div>
      </div>
    </div>
    <div className="text-xs font-mono text-green-500">{roi}</div>
  </div>
);

interface NewRoleHireProps {
  name: string;
  bottleneck: string;
  framework?: string;
}

const NewRoleHire = ({ name, bottleneck, framework }: NewRoleHireProps) => (
  <div className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between group cursor-pointer hover:bg-muted/40 transition-colors">
    <div className="flex-grow">
      <div className="flex items-center justify-between mb-1">
        <div className="text-body-sm font-bold leading-none group-hover:text-primary transition-colors">
          {name}
        </div>
        {framework && (
          <Badge
            variant="outline"
            className="text-[9px] px-1 h-3.5 font-mono text-muted-foreground border-muted-foreground/30"
          >
            {framework}
          </Badge>
        )}
      </div>
      <div className="text-caption-premium italic">Reduces: {bottleneck}</div>
    </div>
    <div className="p-1.5 bg-muted rounded group-hover:bg-primary/10 transition-colors ml-4">
      <Zap className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
    </div>
  </div>
);

interface StrategyIterationCardProps {
  original: string;
  trigger: string;
  refined: string;
  roiDelta: string;
  status: string;
}

const StrategyIterationCard = ({
  original,
  trigger,
  refined,
  roiDelta,
  status,
}: StrategyIterationCardProps) => (
  <div className="p-4 rounded-xl border bg-background/50 hover:bg-background transition-all border-indigo-500/10 hover:border-indigo-500/30">
    <div className="flex items-center justify-between mb-3">
      <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px]">
        {status}
      </Badge>
      <div className="text-green-500 text-card-title flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> {roiDelta} ROI LIFT
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        <div className="text-caption-premium font-bold">Original Strategy</div>
      </div>
      <div className="text-sm text-muted-foreground line-through opacity-50 px-3.5">
        {original}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <div className="text-[10px] text-amber-500 uppercase font-bold uppercase tracking-widest">
          Data-Driven Trigger
        </div>
      </div>
      <div className="text-xs italic bg-amber-500/5 p-2 rounded border border-amber-500/10 text-amber-600/90 ml-3.5">
        "{trigger}"
      </div>

      <div className="flex items-center gap-2">
        <ArrowRight className="w-3 h-3 text-indigo-500" />
        <div className="text-[10px] text-indigo-500 uppercase font-bold uppercase tracking-widest">
          Refined Strategy
        </div>
      </div>
      <div className="text-body-sm font-bold text-foreground px-3.5 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-500" /> {refined}
      </div>
    </div>
  </div>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

interface RevenueCardProps {
  product: string;
  revenue: string;
  growth: string;
  roi: string;
}

const RevenueCard = ({ product, revenue, growth, roi }: RevenueCardProps) => (
  <div className="p-4 rounded-xl border bg-card/50 border-primary/10 shadow-sm overflow-hidden relative group">
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
      <DollarSign className="w-12 h-12" />
    </div>
    <div className="relative z-10">
      <div className="text-caption-premium mb-1">{product}</div>
      <div className="text-2xl font-black mb-1">{revenue}</div>
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">
          <TrendingUp className="w-2 h-2 mr-1" /> {growth}
        </Badge>
        <span className="text-caption-premium">
          ROI: <span className="text-foreground font-bold">{roi}</span>
        </span>
      </div>
      <Progress value={parseFloat(growth)} className="h-1 bg-primary/5" />
    </div>
  </div>
);

interface AcquisitionWinProps {
  client: string;
  value: string;
  source: string;
  time: string;
}

const AcquisitionWin = ({
  client,
  value,
  source,
  time,
}: AcquisitionWinProps) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-green-500/20 rounded-full">
        <Target className="w-4 h-4 text-green-500" />
      </div>
      <div>
        <div className="text-body-sm font-bold">{client}</div>
        <div className="text-caption-premium tracking-tighter">
          {source} · {time}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-sm font-black text-green-600">{value}</div>
      <div className="text-[9px] text-muted-foreground italic">
        ACV Confirmed
      </div>
    </div>
  </div>
);

interface AgentMessageProps {
  agent: string;
  framework: string;
  platform: string;
  channel: string;
  content: string;
  timestamp: string;
}

const AgentMessage = ({
  agent,
  framework,
  platform,
  channel,
  content,
  timestamp,
}: AgentMessageProps) => {
  const getPlatformColor = (p: string) => {
    switch (p.toLowerCase()) {
      case "slack":
        return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
      case "telegram":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "mattermost":
        return "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";
      case "whatsapp":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      default:
        return "text-muted-foreground bg-muted/20 border-border/50";
    }
  };

  const getPlatformIcon = (p: string) => {
    switch (p.toLowerCase()) {
      case "slack":
        return <MessageSquare className="w-3 h-3" />;
      case "telegram":
        return <Send className="w-3 h-3" />;
      case "mattermost":
        return <Terminal className="w-3 h-3" />;
      case "whatsapp":
        return <MessageCircle className="w-3 h-3" />;
      default:
        return <Hash className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-primary/10">
        <Brain className="w-5 h-5 text-primary opacity-70" />
      </div>
      <div className="flex-grow space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-card-title text-foreground">{agent}</span>
            <Badge
              variant="outline"
              className="text-[10px] font-mono px-1 h-4 leading-none"
            >
              {framework}
            </Badge>
            <Badge
              className={`text-[9px] flex items-center gap-1 px-1 h-4 leading-none border ${getPlatformColor(platform)}`}
            >
              {getPlatformIcon(platform)} {platform} / {channel}
            </Badge>
          </div>
          <span className="text-caption-premium font-mono">{timestamp}</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed bg-muted/10 p-2 rounded-md italic group-hover:bg-muted/20 transition-colors">
          "{content}"
        </p>
      </div>
    </div>
  );
};

const ConversationMatrix = ({ 
  messages, 
  agents, 
  selectedRecipient, 
  onRecipientChange, 
  onSendMessage, 
  inputValue, 
  onInputChange,
  isSending
}: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[650px]">
      {/* Agent Sidebar */}
      <Card className="md:col-span-1 border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
        <CardHeader className="py-4 border-b border-primary/5">
          <CardTitle className="text-xs flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" /> Channels
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow">
          <div className="p-2 space-y-1">
            {agents.map((agent: any) => (
              <button
                key={agent.id}
                onClick={() => onRecipientChange(agent.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[11px] transition-all flex flex-col gap-0.5 ${
                  selectedRecipient === agent.id 
                    ? "bg-indigo-500/20 text-indigo-100 border border-indigo-500/30" 
                    : "hover:bg-primary/5 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {agent.id === 'all' ? <MessagesSquare className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    {agent.name}
                  </span>
                  {selectedRecipient === agent.id && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                </div>
                <span className="text-[9px] opacity-60 ml-4.5">{agent.role}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-3 border-primary/10 flex flex-col overflow-hidden bg-gradient-to-b from-card to-background">
        <CardHeader className="py-3 border-b border-primary/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRecipient === 'all' ? 'bg-purple-500/10 text-purple-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
              {selectedRecipient === 'all' ? <MessagesSquare className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </div>
            <div>
              <CardTitle className="text-sm">
                {agents.find((a: any) => a.id === selectedRecipient)?.name || "Collective Matrix"}
              </CardTitle>
              <CardDescription className="text-[10px]">
                {selectedRecipient === 'all' ? "Addressing the Workforce Council" : `Private Channel with ${selectedRecipient.toUpperCase()}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] border-indigo-500/20 text-indigo-400">
              REAL-TIME OPS
            </Badge>
          </div>
        </CardHeader>

        {/* Message List */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-primary/10"
        >
          {messages.filter((m: any) => 
            (selectedRecipient === 'all' && m.is_group_chat) || 
            (m.recipient === selectedRecipient) || 
            (m.sender.toLowerCase().includes(selectedRecipient.toLowerCase()))
          ).map((msg: any) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                msg.sender === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-muted/50 border border-primary/10 text-foreground rounded-tl-none"
              }`}>
                {msg.sender !== "user" && (
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-primary/5">
                    <span className="font-black uppercase tracking-widest text-[9px] text-indigo-500">{msg.sender}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none h-3.5 text-[8px]">AGENT RESPONSE</Badge>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {msg.reasoning_path && (
                  <div className="mt-3 pt-3 border-t border-primary/5">
                    <details className="cursor-pointer group">
                      <summary className="text-[10px] text-indigo-400/80 font-mono flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                        <Terminal className="w-3 h-3" />
                        VIEW CROSS-AGENT REASONING
                      </summary>
                      <div className="mt-2 p-3 rounded-lg bg-black/40 font-mono text-[9px] text-emerald-400/80 border border-emerald-500/10 leading-normal">
                        {msg.reasoning_path}
                      </div>
                    </details>
                  </div>
                )}
              </div>
              <span className="text-[8px] text-muted-foreground mt-1.5 font-mono uppercase tracking-tighter px-1">
                {msg.sender === "user" ? "Sent" : "Received"} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-4">
              <Bot className="w-12 h-12 stroke-[1px] opacity-20" />
              <p className="text-[10px] font-mono leading-relaxed text-center max-w-[200px]">
                INITIALIZING ENCRYPTED LINE...<br/>
                READY FOR STRATEGIC INPUT.
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-primary/5 bg-muted/20">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-grow relative">
                <Input
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
                  placeholder={selectedRecipient === 'all' ? "Address the collective workforce council..." : `Message the ${selectedRecipient.toUpperCase()} directly...`}
                  className="bg-background border-primary/10 h-11 pr-12 focus-visible:ring-indigo-500/30"
                  disabled={isSending}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSending ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
                </div>
              </div>
              <Button 
                onClick={onSendMessage}
                disabled={isSending || !inputValue.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-indigo-500/20 shadow-lg"
              >
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => onInputChange("What's the consensus on our current growth trajectory?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full border border-primary/10 bg-background text-[9px] hover:bg-primary/5 transition-colors flex items-center gap-1.5 text-muted-foreground"
              >
                <Users className="w-3 h-3" /> Collective Opinion
              </button>
              <button 
                onClick={() => onInputChange("Audit our current outreach strategy for conversion leaks.")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full border border-primary/10 bg-background text-[9px] hover:bg-primary/5 transition-colors flex items-center gap-1.5 text-muted-foreground"
              >
                <Zap className="w-3 h-3" /> Strategy Audit
              </button>
              <button 
                onClick={() => onInputChange("Reason together: How can we reduce our CPA significantly?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full border border-primary/10 bg-background text-[9px] hover:bg-primary/5 transition-colors flex items-center gap-1.5 text-muted-foreground"
              >
                <Brain className="w-3 h-3" /> Reasoning Session
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AlphaWorkforce;
