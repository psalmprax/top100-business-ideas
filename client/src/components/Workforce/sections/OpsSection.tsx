import React from "react";
import { Zap, RefreshCw, BarChart2, ShieldCheck, Cpu } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OpsSectionProps {
  executionHistory: any[];
}

export function OpsSection({ executionHistory }: OpsSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-blue-500/5 border-blue-500/20 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500">
             <Cpu className="w-40 h-40" />
          </div>
          <CardHeader className="bg-gradient-to-br from-blue-500/10 to-transparent border-b border-blue-500/10 py-6">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Zap className="w-7 h-7 text-blue-500" />
                Operations AI Matrix
              </CardTitle>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-black text-[9px] uppercase tracking-widest px-3 h-6">
                ENGINE: OPENCLAW V2
              </Badge>
            </div>
            <CardDescription className="text-xs font-medium opacity-60">High-concurrency tool-use & autonomous technical execution orchestration.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-background/80 border border-blue-500/10 shadow-inner backdrop-blur-sm">
                <h4 className="text-[10px] font-black uppercase text-blue-400 mb-6 flex items-center gap-2 tracking-widest">
                  <BarChart2 className="w-4 h-4" /> Automated Execution Stream
                </h4>
                <div className="space-y-3 max-h-[500px] overflow-auto pr-2 custom-scrollbar">
                  {executionHistory.length > 0 ? (
                    executionHistory.map((entry: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-muted/20 border border-white/5 rounded-2xl group hover:bg-muted/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                           <div className={`p-1.5 rounded-lg border ${
                             entry.status === "SUCCESS" || entry.status === "completed" 
                               ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                               : entry.status === "IN_PROGRESS" 
                                 ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
                                 : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                           }`}>
                              {entry.status === "IN_PROGRESS" ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                           </div>
                           <span className="text-sm font-bold text-white/90">{entry.action || entry.title}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-black uppercase text-[8px] tracking-widest border-none ${
                            entry.status === "SUCCESS" || entry.status === "completed" 
                              ? "text-emerald-500" 
                              : entry.status === "IN_PROGRESS" 
                                ? "text-blue-500 animate-pulse" 
                                : "text-amber-500"
                          }`}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-[10px] text-muted-foreground uppercase font-black gap-4 border border-dashed rounded-3xl border-border/50">
                      <Zap className="w-8 h-8 opacity-10" />
                      Awaiting Operational Trigger...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
           <Card className="border-border/50 bg-card/50 shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/10 py-5">
                 <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-400" /> Continuity Node
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-400">
                       <span>Sync Integrity</span>
                       <span>99.9%</span>
                    </div>
                    <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[99.9%]" />
                    </div>
                 </div>
                 <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                   "Operations Matrix is currently performing <span className="text-white font-bold">continuous health checks</span> across all active agent clusters. No drift detected."
                 </p>
              </CardContent>
           </Card>
           
           <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-none shadow-2xl text-white">
              <CardContent className="p-8 space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Ops Capacity</h4>
                 <div className="text-5xl font-black tracking-tighter">84.2%</div>
                 <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                       <span>Parallel Threads</span>
                       <span>42 / 50</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] w-[84%]" />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
