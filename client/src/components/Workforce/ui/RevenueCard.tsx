import React from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RevenueCardProps {
  product: string;
  revenue: string;
  growth: string;
  roi: string;
}

export const RevenueCard = ({ product, revenue, growth, roi }: RevenueCardProps) => (
  <div className="p-6 rounded-3xl border bg-card/40 border-primary/10 shadow-xl overflow-hidden relative group backdrop-blur-md">
    <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 text-white">
      <DollarSign className="w-24 h-24" />
    </div>
    <div className="relative z-10 space-y-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{product}</div>
      <div className="flex items-baseline gap-2">
         <div className="text-4xl font-black tracking-tighter text-white">{revenue}</div>
         <div className="text-xs font-bold text-muted-foreground/40 uppercase">USD</div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black px-2 py-0.5 h-6">
          <TrendingUp className="w-3 h-3 mr-1.5" /> {growth}
        </Badge>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          ROI: <span className="text-white ml-1">{roi}</span>
        </span>
      </div>
      <div className="space-y-1.5 pt-2">
         <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">
            <span>Growth Target</span>
            <span>{growth} / 100%</span>
         </div>
         <Progress value={parseFloat(growth)} className="h-1 bg-white/5" />
      </div>
    </div>
  </div>
);
