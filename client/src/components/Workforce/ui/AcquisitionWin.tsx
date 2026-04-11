import React from "react";
import { Target } from "lucide-react";

interface AcquisitionWinProps {
  client: string;
  value: string;
  source: string;
  time: string;
}

export const AcquisitionWin = ({
  client,
  value,
  source,
  time,
}: AcquisitionWinProps) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all group shadow-sm">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-500/20">
        <Target className="w-4 h-4 text-emerald-500 group-hover:text-inherit" />
      </div>
      <div>
        <div className="text-sm font-black text-white">{client}</div>
        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
          {source} &middot; {time}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-base font-black text-emerald-400">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
        ACV COMMITTED
      </div>
    </div>
  </div>
);
