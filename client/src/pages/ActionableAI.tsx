
import { useState } from 'react';
import { Link } from 'wouter';
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
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function ActionableAI() {
    const [isExecuting, setIsExecuting] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-orange-500/30">
            {/* Header */}
            <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
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
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Engine Online</span>
                        </div>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6" data-testid="btn-new-mission">
                            NEW MISSION
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
                            <div className="text-3xl font-bold text-white" data-testid="stat-compute-load">42.8%</div>
                            <div className="text-[10px] text-muted-foreground mt-2" data-testid="stat-active-threads">188 active agent threads</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Success Rate
                            </div>
                            <div className="text-3xl font-bold text-white">99.1%</div>
                            <div className="text-[10px] text-muted-foreground mt-2">Task resolution accuracy</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">
                                <Layers className="w-3 h-3 text-blue-500" /> Missions Today
                            </div>
                            <div className="text-3xl font-bold text-white">1,402</div>
                            <div className="text-[10px] text-muted-foreground mt-2">+22% vs previous day</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">
                                <Activity className="w-3 h-3 text-purple-500" /> Latency
                            </div>
                            <div className="text-3xl font-bold text-white" data-testid="stat-latency">14ms</div>
                            <div className="text-[10px] text-muted-foreground mt-2" data-testid="stat-p99-time">P99 execution time</div>
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
                                <CardDescription>Direct execution and orchestration logs</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsExecuting(!isExecuting)} data-testid="btn-pause-resume">
                                    {isExecuting ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                    {isExecuting ? 'PAUSE ENGINE' : 'RESUME ENGINE'}
                                </Button>
                                <Button variant="outline" size="sm" data-testid="btn-terminate-all"><Square className="w-4 h-4 mr-2" /> TERMINATE ALL</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-xl bg-black border border-white/5 font-mono text-xs text-orange-400 space-y-2 h-96 overflow-y-auto custom-scrollbar">
                                <div className="flex gap-2 opacity-50"><span className="text-muted-foreground font-bold">[09:02:11]</span> SYSTEM: Engine initialized. Warmup complete.</div>
                                <div className="flex gap-2"><span className="text-muted-foreground font-bold">[09:02:14]</span> <span className="text-blue-400">MISSION_ALPHA:</span> Spawning 12 agents for parallel data scraping...</div>
                                <div className="flex gap-2"><span className="text-muted-foreground font-bold">[09:02:18]</span> <span className="text-emerald-400">AGENT_001:</span> Successfully bypassed rate-limit on target_primary.</div>
                                <div className="flex gap-2"><span className="text-muted-foreground font-bold">[09:02:22]</span> <span className="text-blue-400">MISSION_ALPHA:</span> Consolidating 4.2MB of unstructured JSON.</div>
                                <div className="flex gap-2"><span className="text-muted-foreground font-bold">[09:02:25]</span> <span className="text-purple-400">SOLVER_BOT:</span> Applying advanced heuristic for data cleanup.</div>
                                {isExecuting && (
                                    <>
                                        <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300"><span className="text-muted-foreground font-bold">[09:02:28]</span> <span className="text-orange-500">ALERT:</span> Processing cost threshold approaching 80%.</div>
                                        <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-500 delay-150"><span className="text-muted-foreground font-bold">[09:02:30]</span> <span className="text-emerald-400">AGENT_004:</span> Chunk synthesis complete. Sending to vector store.</div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Swarms */}
                    <div className="space-y-6" data-testid="active-swarms-container">
                        <Card className="bg-black/40 border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Swarms</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { name: "AlphaScraper", agents: 24, status: "Active", power: 88 },
                                    { name: "MarketAnalyzer", agents: 12, status: "Indexing", power: 45 },
                                    { name: "CodeAuditor", agents: 8, status: "Deep Scan", power: 92 }
                                ].map((swarm, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-white text-sm">{swarm.name}</div>
                                            <Badge className="bg-orange-500/10 text-orange-400 border-none text-[10px]">{swarm.status}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                            <span>{swarm.agents} Autonomous Agents</span>
                                            <span>Util: {swarm.power}%</span>
                                        </div>
                                        <Progress value={swarm.power} className="h-1 bg-white/5" data-testid={`swarm-util-${swarm.name}`} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/10 border-orange-500/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="w-5 h-5 text-orange-500" />
                                    <div className="font-bold text-sm text-white uppercase tracking-wider">Safety Protocols</div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span>Infinite Loop Protection</span>
                                        <Badge className="bg-emerald-500 text-white text-[8px] h-4" data-testid="badge-loop-protection">ARMED</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span>Cost Auto-Kill Switch</span>
                                        <span className="text-muted-foreground" data-testid="kill-switch-threshold">$50/hour</span>
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
