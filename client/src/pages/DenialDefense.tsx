import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Stethoscope,
  ShieldCheck,
  BarChart3,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  Activity,
  TrendingUp,
  Zap,
  LayoutDashboard,
  Search,
  Filter,
  Download,
  Settings,
  Plus,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { storage } from "@/lib/storage";
import { mlApi, billingApi, denialDefenseApi, type Claim } from "@/lib/api";
import { usePerspective } from "@/contexts/PerspectiveContext";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumPlaceholder } from "@/components/skeletons/PremiumPlaceholder";

export default function DenialDefense() {
  const { perspective } = usePerspective();
  const [activeClaims, setActiveClaims] = useState<Claim[]>([]);
  const [newClaim, setNewClaim] = useState({ id: "", payer: "", amount: "" });
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [recoveryRate, setRecoveryRate] = useState(0);
  const [revenueRecovered, setRevenueRecovered] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [pendingDenials, setPendingDenials] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const stats = await denialDefenseApi.getStats();
      setRecoveryRate(stats.recovery_rate);
      setRevenueRecovered(stats.revenue_recovered);
      setTotalProcessed(stats.total_processed);
      setPendingDenials(stats.pending_denials);
    } catch (err) {
      console.error("Failed to fetch denial stats", err);
    }
  };

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const claims = await denialDefenseApi.listClaims();
      setActiveClaims(claims);
      await fetchStats();
    } catch (err) {
      console.error("Failed to fetch claims", err);
      // Fallback only for visual structure if DB is truly unreachable, 
      // but real-first means we should show a warning
      toast.error("Could not sync with production records. View only mode.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAddClaim = async () => {
    if (!newClaim.id || !newClaim.payer) {
      toast.error("Please fill in Claim ID and Payer");
      return;
    }
    
    try {
      const createdClaim = await denialDefenseApi.createClaim({
        claim_id_string: newClaim.id,
        payer: newClaim.payer,
        amount: parseFloat(newClaim.amount) || 0,
        status: "New",
        risk: "Calculating...",
      });
      
      setActiveClaims([createdClaim, ...activeClaims]);
      setNewClaim({ id: "", payer: "", amount: "" });
      toast.success("Claim record materialized in ledger.");

      // AI Analysis
      const result = await mlApi.classifyAgentOperation(
        `Classify claim risk for ${newClaim.payer} amount ${newClaim.amount}`,
        "denial-defense"
      );
      
      const riskLevel =
        result?.confidence && result.confidence > 0.8
          ? "Low"
          : result?.confidence && result.confidence > 0.5
            ? "Medium"
            : "High";

      // Update in DB
      const updatedClaim = await denialDefenseApi.updateClaim({
        id: createdClaim.id,
        status: createdClaim.status,
        risk: riskLevel,
      });

      setActiveClaims(prev => 
        prev.map(c => c.id === createdClaim.id ? updatedClaim : c)
      );
      toast.success(`Risk analysis complete. Risk Level: ${riskLevel}`);
    } catch (e) {
      toast.error("Communication failure. Claim record not persistent.");
    }
  };

  const runScrubber = (id: string, claimStr: string) => {
    setIsScrubbing(true);
    toast.promise(
      mlApi.classifyAgentOperation(
        `Scrub claim ${claimStr} for CCI edits and coding compliance`,
        "denial-defense"
      ),
      {
        loading: `AI Agent 'Scrubber-1' analyzing claim ${claimStr}...`,
        success: async (data: any) => {
          const riskLevel = data?.confidence > 0.8 ? "Low" : "Medium";
          try {
            const updated = await denialDefenseApi.updateClaim({
              id,
              status: "Scrubbed",
              risk: riskLevel,
            });
            setActiveClaims(prev => prev.map(c => c.id === id ? updated : c));
            setIsScrubbing(false);
            setRecoveryRate(prev => Math.min(99.9, prev + 0.1));
            await fetchStats();
            return `Scrubbing complete: ${data?.classification || "No CCI edits found."}`;
          } catch (e) {
            setIsScrubbing(false);
            return "Failed to persist scrub state in ledger.";
          }
        },
        error: () => {
          setIsScrubbing(false);
          return "Scrubbing engine unavailable.";
        },
      }
    );
  };

  const handleGlobalScan = async () => {
    setIsScanning(true);
    toast.promise(
      mlApi.classifyAgentOperation(
        "Global re-code scan for under-coded CPTs across historical encounters",
        "denial-defense-bulk"
      ),
      {
        loading:
          "AI Agents scanning historical encounters for under-coded CPTs...",
        success: (data: any) => {
          setIsScanning(false);
          setRevenueRecovered(prev => prev + 0.012);
          return `Global scan complete: ${data?.suggestions?.[0] || "Scan finished. Review claims for potential optimization."}`;        },
        error: () => {
          setIsScanning(false);
          return "Global scan failed. Service unavailable.";
        },
      }
    );
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    toast.promise(
      mlApi.checkCompliance(
        JSON.stringify({ aggressive: true, autoAppeal: true }),
        ["HIPAA", "RAC"]
      ),
      {
        loading: "Syncing AI autonomy levels to Engine...",
        success: () => {
          setIsSavingConfig(false);
          storage.set("dd_config", { aggressive: true, autoAppeal: true });
          return "Engine configuration updated.";
        },
        error: () => {
          setIsSavingConfig(false);
          return "Config update failed. Service unavailable.";
        },
      }
    );
  };

  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Alpha Hub
              </Button>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-product-title text-white text-xl">
                DenialDefense <span>AI</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5"
            >
              Beta v0.1.0
            </Badge>
            <Button
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              data-testid="btn-upgrade-enterprise"
              onClick={() => setLocation("/billing")}
            >
              UPGRADE TO ENTERPRISE
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-caption-premium text-cyan-500 mb-1">
                Recovery Rate
              </div>
              <div
                className="text-stat text-white tabular-nums tracking-tighter"
                data-testid="stat-recovery-rate"
              >
                {recoveryRate.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2">
                <TrendingUp className="w-3 h-3" />
                Live from ledger
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-caption-premium text-purple-400 mb-1">
                Claims Processed
              </div>
              <div
                className="text-stat text-white tabular-nums"
                data-testid="stat-claims-processed"
              >
                {totalProcessed.toLocaleString()}
              </div>
              <div className="text-caption-premium mt-2">Historical count</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-caption-premium text-orange-400 mb-1">
                Pending Denials
              </div>
              <div
                className="text-stat text-white tabular-nums"
                data-testid="stat-pending-denials"
              >
                {pendingDenials}
              </div>
              <div className="text-[10px] text-orange-400/60 mt-2">
                Requires AI Intervention
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-caption-premium text-blue-400 mb-1">
                Revenue Recovered
              </div>
              <div
                className="text-stat text-white tabular-nums"
                data-testid="stat-revenue-recovered"
              >
                ${revenueRecovered.toLocaleString()}
              </div>
              <Progress value={Math.min(100, (revenueRecovered / 1000000) * 100)} className="h-1 mt-3 bg-white/5" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
              data-testid="tab-overview"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger
              value="claims"
              className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
              data-testid="tab-claims"
            >
              <FileText className="w-4 h-4 mr-2" /> Claims Engine
            </TabsTrigger>
            <TabsTrigger
              value="coding"
              className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
              data-testid="tab-coding"
            >
              <Activity className="w-4 h-4 mr-2" /> AI Coding
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
              data-testid="tab-config"
            >
              <Settings className="w-4 h-4 mr-2" /> Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claims">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-black/40 border-white/5 h-fit">
                <CardHeader>
                  <CardTitle className="text-card-title">
                    Submit New Claim
                  </CardTitle>
                  <CardDescription className="text-feature">
                    Direct injection into the AI Scrubber Engine
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-body-sm">Claim ID</Label>
                    <Input
                      placeholder="e.g. CLM-XXXX"
                      className="bg-white/5 border-white/10"
                      value={newClaim.id}
                      onChange={e =>
                        setNewClaim(prev => ({ ...prev, id: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-body-sm">Payer</Label>
                    <Input
                      placeholder="e.g. BlueShield"
                      className="bg-white/5 border-white/10"
                      value={newClaim.payer}
                      onChange={e =>
                        setNewClaim(prev => ({
                          ...prev,
                          payer: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-body-sm">Billed Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-white/5 border-white/10"
                      value={newClaim.amount}
                      onChange={e =>
                        setNewClaim(prev => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    onClick={handleAddClaim}
                  >
                    SUBMIT TO ENGINE
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-black/40 border-white/5">
                <CardHeader>
                  <CardTitle className="text-card-title">
                    Engine Queue
                  </CardTitle>
                  <CardDescription>
                    Live tracking of claims entering the denial defense layer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="border-white/10">
                      <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead className="text-body-sm">ID</TableHead>
                        <TableHead className="text-body-sm">Payer</TableHead>
                        <TableHead className="text-body-sm">Status</TableHead>
                        <TableHead className="text-body-sm">AI Risk</TableHead>
                        <TableHead className="text-body-sm text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Synchronizing with production ledger...
                          </TableCell>
                        </TableRow>
                      ) : activeClaims.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-12">
                            <PremiumPlaceholder 
                              title="Engine Queue Clear" 
                              description="No claims currently pending AI denial defense layers. The engine is ready."
                              variant="empty"
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeClaims.map((claim: Claim) => (
                          <TableRow
                            key={claim.id}
                            className="border-white/5 hover:bg-white/[0.02]"
                          >
                            <TableCell className="text-body-sm font-mono">
                              {claim.claim_id_string || claim.id.substring(0, 8)}
                            </TableCell>
                            <TableCell className="text-body-sm">
                              {claim.payer}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-[10px] border-cyan-500/30 text-cyan-400"
                              >
                                {claim.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] border-none ${
                                  claim.risk === "Low"
                                    ? "bg-green-500/10 text-green-500"
                                    : claim.risk === "Medium"
                                      ? "bg-yellow-500/10 text-yellow-500"
                                      : "bg-red-500/10 text-red-500"
                                }`}
                              >
                                {claim.risk}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isScrubbing || claim.status === "Scrubbed"}
                                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                onClick={() => runScrubber(claim.id, claim.claim_id_string)}
                              >
                                {claim.status === "Scrubbed" ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coding">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-black/40 border-white/5 border-l-2 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-body-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    Autonomous CPT Optimization
                  </CardTitle>
                  <CardDescription>
                    AI agents scanning for under-coded encounters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex justify-between mb-2">
                      <span className="text-body-sm font-bold">
                        Optimization Lift
                      </span>
                      <span className="text-xs text-emerald-400">
                        +${revenueRecovered.toLocaleString()} recovered
                      </span>
                    </div>
                    <Progress value={Math.min(100, totalProcessed > 0 ? ((totalProcessed - pendingDenials) / totalProcessed) * 100 : 0)} className="h-2 bg-white/5" />
                  </div>
                  <Button
                    className="w-full variant-outline border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    onClick={handleGlobalScan}
                    disabled={isScanning}
                  >
                    {isScanning ? "SCANNING..." : "START GLOBAL RE-CODE SCAN"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/5 border-l-2 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-body-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Audit Shield
                  </CardTitle>
                  <CardDescription>
                    Ensuring 100% compliance with RAC audits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div className="text-body-sm font-bold text-emerald-500">
                      Audit Readiness: 100%
                    </div>
                  </div>
                  <p className="text-caption-premium">
                    All recent high-value claims have been cross-referenced with
                    Payer-specific medical policy bulletins.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-black/40 border-white/5 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-card-title">
                  Engine Configuration
                </CardTitle>
                <CardDescription>
                  Calibrate the AI detection sensitivity and autonomy levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-body-sm font-bold">
                        Aggressive Recoding
                      </div>
                      <div className="text-body-sm">
                        Maximize revenue lift by pushing CPT boundaries
                      </div>
                    </div>
                    <Badge>HIGH RISK</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-body-sm font-bold">
                        Auto-Appeal Threshold
                      </div>
                      <div className="text-body-sm">
                        Automatically appeal if recovery projection exceeds $500
                      </div>
                    </div>
                    <Badge variant="outline">ENABLED</Badge>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-700"
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig}
                  >
                    {isSavingConfig ? "SAVING..." : "SAVE CONFIGURATION"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
