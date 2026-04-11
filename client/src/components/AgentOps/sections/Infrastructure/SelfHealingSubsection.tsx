import React from "react";
import { 
  Zap, 
  RefreshCw,
  Settings,
  ShieldCheck,
  History
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SelfHealingSubsectionProps {
  selfHealingEvents: any[];
  healingConfig: any;
  onSelfHealingToggle: (type: string, enabled: boolean) => void;
}

export function SelfHealingSubsection({
  selfHealingEvents,
  healingConfig,
  onSelfHealingToggle,
}: SelfHealingSubsectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <History className="w-5 h-5 text-primary" />
                Auto-Recovery Ledger
              </CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">
                Recent autonomous healing events and service restorations.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selfHealingEvents.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground bg-background/20 rounded-2xl border border-dashed border-border/10">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-10" />
                  <p className="text-xs font-black uppercase tracking-widest opacity-40">System clusters currently stable. No recovery events.</p>
                </div>
              ) : (
                selfHealingEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-border/10 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-black flex items-center gap-2">
                          {event.type || 'Service Restoration'}
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] font-black h-4 px-1">RESOLVED</Badge>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                          {event.timestamp?.toLocaleString() || 'Just now'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-tight text-white/70">Latency Impact</div>
                      <div className="text-xs font-mono font-black text-emerald-500">-{event.latency_reduction || 250}ms</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-lg font-black text-primary">
               <Settings className="w-5 h-5" />
               Kernel Configuration
             </CardTitle>
             <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60">Set recovery autonomy levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-black">Auto-Restoration</Label>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Recover orphaned nodes</p>
              </div>
              <Switch 
                checked={healingConfig?.auto_healing_enabled} 
                onCheckedChange={(checked) => onSelfHealingToggle('auto_healing_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-black">Context Purification</Label>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Purge corrupt transient state</p>
              </div>
              <Switch 
                checked={healingConfig?.context_purification} 
                onCheckedChange={(checked) => onSelfHealingToggle('context_purification', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-black">Cluster Persistence</Label>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Enable hot-swap replicas</p>
              </div>
              <Switch 
                checked={healingConfig?.active} 
                onCheckedChange={(checked) => onSelfHealingToggle('active', checked)}
              />
            </div>

            <div className="pt-4 border-t border-border/10">
              <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-[0.2em] h-10 hover:bg-primary/10">
                <RefreshCw className="w-3 h-3 mr-2" />
                Reset Enclave Config
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
