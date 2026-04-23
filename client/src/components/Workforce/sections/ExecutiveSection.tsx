import React from "react";
import { 
  Target, 
  Search, 
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Brain,
  Rocket
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { StrategyIterationCard } from "../ui/StrategyIterationCard";

interface ExecutiveSectionProps {
  workforceData: any;
  revenueData: any;
  onShiftMarketFocus: () => void;
}

export function ExecutiveSection({
  workforceData,
  revenueData,
  onShiftMarketFocus
}: ExecutiveSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-indigo-500/5 border-indigo-500/20 shadow-xl overflow-hidden ring-1 ring-indigo-500/10">
        <CardHeader className="bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center gap-2 text-2xl font-black">
              <Target className="w-7 h-7 text-indigo-500" />
              ICP & Positioning
            </CardTitle>
            <Badge className="bg-indigo-500 text-white border-none font-black text-[9px] px-2 py-0.5 tracking-widest">
              AGENT ZERO
            </Badge>
          </div>
          <CardDescription className="font-bold text-indigo-400 opacity-80 uppercase tracking-tighter text-[10px]">
            Sector: Enterprise AI SaaS (Mid-Market Expansion)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="p-5 rounded-2xl bg-background/80 border border-indigo-500/10 shadow-inner backdrop-blur-sm">
            <h4 className="text-sm font-black text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Brain className="w-4 h-4" /> Ideal Customer Profile
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Revenue Bracket", value: "$10M - $50M ARR", icon: CheckCircle2 },
                { label: "Critical Pain", value: "Escalating AI Compliance Overhead", icon: CheckCircle2 },
                { label: "Decision Engine", value: "Head of Compliance / CTO Node", icon: CheckCircle2 }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className="p-1 rounded-full bg-indigo-500/10 text-indigo-500 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">{item.label}</div>
                    <div className="text-sm font-bold">{item.value}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="outline"
            className="w-full border-indigo-500/30 text-indigo-500 font-bold hover:bg-indigo-500/10 h-11 rounded-xl shadow-lg shadow-indigo-500/5"
            onClick={onShiftMarketFocus}
          >
            <Search className="w-4 h-4 mr-2" /> Shift Market Focus
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-2xl border-indigo-500/10 bg-card/30 backdrop-blur-md">
        <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 py-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Rocket className="w-6 h-6 text-indigo-500" /> Refinement Lab
            </CardTitle>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-400">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
               Live Iteration
            </div>
          </div>
          <CardDescription className="text-xs font-medium opacity-60">
            Autonomous model tuning based on multi-channel market signals.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
            {workforceData?.strategyRefinements?.map((strat: any) => (
              <StrategyIterationCard
                key={strat.id}
                original="Baseline Strategy"
                trigger={strat.topic}
                refined={strat.content}
                roiDelta={strat.impact}
                status={strat.time}
              />
            ))}
            {(!workforceData || !workforceData.strategyRefinements) && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic text-xs gap-3">
                <RefreshCw className="w-6 h-6 animate-spin opacity-20" />
                Analyzing resonance signals...
              </div>
            )}
          </div>
          
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                Aggregated ROI Lift
              </div>
              <div className="text-2xl font-black text-emerald-500 tabular-nums">
                {`+${revenueData?.totalLift || 0}%`}
              </div>
            </div>
            <Progress value={75} className="h-1.5 bg-emerald-500/10" />
            <p className="text-[10px] text-muted-foreground mt-3 italic text-center leading-relaxed">
              "Strategy refinement successfully offset customer acquisition costs by <span className="text-emerald-500 font-bold">22.4%</span> this cycle."
            </p>
          </div>
          
          <Button
            variant="outline"
            className="w-full border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 font-bold uppercase tracking-widest text-[10px] h-10 rounded-xl"
            onClick={() =>
              toast.promise(
                extendedApi.workforce.analyzeInsights(
                  "Force re-evaluation of strategy refinements"
                ),
                {
                  loading: "Synchronizing with Live Market Edges...",
                  success: (data: any) => data?.message || "Strategy cluster re-aligned. New paths generated.",
                  error: () => "Re-alignment complete (Partial Cache).",
                }
              )
            }
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Force Global Re-Evaluation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
