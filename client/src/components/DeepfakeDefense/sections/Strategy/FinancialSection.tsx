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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BarChart3, DollarSign, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function FinancialSection() {
  const { stats } = useDeepfakeDefenseContext();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* ROI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-title">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              ROI Analysis
            </CardTitle>
            <CardDescription>Human vs. AI cost comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Manual Review Cost</span>
                  <span className="font-mono">
                    ${stats?.roi?.manual_cost?.toLocaleString() || "45,000"}/mo
                  </span>
                </div>
                <div className="h-3 rounded-full bg-red-500/20">
                  <div
                    className="h-3 rounded-full bg-red-500"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI Defense Cost</span>
                  <span className="font-mono">
                    ${stats?.roi?.ai_cost?.toLocaleString() || "2,500"}/mo
                  </span>
                </div>
                <div className="h-3 rounded-full bg-emerald-500/20">
                  <div
                    className="h-3 rounded-full bg-emerald-500"
                    style={{ width: "15%" }}
                  />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  ${stats?.roi?.savings?.toLocaleString() || "42,500"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Monthly Savings
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-title">
              <DollarSign className="w-5 h-5 text-blue-500" />
              Revenue Metrics
            </CardTitle>
            <CardDescription>Business growth indicators</CardDescription>
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
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Y1 Target</span>
                  <span>{stats?.business?.target_progress || "0%"}</span>
                </div>
                <Progress
                  value={parseFloat(stats?.business?.target_progress || "0")}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Burn & Sustainability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-title">
              <Zap className="w-5 h-5 text-orange-500" />
              Burn & Sustainability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Infra Burn</span>
                <span className="font-mono">
                  ${stats?.business?.burn_infra?.toLocaleString() || "0"}/mo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">R&D Burn</span>
                <span className="font-mono">
                  ${stats?.business?.burn_rd?.toLocaleString() || "0"}/mo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Compliance Burn</span>
                <span className="font-mono">
                  ${stats?.business?.burn_compliance?.toLocaleString() || "0"}
                  /mo
                </span>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Runway</span>
                  <span className="font-bold text-blue-500">
                    {stats?.business?.runway || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Budget Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-title">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Dynamic Budget Rules
            </CardTitle>
            <CardDescription>Auto-scale thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">
                    API Budget
                  </label>
                  <Input defaultValue="$5,000" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Failover Budget
                  </label>
                  <Input defaultValue="$2,000" className="mt-1" />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  toast.info("Dynamic budget rules — Enterprise Roadmap 2026")
                }
              >
                Update Budget Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
