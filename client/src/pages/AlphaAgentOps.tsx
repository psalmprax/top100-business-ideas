/**
 * Alpha Agent Ops - Enterprise Dashboard Orchestrator
 * Modularized architecture for observability and governance.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { usePerspective } from "../contexts/PerspectiveContext";
import { useAgentOps } from "../hooks/useAgentOps";
import {
  LayoutDashboard,
  Server,
  ShieldCheck,
  Zap,
  Brain,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OverviewSection } from "@/components/AgentOps/sections/OverviewSection";
import { AgentTableSection } from "@/components/AgentOps/sections/AgentTableSection";
import { IntelligenceHub } from "@/components/AgentOps/sections/IntelligenceHub";
import { BudgetSection } from "@/components/AgentOps/sections/BudgetSection";
import { AgentSettingsDialog } from "@/components/AgentOps/AgentSettingsDialog";
import { NewAgentDialog, WebhookDialog } from "@/components/AgentOps/Modals";
import { AuditTrailSubsection } from "@/components/AgentOps/sections/Governance/AuditTrailSubsection";
import { AlertsConfigSubsection } from "@/components/AgentOps/sections/Governance/AlertsConfigSubsection";
import { ComplianceStatusSubsection } from "@/components/AgentOps/sections/Governance/ComplianceStatusSubsection";
import { RegionalHealthSubsection } from "@/components/AgentOps/sections/Infrastructure/RegionalHealthSubsection";
import { SelfHealingSubsection } from "@/components/AgentOps/sections/Infrastructure/SelfHealingSubsection";
import { WebhooksSubsection } from "@/components/AgentOps/sections/Infrastructure/WebhooksSubsection";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Server,
  ShieldCheck,
  Zap,
  Brain,
};

export default function AlphaAgentOps() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { perspective } = usePerspective();
  const ops = useAgentOps();

  const [showWebhookDialog, setShowWebhookDialog] = useState(false);

  if (ops.isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <RefreshCw className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // Defensive defaults for category tabs
  const activeTabs =
    ops.categoryTabs[ops.activeCategory as keyof typeof ops.categoryTabs] || [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
      {/* Header & Navigation Category Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-primary" />
            Alpha Agent Ops
          </h1>
          <p className="text-muted-foreground mt-1">
            Autonomous governance for the agentic enterprise.
          </p>
        </div>

        <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50 backdrop-blur-md">
          {ops.categories.map(cat => {
            const Icon = ICON_MAP[cat.icon];
            const isActive = ops.activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  ops.setActiveCategory(cat.id as any);
                  const firstTab =
                    ops.categoryTabs[
                      cat.id as keyof typeof ops.categoryTabs
                    ][0];
                  ops.setActiveTab(firstTab);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Orchestration Tabs */}
      <Tabs
        value={ops.activeTab}
        onValueChange={ops.setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="bg-transparent border-b border-border/50 w-full justify-start rounded-none h-auto p-0 gap-8">
          {activeTabs.map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-sm font-bold capitalize tracking-wide transition-all"
            >
              {tab.replace("-", " ")}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {/* Core Category */}
          {ops.activeCategory === "core" && (
            <>
              <TabsContent value="overview">
                <OverviewSection
                  agents={ops.agents}
                  liveMetrics={ops.liveMetrics}
                  healingConfig={
                    ops.healingConfigs[0] || {
                      id: "default",
                      type: "system",
                      active: true,
                      auto_healing_enabled: true,
                    }
                  }
                  onSelfHealingToggle={ops.handleSelfHealingToggle}
                />
              </TabsContent>
              <TabsContent value="agents">
                <AgentTableSection
                  agents={ops.agents}
                  onToggleStatus={ops.toggleAgentStatus}
                  onOpenSettings={agent => {
                    ops.setSelectedAgent(agent);
                    ops.setShowSettingsDialog(true);
                  }}
                  onNewAgent={() => ops.setShowNewAgentDialog(true)}
                  onDecommission={ops.handleDecommissionAgent}
                  onInjectHint={ops.handleInjectHint}
                  onUpdateAssets={ops.handleUpdateAssets}
                  onConfigureStream={ops.handleConfigureStream}
                  onSync={ops.refreshData}
                />
              </TabsContent>
              <TabsContent value="budget">
                <BudgetSection
                  liveMetrics={ops.liveMetrics}
                  budgetRules={[]} // Map from ops if available
                />
              </TabsContent>
            </>
          )}

          {/* Infrastructure / Ops Category */}
          {ops.activeCategory === "ops" && (
            <>
              <TabsContent value="infrastructure">
                <RegionalHealthSubsection
                  multiCloudStatus={ops.multiCloudStatus}
                  clusterNodes={ops.clusterNodes}
                  onTriggerPanic={ops.handleTriggerPanic}
                  onSystemReset={ops.handleSystemReset}
                />
              </TabsContent>
              <TabsContent value="webhooks">
                <WebhooksSubsection
                  webhooks={ops.webhooks}
                  onRegisterWebhook={() => setShowWebhookDialog(true)}
                  onRefresh={ops.refreshData}
                />
              </TabsContent>
              <TabsContent value="on-prem">
                <div className="py-20 text-center text-muted-foreground bg-background/5 p-8 rounded-3xl border border-dashed border-border/20 flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="p-4 rounded-2xl bg-muted/30">
                    <ShieldCheck className="w-12 h-12 opacity-20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black tracking-tight">
                      On-Prem Enclave - Enterprise Roadmap
                    </p>
                    <p className="max-w-md mx-auto text-sm font-medium opacity-60">
                      Bare-metal and private cloud orchestration is currently in
                      private beta for Strategic tier accounts.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="font-black text-xs uppercase tracking-widest px-8"
                  >
                    Request Access
                  </Button>
                </div>
              </TabsContent>
            </>
          )}

          {/* Governance Category */}
          {ops.activeCategory === "gov" && (
            <>
              <TabsContent value="audit">
                <AuditTrailSubsection
                  auditLog={ops.auditLog}
                  auditSearchQuery={ops.auditSearchQuery}
                  setAuditSearchQuery={ops.setAuditSearchQuery}
                  auditFilterOutcome={ops.auditFilterOutcome}
                  setAuditFilterOutcome={ops.setAuditFilterOutcome}
                  onSync={ops.refreshData}
                />
              </TabsContent>
              <TabsContent value="alerts">
                <AlertsConfigSubsection
                  alertConfigs={ops.alertConfigs}
                  onToggleAlert={ops.toggleAlert}
                />
              </TabsContent>
              <TabsContent value="compliance">
                <ComplianceStatusSubsection
                  onRunHipaaAudit={() => ops.handleRunComplianceAudit("hipaa")}
                  onRunSoxAudit={() => ops.handleRunComplianceAudit("sox")}
                  complianceStatus={ops.complianceStatus}
                />
              </TabsContent>
              <TabsContent value="sla">
                <div className="py-20 text-center text-muted-foreground bg-background/5 p-8 rounded-3xl border border-dashed border-border/20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                  <ShieldCheck className="w-12 h-12 opacity-10" />
                  <h3 className="text-xl font-black">
                    SLA Oversight Module Under Migration
                  </h3>
                  <p className="text-sm font-medium opacity-60">
                    This module is being transitioned to the regional compliance
                    engine.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="sso">
                <div className="py-20 text-center text-muted-foreground bg-background/5 p-8 rounded-3xl border border-dashed border-border/20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                  <Server className="w-12 h-12 opacity-10" />
                  <h3 className="text-xl font-black">SSO Protocol Registry</h3>
                  <p className="text-sm font-medium opacity-60">
                    Access controlled by top-level security policy.
                  </p>
                </div>
              </TabsContent>
            </>
          )}

          {/* Intelligence Category */}
          {ops.activeCategory === "intelligence" && (
            <>
              <TabsContent value="paperclip">
                <IntelligenceHub
                  researchTopic={ops.researchTopic}
                  setResearchTopic={ops.setResearchTopic}
                  isResearching={ops.isResearching}
                  researchResult={ops.researchResult}
                  onRunResearch={ops.handlePaperclipResearch}
                  strategyPrompt={ops.strategyPrompt}
                  setStrategyPrompt={ops.setStrategyPrompt}
                  isGeneratingStrategy={ops.isGeneratingStrategy}
                  strategyResult={ops.strategyResult}
                  onGenerateStrategy={ops.handleHermesStrategy}
                  view="research"
                />
              </TabsContent>
              <TabsContent value="hermes">
                <IntelligenceHub
                  researchTopic={ops.researchTopic}
                  setResearchTopic={ops.setResearchTopic}
                  isResearching={ops.isResearching}
                  researchResult={ops.researchResult}
                  onRunResearch={ops.handlePaperclipResearch}
                  strategyPrompt={ops.strategyPrompt}
                  setStrategyPrompt={ops.setStrategyPrompt}
                  isGeneratingStrategy={ops.isGeneratingStrategy}
                  strategyResult={ops.strategyResult}
                  onGenerateStrategy={ops.handleHermesStrategy}
                  view="strategy"
                />
              </TabsContent>
            </>
          )}

          {/* Fallback for other categories/tabs */}
          {["advanced"].includes(ops.activeCategory) && (
            <div className="py-20 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed flex flex-col items-center justify-center gap-4">
              <Zap className="w-12 h-12 opacity-20" />
              <div>
                <p className="text-xl font-bold">
                  Advanced Orchestration - Enterprise Roadmap
                </p>
                <p className="max-w-md mx-auto mt-2">
                  Long-term ROI forecasting, advanced localization, and
                  autonomous venture modeling are planned for Q3 2026.
                </p>
              </div>
            </div>
          )}
        </div>
      </Tabs>

      {/* Modals */}
      <Dialog
        open={ops.showSettingsDialog}
        onOpenChange={ops.setShowSettingsDialog}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Agent Configuration & Context</DialogTitle>
            <DialogDescription>
              Fine-tune operational parameters and governance rules.
            </DialogDescription>
          </DialogHeader>
          {ops.selectedAgent && (
            <AgentSettingsDialog
              agent={ops.selectedAgent}
              onSave={ops.handleUpdateAgent}
              onOpenChange={ops.setShowSettingsDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      <NewAgentDialog
        open={ops.showNewAgentDialog}
        onOpenChange={ops.setShowNewAgentDialog}
        onSave={ops.handleCreateAgent}
      />

      <WebhookDialog
        open={showWebhookDialog}
        onOpenChange={setShowWebhookDialog}
        onSave={() => {
          setShowWebhookDialog(false);
          ops.refreshData();
        }}
      />
    </div>
  );
}
