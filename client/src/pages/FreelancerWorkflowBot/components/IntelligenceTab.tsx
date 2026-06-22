import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function IntelligenceTab() {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-caption-premium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
            <div className="text-body-sm font-bold text-indigo-500 mb-2">
              Revenue Optimization
            </div>
            <p className="text-body-sm">
              Based on your project history, consider raising rates for
              long-term clients by 12-15%. Average industry rate for your
              skillset has increased.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="text-body-sm font-bold text-green-500 mb-2">
              Client Health
            </div>
            <p className="text-body-sm">
              Acme Corp engagement is strong. Consider upselling compliance
              automation services based on their recent activity.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="text-body-sm font-bold text-amber-500 mb-2">
              Capacity Alert
            </div>
            <p className="text-body-sm">
              You're at 78% utilization. Adding one more active project may
              impact delivery quality. Consider delegating to agents.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
