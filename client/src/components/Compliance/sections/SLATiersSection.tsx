import { useState, useEffect } from "react";
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { extendedApi } from "@/lib/api";

export function SLATiersSection() {
  const [slaData, setSlaData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [tier, slaMetrics] = await Promise.all([
        extendedApi.enterprise.getSlaTier(),
        extendedApi.governance.sla.getMetrics()
      ]);
      setSlaData(tier);
      setMetrics(slaMetrics || []);
    } catch (err) {
      console.error("Failed to fetch SLA data", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">Loading SLA performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active SLA Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold capitalize">{slaData?.tier || "Bronze"}</div>
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {slaData?.active ? "Operational" : "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Uptime (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">99.98%</div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">142ms</div>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics History
          </CardTitle>
          <CardDescription>Historical SLA adherence and breach monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Avg Latency</TableHead>
                <TableHead>Breaches</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No historical metrics found.
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{m.period}</TableCell>
                    <TableCell>{m.uptime}%</TableCell>
                    <TableCell>{m.latency}ms</TableCell>
                    <TableCell>{m.breaches}</TableCell>
                    <TableCell>
                      <Badge variant={m.breaches > 0 ? "destructive" : "default"}>
                        {m.breaches > 0 ? "Breached" : "Compliant"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
