/**
 * Shadow AI Monitor
 * Unauthorized AI tool detection and management
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Shield,
  Eye,
  ShieldAlert,
  ShieldCheck,
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import { extendedApi, type ShadowAIDetection } from "@/lib/api";
import { toast } from "sonner";

type ShadowDetection = ShadowAIDetection;

interface ShadowStats {
  total_detections: number;
  by_risk_level: Record<string, number>;
  by_status: Record<string, number>;
}

export default function ShadowAIMonitor() {
  const [detections, setDetections] = useState<ShadowDetection[]>([]);
  const [stats, setStats] = useState<ShadowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [detectionsData, statsData] = await Promise.all([
        extendedApi.shadowAI.detections(),
        extendedApi.shadowAI.stats(),
      ]);
      setDetections(detectionsData);
      setStats(statsData);
    } catch (err) {
      toast.error("Failed to load shadow AI data");
    } finally {
      setIsLoading(false);
    }
  }

  async function blockTool(toolId: string) {
    try {
      await extendedApi.shadowAI.blockTool(toolId);
      toast.success("Tool blocked successfully");
      loadData();
    } catch (err) {
      toast.error("Failed to block tool");
    }
  }

  async function allowTool(toolId: string) {
    try {
      await extendedApi.shadowAI.allowTool(toolId);
      toast.success("Tool allowed successfully");
      loadData();
    } catch (err) {
      toast.error("Failed to allow tool");
    }
  }

  const filteredDetections = detections.filter(
    d => riskFilter === "all" || d.risk_level === riskFilter
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shadow AI Monitor</h1>
          <p className="text-muted-foreground">
            Detect and manage unauthorized AI tool usage
          </p>
        </div>
        <Button onClick={loadData} variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Detections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_detections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats?.by_status?.blocked || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Allowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats?.by_status?.allowed || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.by_risk_level?.critical || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Protection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-block critical risk tools</Label>
              <p className="text-sm text-muted-foreground">
                Automatically block tools detected with critical risk level
              </p>
            </div>
            <Switch
              checked={autoBlockEnabled}
              onCheckedChange={setAutoBlockEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Detections</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Detected AI Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detections</TableHead>
                    <TableHead>Detected At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetections.map(detection => (
                    <TableRow key={detection.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {detection.risk_level === "critical" && (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                        {detection.risk_level === "high" && (
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                        )}
                        {detection.tool_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            detection.risk_level === "critical"
                              ? "destructive"
                              : detection.risk_level === "high"
                                ? "destructive"
                                : detection.risk_level === "medium"
                                  ? "default"
                                  : "outline"
                          }
                        >
                          {detection.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            detection.status === "remediated"
                              ? "destructive"
                              : detection.status === "approved"
                                ? "default"
                                : "outline"
                          }
                        >
                          {detection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{detection.user_count || 0}</TableCell>
                      <TableCell>
                        {detection.detected_at
                          ? new Date(detection.detected_at).toLocaleString()
                          : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {detection.status !== "remediated" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => blockTool(detection.id)}
                            >
                              <X className="w-3 h-3 mr-1" /> Block
                            </Button>
                          )}
                          {detection.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => allowTool(detection.id)}
                            >
                              <Check className="w-3 h-3 mr-1" /> Allow
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
