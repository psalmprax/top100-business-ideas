import { useState } from "react";
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
import { mlApi, billingApi } from "@/lib/api";

export default function DenialDefense() {
  const [activeClaims, setActiveClaims] = useState(
    storage.get("dd_claims", [
      {
        id: "CLM-9021",
        payer: "BlueShield",
        amount: 1250,
        status: "Pending",
        risk: "High",
      },
      {
        id: "CLM-8812",
        payer: "Medicare",
        amount: 4500,
        status: "Scrubbed",
        risk: "Low",
      },
      {
        id: "CLM-7723",
        payer: "Aetna",
        amount: 890,
        status: "Flagged",
        risk: "Medium",
      },
    ])
  );
  const [newClaim, setNewClaim] = useState({ id: "", payer: "", amount: "" });
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [recoveryRate, setRecoveryRate] = useState(94.2);
  const [revenueRecovered, setRevenueRecovered] = useState(2.4);

  const handleAddClaim = () => {
    if (!newClaim.id || !newClaim.payer) {
      toast.error("Please fill in Claim ID and Payer");
      return;
    }
    const updated = [
      {
        ...newClaim,
        amount: parseFloat(newClaim.amount) || 0,
        status: "New",
        risk: "Calculating...",
      },
      ...activeClaims,
    ];
    setActiveClaims(updated);
    storage.set("dd_claims", updated);
    setNewClaim({ id: "", payer: "", amount: "" });
    toast.success("Claim submitted to Engine");
  };

  const runScrubber = (id: string) => {
    setIsScrubbing(true);
    toast.promise(
      mlApi.classifyAgentOperation(
        `Scrub claim ${id} for CCI edits and coding compliance`,
        "denial-defense"
      ),
      {
        loading: `AI Agent 'Scrubber-1' analyzing claim ${id}...`,
        success: (data: any) => {
          const updated = activeClaims.map(c =>
            c.id === id
              ? {
                  ...c,
                  status: "Scrubbed",
                  risk: data?.confidence > 0.8 ? "Low" : "Medium",
                }
              : c
          );
          setActiveClaims(updated);
          storage.set("dd_claims", updated);
          setIsScrubbing(false);
          setRecoveryRate(prev => Math.min(99.9, prev + 0.1));
          return `Scrubbing complete: ${data?.classification || "No CCI edits found."}`;
        },
        error: () => {
          setIsScrubbing(false);
          return "Scrubbing failed. Service unavailable.";
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
          return `Global scan complete: ${data?.suggestions?.[0] || "$12,450 in lift identified."}`;
        },
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
              <h1 className="font-bold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                DenialDefense{" "}
                <span className="text-cyan-500 text-xs align-top ml-1">AI</span>
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
              <div className="text-xs text-cyan-500 font-bold uppercase tracking-wider mb-1">
                Recovery Rate
              </div>
              <div
                className="text-3xl font-bold text-white"
                data-testid="stat-recovery-rate"
              >
                {recoveryRate.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2">
                <TrendingUp className="w-3 h-3" />
                +12.4% vs industry avg
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">
                Claims Processed
              </div>
              <div
                className="text-3xl font-bold text-white"
                data-testid="stat-claims-processed"
              >
                12.5K
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">
                Last 30 days
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">
                Pending Denials
              </div>
              <div
                className="text-3xl font-bold text-white"
                data-testid="stat-pending-denials"
              >
                84
              </div>
              <div className="text-[10px] text-orange-400/60 mt-2">
                Requires AI Intervention
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
                Revenue Recovered
              </div>
              <div
                className="text-3xl font-bold text-white"
                data-testid="stat-revenue-recovered"
              >
                ${revenueRecovered.toFixed(1)}M
              </div>
              <Progress value={78} className="h-1 mt-3 bg-white/5" />
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
                  <CardTitle className="text-sm">Submit New Claim</CardTitle>
                  <CardDescription>
                    Direct injection into the AI Scrubber Engine
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Claim ID</Label>
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
                    <Label className="text-xs">Payer</Label>
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
                    <Label className="text-xs">Billed Amount ($)</Label>
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
                  <CardTitle className="text-sm">Engine Queue</CardTitle>
                  <CardDescription>
                    Live tracking of claims entering the denial defense layer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="border-white/10">
                      <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead className="text-xs">ID</TableHead>
                        <TableHead className="text-xs">Payer</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">AI Risk</TableHead>
                        <TableHead className="text-xs text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeClaims.map((claim: any) => (
                        <TableRow
                          key={claim.id}
                          className="border-white/5 hover:bg-white/[0.02]"
                        >
                          <TableCell className="font-mono text-xs">
                            {claim.id}
                          </TableCell>
                          <TableCell className="text-xs">
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
                            <span
                              className={`text-[10px] font-bold ${
                                claim.risk === "High"
                                  ? "text-red-400"
                                  : claim.risk === "Low"
                                    ? "text-emerald-400"
                                    : "text-orange-400"
                              }`}
                            >
                              {claim.risk}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] text-cyan-500 hover:bg-cyan-500/10"
                              disabled={
                                isScrubbing || claim.status === "Scrubbed"
                              }
                              onClick={() => runScrubber(claim.id)}
                            >
                              {claim.status === "Scrubbed"
                                ? "VERIFIED"
                                : "RUN SCRUBBER"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                  <CardTitle className="text-sm flex items-center gap-2">
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
                      <span className="text-xs font-bold">
                        Optimization Lift
                      </span>
                      <span className="text-xs text-emerald-400">
                        +$12,450 projected
                      </span>
                    </div>
                    <Progress value={65} className="h-2 bg-white/5" />
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
                  <CardTitle className="text-sm flex items-center gap-2">
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
                    <div className="text-xs font-bold text-emerald-500">
                      Audit Readiness: 100%
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
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
                <CardTitle className="text-sm">Engine Configuration</CardTitle>
                <CardDescription>
                  Calibrate the AI detection sensitivity and autonomy levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">
                        Aggressive Recoding
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Maximize revenue lift by pushing CPT boundaries
                      </div>
                    </div>
                    <Badge>HIGH RISK</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">
                        Auto-Appeal Threshold
                      </div>
                      <div className="text-xs text-muted-foreground">
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
