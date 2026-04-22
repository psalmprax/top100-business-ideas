import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Database, Zap, Activity, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { extendedApi, type ComplianceConnection } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ConnectionDialog } from "../../../pages/Compliance/components/ConnectionDialog";

interface Article {
  article: string;
  title: string;
  description: string;
  risk: string;
  status: string;
  evidence: string;
  remediation: string;
  integrationType: string;
  scanType: string;
}

interface ChecklistSectionProps {
  articles: Article[];
  loading: boolean;
}

export const ChecklistSection = ({
  articles,
  loading,
}: ChecklistSectionProps) => {
  const [connectedSystems, setConnectedSystems] = useState<
    Record<string, ComplianceConnection>
  >({});
  const [scanningArticles, setScanningArticles] = useState<
    Record<string, boolean>
  >({});
  const [lastScanResults, setLastScanResults] = useState<Record<string, any>>(
    {}
  );
  const [showScanConfigDialog, setShowScanConfigDialog] = useState(false);
  const [selectedArticleForScan, setSelectedArticleForScan] =
    useState<Article | null>(null);
  const [scanSensitivity, setScanSensitivity] = useState(75);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchConnections = async () => {
      if (!isAuthenticated) return;
      try {
        const conns = await extendedApi.compliance.listConnections();
        const connMap: Record<string, ComplianceConnection> = {};
        conns.forEach((c: ComplianceConnection) => {
          connMap[c.article_id] = c;
        });
        setConnectedSystems(connMap);
      } catch (e) {
        console.error("Failed to load compliance connections:", e);
      }
    };
    fetchConnections();
  }, [isAuthenticated]);

  const handleConnect = async (
    articleId: string,
    connectionType: string,
    config: Record<string, unknown>
  ) => {
    try {
      const result = await extendedApi.compliance.connectSystem(
        articleId,
        connectionType,
        config
      );
      setConnectedSystems(prev => ({ ...prev, [articleId]: result }));
      toast.success(`Handshake established for ${articleId}`);
    } catch (e: any) {
      toast.error(`Connection failed: ${e.message}`);
      throw e;
    }
  };

  const handleRunScan = async (articleId: string, scanType: string) => {
    setScanningArticles(prev => ({ ...prev, [articleId]: true }));
    try {
      const result = await extendedApi.compliance.runScan(articleId, scanType);
      setLastScanResults(prev => ({ ...prev, [articleId]: result }));
      toast.success(`Orchestrated ${scanType} for ${articleId} completed`);
    } catch (e: any) {
      toast.error(`Scan orchestration failed: ${e.message}`);
    } finally {
      setScanningArticles(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-500">Compliant</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "not_started":
        return <Badge variant="destructive">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "unacceptable":
        return <Badge variant="destructive">Unacceptable Risk</Badge>;
      case "high":
        return <Badge className="bg-red-500">High Risk</Badge>;
      case "limited":
        return <Badge className="bg-yellow-500">Limited Risk</Badge>;
      case "minimal":
        return <Badge className="bg-green-500">Minimal Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const compliantCount = articles.filter(
    (a: Article) => a.status === "compliant"
  ).length;
  const inProgressCount = articles.filter(
    (a: Article) => a.status === "in_progress"
  ).length;
  const notStartedCount = articles.filter(
    (a: Article) => a.status === "not_started"
  ).length;
  const progressPercent =
    articles.length > 0
      ? Math.round((compliantCount / articles.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-zinc-400 animate-pulse">
          Synchronizing Global Compliance Registry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-card-title">
            EU AI Act Compliance Overview
          </CardTitle>
          <CardDescription className="text-feature">
            Track compliance status across all EU AI Act requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-stat text-green-500">{compliantCount}</div>
              <div className="text-stat-label mt-0.5">Compliant</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-stat text-yellow-500">{inProgressCount}</div>
              <div className="text-stat-label mt-0.5">In Progress</div>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-stat text-red-500">{notStartedCount}</div>
              <div className="text-stat-label mt-0.5">Not Started</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-stat text-blue-500">{progressPercent}%</div>
              <div className="text-stat-label mt-0.5">Overall Progress</div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-card-title font-mono">
                    {article.article}
                  </span>
                  <span className="text-card-title">{article.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getRiskBadge(article.risk)}
                  {getStatusBadge(article.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {article.description}
              </p>

              <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Integration: {article.integrationType}
                  </span>
                  {connectedSystems[article.article] && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-4 px-1 border-blue-500/30 text-blue-400 capitalize"
                    >
                      {connectedSystems[
                        article.article
                      ]?.connection_type?.replace("_", " ") ||
                        article.integrationType}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {connectedSystems[article.article] ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-500 border-green-500/50 hover:bg-green-500/10 active:scale-95 transition-all"
                      disabled={scanningArticles[article.article]}
                      onClick={() => {
                        setSelectedArticleForScan(article);
                        setShowScanConfigDialog(true);
                      }}
                    >
                      {scanningArticles[article.article] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />{" "}
                          Scanning Platform...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1" /> Configure & Run{" "}
                          {article.scanType}
                        </>
                      )}
                    </Button>
                  ) : (
                    <ConnectionDialog
                      article={article}
                      onConnect={(connectionType, config) =>
                        handleConnect(article.article, connectionType, config)
                      }
                    />
                  )}

                  {lastScanResults[article.article] && (
                    <div className="flex items-center gap-2 ml-2 p-1 px-2 rounded bg-green-500/20 border border-green-500/30 text-[10px] text-green-400 animate-in fade-in zoom-in duration-300">
                      <BadgeCheck className="w-3 h-3" />
                      Last:{" "}
                      {Math.round(
                        lastScanResults[article.article].results?.metrics
                          ?.compliance_rate * 100
                      )}
                      % Pass
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="font-medium mb-1">Evidence Required</div>
                  <div className="text-muted-foreground">
                    {article.evidence}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="font-medium mb-1">Remediation Action</div>
                  <div className="text-muted-foreground">
                    {article.remediation}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={showScanConfigDialog}
        onOpenChange={setShowScanConfigDialog}
      >
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Configure Article {selectedArticleForScan?.article} Scan
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Set parameters for the {selectedArticleForScan?.scanType}{" "}
              orchestration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Scan Sensitivity / Depth</Label>
                <span className="text-xs font-mono text-yellow-500">
                  {scanSensitivity}%
                </span>
              </div>
              <Progress value={scanSensitivity} className="h-2" />
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map(v => (
                  <Button
                    key={v}
                    variant="outline"
                    size="sm"
                    className={`text-[10px] ${scanSensitivity === v ? "border-yellow-500 bg-yellow-500/10" : ""}`}
                    onClick={() => setScanSensitivity(v)}
                  >
                    {v}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Dataset / Environment</Label>
              <Select defaultValue="prod">
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="prod">
                    Production Inference Logs
                  </SelectItem>
                  <SelectItem value="staging">
                    Staging / Pre-market Cluster
                  </SelectItem>
                  <SelectItem value="training">
                    Training / Gold Dataset v4
                  </SelectItem>
                  <SelectItem value="adversarial">
                    Adversarial Test Suite
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded bg-zinc-900 border border-zinc-800">
              <Switch id="auto-remediate" />
              <Label
                htmlFor="auto-remediate"
                className="text-xs font-medium cursor-pointer"
              >
                Enable Auto-Remediation (Article 15 compatible)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-yellow-600 hover:bg-yellow-700 font-bold"
              onClick={() => {
                if (selectedArticleForScan) {
                  handleRunScan(
                    selectedArticleForScan.article,
                    selectedArticleForScan.scanType
                  );
                  setShowScanConfigDialog(false);
                }
              }}
            >
              Orchestrate Scan Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
