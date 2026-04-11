import React from "react";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewRoleHireProps {
  name: string;
  bottleneck: string;
  framework?: string;
}

export const NewRoleHire = ({ name, bottleneck, framework }: NewRoleHireProps) => (
  <div className="p-4 rounded-2xl border bg-card/50 border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 hover:border-indigo-500/20 transition-all shadow-lg hover:shadow-indigo-500/10">
    <div className="flex-grow space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
          {name}
        </div>
        {framework && (
          <Badge
            variant="outline"
            className="text-[9px] px-2 h-5 font-mono text-muted-foreground/60 border-white/10 group-hover:border-indigo-500/30 group-hover:text-indigo-300"
          >
            {framework}
          </Badge>
        )}
      </div>
      <div className="text-[10px] font-bold text-muted-foreground/40 italic uppercase tracking-tighter">
        Inhibits: {bottleneck}
      </div>
    </div>
    <div className="p-2.5 bg-muted/50 rounded-xl group-hover:bg-indigo-500/10 transition-all ml-4 border border-transparent group-hover:border-indigo-500/20 shadow-inner">
      <Zap className="w-4 h-4 text-muted-foreground/40 group-hover:text-indigo-400 group-hover:animate-pulse" />
    </div>
  </div>
);
