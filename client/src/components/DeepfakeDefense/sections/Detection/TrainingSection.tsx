import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { History, Info, Upload } from "lucide-react";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function TrainingSection() {
  const { isUploading, uploadProgress, handleUploadDataset } =
    useDeepfakeDefenseContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Grounds</CardTitle>
        <CardDescription>
          Enhance detection accuracy with custom datasets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <History className="w-8 h-8 mb-4 text-primary" />
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">Dataset Alpha</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-64 text-[10px]">
                          AlphaHecta's foundational benchmark dataset. Contains
                          30,000 high-fidelity video pairs (Real vs Synthetic)
                          used for training our baseline GenAI detection models.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  15,000 real/fake video pairs
                </p>
                <Button size="sm" variant="outline">
                  View Stats
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed flex items-center justify-center p-6 bg-primary/5">
            {isUploading ? (
              <div className="w-full space-y-3 px-4">
                <div className="flex justify-between text-xs font-mono">
                  <span>Uploading Dataset...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            ) : (
              <Button
                data-testid="btn-upload-training-content"
                variant="ghost"
                className="h-auto flex-col py-4 w-full"
                onClick={handleUploadDataset}
              >
                <Upload className="w-8 h-8 mb-2 text-primary opacity-60" />
                <span className="font-bold">Upload training set (.zip)</span>
                <span className="text-caption-premium text-muted-foreground mt-1">
                  Accepts RAW, PNG, WAV formats
                </span>
              </Button>
            )}
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
