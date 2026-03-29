import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Zap,
  Cpu,
  Play,
  Pause,
  Square,
  RefreshCw,
  Terminal,
  Layers,
  Activity,
  Shield,
  Bot,
  ArrowRight,
  Search,
  Plus,
  BarChart3,
  History,
  Settings,
  CheckCircle2,
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
import { toast } from "sonner";
import { storage } from "@/lib/storage";
import { metricsApi, agentsApi, extendedApi } from "@/lib/api";

export default function ActionableAI() {
  const [isExecuting, setIsExecuting] = useState(
    storage.get("actionable_ai_executing", false)
  );
  const [isTerminating, setIsTerminating] = useState(false);
  const [isNewMission, setIsNewMission] = useState(false);
  const [computeLoad, setComputeLoad] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [successRate, setSuccessRate] = useState<number | null>(null);
  const [missionsToday, setMissionsToday] = useState<number | null>(null);
  const [activeThreads, setActiveThreads] = useState<number | null>(null);
  const [missionLogs, setMissionLogs] = useState<string[]>([]);
  const [swarms, setSwarms] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await metricsApi.current();
        if (data) {
          // REAL-FIRST: Using direct backend-instrumented metric
          if (data.computeLoad !== undefined) {
            setComputeLoad(data.computeLoad);
          }
          
          // REAL-FIRST: Using direct p99 latency metric
          if (data.p99Latency !== undefined) {
            setLatency(data.p99Latency);
          }

          // REAL-FIRST: Using daily mission throughput metric
          if (data.missionsToday !== undefined) {
            setMissionsToday(data.missionsToday);
          }

          const total = data.tasksCompleted + data.tasksFailed;
          if (total > 0) {
            setSuccessRate(
              parseFloat(((data.tasksCompleted / total) * 100).toFixed(1))
            );
          }
          if (data.activeAgents !== undefined) {
            setActiveThreads(data.activeAgents);
          }
        }
      } catch (error) {
        console.error("[ActionableAI] Failed to fetch metrics:", error);
      }
    };

    const fetchSwarms = async () => {
      try {
        const data = await extendedApi.workforce.getVentures();
        if (Array.isArray(data)) {
          setSwarms(
            data.map((v: any) => ({
              name: v.name || v.id || "Swarm",
              agents: v.agent_count || v.agents || 0,
              status: v.status || "Active",
              power: v.utilization || v.power || 0,
            }))
          );
        }
      } catch (error) {
        console.error("[ActionableAI] Failed to fetch swarms:", error);
      }
    };

    const fetchLogs = async () => {
      try {
        const data = await extendedApi.agentOps.getAuditLogs(undefined, 20);
        if (Array.isArray(data)) {
          setMissionLogs(
            data.map(
              (l: any) =>
                `[${l.timestamp || new Date().toLocaleTimeString()}] ${l.agentName || l.agent || "SYSTEM"}: ${l.action || l.event || JSON.stringify(l).substring(0, 80)}`
            )
          );
        }
      } catch (error) {
        console.error("[ActionableAI] Failed to fetch logs:", error);
      }
    };

    fetchMetrics();
    fetchSwarms();
    fetchLogs();
    const interval = setInterval(() => {
      fetchMetrics();
      fetchSwarms();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePauseResume = async () => {
    const newState = !isExecuting;
    setIsExecuting(newState);
    storage.set("actionable_ai_executing", newState);
    try {
      await extendedApi.workforce.toggleAutonomy(newState);
      toast.success(newState ? "Engine resumed" : "Engine paused");
    } catch (error: any) {
      toast.error(`Control Error: ${error.message || "Failed to toggle engine state"}`);
    }
  };

  const handleTerminateAll = async () => {
    setIsTerminating(true);
    toast.promise(extendedApi.workforce.toggleAutonomy(false), {
      loading: "Sending SIGTERM to all active agent swarms...",
      success: () => {
        setIsTerminating(false);
        setIsExecuting(false);
        storage.set("actionable_ai_executing", false);
        return "All mission threads terminated safely.";
      },
      error: (err) => {
        setIsTerminating(false);
        return `Termination Failed: ${err.message || "Unknown error"}`;
      },
    });
  };

  const handleNewMission = async () => {
    setIsNewMission(true);
    toast.promise(
      extendedApi.workforce.runCampaign("OMEGA_RECON", "agent-swarms"),
      {
        loading: "Initializing new mission parameters...",
        success: (data: any) => {
          setIsNewMission(false);
          setIsExecuting(true);
          storage.set("actionable_ai_executing", true);
          return (
            data?.message || "New mission spawned: OMEGA_RECON initialized."
          );
        },
        error: (err) => {
          setIsNewMission(false);
          return `Mission Launch Failed: ${err.message || "Check backend availability"}`;
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <h1 className="font-bold tracking-tighter text-2xl text-white">
                Actionable<span className="text-orange-500">AI</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mr-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase">
                Engine Online
              </span>
            </div>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6"
              data-testid="btn-new-mission"
              onClick={handleNewMission}
              disabled={isNewMission}
            >
              {isNewMission ? "SPAWNING..." : "NEW MISSION"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Real-time Monitor */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">
                <Cpu className="w-3 h-3 text-orange-500" /> Compute Load
              </div>
              <div
                className="text-3xl font-bold text-white"
                data-testid="stat-compute-load"
              >
                {computeLoad !== null ? `${computeLoad.toFixed(1)}%` : "---%"}
              </div>
              <div
                className="text-[10px] text-muted-foreground mt-2"
                data-testid="stat-active-threads"
              >
                {activeThreads !== null
                  ? `${activeThreads} active agent threads`
                  : "0 active agent threads"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Success
                Rate
              </div>
              <div className="text-3xl font-bold text-white">
                {successRate !== null ? `${successRate}%` : "---%"}
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">
                Task resolution accuracy
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">
                <Layers className="w-3 h-3 text-blue-500" /> Missions Today
              </div>
              <div className="text-3xl font-bold text-white">
                {missionsToday !== null
                  ? missionsToday.toLocaleString()
                  : "0"}
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">
                Real-time daily throughput
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">
                <Activity className="w-3 h-3 text-purple-500" /> Latency
              </div>
              <div
                className="text-3xl font-bold text-white"
                data-testid="stat-latency"
              >
                {latency !== null ? `${Math.round(latency)}ms` : "---ms"}
              </div>
              <div
                className="text-[10px] text-muted-foreground mt-2"
                data-testid="stat-p99-time"
              >
                P99 execution time
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Mission Control */}
          <Card className="md:col-span-2 bg-black/40 border-white/10 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Mission Control</CardTitle>
                <CardDescription>
                  Direct execution and orchestration logs
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseResume}
                  data-testid="btn-pause-resume"
                >
                  {isExecuting ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isExecuting ? "PAUSE ENGINE" : "RESUME ENGINE"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="btn-terminate-all"
                  onClick={handleTerminateAll}
                  disabled={isTerminating}
                >
                  <Square className="w-4 h-4 mr-2" />
                  {isTerminating ? "TERMINATING..." : "TERMINATE ALL"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-black border border-white/5 font-mono text-xs text-orange-400 space-y-2 h-96 overflow-y-auto custom-scrollbar">
                {missionLogs.length > 0 ? (
                  missionLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-muted-foreground font-bold">
                        [{new Date().toLocaleTimeString()}]
                      </span>{" "}
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground italic">
                    No active mission logs detected. Initialize a new mission to begin.
                  </div>
                )}
                {isExecuting && missionLogs.length > 0 && (
                  <>
                    <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-muted-foreground font-bold">
                        [{new Date().toLocaleTimeString()}]
                      </span>{" "}
                      <span className="text-orange-500">SYSTEM:</span> Monitoring active thread pool...
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Swarms */}
          <div className="space-y-6" data-testid="active-swarms-container">
            <Card className="bg-black/40 border-white/5 h-full">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Active Swarms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {swarms.length > 0 ? (
                  swarms.map((swarm, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm">
                          {swarm.name}
                        </div>
                        <Badge className="bg-orange-500/10 text-orange-400 border-none text-[10px]">
                          {swarm.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>{swarm.agents} Autonomous Agents</span>
                        <span>Util: {swarm.power}%</span>
                      </div>
                      <Progress
                        value={swarm.power}
                        className="h-1 bg-white/5"
                        data-testid={`swarm-util-${swarm.name}`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground italic border border-dashed border-white/10 rounded-xl">
                    No active swarms found in current deployment.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/10 border-orange-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <div className="font-bold text-sm text-white uppercase tracking-wider">
                    Safety Protocols
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span>Infinite Loop Protection</span>
                    <Badge
                      className="bg-emerald-500 text-white text-[8px] h-4"
                      data-testid="badge-loop-protection"
                    >
                      ARMED
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Cost Auto-Kill Switch</span>
                    <span
                      className="text-muted-foreground"
                      data-testid="kill-switch-threshold"
                    >
                      $50/hour
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
