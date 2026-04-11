import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SovereignStageItemProps {
  stage: number;
  name: string;
  status: string;
  description: string;
  isAutonomous: boolean;
  onDecision?: (stage: number, decision: string) => void;
  currentDecision?: string;
}

export const SovereignStageItem = ({
  stage,
  name,
  status,
  description,
  isAutonomous,
  onDecision,
  currentDecision,
}: SovereignStageItemProps) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all group">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-inner ${
        isAutonomous 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5'
      }`}>
        {stage}
      </div>
      <div>
        <div className="flex items-center gap-2">
           <h4 className="text-sm font-black text-white">{name}</h4>
           <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest px-1.5 h-4 border-none ${
             isAutonomous ? 'text-emerald-500' : 'text-indigo-400'
           }`}>
             {status.replace(/_/g, ' ')}
           </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground opacity-60 italic">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {!isAutonomous && onDecision ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className={`h-7 px-3 text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 ${currentDecision === 'APPROVE' ? 'bg-emerald-500/20 border-emerald-500' : ''}`}
            onClick={() => onDecision(stage, "APPROVE")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`h-7 px-3 text-[9px] font-black uppercase tracking-widest border-red-500/20 text-red-500 hover:bg-red-500/10 ${currentDecision === 'REJECT' ? 'bg-red-500/20 border-red-500' : ''}`}
            onClick={() => onDecision(stage, "REJECT")}
          >
            Reject
          </Button>
        </div>
      ) : (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black px-2 h-6 uppercase tracking-widest">
           Enforced
        </Badge>
      )}
    </div>
  </div>
);
