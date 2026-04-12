import { useState, useEffect } from "react";
import { 
  Cloud, 
  Smartphone, 
  Settings2, 
  RefreshCw, 
  Activity,
  History,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { extendedApi, type EdgeDeployment } from "@/lib/api";
import { toast } from "sonner";

export function EdgeAISection() {
  const [deployments, setDeployments] = useState<EdgeDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    loadDeployments();
  }, []);

  async function loadDeployments() {
    setLoading(true);
    try {
      const data = await extendedApi.edge.deployments();
      setDeployments(data || []);
    } catch (err) {
      console.error("Failed to fetch edge deployments", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(id: string) {
    setSyncingId(id);
    try {
      await extendedApi.edge.sync(id);
      toast.success("Edge policy synchronization complete");
      loadDeployments();
    } catch (err) {
      toast.error("Failed to sync edge device. Check local node availability.");
    } finally {
      setSyncingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">Attaching to global edge network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            Edge Hub & Local Scans
          </h3>
          <p className="text-sm text-muted-foreground">Monitoring on-device AI deployments and Article 14 human-oversight triggers</p>
        </div>
        <Button size="sm" variant="outline" onClick={loadDeployments}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-blue-500/5 border-blue-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-600 uppercase">Device Connectivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-[10px] text-muted-foreground">12 Active / 1 Degraded</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-600 uppercase">Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">In Sync</div>
            <p className="text-[10px] text-muted-foreground">All devices running Policy v4.2.1</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-500/5 border-indigo-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-indigo-600 uppercase">Local Inference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4k</div>
            <p className="text-[10px] text-muted-foreground">Requests audited locally today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Real-time Edge Fleet
          </CardTitle>
          <CardDescription>Status and policy alignment across mobile, IoT, and on-prem nodes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No edge devices provisioned.
                  </TableCell>
                </TableRow>
              ) : (
                deployments.map((d) => (
                  <TableRow key={d.device_id}>
                    <TableCell className="font-mono text-[11px] font-bold">{d.device_id}</TableCell>
                    <TableCell className="text-xs">{d.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {d.device_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs capitalize">
                        <div className={`h-2 w-2 rounded-full ${
                          d.status === 'online' ? 'bg-emerald-500' : 
                          d.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {d.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 gap-1.5"
                        onClick={() => handleSync(d.device_id)}
                        disabled={syncingId === d.device_id}
                      >
                        {syncingId === d.device_id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Sync
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-muted/20 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Policy Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span>Local PII Scrubbing</span>
                  <span className="text-emerald-500">Active</span>
                </div>
                <Progress value={100} className="h-1" />
             </div>
             <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span>Offline Audit Buffer</span>
                  <span className="text-amber-500">42% Capacity</span>
                </div>
                <Progress value={42} className="h-1 shadow-none" />
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/20 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Handshakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { time: "2 min ago", device: "iPad-Pro-Scan-1", action: "Policy Sync" },
                { time: "14 min ago", device: "Local-Gateway-EU", action: "Heartbeat" },
                { time: "1h ago", device: "IoT-Edge-Node-4", action: "Audit Push" }
              ].map((h, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] p-2 rounded bg-background/40">
                  <span className="font-bold">{h.device}</span>
                  <span className="text-muted-foreground">{h.action} &middot; {h.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
