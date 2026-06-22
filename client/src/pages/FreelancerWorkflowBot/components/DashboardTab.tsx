import {
  Clock,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  History,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "./MetricCard";
import { type Task } from "@/lib/api";

export function DashboardTab({
  tasks,
  metrics,
  timeSaved,
  isAuthorizing,
  onAuthorizeAgent,
}: {
  tasks: Task[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metrics: Record<string, any> | null;
  timeSaved: number;
  isAuthorizing: boolean;
  onAuthorizeAgent: () => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Active Automations"
            value="12/15"
            icon={Zap}
            color="bg-amber-500/10 text-amber-500"
            change={14}
          />
          <MetricCard
            title="Reliability"
            value="99.9%"
            icon={ShieldCheck}
            color="bg-emerald-500/10 text-emerald-500"
          />
          <MetricCard
            title="Time Saved"
            value={`${(metrics?.time_saved ?? timeSaved).toFixed(1)}h`}
            icon={Clock}
            color="bg-indigo-500/10 text-indigo-500"
            change={metrics?.time_saved_change ?? 22}
          />
          <MetricCard
            title="Queue Pressure"
            value="Low"
            icon={Activity}
            color="bg-blue-500/10 text-blue-500"
          />
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-title flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Live Execution Feed
              </CardTitle>
              <Badge
                variant="outline"
                className="text-caption-premium bg-background"
              >
                REAL-TIME
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(tasks || []).slice(0, 5).map((item: Task, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-6 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-card-title">{item.title}</div>
                    <div className="text-caption-premium mt-0.5">
                      {item.assigned_to || "WorkflowBot"} &middot;{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleTimeString()
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${item.status === "completed" ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"} text-white border-none text-caption-premium h-4 rounded-sm font-black uppercase tracking-tighter px-1.5`}
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
            {(!tasks || tasks.length === 0) && (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                No active execution cycles in current buffer.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl shadow-indigo-600/20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <Sparkles className="w-8 h-8 text-indigo-200 mb-6" />
            <h3 className="text-section-headline italic mb-4">
              Optimization Insight
            </h3>
            <p className="text-body-sm text-indigo-50 mb-6">
              I've detected you spend ~14 hours monthly on repetitive CRM
              updates. Authorize an autonomous agent to handle this permanently?
            </p>
            <Button
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50 text-caption-premium h-10"
              data-testid="btn-authorize-agent"
              onClick={onAuthorizeAgent}
              disabled={isAuthorizing}
            >
              {isAuthorizing ? "AUTHORIZING..." : "Authorize Agent"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-caption-premium text-muted-foreground">
              Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body-sm font-bold">
                  12 Tasks Pending
                </span>
                <span className="text-body-sm">3.5h left</span>
              </div>
              <Progress value={65} className="h-1.5" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2 rounded bg-muted/50 text-center">
                  <div className="text-lg font-bold">4</div>
                  <div className="text-caption-premium">Priority</div>
                </div>
                <div className="p-2 rounded bg-muted/50 text-center">
                  <div className="text-lg font-bold">8</div>
                  <div className="text-caption-premium">Routine</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
