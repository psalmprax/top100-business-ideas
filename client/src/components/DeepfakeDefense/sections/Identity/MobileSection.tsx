import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Layers, Smartphone } from "lucide-react";
import { useLocation } from "wouter";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function MobileSection() {
  const { sdkStatus } = useDeepfakeDefenseContext();
  const [, setLocation] = useLocation();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            LivenessLink Mobile SDK
          </CardTitle>
          <CardDescription>
            Integrate deepfake defense into native apps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
              <div>
                <div className="text-body-sm font-medium">SDK Version</div>
                <div className="text-2xl font-bold">
                  {sdkStatus?.version || "v2.4.1"}
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-500"
              >
                Latest
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground uppercase">
                  Active Apps
                </div>
                <div className="text-xl font-bold">
                  {sdkStatus?.registered_apps || 12}
                </div>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground uppercase">
                  API Health
                </div>
                <div className="text-xl font-bold text-emerald-500">
                  {sdkStatus?.api_health || "---%"}
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    SDK Stable
                  </span>
                </div>
                <span className="text-[10px] text-emerald-500/60 tabular-nums">
                  v2.4.18
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[10px] bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20"
                  onClick={() => setLocation("/mobile")}
                >
                  <Download className="w-3 h-3 mr-1" />
                  SDK
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[10px] bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20"
                  onClick={() => setLocation("/mobile")}
                >
                  <Smartphone className="w-3 h-3 mr-1" />
                  APP
                </Button>
              </div>
            </div>
            <Button
              className="w-full"
              data-testid="btn-download-sdk"
              onClick={() => setLocation("/mobile")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download SDK (iOS/Android)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Events (Mobile)</CardTitle>
          <CardDescription>Real-time SDK injection alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-l-4 border-l-emerald-500 bg-emerald-500/5">
              <div className="font-bold text-xs uppercase">
                Integrity Check Passed
              </div>
              <p className="text-sm">App 'NeoBank-Main' validated on Pixel 8</p>
            </div>
            <div className="p-3 rounded-lg border border-l-4 border-l-indigo-500 bg-indigo-500/5">
              <div className="font-bold text-xs uppercase">SDK Init</div>
              <p className="text-sm">New session started: user_882</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
