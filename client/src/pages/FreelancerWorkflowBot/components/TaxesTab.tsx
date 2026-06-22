import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TaxesTab({
  taxEstimate,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taxEstimate: Record<string, any> | null;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-caption-premium flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Tax Provisioning
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="text-caption-premium">Estimated Tax</div>
            <div className="text-stat text-red-500">
              ${(taxEstimate?.estimatedTax ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="text-caption-premium">Deductible</div>
            <div className="text-stat text-green-500">
              ${(taxEstimate?.deductible ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { q: "Q1", amount: taxEstimate?.q1Paid ?? 0, status: "Paid" },
            { q: "Q2", amount: taxEstimate?.q2Paid ?? 0, status: "Paid" },
            { q: "Q3", amount: taxEstimate?.q3Due ?? 0, status: "Due" },
            {
              q: "Q4",
              amount: taxEstimate?.q4Due ?? 0,
              status: "Upcoming",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="flex items-center justify-between p-3 rounded bg-muted/30"
            >
              <span className="text-body-sm font-bold">
                {item.q} Estimated
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold">
                  ${(item.amount ?? 0).toLocaleString()}
                </span>
                <Badge
                  className={
                    item.status === "Paid"
                      ? "bg-green-500/10 text-green-500 text-caption-premium"
                      : "bg-orange-500/10 text-orange-500 text-caption-premium"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
