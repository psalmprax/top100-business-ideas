import { useState, useEffect } from "react";
import {
  Search,
  ShieldX,
  HandMetal,
  Ban,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Globe,
  FileText,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  extendedApi,
  type ShadowAIDetection,
  type ShadowAIStats,
  type ShadowAIReport,
} from "@/lib/api";
import { toast } from "sonner";

export function ShadowAISection() {
  const [detections, setDetections] = useState<ShadowAIDetection[]>([]);
  const [stats, setStats] = useState<ShadowAIStats | null>(null);
  const [report, setReport] = useState<ShadowAIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [detectUrl, setDetectUrl] = useState("");
  const [scanLogs, setScanLogs] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    loadDetections();
    loadStats();
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

  async function loadStats() {
    try {
      const data = await extendedApi.shadowAI.stats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }

  async function blockTool(id: string) {
    try {
      await extendedApi.shadowAI.blockTool(id);
      toast.success("Tool blocked successfully");
      loadDetections();
      loadStats();
    } catch (err) {
      toast.error("Failed to block tool");
    }
  }

  async function handleDetect() {
    if (!detectUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    setDetecting(true);
    try {
      const result = await extendedApi.shadowAI.detect(detectUrl);
      if (result.status === "detected" && result.detection) {
        toast.success(
          `Shadow AI detected: ${result.detection.tool_name || "Unknown tool"}`
        );
        loadDetections();
        loadStats();
        setDetectUrl("");
      } else {
        toast.info("No Shadow AI detected at this URL");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Detection failed");
    } finally {
      setDetecting(false);
    }
  }

  async function handleScanLogs() {
    if (!scanLogs.trim()) {
      toast.error("Please enter logs to scan");
      return;
    }
    const logs = scanLogs.split("\n").filter(line => line.trim());
    if (logs.length === 0) {
      toast.error("No valid log entries found");
      return;
    }
    setScanning(true);
    try {
      const result = await extendedApi.shadowAI.scanLogs(logs);
      toast.success(`Scan complete: ${result.count} detections found`);
      loadDetections();
      loadStats();
      setScanLogs("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Log scan failed");
    } finally {
      setScanning(false);
    }
  }

  async function loadReport() {
    setLoadingReport(true);
    try {
      const data = await extendedApi.shadowAI.getReport();
      setReport(data);
      toast.success("Report generated");
    } catch (err) {
      toast.error("Failed to generate report");
    } finally {
      setLoadingReport(false);
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "detected":
        return "destructive";
      case "blocked":
        return "destructive";
      case "allowed":
        return "secondary";
      case "monitoring":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">
          Scanning network for unvetted AI tools...
        </p>
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
          <p className="text-sm text-muted-foreground">
            Identifying unauthorized AI use across corporate infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadDetections} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Detections
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_detections || 0}
              </div>
              <p className="text-xs text-muted-foreground">Across all tools</p>
            </CardContent>
          </Card>
          {stats.by_risk_level &&
            Object.entries(stats.by_risk_level).map(([risk, count]) => (
              <Card key={risk}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {risk} Risk
                  </CardTitle>
                  <AlertTriangle
                    className={`h-4 w-4 ${risk === "high" ? "text-red-500" : risk === "medium" ? "text-yellow-500" : "text-blue-500"}`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count as number}</div>
                  <p className="text-xs text-muted-foreground">
                    Tools requiring attention
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Manual Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Manual URL Detection
          </CardTitle>
          <CardDescription>Test a URL for Shadow AI tool usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="detect-url" className="sr-only">
                URL to scan
              </Label>
              <Input
                id="detect-url"
                placeholder="Enter URL (e.g., https://chatgpt.com)"
                value={detectUrl}
                onChange={e => setDetectUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleDetect()}
              />
            </div>
            <Button onClick={handleDetect} disabled={detecting}>
              {detecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Detect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Proxy Log Scanner
          </CardTitle>
          <CardDescription>
            Paste proxy logs to scan for Shadow AI usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="log-input">Log Entries (one per line)</Label>
            <Textarea
              id="log-input"
              placeholder='192.168.1.10 - - [17/Apr/2026:10:30:00] "GET /api/chat/completions HTTP/1.1"...'
              value={scanLogs}
              onChange={e => setScanLogs(e.target.value)}
              className="min-h-[100px] font-mono text-sm"
            />
            <Button
              onClick={handleScanLogs}
              disabled={scanning}
              variant="outline"
            >
              {scanning ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Scan Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detection Report
              </CardTitle>
              <CardDescription>
                Comprehensive Shadow AI usage analysis
              </CardDescription>
            </div>
            <Button onClick={loadReport} disabled={loadingReport} size="sm">
              {loadingReport ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {report ? (
            <div className="space-y-4">
              {report.summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total Detections
                    </p>
                    <p className="text-2xl font-bold">
                      {report.summary.total_detections || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">High Risk</p>
                    <p className="text-2xl font-bold text-red-600">
                      {report.summary.high_risk || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Departments Affected
                    </p>
                    <p className="text-2xl font-bold">
                      {report.summary.departments_affected || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Blocked Tools
                    </p>
                    <p className="text-2xl font-bold">
                      {report.summary.blocked_tools || 0}
                    </p>
                  </div>
                </div>
              )}
              {report.recommendations && report.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {report.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.top_tools && report.top_tools.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Top Shadow AI Tools</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tool</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.top_tools.map((tool, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {tool.tool_name}
                          </TableCell>
                          <TableCell>{tool.vendor}</TableCell>
                          <TableCell>{tool.department}</TableCell>
                          <TableCell>{tool.user_count}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getRiskColor(tool.risk_level)}
                              className="capitalize"
                            >
                              {tool.risk_level}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>
                No report generated yet. Click "Generate Report" to create a
                comprehensive analysis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Detections Table */}
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
                <TableHead>Vendor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detections.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No unauthorized AI tools detected.
                  </TableCell>
                </TableRow>
              ) : (
                detections.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{d.tool_name}</TableCell>
                    <TableCell>{d.vendor || "-"}</TableCell>
                    <TableCell>{d.department || "-"}</TableCell>
                    <TableCell>{d.user_count || 1}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getRiskColor(d.risk_level)}
                        className="capitalize"
                      >
                        {d.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {d.detected_at
                        ? new Date(d.detected_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(d.status)}
                        className="capitalize"
                      >
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {d.status === "detected" ||
                      d.status === "investigating" ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => blockTool(d.id)}
                          >
                            <Ban className="w-3 h-3 mr-1" /> Block
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              try {
                                await extendedApi.shadowAI.allowTool(d.id);
                                toast.success("Tool approved");
                                loadDetections();
                                loadStats();
                              } catch (err) {
                                toast.error("Failed to approve tool");
                              }
                            }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                        </div>
                      ) : d.status === "remediated" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await extendedApi.shadowAI.allowTool(d.id);
                              toast.success("Tool unblocked");
                              loadDetections();
                              loadStats();
                            } catch (err) {
                              toast.error("Failed to unblock tool");
                            }
                          }}
                        >
                          Unblock
                        </Button>
                      ) : null}
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
