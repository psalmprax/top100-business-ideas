import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  change,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <Badge
              variant={change >= 0 ? "default" : "destructive"}
              className="text-[10px] h-4"
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <div className="text-stat text-white tabular-nums mb-1">{value}</div>
          <div className="text-stat-label mt-0.5">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}
