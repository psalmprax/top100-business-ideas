import React from "react";
import { Badge } from "@/components/ui/badge";

interface DecisionItemProps {
  role: string;
  action: string;
  details: string;
  confidence: number;
  time: string;
  framework?: string;
}

export const DecisionItem = ({
  role,
  action,
  details,
  confidence,
  time,
  framework,
}: DecisionItemProps) => (
  <div className="p-5 hover:bg-white/5 transition-all flex gap-5 border border-transparent hover:border-white/5 rounded-3xl group">
    <div
      className={`w-1.5 rounded-full transition-all duration-500 scale-y-75 group-hover:scale-y-100 ${confidence > 90 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"}`}
    />
    <div className="flex-grow space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
            {role}
          </span>
          <Badge variant="outline" className="text-[9px] px-2 h-5 font-black uppercase border-white/10 text-muted-foreground/60">
            {action}
          </Badge>
          {framework && (
            <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-2 h-5 font-mono">
              {framework}
            </Badge>
          )}
        </div>
        <span className="text-[10px] font-black font-mono text-muted-foreground/30 uppercase tracking-widest">{time}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-white/90 transition-colors font-medium">"{details}"</p>
      <div className="pt-2 flex items-center gap-4">
        <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="text-[9px] font-black font-mono text-muted-foreground/60 uppercase tracking-tighter w-16 text-right">
          {confidence}% CONF
        </span>
      </div>
    </div>
  </div>
);
