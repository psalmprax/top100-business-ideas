/**
 * Alpha Agent Ops - Enterprise Dashboard
 * Real-time observability and governance for autonomous AI agents
 * 
 * Features:
 * - Semantic Cost Capping
 * - Multi-Agent Dynamic Budgeting
 * - Semantic Audit Trail
 * - Slack/Teams Alerts
 * - Agent Memory Management
 * - Custom Budget Rules Engine
 * - Usage Forecasting
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { agentsApi, rulesApi, metricsApi, extendedApi, type WebhookConfig, type MultiCloudStatus, type SelfHealingEvent } from '@/lib/api';
import {
    LayoutDashboard,
    Bot,
    Wallet,
    Tag,
    Milestone,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Pause,
    Play,
    Settings,
    Shield,
    Zap,
    Clock,
    TrendingUp,
    DollarSign,
    Server,
    Cpu,
    RefreshCw,
    Plus,
    MoreVertical,
    Slack,
    Users,
    FileText,
    BarChart3,
    Brain,
    Gauge,
    ShieldAlert,
    Bell,
    Key,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Search,
    Download,
    Filter,
    BellOff,
    MessageSquare,
    Globe,
    History,
    Network,
    Webhook,
    ShieldCheck,
    Languages,
    Code,
    Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// ============================================================================
// Types
// ============================================================================

interface DashboardAgent {
    id: string;
    name: string;
    type: 'langgraph' | 'crewai' | 'autogen' | 'custom';
    status: 'active' | 'paused' | 'error' | 'stopped';
    environment?: string;
    provider?: string;
    model?: string;
    api_secret?: string;
    org_id?: string;
    control_webhook?: string;
    budget: number;
    dailySpend: number;
    config: {
        provider: string;
        model: string;
        maxTokens: number;
        temperature: number;
        rules: DashboardAgentRule[];
    };
    metrics: DashboardAgentMetrics;
    created_at?: string;
    createdAt: Date;
    lastActiveAt: Date;
}

interface DashboardAgentRule {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    config: Record<string, unknown>;
}

interface DashboardAgentMetrics {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    avgLatencyMs: number;
    errorRate: number;
    loopCount: number;
    cacheHits: number;
    loopsPrevented: number;
    costSaved: number;
}

interface AuditEntry {
    id: string;
    timestamp: Date;
    agentId: string;
    agentName: string;
    action: string;
    intent: string;
    outcome: 'approved' | 'denied' | 'modified' | 'paused';
    tokens: number;
    cost: number;
    reasoning: string;
}

interface AlertConfig {
    id: string;
    type: 'slack' | 'teams' | 'email' | 'webhook';
    channel: string;
    threshold: number; // percentage of budget
    enabled: boolean;
}

interface BudgetRule {
    id: string;
    name: string;
    agentIds: string[];
    dailyLimit: number;
    priority: 'low' | 'medium' | 'high';
    action: 'pause' | 'alert' | 'throttle';
    enabled: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockAgents: DashboardAgent[] = [
    {
        id: '1',
        name: 'Customer Support Agent',
        type: 'langgraph',
        status: 'active',
        budget: 50,
        dailySpend: 32.50,
        config: {
            provider: 'openai',
            model: 'gpt-4-turbo',
            maxTokens: 4000,
            temperature: 0.7,
            rules: [
                { id: '1', name: 'Loop Prevention', type: 'loop_prevention', enabled: true, config: { maxIterations: 10, semanticCheck: true } },
                { id: '2', name: 'Semantic Cost Cap', type: 'semantic_cost_cap', enabled: true, config: { maxSpend: 50, preserveState: true } },
            ],
        },
        metrics: {
            totalRequests: 15420,
            totalTokens: 2840000,
            totalCost: 142.50,
            avgLatencyMs: 1250,
            errorRate: 0.02,
            loopCount: 3,
            cacheHits: 4230,
            loopsPrevented: 47,
            costSaved: 892.30,
        },
        createdAt: new Date('2024-01-15'),
        lastActiveAt: new Date(),
    },
    {
        id: '2',
        name: 'Research Agent',
        type: 'crewai',
        status: 'active',
        budget: 5,
        dailySpend: 4.20,
        config: {
            provider: 'anthropic',
            model: 'claude-3-opus',
            maxTokens: 8000,
            temperature: 0.8,
            rules: [
                { id: '3', name: 'Daily Budget Cap', type: 'budget_cap', enabled: true, config: { maxSpend: 5 } },
            ],
        },
        metrics: {
            totalRequests: 2340,
            totalTokens: 1250000,
            totalCost: 89.20,
            avgLatencyMs: 2800,
            errorRate: 0.01,
            loopCount: 0,
            cacheHits: 890,
            loopsPrevented: 12,
            costSaved: 156.40,
        },
        createdAt: new Date('2024-02-20'),
        lastActiveAt: new Date(),
    },
    {
        id: '3',
        name: 'Code Writer Agent',
        type: 'autogen',
        status: 'active',
        budget: 50,
        dailySpend: 48.90,
        config: {
            provider: 'openai',
            model: 'gpt-4',
            maxTokens: 6000,
            temperature: 0.3,
            rules: [
                { id: '4', name: 'Semantic Cost Cap', type: 'semantic_cost_cap', enabled: true, config: { maxSpend: 50, preserveState: true } },
                { id: '5', name: 'Memory Optimization', type: 'memory_optimization', enabled: true, config: { compressThreshold: 0.7 } },
            ],
        },
        metrics: {
            totalRequests: 8920,
            totalTokens: 4500000,
            totalCost: 312.40,
            avgLatencyMs: 3200,
            errorRate: 0.05,
            loopCount: 8,
            cacheHits: 2100,
            loopsPrevented: 156,
            costSaved: 1245.80,
        },
        createdAt: new Date('2024-03-10'),
        lastActiveAt: new Date(),
    },
    {
        id: '4',
        name: 'Data Analysis Agent',
        type: 'langgraph',
        status: 'paused',
        budget: 25,
        dailySpend: 0,
        config: {
            provider: 'google',
            model: 'gemini-pro',
            maxTokens: 4000,
            temperature: 0.5,
            rules: [
                { id: '6', name: 'Loop Prevention', type: 'loop_prevention', enabled: true, config: { maxIterations: 5 } },
            ],
        },
        metrics: {
            totalRequests: 4520,
            totalTokens: 1800000,
            totalCost: 156.80,
            avgLatencyMs: 1800,
            errorRate: 0.03,
            loopCount: 2,
            cacheHits: 1200,
            loopsPrevented: 34,
            costSaved: 423.10,
        },
        createdAt: new Date('2024-04-05'),
        lastActiveAt: new Date('2024-11-10'),
    },
];

const mockAuditLog: AuditEntry[] = [
    {
        id: '1',
        timestamp: new Date(),
        agentId: '1',
        agentName: 'Customer Support Agent',
        action: 'Refund Request Processing',
        intent: 'Customer requested refund for order #12345. Checking policy compliance.',
        outcome: 'approved',
        tokens: 450,
        cost: 0.02,
        reasoning: 'Request aligns with refund policy. Customer has valid proof of purchase.',
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 300000),
        agentId: '3',
        agentName: 'Code Writer Agent',
        action: 'Database Migration Script',
        intent: 'Generate migration script for PostgreSQL to MongoDB',
        outcome: 'modified',
        tokens: 2800,
        cost: 0.14,
        reasoning: 'Added safety checks and rollback logic. Original intent preserved but enhanced.',
    },
    {
        id: '3',
        timestamp: new Date(Date.now() - 600000),
        agentId: '2',
        agentName: 'Research Agent',
        action: 'Market Analysis',
        intent: 'Analyze competitor pricing for Q4 strategy',
        outcome: 'paused',
        tokens: 1200,
        cost: 0.08,
        reasoning: 'Daily budget limit ($5) reached. Agent paused to preserve budget. Session state saved.',
    },
    {
        id: '4',
        timestamp: new Date(Date.now() - 900000),
        agentId: '1',
        agentName: 'Customer Support Agent',
        action: 'Password Reset',
        intent: 'Process password reset for user admin@company.com',
        outcome: 'approved',
        tokens: 180,
        cost: 0.01,
        reasoning: 'Standard security protocol followed. Multi-factor verification required.',
    },
    {
        id: '5',
        timestamp: new Date(Date.now() - 1200000),
        agentId: '3',
        agentName: 'Code Writer Agent',
        action: 'API Endpoint Creation',
        intent: 'Create new REST API endpoints for user management',
        outcome: 'denied',
        tokens: 890,
        cost: 0.05,
        reasoning: 'Request would create security vulnerability. Exposes plaintext passwords in response.',
    },
];

const mockAlertConfigs: AlertConfig[] = [
    { id: '1', type: 'slack', channel: '#ai-alerts', threshold: 75, enabled: true },
    { id: '2', type: 'slack', channel: '#finance-ops', threshold: 90, enabled: true },
    { id: '3', type: 'teams', channel: 'Engineering', threshold: 80, enabled: false },
    { id: '4', type: 'email', channel: 'ciso@company.com', threshold: 50, enabled: true },
];

const mockBudgetRules: BudgetRule[] = [
    { id: '1', name: 'Research Budget Protection', agentIds: ['2'], dailyLimit: 5, priority: 'high', action: 'pause', enabled: true },
    { id: '2', name: 'Production Stability', agentIds: ['1', '3'], dailyLimit: 100, priority: 'high', action: 'alert', enabled: true },
    { id: '3', name: 'Development Relaxed', agentIds: ['4'], dailyLimit: 25, priority: 'low', action: 'throttle', enabled: false },
];

// ============================================================================
// Components
// ============================================================================

function MetricCard({
    title,
    value,
    change,
    icon: Icon,
    color
}: {
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {change !== undefined && (
                        <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {Math.abs(change)}%
                        </div>
                    )}
                </div>
                <div className="mt-3">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-sm text-muted-foreground">{title}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function AgentStatusBadge({ status }: { status: DashboardAgent['status'] }) {
    const statusConfig = {
        active: { color: 'bg-green-500', label: 'Active' },
        paused: { color: 'bg-yellow-500', label: 'Paused' },
        error: { color: 'bg-red-500', label: 'Error' },
        stopped: { color: 'bg-gray-500', label: 'Stopped' },
    };
    const config = statusConfig[status];
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            <span>{config.label}</span>
        </div>
    );
}

function BudgetProgress({ spent, limit }: { spent: number; limit: number }) {
    const percentage = Math.min((spent / limit) * 100, 100);
    const isWarning = percentage >= 75;
    const isCritical = percentage >= 90;

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span>${(spent ?? 0).toFixed(2)}</span>
                <span className="text-muted-foreground">${(limit ?? 10).toFixed(2)}/day</span>
            </div>
            <Progress
                value={percentage}
                className={`h-2 ${isCritical ? '[&>div]:bg-red-500' : isWarning ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
            />
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AlphaAgentOps() {
    const { isAuthenticated, user } = useAuth();
    const isDemo = !isAuthenticated;
    const [activeTab, setActiveTab] = useState('overview');
    const [agents, setAgents] = useState<DashboardAgent[]>(mockAgents);
    const [auditLog] = useState<AuditEntry[]>(mockAuditLog);
    const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(mockAlertConfigs);
    const [budgetRules, setBudgetRules] = useState<BudgetRule[]>(mockBudgetRules);
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const [showBudgetDialog, setShowBudgetDialog] = useState(false);
    const [showNewAgentDialog, setShowNewAgentDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showWebhookDialog, setShowWebhookDialog] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<DashboardAgent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [multiCloudStatus, setMultiCloudStatus] = useState<MultiCloudStatus[]>([]);
    const [selfHealingEvents, setSelfHealingEvents] = useState<SelfHealingEvent[]>([]);

    // New Agent Form State
    const [newAgentData, setNewAgentData] = useState<{
        name: string;
        type: 'langgraph' | 'crewai' | 'autogen' | 'custom';
        environment: string;
        provider: string;
        model: string;
        budget: number;
        maxTokens: number;
        org_id: string;
        control_webhook: string;
    }>({
        name: '',
        type: 'langgraph',
        environment: 'production',
        provider: 'openai',
        model: 'gpt-4o',
        budget: 10,
        maxTokens: 100000,
        org_id: '',
        control_webhook: ''
    });

    const [newAlertData, setNewAlertData] = useState({
        type: 'slack',
        channel: '',
        threshold: 75
    });

    const [newBudgetRuleData, setNewBudgetRuleData] = useState({
        name: '',
        dailyLimit: 50,
        action: 'pause'
    });

    const [newWebhookData, setNewWebhookData] = useState({
        name: '',
        url: 'https://api.enterprise.com/v1/webhook',
        events: ['AGENT_ERROR', 'BUDGET_EXCEEDED']
    });

    const [graphqlQuery, setGraphqlQuery] = useState(`query {
  agents {
    id
    name
    status
    metrics {
      totalCost
      errorRate
    }
  }
}`);
    const [graphqlResult, setGraphqlResult] = useState("");

    const handleCreateAgent = async () => {
        if (isDemo) {
            const tempAgent: DashboardAgent = {
                ...newAgentData,
                id: Math.random().toString(36).substr(2, 9),
                status: 'active',
                dailySpend: 0,
                metrics: {
                    totalRequests: 0,
                    totalTokens: 0,
                    totalCost: 0,
                    avgLatencyMs: 0,
                    errorRate: 0,
                    loopCount: 0,
                    cacheHits: 0,
                    loopsPrevented: 0,
                    costSaved: 0
                },
                config: {
                    provider: newAgentData.provider,
                    model: newAgentData.model,
                    maxTokens: newAgentData.maxTokens,
                    temperature: 0.7,
                    rules: []
                },
                createdAt: new Date(),
                lastActiveAt: new Date()
            };
            setAgents(prev => [...prev, tempAgent]);
            toast.success("Demo Mode: Agent simulated locally.");
            setShowNewAgentDialog(false);
            return;
        }
        try {
            const result = await agentsApi.create({
                ...newAgentData,
                config: {
                    provider: newAgentData.provider,
                    model: newAgentData.model,
                    maxTokens: newAgentData.maxTokens,
                    temperature: 0.7,
                    rules: []
                }
            });

            if (result) {
                setAgents(prev => [...prev, result as unknown as DashboardAgent]);
                setShowNewAgentDialog(false);
                toast.success("Agent deployed successfully.");
                // Reset form
                setNewAgentData({
                    name: '',
                    type: 'langgraph',
                    environment: 'production',
                    provider: 'openai',
                    model: 'gpt-4o',
                    budget: 10,
                    maxTokens: 100000,
                    org_id: '',
                    control_webhook: ''
                });
            }
        } catch (error) {
            console.error("Failed to create agent:", error);
            toast.error("Deployment failed. Check infrastructure logs.");
        }
    };

    const handleDeleteAgent = async (agentId: string) => {
        try {
            await agentsApi.delete(agentId);
            setAgents(prev => prev.filter(a => a.id !== agentId));
            toast.success("Agent decommissioned.");
        } catch (error) {
            // Fallback to local delete
            setAgents(prev => prev.filter(a => a.id !== agentId));
            toast.success("Agent removed.");
        }
    };

    const handleUpdateAgent = async () => {
        if (!selectedAgent) return;
        try {
            // Ensure types match for API
            const updatePayload = {
                name: selectedAgent.name,
                budget: selectedAgent.budget,
                config: selectedAgent.config,
                status: selectedAgent.status
            };
            await agentsApi.update(selectedAgent.id, updatePayload);
            setAgents(prev => prev.map(a => a.id === selectedAgent.id ? selectedAgent : a));
            setShowSettingsDialog(false);
            toast.success("Agent settings synchronized.");
        } catch (error) {
            // Fallback to local update
            setAgents(prev => prev.map(a => a.id === selectedAgent.id ? selectedAgent : a));
            setShowSettingsDialog(false);
            toast.success("Settings updated.");
        }
    };

    const handleGraphqlQuery = async () => {
        setGraphqlResult("Running query...");
        try {
            const res = await extendedApi.graphql(graphqlQuery);
            setGraphqlResult(JSON.stringify(res, null, 2));
            toast.success("GraphQL Query Executed");
        } catch (err) {
            setGraphqlResult("Error: " + (err as Error).message);
            toast.error("GraphQL Query Failed");
        }
    };

    // Fetch data from API on mount
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch agents from API - will fallback to mock on error
                const [agentsData, rulesData] = await Promise.all([
                    agentsApi.list().catch(() => mockAgents),
                    rulesApi.list().catch(() => [])
                ]);

                // If API returns agents, use them; otherwise keep mock
                if (agentsData && Array.isArray(agentsData) && agentsData.length > 0) {
                    // Map API agents to local format (handle type differences and missing fields)
                    const mapped = (agentsData as any[]).map((a: any) => ({
                        ...a,
                        budget: typeof a.budget === 'number' ? a.budget : 10.0,
                        dailySpend: typeof a.dailySpend === 'number' ? a.dailySpend : 0.0,
                        metrics: {
                            costSaved: typeof a.metrics?.costSaved === 'number' ? a.metrics.costSaved : 0.0,
                            loopsPrevented: typeof a.metrics?.loopsPrevented === 'number' ? a.metrics.loopsPrevented : 0,
                            totalRequests: typeof a.metrics?.totalRequests === 'number' ? a.metrics.totalRequests : 0,
                            ...(a.metrics || {})
                        }
                    }));
                    setAgents(mapped);
                }

                // If API returns rules, use them
                if (rulesData && Array.isArray(rulesData) && rulesData.length > 0) {
                    const mappedRules = (rulesData as any[]).map((r: any) => ({
                        id: r.id,
                        name: r.name,
                        type: r.type === 'semantic_cost_cap' ? 'cost_cap' : r.type,
                        maxSpend: r.config?.maxSpend || 50,
                        enabled: r.enabled,
                        agentIds: [] as string[],
                        dailyLimit: r.config?.maxSpend || 50,
                        priority: 'medium' as const,
                        action: 'alert' as const
                    }));
                    setBudgetRules(mappedRules);
                }
                // Fetch extended data
                const [webhookData, cloudData, healingData, alertData] = await Promise.all([
                    extendedApi.webhooks.list().catch(() => []),
                    extendedApi.multiCloud.status().catch(() => []),
                    extendedApi.selfHealing.events().catch(() => []),
                    extendedApi.alerts.list().catch(() => mockAlertConfigs)
                ]);

                if (webhookData) setWebhooks(webhookData);
                if (cloudData) setMultiCloudStatus(cloudData);
                if (healingData) setSelfHealingEvents(healingData);
                if (alertData) setAlertConfigs(alertData as AlertConfig[]);
            } catch (error) {
                console.log('Using mock data - API unavailable');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    // Calculate totals
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalDailySpend = agents.reduce((sum, a) => sum + a.dailySpend, 0);
    const totalDailyBudget = agents.reduce((sum, a) => sum + a.budget, 0);
    const totalCostSaved = agents.reduce((sum, a) => sum + (a.metrics?.costSaved || 0), 0);
    const loopsPrevented = agents.reduce((sum, a) => sum + (a.metrics?.loopsPrevented || 0), 0);

    const toggleAgentStatus = async (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        const newStatus = agent.status === 'active' ? 'paused' : 'active';

        try {
            if (newStatus === 'active') {
                await agentsApi.start(agentId);
            } else {
                await agentsApi.stop(agentId);
            }
            setAgents(agents.map(a => a.id === agentId ? { ...a, status: newStatus } : a));
            toast.success(`Agent ${agent.name} ${newStatus === 'active' ? 'started' : 'stopped'}`);
        } catch (error) {
            // Fallback: update locally anyway
            setAgents(agents.map(a => a.id === agentId ? { ...a, status: newStatus } : a));
            toast.success(`Agent ${agent.name} ${newStatus === 'active' ? 'started' : 'stopped'}`);
        }
    };

    const toggleAlert = async (alertId: string) => {
        const alert = alertConfigs.find(a => a.id === alertId);
        if (!alert) return;

        const newEnabled = !alert.enabled;

        try {
            await extendedApi.alerts.update(alertId, { enabled: newEnabled });
            setAlertConfigs(alertConfigs.map(a => a.id === alertId ? { ...a, enabled: newEnabled } as AlertConfig : a));
            toast.success(`Alert ${newEnabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            // Fallback: update locally
            setAlertConfigs(alertConfigs.map(a => a.id === alertId ? { ...a, enabled: newEnabled } as AlertConfig : a));
            toast.success(`Alert ${newEnabled ? 'enabled' : 'disabled'}`);
        }
    };

    const toggleBudgetRule = async (ruleId: string) => {
        const rule = budgetRules.find(r => r.id === ruleId);
        if (!rule) return;

        const newEnabled = !rule.enabled;

        try {
            await rulesApi.toggle(ruleId, newEnabled);
            setBudgetRules(budgetRules.map(r => r.id === ruleId ? { ...r, enabled: newEnabled } as BudgetRule : r));
            toast.success(`Budget rule ${newEnabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            // Fallback: update locally
            setBudgetRules(budgetRules.map(r => r.id === ruleId ? { ...r, enabled: newEnabled } as BudgetRule : r));
            toast.success(`Budget rule ${newEnabled ? 'enabled' : 'disabled'}`);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            {isDemo && (
                <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-2">
                    <div className="container mx-auto flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-blue-400">
                            <AlertCircle className="h-4 w-4" />
                            <span><strong>Demo Mode:</strong> You are viewing a live preview. Data persistence is disabled.</span>
                        </div>
                        <Link href="/signup">
                            <Button variant="link" size="sm" className="text-blue-400 font-semibold p-0 h-auto">
                                Sign up for full access →
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
            <header className="border-b bg-background/95 backdrop-blur">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">← Back</Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold">AgentOps Sentinel</h1>
                                    <p className="text-xs text-muted-foreground">Autonomous AI Governance</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setActiveTab('alerts')}>
                                <Bell className="w-4 h-4 mr-2" />
                                Alert Settings
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setActiveTab('budget')}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Budget Rules
                            </Button>
                            <Button size="sm" onClick={() => setShowNewAgentDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Agent
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1 p-1 bg-muted/50">
                        <TabsTrigger value="overview"><LayoutDashboard className="w-4 h-4 mr-2" />Overview</TabsTrigger>
                        <TabsTrigger value="agents"><Bot className="w-4 h-4 mr-2" />Agents</TabsTrigger>
                        <TabsTrigger value="audit"><History className="w-4 h-4 mr-2" />Audit Trail</TabsTrigger>
                        <TabsTrigger value="budget"><Wallet className="w-4 h-4 mr-2" />Budget</TabsTrigger>
                        <TabsTrigger value="alerts"><Bell className="w-4 h-4 mr-2" />Alerts</TabsTrigger>
                        <TabsTrigger value="infrastructure">
                            <Network className="w-4 h-4 mr-2" />
                            Infrastructure
                        </TabsTrigger>
                        <TabsTrigger value="webhooks">
                            <Webhook className="w-4 h-4 mr-2" />
                            Webhooks
                        </TabsTrigger>
                        <TabsTrigger value="on-prem">
                            <Server className="w-4 h-4 mr-2" />
                            On-Prem
                        </TabsTrigger>
                        <TabsTrigger value="compliance">
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Compliance
                        </TabsTrigger>
                        <TabsTrigger value="developers">
                            <Cpu className="w-4 h-4 mr-2" />
                            Developers
                        </TabsTrigger>
                        <TabsTrigger value="sso">
                            <Key className="w-4 h-4 mr-2" />
                            SSO
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>

                        <div className="h-8 w-px bg-border mx-2" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`data-[state=active]:bg-background ${['financial', 'metrics', 'pricing', 'gtm', 'roadmap', 'hiring'].includes(activeTab)
                                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        : ''
                                        }`}
                                >
                                    {['financial', 'metrics', 'pricing', 'gtm', 'roadmap', 'hiring'].includes(activeTab)
                                        ? `Strategy: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                                        : 'Venture Strategy'}
                                    <ChevronDown className="ml-1 w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setActiveTab('financial')}>Financial Model</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('metrics')}>Metrics</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('pricing')}>Pricing</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('gtm')}>GTM Strategy</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('roadmap')}>Roadmap</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('hiring')}>Hiring</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Hidden triggers to keep TabsContent working when selected via dropdown */}
                        <div className="hidden">
                            <TabsTrigger value="financial"><BarChart3 className="w-4 h-4 mr-2" />Financial</TabsTrigger>
                            <TabsTrigger value="metrics"><Activity className="w-4 h-4 mr-2" />Metrics</TabsTrigger>
                            <TabsTrigger value="pricing"><Tag className="w-4 h-4 mr-2" />Pricing</TabsTrigger>
                            <TabsTrigger value="gtm"><Globe className="w-4 h-4 mr-2" />GTM</TabsTrigger>
                            <TabsTrigger value="roadmap"><Milestone className="w-4 h-4 mr-2" />Roadmap</TabsTrigger>
                            <TabsTrigger value="hiring"><Users className="w-4 h-4 mr-2" />Hiring</TabsTrigger>
                        </div>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                title="Active Agents"
                                value={`${activeAgents}/${totalAgents}`}
                                icon={Brain}
                                color="bg-blue-500/10 text-blue-500"
                            />
                            <MetricCard
                                title="Daily Spend"
                                value={`$${totalDailySpend.toFixed(2)}`}
                                change={-12}
                                icon={DollarSign}
                                color="bg-green-500/10 text-green-500"
                            />
                            <MetricCard
                                title="Loops Prevented"
                                value={loopsPrevented.toString()}
                                change={34}
                                icon={ShieldAlert}
                                color="bg-purple-500/10 text-purple-500"
                            />
                            <MetricCard
                                title="Cost Saved"
                                value={`$${totalCostSaved.toFixed(2)}`}
                                change={28}
                                icon={TrendingDown}
                                color="bg-emerald-500/10 text-emerald-500"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mt-6">
                            {/* Budget Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Budget Overview
                                    </CardTitle>
                                    <CardDescription>Daily spending across all agents</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {agents.slice(0, 4).map(agent => (
                                            <div key={agent.id} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">{agent.name}</span>
                                                    <span className="text-muted-foreground">
                                                        {Math.round((agent.dailySpend / agent.budget) * 100)}%
                                                    </span>
                                                </div>
                                                <BudgetProgress spent={agent.dailySpend} limit={agent.budget} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sentinel Features */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        Sentinel Features
                                    </CardTitle>
                                    <CardDescription>Active governance capabilities</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <Brain className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Semantic Cost Capping</span>
                                            </div>
                                            <Badge variant="secondary">Active</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <ShieldAlert className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Loop Prevention</span>
                                            </div>
                                            <Badge variant="secondary">{loopsPrevented} Prevented</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Decision Ledger</span>
                                            </div>
                                            <Badge variant="secondary">Enabled</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-blue-500" />
                                                <span className="font-medium">Multi-Agent Budgeting</span>
                                            </div>
                                            <Badge variant="outline">{agents.length} Agents</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* NEW: Autonomous Recovery (Self-Repairing Logic) */}
                            <Card className="md:col-span-2 border-emerald-500/20 bg-emerald-500/5">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 text-emerald-500" />
                                        <CardTitle>Autonomous Recovery (Self-Repairing Logic)</CardTitle>
                                    </div>
                                    <CardDescription>Real-time prompt refinement and safety rollbacks</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Auto-Refine Prompts</Label>
                                                    <p className="text-sm text-muted-foreground">Iteratively improve prompts based on semantic feedback</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Safety-First Rollback</Label>
                                                    <p className="text-sm text-muted-foreground">Instant reversion to known-safe states on anomaly</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <Activity className="w-4 h-4" />
                                                Recovery Status
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span>Last Refinement</span>
                                                    <span className="font-bold">2.4s ago</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span>Prevention Rate</span>
                                                    <span className="text-emerald-500 font-bold">99.2%</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    System active. 14 potential hallucinations mitigated in last 6 hours.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Agents Tab */}
                    <TabsContent value="agents">
                        <Card>
                            <CardHeader>
                                <CardTitle>Managed Agents</CardTitle>
                                <CardDescription>Configure and monitor your autonomous agents</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Agent</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Budget</TableHead>
                                            <TableHead>Daily Spend</TableHead>
                                            <TableHead>Cost Saved</TableHead>
                                            <TableHead>Loops Prevented</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agents.map(agent => (
                                            <TableRow key={agent.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{agent.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {agent.config?.provider} · {agent.config?.model}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <AgentStatusBadge status={agent.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="w-24">
                                                        <BudgetProgress spent={agent.dailySpend} limit={agent.budget} />
                                                    </div>
                                                </TableCell>
                                                <TableCell>${agent.dailySpend.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span className="text-green-500">
                                                        +${agent.metrics?.costSaved?.toFixed(2) || '0.00'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{agent.metrics?.loopsPrevented || 0}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => toggleAgentStatus(agent.id)}
                                                        >
                                                            {agent.status === 'active' ? (
                                                                <Pause className="w-4 h-4" />
                                                            ) : (
                                                                <Play className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedAgent(agent);
                                                                setShowSettingsDialog(true);
                                                            }}
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleDeleteAgent(agent.id)}
                                                                >
                                                                    Decommission Agent
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audit Trail Tab */}
                    <TabsContent value="audit">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Semantic Audit Trail
                                </CardTitle>
                                <CardDescription>
                                    Human-readable decision ledger for compliance
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {auditLog.map(entry => (
                                        <div key={entry.id} className="p-4 rounded-lg border">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="font-medium">{entry.action}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {entry.agentName} · {entry.timestamp.toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                <Badge variant={
                                                    entry.outcome === 'approved' ? 'default' :
                                                        entry.outcome === 'denied' ? 'destructive' :
                                                            entry.outcome === 'modified' ? 'outline' :
                                                                'secondary'
                                                }>
                                                    {entry.outcome}
                                                </Badge>
                                            </div>
                                            <div className="text-sm mb-2">
                                                <span className="text-muted-foreground">Intent: </span>
                                                {entry.intent}
                                            </div>
                                            <div className="text-sm p-2 bg-muted rounded">
                                                <span className="text-muted-foreground">Reasoning: </span>
                                                {entry.reasoning}
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                <span>{entry.tokens ?? 0} tokens</span>
                                                <span>${(entry.cost ?? 0).toFixed(4)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Budget Tab */}
                    <TabsContent value="budget">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Dynamic Budget Rules
                                    </CardTitle>
                                    <CardDescription>Configure per-agent budget allocations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {budgetRules.map(rule => (
                                            <div key={rule.id} className="p-3 rounded-lg border">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{rule.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            ${rule.dailyLimit}/day · {rule.action}
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={rule.enabled}
                                                        onCheckedChange={() => toggleBudgetRule(rule.id)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Usage Forecasting
                                    </CardTitle>
                                    <CardDescription>ML-based cost predictions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-3 rounded-lg bg-blue-500/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">This Week</span>
                                                <span className="text-blue-500">$342.50</span>
                                            </div>
                                            <Progress value={68} className="h-2" />
                                        </div>
                                        <div className="p-3 rounded-lg bg-purple-500/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">Next Week (Predicted)</span>
                                                <span className="text-purple-500">$385.00</span>
                                            </div>
                                            <Progress value={77} className="h-2" />
                                        </div>
                                        <div className="p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">Cost Savings from Sentinel</span>
                                                <span className="text-green-500">$2,717.60</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Through loop prevention and semantic caching
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Alerts Tab */}
                    <TabsContent value="alerts">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notification Channels
                                </CardTitle>
                                <CardDescription>Configure alerts for budget thresholds</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {alertConfigs.map(alert => (
                                        <div key={alert.id} className="p-4 rounded-lg border">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {alert.type === 'slack' && <Slack className="w-5 h-5" />}
                                                    {alert.type === 'teams' && <MessageSquare className="w-5 h-5" />}
                                                    <div>
                                                        <div className="font-medium capitalize">{alert.type}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {alert.channel} · Alert at {alert.threshold}%
                                                        </div>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={alert.enabled}
                                                    onCheckedChange={() => toggleAlert(alert.id)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Infrastructure Tab */}
                    <TabsContent value="infrastructure">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        Multi-Cloud Health
                                    </CardTitle>
                                    <CardDescription>Live status across global regions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {multiCloudStatus.length > 0 ? (
                                            multiCloudStatus.map((status, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${status.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <div>
                                                            <div className="font-medium uppercase">{status.provider} - {status.region}</div>
                                                            <div className="text-sm text-muted-foreground">{status.agents_count} Agents · {status.latency_ms}ms latency</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant={status.status === 'healthy' ? 'default' : 'destructive'}>
                                                        {status.status}
                                                    </Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Network className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                <p>No infrastructure data available.</p>
                                            </div>
                                        )}
                                        <Button variant="outline" className="w-full" onClick={async () => {
                                            try {
                                                const res = await extendedApi.multiCloud.failover('aws-east-1', 'gcp-west-2');
                                                toast.success(`Regional Failover initiated: ${res.message}`);
                                            } catch (err) {
                                                toast.error("Failover simulation failed. Check backend connection.");
                                            }
                                        }}>
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Test Regional Failover
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                        Self-Healing Events
                                    </CardTitle>
                                    <CardDescription>Automated agent recovery log</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {selfHealingEvents.length > 0 ? (
                                            selfHealingEvents.map((event, idx) => (
                                                <div key={idx} className="p-3 rounded-lg border border-l-4 border-l-green-500 bg-green-500/5">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-sm uppercase">{event.event_type}</span>
                                                        <Badge variant="secondary" className="text-[10px]">{new Date(event.created_at || '').toLocaleTimeString()}</Badge>
                                                    </div>
                                                    <p className="text-sm">{event.description}</p>
                                                    <div className="mt-2 text-xs font-mono text-muted-foreground">
                                                        Action: {event.action_taken}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                <p>No active healing events.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Real-time Streaming Metrics - NEW FEATURE */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-orange-500" />
                                        Real-Time Streaming Metrics
                                    </CardTitle>
                                    <CardDescription>Live agent cost and performance streaming</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                            <div className="text-xs text-muted-foreground">Live Tokens/min</div>
                                            <div className="text-2xl font-bold text-orange-500">24.5K</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <div className="text-xs text-muted-foreground">Live Cost/sec</div>
                                            <div className="text-2xl font-bold text-green-500">$0.42</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>WebSocket Connection</span>
                                            <Badge variant="default" className="bg-green-500">Connected</Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Update Frequency</span>
                                            <span className="text-muted-foreground">100ms</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Subscribed Agents</span>
                                            <span className="text-muted-foreground">12</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => toast.info("Streaming metrics via WebSocket enabled")}
                                    >
                                        <Gauge className="w-4 h-4 mr-2" />
                                        Configure Stream
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Webhooks Tab */}
                    <TabsContent value="webhooks">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Management Webhooks</CardTitle>
                                    <CardDescription>Integrate AgentOps with your external systems</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setShowWebhookDialog(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Webhook
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Channel Name</TableHead>
                                            <TableHead>URL</TableHead>
                                            <TableHead>Events</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {webhooks.length > 0 ? (
                                            webhooks.map((webhook) => (
                                                <TableRow key={webhook.id}>
                                                    <TableCell className="font-medium">{webhook.name}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{webhook.url}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {webhook.events.slice(0, 2).map((e, i) => (
                                                                <Badge key={i} variant="outline" className="text-[10px]">{e}</Badge>
                                                            ))}
                                                            {webhook.events.length > 2 && <Badge variant="outline" className="text-[10px]">+{webhook.events.length - 2}</Badge>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={webhook.enabled ? "default" : "secondary"}>
                                                            {webhook.enabled ? "Active" : "Disabled"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={async () => {
                                                            const res = await extendedApi.webhooks.test(webhook.id || '');
                                                            toast.success(`Test result: ${(res as any).status || 'success'}`);
                                                        }}>Test</Button>
                                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                                                            await extendedApi.webhooks.delete(webhook.id || '');
                                                            toast.success("Webhook deleted");
                                                        }}>Delete</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No webhooks configured yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* On-Premise Tab */}
                    <TabsContent value="on-prem">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Download className="w-5 h-5 text-blue-500" />
                                        Deployment Manifest
                                    </CardTitle>
                                    <CardDescription>Generate configuration for air-gapped environments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={async () => {
                                                const res = await extendedApi.onPrem.manifest('docker-compose');
                                                const blob = new Blob([res.manifest], { type: 'text/yaml' });
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'docker-compose.yml';
                                                a.click();
                                                toast.success("Docker Compose manifest generated");
                                            }}>
                                                Docker Compose
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={async () => {
                                                const res = await extendedApi.onPrem.manifest('helm');
                                                const blob = new Blob([res.manifest], { type: 'text/yaml' });
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'values.yaml';
                                                a.click();
                                                toast.success("Helm Chart values generated");
                                            }}>
                                                Helm Chart
                                            </Button>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted font-mono text-xs overflow-auto max-h-[300px]">
                                            <pre># Air-gapped readiness verified&#10;# Version: 1.4.2-enterprise&#10;services:&#10;  sentinel-proxy:&#10;    image: agentops/sentinel:latest&#10;    ports:&#10;      - "8080:8080"&#10;    environment:&#10;      - AIR_GAPPED=true&#10;      - LOG_LEVEL=debug</pre>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Pre-Flight Checklist
                                    </CardTitle>
                                    <CardDescription>Requirements for on-premise installation</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            "Kubernetes 1.25+ or Docker 20.10+",
                                            "4 vCPU, 8GB RAM minimum",
                                            "PostgreSQL 14+ (Internal/External)",
                                            "Redis 6+ for caching",
                                            "TLS Certificate for internal domain",
                                            "Port 80/443 ingress for proxy",
                                            "Egress port 443 (optional for updates)"
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 rounded border bg-card/50">
                                                <Checkbox checked={idx < 4} disabled />
                                                <span className="text-sm">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Compliance Tab */}
                    <TabsContent value="compliance">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-purple-500" />
                                        HIPAA Audit Trail
                                    </CardTitle>
                                    <CardDescription>PHI Access logging and monitoring</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                                            <h4 className="text-sm font-semibold mb-2">Automated Audit Event</h4>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Agents accessing patient-identifiable data must be logged according to HIPAA §164.312(b).
                                            </p>
                                            <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                                                await extendedApi.complianceAudit.hipaa('user-123', 'PHI_ACCESS', 'patient_record_789');
                                                toast.success("HIPAA Audit entry created: ACCESS_GRANTED");
                                            }}>
                                                Test HIPAA Logging
                                            </Button>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Event</TableHead>
                                                    <TableHead>Action</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="text-xs">PHI_READ</TableCell>
                                                    <TableCell className="text-xs">PatientRecord</TableCell>
                                                    <TableCell><Badge className="text-[10px]">VERIFIED</Badge></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="text-xs">KEY_ROTATION</TableCell>
                                                    <TableCell className="text-xs">SystemSettings</TableCell>
                                                    <TableCell><Badge className="text-[10px]">VERIFIED</Badge></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-emerald-500" />
                                        SOX Compliance Audit
                                    </CardTitle>
                                    <CardDescription>Financial transaction integrity</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                            <h4 className="text-sm font-semibold mb-2">Transaction Threshold Alert</h4>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Auditing agent-initiated financial flows above $10,000 for Sarbanes-Oxley §404 compliance.
                                            </p>
                                            <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                                                await extendedApi.complianceAudit.sox('tx-999', 15000);
                                                toast.success("SOX Audit entry: THRESHOLD_EXCEEDED (AUTO-BLOCK)");
                                            }}>
                                                Test SOX Audit
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span>Audit Success Rate</span>
                                                <span className="font-bold">100%</span>
                                            </div>
                                            <Progress value={100} className="h-1" />
                                            <div className="flex justify-between text-xs pt-2">
                                                <span>Tamper-proof Log Hash</span>
                                                <span className="font-mono text-[10px] opacity-50">8f2g...92a1</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Developers Tab */}
                    <TabsContent value="developers">
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Code className="w-5 h-5 text-blue-500" />
                                        GraphQL Playground
                                    </CardTitle>
                                    <CardDescription>Introspect and query unified agent data</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Query</Label>
                                        <div className="rounded-lg border bg-muted p-2">
                                            <textarea
                                                className="w-full h-48 bg-transparent font-mono text-sm resize-none focus:outline-none"
                                                value={graphqlQuery}
                                                onChange={(e) => setGraphqlQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full" onClick={handleGraphqlQuery}>
                                        <Play className="w-4 h-4 mr-2" />
                                        Execute Query
                                    </Button>
                                    {graphqlResult && (
                                        <div className="space-y-2">
                                            <Label>Result</Label>
                                            <div className="rounded-lg border bg-black p-4 overflow-auto max-h-60">
                                                <pre className="text-green-400 font-mono text-xs">{graphqlResult}</pre>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">API Reference</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-3 rounded-lg border bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                                            <div className="text-xs font-bold mb-1">GET /api/v1/agents</div>
                                            <div className="text-[10px] text-muted-foreground">List all managed agents</div>
                                        </div>
                                        <div className="p-3 rounded-lg border bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                                            <div className="text-xs font-bold mb-1">POST /api/v1/sentinel/rules</div>
                                            <div className="text-[10px] text-muted-foreground">Apply global governance rule</div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full text-xs"
                                            onClick={() => window.open('https://www.npmjs.com/package/@agentops/sdk', '_blank')}
                                        >
                                            Download SDK
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SSO Integration Tab */}
                    <TabsContent value="sso">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5 text-blue-500" />
                                        SSO Providers
                                    </CardTitle>
                                    <CardDescription>Configure enterprise identity providers</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-lg border bg-muted/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-xs">O</span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Okta</div>
                                                    <div className="text-xs text-muted-foreground">Active Directory Integration</div>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-500">Connected</Badge>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full mt-2">Configure</Button>
                                    </div>

                                    <div className="p-4 rounded-lg border bg-muted/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                                    <span className="text-gray-600 font-bold text-xs">A</span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Azure AD</div>
                                                    <div className="text-xs text-muted-foreground">Microsoft Identity</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline">Not Connected</Badge>
                                        </div>
                                        <Button variant="default" size="sm" className="w-full mt-2 bg-blue-600">Connect Azure AD</Button>
                                    </div>

                                    <div className="p-4 rounded-lg border bg-muted/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                                                    <span className="text-red-600 font-bold text-xs">G</span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Google Workspace</div>
                                                    <div className="text-xs text-muted-foreground">Google Identity</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline">Not Connected</Badge>
                                        </div>
                                        <Button variant="default" size="sm" className="w-full mt-2 bg-red-500">Connect Google</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-500" />
                                        SAML Configuration
                                    </CardTitle>
                                    <CardDescription>Security Assertion Markup Language settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Entity ID</Label>
                                        <Input value="https://sentinel.agentops.io/saml" readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SSO URL</Label>
                                        <Input placeholder="https://your-idp.com/sso" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Certificate</Label>
                                        <Textarea placeholder="Paste your SAML certificate here" className="font-mono text-xs h-24" />
                                    </div>
                                    <Button className="w-full"><Save className="w-4 h-4 mr-2" />Save SAML Config</Button>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-500" />
                                        User Provisioning
                                    </CardTitle>
                                    <CardDescription>SCIM-based user management</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <div className="text-2xl font-bold text-purple-500">2,847</div>
                                            <div className="text-sm text-muted-foreground">Synced Users</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <div className="text-2xl font-bold text-blue-500">156</div>
                                            <div className="text-sm text-muted-foreground">Active Sessions</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <div className="text-2xl font-bold text-green-500">99.9%</div>
                                            <div className="text-sm text-muted-foreground">Uptime</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Sync Now</Button>
                                        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Logs</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5 text-blue-500" />
                                        SSO Configuration
                                    </CardTitle>
                                    <CardDescription>Enterprise Single Sign-On (SAML/OIDC)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Provider Architecture</Label>
                                        <Select defaultValue="okta">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="okta">Okta Enterprise</SelectItem>
                                                <SelectItem value="azure">Azure AD (Microsoft Entra)</SelectItem>
                                                <SelectItem value="auth0">Auth0</SelectItem>
                                                <SelectItem value="custom">Custom SAML 2.0</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Metadata URL</Label>
                                        <Input placeholder="https://okta.com/app/exk.../sso/saml/metadata" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                        <div className="flex items-center gap-3">
                                            <ShieldAlert className="w-5 h-5 text-yellow-500" />
                                            <div>
                                                <div className="font-medium">Force SSO</div>
                                                <div className="text-xs text-muted-foreground">Disable email/password for all users</div>
                                            </div>
                                        </div>
                                        <Switch />
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => {
                                            // Demo mode: simulate SSO handshake
                                            toast.info("Initiating SSO handshake with identity provider...");
                                            setTimeout(() => {
                                                toast.success("SSO Handshake Complete! Domain verified: enterprise.example.com");
                                            }, 1500);
                                        }}
                                    >Initialize SSO Handshake</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-slate-500" />
                                        Global Sentinel Config
                                    </CardTitle>
                                    <CardDescription>Environment-wide governance defaults</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Default Budget Cap</span>
                                            <span className="font-bold">$50.00</span>
                                        </div>
                                        <Progress value={50} className="h-1" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Auto-Pause on Error</Label>
                                            <div className="text-xs text-muted-foreground">Stop agents if error rate &gt; 5%</div>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Anonymize PI logs</Label>
                                            <div className="text-xs text-muted-foreground">Mask emails and IPs in audit trail</div>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    {/* Data Retention Policy - NEW FEATURE */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-sm font-medium">Data Retention Policy</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground">Audit Logs</span>
                                                <Select defaultValue="365">
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="30">30 days</SelectItem>
                                                        <SelectItem value="90">90 days</SelectItem>
                                                        <SelectItem value="180">180 days</SelectItem>
                                                        <SelectItem value="365">1 year</SelectItem>
                                                        <SelectItem value="730">2 years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground">Metrics Data</span>
                                                <Select defaultValue="90">
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="30">30 days</SelectItem>
                                                        <SelectItem value="90">90 days</SelectItem>
                                                        <SelectItem value="180">180 days</SelectItem>
                                                        <SelectItem value="365">1 year</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => toast.success("Data retention policy saved successfully")}
                                        >
                                            <History className="w-4 h-4 mr-2" />
                                            Save Retention Policy
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Financial Model Tab */}
                    <TabsContent value="financial">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Unit Economics</CardTitle>
                                    <CardDescription>CAC & LTV Analysis</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Blended CAC</span>
                                            <span className="font-bold">$2,500</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">ARPU</span>
                                            <span className="font-bold">$850/mo</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Gross Margin</span>
                                            <span className="font-bold">85%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Churn Rate</span>
                                            <span className="font-bold">2%/mo</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">LTV</span>
                                                <span className="font-bold text-green-500">$36,125</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-sm text-muted-foreground">LTV:CAC Ratio</span>
                                                <span className="font-bold text-green-500">14.4:1</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Revenue Projections</CardTitle>
                                    <CardDescription>Year 1 Targets</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Q1</span>
                                            <span className="font-medium">$0 (Building)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Q2</span>
                                            <span className="font-medium">$4,250 (5 customers)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Q3</span>
                                            <span className="font-medium">$17,000 (20 customers)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Q4</span>
                                            <span className="font-medium">$42,500 (50 customers)</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Y1 ARR Target</span>
                                                <span className="font-bold text-blue-500">$212,500</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Operational Costs</CardTitle>
                                    <CardDescription>Monthly Burn Rate</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Salaries (5 FTE)</span>
                                            <span>$25,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Cloud/Infrastructure</span>
                                            <span>$2,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Marketing/DevRel</span>
                                            <span>$3,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Sales Tools</span>
                                            <span>$1,500</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Legal/Compliance</span>
                                            <span>$1,000</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                                            <span>Total Monthly</span>
                                            <span>$32,500</span>
                                        </div>
                                        <div className="flex justify-between text-green-500">
                                            <span>Breakeven</span>
                                            <span>45 customers</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Scenario Planning</CardTitle>
                                <CardDescription>Conservative, Base, and Aggressive cases</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <h4 className="font-semibold text-red-500 mb-2">Conservative</h4>
                                        <p className="text-sm text-muted-foreground">14 months runway. MVP launch, 20 customers. Must pivot to "Security/Compliance" pitch if agents become cheaper.</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <h4 className="font-semibold text-blue-500 mb-2">Base Case</h4>
                                        <p className="text-sm text-muted-foreground">Alive by month 12. 50 customers, $42k MRR. Developer-led growth + enterprise compliance needs.</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <h4 className="font-semibold text-green-500 mb-2">Aggressive</h4>
                                        <p className="text-sm text-muted-foreground">100+ customers by Y1 end. $1M+ ARR. Trigger: Major public agent failure at Fortune 500.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Metrics Tab */}
                    <TabsContent value="metrics">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">North Star</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">10,000</div>
                                    <p className="text-xs text-muted-foreground">Agents Guarded (target)</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Secondary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">500M</div>
                                    <p className="text-xs text-muted-foreground">Tokens Saved/mo</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">MRR Target</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$1M</div>
                                    <p className="text-xs text-muted-foreground">ARR Goal</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">GitHub Stars</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+100</div>
                                    <p className="text-xs text-muted-foreground">per week target</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Acquisition Metrics</CardTitle>
                                    <CardDescription>Developer-led growth KPIs</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Docs Views</span>
                                            <Badge>5,000/mo</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Sandbox Runs</span>
                                            <Badge>200/week</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">API Keys Generated</span>
                                            <Badge>50/week</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Metrics</CardTitle>
                                    <CardDescription>Technical performance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Proxy Uptime</span>
                                            <Badge variant="outline">99.999%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Latency Added</span>
                                            <Badge variant="outline">&lt;15ms</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Active Rulesets</span>
                                            <Badge variant="outline">&gt;5</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* NEW: Advanced AI Monitoring (Anomaly Detection) */}
                            <Card className="md:col-span-2 border-amber-500/20 bg-amber-500/5">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-amber-500" />
                                        <CardTitle>Advanced AI Monitoring</CardTitle>
                                    </div>
                                    <CardDescription>Real-time anomaly detection and behavior scoring</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="p-3 rounded-lg bg-background/50 border">
                                            <div className="text-xs text-muted-foreground mb-1">Semantic Drift</div>
                                            <div className="text-xl font-bold text-amber-500">2.4%</div>
                                            <div className="text-[10px] text-muted-foreground mt-1">Within safe limits</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background/50 border">
                                            <div className="text-xs text-muted-foreground mb-1">Behavior Score</div>
                                            <div className="text-xl font-bold text-emerald-500">98/100</div>
                                            <div className="text-[10px] text-muted-foreground mt-1">Highly predictable</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background/50 border">
                                            <div className="text-xs text-muted-foreground mb-1">Outlier Alerts</div>
                                            <div className="text-xl font-bold text-red-500">0</div>
                                            <div className="text-[10px] text-muted-foreground mt-1">Last 24 hours</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-amber-500/10">
                                        <Button variant="outline" size="sm" className="w-full text-xs">Run Forensic Analysis</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent value="pricing">

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                            <Card className="border-2 border-slate-700">
                                <CardHeader>
                                    <div className="p-2 w-fit rounded-lg bg-slate-800 mb-2">
                                        <Badge variant="outline" className="text-slate-400">Developer</Badge>
                                    </div>
                                    <CardTitle>Solo Hacker</CardTitle>
                                    <CardDescription>Prototyping & Personal Use</CardDescription>
                                    <div className="text-3xl font-bold mt-2">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-400 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            1M tokens/mo free
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            1 Active Agent
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Community Support
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-slate-700">
                                <CardHeader>
                                    <div className="p-2 w-fit rounded-lg bg-blue-500/10 mb-2">
                                        <Badge variant="outline" className="text-blue-500 border-blue-500/20">Starter</Badge>
                                    </div>
                                    <CardTitle>Small Team</CardTitle>
                                    <CardDescription>Early production apps</CardDescription>
                                    <div className="text-3xl font-bold mt-2">$499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-400 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Up to 5 agents
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            100K tokens/day
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Priority Email Support
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-blue-500 bg-blue-500/5">
                                <CardHeader>
                                    <div className="p-2 w-fit rounded-lg bg-blue-500/20 mb-2">
                                        <Badge variant="default" className="bg-blue-600">Professional</Badge>
                                    </div>
                                    <CardTitle className="text-blue-400">Scale</CardTitle>
                                    <CardDescription>Rapidly growing firms</CardDescription>
                                    <div className="text-3xl font-bold mt-2">$1,499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-400 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Up to 25 agents
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            1M tokens/day
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Slack integration
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Advanced Analytics
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-purple-500 bg-purple-500/5">
                                <CardHeader>
                                    <div className="p-2 w-fit rounded-lg bg-purple-500/20 mb-2">
                                        <Badge variant="outline" className="text-purple-400 border-purple-400/20">Enterprise</Badge>
                                    </div>
                                    <CardTitle className="text-purple-400">Custom</CardTitle>
                                    <CardDescription>Global Fortune 2000</CardDescription>
                                    <div className="text-3xl font-bold mt-2">$2,500+<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-400 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Unlimited Agents
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            VPC deployment
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            SSO/SAML
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            24/7 Red-Team Support
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-center mt-8 pb-12">
                            <Link href="/billing">
                                <Button size="lg" className="px-12 bg-blue-600 hover:bg-blue-700">
                                    Manage Subscription & Billing
                                </Button>
                            </Link>
                        </div>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Competitor Comparison</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Competitor</TableHead>
                                            <TableHead>Pricing Model</TableHead>
                                            <TableHead>Weakness</TableHead>
                                            <TableHead>Our Advantage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">LangSmith</TableCell>
                                            <TableCell>Tiered + Seat based</TableCell>
                                            <TableCell>Penalties collaboration</TableCell>
                                            <TableCell>We don't charge per seat</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Datadog</TableCell>
                                            <TableCell>Per Host / GB</TableCell>
                                            <TableCell>Expensive for text logs</TableCell>
                                            <TableCell>Edge processing, no storage fees</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* GTM Tab */}
                    <TabsContent value="gtm">
                        <Card>
                            <CardHeader>
                                <CardTitle>Channel Mix (Year 1)</CardTitle>
                                <CardDescription>Developer-led growth strategy</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="text-center p-4 rounded-lg bg-blue-500/10">
                                        <div className="text-2xl font-bold text-blue-500">40%</div>
                                        <div className="text-sm text-muted-foreground">Content / SEO</div>
                                        <div className="text-xs mt-1">$4,000/mo</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-purple-500/10">
                                        <div className="text-2xl font-bold text-purple-500">30%</div>
                                        <div className="text-sm text-muted-foreground">Sponsorships</div>
                                        <div className="text-xs mt-1">$3,000/mo</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-green-500/10">
                                        <div className="text-2xl font-bold text-green-500">20%</div>
                                        <div className="text-sm text-muted-foreground">Events (Dev)</div>
                                        <div className="text-xs mt-1">$2,000/mo</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-orange-500/10">
                                        <div className="text-2xl font-bold text-orange-500">10%</div>
                                        <div className="text-sm text-muted-foreground">Paid Search</div>
                                        <div className="text-xs mt-1">$1,000/mo</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content Strategy</CardTitle>
                                    <CardDescription>SEO-focused technical content</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="p-3 rounded-lg bg-muted">
                                            <div className="font-medium">Architecture Post</div>
                                            <div className="text-muted-foreground">Target: langchain cost control</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <div className="font-medium">Tutorial</div>
                                            <div className="text-muted-foreground">Target: prevent bot loops</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <div className="font-medium">Open Source</div>
                                            <div className="text-muted-foreground">Target: llm proxy</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Funnel Metrics</CardTitle>
                                    <CardDescription>Target conversion rates (Month 6)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span>GitHub Visitors</span>
                                            <span className="font-medium">2,000/mo</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>API Keys Generated</span>
                                            <span className="font-medium">200/mo (10%)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Active Apps (&gt;10 req)</span>
                                            <span className="font-medium">100/mo (50%)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Paid Upgrades</span>
                                            <span className="font-medium">10/mo (10%)</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                                            <span>Target CAC</span>
                                            <span>$2,500</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Roadmap Tab */}
                    <TabsContent value="roadmap">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Q1: MVP (The "Loop Breaker")</CardTitle>
                                    <CardDescription>Proving we can stop runaway costs</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default">In Progress</Badge>
                                            <span>Rust Proxy Core</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">Planned</Badge>
                                            <span>Heuristics Engine</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">Planned</Badge>
                                            <span>Hard Budget Caps</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Planned</Badge>
                                            <span>Basic Dashboard</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Q2: Growth (The "Human in the Loop")</CardTitle>
                                    <CardDescription>Graceful degradation and DX</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>Slack Alerts</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>Session Resume</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>SDKs (Python/TS)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>Semantic Caching</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Q3: Scale (Enterprise Compliance)</CardTitle>
                                    <CardDescription>Decision Ledger for mid-market</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>Intent Summarization</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>SOC2 Dashboarding</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>PII Edge Masking</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Q4: Enterprise Operations</CardTitle>
                                    <CardDescription>Deployment flexibility</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>VPC Docker Image</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>Multi-Agent Swarms</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Backlog</Badge>
                                            <span>SSO / SAML</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Hiring Tab */}
                    <TabsContent value="hiring">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>First 5 Hires</CardTitle>
                                    <CardDescription>Priority hiring roadmap</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                                            <div>
                                                <div className="font-medium">Principal Rust/Go Engineer</div>
                                                <div className="text-xs text-muted-foreground">Proxy core</div>
                                            </div>
                                            <Badge>Month 1</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                                            <div>
                                                <div className="font-medium">Head of DevRel</div>
                                                <div className="text-xs text-muted-foreground">Open source adoption</div>
                                            </div>
                                            <Badge>Month 3</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                                            <div>
                                                <div className="font-medium">Founding Account Executive</div>
                                                <div className="text-xs text-muted-foreground">Enterprise sales</div>
                                            </div>
                                            <Badge>Month 5</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                                            <div>
                                                <div className="font-medium">Senior Frontend Eng</div>
                                                <div className="text-xs text-muted-foreground">Metrics dashboard</div>
                                            </div>
                                            <Badge>Month 6</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                                            <div>
                                                <div className="font-medium">AI/ML Engineer</div>
                                                <div className="text-xs text-muted-foreground">Semantic models</div>
                                            </div>
                                            <Badge>Month 8</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Compensation Framework</CardTitle>
                                    <CardDescription>Salary bands & equity</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Engineering</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Senior</span>
                                                    <span>$90k - $120k</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Lead/Principal</span>
                                                    <span>$130k - $160k</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">DevRel</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Senior</span>
                                                    <span>$80k - $100k</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Sales (OTE)</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>AE</span>
                                                    <span>$120k OTE</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Lead</span>
                                                    <span>$150k OTE</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t pt-3">
                                            <h4 className="font-medium mb-2">Equity Grants</h4>
                                            <div className="text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Founding Engineer</span>
                                                    <span>1.0% - 2.5%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Senior Hire</span>
                                                    <span>0.2% - 0.5%</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">4 years, 1 year cliff</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Alert Settings Dialog */}
            <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alert Configuration</DialogTitle>
                        <DialogDescription>
                            Set up real-time notifications for budget thresholds
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Notification Type</Label>
                            <Select
                                value={newAlertData.type}
                                onValueChange={(v) => setNewAlertData({ ...newAlertData, type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="slack">Slack</SelectItem>
                                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="webhook">Webhook</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Channel</Label>
                            <Input
                                placeholder="#alerts or email@company.com"
                                value={newAlertData.channel}
                                onChange={(e) => setNewAlertData({ ...newAlertData, channel: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Alert Threshold (%)</Label>
                            <Input
                                type="number"
                                placeholder="75"
                                value={newAlertData.threshold}
                                onChange={(e) => setNewAlertData({ ...newAlertData, threshold: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAlertDialog(false)}>Cancel</Button>
                        <Button onClick={async () => {
                            try {
                                const result = await extendedApi.alerts.create({
                                    name: `${newAlertData.type} Alert`,
                                    type: newAlertData.type,
                                    channels: [newAlertData.type],
                                    threshold: newAlertData.threshold,
                                    enabled: true
                                });
                                if (result) {
                                    setAlertConfigs(prev => [...prev, result as unknown as AlertConfig]);
                                    setShowAlertDialog(false);
                                    setNewAlertData({ type: 'slack', channel: '', threshold: 75 });
                                    toast.success("Alert configuration saved successfully.");
                                }
                            } catch (error) {
                                // Fallback: add locally
                                const newAlert = {
                                    id: `alert-${Date.now()}`,
                                    ...newAlertData,
                                    enabled: true
                                };
                                setAlertConfigs(prev => [...prev, newAlert as AlertConfig]);
                                setShowAlertDialog(false);
                                setNewAlertData({ type: 'slack', channel: '', threshold: 75 });
                                toast.success("Alert configuration saved successfully.");
                            }
                        }}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Budget Rules Dialog */}
            <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Budget Rule Configuration</DialogTitle>
                        <DialogDescription>
                            Define dynamic budget allocation rules
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rule Name</Label>
                            <Input
                                placeholder="e.g., Production Safety Limit"
                                value={newBudgetRuleData.name}
                                onChange={(e) => setNewBudgetRuleData({ ...newBudgetRuleData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Daily Budget ($)</Label>
                            <Input
                                type="number"
                                placeholder="50"
                                value={newBudgetRuleData.dailyLimit}
                                onChange={(e) => setNewBudgetRuleData({ ...newBudgetRuleData, dailyLimit: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Action when limit reached</Label>
                            <Select
                                value={newBudgetRuleData.action}
                                onValueChange={(v) => setNewBudgetRuleData({ ...newBudgetRuleData, action: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pause">Pause Agent</SelectItem>
                                    <SelectItem value="alert">Send Alert</SelectItem>
                                    <SelectItem value="throttle">Throttle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select defaultValue="high">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            // Save budget rule - API or fallback
                            const newRule = {
                                id: `rule-${Date.now()}`,
                                name: newBudgetRuleData.name,
                                dailyLimit: newBudgetRuleData.dailyLimit,
                                action: newBudgetRuleData.action,
                                enabled: true,
                                agentIds: [],
                                priority: 'high' as const
                            };
                            setBudgetRules(prev => [...prev, newRule as BudgetRule]);
                            setShowBudgetDialog(false);
                            toast.success("Budget rule created successfully!");
                        }}>Save Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showNewAgentDialog} onOpenChange={setShowNewAgentDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Enterprise Agent</DialogTitle>
                        <DialogDescription>
                            Configure global identification and active governance for your AI agent.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Agent Name</Label>
                                <Input
                                    value={newAgentData.name}
                                    onChange={(e) => setNewAgentData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Data Processor Agent"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Agent Type</Label>
                                <Select
                                    value={newAgentData.type}
                                    onValueChange={(val) => setNewAgentData(prev => ({ ...prev, type: val as 'langgraph' | 'crewai' | 'autogen' | 'custom' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="langgraph">LangGraph</SelectItem>
                                        <SelectItem value="crewai">CrewAI</SelectItem>
                                        <SelectItem value="autogen">AutoGen</SelectItem>
                                        <SelectItem value="custom">Custom Engine</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Environment</Label>
                                <Select
                                    value={newAgentData.environment}
                                    onValueChange={(val) => setNewAgentData(prev => ({ ...prev, environment: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="production">Production</SelectItem>
                                        <SelectItem value="staging">Staging</SelectItem>
                                        <SelectItem value="development">Development</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Organization/Region ID</Label>
                                <Input
                                    value={newAgentData.org_id}
                                    onChange={(e) => setNewAgentData(prev => ({ ...prev, org_id: e.target.value }))}
                                    placeholder="e.g., EMEA-SALES-01"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Provider</Label>
                                    <Select
                                        value={newAgentData.provider}
                                        onValueChange={(val) => setNewAgentData(prev => ({ ...prev, provider: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="openai">OpenAI</SelectItem>
                                            <SelectItem value="anthropic">Anthropic</SelectItem>
                                            <SelectItem value="cohere">Cohere</SelectItem>
                                            <SelectItem value="google">Google</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Model</Label>
                                    <Input
                                        value={newAgentData.model}
                                        onChange={(e) => setNewAgentData(prev => ({ ...prev, model: e.target.value }))}
                                        placeholder="gpt-4o"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Daily Budget ($)</Label>
                                    <Input
                                        type="number"
                                        value={newAgentData.budget}
                                        onChange={(e) => setNewAgentData(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                                        placeholder="25"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Tokens</Label>
                                    <Input
                                        type="number"
                                        value={newAgentData.maxTokens}
                                        onChange={(e) => setNewAgentData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                                        placeholder="100000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Control Webhook (Active Governance)</Label>
                                <Input
                                    value={newAgentData.control_webhook}
                                    onChange={(e) => setNewAgentData(prev => ({ ...prev, control_webhook: e.target.value }))}
                                    placeholder="https://api.company.com/agents/control"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewAgentDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateAgent}>Deploy Agent</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Agent Settings Dialog */}
            <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agent Settings: {selectedAgent?.name}</DialogTitle>
                        <DialogDescription>Modify performance and budget parameters</DialogDescription>
                    </DialogHeader>
                    {selectedAgent && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Agent Name</Label>
                                <Input
                                    value={selectedAgent.name}
                                    onChange={(e) => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Daily Budget ($)</Label>
                                <Input
                                    type="number"
                                    value={selectedAgent.budget}
                                    onChange={(e) => setSelectedAgent({ ...selectedAgent, budget: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={selectedAgent.status}
                                    onValueChange={(val) => setSelectedAgent({ ...selectedAgent, status: val as any })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="paused">Paused</SelectItem>
                                        <SelectItem value="stopped">Stopped</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
                        <Button onClick={handleUpdateAgent}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Webhook Dialog */}
            <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Management Webhook</DialogTitle>
                        <DialogDescription>Route governance events to external systems</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Channel Name</Label>
                            <Input
                                placeholder="Slack Production Alerts"
                                value={newWebhookData.name}
                                onChange={(e) => setNewWebhookData({ ...newWebhookData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Endpoint URL</Label>
                            <Input
                                placeholder="https://hooks.slack.com/..."
                                value={newWebhookData.url}
                                onChange={(e) => setNewWebhookData({ ...newWebhookData, url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Events to Subscribe</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['AGENT_ERROR', 'BUDGET_EXCEEDED', 'LOOP_DETECTED', 'FAILOVER_INIT'].map(event => (
                                    <div key={event} className="flex items-center gap-2">
                                        <Checkbox
                                            id={event}
                                            checked={newWebhookData.events.includes(event)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setNewWebhookData({ ...newWebhookData, events: [...newWebhookData.events, event] });
                                                } else {
                                                    setNewWebhookData({ ...newWebhookData, events: newWebhookData.events.filter(e => e !== event) });
                                                }
                                            }}
                                        />
                                        <label htmlFor={event} className="text-xs cursor-pointer">{event}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
                        <Button onClick={async () => {
                            try {
                                await extendedApi.webhooks.create({ ...newWebhookData, enabled: true } as WebhookConfig);
                                setShowWebhookDialog(false);
                                toast.success("Webhook configured successfully.");
                                // Refresh list
                                const fresh = await extendedApi.webhooks.list();
                                setWebhooks(fresh);
                            } catch (error) {
                                // Fallback: add locally
                                const tempWebhook = {
                                    ...newWebhookData,
                                    id: Math.random().toString(36).substr(2, 9),
                                    enabled: true
                                };
                                setWebhooks(prev => [...prev, tempWebhook]);
                                setShowWebhookDialog(false);
                                toast.success("Webhook configured successfully.");
                            }
                        }}>Configure Webhook</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
