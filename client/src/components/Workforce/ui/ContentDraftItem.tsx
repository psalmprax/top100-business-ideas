import React from "react";
import { FileText } from "lucide-react";

interface ContentDraftItemProps {
  title: string;
  type: string;
  status: string;
  roi: string;
}

export const ContentDraftItem = ({
  title,
  type,
  status,
  roi,
}: ContentDraftItemProps) => (
  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-muted/50 rounded-xl text-muted-foreground/60 transition-all group-hover:bg-indigo-500/10 group-hover:text-indigo-400 border border-transparent group-hover:border-indigo-500/20 shadow-inner">
        <FileText className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{title}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-0.5">
          {type} Node &middot; {status}
        </div>
      </div>
    </div>
    <div className="text-right">
       <div className="text-sm font-black text-emerald-500 tabular-nums">{roi}</div>
       <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20">Proforma ROI</div>
    </div>
  </div>
);
