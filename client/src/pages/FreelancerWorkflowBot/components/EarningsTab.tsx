import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function EarningsTab({
  earningsData,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  earningsData: Record<string, any> | null;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-border/50">
        <CardHeader className="py-4 border-b border-border/50">
          <CardTitle className="text-caption-premium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Earnings ROI
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total Revenue</span>
            <span className="text-xl font-bold text-green-500">
              ${(earningsData?.totalRevenue ?? 0).toLocaleString()}
            </span>
          </div>
          <Progress
            value={Math.min(
              100,
              ((earningsData?.totalRevenue ?? 0) / 50000) * 100
            )}
            className="h-2"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm">Monthly Revenue</span>
            <span className="font-bold">
              ${(earningsData?.monthlyRevenue ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Pending Payments</span>
            <span className="font-bold text-orange-500">
              ${(earningsData?.pendingPayments ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Avg Project Value</span>
            <span className="font-bold">
              ${(earningsData?.avgProjectValue ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">YoY Growth</span>
            <Badge className="bg-green-500/10 text-green-500">
              +{earningsData?.yoyGrowth ?? 0}%
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardHeader className="py-4 border-b border-border/50">
          <CardTitle className="text-caption-premium">Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              {
                label: "Revenue Target",
                value: `${Math.round(((earningsData?.totalRevenue ?? 0) / 50000) * 100)}%`,
                progress:
                  ((earningsData?.totalRevenue ?? 0) / 50000) * 100,
              },
              { label: "Client Retention", value: "92%", progress: 92 },
              { label: "Utilization Rate", value: "78%", progress: 78 },
            ].map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-bold">{m.value}</span>
                </div>
                <Progress value={m.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
