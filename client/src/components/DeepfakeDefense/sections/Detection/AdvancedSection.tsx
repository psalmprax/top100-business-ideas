import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Zap, Activity } from "lucide-react";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function AdvancedSection() {
  const {
    isAnalyzing,
    handleRunEnterpriseScan,
    advancedResult,
    scanProgress,
    scanStage,
  } = useDeepfakeDefenseContext();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Advanced Forensic Analysis
          </CardTitle>
          <CardDescription>
            Professional-grade deepfake detection with enterprise scanning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-8 rounded-lg border-2 border-dashed bg-muted/20 flex flex-col items-center justify-center text-center">
            <Upload className="w-12 h-12 mb-4 text-muted-foreground opacity-40" />
            <p className="font-medium mb-1">
              Drop high-resolution media for forensic analysis
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports 4K video, RAW images, and lossless audio formats
            </p>
            <Button
              onClick={handleRunEnterpriseScan}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-orange-500 to-red-600"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Scanning... {scanProgress}%
                </>
              ) : (
                "Enterprise Scan"
              )}
            </Button>
            {scanStage && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                {scanStage}
              </p>
            )}
          </div>

          {advancedResult && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  {advancedResult.liveness_score
                    ? `${(advancedResult.liveness_score * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Liveness Score
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {advancedResult.authenticity_score
                    ? `${(advancedResult.authenticity_score * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Authenticity
                </div>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {advancedResult.artifacts_detected || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Artifacts Detected
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
