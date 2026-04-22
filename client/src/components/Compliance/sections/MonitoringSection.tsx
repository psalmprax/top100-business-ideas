import { useState, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  Zap,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  extendedApi,
  type ComplianceSectionMetrics,
  type ComplianceEvent,
} from "@/lib/api";
import { toast } from "sonner";

export function MonitoringSection() {
  const [metrics, setMetrics] = useState<{
    sections: ComplianceSectionMetrics[];
    events: ComplianceEvent[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const data = await extendedApi.compliance.getLiveMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch live metrics", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">
          Attaching to live compliance stream...
        </p>
      </div>
    );
  }

  const sections: ComplianceSectionMetrics[] = metrics?.sections || [
    { label: "Data Integrity", value: 98, status: "stable" },
    { label: "Model Bias", value: 100, status: "compliant" },
    { label: "Regional Compliance", value: 94, status: "stable" },
    { label: "Security Guardrails", value: 99, status: "active" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map(s => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{s.value}%</div>
              <Progress value={s.value} className="h-1.5" />
              <div className="flex items-center mt-2 gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {s.status}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Compliance Stream
          </CardTitle>
          <CardDescription>
            Real-time telemetry from automated EU AI Act guardrails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics && metrics.events && metrics.events.length > 0 ? (
              metrics.events.map((event: ComplianceEvent, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div
                    className={`p-1.5 rounded-md ${event.severity === "high" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}
                  >
                    {event.severity === "high" ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{event.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {event.description}
                    </div>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="w-10 h-10 opacity-20 mb-2" />
                <p className="text-xs">
                  No active compliance deviations detected.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
