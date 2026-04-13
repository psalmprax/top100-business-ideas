import {
  Globe,
  Webhook,
  Server,
  Smartphone,
  Apple,
  Play,
  Database,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { OnPremDeployment } from "../types";

interface InfrastructureSectionProps {
  multiCloudStatus: any;
  webhooks: any[];
  onRegisterWebhook: () => void;
  clusterNodes: any[];
  onPremDeployments: OnPremDeployment[];
  onTriggerOnPremAction: (id: string, action: string) => void;
  onTriggerPanic: () => void;
  onSystemReset: () => void;
}

export function InfrastructureSection({
  multiCloudStatus,
  webhooks,
  onRegisterWebhook,
  clusterNodes,
  onPremDeployments,
  onTriggerOnPremAction,
  onTriggerPanic,
  onSystemReset,
}: InfrastructureSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Multi-Cloud Fabric
          </CardTitle>
          <CardDescription>
            Real-time heath across distributed regions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {multiCloudStatus?.regions?.map((region: any) => (
              <div
                key={region.id}
                className="p-3 rounded-lg border border-border/50 bg-background/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${region.status === "healthy" ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    <span className="text-sm font-bold">{region.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {region.provider.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Latency</span>
                    <span className="text-white font-mono">
                      {region.latency}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load</span>
                    <span className="text-white font-mono">{region.load}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="font-bold text-sm text-indigo-300">
                  Sentinel Mobile Control
                </div>
                <div className="text-[10px] text-indigo-300/70">
                  Secure remote governance for iOS & Android
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 border-indigo-500/30 bg-indigo-500/5 text-[10px]"
                disabled
              >
                <Apple className="w-3.5 h-3.5 text-indigo-400" /> Coming Soon
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 border-indigo-500/30 bg-indigo-500/5 text-[10px]"
                disabled
              >
                <Play className="w-3.5 h-3.5 text-indigo-400" /> Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-primary" />
              Active Webhooks
            </CardTitle>
            <CardDescription>
              Outbound event orchestration endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {webhooks.map(hook => (
                <div
                  key={hook.id}
                  className="flex items-center justify-between p-2 rounded bg-background/40 border border-border/50"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{hook.name}</span>
                    <span className="text-[9px] text-muted-foreground truncate max-w-[180px]">
                      {hook.url}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    ACTIVE
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full h-9 text-xs border-dashed"
              onClick={onRegisterWebhook}
            >
              <Plus className="w-3 h-3 mr-2" /> Register Endpoint
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              On-Prem Orchestration
            </CardTitle>
            <CardDescription>
              Managed Kubernetes clusters and bare-metal nodes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clusterNodes.map(node => (
                <div key={node.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-bold">{node.name}</span>
                    </div>
                    <Badge
                      variant={
                        node.status === "online" ? "default" : "destructive"
                      }
                      className="text-[9px]"
                    >
                      {node.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[9px] text-muted-foreground w-8">
                      CPU
                    </span>
                    <Progress value={node.cpu_usage} className="h-1 flex-1" />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">
                      {node.cpu_usage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Plus className="w-5 h-5 rotate-45" />
              Defensive Protocols
            </CardTitle>
            <CardDescription className="text-red-500/50">
              Infrastructure-level security overrides.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full text-xs">
                    Initiate System-Wide Lockdown
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Initiate Global Lockdown?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      All agentic operations will be suspended immediately. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onTriggerPanic}>
                      Confirm Lockdown
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                className="w-full text-xs border-red-500/20 hover:bg-red-500/10"
                onClick={onSystemReset}
              >
                Administrative Override
              </Button>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Caution: Lockdown protocols affect all sub-networks and API
              gateways. Reset requires administrative physical-access secret
              tokens.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
