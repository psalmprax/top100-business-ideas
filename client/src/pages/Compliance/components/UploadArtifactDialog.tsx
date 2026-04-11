import * as React from "react";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload, FileText, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

interface UploadArtifactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: any;
  onUploadSuccess: () => void;
}

export const UploadArtifactDialog = ({
  open,
  onOpenChange,
  selectedModel,
  onUploadSuccess
}: UploadArtifactDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [artifactType, setArtifactType] = useState("conformity");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedModel) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("model_id", selectedModel.id);
    formData.append("artifact_type", artifactType);

    try {
      await extendedApi.compliance.uploadArtifact(formData);
      toast.success("Artifact Uploaded", {
        description: `${selectedFile.name} attached to ${selectedModel.name} audit trail.`
      });
      onUploadSuccess();
      onOpenChange(false);
      setSelectedFile(null);
    } catch (e) {
      toast.error("Upload failed", {
        description: "Regulator node rejected the artifact signature. Check file integrity."
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Upload Compliance Artifact
          </DialogTitle>
          <DialogDescription>
            Documents uploaded here are hashed and logged for Article 11 technical compliance.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Artifact Type</Label>
            <Select value={artifactType} onValueChange={setArtifactType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conformity">EU Declaration of Conformity</SelectItem>
                <SelectItem value="technical">Annex IV Technical Documentation</SelectItem>
                <SelectItem value="ethical">Ethical Impact Assessment</SelectItem>
                <SelectItem value="red_team">Red Team Audit Findings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>File Selection</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-colors ${
                selectedFile ? 'border-blue-500 bg-blue-500/5' : 'border-border hover:border-blue-500/50'
              }`}
            >
              {selectedFile ? (
                <>
                  <FileText className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7" 
                    onClick={() => setSelectedFile(null)}
                  >
                    Change File
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Drag and drop or click to select
                  </p>
                  <Input 
                    type="file" 
                    className="hidden" 
                    id="artifact-upload" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.json"
                  />
                  <Label 
                    htmlFor="artifact-upload" 
                    className="cursor-pointer"
                  >
                    <Button variant="outline" size="sm" asChild>
                      <span>Pick File</span>
                    </Button>
                  </Label>
                </>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-tight">
              By uploading, you certify that this document represents the true technical state of {selectedModel?.name}. 
              Artifacts are non-repudiable once registered.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? "Uploading..." : "Register Artifact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
