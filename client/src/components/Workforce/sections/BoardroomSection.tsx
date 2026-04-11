import React from "react";
import { 
  Users, 
  ShieldCheck, 
  Zap, 
  Building2, 
  Cpu, 
  Workflow, 
  Settings2,
  Lock,
  Globe,
  Shield,
  Clock
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { MetricCard } from "../ui/MetricCard";
import { DecisionItem } from "../ui/DecisionItem";
import { DirectiveItem } from "../ui/DirectiveItem";
import { SovereignStageItem } from "../ui/SovereignStageItem";

interface BoardroomSectionProps {
  workforceData: any;
  goals: any[];
  executionHistory: any[];
  activeEmployees: number;
  ventures: any[];
  platformDecisions: Record<number, string>;
  onDecision: (stage: number, decision: string) => void;
}

export function BoardroomSection({
  workforceData,
  goals,
  executionHistory,
  activeEmployees,
  ventures,
  platformDecisions,
  onDecision
}: BoardroomSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Workforce Health"
          value={`${workforceData?.health_score || 100}%`}
          icon={ShieldCheck}
          footer={`${workforceData?.active_agents || activeEmployees} nodes in consensus`}
        />
        <MetricCard
          title="Decisions Made"
          value={
            goals
              .find(g => g.category === "operations")
              ?.current_value.toLocaleString() || "---"
          }
          icon={Zap}
          footer={`${executionHistory.length > 0 ? `+${executionHistory.length} recently` : "Pulse monitoring active"}`}
        />
        <MetricCard
          title="Active Agents"
          value={activeEmployees.toString()}
          icon={Users}
          footer="Strategic headcount"
        />
        <MetricCard
          title="Conflict Resolution"
          value={`${workforceData?.conflict_resolution_rate || 100}%`}
          icon={Building2}
          footer={`Consensus: ${workforceData?.actions?.length || 0} actions`}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-500" /> Alpha Quartet: Product Management Engine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {ventures.map(v => (
            <Card
              key={v.id}
              className="bg-indigo-500/5 border-indigo-500/10 shadow-sm hover:border-indigo-500/30 transition-all group"
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    {v.sector === "LegalTech" ? (
                      <Shield className="w-5 h-5" />
                    ) : v.sector === "Cybersecurity" ? (
                      <Lock className="w-5 h-5" />
                    ) : v.sector === "Infrastructure" ? (
                      <Cpu className="w-5 h-5" />
                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white leading-none mb-1 uppercase tracking-tight">
                      {v.name}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                      {v.sector}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-black tabular-nums ${v.roi >= 100 ? "text-emerald-500" : v.roi > 0 ? "text-blue-500" : "text-amber-500"}`}>
                    {v.roi}% ROI
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-40">{v.status}</div>
                </div>
              </CardContent>
            </Card>
          ))}
          {ventures.length === 0 && (
            <div className="col-span-4 p-12 text-center border border-dashed rounded-3xl border-border/50 text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-40 italic bg-muted/5">
              Initializing venture performance nodes...
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <Card className="lg:col-span-2 border-border/50 bg-card/50 shadow-2xl overflow-hidden backdrop-blur-md">
          <CardHeader className="bg-indigo-500/5 border-b border-border/10 py-6">
            <CardTitle className="text-xl font-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Workflow className="w-7 h-7 text-indigo-500" />
                Autonomous "Swarm" Decisions
              </div>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-indigo-500/30 text-indigo-400 px-3 h-6">
                LIVE STREAM
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs font-medium opacity-60">Observability of cross-agent consensus and execution logic.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto custom-scrollbar">
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
                <div className="p-20 text-center text-muted-foreground italic text-xs uppercase font-black tracking-widest opacity-20">
                   Waiting for swarm coordination...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-border/50 bg-card/50 shadow-xl overflow-hidden backdrop-blur-md">
            <CardHeader className="py-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                   Foundational Directives
                </CardTitle>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                   SYNC: AGENT ZERO
                </Badge>
              </div>
              <CardDescription className="text-[10px] font-medium opacity-60 uppercase tracking-widest mt-1">
                Core KPIs governing autonomous logic
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {goals.map(g => (
                <DirectiveItem
                  key={g.id}
                  label={g.name}
                  value={(g.current_value / g.target_value) * 100}
                  target={`${g.current_value}${g.unit} / ${g.target_value}${g.unit}`}
                />
              ))}
              {goals.length === 0 && (
                <div className="p-6 text-center border border-dashed rounded-2xl border-border/50 text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-30 italic">
                  Loading boardroom directives...
                </div>
              )}

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Cluster Health</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] px-3 h-6 uppercase tracking-widest">
                    Stable
                  </Badge>
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 font-black h-12 text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-600/30"
                  onClick={() => {
                    toast.promise(
                      extendedApi.workforce.updateGoalValue("board-directives", 1),
                      {
                        loading: "Updating board directives...",
                        success: "Board directives updated successfully.",
                        error: "Board directives update queued.",
                      }
                    );
                  }}
                >
                  <Settings2 className="w-5 h-5 mr-3" /> Update Board Directives
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20 shadow-2xl">
            <CardHeader className="py-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-indigo-400">
                  Sovereign Control
                </CardTitle>
                <div className="flex items-center gap-1">
                   <Clock className="w-3 h-3 text-indigo-400 animate-pulse" />
                   <span className="text-[9px] font-black uppercase opacity-60">STRATEGY: SOVEREIGN</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <SovereignStageItem
                stage={1}
                name="Capital Flow"
                status="Review Required"
                description="AI suggests; Human signs off on settlement."
                isAutonomous={false}
                currentDecision={platformDecisions[1]}
                onDecision={(s, d) => onDecision(s, d)}
              />
              <SovereignStageItem
                stage={2}
                name="Network Pivot"
                status="Autonomous"
                description="Auto-failover on infrastructure latency detection."
                isAutonomous={true}
              />
               <p className="text-[10px] text-indigo-300 opacity-40 italic leading-relaxed text-center px-4">
                 "Multi-stage bridge active. Final sign-off required for Stage 1 nodes."
               </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
