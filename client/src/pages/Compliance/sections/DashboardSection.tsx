import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, Users, Bug, Database, Calendar } from "lucide-react";
import { ComplianceScoreCard } from "../components/ComplianceCards";

interface DashboardSectionProps {
  avgScore: number;
  compliantModels: number;
  totalModels: number;
  highRiskModels: number;
  openIncidents: number;
  roiMetrics: any;
  velocityTrends: any[];
  biasReports: any[];
  euDatabaseRegistered: boolean;
  deadlines: any[];
}

export const DashboardSection = ({
  avgScore,
  compliantModels,
  totalModels,
  highRiskModels,
  openIncidents,
  roiMetrics,
  velocityTrends,
  biasReports,
  euDatabaseRegistered,
  deadlines,
}: DashboardSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceScoreCard score={avgScore} title="Avg Compliance Score" />
        <Card>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">
              {compliantModels}/{totalModels}
            </div>
            <div className="text-body-sm text-muted-foreground">
              Compliant Models
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{highRiskModels}</div>
            <div className="text-body-sm text-muted-foreground">
              High Risk Models
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{openIncidents}</div>
            <div className="text-body-sm text-muted-foreground">
              Open Incidents
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Real-Time ROI & Compliance Velocity
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              >
                LIVE STREAM
              </Badge>
            </div>
            <CardDescription>
              Automated vs. Manual compliance overhead analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-caption-premium text-muted-foreground">
                  Manual Cost
                </p>
                <p className="text-xl font-bold">
                  {roiMetrics?.manual_cost ? `$${roiMetrics.manual_cost.toLocaleString()}` : "---"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-caption-premium text-muted-foreground">
                  Alpha Cost
                </p>
                <p className="text-xl font-bold text-emerald-500">
                  {roiMetrics?.alpha_cost ? `$${roiMetrics.alpha_cost.toLocaleString()}` : "---"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-caption-premium text-muted-foreground">
                  Net ROI
                </p>
                <p className="text-xl font-bold text-blue-500">
                  {roiMetrics?.net_roi ? `${roiMetrics.net_roi}x` : "---"}
                </p>
              </div>
            </div>
            
            <div className="h-32 bg-muted/30 rounded-lg flex items-end gap-1 p-2 border border-dashed">
              {(velocityTrends.length > 0
                ? velocityTrends
                : Array.from({ length: 40 })
              ).map((item, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500/30 rounded-t-sm"
                  style={{
                    height: `${typeof item === "number" ? item : 50}%`,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              ReguLens Features
            </CardTitle>
            <CardDescription>
              Active compliance capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="font-medium">
                    Technical Documentation
                  </span>
                </div>
                <Badge variant="secondary">Auto-Generated</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Bias Detection</span>
                </div>
                <Badge variant="secondary">
                  {biasReports.length} Reports
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <Bug className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Adversarial Audit</span>
                </div>
                <Badge variant="secondary">Red Team Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">EU Database</span>
                </div>
                <Badge
                  variant={euDatabaseRegistered ? "default" : "outline"}
                >
                  {euDatabaseRegistered
                    ? "Registered"
                    : "Not Registered"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Compliance Deadlines
            </CardTitle>
            <CardDescription>
              Upcoming regulatory requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deadlines.length > 0 ? (
                deadlines.map((d, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{d.requirement}</div>
                      <div className="text-xs text-muted-foreground">{d.date}</div>
                    </div>
                    <Badge variant={d.priority === "high" ? "destructive" : "outline"}>
                      {d.priority}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upcoming deadlines detected.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
