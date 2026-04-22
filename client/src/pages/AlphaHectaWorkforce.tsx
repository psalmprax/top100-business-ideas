import React, { useState, useEffect } from "react";
import {
  Activity,
  Building2,
  Users,
  Brain,
  TrendingUp,
  Zap,
  DollarSign,
  MessageSquare,
  Settings2,
  Cpu,
  ShieldCheck,
  UserPlus,
  Target,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  extendedApi,
  workforceSync,
  setSimulationListener,
  WorkforceGoal,
  WorkforceVenture,
  WorkforceMessage,
  FiscalRequest,
} from "@/lib/api";
import { storage } from "@/lib/storage";
import { UserMenu } from "@/components/UserMenu";

// Modular Sections
import { CEOSection } from "@/components/Workforce/sections/CEOSection";
import { GrowthSection } from "@/components/Workforce/sections/GrowthSection";
import { BoardroomSection } from "@/components/Workforce/sections/BoardroomSection";
import { OpsSection } from "@/components/Workforce/sections/OpsSection";
import { FinanceSection } from "@/components/Workforce/sections/FinanceSection";
import { CashClawSection } from "@/components/Workforce/sections/CashClawSection";
import { HRSection } from "@/components/Workforce/sections/HRSection";
import { CommsSection } from "@/components/Workforce/sections/CommsSection";
import { MetricCard } from "@/components/Workforce/ui/MetricCard";

const AlphaHectaWorkforce = () => {
  const [isAutonomous, setIsAutonomous] = useState(
    storage.get("workforce_autonomous", false)
  );

  const [workforceData, setWorkforceData] = useState<any>(null);
  const [isHiringOpen, setIsHiringOpen] = useState(false);
  const [webhooks, setWebhooks] = useState({
    slack: "",
    telegram: "",
    discord: "",
  });
  const [platformDecisions, setPlatformDecisions] = useState<
    Record<number, string>
  >({});
  const [agentRoster, setAgentRoster] = useState<any[]>([]);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [fiscalRequests, setFiscalRequests] = useState<FiscalRequest[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);

  const [isRunningMarketing, setIsRunningMarketing] = useState(false);
  const [ventures, setVentures] = useState<WorkforceVenture[]>([]);
  const [goals, setGoals] = useState<WorkforceGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  const [autosearchNiche, setAutosearchNiche] = useState(
    "AI Compliance for Mid-Market"
  );
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
      setChatMessages(history.reverse());
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
        fetchedIntegrations,
      ] = await Promise.all([
        workforceSync(),
        extendedApi.workforce.getFiscalRequests(),
        extendedApi.workforce.getGoals(),
        extendedApi.workforce.getVentures(),
        extendedApi.agents.list(),
        extendedApi.workforce.getSkills(),
        extendedApi.workforce.getEarningsData(),
        extendedApi.workforce.getJobs(),
        extendedApi.workforce.getAcquisitions(),
        extendedApi.workforce.getContentDrafts(),
        extendedApi.workforce.getIntegrations(),
      ]);
      const decisionsData =
        await extendedApi.workforce.getGovernanceDecisions();
      const historyData = await extendedApi.workforce.getExecutionHistory();

      setWorkforceData(syncData);
      setFiscalRequests(fiscalReqs);
      setGoals(boardGoals);
      setVentures(businessVentures);
      setAgentRoster(currentAgents);
      setActiveEmployees(currentAgents.length);
      setSkillsMarketplace(skills);
      setJobFeed(jobs);
      setAcquisitions(winList || []);
      setContentDrafts(drafts || []);
      setCashclawData(earnings || {
        balance: 0,
        activeJobs: 0,
        skillsActive: 0,
        leakedRevenue: 0,
      });
      const decisionsMap: Record<number, string> = {};
      if (Array.isArray(decisionsData)) {
        decisionsData.forEach((d: any) => {
          decisionsMap[d.id] = d.status || d.decision;
        });
      }
      setPlatformDecisions(decisionsMap);
      setExecutionHistory(historyData || []);

      if (Array.isArray(fetchedIntegrations)) {
        setIntegrations(fetchedIntegrations);
        const slack =
          fetchedIntegrations.find((i: any) => i.type === "slack")?.url || "";
        const telegram =
          fetchedIntegrations.find((i: any) => i.type === "telegram")?.url ||
          "";
        const discord =
          fetchedIntegrations.find((i: any) => i.type === "discord")?.url || "";
        setWebhooks({ slack, telegram, discord });
      }

      const draftsData = await extendedApi.workforce.getOutreachDrafts();
      setOutreachDrafts(draftsData);

      if (earnings) {
        setRevenueData({
          agentOps: earnings.segments?.agentOps || {
            revenue: 0,
            growth: 0,
            roi: 0,
          },
          compliance: earnings.segments?.compliance || {
            revenue: 0,
            growth: 0,
            roi: 0,
          },
          deepfake: earnings.segments?.deepfake || {
            revenue: 0,
            growth: 0,
            roi: 0,
          },
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

  useEffect(() => {
    setSimulationListener(endpoint => {
      toast.warning(
        `RECOVERY-FIRST: Workforce service "${endpoint}" reported a connection drop. Activating local-first autonomous simulation.`,
        {
          description:
            "Your AlphaHecta Workforce agents are continuing work in autonomous sandbox mode.",
          duration: 8000,
        }
      );
    });

    fetchAllData();
    fetchChatHistory();
    fetchAgents();

    const handleRefresh = () => fetchAllData();
    window.addEventListener("workforce_data_refresh", handleRefresh);

    const chatInterval = setInterval(fetchChatHistory, 5000);
    const interval = setInterval(fetchAllData, 15000);
    return () => {
      window.removeEventListener("workforce_data_refresh", handleRefresh);
      clearInterval(interval);
      clearInterval(chatInterval);
    };
  }, []);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;

    const msg = chatInput;
    setChatInput("");
    setIsSendingChat(true);

    const tempId = `temp-${Date.now()}`;
    setChatMessages(prev => [
      ...prev,
      {
        id: tempId,
        sender: "user",
        recipient: selectedRecipient,
        content: msg,
        created_at: new Date().toISOString(),
        is_group_chat: selectedRecipient === "all",
      } as any,
    ]);

    try {
      const response = await extendedApi.workforce.sendMessage(
        msg,
        selectedRecipient
      );
      setChatMessages(prev => prev.map(m => (m.id === tempId ? response : m)));
      fetchAgents();
      toast.success(response.sender + " is responding", {
        icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
      });
    } catch (e) {
      toast.error("Agent communication failed.");
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleRecoverRevenue = async () => {
    toast.info("CashClaw Active: Detecting uncollected revenue...");
    try {
      const result =
        await extendedApi.workforce.cashclaw.recover("all_outstanding");
      const recovered = parseFloat(result.recovered_amount) || 0;
      setCashclawData((prev: any) => ({
        ...prev,
        balance: prev.balance + recovered,
        leakedRevenue: Math.max(0, prev.leakedRevenue - recovered),
      }));
      toast.success("Revenue Recovery Successful!", {
        description: `Recovered: ${result.recovered_amount}`,
      });
    } catch (e) {
      toast.error("Revenue Recovery Failed.");
    }
  };

  const handleRunMarketing = async () => {
    setIsRunningMarketing(true);
    toast.info("Marketing Crew Kicked Off...", {
      icon: <Brain className="w-4 h-4 text-purple-500" />,
    });
    try {
      const result = await extendedApi.workforce.runCampaign(
        "AI Compliance Blitz",
        "Financial Services SMBs"
      );
      toast.success("Marketing Campaign Complete!");
    } catch (e) {
      toast.error("Marketing crew failed");
    } finally {
      setIsRunningMarketing(false);
    }
  };

  const handleRunAutosearch = async () => {
    setIsAutosearching(true);
    toast.info(`Autosearch Engine: Targeting ${targetProfile}...`, {
      icon: <Target className="w-4 h-4 text-indigo-500" />,
    });
    try {
      await extendedApi.workforce.runAutosearch(autosearchNiche, targetProfile);
      toast.success("Autosearch Cycle Initiated");
      const drafts = await extendedApi.workforce.getOutreachDrafts();
      setOutreachDrafts(drafts);
    } catch (e) {
      toast.error("Autosearch failed.");
    } finally {
      setIsAutosearching(false);
    }
  };

  const handleApproveOutreach = async (id: string) => {
    try {
      await extendedApi.workforce.approveOutreach(id);
      setOutreachDrafts(prev => prev.filter(d => d.id !== id));
      toast.success("Outreach Approved");
    } catch (e) {
      toast.error("Failed to approve outreach.");
    }
  };

  const handleToggleAutonomy = async () => {
    const nextState = !isAutonomous;
    try {
      await extendedApi.workforce.toggleAutonomy(
        nextState ? "full" : "partial"
      );
      setIsAutonomous(nextState);
      storage.set("workforce_autonomous", nextState);
    } catch (e) {
      setIsAutonomous(nextState);
      storage.set("workforce_autonomous", nextState);
    }
  };

  const handleGovernanceDecision = async (stage: number, decision: string) => {
    setPlatformDecisions(prev => ({ ...prev, [stage]: decision }));
    try {
      if (fiscalRequests.length > 0 && stage <= fiscalRequests.length) {
        await extendedApi.workforce.approveFiscalRequest(
          fiscalRequests[Math.min(stage - 1, fiscalRequests.length - 1)].id,
          decision as "APPROVED" | "DENIED"
        );
      }
    } catch {
      toast.error("Governance synchronisation failed.");
    }
  };

  const handleHireAgent = async (agent: any) => {
    try {
      await extendedApi.agents.create({
        name: agent.name,
        type: agent.framework || "openai",
        model: agent.model || "gpt-4o",
        budget: agent.budget || 50,
        status: "active",
      });
      fetchAllData();
      setIsHiringOpen(false);
      toast.success(`New Agent Hired: ${agent.name}`);
    } catch (err) {
      toast.error("Agent procurement failed.");
    }
  };

  const handleDeployWorkforce = () => {
    toast.promise(extendedApi.workforce.deployCheck(), {
      loading: "Deploying autonomous agent clusters...",
      success: "Workforce deployed successfully.",
      error: "Deployment failed.",
    });
  };

  const handleShiftMarketFocus = () => {
    toast.promise(
      extendedApi.workforce.analyzeInsights("Re-evaluate market signals"),
      {
        loading: "AI CEO is re-evaluating...",
        success: "Market analysis complete.",
        error: "Market re-evaluation failed.",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            Syncing AlphaHecta Workforce Node...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter">
                Alpha <span className="text-indigo-400">Workforce</span>
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3 h-3 text-green-500" /> Autonomous
                Corporate Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-muted/30 px-6 py-3 rounded-2xl border border-primary/10 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <Label
                  htmlFor="auto-mode"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  Autonomous Mode
                </Label>
                <span
                  className={`text-[9px] font-bold ${isAutonomous ? "text-green-500" : "text-amber-500"}`}
                >
                  {isAutonomous ? "Delegated Active" : "Manual Required"}
                </span>
              </div>
              <Switch
                id="auto-mode"
                checked={isAutonomous}
                onCheckedChange={handleToggleAutonomy}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">
                Global ROI
              </span>
              <span className="text-lg font-black text-green-500 tabular-nums">
                {revenueData?.avgRoi
                  ? `${revenueData.avgRoi.toFixed(1)}x`
                  : "---x"}
              </span>
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 h-9 font-black uppercase text-[10px] tracking-widest px-6"
              onClick={handleDeployWorkforce}
            >
              Deploy Swarm
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs defaultValue="boardroom" className="space-y-6">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="h-14 w-max p-1.5 bg-muted/10 backdrop-blur-xl border border-white/5 gap-2 rounded-2xl">
              {[
                { value: "boardroom", label: "Boardroom", icon: Users },
                { value: "ceo", label: "CEO", icon: Brain },
                { value: "growth", label: "Growth", icon: TrendingUp },
                { value: "ops", label: "Ops", icon: Zap },
                { value: "finance", label: "Finance", icon: DollarSign },
                {
                  value: "cashclaw",
                  label: "CashClaw",
                  icon: TrendingUp,
                  color: "text-amber-500",
                },
                { value: "hr", label: "Workforce", icon: Users },
                { value: "comms", label: "Discourse", icon: MessageSquare },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="px-6 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all"
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${tab.color || ""}`} />{" "}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="boardroom">
            <BoardroomSection
              workforceData={workforceData}
              goals={goals}
              executionHistory={executionHistory}
              activeEmployees={activeEmployees}
              ventures={ventures}
              platformDecisions={platformDecisions}
              onDecision={handleGovernanceDecision}
            />
          </TabsContent>

          <TabsContent value="ceo">
            <CEOSection
              workforceData={workforceData}
              revenueData={revenueData}
              onShiftMarketFocus={handleShiftMarketFocus}
            />
          </TabsContent>

          <TabsContent value="growth">
            <GrowthSection
              revenueData={revenueData}
              acquisitions={acquisitions}
              contentDrafts={contentDrafts}
              autosearchNiche={autosearchNiche}
              setAutosearchNiche={setAutosearchNiche}
              targetProfile={targetProfile}
              setTargetProfile={setTargetProfile}
              isAutosearching={isAutosearching}
              outreachDrafts={outreachDrafts}
              handleRunMarketing={handleRunMarketing}
              handleRunAutosearch={handleRunAutosearch}
              handleApproveOutreach={handleApproveOutreach}
              handleShiftMarketFocus={handleShiftMarketFocus}
              isRunningMarketing={isRunningMarketing}
            />
          </TabsContent>

          <TabsContent value="ops">
            <OpsSection executionHistory={executionHistory} />
          </TabsContent>

          <TabsContent value="finance">
            <FinanceSection
              revenueData={revenueData}
              fiscalRequests={fiscalRequests}
              setFiscalRequests={setFiscalRequests}
              ventures={ventures}
              onFiscalApproval={(id: string, status: string) =>
                handleGovernanceDecision(1, status)
              }
              MetricCard={MetricCard}
            />
          </TabsContent>

          <TabsContent value="cashclaw">
            <CashClawSection
              cashclawData={cashclawData}
              setCashclawData={setCashclawData}
              skillsMarketplace={skillsMarketplace}
              setSkillsMarketplace={setSkillsMarketplace}
              jobFeed={jobFeed}
              isRecovering={false}
              onRecoverRevenue={handleRecoverRevenue}
            />
          </TabsContent>

          <TabsContent value="hr">
            <HRSection
              agentRoster={agentRoster}
              isHiringOpen={isHiringOpen}
              setIsHiringOpen={setIsHiringOpen}
              handleHireAgent={handleHireAgent}
              platformDecisions={platformDecisions}
              handleGovernanceDecision={handleGovernanceDecision}
            />
          </TabsContent>

          <TabsContent value="comms">
            <CommsSection
              chatMessages={chatMessages}
              availableAgents={availableAgents}
              selectedRecipient={selectedRecipient}
              setSelectedRecipient={setSelectedRecipient}
              handleSendChat={handleSendChat}
              chatInput={chatInput}
              setChatInput={setChatInput}
              isSendingChat={isSendingChat}
              webhooks={webhooks}
              setWebhooks={setWebhooks}
              integrations={integrations}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AlphaHectaWorkforce;
