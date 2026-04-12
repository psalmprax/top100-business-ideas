import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  RefreshCw,
  Search,
  Filter,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { extendedApi, type Incident } from "@/lib/api";
import { toast } from "sonner";

export function IncidentsSection() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    setLoading(true);
    try {
      // Using the incidents logic from extendedApi
      const data = await extendedApi.compliance.get() as any; // Fallback or direct list
      // Note: useCompliance hook in layout also fetches these, but we fetch local for isolation
      const list = await extendedApi.complianceAudit.listIncidents().catch(() => []);
      setIncidents(list);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    } finally {
      setLoading(false);
    }
  }

  async function resolveIncident(id: string) {
    try {
      await extendedApi.compliance.updateIncidentStatus(id, "resolved");
      toast.success("Incident marked as resolved");
      loadIncidents();
    } catch (err) {
      toast.error("Failed to resolve incident");
    }
  }

  const filteredIncidents = incidents.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">Synchronizing incident ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Compliance Incidents
          </h3>
          <p className="text-sm text-muted-foreground">EU AI Act Article 71 & 72 monitoring and reporting</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Active Notifications</CardTitle>
            <Button size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" /> Report New
            </Button>
          </div>
          <CardDescription>
            System-detected deviations requiring immediate regulatory assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mb-2" />
                      <p>No active incidents detected.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <div className="font-medium">{incident.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{incident.description}</div>
                      {incident.article72 && (
                        <Badge variant="outline" className="mt-1 text-[10px] bg-red-500/5 text-red-500 border-red-500/20">
                          Article 72 / Serious Incident
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={incident.severity === 'critical' || incident.severity === 'high' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs capitalize">
                        <div className={`h-2 w-2 rounded-full ${
                          incident.status === 'resolved' ? 'bg-emerald-500' : 
                          incident.status === 'investigating' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {incident.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(incident.date).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {incident.status !== "resolved" && incident.status !== "closed" ? (
                        <Button size="sm" variant="outline" onClick={() => resolveIncident(incident.id)}>
                          Resolve
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Article 71 Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>Providers of high-risk AI systems shall notify the market surveillance authorities of any serious incident or any malfunctioning which constitutes a breach of obligations.</p>
            <p className="font-bold text-foreground">Notification Window: 15 Days</p>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Automated Escalation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>System triggers automatic Article 72 categorization for incidents affecting health, safety, or fundamental rights.</p>
            <p className="font-bold text-foreground">Endpoint: /compliance/incidents/article-71</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
