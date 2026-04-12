import { useState, useEffect } from "react";
import { 
  Search, 
  ShieldX, 
  HandMetal, 
  Ban, 
  Eye,
  RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { extendedApi } from "@/lib/api";
import { toast } from "sonner";

export function ShadowAISection() {
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetections();
  }, []);

  async function loadDetections() {
    setLoading(true);
    try {
      const data = await extendedApi.shadowAI.detections();
      setDetections(data || []);
    } catch (err) {
      console.error("Failed to fetch shadow AI detections", err);
    } finally {
      setLoading(false);
    }
  }

  async function blockTool(id: string) {
    try {
      await extendedApi.shadowAI.blockTool(id);
      toast.success("Tool blocked successfully");
      loadDetections();
    } catch (err) {
      toast.error("Failed to block tool");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">Scanning network for unvetted AI tools...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldX className="w-5 h-5 text-orange-500" />
            Shadow AI Detection
          </h3>
          <p className="text-sm text-muted-foreground">Identifying unauthorized AI use across corporate infrastructure</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Search className="w-4 h-4" />
            Active Detections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>User / IP</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No unauthorized AI tools detected.
                  </TableCell>
                </TableRow>
              ) : (
                detections.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{d.name || d.tool_name}</TableCell>
                    <TableCell>{d.user_id || d.ip_address}</TableCell>
                    <TableCell>
                      <Badge variant={d.risk_level === "high" ? "destructive" : "outline"} className="capitalize">
                        {d.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{d.status}</TableCell>
                    <TableCell>
                      {d.status !== "blocked" && (
                        <Button size="sm" variant="destructive" onClick={() => blockTool(d.id)}>
                          <Ban className="w-3 h-3 mr-1" /> Block
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
    </div>
  );
}
