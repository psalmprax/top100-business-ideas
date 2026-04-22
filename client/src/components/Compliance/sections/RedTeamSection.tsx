import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Terminal,
  Play,
  Search,
  CheckCircle2,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extendedApi, type ComplianceScan } from "@/lib/api";
import { toast } from "sonner";

interface RedTeamAudit {
  id: string;
  target: string;
  vulnerabilities: number;
  status: string;
  date: string;
}

export function RedTeamSection() {
  const [isRunning, setIsRunning] = useState(false);
  const [audits, setAudits] = useState<RedTeamAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudits();
  }, []);

  async function loadAudits() {
    setLoading(true);
    try {
      const scans = await extendedApi.compliance.listScans("system-core");
      const mapped: RedTeamAudit[] = (scans || []).map((s: ComplianceScan) => ({
        id: s.id,
        target: s.article_id,
        vulnerabilities: s.results?.metrics?.anomalies_detected || 0,
        status: s.status,
        date: s.created_at
          ? new Date(s.created_at).toLocaleDateString()
          : "Unknown",
      }));
      setAudits(mapped);
    } catch (err) {
      console.error("Failed to fetch red team audits", err);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  }

  async function startAudit() {
    setIsRunning(true);
    try {
      toast.info("Starting adversarial penetration test...");
      const result = await extendedApi.complianceAudit.redTeam("system-core");
      toast.success("Audit initiated: " + result.audit_id);
      loadAudits();
    } catch (err) {
      toast.error("Failed to start red team audit");
    } finally {
      setIsRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">
          Securing adversarial environment...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Red Team Penetration Testing
          </h3>
          <p className="text-sm text-muted-foreground">
            Automated adversarial attacks to identify model vulnerabilities
            (Art. 15 EU AI Act)
          </p>
        </div>
        <Button onClick={startAudit} disabled={isRunning} variant="destructive">
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? "Testing..." : "Trigger Red Team Attack"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {audits.map(audit => (
          <Card key={audit.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  {audit.target}
                </CardTitle>
                <Badge
                  variant={
                    audit.vulnerabilities > 0 ? "destructive" : "default"
                  }
                >
                  {audit.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span>Performed: {audit.date}</span>
                <span className="flex items-center gap-1">
                  {audit.vulnerabilities > 0 ? (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  )}
                  {audit.vulnerabilities} Vulnerabilities
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Search className="w-3 h-3 mr-2" /> View Detailed Logs
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
