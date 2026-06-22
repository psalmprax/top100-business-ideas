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
import { Download, Shield, Smartphone } from "lucide-react";
import { toast } from "sonner";

export function SDKSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-500" />
              Mobile SDK Deployment Status
            </CardTitle>
            <CardDescription>
              Production integration and verification
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => toast.info("Redirecting to SDK download...")}
          >
            <Download className="w-4 h-4 mr-2" />
            Download SDK
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Simulated phone UI */}
          <div className="flex justify-center">
            <div className="w-64 h-96 rounded-2xl border-2 border-muted-foreground/20 bg-muted/10 p-4 flex flex-col items-center">
              <div className="w-16 h-1 bg-muted-foreground/20 rounded-full mb-4" />
              <div className="flex-1 w-full rounded-lg border-2 border-dashed border-primary/30 flex flex-col items-center justify-center">
                <Shield className="w-10 h-10 text-primary/40 mb-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Document Scan Area
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  NFC + MRZ Ready
                </p>
              </div>
              <div className="mt-4 w-full">
                <Button size="sm" className="w-full" variant="outline">
                  Simulate Scan
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="p-4 rounded-lg border bg-muted/20">
            <h4 className="font-bold text-sm mb-3">Advanced Settings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lighting Quality</span>
                <Badge variant="outline">Auto-Adjust</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Detection Threshold
                </span>
                <span className="font-mono">0.85</span>
              </div>
            </div>
          </div>

          {/* Code snippet */}
          <div className="p-4 rounded-lg bg-slate-900 text-slate-300 font-mono text-xs overflow-x-auto">
            <pre>{`import { sentinel } from '@livenesslink/sdk';

const result = await sentinel.verifyIdentity({
  mode: 'hardware_pivot',
  challenge: challengeId,
  biometric: faceScan,
});

if (result.verified) {
  // Biometric Pulse OK
  proceedWithTransaction();
}`}</pre>
          </div>

          {/* Readiness Banner */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-500">
                Validated SDK Readiness
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              NFC scanning, MRZ parsing, and hardware-backed biometric pulse
              protocols validated.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
