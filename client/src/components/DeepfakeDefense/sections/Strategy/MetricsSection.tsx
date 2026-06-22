import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";
import { MetricCard } from "../../ui/MetricCard";

export function MetricsSection() {
  const { stats } = useDeepfakeDefenseContext();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Value Secured"
          value={
            stats?.business?.arr
              ? `$${(stats.business.arr / 1000).toFixed(0)}K`
              : "$0"
          }
          icon={TrendingUp}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <MetricCard
          title="Liveness Scans"
          value={stats?.roi?.total_scans?.toLocaleString() || "0"}
          icon={Activity}
          color="bg-blue-500/10 text-blue-500"
        />
        <MetricCard
          title="Avg Deal Size"
          value={
            stats?.business?.avg_deal
              ? `$${stats.business.avg_deal.toLocaleString()}`
              : "$0"
          }
          icon={TrendingUp}
          color="bg-purple-500/10 text-purple-500"
        />
        <MetricCard
          title="Sales Cycle"
          value={stats?.business?.sales_cycle || "N/A"}
          icon={Activity}
          color="bg-orange-500/10 text-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-title">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ARR</span>
                <span className="font-bold">
                  ${stats?.business?.arr?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Revenue Growth</span>
                <Badge variant="secondary">
                  {stats?.business?.revenue_growth || "0%"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pipeline Value</span>
                <span className="font-bold">
                  ${stats?.business?.pipeline?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Y1 Target Progress
                </span>
                <Badge variant="outline">
                  {stats?.business?.target_progress || "0%"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-title">
              <Activity className="w-5 h-5 text-blue-500" />
              Product Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Detection Accuracy
                </span>
                <Badge variant="secondary">99.2%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg Response Time</span>
                <span className="font-bold">
                  {stats?.avg_latency || "120ms"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  False Positive Rate
                </span>
                <Badge variant="outline">&lt;1%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Uptime SLA</span>
                <Badge className="bg-emerald-500">99.99%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
