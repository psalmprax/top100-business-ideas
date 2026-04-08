import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Box, 
  Cloud, 
  Database, 
  FileText, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Plus 
} from "lucide-react";
import { RiskBadge, StatusBadge } from "./ComplianceBadges";

interface ModelProfileDialogProps {
  selectedModelForView: any;
  setSelectedModelForView: (model: any) => void;
  handleToggleGuardrail: (key: string, value: boolean) => void;
  setShowUploadDialog: (show: boolean) => void;
  handleExportReport: (modelId: string) => Promise<void>;
  modelBreakdown: any;
  modelAudits: any[];
  modelHandshakes: any[];
  modelArtifacts: any[];
  handleDownload: (filename: string, content: string) => void;
  handleEURegister: (modelId: string) => Promise<any>;
}

export const ModelProfileDialog = ({
  selectedModelForView,
  setSelectedModelForView,
  handleToggleGuardrail,
  setShowUploadDialog,
  handleExportReport,
  modelBreakdown,
  modelAudits,
  modelHandshakes,
  modelArtifacts,
  handleDownload,
  handleEURegister,
}: ModelProfileDialogProps) => {
  return (
    <Dialog
      open={!!selectedModelForView}
      onOpenChange={open => !open && setSelectedModelForView(null)}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Box className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-card-title">
                {selectedModelForView?.name}
              </DialogTitle>
              <DialogDescription className="text-body-sm text-slate-400">
                Technical Compliance Profile & Audit History
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3 mt-4">
          {/* Key Stats */}
          <Card className="bg-muted/30 border-none">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-caption-premium text-muted-foreground">
                  Risk Taxonomy
                </Label>
                <div className="mt-1">
                  <RiskBadge category={selectedModelForView?.riskCategory} />
                </div>
              </div>
              <div>
                <Label className="text-caption-premium text-muted-foreground">
                  Aggregated Score
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Progress
                    value={selectedModelForView?.complianceScore}
                    className="h-2 flex-1"
                  />
                  <span className="font-mono text-card-title">
                    {selectedModelForView?.complianceScore}%
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-caption-premium text-muted-foreground">
                  Lifecycle Status
                </Label>
                <div className="mt-1">
                  <StatusBadge status={selectedModelForView?.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card className="md:col-span-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Compliance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Article 10 (Data Governance)</span>
                  <span className="text-green-500 font-bold">
                    {modelBreakdown?.dataGovernance || 0}%
                  </span>
                </div>
                <Progress
                  value={modelBreakdown?.dataGovernance || 0}
                  className="h-1.5"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Article 11 (Technical Docs)</span>
                  <span className="text-yellow-500 font-bold">
                    {modelBreakdown?.technicalDocs || 0}%
                  </span>
                </div>
                <Progress
                  value={modelBreakdown?.technicalDocs || 0}
                  className="h-1.5"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Article 61 (Post-Market)</span>
                  <span className="text-blue-500 font-bold">
                    {modelBreakdown?.postMarket || 0}%
                  </span>
                </div>
                <Progress
                  value={modelBreakdown?.postMarket || 0}
                  className="h-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="audit" className="mt-6">
          <TabsList className="w-full justify-start border-b rounded-none h-9 bg-transparent p-0 gap-6">
            <TabsTrigger
              value="audit"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-0 text-caption-premium font-bold"
            >
              Audit History
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-0 text-caption-premium font-bold"
            >
              System Handshakes
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-0 text-caption-premium font-bold"
            >
              Artifact Files
            </TabsTrigger>
            <TabsTrigger
              value="ethical"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-0 text-caption-premium font-bold"
            >
              Ethical Guardrails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="pt-4">
            <div className="space-y-4">
              {modelAudits.length > 0 ? (
                modelAudits.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium">{log.event}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-[10px]">
                        {log.status}
                      </Badge>
                      <span className="text-muted-foreground">{log.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-body-sm text-center text-muted-foreground py-8">
                  No audit history for this model.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {modelHandshakes.length > 0 ? (
                modelHandshakes.map((handshake, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {handshake.type === "registry" ? (
                        <Cloud className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Database className="w-5 h-5 text-orange-500" />
                      )}
                      <div>
                        <div className="text-card-title">
                          {handshake.system}
                        </div>
                        <div className="text-caption-premium font-mono">
                          {handshake.endpoint}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      {handshake.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 text-body-sm text-center text-muted-foreground py-8">
                  No active handshakes found.
                </div>
              )}
            </div>
            {selectedModelForView?.riskCategory === "high" && (
              <div className="mt-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">EU AI Act Handshake Required</div>
                  <div className="text-xs text-muted-foreground">Certified registration mandatory for high-risk deployment</div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleEURegister(selectedModelForView.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Register with EU Database
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                  Compliance Evidence
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] border-blue-500/30 hover:bg-blue-500/5 px-2"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Upload Artifact
                </Button>
              </div>
              {modelArtifacts.length > 0 ? (
                modelArtifacts.map((artifact: any, i: number) => (
                  <div
                    key={artifact.id || i}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer transition-colors group"
                    onClick={() =>
                      handleDownload(
                        artifact.filename || artifact.name,
                        artifact.content || ""
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
                      <span className="text-sm">
                        {artifact.filename || artifact.name}
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                ))
              ) : (
                <div className="text-body-sm text-center text-muted-foreground py-8">
                  No artifacts uploaded yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ethical" className="pt-4">
            <div className="space-y-6">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <CardTitle>Real-time Ethical Guardrails</CardTitle>
                  </div>
                  <CardDescription>
                    Live model weight adjustments and bias mitigation triggers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Active Bias Mitigation</Label>
                          <p className="text-body-sm text-muted-foreground">
                            Automatically adjust weights to prevent disparate
                            impact
                          </p>
                        </div>
                        <Switch
                          checked={
                            selectedModelForView?.activeBiasMitigation || false
                          }
                          onCheckedChange={(v: boolean) =>
                            handleToggleGuardrail("activeBiasMitigation", v)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Toxic Language Filter</Label>
                          <p className="text-body-sm text-muted-foreground">
                            Real-time prevention of offensive content generation
                          </p>
                        </div>
                        <Switch
                          checked={
                            selectedModelForView?.toxicLanguageFilter || false
                          }
                          onCheckedChange={(v: boolean) =>
                            handleToggleGuardrail("toxicLanguageFilter", v)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Prompt Privacy Guard</Label>
                          <p className="text-body-sm text-muted-foreground">
                            Redact PII before it reaches the model core
                          </p>
                        </div>
                        <Switch
                          checked={
                            selectedModelForView?.promptPrivacyGuard || false
                          }
                          onCheckedChange={(v: boolean) =>
                            handleToggleGuardrail("promptPrivacyGuard", v)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
