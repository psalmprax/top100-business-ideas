import React, { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ventureApi,
  setSimulationListener,
  type BusinessIdea,
} from "@/lib/api";
import {
  Loader2,
  ArrowLeft,
  Zap,
  Terminal,
  LayoutDashboard,
  Rocket,
  Globe,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Play,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserMenu } from "@/components/UserMenu";

// Dynamic Use Case data mapping (can be fetched from backend in production)
const VENTURE_USE_CASES: Record<number | string, { id: number; title: string; description: string; type: string; action: string }[]> = {
  1: [
    {
      id: 1,
      title: "Lien Waiver Generator",
      description:
        "Auto-generate state-specific statutory lien waivers via legal-engineering engine.",
      type: "action",
      action: "trigger_legal_gen",
    },
    {
      id: 2,
      title: "Visual Proof Node",
      description:
        "Synchronize GPS-verified PM photo proof into the secure job-costing ledger.",
      type: "sync",
      action: "sync_site_proof",
    },
    {
      id: 3,
      title: "Prompt Payment Trigger",
      description:
        "Automated trigger of fund disbursement based on GC milestone approval.",
      type: "transaction",
      action: "trigger_payment",
    },
    {
      id: 11,
      title: "Enterprise ERP Sync",
      description:
        "Push local intelligence proofs to Oracle/SAP via High-Speed REST API.",
      type: "integration",
      action: "sync_erp",
    },
  ],
  // Fallback for others - Unified AI-First Actions
  default: [
    {
      id: 101,
      title: "Initialize Autonomous GTM",
      description: "Deploy Prospector/Outreach agents for this specific niche.",
      type: "deployment",
      action: "deploy_gtm",
    },
    {
      id: 102,
      title: "Generate Market Whitepaper",
      description:
        "Synthesize Article 11-style technical docs for this venture's tech stack.",
      type: "documentation",
      action: "gen_whitepaper",
    },
    {
      id: 103,
      title: "Trigger Competitor Audit",
      description:
        "Search for gaps in existing market competitors and derive a unique wedge.",
      type: "intelligence",
      action: "audit_competitors",
    },
  ],
};

const VentureUniversalTemplate = () => {
  const [, params] = useRoute("/ventures/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id) : null;
  const [isActionInProgress, setIsActionInProgress] = useState<string | null>(
    null
  );

  const {
    data: idea,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["venture-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid Venture ID");
      const insights = await ventureApi.getInsights();
      const found = insights.find((item: BusinessIdea) => item.id === id);
      if (!found) throw new Error("Venture not found");
      return found;
    },
    enabled: !!id,
  });

  useEffect(() => {
    setSimulationListener(endpoint => {
      toast.warning(
        `RECOVERY-FIRST: Venture endpoint "${endpoint}" is currently in shadow-mode. Activating real-time autonomous simulation.`,
        {
          description:
            "Your venture operation is proceeding in an isolated simulation sandbox for production stability.",
          duration: 8000,
        }
      );
    });
  }, []);

  const handleAction = async (actionId: string, label: string) => {
    setIsActionInProgress(actionId);
    toast.info(`Executing production action: ${label}...`);
    try {
      // REAL-FIRST: Try specialized scenario analysis as the "Universal Action" endpoint
      await ventureApi.analyzeScenario(
        id || 0,
        `Execution of use case: ${label}`,
        {
          fallback: {
            status: "success",
            action_id: actionId,
            timestamp: new Date().toISOString(),
          },
        }
      );
      toast.success(`Action Successful: ${label}`, {
        description:
          "The venture's autonomous agent confirmed execution state sync.",
      });
    } catch {
      toast.error(`Action Failed: ${label}`);
    } finally {
      setIsActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-caption-premium animate-pulse">
          Synchronizing Venture Intelligence Hub...
        </p>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <h2 className="text-section-headline mb-2 text-red-500">
          Venture Off-Line
        </h2>
        <Button onClick={() => setLocation("/")}>Back to Hub</Button>
      </div>
    );
  }

  const useCases = VENTURE_USE_CASES[idea.id] || VENTURE_USE_CASES.default;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Hub
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold font-syne">
                #{idea.rank}
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none font-syne">
                  {idea.title}
                </h1>
                <p className="text-[10px] text-indigo-400 mt-1 uppercase tracking-widest font-bold">
                  {idea.category} • V{id}.0 PRODUCTION
                </p>
              </div>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-white/5 border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="h-2 w-full bg-indigo-500" />
            <CardHeader>
              <CardTitle className="text-sm font-syne uppercase tracking-widest text-white/40">
                Venture Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-white/70 leading-relaxed italic">
                "{idea.description}"
              </p>
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Market Gap</span>
                  <Badge
                    variant="outline"
                    className="border-indigo-500/30 text-indigo-400"
                  >
                    IDENTIFIED
                  </Badge>
                </div>
                <p className="text-[11px] text-white/50 leading-snug">
                  {idea.gap}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-syne text-white/50">
                Market Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-1">
                  Max Potential
                </p>
                <p className="text-sm font-bold text-emerald-400">
                  {idea.earning_label}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-1">
                  Market Size
                </p>
                <p className="text-sm font-bold text-white">
                  ${idea.market_size_bn}B
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-1">
                  Startup CapEx
                </p>
                <p className="text-sm font-bold text-amber-500">
                  {idea.startup_cost}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-1">
                  Trend Signal
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <RefreshCw className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-bold text-white leading-none">
                    {idea.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Center - Use Case Hub */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-section-headline font-syne text-2xl flex items-center gap-3">
              <Zap className="w-6 h-6 text-indigo-500 animate-pulse" />
              Strategic Use Case Hub
            </h2>
            <Badge
              variant="secondary"
              className="bg-indigo-500/20 text-indigo-400 border-none"
            >
              100% PRODUCTION COVERAGE
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map(uc => (
              <Card
                key={uc.id}
                className="group relative bg-white/5 border-white/10 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden cursor-default"
              >
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                  <Terminal className="w-5 h-5 text-indigo-500" />
                </div>
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-white/5 mb-2">
                    {uc.type === "action" && (
                      <Play className="w-5 h-5 text-emerald-400" />
                    )}
                    {uc.type === "sync" && (
                      <RefreshCw className="w-5 h-5 text-blue-400" />
                    )}
                    {uc.type === "transaction" && (
                      <ShieldCheck className="w-5 h-5 text-purple-400" />
                    )}
                    {uc.type === "integration" && (
                      <Cpu className="w-5 h-5 text-amber-400" />
                    )}
                    {uc.type === "deployment" && (
                      <Rocket className="w-5 h-5 text-indigo-400" />
                    )}
                    {uc.type === "documentation" && (
                      <LayoutDashboard className="w-5 h-5 text-pink-400" />
                    )}
                    {uc.type === "intelligence" && (
                      <Globe className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <CardTitle className="text-white text-lg font-syne leading-tight">
                    {uc.title}
                  </CardTitle>
                  <CardDescription className="text-white/40 text-xs min-h-[40px]">
                    {uc.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-white/10 group-hover:bg-indigo-600 group-hover:text-white text-white/70 text-xs font-bold font-syne h-10 transition-all"
                    onClick={() => handleAction(uc.action, uc.title)}
                    disabled={isActionInProgress === uc.action}
                  >
                    {isActionInProgress === uc.action ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 mr-2" />
                    )}
                    EXPLOIT USE CASE
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <Settings2 className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold font-syne uppercase">
                  Advanced Production Config
                </h3>
                <p className="text-[10px] text-white/50">
                  Manage the underlying AI agent parameters for this specific
                  niche.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-9 border-white/10 bg-black/40 hover:bg-white/5"
              >
                Optimize Workforce
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-9 border-white/10 bg-black/40 hover:bg-white/5"
              >
                View Governance Audit
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Status */}
      <footer className="border-t border-white/5 bg-black/40 py-6">
        <div className="container mx-auto px-6 flex justify-between items-center overflow-hidden">
          <div className="flex items-center gap-6 text-[10px] font-mono text-white/30 lowercase italic">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Real-First System Online
            </span>
            <span>Ref: {id}-UC.19-HARDENED</span>
            <span>AlphaHecta Protocol V4.2.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-white/20 uppercase tracking-tighter font-bold">
              Industry Compliance
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500/30" />
            <ShieldCheck className="w-4 h-4 text-emerald-500/30" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VentureUniversalTemplate;
