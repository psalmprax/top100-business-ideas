import React from "react";
import {
  ShieldCheck,
  Users,
  Settings2,
  Lock,
  Eye,
  FileCheck,
  Scale,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function GovernanceSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Policy Enforcement Engine
                </CardTitle>
                <CardDescription>
                  Global governance rules and autonomous guardrails.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 h-6"
              >
                AUTO-ENFORCING
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  id: "pii-redaction",
                  label: "PII Auto-Redaction",
                  description:
                    "Automatically redact sensitive data from logs and model outputs.",
                  active: true,
                },
                {
                  id: "neural-bias",
                  label: "Bias Detection Gate",
                  description:
                    "Prevent models from executing decisions with > 12% drift score.",
                  active: true,
                },
                {
                  id: "human-loop",
                  label: "Human-in-the-Loop",
                  description:
                    "Require manual approval for financial actions > $10,000.",
                  active: false,
                },
                {
                  id: "cross-border",
                  label: "Cross-Border Lockdown",
                  description:
                    "Restrict data movement between non-aligned jurisdictions.",
                  active: true,
                },
              ].map(policy => (
                <div
                  key={policy.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
                >
                  <div className="space-y-1 pr-8">
                    <Label
                      htmlFor={policy.id}
                      className="text-sm font-bold cursor-pointer"
                    >
                      {policy.label}
                    </Label>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {policy.description}
                    </p>
                  </div>
                  <Switch id={policy.id} checked={policy.active} />
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full text-xs font-bold border-dashed h-10"
            >
              Create Custom Governance Protocol
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Access Control (RBAC)
              </CardTitle>
              <CardDescription>
                Enterprise role mapping and identity protection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/30 border border-border/50 text-center">
                  <div className="text-xl font-black">14</div>
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                    Total Users
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/30 border border-border/50 text-center">
                  <div className="text-xl font-black">3</div>
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                    Admins
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/20 border border-border/10">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Regional Managers</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] h-4">
                    8 ACTIVE
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/20 border border-border/10">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Compliance Officers</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] h-4">
                    2 ACTIVE
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full h-8 text-[10px] text-primary hover:bg-primary/5"
              >
                Manage Identity Permissions
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-indigo-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                Neural Sovereignty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-300/80 italic">
                  Model weights are owned by:
                </span>
                <Badge className="bg-indigo-500 text-white border-none text-[8px]">
                  CUSTOMER
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-300/80 italic">
                  Inference node type:
                </span>
                <Badge className="bg-indigo-500 text-white border-none text-[8px]">
                  PRIVATE ENCLAVE
                </Badge>
              </div>
              <p className="text-[10px] text-indigo-300/60 leading-relaxed mt-2">
                Neural sovereignty is strictly enforced. No model training data
                exits the customer environment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
