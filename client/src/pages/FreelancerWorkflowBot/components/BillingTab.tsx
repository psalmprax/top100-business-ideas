import { CreditCard, FileCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./MetricCard";
import { type Invoice } from "../hooks/useWorkforceData";

export function BillingTab({
  earningsData,
  metrics,
  invoices,
  isStripeConnecting,
  onStripeConnect,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  earningsData: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metrics: Record<string, any> | null;
  invoices: Invoice[];
  isStripeConnecting: boolean;
  onStripeConnect: () => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-muted/10 border-indigo-500/20 border-2 border-dashed flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-full bg-indigo-100 mb-6">
          <CreditCard className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-section-headline mb-2">Connect Stripe</h3>
        <p className="text-body-sm max-w-xs mb-8">
          Authorizing Stripe allows WorkflowBot to automatically generate and
          chase invoices on your behalf.
        </p>
        <Button
          className="bg-[#635BFF] hover:bg-[#635BFF]/90 text-white font-black px-10 h-11"
          onClick={onStripeConnect}
          disabled={isStripeConnecting}
        >
          {isStripeConnecting ? "CONNECTING..." : "Link account via Stripe"}
        </Button>
      </Card>
      <div className="space-y-6">
        <MetricCard
          title="Outstanding Invoices"
          value={`$${(earningsData?.pendingPayments ?? 0).toLocaleString()}`}
          icon={FileCheck}
          color="bg-orange-500/10 text-orange-500"
          change={metrics?.outstanding_change || -12}
        />
        <Card>
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-caption-premium">
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(invoices || [])
              .slice(0, 5)
              .map(
                (
                  inv: {
                    id: string;
                    invoice_number?: string;
                    client_name?: string;
                    created_at: string;
                    status: string;
                    amount?: number;
                  }
                ) => (
                  <div
                    key={inv.id}
                    className="p-4 border-b border-border/30 last:border-0 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-background border flex items-center justify-center text-caption-premium font-bold">
                        INV
                      </div>
                      <div>
                        <div className="text-body-sm font-bold">
                          {inv.invoice_number ||
                            `INV-${inv.id.substring(0, 4)}`}
                        </div>
                        <div className="text-caption-premium">
                          {inv.client_name || "Enterprise Client"} &middot;{" "}
                          {new Date(inv.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        inv.status === "paid" ? "default" : "outline"
                      }
                      className={`text-caption-premium uppercase ${inv.status === "paid" ? "bg-emerald-500" : ""}`}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                )
              )}
            {(!invoices || invoices.length === 0) && (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                No invoices generated in current cycle.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
