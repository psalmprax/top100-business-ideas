import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function IncidentsSection() {
  const { threats, setShowReportIncidentDialog } = useDeepfakeDefenseContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Injected Incidents</CardTitle>
          <CardDescription>
            Track and report deepfake injection attempts
          </CardDescription>
        </div>
        <Button
          data-testid="btn-report-incident"
          variant="destructive"
          size="sm"
          onClick={() => setShowReportIncidentDialog(true)}
        >
          <AlertTriangle className="w-4 h-4 mr-2" /> Report Incident
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {threats.map(threat => (
            <div
              key={threat.id}
              className="p-4 rounded-lg border border-red-500/20 bg-red-500/5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-red-500 uppercase text-xs tracking-wider">
                  {threat.severity}
                </span>
                <span className="text-xs text-muted-foreground">
                  {threat.timestamp.toLocaleDateString()}
                </span>
              </div>
              <p className="text-body-sm font-medium">{threat.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
