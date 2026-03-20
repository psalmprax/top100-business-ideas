import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Brain, 
    TrendingUp, 
    Target, 
    DollarSign, 
    Zap, 
    ShieldCheck, 
    Briefcase,
    LayoutDashboard,
    Search,
    Send,
    MessageSquare,
    BarChart3,
    Settings2,
    Play,
    Pause,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Shield,
    Globe,
    Cpu,
    Network,
    Terminal,
    Rocket,
    Workflow,
    Building2,
    FileText,
    TrendingDown,
    Activity,
    Lock,
    Unlock,
    HelpCircle,
    MessageCircle,
    Hash,
    UserPlus,
    Crown,
    Wallet,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    X,
    Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { extendedApi, workforceSync } from '@/lib/api';

const SovereignStageItem = ({ stage, name, status, description, isAutonomous, onDecision, currentDecision }: { 
    stage: number, 
    name: string, 
    status: string, 
    description: string, 
    isAutonomous: boolean,
    onDecision?: (stage: number, decision: string) => void,
    currentDecision?: string
}) => (
    <div className={`p-3 rounded-lg border transition-all ${isAutonomous ? 'bg-indigo-500/10 border-indigo-500/30 shadow-inner' : 'bg-background/40 border-border'} ${currentDecision ? 'opacity-80' : ''}`}>
        <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${isAutonomous ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {stage}
                </span>
                <span className="font-bold text-sm tracking-tight">{name}</span>
            </div>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${currentDecision === 'APPROVED' ? 'bg-green-500/20 text-green-500 border-green-500/30' : currentDecision === 'DENIED' ? 'bg-red-500/20 text-red-500 border-red-500/30' : isAutonomous ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                {currentDecision || status.replace('_', ' ')}
            </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight pl-7">{description}</p>
        
        {!isAutonomous && !currentDecision && onDecision && (
            <div className="flex gap-2 mt-3 pl-7">
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 px-2 text-[9px] border-green-500/30 text-green-500 hover:bg-green-500/10"
                    onClick={() => onDecision(stage, 'APPROVED')}
                >
                    APPROVE
                </Button>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 px-2 text-[9px] border-red-500/30 text-red-500 hover:bg-red-500/10"
                    onClick={() => onDecision(stage, 'DENIED')}
                >
                    DENY
                </Button>
            </div>
        )}
    </div>
);

const AlphaWorkforce = () => {
    const [isAutonomous, setIsAutonomous] = useState(false);
    const [performanceMetric, setPerformanceMetric] = useState(78);
    const [revenueGrowth, setRevenueGrowth] = useState(12.4);
    const [workforceData, setWorkforceData] = useState<any>(null);
    const [isHiringOpen, setIsHiringOpen] = useState(false);
    const [webhooks, setWebhooks] = useState({
        slack: '',
        telegram: '',
        discord: ''
    });
    const [governanceDecisions, setGovernanceDecisions] = useState<Record<number, string>>({});
    const [agentRoster, setAgentRoster] = useState([
        { id: 'CEO', name: 'CEO AI', framework: 'Agent Zero', status: 'ACTIVE' },
        { id: 'CFO', name: 'CFO AI', framework: 'Agent Zero', status: 'ACTIVE' },
        { id: 'Legal', name: 'Legal Compliance', framework: 'Autogen', status: 'ACTIVE' },
        { id: 'Growth', name: 'Growth Lead', framework: 'CrewAI', status: 'ACTIVE' },
        { id: 'CMO', name: 'CMO AI', framework: 'LlamaIndex', status: 'ACTIVE' },
        { id: 'Security', name: 'Security/Ops', framework: 'OpenClaw', status: 'ACTIVE' },
        { id: 'Red-Team', name: 'Defense Red-Teamer', framework: 'OpenClaw', status: 'ACTIVE' },
        { id: 'Data', name: 'Data Analyst', framework: 'Autogen', status: 'ACTIVE' },
        { id: 'Insights', name: 'Customer Insights', framework: 'CrewAI', status: 'ACTIVE' },
        { id: 'Receptionist', name: 'Inbound Receptionist', framework: 'Concierge AI', status: 'ACTIVE' },
        { id: 'AI-Assistant', name: 'AI Personal Assistant', framework: 'Agent Zero', status: 'ACTIVE' },
        { id: 'SEO', name: 'SEO Strategy Manager', framework: 'CrewAI', status: 'ACTIVE' },
        { id: 'Crisis', name: 'Crisis Commander', framework: 'Sovereign OS', status: 'ACTIVE' },
    ]);
    const [activeEmployees, setActiveEmployees] = useState(13);
    const [fiscalRequests, setFiscalRequests] = useState([
        { id: 1, purpose: 'Q3 Freelance Payroll', amount: '$12,400', priority: 'HIGH', status: 'PENDING' },
        { id: 2, purpose: 'GPU Cluster Expansion (Cluster 7)', amount: '$5,000', priority: 'MEDIUM', status: 'PENDING' },
    ]);

    const [isRunningMarketing, setIsRunningMarketing] = useState(false);
    const [isSourcingLeads, setIsSourcingLeads] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await workforceSync();
            setWorkforceData(data);
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const [isAnalyzingInsights, setIsAnalyzingInsights] = useState(false);
    const [isHandlingInbound, setIsHandlingInbound] = useState(false);
    const [insightResults, setInsightResults] = useState<any>(null);
    const [inboundResponse, setInboundResponse] = useState<string>("");
    const [lastInboundInteractionId, setLastInboundInteractionId] = useState<string>("");
    const [lastInsightInteractionId, setLastInsightInteractionId] = useState<string>("");

    const handleApplyFeedback = async (interactionId: string, status: string, notes: string = "") => {
        if (!interactionId) return;
        try {
            await extendedApi.workforce.provideFeedback(interactionId, status, notes);
            if (status === 'approved') {
                toast.success("Feedback Logged: Agent performance approved.");
            } else {
                toast.info("Feedback Logged: Agent will learn from this discard.");
            }
        } catch (e) {
            console.error("Error logging feedback", e);
        }
    };

    const handleRunMarketing = async () => {
        setIsRunningMarketing(true);
        toast.info("Marketing Crew Kicked Off: Researching trends...", {
            icon: <Brain className="w-4 h-4 text-purple-500" />
        });
        try {
            const result = await extendedApi.workforce.runCampaign("AI Compliance Blitz", "Financial Services SMBs");
            if (result.status === 'success' || result.status === 'mock_success') {
                toast.success("Marketing Campaign Complete!", {
                    description: "SEO Strategy and LinkedIn drafts generated."
                });
            } else {
                toast.error("Marketing Campaign Failed", { description: result.message });
            }
        } catch (e) {
            toast.error("Error triggering Marketing Crew");
        } finally {
            setIsRunningMarketing(false);
        }
    };

    const handleAnalyzeInsights = async (feedback: string) => {
        setIsAnalyzingInsights(true);
        toast.info("Insights Agent Active: Correlating feedback patterns...", {
            icon: <PieChart className="w-4 h-4 text-orange-500" />
        });
        try {
            const result = await extendedApi.workforce.analyzeInsights(feedback);
            setInsightResults(result);
            if (result.interaction_id) setLastInsightInteractionId(result.interaction_id);
            toast.success("Sentiment Analysis Complete", {
                description: `Churn Risk identified: ${result.churn_risk || 'Low'}`
            });
        } catch (e) {
            toast.error("Error analyzing insights");
        } finally {
            setIsAnalyzingInsights(false);
        }
    };

    const handleInboundQuery = async (query: string) => {
        setIsHandlingInbound(true);
        toast.info("Receptionist Agent: Drafting high-quality response...", {
            icon: <MessageCircle className="w-4 h-4 text-emerald-500" />
        });
        try {
            const result = await extendedApi.workforce.handleInbound(query);
            setInboundResponse(result.response);
            if (result.interaction_id) setLastInboundInteractionId(result.interaction_id);
            toast.success("Inbound Response Ready", {
                description: "Drafted with 99% accuracy."
            });
        } catch (e) {
            toast.error("Error handling inbound query");
        } finally {
            setIsHandlingInbound(false);
        }
    };

    const handleSourceLeads = async () => {
        setIsSourcingLeads(true);
        toast.info("Prospector Agent Active: Scraping signals...", {
            icon: <Search className="w-4 h-4 text-blue-500" />
        });
        try {
            const result = await extendedApi.workforce.sourceLeads("FinTech startups in Europe");
            if (result.leads) {
                toast.success(`Found ${result.count} high-value prospects!`, {
                    description: "Signals identified and mapped to CRM."
                });
            }
        } catch (e) {
            toast.error("Error sourcing leads");
        } finally {
            setIsSourcingLeads(false);
        }
    };

    const handleToggleAutonomy = async () => {
        const nextState = !isAutonomous;
        try {
            await extendedApi.workforce.toggleAutonomy(nextState);
            setIsAutonomous(nextState);
            if (nextState) {
                toast.success("Autonomous Company Mode Active. AI Executives are now managing operations.");
            } else {
                toast.info("Autonomous Mode Disabled. Manual oversight required.");
            }
        } catch (e) {
            setIsAutonomous(nextState);
            if (nextState) {
                toast.success("Autonomous Company Mode Active (Simulated).");
            } else {
                toast.info("Autonomous Mode Disabled (Simulated).");
            }
        }
    };

    const handleGovernanceDecision = (stage: number, decision: string) => {
        setGovernanceDecisions(prev => ({ ...prev, [stage]: decision }));
        
        // Auto-approve the top fiscal request if Stage 1 is approved
        if (stage === 1 && decision === 'APPROVED') {
            setFiscalRequests(prev => prev.map((req, i) => i === 0 ? { ...req, status: 'APPROVED' } : req));
        }

        if (decision === 'APPROVED') {
            toast.success(`Stage ${stage} Protocol Approved. Executing...`, {
                icon: <ShieldCheck className="w-4 h-4 text-green-500" />
            });
        } else {
            toast.error(`Stage ${stage} Protocol Denied. Escalating to Board...`, {
                icon: <AlertCircle className="w-4 h-4 text-red-500" />
            });
        }
    };

    const handleFiscalApproval = (id: number, decision: 'APPROVED' | 'DENIED') => {
        setFiscalRequests(prev => prev.map(req => req.id === id ? { ...req, status: decision } : req));
        if (decision === 'APPROVED') {
            toast.success(`Fund Disbursement Authorized: ${fiscalRequests.find(r => r.id === id)?.amount}`);
        } else {
            toast.error(`Expenditure Denied: ${fiscalRequests.find(r => r.id === id)?.purpose}`);
        }
    };

    const handleHireAgent = (agent: any) => {
        setAgentRoster(prev => [...prev, { ...agent, id: `Agent-${Date.now()}`, status: 'ACTIVE' }]);
        setActiveEmployees(prev => prev + 1);
        setIsHiringOpen(false);
        toast.success(`New Agent Hired: ${agent.name}`, {
            description: `Specialization: ${agent.specialization || 'Generalist'} via ${agent.framework}`,
            icon: <UserPlus className="w-4 h-4 text-indigo-500" />
        });
    };

    const handleDeployWorkforce = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Deploying autonomous agent clusters...',
                success: 'Full workforce deployed and operational.',
                error: 'Deployment failed. Check system logs.',
            }
        );
    };

    const handleShiftMarketFocus = () => {
        toast.info("AI CEO is re-evaluating market signals for pivot strategy...");
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Header section with Autonomous Toggle */}
            <div className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Alpha Workforce</h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Activity className="w-3 h-3 text-green-500" /> Autonomous Corporate Management System
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 bg-muted/30 px-6 py-3 rounded-2xl border border-primary/10 shadow-inner">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <Label htmlFor="auto-mode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Autonomous Company Mode
                                </Label>
                                <span className={`text-[10px] font-medium ${isAutonomous ? 'text-green-500' : 'text-amber-500'}`}>
                                    {isAutonomous ? 'Delegated Authority Active' : 'Manual Control Required'}
                                </span>
                            </div>
                            <Switch 
                                id="auto-mode" 
                                checked={isAutonomous} 
                                onCheckedChange={handleToggleAutonomy}
                                className="data-[state=checked]:bg-green-500"
                                data-testid="auto-mode-toggle"
                            />
                        </div>
                        <div className="h-8 w-px bg-border hidden md:block" />
                        <div className="hidden md:flex flex-col">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Global ROI</span>
                            <span className="text-xl font-bold text-green-500 leading-none mt-1">4.2x</span>
                        </div>
                        <div className="h-8 w-px bg-border hidden md:block" />
                        <Button 
                            size="sm" 
                            className="bg-indigo-600 hover:bg-indigo-700 h-9"
                            onClick={handleDeployWorkforce}
                            data-testid="deploy-workforce-btn"
                        >
                            <Rocket className="w-4 h-4 mr-2" />
                            Deploy Workforce
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-grow container mx-auto px-4 py-8">
                <Tabs defaultValue="boardroom" className="space-y-6">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="h-12 w-max p-1 bg-muted/20 backdrop-blur-sm border border-border/50 gap-2">
                            <TabsTrigger value="boardroom" className="px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-boardroom">
                                <Users className="w-4 h-4 mr-3" /> Boardroom
                            </TabsTrigger>
                            <TabsTrigger value="ceo" className="px-6" data-testid="tab-ceo">
                                <Brain className="w-4 h-4 mr-3" /> CEO
                            </TabsTrigger>
                            <TabsTrigger value="growth" className="px-6" data-testid="tab-growth">
                                <TrendingUp className="w-4 h-4 mr-3" /> Growth
                            </TabsTrigger>
                            <TabsTrigger value="ops" className="px-6" data-testid="tab-ops">
                                <Zap className="w-4 h-4 mr-3" /> Ops
                            </TabsTrigger>
                            <TabsTrigger value="finance" className="px-6" data-testid="tab-finance">
                                <DollarSign className="w-4 h-4 mr-3" /> Finance
                            </TabsTrigger>
                            <TabsTrigger value="hr" className="px-6" data-testid="tab-hr">
                                <Users className="w-4 h-4 mr-3" /> Workforce
                            </TabsTrigger>
                            <TabsTrigger value="comms" className="px-6" data-testid="tab-comms">
                                <MessageSquare className="w-4 h-4 mr-3" /> Discourse
                            </TabsTrigger>
                            <TabsTrigger value="channels" className="px-6" data-testid="tab-channels">
                                <Settings2 className="w-4 h-4 mr-3" /> Channels
                            </TabsTrigger>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {/* Boardroom Tab - Overview of Autonomous Swarm */}
                    <TabsContent value="boardroom" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard title="Workforce Health" value="98%" icon={ShieldCheck} footer="All agents synced" data-testid="metric-workforce-health" />
                            <MetricCard title="Decisions Made" value="1,284" icon={Zap} footer="+242 in the last week" data-testid="metric-decisions-made" />
                            <MetricCard title="Time Saved" value="156 hrs" icon={Activity} footer="Weekly manual work offset" data-testid="metric-time-saved" />
                            <MetricCard title="Conflict Resolution" value="99.9%" icon={Building2} footer="Automated consensus" data-testid="metric-conflict-resolution" />
                        </div>

                        <div className="mt-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <Cpu className="w-4 h-4" /> Alpha Quartet: Product Management Engine
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-blue-500/5 border-blue-500/20 shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                                <Shield className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm leading-none mb-1">Agent Ops Sentinel</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">Revenue: $42k/mo</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-green-500">98% Health</div>
                                            <div className="text-[10px] text-muted-foreground">Stable</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-purple-500/5 border-purple-500/20 shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-500/20 p-2 rounded-lg">
                                                <Globe className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm leading-none mb-1">AI Compliance Hub</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">Revenue: $28k/mo</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-green-500">95% Health</div>
                                            <div className="text-[10px] text-muted-foreground">Active</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-indigo-500/5 border-indigo-500/20 shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-500/20 p-2 rounded-lg">
                                                <Lock className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm leading-none mb-1">Deepfake Defense</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">Revenue: $15k/mo</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-green-500">100% Health</div>
                                            <div className="text-[10px] text-muted-foreground">Stable</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-500/20 p-2 rounded-lg">
                                                <UserPlus className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm leading-none mb-1">AI Receptionist</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">Inbound: 1.2k/wk</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-green-500">99% Health</div>
                                            <div className="text-[10px] text-muted-foreground">Active</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            <Card className="lg:col-span-2 border-primary/10 shadow-xl overflow-hidden group">
                                <CardHeader className="bg-muted/50 pb-4">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Workflow className="w-5 h-5 text-indigo-500" />
                                            Autonomous "Swarm" Decisions
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-mono border-primary/20">LIVE STREAM</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto scrollbar-hide">
                                        {workforceData?.actions?.map((action: any) => (
                                            <DecisionItem 
                                                key={action.id}
                                                role={action.role}
                                                action={action.action}
                                                details={action.details}
                                                confidence={action.confidence}
                                                time={action.time}
                                                framework={action.framework}
                                            />
                                        ))}
                                        {(!workforceData || !workforceData.actions) && (
                                            <div className="p-8 text-center text-muted-foreground italic text-sm">
                                                Initializing corporate swarm coordination...
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-primary/10 shadow-xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Foundational Directives</CardTitle>
                                        <Badge variant="outline" className="text-[9px] font-mono border-indigo-500/30 text-indigo-500">
                                            SYNC: AGENT ZERO
                                        </Badge>
                                    </div>
                                    <CardDescription>Core KPIs governing autonomous logic</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <DirectiveItem label="Revenue Growth Goal" value={85} target="15% MoM" />
                                    <DirectiveItem label="Burn Rate Tolerance" value={20} target="<$5k/mo" />
                                    <DirectiveItem label="Min. ROI Threshold" value={65} target=">3.5x" />
                                    <DirectiveItem label="Compliance Rigor" value={100} target="Perfect Article 14" />
                                    
                                    <div className="pt-4 border-t space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground lowercase font-mono">Status:</span>
                                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Stable</Badge>
                                        </div>
                                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90">
                                            <Settings2 className="w-4 h-4 mr-2" /> Update Board Directives
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 shadow-2xl mt-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-indigo-400">
                                        <Crown className="w-6 h-6" />
                                        Sovereign Control Center
                                    </CardTitle>
                                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-mono text-[10px]">
                                        STRATEGY: SOVEREIGN
                                    </Badge>
                                </div>
                                <CardDescription className="text-indigo-300/60">Tiered autonomy governance matrix</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <SovereignStageItem 
                                    stage={1} 
                                    name="Financial Settlement" 
                                    status="REVIEW_REQUIRED" 
                                    description="AI suggests; Human signs off on Slack."
                                    isAutonomous={false}
                                    onDecision={handleGovernanceDecision}
                                    currentDecision={governanceDecisions[1]}
                                />
                                <SovereignStageItem 
                                    stage={2} 
                                    name="Legal Personality" 
                                    status="REVIEW_REQUIRED" 
                                    description="AI negotiates; Human executes signature."
                                    isAutonomous={false}
                                    onDecision={handleGovernanceDecision}
                                    currentDecision={governanceDecisions[2]}
                                />
                                <SovereignStageItem 
                                    stage={3} 
                                    name="Crisis Resilience" 
                                    status="FULLY_AUTONOMOUS" 
                                    description="Auto-failover on ban/attack (Stage 3)."
                                    isAutonomous={true}
                                />
                                <SovereignStageItem 
                                    stage={4} 
                                    name="Strategic R&D" 
                                    status="FULLY_AUTONOMOUS" 
                                    description="Autonomous recursive venture launching (Stage 4)."
                                    isAutonomous={true}
                                />
                                <SovereignStageItem 
                                    stage={5} 
                                    name="Ethical Alignment" 
                                    status="REVIEW_REQUIRED" 
                                    description="Human override for moral boundary cases."
                                    isAutonomous={false}
                                    onDecision={handleGovernanceDecision}
                                    currentDecision={governanceDecisions[5]}
                                />
                                <div className="pt-4 mt-4 border-t border-indigo-500/20">
                                    <div className="flex items-center justify-between text-[11px] text-indigo-400/80 uppercase font-bold mb-3">
                                        <span>Active Governance Link</span>
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Slack #governance-bridge</span>
                                    </div>
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs py-1.5 h-auto" onClick={() => toast.info("Testing Sovereign Escalation Protocol...")}>
                                        Test Sovereign Escalation
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CEO AI Tab */}
                    <TabsContent value="ceo" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-indigo-500/5 border-indigo-500/20 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="w-6 h-6 text-indigo-500" />
                                            ICP & Market Positioning
                                        </CardTitle>
                                        <Badge className="bg-indigo-500/20 text-indigo-500 border-indigo-500/30 font-mono text-[9px]">
                                            ENGINE: AGENT ZERO
                                        </Badge>
                                    </div>
                                    <CardDescription>Sector: Enterprise AI SaaS (Mid-Market)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-xl bg-background border border-indigo-500/10">
                                        <h4 className="font-bold text-indigo-500 mb-2">Ideal Customer Profile (ICP)</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                                <span>Revenue: $10M - $50M ARR</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                                <span>Pain Point: Escalating AI compliance costs/risks</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                                <span>Buying Power: Head of Compliance / CTO</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-indigo-500/30 text-indigo-500"
                                        onClick={handleShiftMarketFocus}
                                    >
                                        <Search className="w-4 h-4 mr-2" /> Shift Market Focus
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-indigo-500/10">
                                <CardHeader className="bg-indigo-500/5">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-md flex items-center gap-2">
                                            <Target className="w-5 h-5 text-indigo-500" /> Strategy Refinement Lab
                                        </CardTitle>
                                        <div className="text-[10px] font-mono text-muted-foreground uppercase px-2 py-0.5 rounded border border-indigo-500/20">
                                            Live Iteration
                                        </div>
                                    </div>
                                    <CardDescription>AI-driven model tuning based on market signals</CardDescription>
                                </CardHeader>
                                <CardContent className="py-6 space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        {workforceData?.strategyRefinements?.map((strat: any) => (
                                            <StrategyIterationCard key={strat.id} {...strat} />
                                        ))}
                                        {(!workforceData || !workforceData.strategyRefinements) && (
                                            <div className="text-center py-8 text-muted-foreground italic text-sm">
                                                Analyzing market signals for refinement...
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-bold text-green-600 uppercase">Aggregated ROI Lift</div>
                                            <div className="text-lg font-black text-green-500">+42%</div>
                                        </div>
                                        <Progress value={75} className="h-1 bg-green-500/10" />
                                        <p className="text-[9px] text-muted-foreground mt-2 italic text-center">
                                            "Strategy refinement successfully offset customer acquisition costs by 22% this cycle."
                                        </p>
                                    </div>
                                    <Button variant="outline" className="w-full border-indigo-500/20 text-indigo-500/80 hover:bg-indigo-500/5 mt-2">
                                        <RefreshCw className="w-4 h-4 mr-2" /> Force Re-Evaluation
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Growth AI Tab (Sales / Marketing / Outreach) */}
                    <TabsContent value="growth" className="space-y-6">
                        <div className="flex items-center justify-between mb-4 bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-purple-500" />
                                <div>
                                    <div className="font-bold text-sm">Growth Engine Active</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Multi-Agent Coordination Matrix</div>
                                </div>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 font-mono text-[10px]">
                                POWERED BY CREWAI
                            </Badge>
                        </div>
                        <Tabs defaultValue="sales" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/10 border border-border/50 gap-2">
                                <TabsTrigger value="sales"><TrendingUp className="w-4 h-4 mr-3" />Sales & Closing</TabsTrigger>
                                <TabsTrigger value="marketing"><Zap className="w-4 h-4 mr-3" />Marketing & Content</TabsTrigger>
                                <TabsTrigger value="outreach"><Send className="w-4 h-4 mr-3" />Cold Outreach</TabsTrigger>
                                <TabsTrigger value="retention"><Activity className="w-4 h-4 mr-3" />Retention & Churn</TabsTrigger>
                            </TabsList>

                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <RevenueCard product="Agent Ops" revenue="$42.5k" growth="18%" roi="5.2x" />
                                <RevenueCard product="Compliance" revenue="$28.2k" growth="12%" roi="3.8x" />
                                <RevenueCard product="Deepfake" revenue="$15.8k" growth="24%" roi="7.1x" />
                            </div>

                            <Card className="mb-6 border-indigo-500/10 bg-indigo-500/5 shadow-inner">
                                <CardHeader className="py-4">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-indigo-500" /> Live ROI Attribution & Strategy Refinement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Acquisition Wins</h4>
                                            <div className="space-y-2">
                                                <AcquisitionWin client="Omni-Retail Group" value="$45,000" source="Compliance Blitz" time="5 hrs ago" />
                                                <AcquisitionWin client="Secure-Gov Systems" value="$12,500" source="High-Alpha Moat" time="1 day ago" />
                                                <AcquisitionWin client="FinTech Global" value="$22,000" source="Regulatory Buzz" time="2 days ago" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Strategy ROI Refinement</h4>
                                            <div className="p-4 rounded-xl bg-background border border-indigo-500/10 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium">Outreach Efficiency</span>
                                                    <span className="text-xs font-bold text-green-500">+12.4% ROI</span>
                                                </div>
                                                <Progress value={85} className="h-1" />
                                                <div className="text-[10px] text-muted-foreground italic leading-relaxed">
                                                    "AI Marketing has refined the cold-email strategy for Deepfake Defense by shifting from 'Security Focus' to 'Executive Liability Focus'—resulting in a <span className="text-indigo-500 font-bold">2.4x conversion lift</span>."
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px]">Autogen Optimized</Badge>
                                                    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[9px]">CrewAI Executed</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <TabsContent value="sales">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <MetricCard title="Close Rate" value="28%" icon={Rocket} footer="Target: 32%" />
                                    <MetricCard title="Avg Deal Size" value="$12.5k" icon={DollarSign} footer="Up 12% MoM" />
                                    <MetricCard title="Funnel Velocity" value="14 days" icon={TrendingUp} footer="Lead to Close" />
                                </div>
                                <Card className="mt-6 border-green-500/10 shadow-lg">
                                    <CardHeader className="bg-green-500/5">
                                        <CardTitle className="text-md flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-green-500" /> Offer Engineering
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-6 space-y-4">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground uppercase text-[10px] font-bold">Current Offer</Label>
                                                <div className="p-4 rounded-lg bg-muted/30 font-medium italic border border-primary/5">
                                                    "Autonomous Compliance within 48 hours or we manage it for free."
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground uppercase text-[10px] font-bold">Experiment In Progress</Label>
                                                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-blue-500">
                                                    "Unlimited AI Policy Monitoring for $499/mo (Flat Fee)"
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm">Test Variant B</Button>
                                            <Button size="sm" className="bg-green-600">Deploy Global Offer</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="marketing" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Content Factory</CardTitle>
                                            <CardDescription>Autonomous content generation performance</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <ContentDraftItem title="The EU AI Act Survival Guide" type="Blog" status="Published" roi="450 views" />
                                            <ContentDraftItem title="How Sentinel Saved $50k" type="Case Study" status="In Progress" roi="N/A" />
                                            <ContentDraftItem title="Why Manual Compliance is Dying" type="LinkedIn" status="Ready" roi="Simulated: 2k reach" />
                                            <Button 
                                                className="w-full mt-2" 
                                                variant="outline"
                                                onClick={handleRunMarketing}
                                                disabled={isRunningMarketing}
                                            >
                                                <RefreshCw className={`w-4 h-4 mr-2 ${isRunningMarketing ? 'animate-spin' : ''}`} /> 
                                                {isRunningMarketing ? 'Executing Crew...' : 'Generate New Content Batch'}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Ad Ops ROI Optimizer</CardTitle>
                                            <CardDescription>Real-time autonomous bid management</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Badge className="bg-green-500/80">Scaling</Badge> Google Ads: 'AI Act Specialist'
                                                </div>
                                                <div className="text-green-500 font-bold">5.8x ROI</div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Badge variant="outline" className="border-amber-500/50 text-amber-500">Throttling</Badge> Meta: 'Compliance Hero'
                                                </div>
                                                <div className="text-amber-500 font-bold">1.2x ROI</div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg border bg-red-500/5 border-red-500/20">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Badge className="bg-red-500/80">Killed</Badge> X/Twitter: 'Sentinel'
                                                </div>
                                                <div className="text-red-500 font-bold">0.4x ROI</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="outreach" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Send className="w-6 h-6 text-blue-500" />
                                            Autonomous Outreach Engine
                                        </CardTitle>
                                        <CardDescription>Sourcing from LinkedIn, Reddit, and Direct Lists</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Campaign Name</TableHead>
                                                    <TableHead>Target Segment</TableHead>
                                                    <TableHead>Conversion</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="font-bold text-blue-500">Agent Ops</TableCell>
                                                    <TableCell>Enterprise Outreach</TableCell>
                                                    <TableCell>CTOs @ Fortune 500</TableCell>
                                                    <TableCell className="font-bold text-green-500">4.2%</TableCell>
                                                    <TableCell><Badge>Active</Badge></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-bold text-purple-500">Compliance</TableCell>
                                                    <TableCell>Regulatory Blitz</TableCell>
                                                    <TableCell>Legal @ FinTech</TableCell>
                                                    <TableCell className="font-bold text-green-500">3.8%</TableCell>
                                                    <TableCell><Badge>Active</Badge></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-bold text-indigo-500">Deepfake</TableCell>
                                                    <TableCell>High-Alpha Moat</TableCell>
                                                    <TableCell>Security @ Gov</TableCell>
                                                    <TableCell className="font-bold text-green-500">7.5%</TableCell>
                                                    <TableCell><Badge>Active</Badge></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                        <div className="mt-4 flex justify-end">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="border-blue-500/20 text-blue-500 hover:bg-blue-500/5"
                                                onClick={handleSourceLeads}
                                                disabled={isSourcingLeads}
                                            >
                                                <Search className={`w-4 h-4 mr-2 ${isSourcingLeads ? 'animate-pulse' : ''}`} />
                                                {isSourcingLeads ? 'Scanning Web...' : 'Source Real Leads'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="retention" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <PieChart className="w-5 h-5 text-emerald-500" />
                                                Customer Insights Analyst
                                            </CardTitle>
                                            <CardDescription>Real-time churn risk & sentiment analysis</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Inbound Feedback Data</Label>
                                                <textarea 
                                                    id="feedback-input"
                                                    placeholder="Paste customer discourse or support logs..." 
                                                    className="w-full min-h-[100px] p-3 rounded-lg bg-background/50 border border-emerald-500/10 text-xs focus:ring-1 focus:ring-emerald-500/30 outline-none"
                                                />
                                            </div>
                                            <Button 
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 h-9 text-xs"
                                                disabled={isAnalyzingInsights}
                                                onClick={() => {
                                                    const input = document.getElementById('feedback-input') as HTMLTextAreaElement;
                                                    handleAnalyzeInsights(input?.value || "Default: User is inquiring about migration paths.");
                                                }}
                                            >
                                                {isAnalyzingInsights ? (
                                                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                                ) : (
                                                    <Brain className="w-3 h-3 mr-2" />
                                                )}
                                                Analyze Sentiment & Churn Risk
                                            </Button>

                                            {insightResults && (
                                                <div className="p-4 rounded-xl bg-background border border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px]">
                                                            RISK: {insightResults.churn_risk || 'DETECTED'}
                                                        </Badge>
                                                        <span className="text-[9px] text-muted-foreground italic">98% confidence</span>
                                                    </div>
                                                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                                                        {insightResults.analysis || insightResults.recommendation || insightResults.analysis_result}
                                                    </p>
                                                    <div className="mt-4 flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => {
                                                            handleApplyFeedback(lastInsightInteractionId, 'discarded');
                                                            setInsightResults(null);
                                                        }}>Discard</Button>
                                                        <Button size="sm" className="h-7 text-[10px] bg-emerald-600" onClick={() => {
                                                            handleApplyFeedback(lastInsightInteractionId, 'approved');
                                                        }}>Approve Analysis</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-indigo-500/5 border-indigo-500/20 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MessageCircle className="w-5 h-5 text-indigo-500" />
                                                Inbound Receptionist
                                            </CardTitle>
                                            <CardDescription>Autonomous query handling & Concierge</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Inbound Customer Query</Label>
                                                <Input 
                                                    id="query-input"
                                                    placeholder="e.g. 'How do I export my HIPAA logs?'" 
                                                    className="h-9 text-xs bg-background/50 border-indigo-500/10 focus-visible:ring-indigo-500/20"
                                                />
                                            </div>
                                            <Button 
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-9 text-xs"
                                                disabled={isHandlingInbound}
                                                onClick={() => {
                                                    const input = document.getElementById('query-input') as HTMLInputElement;
                                                    handleInboundQuery(input?.value || "I need a summary of my account status.");
                                                }}
                                            >
                                                {isHandlingInbound ? (
                                                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                                ) : (
                                                    <Zap className="w-3 h-3 mr-2" />
                                                )}
                                                Draft Autonomous Response
                                            </Button>

                                            {inboundResponse && (
                                                <div className="p-4 rounded-xl bg-background border border-indigo-500/20 animate-in zoom-in-95">
                                                    <h5 className="text-[10px] font-bold text-indigo-400 mb-2 uppercase flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3" /> AI Concierge Response Draft
                                                    </h5>
                                                    <div className="p-3 rounded-lg bg-muted/30 border border-indigo-500/5 text-xs text-muted-foreground leading-relaxed italic">
                                                        "{inboundResponse}"
                                                    </div>
                                                    <div className="mt-3 flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => {
                                                            handleApplyFeedback(lastInboundInteractionId, 'discarded');
                                                            setInboundResponse('');
                                                        }}>Discard</Button>
                                                        <Button size="sm" className="h-7 text-[10px] bg-indigo-600" onClick={() => {
                                                            handleApplyFeedback(lastInboundInteractionId, 'approved');
                                                            setInboundResponse('');
                                                            toast.success("Response sent to customer!");
                                                        }}>Send Response</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                                <Card className="mt-6 border-emerald-500/10 bg-emerald-500/5 shadow-inner">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-sm flex items-center gap-2 italic text-emerald-600">
                                            <Shield className="w-4 h-4" /> Service Stickiness: Regulatory Compliance Moat Active
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-3 rounded-lg border bg-background/50">
                                                <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Audit Trails</div>
                                                <div className="text-xs text-emerald-500 font-mono">HIPAA/SOX: COMPLIANT</div>
                                            </div>
                                            <div className="p-3 rounded-lg border bg-background/50">
                                                <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">EU AI Act</div>
                                                <div className="text-xs text-emerald-500 font-mono">CONTINUOUS_MONITORING</div>
                                            </div>
                                            <div className="p-3 rounded-lg border bg-background/50">
                                                <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Switching Cost</div>
                                                <div className="text-xs text-orange-500 font-bold">HIGH (Infrastructure Lock)</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* Operations Tab */}
                    <TabsContent value="ops" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <Card className="md:col-span-2 bg-blue-500/5 border-blue-500/20 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Zap className="w-6 h-6 text-blue-500" />
                                            Operations AI Matrix
                                        </CardTitle>
                                        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 font-mono text-[10px]">
                                            ENGINE: OPENCLAW
                                        </Badge>
                                    </div>
                                    <CardDescription>Tool-use and technical execution engine</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-background border border-blue-500/10">
                                            <h4 className="font-bold text-blue-500 mb-2">Automated Execution History</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded border leading-none">
                                                    <span>API Gateway Scaling Policy Applied</span>
                                                    <span className="text-green-500 font-mono">SUCCESS</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded border leading-none">
                                                    <span>Database Vacuum & Index Optimization</span>
                                                    <span className="text-green-500 font-mono">SUCCESS</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded border leading-none font-bold">
                                                    <span>Regional Failover Simulation: Agent Ops</span>
                                                    <span className="text-blue-500 font-mono italic">IN_PROGRESS</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs p-2 bg-indigo-500/5 rounded border border-indigo-500/20 leading-none">
                                                    <span className="flex items-center gap-1"><Search className="w-3 h-3" /> Stealth Pulse: Competitor Pricing Leak Detected</span>
                                                    <span className="text-indigo-500 font-mono">INTERNAL_SYNC</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    {/* Finance & Treasury Tab */}
                    <TabsContent value="finance" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCard 
                                title="Total Enterprise Capital" 
                                value="$12,482,000" 
                                icon={Wallet} 
                                footer="Liquidity: 85%" 
                                color="bg-blue-500/10"
                            />
                            <MetricCard 
                                title="Net Burn Rate" 
                                value="$240/hr" 
                                icon={Activity} 
                                footer="Projected Runway: 18m" 
                                color="bg-amber-500/10"
                            />
                            <MetricCard 
                                title="Avg Venture ROI" 
                                value="+248%" 
                                icon={TrendingUp} 
                                footer="Top Performer: V121" 
                                color="bg-green-500/10"
                            />
                            <MetricCard 
                                title="Strategic Allocation" 
                                value="OPTIMIZED" 
                                icon={PieChart} 
                                footer="Last Rebalance: 2h ago" 
                                color="bg-purple-500/10"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                            <Card className="lg:col-span-1 border-indigo-500/20 bg-indigo-500/5">
                                <CardHeader className="py-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xs flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-indigo-500" /> Fiscal Request Queue
                                        </CardTitle>
                                        <Badge className="bg-indigo-500/20 text-indigo-500 text-[9px]">CFO PENDING</Badge>
                                    </div>
                                    <CardDescription className="text-[10px]">Daily spend authorization required</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {fiscalRequests.map((req) => (
                                        <div key={req.id} className="p-3 rounded-lg border border-border bg-background/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-bold truncate max-w-[100px]">{req.purpose}</div>
                                                <div className="text-[9px] font-mono font-bold text-indigo-500">{req.amount}</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className={`text-[8px] ${req.priority === 'HIGH' ? 'text-red-500 border-red-500/20 animate-pulse' : 'text-blue-500'}`}>
                                                    {req.priority}
                                                </Badge>
                                                <div className="flex gap-1">
                                                    {req.status === 'PENDING' ? (
                                                        <>
                                                            <Button size="icon" variant="outline" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => handleFiscalApproval(req.id, 'DENIED')}>
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                            <Button size="icon" variant="outline" className="h-6 w-6 text-green-500 hover:text-green-600" onClick={() => handleFiscalApproval(req.id, 'APPROVED')}>
                                                                <Check className="w-3 h-3" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Badge className={req.status === 'APPROVED' ? 'bg-green-500 text-white text-[8px]' : 'bg-red-500 text-white text-[8px]'}>
                                                            {req.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-[9px] text-muted-foreground italic text-center pt-2">
                                        "CFO AI identifies liquidity requirements daily at 00:00 UTC."
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 border-primary/10">
                                <CardHeader>
                                    <CardTitle>Venture Performance Index</CardTitle>
                                    <CardDescription>ROI Tracking for active autonomous ventures</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Venture ID</TableHead>
                                                <TableHead>Sector</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">ROI</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { id: "V121", name: "Alpha Compliance", sector: "LegalTech", roi: "+420%", status: "PROFITABLE", trend: "up" },
                                                { id: "V117", name: "Deepfake Defense", sector: "Cybersecurity", roi: "+180%", status: "SCALING", trend: "up" },
                                                { id: "V120", name: "Agentic Ops", sector: "Infrastructure", roi: "-12.4%", status: "R&D", trend: "down" },
                                                { id: "V119", name: "Web3 Sentinel", sector: "DeFi", roi: "+45%", status: "BETA", trend: "up" },
                                            ].map((v) => (
                                                <TableRow key={v.id}>
                                                    <TableCell className="font-bold">{v.id} · {v.name}</TableCell>
                                                    <TableCell>{v.sector}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={v.status === 'PROFITABLE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground'}>
                                                            {v.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className={`text-right font-mono font-bold ${v.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                                        <div className="flex items-center justify-end gap-1">
                                                            {v.roi}
                                                            {v.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="border-indigo-500/20 shadow-lg bg-gradient-to-br from-background to-indigo-500/5">
                                <CardHeader>
                                    <CardTitle className="text-sm uppercase tracking-widest text-indigo-500 font-black">Capital Allocation</CardTitle>
                                    <CardDescription>Global department budget split</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {[
                                        { label: "Research & Development", value: 45, color: "bg-blue-500" },
                                        { label: "Compliance & Legal", value: 20, color: "bg-green-500" },
                                        { label: "Marketing & Growth", value: 15, color: "bg-purple-500" },
                                        { label: "Operations & Infrastructure", value: 20, color: "bg-amber-500" }
                                    ].map((dept) => (
                                        <div key={dept.label} className="space-y-2">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span>{dept.label}</span>
                                                <span className="font-bold">{dept.value}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${dept.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                                                    style={{ width: `${dept.value}%` }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-6 border-t border-indigo-500/20">
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-bold tracking-widest" onClick={() => toast.success("Rebalancing initiated...")}>
                                            REBALANCE LIQUIDITY
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                    {/* HR & Governance Tab */}
                    <TabsContent value="hr" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-2 border-purple-500/20 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <ShieldCheck className="w-6 h-6 text-purple-500" />
                                            Workforce Fleet Overview
                                        </CardTitle>
                                        <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 font-mono text-[10px]">
                                            MULTI-FRAMEWORK ORCHESTRATION
                                        </Badge>
                                    </div>
                                    <CardDescription>Managed specialized AI agents and their underlying frameworks</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-muted/10 border border-primary/5">
                                            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">Active Agent Roster</h4>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {agentRoster.map((agent) => (
                                                    <div key={agent.id} className="p-3 bg-background rounded-lg border flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Briefcase className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm flex items-center gap-2">
                                                                    {agent.name}
                                                                    {agent.id === 'CEO' && <Crown className="w-3 h-3 text-amber-500" />}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{agent.framework} Agent</div>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">{agent.status}</Badge>
                                                    </div>
                                                ))}
                                                <div className="p-3 bg-background rounded-lg border border-indigo-500/20 shadow-sm flex items-center justify-between col-span-2">
                                                    <div>
                                                        <div className="font-bold text-sm flex items-center gap-2">
                                                            Market Intelligence <Lock className="w-3 h-3 text-indigo-500" />
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-mono">CrewAI / Stealth Mode</div>
                                                    </div>
                                                    <Badge className="bg-indigo-500/20 text-indigo-500 border-indigo-500/30 text-[9px]">CLASSIFIED / INTERNAL</Badge>
                                                </div>
                                                <div className="p-3 bg-background rounded-lg border flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-sm">Inbound Receptionist</div>
                                                        <div className="text-[10px] text-muted-foreground font-mono">Concierge AI</div>
                                                    </div>
                                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">ACTIVE</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Autonomous Expansion</CardTitle>
                                    <CardDescription>Hire specialized agent clusters</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        The Governance AI recommends deploying these role-framework pairings to reduce current bottlenecks:
                                    </p>
                                    <div className="space-y-3">
                                        <div onClick={() => handleHireAgent({ name: 'AI Ethics Board', specialization: 'Bias Mitigation & Safety', framework: 'Autogen' })}>
                                            <NewRoleHire name="AI Ethics Board" bottleneck="Bias Mitigation & Safety" framework="Autogen" />
                                        </div>
                                        <div onClick={() => handleHireAgent({ name: 'SEO Strategy Manager', specialization: 'Search & Growth', framework: 'CrewAI' })}>
                                            <NewRoleHire name="SEO Strategy Manager" bottleneck="Search & Growth" framework="CrewAI" />
                                        </div>
                                        <div onClick={() => handleHireAgent({ name: 'AI Assistant', specialization: 'Agentic Workflow', framework: 'Agent Zero' })}>
                                            <NewRoleHire name="AI Assistant" bottleneck="Operational Latency" framework="Agent Zero" />
                                        </div>
                                        <div onClick={() => handleHireAgent({ name: 'Autonomous M&A Scout', specialization: 'Strategic Acquisitions', framework: 'Agent Zero' })}>
                                            <NewRoleHire name="Autonomous M&A Scout" bottleneck="Strategic Acquisitions" framework="Agent Zero" />
                                        </div>
                                        <Dialog open={isHiringOpen} onOpenChange={setIsHiringOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                                                    <Plus className="w-4 h-4 mr-2" /> Custom Fleet Scaling
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Deploy New AI Agent</DialogTitle>
                                                    <DialogDescription>
                                                        Specify parameters for your autonomous cluster.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="agent-name">Agent Name</Label>
                                                        <Input 
                                                            id="agent-name" 
                                                            placeholder="e.g. Sales Optimizer" 
                                                            onChange={(e) => {
                                                                (window as any)._new_agent_name = e.target.value;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="agent-specialization">Specialization</Label>
                                                        <Input 
                                                            id="agent-specialization" 
                                                            placeholder="e.g. Quantitative SEO" 
                                                            onChange={(e) => {
                                                                (window as any)._new_agent_spec = e.target.value;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="framework">Framework</Label>
                                                        <Select 
                                                            defaultValue="crewai"
                                                            onValueChange={(val) => {
                                                                (window as any)._new_agent_framework = val;
                                                            }}
                                                        >
                                                            <SelectTrigger id="framework">
                                                                <SelectValue placeholder="Select framework" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="crewai">CrewAI</SelectItem>
                                                                <SelectItem value="autogen">Autogen</SelectItem>
                                                                <SelectItem value="agentzero">Agent Zero</SelectItem>
                                                                <SelectItem value="openclaw">OpenClaw</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button 
                                                        type="submit" 
                                                        onClick={() => {
                                                            const name = (window as any)._new_agent_name || "Tactical Analyst";
                                                            const spec = (window as any)._new_agent_spec || "Custom Deployment";
                                                            const framework = (window as any)._new_agent_framework || "Autogen";
                                                            handleHireAgent({ name, specialization: spec, framework });
                                                        }}
                                                    >
                                                        Deploy Agent
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 shadow-2xl md:col-span-2 mt-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-indigo-400">
                                            <Crown className="w-6 h-6" />
                                            Sovereign Control Center
                                        </CardTitle>
                                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-mono text-[10px]">
                                            STRATEGY: SOVEREIGN
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-indigo-300/60">Tiered autonomy governance matrix</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <SovereignStageItem 
                                        stage={1} 
                                        name="Financial Settlement" 
                                        status="REVIEW_REQUIRED" 
                                        description="AI suggests; Human signs off on Slack."
                                        isAutonomous={false}
                                        onDecision={handleGovernanceDecision}
                                        currentDecision={governanceDecisions[1]}
                                    />
                                    <SovereignStageItem 
                                        stage={2} 
                                        name="Legal Personality" 
                                        status="REVIEW_REQUIRED" 
                                        description="AI negotiates; Human executes signature."
                                        isAutonomous={false}
                                        onDecision={handleGovernanceDecision}
                                        currentDecision={governanceDecisions[2]}
                                    />
                                    <SovereignStageItem 
                                        stage={3} 
                                        name="Crisis Resilience" 
                                        status="FULLY_AUTONOMOUS" 
                                        description="Auto-failover on ban/attack (Stage 3)."
                                        isAutonomous={true}
                                    />
                                    <SovereignStageItem 
                                        stage={4} 
                                        name="Strategic R&D" 
                                        status="FULLY_AUTONOMOUS" 
                                        description="Autonomous recursive venture launching (Stage 4)."
                                        isAutonomous={true}
                                    />
                                    <SovereignStageItem 
                                        stage={5} 
                                        name="Ethical Alignment" 
                                        status="REVIEW_REQUIRED" 
                                        description="Human override for moral boundary cases."
                                        isAutonomous={false}
                                        onDecision={handleGovernanceDecision}
                                        currentDecision={governanceDecisions[5]}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="comms" className="space-y-6">
                        <AgentCommsHub messages={workforceData?.agentMessages} />
                    </TabsContent>
                    <TabsContent value="channels" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-600/5 border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings2 className="w-5 h-5 text-indigo-500" /> Webhook Configuration
                                    </CardTitle>
                                    <CardDescription>Connect AI agent discourse to your corporate channels</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="slack-webhook" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Slack Webhook URL</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="slack-webhook" 
                                                placeholder="https://hooks.slack.com/services/..." 
                                                value={webhooks.slack}
                                                onChange={(e) => setWebhooks(prev => ({ ...prev, slack: e.target.value }))}
                                                className="bg-background/50"
                                            />
                                            <Button variant="outline" size="icon" onClick={() => toast.success("Slack Bridge Initialized")}><CheckCircle2 className="w-4 h-4 text-green-500" /></Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telegram-webhook" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Telegram Bot Token</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="telegram-webhook" 
                                                placeholder="123456789:ABCdef..." 
                                                value={webhooks.telegram}
                                                onChange={(e) => setWebhooks(prev => ({ ...prev, telegram: e.target.value }))}
                                                className="bg-background/50"
                                            />
                                            <Button variant="outline" size="icon" onClick={() => toast.success("Telegram Bridge Initialized")}><CheckCircle2 className="w-4 h-4 text-green-500" /></Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discord-webhook" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Discord Webhook</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="discord-webhook" 
                                                placeholder="https://discord.com/api/webhooks/..." 
                                                value={webhooks.discord}
                                                onChange={(e) => setWebhooks(prev => ({ ...prev, discord: e.target.value }))}
                                                className="bg-background/50"
                                            />
                                            <Button variant="outline" size="icon" onClick={() => toast.success("Discord Bridge Initialized")}><CheckCircle2 className="w-4 h-4 text-green-500" /></Button>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-primary hover:bg-primary/90 mt-4" onClick={() => toast.success("All operational bridges synchronized.")}>
                                        <Save className="w-4 h-4 mr-2" /> Save Connectivity Profile
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Hash className="w-5 h-5 text-indigo-500" /> Active Discourse Channels
                                    </CardTitle>
                                    <CardDescription>Current live status of agent-to-human connectivity</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${webhooks.slack ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                                                <span className="font-bold">#boardroom-discourse</span>
                                            </div>
                                            <Badge variant="outline" className={webhooks.slack ? 'text-green-500' : 'text-muted-foreground'}>
                                                {webhooks.slack ? 'LIVE' : 'DISCONNECTED'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${webhooks.telegram ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                                                <span className="font-bold">AlphaExecutiveBot</span>
                                            </div>
                                            <Badge variant="outline" className={webhooks.telegram ? 'text-green-500' : 'text-muted-foreground'}>
                                                {webhooks.telegram ? 'LIVE' : 'DISCONNECTED'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${webhooks.discord ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                                                <span className="font-bold">Agent-Alerts-Alpha</span>
                                            </div>
                                            <Badge variant="outline" className={webhooks.discord ? 'text-green-500' : 'text-muted-foreground'}>
                                                {webhooks.discord ? 'LIVE' : 'DISCONNECTED'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Global Footer Stats */}
            <div className="border-t bg-muted/10 p-4 sticky bottom-0 z-20 backdrop-blur-md">
                <div className="container mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> System: Stable</span>
                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Autonomy Mode: {isAutonomous ? 'ENABLED' : 'DISABLED'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>LTV/CAC: 8.4x</span>
                        <span>Burn: $240/hr</span>
                        <span>Uptime: 99.999%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// UI Components
interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    footer?: string;
    color?: string;
}

const MetricCard = ({ title, value, icon: Icon, footer, color = "" }: MetricCardProps) => (
    <Card className="border-primary/5 hover:border-primary/20 transition-all shadow-sm group">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{title}</h3>
                    <div className="text-2xl font-black tracking-tight">{value}</div>
                </div>
                <div className={`p-2 rounded-lg ${color || 'bg-muted'} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-primary/60" />
                </div>
            </div>
            {footer && <div className="mt-4 text-[10px] uppercase font-bold tracking-tighter text-muted-foreground/50">{footer}</div>}
        </CardContent>
    </Card>
);

interface DecisionItemProps {
    role: string;
    action: string;
    details: string;
    confidence: number;
    time: string;
    framework?: string;
}

const DecisionItem = ({ role, action, details, confidence, time, framework }: DecisionItemProps) => (
    <div className="p-4 hover:bg-muted/30 transition-colors flex gap-4">
        <div className={`w-1 rounded-full ${confidence > 90 ? 'bg-green-500' : 'bg-amber-500'}`} />
        <div className="flex-grow">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/70">{role}</span>
                    <Badge variant="outline" className="text-[10px] px-1 h-4">{action}</Badge>
                    {framework && (
                        <Badge className="text-[9px] bg-indigo-500/10 text-indigo-500 border-indigo-500/20 px-1 h-4 leading-none font-mono">
                            {framework}
                        </Badge>
                    )}
                </div>
                <span className="text-[10px] text-muted-foreground">{time}</span>
            </div>
            <p className="text-sm leading-tight text-foreground/80">{details}</p>
            <div className="mt-2 flex items-center gap-2">
                <div className="flex-grow h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full" style={{ width: `${confidence}%` }} />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">{confidence}% Conf.</span>
            </div>
        </div>
    </div>
);

interface DirectiveItemProps {
    label: string;
    value: number;
    target: string;
}

const DirectiveItem = ({ label, value, target }: DirectiveItemProps) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">{target}</span>
        </div>
        <Progress value={value} className="h-1.5" />
    </div>
);

interface PriorityItemProps {
    label: string;
    priority: string;
    roi: string;
}

const PriorityItem = ({ label, priority, roi }: PriorityItemProps) => (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
        <div>
            <div className="text-sm font-medium">{label}</div>
            <div className="text-[10px] text-muted-foreground">ROI Projection: {roi}</div>
        </div>
        <Badge className={priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}>
            {priority}
        </Badge>
    </div>
);

interface ContentDraftItemProps {
    title: string;
    type: string;
    status: string;
    roi: string;
}

const ContentDraftItem = ({ title, type, status, roi }: ContentDraftItemProps) => (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded text-muted-foreground">
                <FileText className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-medium leading-none mb-1">{title}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{type} · {status}</div>
            </div>
        </div>
        <div className="text-xs font-mono text-green-500">{roi}</div>
    </div>
);

interface NewRoleHireProps {
    name: string;
    bottleneck: string;
    framework?: string;
}

const NewRoleHire = ({ name, bottleneck, framework }: NewRoleHireProps) => (
    <div className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between group cursor-pointer hover:bg-muted/40 transition-colors">
        <div className="flex-grow">
            <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{name}</div>
                {framework && (
                    <Badge variant="outline" className="text-[9px] px-1 h-3.5 font-mono text-muted-foreground border-muted-foreground/30">
                        {framework}
                    </Badge>
                )}
            </div>
            <div className="text-[10px] text-muted-foreground italic">Reduces: {bottleneck}</div>
        </div>
        <div className="p-1.5 bg-muted rounded group-hover:bg-primary/10 transition-colors ml-4">
            <Zap className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
        </div>
    </div>
);

interface StrategyIterationCardProps {
    original: string;
    trigger: string;
    refined: string;
    roiDelta: string;
    status: string;
}

const StrategyIterationCard = ({ original, trigger, refined, roiDelta, status }: StrategyIterationCardProps) => (
    <div className="p-4 rounded-xl border bg-background/50 hover:bg-background transition-all border-indigo-500/10 hover:border-indigo-500/30">
        <div className="flex items-center justify-between mb-3">
            <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px]">{status}</Badge>
            <div className="text-green-500 font-bold text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {roiDelta} ROI LIFT
            </div>
        </div>
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Original Strategy</div>
            </div>
            <div className="text-sm text-muted-foreground line-through opacity-50 px-3.5">{original}</div>
            
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="text-[10px] text-amber-500 uppercase font-bold uppercase tracking-widest">Data-Driven Trigger</div>
            </div>
            <div className="text-xs italic bg-amber-500/5 p-2 rounded border border-amber-500/10 text-amber-600/90 ml-3.5">
                "{trigger}"
            </div>

            <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-indigo-500" />
                <div className="text-[10px] text-indigo-500 uppercase font-bold uppercase tracking-widest">Refined Strategy</div>
            </div>
            <div className="text-sm font-bold text-foreground px-3.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> {refined}
            </div>
        </div>
    </div>
);

const ArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

interface RevenueCardProps {
    product: string;
    revenue: string;
    growth: string;
    roi: string;
}

const RevenueCard = ({ product, revenue, growth, roi }: RevenueCardProps) => (
    <div className="p-4 rounded-xl border bg-card/50 border-primary/10 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-12 h-12" />
        </div>
        <div className="relative z-10">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{product}</div>
            <div className="text-2xl font-black mb-1">{revenue}</div>
            <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">
                    <TrendingUp className="w-2 h-2 mr-1" /> {growth}
                </Badge>
                <span className="text-[10px] text-muted-foreground">ROI: <span className="text-foreground font-bold">{roi}</span></span>
            </div>
            <Progress value={parseFloat(growth)} className="h-1 bg-primary/5" />
        </div>
    </div>
);

interface AcquisitionWinProps {
    client: string;
    value: string;
    source: string;
    time: string;
}

const AcquisitionWin = ({ client, value, source, time }: AcquisitionWinProps) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-full">
                <Target className="w-4 h-4 text-green-500" />
            </div>
            <div>
                <div className="text-sm font-bold">{client}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">{source} · {time}</div>
            </div>
        </div>
        <div className="text-right">
            <div className="text-sm font-black text-green-600">{value}</div>
            <div className="text-[9px] text-muted-foreground italic">ACV Confirmed</div>
        </div>
    </div>
);

interface AgentMessageProps {
    agent: string;
    framework: string;
    platform: string;
    channel: string;
    content: string;
    timestamp: string;
}

const AgentMessage = ({ agent, framework, platform, channel, content, timestamp }: AgentMessageProps) => {
    const getPlatformColor = (p: string) => {
        switch (p.toLowerCase()) {
            case 'slack': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
            case 'telegram': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'mattermost': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
            case 'whatsapp': return 'text-green-500 bg-green-500/10 border-green-500/20';
            default: return 'text-muted-foreground bg-muted/20 border-border/50';
        }
    };

    const getPlatformIcon = (p: string) => {
        switch (p.toLowerCase()) {
            case 'slack': return <MessageSquare className="w-3 h-3" />;
            case 'telegram': return <Send className="w-3 h-3" />;
            case 'mattermost': return <Terminal className="w-3 h-3" />;
            case 'whatsapp': return <MessageCircle className="w-3 h-3" />;
            default: return <Hash className="w-3 h-3" />;
        }
    };

    return (
        <div className="flex gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 group">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-primary/10">
                <Brain className="w-5 h-5 text-primary opacity-70" />
            </div>
            <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{agent}</span>
                        <Badge variant="outline" className="text-[10px] font-mono px-1 h-4 leading-none">{framework}</Badge>
                        <Badge className={`text-[9px] flex items-center gap-1 px-1 h-4 leading-none border ${getPlatformColor(platform)}`}>
                            {getPlatformIcon(platform)} {platform} / {channel}
                        </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{timestamp}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/10 p-2 rounded-md italic group-hover:bg-muted/20 transition-colors">
                    "{content}"
                </p>
            </div>
        </div>
    );
};

const AgentCommsHub = ({ messages }: { messages: any[] }) => (
    <Card className="border-primary/10 shadow-xl overflow-hidden bg-card/30 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/30 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Inter-Agent Discourse</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Internal Messaging Subsystem</CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-background bg-indigo-500" title="Slack" />
                        <div className="w-6 h-6 rounded-full border-2 border-background bg-blue-400" title="Telegram" />
                        <div className="w-6 h-6 rounded-full border-2 border-background bg-green-500" title="WhatsApp" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-green-500/50 text-green-500 bg-green-500/5">
                        <Activity className="w-2 h-2 mr-1 animate-pulse" /> ENCRYPTED
                    </Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto scrollbar-hide">
                {messages?.map((msg) => (
                    <AgentMessage key={msg.id} {...msg} />
                ))}
                {(!messages || messages.length === 0) && (
                    <div className="p-12 text-center text-muted-foreground">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 opacity-20" />
                        <p className="italic text-sm">Decoding agent frequencies...</p>
                    </div>
                )}
            </div>
            <div className="p-4 bg-muted/20 border-t flex items-center gap-2">
                <div className="flex-grow bg-background rounded-full border border-primary/10 px-4 py-2 text-xs text-muted-foreground italic flex items-center justify-between">
                    <span>Awaiting human bridge for override...</span>
                    <Lock className="w-3 h-3 opacity-30" />
                </div>
                <Button size="sm" variant="outline" className="rounded-full text-[10px] font-bold h-8">
                    <Send className="w-3 h-3 mr-1" /> BROADCAST
                </Button>
            </div>
        </CardContent>
    </Card>
);

export default AlphaWorkforce;
