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
import { Link } from "wouter";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

interface PricingCardProps {
  badgeLabel: string;
  badgeClassName?: string;
  badgeVariant?: "default" | "outline";
  title: string;
  titleClassName?: string;
  description: string;
  price: string;
  features: string[];
  cardClassName?: string;
  extraBadge?: React.ReactNode;
}

function PricingCard({
  badgeLabel,
  badgeClassName,
  badgeVariant = "outline",
  title,
  titleClassName,
  description,
  price,
  features,
  cardClassName,
  extraBadge,
}: PricingCardProps) {
  return (
    <Card className={cardClassName}>
      <CardHeader>
        <div className="p-2 w-fit rounded-lg bg-slate-500/20 mb-2">
          <Badge variant={badgeVariant} className={badgeClassName}>
            {badgeLabel}
          </Badge>
          {extraBadge}
        </div>
        <CardTitle className={titleClassName}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-3xl font-bold mt-2">
          {price}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-slate-400 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function PricingSection() {
  const { slaTier } = useDeepfakeDefenseContext();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <PricingCard
          badgeLabel="Free"
          badgeClassName="text-slate-400 border-slate-400/20"
          title="Solo Defender"
          description="Individual researchers"
          price="$0"
          features={["1 Agent", "10K tokens/day", "Community Support"]}
        />

        <PricingCard
          badgeLabel="Starter"
          badgeClassName="text-blue-500 border-blue-500/20"
          title="Small Team"
          description="Early production apps"
          price="$499"
          features={["Up to 5 agents", "100K tokens/day", "Priority Email Support"]}
        />

        <PricingCard
          badgeLabel="Professional"
          badgeVariant="default"
          badgeClassName="bg-blue-600"
          titleClassName="text-blue-400"
          cardClassName="border-2 border-blue-500 bg-blue-500/5"
          title="Scale"
          description="Rapidly growing firms"
          price="$1,499"
          features={["Up to 25 agents", "1M tokens/day", "Biometric Signature", "Advanced Analytics"]}
        />

        <PricingCard
          badgeLabel="Enterprise"
          badgeClassName="text-purple-400 border-purple-400/20"
          titleClassName="text-purple-400"
          cardClassName={`border-2 ${
            slaTier?.tier?.toLowerCase() === "enterprise" || !slaTier
              ? "border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              : "border-slate-700"
          }`}
          title="Custom"
          description="Global Banking Tier"
          price="$2,500+"
          features={["Unlimited Agents", "VPC deployment", "SSO/SAML", "24/7 Red-Team Support"]}
          extraBadge={
            slaTier?.tier?.toLowerCase() === "enterprise" ? (
              <Badge variant="default" className="ml-2 bg-purple-600">
                Active
              </Badge>
            ) : undefined
          }
        />
      </div>

      <div className="flex justify-center mt-8 pb-12">
        <Link href="/billing">
          <Button size="lg" className="px-12 bg-blue-600 hover:bg-blue-700">
            Manage Subscription & Billing
          </Button>
        </Link>
      </div>
    </>
  );
}
