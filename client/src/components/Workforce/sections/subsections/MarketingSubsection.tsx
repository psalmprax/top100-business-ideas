import React from "react";
import { 
  Zap, 
  BarChart2, 
  RefreshCw,
  Search
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentDraftItem } from "../../ui/ContentDraftItem";

interface MarketingSubsectionProps {
  contentDrafts: any[];
  isRunningMarketing: boolean;
  onRunMarketing: () => void;
}

export function MarketingSubsection({
  contentDrafts,
  isRunningMarketing,
  onRunMarketing,
}: MarketingSubsectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/50 shadow-xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-purple-500/5 border-b border-border/10 py-6">
             <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Content Factory
                </CardTitle>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Queue: 12 Drafts</span>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 mb-2">Pending AI Drafts</h4>
              <div className="space-y-2 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {contentDrafts.map((draft: any, idx: number) => (
                  <ContentDraftItem
                    key={idx}
                    title={draft.title}
                    type={draft.type}
                    status={draft.status}
                    roi={draft.roi}
                  />
                ))}
                {contentDrafts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-[10px] text-muted-foreground uppercase font-bold gap-3 border border-dashed rounded-3xl border-border/50">
                    <RefreshCw className="w-6 h-6 opacity-10" />
                    Neural Draft Engine Stalled...
                  </div>
                )}
              </div>
              <Button
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-600/20"
                onClick={onRunMarketing}
                disabled={isRunningMarketing}
              >
                {isRunningMarketing ? (
                  < RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Generate Next Batch
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-xl overflow-hidden">
          <CardHeader className="bg-indigo-500/5 border-b border-border/10 py-6">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
               <BarChart2 className="w-5 h-5" /> Ad Ops Optimizer
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4 shadow-inner">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. CAC Savings</span>
                  <span className="text-sm font-black text-emerald-400">-32.4%</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[68%]" />
               </div>
               <p className="text-[10px] italic leading-relaxed text-muted-foreground opacity-80 pl-4 border-l-2 border-indigo-500/20">
                 "Optimizer agents have auto-redacted <span className="text-white font-bold">4 underperforming ad sets</span> and transitioned budget to 'High-Intent' lookalikes."
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border/50 text-center">
                 <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">CTR LIFT</div>
                 <div className="text-xl font-black text-white">+4.2%</div>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border/50 text-center">
                 <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">ROAS NODE</div>
                 <div className="text-xl font-black text-white">12.4x</div>
              </div>
            </div>

            <Button variant="outline" className="w-full h-11 border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-widest hover:bg-indigo-500/10 transition-all">
              <Search className="w-4 h-4 mr-2" /> Audit Conversion Chain
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
