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
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

const tiers = [
  {
    title: "Defense Standard",
    price: "$2,500/mo",
    features: [
      "Biometric Pulse Verification",
      "10K Scans/mo",
      "Standard SLA (99.9%)",
      "Email Support",
    ],
  },
  {
    title: "Defense Enterprise",
    price: "$12,500/mo",
    features: [
      "All Standard Features",
      "100K Scans/mo",
      "Dedicated Failover",
      "24/7 SOC Integration",
      "SSO/SAML",
    ],
  },
  {
    title: "Liveness Sovereign",
    price: "Custom",
    features: [
      "All Enterprise Features",
      "Unlimited Scans",
      "On-Prem Air-Gap",
      "Quantum-Resistant Templates",
      "Red Team Support",
      "FedRAMP Authorization",
    ],
  },
];

export function SLASection() {
  const { slaTier } = useDeepfakeDefenseContext();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiers.map(tier => {
        const isActive =
          slaTier?.tier?.toLowerCase() ===
          tier.title.split(" ").pop()?.toLowerCase();
        return (
          <Card
            key={tier.title}
            className={isActive ? "border-2 border-primary shadow-lg" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tier.title}</CardTitle>
                {isActive && <Badge>Active</Badge>}
              </div>
              <CardDescription className="text-2xl font-bold">
                {tier.price}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6"
                variant={isActive ? "secondary" : "default"}
                disabled={isActive}
                onClick={async () => {
                  try {
                    await extendedApi.enterprise.updateSlaTier(tier.title);
                    toast.success(`Upgraded to ${tier.title}`);
                  } catch {
                    toast.info(`${tier.title} — contact sales for upgrade`);
                  }
                }}
              >
                {isActive ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
