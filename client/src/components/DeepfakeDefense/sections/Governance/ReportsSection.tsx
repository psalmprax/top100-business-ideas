import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function ReportsSection() {
  const { handleDownload, setShowGenerateReportDialog } =
    useDeepfakeDefenseContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Security Reports</CardTitle>
          <CardDescription>
            Generate authenticity certifications
          </CardDescription>
        </div>
        <Button
          data-testid="btn-generate-report"
          variant="outline"
          onClick={() => setShowGenerateReportDialog(true)}
        >
          <FileText className="w-4 h-4 mr-2" /> Generate Report
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-body-sm font-medium">
                Monthly Threat Summary
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                handleDownload("security-report-q1.pdf", "INFRASTRUCTURE_AUDIT")
              }
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 rounded-lg border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-body-sm font-medium">
                GDPR Compliance Export
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDownload("mitigation-log.pdf", "THREAT_LOG")}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
