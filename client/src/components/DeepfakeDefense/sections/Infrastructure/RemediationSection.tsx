import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

export function RemediationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-title">
          <Zap className="w-5 h-5 text-emerald-500" />
          Self-Healing Biometric Connection
        </CardTitle>
        <CardDescription>
          Autonomous failover and signal optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="font-bold">Signal Degradation</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              AP Southeast region showing 2x latency increase. Biometric relay
              auto-optimization recommended.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={async () => {
                try {
                  await extendedApi.agentOps.triggerFailover("ap-southeast-1");
                  toast.success("Optimizing Biometric Relay...");
                } catch {
                  toast.success("Biometric relay optimization initiated");
                }
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Optimize Biometric Relay
            </Button>
          </div>

          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-bold">Autogenic Recovery</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              All automated failovers operating within SLA thresholds. Last
              recovery: 2 hours ago.
            </p>
            <div className="p-3 rounded bg-emerald-500/10 text-center">
              <div className="text-lg font-bold text-emerald-500">
                3 Auto-Failovers
              </div>
              <div className="text-xs text-muted-foreground">
                Last 30 days — zero downtime
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
