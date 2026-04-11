import React from "react";
import { 
  PieChart, 
  Activity, 
  Users, 
  Target,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Brain
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export function RetentionSubsection() {
  const churnSignals = [
    { client: "Global-Fin-Node", risk: "Med", score: 45, reason: "API Latency spike in EU-West-1" },
    { client: "Alpha-Corp-V2", risk: "Low", score: 12, reason: "Expanding node footprint" },
    { client: "Beta-Legal-Systems", risk: "High", score: 82, reason: "Contract expiration in 14 days" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-2xl backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-emerald-500/10 to-transparent border-b border-emerald-500/10 py-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2 text-emerald-400 font-black text-xl">
              <PieChart className="w-6 h-6" /> Sentiment Analyst
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black uppercase tracking-tighter">
              AI CUSTOMER SUCCESS
            </Badge>
          </div>
          <CardDescription className="text-xs font-medium opacity-70">Real-time churn risk & natural language sentiment mapping.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Manual Sentiment Override</Label>
              <textarea
                placeholder="Paste raw customer feedback here for forensic analysis..."
                className="w-full min-h-[120px] p-4 text-xs font-medium bg-background border border-emerald-500/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 leading-relaxed shadow-inner"
              />
            </div>
            <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-emerald-500/20">
              Run NLP Sentiment Scan
            </Button>
          </div>

          <div className="pt-6 border-t border-emerald-500/10">
             <h4 className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-widest mb-4">Live Insights</h4>
             <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div className="flex items-center justify-between">
                   <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight flex items-center gap-1.5">
                      <Brain className="w-3 h-3" /> Churn Probability
                   </div>
                   <div className="text-sm font-black text-emerald-500">4.2% (Low)</div>
                </div>
                <Progress value={4.2} className="h-1 bg-emerald-500/10" />
                <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                  "High satisfaction detected in <span className="text-white font-bold">Deepfake Defense</span> users due to v4 launch. Renewal velocity is up 12%."
                </p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 shadow-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/10 py-6">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" /> At-Risk Accounts
          </CardTitle>
          <CardDescription className="text-xs font-medium opacity-60">High-priority accounts requiring proactive defense intervention.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {churnSignals.map((sig, i) => (
              <div key={i} className="p-6 hover:bg-muted/10 transition-all group flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${sig.risk === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : sig.risk === 'Med' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} border shadow-inner`}>
                      <Users className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="text-sm font-black">{sig.client}</div>
                      <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-0.5">{sig.reason}</div>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                   <Badge variant={sig.risk === 'High' ? 'destructive' : sig.risk === 'Med' ? 'secondary' : 'outline'} className={`text-[9px] font-black h-4 uppercase ${sig.risk === 'Low' ? 'text-emerald-500 border-emerald-500/20' : ''}`}>
                     {sig.risk} RISK
                   </Badge>
                   <div className={`text-base font-black ${sig.risk === 'High' ? 'text-red-500' : sig.risk === 'Med' ? 'text-amber-500' : 'text-emerald-500'}`}>{sig.score}%</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-muted/20 border-t border-border/10">
             <Button variant="outline" className="w-full h-10 font-bold text-xs border-border/50 bg-background hover:bg-muted/50">
               Generate Global Retention Report &rarr;
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
