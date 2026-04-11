import React from "react";
import { 
  Zap, 
  Download, 
  Image as ImageIcon, 
  Video, 
  Mic,
  Activity
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DetectorsSectionProps {
  mediaType: string;
  setMediaType: (val: string) => void;
  analyses: any[];
  onShowTestDialog: () => void;
  onExport: () => void;
}

export function DetectorsSection({
  mediaType,
  setMediaType,
  analyses,
  onShowTestDialog,
  onExport
}: DetectorsSectionProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            AI Detectors
          </CardTitle>
          <CardDescription className="text-xs">
            Manage and test autonomous deepfake detection algorithms.
          </CardDescription>
        </div>
        <Button
          data-testid="btn-test-detector"
          onClick={onShowTestDialog}
          className="font-bold shadow-lg shadow-primary/20"
        >
          <Zap className="w-4 h-4 mr-2" /> Test Detector
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-6">
          <Select value={mediaType} onValueChange={setMediaType}>
            <SelectTrigger className="w-48 bg-background/50 border-border/50">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onExport} className="border-border/50 bg-background/50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/30">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Media</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Type</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Result</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses
                .filter(a => mediaType === "all" || a.mediaType === mediaType)
                .map((analysis) => (
                  <TableRow key={analysis.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center border border-border/50">
                          {analysis.mediaType === "image" ? (
                            <ImageIcon className="w-4 h-4 text-primary" />
                          ) : analysis.mediaType === "video" ? (
                            <Video className="w-4 h-4 text-primary" />
                          ) : (
                            <Mic className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="truncate max-w-[200px] text-xs font-mono opacity-70">
                          {analysis.mediaUrl.split("/").pop() || "unknown_media"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-[10px] font-bold opacity-60">
                      {analysis.mediaType}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={analysis.result === "real" ? "default" : "destructive"}
                        className={`text-[9px] h-4 leading-none font-black uppercase px-2 ${
                          analysis.result === "real" ? "bg-emerald-500 hover:bg-emerald-600" : ""
                        }`}
                      >
                        {analysis.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black tabular-nums text-sm">
                      {(
                        analysis.confidence * (analysis.confidence > 1 ? 1 : 100)
                      ).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              {analyses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-40 text-center text-muted-foreground italic text-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="w-10 h-10 opacity-20" />
                      No active analyses detected in current session buffer.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
