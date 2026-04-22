import { motion } from "framer-motion";
import {
  Brain,
  DollarSign,
  ShieldAlert,
  TrendingDown,
  Zap,
  ShieldCheck,
  FileText,
  Users,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MetricCard, BudgetProgress } from "../Atoms";
import { DashboardAgent, HealingConfig } from "../types";

interface OverviewSectionProps {
  agents: DashboardAgent[];
  liveMetrics: any;
  healingConfig: HealingConfig;
  onSelfHealingToggle: (type: string, enabled: boolean) => void;
}

export function OverviewSection({
  agents,
  liveMetrics,
  healingConfig,
  onSelfHealingToggle,
}: OverviewSectionProps) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === "running").length;
  const totalDailySpend = agents.reduce((sum, a) => sum + a.daily_spend, 0);
  const totalCostSaved = agents.reduce(
    (sum, a) => sum + (a.metrics?.cost_saved || 0),
    0
  );
  const loopsPrevented = agents.reduce(
    (sum, a) => sum + (a.metrics?.loops_prevented || 0),
    0
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title="Total Agents"
          value={`${activeAgents}/${totalAgents}`}
          icon={Brain}
          color="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Daily Spend"
          value={`$${totalDailySpend.toFixed(2)}`}
          change={0}
          icon={DollarSign}
          color="bg-green-500/10 text-green-500"
        />
        <MetricCard
          title="Loops Prevented"
          value={(loopsPrevented || 0).toString()}
          change={0}
          icon={ShieldAlert}
          color="bg-accent/10 text-accent"
        />
        <MetricCard
          title="Cost Saved"
          value={`$${totalCostSaved.toFixed(2)}`}
          change={0}
          icon={TrendingDown}
          color="bg-emerald-500/10 text-emerald-500"
        />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget Overview
            </CardTitle>
            <CardDescription>Daily spending across all agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.slice(0, 4).map(agent => (
                <div key={agent.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-muted-foreground">
                      {Math.round(
                        ((agent.daily_spend || 0) / (agent.budget || 1)) * 100
                      )}
                      %
                    </span>
                  </div>
                  <BudgetProgress
                    spent={agent.daily_spend}
                    limit={agent.budget}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Sentinel Features
            </CardTitle>
            <CardDescription>Active governance capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Semantic Cost Capping</span>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Loop Prevention</span>
                </div>
                <Badge variant="secondary">{loopsPrevented} Prevented</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Decision Ledger</span>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Multi-Agent Budgeting</span>
                </div>
                <Badge variant="outline">{agents.length} Agents</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle>Usage Forecasting</CardTitle>
            </div>
            <CardDescription>Predicted token usage and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {liveMetrics.usage_forecast ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Next 30 Days</span>
                    <span className="font-bold text-lg">
                      $
                      {liveMetrics.usage_forecast.next_30_days_cost_est?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Predicted Trend</span>
                    <Badge
                      variant="outline"
                      className="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    >
                      {liveMetrics.usage_forecast.trend || "STABLE"}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground italic">
                      Based on current agent density and task frequency.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground italic text-xs">
                  Calculating real-time forecast...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-500" />
              <CardTitle>Autonomous Recovery (Self-Repairing Logic)</CardTitle>
            </div>
            <CardDescription>
              Real-time prompt refinement and safety rollbacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Refine Prompts</Label>
                    <p className="text-sm text-muted-foreground">
                      Iteratively improve prompts based on semantic feedback
                    </p>
                  </div>
                  <Switch
                    checked={healingConfig.auto_healing_enabled}
                    onCheckedChange={checked =>
                      onSelfHealingToggle("auto_refine", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Safety-First Rollback</Label>
                    <p className="text-sm text-muted-foreground">
                      Instant reversion to known-safe states on anomaly
                    </p>
                  </div>
                  <Switch
                    checked={healingConfig.active}
                    onCheckedChange={checked =>
                      onSelfHealingToggle("safety_rollback", checked)
                    }
                  />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recovery Status
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span>Last Refinement</span>
                    <span className="font-bold">
                      {healingConfig.updated_at
                        ? new Date(
                            healingConfig.updated_at
                          ).toLocaleTimeString()
                        : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Prevention Rate</span>
                    <span className="text-emerald-500 font-bold">
                      {liveMetrics.status === "live" ? "ACTIVE" : "---"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    System active. {healingConfig.mitigations_count || 0}{" "}
                    potential hallucinations mitigated{" "}
                    {healingConfig.last_mitigation_time
                      ? `since ${new Date(healingConfig.last_mitigation_time).toLocaleTimeString()}`
                      : "recently"}
                    .
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
