
import { useState } from 'react';
import { Link } from 'wouter';
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
    Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function DenialDefense() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans selection:bg-cyan-500/30">
            {/* Header */}
            <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
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
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                             <h1 className="font-bold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                DenialDefense <span className="text-cyan-500 text-xs align-top ml-1">AI</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5">Beta v0.1.0</Badge>
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold" data-testid="btn-upgrade-enterprise">
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
                            <div className="text-xs text-cyan-500 font-bold uppercase tracking-wider mb-1">Recovery Rate</div>
                            <div className="text-3xl font-bold text-white" data-testid="stat-recovery-rate">94.2%</div>
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2">
                                <TrendingUp className="w-3 h-3" />
                                +12.4% vs industry avg
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Claims Processed</div>
                            <div className="text-3xl font-bold text-white" data-testid="stat-claims-processed">12.5K</div>
                            <div className="text-[10px] text-muted-foreground mt-2">Last 30 days</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">Pending Denials</div>
                            <div className="text-3xl font-bold text-white" data-testid="stat-pending-denials">84</div>
                            <div className="text-[10px] text-orange-400/60 mt-2">Requires AI Intervention</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Revenue Recovered</div>
                            <div className="text-3xl font-bold text-white" data-testid="stat-revenue-recovered">$2.4M</div>
                            <Progress value={78} className="h-1 mt-3 bg-white/5" />
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
                        <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white" data-testid="tab-overview">
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="claims" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white" data-testid="tab-claims">
                            <FileText className="w-4 h-4 mr-2" /> Claims Engine
                        </TabsTrigger>
                        <TabsTrigger value="coding" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white" data-testid="tab-coding">
                            <Activity className="w-4 h-4 mr-2" /> AI Coding
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white" data-testid="tab-config">
                            <Settings className="w-4 h-4 mr-2" /> Config
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="md:col-span-2 bg-black/40 border-white/5">
                                <CardHeader>
                                    <CardTitle>Autonomous Denial Resolution</CardTitle>
                                    <CardDescription>AI agents currently appealing denied claims in real-time</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { payer: "BlueShield", id: "CLM-9021", reason: "Medical Necessity", status: "Appealing", confidence: 92 },
                                        { payer: "UnitedHealth", id: "CLM-4432", reason: "Coding Mismatch", status: "Resolved", confidence: 100 },
                                        { payer: "Aetna", id: "CLM-1182", reason: "Missing Documentation", status: "Gathering Evidence", confidence: 64 }
                                    ].map((claim, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${claim.status === 'Resolved' ? 'bg-emerald-500' : 'bg-cyan-500 animate-pulse'}`} />
                                                <div>
                                                    <div className="font-bold text-sm text-white">{claim.payer} - {claim.id}</div>
                                                    <div className="text-xs text-muted-foreground">{claim.reason}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className={`${claim.status === 'Resolved' ? 'border-emerald-500/30 text-emerald-400' : 'border-cyan-500/30 text-cyan-400'}`}>
                                                    {claim.status}
                                                </Badge>
                                                <div className="text-[10px] text-muted-foreground mt-1">AI Confidence: {claim.confidence}%</div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="ghost" className="w-full text-xs text-cyan-500 hover:bg-cyan-500/10" data-testid="btn-view-all-appeals">VIEW ALL ACTIVE APPEALS</Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-cyan-600/20 to-blue-600/10 border-cyan-500/20" data-testid="card-payer-intelligence">
                                <CardHeader>
                                    <CardTitle className="text-white">Payer Intelligence</CardTitle>
                                    <CardDescription>Predicted denial trends for Q4 2026</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span>Aetna Tightening Rules</span>
                                                <span className="text-orange-400">+15% Risk</span>
                                            </div>
                                            <Progress value={85} className="h-1.5 bg-white/5" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span>Medicare Policy Shift</span>
                                                <span className="text-emerald-400">Neutral</span>
                                            </div>
                                            <Progress value={40} className="h-1.5 bg-white/5" />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Zap className="w-4 h-4 text-cyan-400" />
                                            <span className="text-xs font-bold text-white uppercase">AI Advisory</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed" data-testid="ai-advisory-text">
                                            Redirect oncology billing to the specialized compliance agent. Increased denial velocity detected for CPT code 99214.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
