import React from "react";
import { Badge } from "@/components/ui/badge";

interface PriorityItemProps {
  label: string;
  priority: string;
  roi: string;
}

export const PriorityItem = ({ label, priority, roi }: PriorityItemProps) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border bg-card/50 border-white/5 hover:border-white/10 transition-all group shadow-sm">
    <div>
      <div className="text-sm font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">{label}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">
        ROI Projection: <span className="text-emerald-500">{roi}</span>
      </div>
    </div>
    <Badge
      className={`font-black uppercase tracking-[0.2em] text-[8px] px-2 h-5 border-none ${
        priority === "High"
          ? "bg-red-500/10 text-red-400 animate-pulse"
          : "bg-blue-500/10 text-blue-400"
      }`}
    >
      {priority}
    </Badge>
  </div>
);
