import { FileCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Invoice } from "../hooks/useWorkforceData";

export function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-caption-premium flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-indigo-600" />
          Invoice Chasing
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="text-caption-premium">Outstanding</div>
            <div className="text-stat text-orange-500">
              $
              {invoices
                .filter((i) => i.status === "pending")
                .reduce((s, i) => s + (i.amount || 0), 0)
                .toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="text-caption-premium">Collected</div>
            <div className="text-stat text-green-500">
              $
              {invoices
                .filter((i) => i.status === "paid")
                .reduce((s, i) => s + (i.amount || 0), 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
        <p className="text-body-sm text-center">
          Connect Stripe to enable automatic invoice generation and chasing.
        </p>
      </CardContent>
    </Card>
  );
}
