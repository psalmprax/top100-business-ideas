import React from "react";
import { 
  Activity, 
  Cloud,
  Globe,
  Zap,
  ShieldAlert,
  Server
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

interface RegionalHealthSubsectionProps {
  multiCloudStatus: any;
  clusterNodes: any[];
  onTriggerPanic: () => void;
  onSystemReset: () => void;
}

export function RegionalHealthSubsection({
  multiCloudStatus,
  clusterNodes,
  onTriggerPanic,
  onSystemReset,
}: RegionalHealthSubsectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Globe className="w-5 h-5 text-primary" />
              Multi-Cloud Mesh
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Global Cluster Latency & Health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {multiCloudStatus?.regions ? (
              Object.entries(multiCloudStatus.regions).map(([region, status]: [string, any]) => (
                <div key={region} className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <Cloud className={`w-4 h-4 ${status.healthy ? 'text-emerald-500' : 'text-red-500'}`} />
                    <span className="text-xs font-black uppercase tracking-tight">{region.replace('-', ' ')}</span>
                  </div>
                  <Badge variant={status.healthy ? "default" : "destructive"} className="text-[9px] font-black tracking-widest px-2 py-0.5">
                    {status.healthy ? 'OPERATIONAL' : 'DEGRADED'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground opacity-40">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">No mesh telemetry available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Server className="w-5 h-5 text-primary" />
              Node Topology
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Active Kubernetes Enclave Nodes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clusterNodes.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground opacity-40">
                 <Server className="w-8 h-8 mx-auto mb-2 font-black" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Awaiting node heartbeats...</p>
               </div>
            ) : (
              clusterNodes.map(node => (
                <div key={node.id} className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-white/70 uppercase">{node.name || node.id}</span>
                    <span className="text-[10px] font-black tabular-nums">{node.load_average || 0}%</span>
                  </div>
                  <Progress value={node.load_average || 0} className="h-1.5 bg-background/50" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black text-red-500">
              <ShieldAlert className="w-5 h-5" />
              Emergency Ops
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-red-500/60">Final Line Defense Protocols</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-12 shadow-lg shadow-red-600/20 rounded-xl"
              onClick={onTriggerPanic}
            >
              <Zap className="w-4 h-4 mr-2" />
              TRIGGER GLOBAL PANIC
            </Button>
            <Button 
              variant="outline"
              className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 font-black h-12 rounded-xl"
              onClick={onSystemReset}
            >
              ADMINISTRATIVE RESET
            </Button>
            <p className="text-[9px] font-bold text-red-500/60 uppercase text-center mt-2 leading-relaxed">
              * Actions tracked in Immutable Ledger *
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
