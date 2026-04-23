import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardAgent } from "./types";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: any;
  color: string;
  footer?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  footer,
}: MetricCardProps) {
  return (
    <Card className="GlassCard-hover border-border/40 transition-all duration-500 group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div
            className={`p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 ${color.includes("primary") ? "bg-primary/10 text-primary border-primary/20" : color.includes("accent") ? "bg-accent/10 text-accent border-accent/20" : color} backdrop-blur-sm border`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center text-xs font-bold font-display tracking-tight ${change >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {change >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-stat text-white tabular-nums mb-1 tracking-tight">
            {value}
          </div>
          <div className="text-stat-label">{title}</div>
        </div>
        {footer && (
          <div className="mt-4 pt-4 border-t border-border/30 text-[10px] text-muted-foreground italic leading-relaxed">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AgentStatusBadge({
  status,
}: {
  status: DashboardAgent["status"];
}) {
  const statusConfig: Record<
    DashboardAgent["status"],
    { color: string; label: string }
  > = {
    running: { color: "bg-green-500", label: "Running" },
    paused: { color: "bg-yellow-500", label: "Paused" },
    error: { color: "bg-red-500", label: "Error" },
    stopped: { color: "bg-gray-500", label: "Stopped" },
  };
  const config = statusConfig[status];
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-xs">{config.label}</span>
    </div>
  );
}

export function BudgetProgress({
  spent,
  limit,
}: {
  spent: number;
  limit: number;
}) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const isWarning = percentage >= 75;
  const isCritical = percentage >= 90;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs tabular-nums">
        <span>${(spent ?? 0).toFixed(2)}</span>
        <span className="text-muted-foreground opacity-60">
          ${(limit ?? 10).toFixed(2)} / day
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${isCritical ? "[&>div]:bg-red-500" : isWarning ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
      />
    </div>
  );
}
