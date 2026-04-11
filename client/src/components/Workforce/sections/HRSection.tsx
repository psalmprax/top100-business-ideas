import React from "react";
import { 
  ShieldCheck, 
  Crown, 
  Briefcase, 
  Plus, 
  Lock,
  Cpu
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewRoleHire } from "../ui/NewRoleHire";
import { SovereignStageItem } from "../ui/SovereignStageItem";

interface HRSectionProps {
  agentRoster: any[];
  isHiringOpen: boolean;
  setIsHiringOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleHireAgent: (agent: any) => void;
  platformDecisions: any;
  handleGovernanceDecision: (stage: number, decision: string) => void;
}

export function HRSection({
  agentRoster,
  isHiringOpen,
  setIsHiringOpen,
  handleHireAgent,
  platformDecisions,
  handleGovernanceDecision
}: HRSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-purple-500/20 bg-purple-500/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
           <div className="absolute top-0 right-0 p-8 opacity-5 text-purple-500">
             <ShieldCheck className="w-40 h-40" />
           </div>
          <CardHeader className="bg-gradient-to-br from-purple-500/10 to-transparent border-b border-purple-500/10 py-6">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-purple-500" />
                Workforce Fleet Overview
              </CardTitle>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-black text-[9px] uppercase tracking-[0.2em] px-3 h-6">
                ORCHESTRATION: MULTI-FRAMEWORK
              </Badge>
            </div>
            <CardDescription className="text-xs font-medium opacity-60">
              High-fidelity monitoring of specialized AI agents and their underlying operational frameworks.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {agentRoster.map(agent => (
                <div
                  key={agent.id}
                  className="p-4 bg-background/80 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-muted/30 transition-all shadow-inner backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                      <Briefcase className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-2 group-hover:text-purple-400 transition-colors">
                        {agent.name}
                        {agent.id === "CEO" && (
                          <Crown className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        )}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">
                        {agent.framework} Node
                      </div>
                    </div>
                  </div>
                  <Badge className={`font-black tracking-widest text-[8px] px-2 h-5 uppercase border-none ${
                    agent.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {agent.status}
                  </Badge>
                </div>
              ))}
              <div className="p-4 bg-background/40 border border-dashed border-indigo-500/20 rounded-2xl flex items-center justify-between sm:col-span-2 group hover:border-indigo-500/40 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                      <Lock className="w-5 h-5 text-indigo-500" />
                   </div>
                   <div>
                     <div className="text-sm font-black text-white flex items-center gap-2">
                       Market Intelligence <Badge variant="outline" className="text-[8px] h-4 border-indigo-500/20 text-indigo-400 font-black tracking-widest px-1.5">STEALTH</Badge>
                     </div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">
                       CrewAI / Confidential Cluster
                     </div>
                   </div>
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[8px] font-black tracking-widest px-2 h-5">
                   ENCRYPTED
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/5 border-t border-white/5 py-4 px-6 flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">
             <span>Fleet Latency: 42ms</span>
             <span className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               Orchestrator Online
             </span>
          </CardFooter>
        </Card>

        <Card className="border-indigo-500/20 bg-indigo-500/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <CardHeader className="py-6 border-b border-indigo-500/10">
            <CardTitle className="text-xl font-black">Autonomous Expansion</CardTitle>
            <CardDescription className="text-xs font-medium opacity-60">
              Deploy specialized agent clusters to resolve operational bottlenecks identified by Governance AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-4">
              {[
                { name: "AI Ethics Board", bottleneck: "Bias Mitigation & Safety", framework: "Autogen" },
                { name: "SEO Strategy Manager", bottleneck: "Search & Growth", framework: "CrewAI" },
                { name: "AI Assistant", bottleneck: "Operational Latency", framework: "Agent Zero" },
                { name: "Autonomous M&A Scout", bottleneck: "Strategic Acquisitions", framework: "Agent Zero" },
              ].map((role, i) => (
                <div key={i} onClick={() => handleHireAgent({ ...role, specialization: role.bottleneck })}>
                   <NewRoleHire {...role} />
                </div>
              ))}
            </div>

            <Dialog open={isHiringOpen} onOpenChange={setIsHiringOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 h-14 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30 rounded-2xl">
                  <Plus className="w-5 h-5 mr-3" /> Custom Fleet Scaling
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-indigo-500/20 shadow-2xl">
                <DialogHeader className="border-b border-white/5 pb-4">
                  <DialogTitle className="text-xl font-black">Deploy New AI Agent</DialogTitle>
                  <DialogDescription className="text-xs uppercase tracking-widest text-indigo-400 mt-1">
                    Specify logic parameters for your autonomous cluster.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-8">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name" className="text-[10px] uppercase font-black tracking-widest opacity-60">Agent Designation</Label>
                    <Input
                      id="agent-name"
                      placeholder="e.g. Sales Optimizer"
                      className="h-11 bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-specialization" className="text-[10px] uppercase font-black tracking-widest opacity-60">Functional Specialization</Label>
                    <Input
                      id="agent-specialization"
                      placeholder="e.g. Quantitative SEO"
                      className="h-11 bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="framework" className="text-[10px] uppercase font-black tracking-widest opacity-60">Deployment Framework</Label>
                    <Select defaultValue="crewai">
                      <SelectTrigger id="framework" className="h-11 bg-white/5 border-white/10 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="crewai" className="text-xs font-bold text-white">CrewAI</SelectItem>
                        <SelectItem value="autogen" className="text-xs font-bold text-white">Autogen</SelectItem>
                        <SelectItem value="agentzero" className="text-xs font-bold text-white">Agent Zero</SelectItem>
                        <SelectItem value="openclaw" className="text-xs font-bold text-white">OpenClaw</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="bg-white/5 p-6 rounded-b-2xl border-t border-white/5">
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 rounded-xl"
                    onClick={() => {
                      const name = (document.getElementById("agent-name") as HTMLInputElement)?.value || "Tactical Analyst";
                      const spec = (document.getElementById("agent-specialization") as HTMLInputElement)?.value || "Custom Deployment";
                      const framework = (window as any)._new_agent_framework || "Autogen";
                      handleHireAgent({ name, specialization: spec, framework });
                    }}
                  >
                    Deploy Autonomous Cluster
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.1)] relative overflow-hidden backdrop-blur-xl border-t-indigo-500/50">
        <div className="absolute top-0 left-0 p-12 opacity-5 text-white">
           <Crown className="w-80 h-80" />
        </div>
        <CardHeader className="py-8 border-b border-white/5 px-8">
          <div className="flex items-center justify-between">
            <CardTitle className="scroll-m-20 text-3xl font-black tracking-tighter text-indigo-400 flex items-center gap-4">
              <Crown className="w-8 h-8 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
              Sovereign Control Center
            </CardTitle>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-black text-[10px] uppercase tracking-[0.3em] px-4 h-7">
              STRATEGY: SOVEREIGN
            </Badge>
          </div>
          <CardDescription className="text-xs font-medium opacity-60 text-indigo-300 mt-2">
            Tiered autonomy governance matrix. Scaling enterprise intelligence without sacrificing moral alignment or financial integrity.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-4 relative z-10">
          {[
            { stage: 1, name: "Financial Settlement", status: "REVIEW_REQUIRED", description: "AI suggests; Human signs off on Slack encrypted line.", isAutonomous: false },
            { stage: 2, name: "Legal Personality", status: "REVIEW_REQUIRED", description: "AI negotiates; Human executes cryptographic signature.", isAutonomous: false },
            { stage: 3, name: "Crisis Resilience", status: "FULLY_AUTONOMOUS", description: "Auto-failover on infrastructure attack or domain ban.", isAutonomous: true },
            { stage: 4, name: "Strategic R&D", status: "FULLY_AUTONOMOUS", description: "Autonomous recursive venture launching and validation.", isAutonomous: true },
            { stage: 5, name: "Ethical Alignment", status: "REVIEW_REQUIRED", description: "Human override for complex moral or cultural boundary cases.", isAutonomous: false },
          ].map((s, i) => (
             <SovereignStageItem
                key={i}
                {...s}
                onDecision={handleGovernanceDecision}
                currentDecision={platformDecisions[s.stage]}
             />
          ))}
        </CardContent>
        <CardFooter className="bg-white/5 p-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300/30">
           <span className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> AGENTIC STABILITY MESH: NOMINAL
           </span>
           <span className="opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity">
              Sovereign Protocol v4.2.0-Alpha
           </span>
        </CardFooter>
      </Card>
    </div>
  );
}
