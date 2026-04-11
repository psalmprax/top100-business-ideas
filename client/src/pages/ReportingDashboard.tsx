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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Clock,
  RefreshCw,
  CheckCircle2,
  FileBarChart,
  FileSpreadsheet,
} from "lucide-react";
import { extendedApi } from "@/lib/api";
import { toast } from "sonner";

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
  const [reportType, setReportType] = useState("compliance");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      // TODO: Add reports list endpoint
      setReports([]);
    } catch (err) {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }

  async function generateReport() {
    setIsGenerating(true);
    try {
      toast.success("Report generation started");
    } catch (err) {
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reporting Dashboard</h1>
          <p className="text-muted-foreground">
            Generate and download system reports
          </p>
        </div>
        <Button onClick={loadData} variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

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
                  onClick={generateReport}
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
                  onClick={generateReport}
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
                  onClick={generateReport}
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
                          {report.status === "ready" && (
                            <Button size="sm">
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
