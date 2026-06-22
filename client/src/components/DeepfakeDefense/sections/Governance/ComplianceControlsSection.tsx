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
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function ComplianceControlsSection() {
  const { isAuditRunning, handleRunHipaaAudit, handleRunSoxAudit } =
    useDeepfakeDefenseContext();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              HIPAA Compliance Audit
            </CardTitle>
            <Badge className="bg-emerald-500">CERTIFIED</Badge>
          </div>
          <CardDescription>
            Biometric data encryption & consent logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              <span className="text-muted-foreground">Last Audit: </span>
              <span className="font-mono">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <Button
              className="w-full"
              variant="outline"
              disabled={isAuditRunning === "hipaa"}
              onClick={handleRunHipaaAudit}
            >
              {isAuditRunning === "hipaa" ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Run HIPAA Audit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              SOX Governance Audit
            </CardTitle>
            <Badge className="bg-purple-500">COMPLIANT</Badge>
          </div>
          <CardDescription>
            Financial disclosure & human oversight
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              <span className="text-muted-foreground">Last Audit: </span>
              <span className="font-mono">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <Button
              className="w-full"
              variant="outline"
              disabled={isAuditRunning === "sox"}
              onClick={handleRunSoxAudit}
            >
              {isAuditRunning === "sox" ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Run SOX Audit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
