import React from "react";
import { TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StrategyIterationCardProps {
  original: string;
  trigger: string;
  refined: string;
  roiDelta: string;
  status: string;
}

export const StrategyIterationCard = ({
  original,
  trigger,
  refined,
  roiDelta,
  status,
}: StrategyIterationCardProps) => (
  <div className="p-5 rounded-3xl border bg-card/50 hover:bg-card transition-all border-indigo-500/10 hover:border-indigo-500/30 group shadow-lg hover:shadow-indigo-500/10 backdrop-blur-md">
    <div className="flex items-center justify-between mb-4">
      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/20 text-[9px] font-black uppercase tracking-widest px-2 h-5">
        {status}
      </Badge>
      <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5" /> {roiDelta} ROI LIFT
      </div>
    </div>
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Baseline Strategy</div>
        </div>
        <div className="text-xs text-muted-foreground/60 line-through px-3.5 italic">
          {original}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-400 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 opacity-10">
           <TrendingUp className="w-10 h-10 -rotate-12" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <div className="text-[10px] uppercase font-black tracking-widest leading-none">
            Market Signal Trigger
          </div>
        </div>
        <div className="text-xs italic font-medium leading-relaxed">
          "{trigger}"
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
          <div className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">
            Autonomous Pivot
          </div>
        </div>
        <div className="text-sm font-bold text-white pl-5 flex items-start gap-3 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" /> {refined}
        </div>
      </div>
    </div>
  </div>
);
