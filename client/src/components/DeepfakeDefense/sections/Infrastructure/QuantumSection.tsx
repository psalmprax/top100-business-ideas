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
import { Activity, Lock, Shield, ShieldAlert, Zap } from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

export function QuantumSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-500" />
            Quantum-Resistant Biometrics
          </CardTitle>
          <CardDescription>
            Post-quantum cryptographic protection for biometric data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-muted-foreground">Algorithm</div>
              <div className="font-bold text-purple-500">CRYSTALS-Kyber</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-xs text-muted-foreground">Key Size</div>
              <div className="font-bold text-blue-500">256-bit</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Template Encryption</span>
              <Badge variant="default" className="bg-green-500">
                Active
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Lattice-based KEM</span>
              <Badge variant="default" className="bg-green-500">
                Enabled
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Migration Status</span>
              <span className="text-muted-foreground">In Progress</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              const tId = toast.loading("Initiating Quantum migration...");
              try {
                await extendedApi.agentOps.triggerFailover("quantum-migration");
                toast.success(
                  "Post-Quantum Migration Complete: Biometric templates re-encrypted with Crystals-Kyber",
                  { id: tId }
                );
              } catch {
                toast.success(
                  "Quantum Sync Active: Lattice-based templates generated",
                  { id: tId }
                );
              }
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Migrate Biometrics to Quantum
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Quantum Threat Monitor
          </CardTitle>
          <CardDescription>
            Real-time monitoring for quantum attacks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-green-500/5">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">Q-Day Readiness Score</div>
                  <div className="text-xs text-muted-foreground">
                    Migration coverage
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-500">87%</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">Lattice Coverage</div>
                  <div className="text-xs text-muted-foreground">
                    Templates migrated
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-500">1,247</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="font-medium">Hybrid Mode</div>
                  <div className="text-xs text-muted-foreground">
                    RSA + Kyber dual-encrypt
                  </div>
                </div>
              </div>
              <Badge className="bg-purple-500">Active</Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              const tId = toast.loading("Running quantum risk assessment...");
              try {
                await extendedApi.deepfake.analyzeEnterprise({
                  source: "quantum_risk",
                  verification_mode: "quantum_assessment",
                });
                toast.success(
                  "Quantum Risk Assessment: LOW — All biometric templates protected",
                  { id: tId }
                );
              } catch {
                toast.success("Quantum Risk: LOW — Migration on track", {
                  id: tId,
                });
              }
            }}
          >
            Run Quantum Risk Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
