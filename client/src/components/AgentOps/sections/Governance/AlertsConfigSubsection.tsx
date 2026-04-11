import React from "react";
import { 
  Bell, 
  Key,
  ShieldOff,
  Activity
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
import { AlertConfig } from "../../types";

interface AlertsConfigSubsectionProps {
  alertConfigs: AlertConfig[];
  onToggleAlert: (id: string) => void;
}

export function AlertsConfigSubsection({
  alertConfigs,
  onToggleAlert,
}: AlertsConfigSubsectionProps) {
  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <Bell className="w-5 h-5 text-primary" />
                Active Governance Triggers
              </CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">
                Configure autonomous response protocols and safety thresholds.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alertConfigs.length === 0 ? (
               <div className="col-span-full py-12 text-center text-muted-foreground bg-background/20 rounded-xl border border-dashed border-border/50">
                 <ShieldOff className="w-10 h-10 mx-auto mb-3 opacity-20" />
                 <p className="text-xs font-black uppercase tracking-widest">No active alerts configured for this cluster.</p>
               </div>
            ) : (
              alertConfigs.map(alert => (
                <div 
                  key={alert.id} 
                  className={`group relative flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                    alert.is_active 
                    ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' 
                    : 'bg-background/20 border-border/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${alert.is_active ? 'bg-primary/10' : 'bg-muted/50'}`}>
                      <Key className={`w-4 h-4 ${alert.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <Badge variant={alert.is_active ? "default" : "outline"} className={`text-[9px] font-black tracking-widest ${alert.is_active ? 'bg-primary border-transparent' : ''}`}>
                      {alert.is_active ? 'ACTIVE' : 'MUTED'}
                    </Badge>
                  </div>

                  <div>
                    <div className="font-black text-sm mb-1">{alert.channel}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      <Activity className="w-3 h-3" />
                      Threshold: {alert.threshold} events / minute
                    </div>
                  </div>

                  <Button 
                    variant={alert.is_active ? "secondary" : "outline"} 
                    size="sm"
                    className="w-full mt-2 font-black text-[10px] tracking-widest uppercase transition-all"
                    onClick={() => onToggleAlert(alert.id)}
                  >
                    {alert.is_active ? 'Disable Protocol' : 'Engage Trigger'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 mt-1">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-1 text-[11px]">System Sentinel Note</h4>
              <p className="text-xs text-yellow-500/80 font-medium leading-relaxed">
                Autonomous governance alerts are cryptographically verified by the kernel. Disabling a protocol in 
                active production clusters may bypass critical safety guardrails and requires high-tier administrative authorization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
