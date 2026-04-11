import React from "react";
import { 
  Webhook as WebhookIcon, 
  Plus, 
  Activity, 
  History, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface WebhookSectionProps {
  webhooks: any[];
  onRegisterWebhook: () => void;
}

export function WebhookSection({ webhooks, onRegisterWebhook }: WebhookSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <WebhookIcon className="w-5 h-5 text-primary" />
                Event Orchestration Endpoints
              </CardTitle>
              <CardDescription>Managed webhooks for external system integration.</CardDescription>
            </div>
            <Button size="sm" onClick={onRegisterWebhook} className="font-bold">
              <Plus className="w-4 h-4 mr-2" /> Register
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.length > 0 ? (
                webhooks.map((hook) => (
                  <div key={hook.id} className="p-4 rounded-xl border border-border/50 bg-background/30 group hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="text-sm font-bold flex items-center gap-2">
                          {hook.name}
                          <Badge variant="outline" className="text-[8px] h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">LIVE</Badge>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[300px]">
                          {hook.url}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] hover:text-red-400">Delete</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px]">Test</Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-[10px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Activity className="w-3 h-3 text-primary" />
                        <span>Success rate: <span className="text-white font-bold">99.8%</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>Avg Latency: <span className="text-white font-bold">142ms</span></span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed flex flex-col items-center justify-center gap-3">
                  <WebhookIcon className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">No operational webhooks registered.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Deliveries
            </CardTitle>
            <CardDescription>Live feed of outbound event payloads.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {[
                  { event: "agent.created", status: "success", timestamp: "2m ago" },
                  { event: "budget.threshold", status: "success", timestamp: "14m ago" },
                  { event: "security.panic", status: "failure", timestamp: "1h ago" },
                  { event: "agent.recovery", status: "success", timestamp: "3h ago" }
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded bg-muted/20 border border-border/10 text-[10px]">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                      <span className="font-mono">{log.event}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{log.timestamp}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[8px] uppercase font-bold">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Security Policy
            </CardTitle>
            <CardDescription>Webhook authentication & encryption.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-background/30 border border-border/50">
                <div className="text-[10px] font-bold mb-1">Signing Secret</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-[10px] bg-muted/50 p-1.5 rounded truncate">sk_live_92hf...j29d</div>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]">Reveal</Button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/30 border border-border/50">
                <div className="text-[10px] font-bold mb-1">Retry Policy</div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Exponential backoff</span>
                  <Badge variant="outline" className="text-[8px] h-4">ARMED</Badge>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground leading-relaxed">
              All webhooks are signed with SHA-256 HMAC following the industry-standard Sentinel Handshake protocol.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
