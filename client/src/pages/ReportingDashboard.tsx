/**
 * Reporting Dashboard
 * Export and view reports
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  BarChart3,
  FileBarChart,
  FileSpreadsheet,
} from "lucide-react";
import { extendedApi } from "@/lib/api";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface Report {
  id: string;
  type: string;
  status: "generating" | "ready" | "failed";
  created_at: string;
  download_url?: string;
  size?: string;
}

export default function ReportingDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const artifacts = await extendedApi.compliance.listArtifacts() as unknown as Record<string, unknown>[];
      // Map artifacts to Report interface
      const mappedReports: Report[] = (artifacts || []).map((art) => ({
        id: (art.id as string) || String(Math.random()),
        type: (art.report_type as string) || (art.type as string) || "Compliance",
        status: "ready", // Artifacts are by definition ready
        created_at: (art.created_at as string) || new Date().toISOString(),
        download_url: (art.url as string) || (art.download_url as string),
        size: (art.size as string) || "KB",
      }));
      setReports(
        mappedReports.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }

  async function generateReport(type: string = "compliance") {
    setIsGenerating(true);
    try {
      toast.info(`Generating ${type} report...`);
      const result = await extendedApi.compliance.exportReport(undefined, type) as unknown as { url?: string; download_url?: string } | null;

      if (result && (result.url || result.download_url)) {
        toast.success(`${type} report ready`);
        // Refresh history to show the new report
        await loadData();

        // Auto-download? For now let's just let the user download from history
        // window.open(result.url || result.download_url, '_blank');
      } else {
        toast.info("Report queued. Check history in a few moments.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  }

  async function downloadArtifact(url: string, _name: string) {
    if (!url) {
      toast.error("Download URL not found");
      return;
    }

    try {
      window.open(url, "_blank");
    } catch {
      toast.error("Download failed");
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader
        title="Reporting Dashboard"
        description="Generate and download system reports"
        onRefresh={loadData}
      />

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="w-5 h-5" />
                  Compliance Report
                </CardTitle>
                <CardDescription>
                  EU AI Act compliance status and audit trail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => generateReport("compliance")}
                  disabled={isGenerating}
                >
                  <Download className="w-4 h-4 mr-2" /> Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Report
                </CardTitle>
                <CardDescription>
                  LLM performance metrics and optimization insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => generateReport("performance")}
                  disabled={isGenerating}
                >
                  <Download className="w-4 h-4 mr-2" /> Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Billing Report
                </CardTitle>
                <CardDescription>
                  Usage statistics and cost breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => generateReport("billing")}
                  disabled={isGenerating}
                >
                  <Download className="w-4 h-4 mr-2" /> Generate
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Previous Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No reports generated yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {report.type}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              report.status === "ready"
                                ? "default"
                                : report.status === "failed"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{report.size}</TableCell>
                        <TableCell>
                          {report.download_url && (
                            <Button
                              size="sm"
                              onClick={() =>
                                downloadArtifact(
                                  report.download_url!,
                                  report.type
                                )
                              }
                            >
                              <Download className="w-3 h-3 mr-1" /> Download
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
