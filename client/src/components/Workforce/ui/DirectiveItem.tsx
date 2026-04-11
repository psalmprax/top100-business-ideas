import React from "react";
import { Progress } from "@/components/ui/progress";

interface DirectiveItemProps {
  label: string;
  value: number;
  target: string;
}

export const DirectiveItem = ({ label, value, target }: DirectiveItemProps) => (
  <div className="space-y-2 group">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-indigo-400">
      <span>{label}</span>
      <span className="opacity-40">{target}</span>
    </div>
    <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner flex items-center">
       <div 
         className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out flex items-center justify-end px-0.5" 
         style={{ width: `${value}%` }}
       >
          <div className="w-1 h-1 bg-white rounded-full opacity-50" />
       </div>
    </div>
  </div>
);
