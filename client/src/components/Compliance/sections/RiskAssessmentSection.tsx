import React from "react";
import { 
  ShieldAlert, 
  BarChart2, 
  ShieldCheck, 
  Zap, 
  Shield, 
  AlertTriangle,
  Flame,
  Fingerprint
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
import { Progress } from "@/components/ui/progress";

export function RiskAssessmentSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aggregate Risk Score</span>
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-500">24 / 100</div>
            <div className="text-[10px] text-muted-foreground mt-1">Status: <span className="text-emerald-400 font-bold uppercase">NOMINAL</span></div>
            <Progress value={24} className="h-1.5 mt-4 bg-emerald-500/10" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Threats</span>
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-orange-500">02</div>
            <div className="text-[10px] text-muted-foreground mt-1">Tier 1: <span className="text-white font-bold">0</span> &middot; Tier 2: <span className="text-white font-bold">2</span></div>
            <div className="flex gap-1 mt-4">
              <div className="h-1.5 w-1/3 bg-orange-500 rounded-full" />
              <div className="h-1.5 w-1/3 bg-orange-500/30 rounded-full" />
              <div className="h-1.5 w-1/3 bg-orange-500/30 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Compliance Drift</span>
              <Fingerprint className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-black">0.8%</div>
            <div className="text-[10px] text-muted-foreground mt-1">Target: <span className="text-primary font-bold">&lt; 1%</span></div>
            <Progress value={80} className="h-1.5 mt-4" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Vulnerability Surface Analysis
              </CardTitle>
              <CardDescription>Real-time threat modeling across agentic neural paths.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="h-8 text-[10px] border-border/50">
              Run Deep Scan
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: "Internal Neural PII Leakage", risk: "Low", score: 12, trend: "down" },
                { label: "External API Authentication Drift", risk: "Med", score: 45, trend: "stable" },
                { label: "Regional Data Sovereignty Escape", risk: "Low", score: 8, trend: "down" },
                { label: "Agentic Decision Hallucination", risk: "High", score: 72, trend: "up" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <div className="text-sm font-bold flex items-center gap-2">
                      {item.label}
                      <Badge variant={item.risk === 'High' ? 'destructive' : 'secondary'} className="text-[8px] h-3.5 px-1 uppercase">
                        {item.risk}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Neural path vulnerability score: <span className="text-white">{item.score}/100</span></div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                       <div className={`h-full ${item.risk === 'High' ? 'bg-red-500' : item.risk === 'Med' ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${item.score}%` }} />
                     </div>
                     <Zap className={`w-3 h-3 ${item.trend === 'up' ? 'text-red-500' : item.trend === 'down' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Mitigation Status
            </CardTitle>
            <CardDescription>Automated defensive protocols.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
               {[
                 { label: "IP Anonymization", active: true },
                 { label: "AES-Encrypted Buffer", active: true },
                 { label: "Rate Limiting (L4-L7)", active: true },
                 { label: "Neural Firewall v2", active: false }
               ].map(m => (
                 <div key={m.label} className="p-3 rounded-xl border border-border/50 bg-background/30 flex items-center justify-between group hover:border-primary/30 transition-all">
                    <span className="text-xs font-bold">{m.label}</span>
                    <Badge variant={m.active ? "outline" : "secondary"} className={`text-[9px] h-4 ${m.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'opacity-40'}`}>
                      {m.active ? "ENGAGED" : "PENDING"}
                    </Badge>
                 </div>
               ))}
            </div>
            <Button className="w-full text-xs font-black uppercase tracking-widest mt-4 group">
               Deploy Mitigation Shield
               <Shield className="w-3.5 h-3.5 ml-2 group-hover:scale-110 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
