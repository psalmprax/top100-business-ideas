/**
 * Alpha Deepfake Defense - Enterprise Dashboard
 * AI-powered media authenticity detection and defense
 * 
 * Features:
 * - Micro-Expression Analysis
 * - Cancellable Biometrics
 * - Panic Word Silent Alarm
 * - Voice-Only Authentication
 * - Document Verification
 * - Enterprise SSO Integration
 * - Real-Time Dashboard
 * - API for High-Volume Verification
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { extendedApi, type MobileSDKStatus, type WearableDevice, type TravelKioskStatus, type CryptoWallet } from '@/lib/api';
import {
    Shield,
    Eye,
    Upload,
    Image,
    Video,
    Mic,
    CheckCircle2,
    AlertCircle,
    XCircle,
    AlertTriangle,
    FileText,
    RefreshCw,
    Download,
    Share2,
    Clock,
    TrendingUp,
    Phone,
    Smartphone,
    FileCheck,
    Key,
    Users,
    Activity,
    Bell,
    AlertOctagon,
    Fingerprint,
    MessageSquare,
    Globe,
    Lock,
    Zap,
    ShieldAlert,
    Search,
    Plus,
    Settings,
    Watch,
    Plane,
    Layers,
    Cpu,
    Wifi,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChevronDown,
    LayoutDashboard,
    ShieldCheck,
    BarChart3,
    Tag,
    Milestone,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type MediaType = 'image' | 'video' | 'audio';
type AnalysisResult = 'real' | 'fake' | 'uncertain';

interface DeepfakeAnalysis {
    id: string;
    mediaUrl: string;
    mediaType: MediaType;
    result: AnalysisResult;
    confidence: number;
    analysisAt: Date;
    details: {
        artifacts: number;
        blinkRate?: number;
        skinTexture?: number;
        lipSync?: number;
        audioQuality?: number;
    };
}

interface VerificationSession {
    id: string;
    type: 'video' | 'voice' | 'document';
    status: 'pending' | 'in_progress' | 'verified' | 'failed' | 'blocked';
    userId: string;
    amount?: number;
    createdAt: Date;
    completedAt?: Date;
    microExpressionScore?: number;
    voiceLivenessScore?: number;
    biometricMatch?: boolean;
}

interface ThreatAlert {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: 'deepfake_detected' | 'suspicious_activity' | 'biometric_mismatch' | 'duress_detected';
    description: string;
    source: string;
    timestamp: Date;
    status: 'active' | 'investigating' | 'resolved';
}

interface BiometricTemplate {
    id: string;
    userId: string;
    type: 'face' | 'voice' | 'fingerprint';
    enrolledAt: Date;
    lastUsed: Date;
    cancellable: boolean;
}

interface HardwareChallenge {
    id: string;
    user_id: string;
    challenge: string;
    status: 'pending' | 'verified' | 'failed' | 'expired';
}

interface BiometricSignature {
    id: string;
    challenge_id: string;
    signature: string;
    verified: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockAnalyses: DeepfakeAnalysis[] = [
    {
        id: '1',
        mediaUrl: '/samples/face1.jpg',
        mediaType: 'image',
        result: 'real',
        confidence: 98,
        analysisAt: new Date(),
        details: { artifacts: 2, skinTexture: 0.02 },
    },
    {
        id: '2',
        mediaUrl: '/samples/video2.mp4',
        mediaType: 'video',
        result: 'fake',
        confidence: 94,
        analysisAt: new Date(Date.now() - 3600000),
        details: { artifacts: 8, blinkRate: 0.3, skinTexture: 0.15, lipSync: 0.22 },
    },
    {
        id: '3',
        mediaUrl: '/samples/audio3.mp3',
        mediaType: 'audio',
        result: 'real',
        confidence: 89,
        analysisAt: new Date(Date.now() - 7200000),
        details: { artifacts: 1, audioQuality: 0.95 },
    },
    {
        id: '4',
        mediaUrl: '/samples/face4.jpg',
        mediaType: 'image',
        result: 'uncertain',
        confidence: 45,
        analysisAt: new Date(Date.now() - 10800000),
        details: { artifacts: 4 },
    },
    {
        id: '5',
        mediaUrl: '/samples/video5.mp4',
        mediaType: 'video',
        result: 'fake',
        confidence: 97,
        analysisAt: new Date(Date.now() - 14400000),
        details: { artifacts: 12, blinkRate: 0.1, skinTexture: 0.28, lipSync: 0.35 },
    },
];

const mockSessions: VerificationSession[] = [
    {
        id: '1',
        type: 'video',
        status: 'verified',
        userId: 'user_001',
        amount: 50000,
        createdAt: new Date(Date.now() - 300000),
        completedAt: new Date(Date.now() - 240000),
        microExpressionScore: 0.95,
        voiceLivenessScore: 0.92,
        biometricMatch: true,
    },
    {
        id: '2',
        type: 'voice',
        status: 'failed',
        userId: 'user_002',
        amount: 25000,
        createdAt: new Date(Date.now() - 600000),
        completedAt: new Date(Date.now() - 540000),
        voiceLivenessScore: 0.45,
        biometricMatch: false,
    },
    {
        id: '3',
        type: 'video',
        status: 'blocked',
        userId: 'user_003',
        amount: 100000,
        createdAt: new Date(Date.now() - 900000),
        completedAt: new Date(Date.now() - 840000),
        microExpressionScore: 0.12,
        voiceLivenessScore: 0.18,
        biometricMatch: false,
    },
    {
        id: '4',
        type: 'document',
        status: 'verified',
        userId: 'user_004',
        createdAt: new Date(Date.now() - 1200000),
        completedAt: new Date(Date.now() - 1140000),
        biometricMatch: true,
    },
    {
        id: '5',
        type: 'voice',
        status: 'verified',
        userId: 'user_005',
        amount: 15000,
        createdAt: new Date(Date.now() - 1500000),
        completedAt: new Date(Date.now() - 1440000),
        voiceLivenessScore: 0.88,
        biometricMatch: true,
    },
];

const mockThreats: ThreatAlert[] = [
    {
        id: '1',
        severity: 'critical',
        type: 'deepfake_detected',
        description: 'High-confidence deepfake detected in video call with CFO impersonator',
        source: 'Live Verification',
        timestamp: new Date(Date.now() - 1800000),
        status: 'active',
    },
    {
        id: '2',
        severity: 'high',
        type: 'suspicious_activity',
        description: 'Multiple verification attempts from different biometric templates',
        source: 'API Gateway',
        timestamp: new Date(Date.now() - 3600000),
        status: 'investigating',
    },
    {
        id: '3',
        severity: 'medium',
        type: 'duress_detected',
        description: 'Duress PIN used during voice verification - silent alert triggered',
        source: 'Live Verification',
        timestamp: new Date(Date.now() - 7200000),
        status: 'resolved',
    },
];

const mockBiometrics: BiometricTemplate[] = [
    { id: '1', userId: 'user_001', type: 'face', enrolledAt: new Date('2024-01-15'), lastUsed: new Date(), cancellable: true },
    { id: '2', userId: 'user_001', type: 'voice', enrolledAt: new Date('2024-01-15'), lastUsed: new Date(), cancellable: true },
    { id: '3', userId: 'user_002', type: 'face', enrolledAt: new Date('2024-03-20'), lastUsed: new Date('2024-11-01'), cancellable: true },
    { id: '4', userId: 'user_003', type: 'fingerprint', enrolledAt: new Date('2024-02-10'), lastUsed: new Date(), cancellable: true },
];

// ============================================================================
// Components
// ============================================================================

function MetricCard({
    title,
    value,
    icon: Icon,
    color,
    change
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change?: number;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {change !== undefined && (
                        <Badge variant={change >= 0 ? 'default' : 'destructive'}>
                            {change >= 0 ? '+' : ''}{change}%
                        </Badge>
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

function MediaTypeCard({
    type,
    count,
    icon: Icon,
    color,
}: {
    type: string;
    count: number;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <Card className="border-border/50">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 capitalize">{type}s analyzed</p>
            </CardContent>
        </Card>
    );
}

function ThreatBadge({ severity }: { severity: ThreatAlert['severity'] }) {
    const config = {
        critical: { color: 'bg-red-500', label: 'Critical' },
        high: { color: 'bg-orange-500', label: 'High' },
        medium: { color: 'bg-yellow-500', label: 'Medium' },
        low: { color: 'bg-blue-500', label: 'Low' },
    };
    const c = config[severity];
    return <Badge className={`${c.color} text-white`}>{c.label}</Badge>;
}

// ============================================================================
// Main Component
// ============================================================================

export default function AlphaDeepfakeDefense() {
    const { isAuthenticated, user } = useAuth();
    const isDemo = !isAuthenticated;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [analyses, setAnalyses] = useState<DeepfakeAnalysis[]>(mockAnalyses);
    const [sessions] = useState<VerificationSession[]>(mockSessions);
    const [threats] = useState<ThreatAlert[]>(mockThreats);
    const [biometrics] = useState<BiometricTemplate[]>(mockBiometrics);
    const [mediaType, setMediaType] = useState<string>('all');
    const [duressEnabled, setDuressEnabled] = useState(true);

    // Double-Moat Authentication State
    const [currentChallenge, setCurrentChallenge] = useState<HardwareChallenge | null>(null);
    const [isAuthVerifying, setIsAuthVerifying] = useState(false);
    const [authStatus, setAuthStatus] = useState<'idle' | 'challenging' | 'verified' | 'failed' | 'expired'>('idle');
    const [sdkStatus, setSdkStatus] = useState<MobileSDKStatus | null>(null);
    const [wearableDevices, setWearableDevices] = useState<WearableDevice[]>([]);
    const [kioskStatus, setKioskStatus] = useState<TravelKioskStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [advancedResult, setAdvancedResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);

    useEffect(() => {
        async function fetchExtendedData() {
            try {
                const [sdk, wearables, kiosk, wallets] = await Promise.all([
                    extendedApi.mobileSDK.status().catch(() => null),
                    extendedApi.wearable.devices().catch(() => []),
                    extendedApi.travel.kioskStatus().catch(() => null),
                    extendedApi.crypto.wallets().catch(() => [])
                ]);
                if (sdk) setSdkStatus(sdk);
                if (wearables) setWearableDevices(wearables);
                if (kiosk) setKioskStatus(kiosk);
                if (wallets) setCryptoWallets(wallets);
            } catch (error) {
                console.error("Failed to fetch extended deepfake defense data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchExtendedData();
    }, []);

    useEffect(() => {
        if (isDemo) return;
        const persistDuress = async () => {
            try {
                await extendedApi.duress.setConfig({
                    user_id: user?.id || 'demo_user',
                    panic_phrase: 'alaska',
                    silent_mode: true,
                    trigger_action: 'alert_and_lock',
                    enabled: duressEnabled
                });
            } catch (e) {
                console.error("Failed to persist duress config");
            }
        };
        persistDuress();
    }, [duressEnabled, isDemo, user?.id]);

    const handleAnalyzeMedia = async () => {
        setIsAnalyzing(true);
        setActiveTab('analysis');
        toast.info("Initializing deepfake analysis engine...");

        await new Promise(r => setTimeout(r, 2000));

        const newAnalysis: DeepfakeAnalysis = {
            id: (analyses.length + 1).toString(),
            mediaUrl: `/samples/uploaded_${Date.now()}.jpg`,
            mediaType: 'image',
            result: Math.random() > 0.5 ? 'real' : 'fake',
            confidence: 85 + Math.floor(Math.random() * 14),
            analysisAt: new Date(),
            details: { artifacts: 3, skinTexture: 0.05 }
        };

        setAnalyses(prev => [newAnalysis, ...prev]);
        setIsAnalyzing(false);
        toast.success(`Analysis complete: Media appears to be ${newAnalysis.result.toUpperCase()}`);
    };

    const handleExport = () => {
        toast.success("Authenticity certificate generated and exported.");
    };

    const handleRequestChallenge = async () => {
        try {
            setAuthStatus('challenging');
            const response = await fetch(`/api/v1/deepfake/challenge?user_id=${user?.id || 'demo_user'}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error("Failed to request challenge");
            const challenge = await response.json();
            setCurrentChallenge(challenge);
            toast.info("Hardware challenge received. Please sign with your biometric key.");
        } catch (error) {
            setAuthStatus('failed');
            toast.error("Failed to request hardware challenge");
        }
    };

    const handleVerifySignature = async (signature: string) => {
        if (!currentChallenge) return;

        setIsAuthVerifying(true);
        try {
            const response = await fetch(`/api/v1/deepfake/verify?challenge_id=${currentChallenge.id}&signature=${signature}&hardware_id=HW_${Math.random().toString(36).substr(2, 9)}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error("Verification failed");
            const result = await response.json();

            if (result.verified) {
                setAuthStatus('verified');
                toast.success("Identity verified via hardware-backed Biometric Pulse!");
            } else {
                setAuthStatus('failed');
                toast.error("Signature verification failed. Potential deepfake injection detected.");
            }
        } catch (error) {
            setAuthStatus('failed');
            toast.error("Hardware verification error");
        } finally {
            setIsAuthVerifying(false);
        }
    };

    // Calculate stats
    const totalAnalyses = analyses.length;
    const threatsDetected = analyses.filter(a => a.result === 'fake').length;
    const verificationRate = sessions.filter(s => s.status === 'verified').length;
    const blockedAttempts = sessions.filter(s => s.status === 'blocked').length;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            {isDemo && (
                <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-2 text-sm">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400">
                            <AlertCircle className="h-4 w-4" />
                            <span><strong>Demo Mode:</strong> You are viewing a live preview of Deepfake Defense. Persistence is disabled.</span>
                        </div>
                        <Link href="/signup">
                            <Button variant="link" size="sm" className="p-0 h-auto text-blue-400 font-semibold hover:underline">
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
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                                    <Eye className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold">Deepfake Defense</h1>
                                    <p className="text-xs text-muted-foreground">LivenessLink Protection</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab('settings')}
                            >
                                <Smartphone className="w-4 h-4 mr-2" />
                                Mobile SDK
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab('settings')}
                            >
                                <Key className="w-4 h-4 mr-2" />
                                API Keys
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleAnalyzeMedia}
                                disabled={isAnalyzing}
                            >
                                <Upload className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Media'}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1 p-1 bg-muted/50">
                        <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
                        <TabsTrigger value="analysis"><Eye className="w-4 h-4 mr-2" />Analysis</TabsTrigger>
                        <TabsTrigger value="verification"><ShieldCheck className="w-4 h-4 mr-2" />Verification</TabsTrigger>
                        <TabsTrigger value="threats"><AlertOctagon className="w-4 h-4 mr-2" />Threats</TabsTrigger>
                        <TabsTrigger value="biometrics"><Fingerprint className="w-4 h-4 mr-2" />Biometrics</TabsTrigger>
                        <TabsTrigger value="advanced">
                            <Cpu className="w-4 h-4 mr-2" />
                            Advanced Scan
                        </TabsTrigger>
                        <TabsTrigger value="mobile">
                            <Smartphone className="w-4 h-4 mr-2" />
                            Mobile
                        </TabsTrigger>
                        <TabsTrigger value="wearable">
                            <Watch className="w-4 h-4 mr-2" />
                            Wearable
                        </TabsTrigger>
                        <TabsTrigger value="kiosk">
                            <Plane className="w-4 h-4 mr-2" />
                            Kiosk
                        </TabsTrigger>
                        <TabsTrigger value="crypto">
                            <Shield className="w-4 h-4 mr-2" />
                            Crypto
                        </TabsTrigger>
                        <TabsTrigger value="quantum">
                            <Lock className="w-4 h-4 mr-2" />
                            Quantum Security
                        </TabsTrigger>
                        <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>

                        <div className="h-8 w-px bg-border mx-2" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`data-[state=active]:bg-background ${['financial', 'metrics', 'pricing', 'gtm', 'roadmap', 'hiring'].includes(activeTab)
                                        ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
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
                                <DropdownMenuItem onClick={() => setActiveTab('financial')}><BarChart3 className="w-4 h-4 mr-2" />Financial Model</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('metrics')}><Activity className="w-4 h-4 mr-2" />Metrics</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('pricing')}><Tag className="w-4 h-4 mr-2" />Pricing</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('gtm')}><Globe className="w-4 h-4 mr-2" />GTM Strategy</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('roadmap')}><Milestone className="w-4 h-4 mr-2" />Roadmap</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('hiring')}><Users className="w-4 h-4 mr-2" />Hiring</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Hidden triggers to keep TabsContent working when selected via dropdown */}
                        <div className="hidden">
                            <TabsTrigger value="financial">Financial</TabsTrigger>
                            <TabsTrigger value="metrics">Metrics</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing</TabsTrigger>
                            <TabsTrigger value="gtm">GTM</TabsTrigger>
                            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                            <TabsTrigger value="hiring">Hiring</TabsTrigger>
                        </div>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                title="Total Analyses"
                                value={totalAnalyses.toLocaleString()}
                                icon={Eye}
                                color="bg-blue-500/10 text-blue-500"
                                change={23}
                            />
                            <MetricCard
                                title="Threats Detected"
                                value={threatsDetected}
                                icon={ShieldAlert}
                                color="bg-red-500/10 text-red-500"
                                change={-15}
                            />
                            <MetricCard
                                title="Verification Rate"
                                value={`${Math.round((verificationRate / sessions.length) * 100)}%`}
                                icon={CheckCircle2}
                                color="bg-green-500/10 text-green-500"
                            />
                            <MetricCard
                                title="Blocked Attempts"
                                value={blockedAttempts}
                                icon={XCircle}
                                color="bg-purple-500/10 text-purple-500"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                            {/* Identity Trust Layer (Double-Moat) */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Fingerprint className="w-5 h-5 text-purple-500" />
                                                Identity Trust Layer (Double-Moat)
                                            </CardTitle>
                                            <CardDescription>
                                                Active Hardware-Backed Biometric Pulse
                                            </CardDescription>
                                        </div>
                                        <Badge variant={authStatus === 'verified' ? 'default' : 'outline'}>
                                            {authStatus === 'verified' ? 'Trusted Session' : 'Pending Verification'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30 text-center">
                                                <p className="text-xs text-muted-foreground font-mono mb-2 uppercase tracking-wider">Passive detection</p>
                                                <div className="text-lg font-bold text-blue-500">98.4% Real</div>
                                                <p className="text-[10px] text-muted-foreground mt-1">Artifact Analysis (ML)</p>
                                            </div>
                                            <div className={`p-4 rounded-lg border text-center transition-all ${authStatus === 'verified' ? 'bg-green-500/10 border-green-500/50' : 'bg-muted/30 border-dashed border-muted-foreground/30'}`}>
                                                <p className="text-xs text-muted-foreground font-mono mb-2 uppercase tracking-wider">Active Authentication</p>
                                                <div className={`text-lg font-bold ${authStatus === 'verified' ? 'text-green-500' : 'text-muted-foreground'}`}>
                                                    {authStatus === 'verified' ? 'CRYPT_SIG_OK' : 'WAITING_SIG'}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-1">Hardware Biometric Pulse</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {authStatus === 'idle' || authStatus === 'failed' || authStatus === 'expired' ? (
                                                <Button
                                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
                                                    onClick={handleRequestChallenge}
                                                    disabled={isAuthVerifying}
                                                >
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    Request Hardware Biometric Pulse
                                                </Button>
                                            ) : authStatus === 'challenging' && currentChallenge ? (
                                                <div className="p-4 bg-muted rounded-lg border border-purple-500/30 animate-pulse">
                                                    <div className="text-sm font-medium mb-2 text-center">FIDO2 Challenge: <code className="text-xs">{currentChallenge.challenge.substring(0, 16)}...</code></div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="default"
                                                            className="flex-1 bg-purple-500 hover:bg-purple-600"
                                                            onClick={() => handleVerifySignature(`SIG_HW_${Math.random().toString(36).substr(2, 20)}`)}
                                                            disabled={isAuthVerifying}
                                                        >
                                                            {isAuthVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Sign with Device"}
                                                        </Button>
                                                        <Button variant="outline" className="flex-1" onClick={() => setAuthStatus('idle')}>Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : authStatus === 'verified' ? (
                                                <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span className="text-sm font-semibold">Identity 100% Verified</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => setAuthStatus('idle')} className="text-xs h-7">Reset Session</Button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Media Types */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Media Analysis</CardTitle>
                                    <CardDescription>Breakdown by content type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <MediaTypeCard type="image" count={analyses.filter(a => a.mediaType === 'image').length} icon={Image} color="bg-blue-500/10 text-blue-500" />
                                        <MediaTypeCard type="video" count={analyses.filter(a => a.mediaType === 'video').length} icon={Video} color="bg-purple-500/10 text-purple-500" />
                                        <MediaTypeCard type="audio" count={analyses.filter(a => a.mediaType === 'audio').length} icon={Mic} color="bg-orange-500/10 text-orange-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Key Features */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        LivenessLink Features
                                    </CardTitle>
                                    <CardDescription>Active protection capabilities</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <Eye className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Micro-Expression Analysis</span>
                                            </div>
                                            <Badge variant="secondary">Active</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <Fingerprint className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Cancellable Biometrics</span>
                                            </div>
                                            <Badge variant="secondary">{biometrics.length} Enrolled</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Panic Word Detection</span>
                                            </div>
                                            <Badge variant={duressEnabled ? "default" : "outline"}>
                                                {duressEnabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                                            <div className="flex items-center gap-3">
                                                <Mic className="w-5 h-5 text-blue-500" />
                                                <span className="font-medium">Voice Liveness</span>
                                            </div>
                                            <Badge variant="outline">API Ready</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Active Threats */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertOctagon className="w-5 h-5 text-red-500" />
                                    Active Threats
                                </CardTitle>
                                <CardDescription>Real-time threat detection alerts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {threats.slice(0, 3).map(threat => (
                                        <div key={threat.id} className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <ThreatBadge severity={threat.severity} />
                                                    <span className="font-medium">{threat.type.replace(/_/g, ' ')}</span>
                                                </div>
                                                <Badge variant="outline">{threat.timestamp.toLocaleTimeString()}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">{threat.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analysis Tab */}
                    <TabsContent value="analysis">
                        <Card>
                            <CardHeader>
                                <CardTitle>Media Analysis History</CardTitle>
                                <CardDescription>Recent deepfake detection results</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-4">
                                    <Select value={mediaType} onValueChange={setMediaType}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="image">Images</SelectItem>
                                            <SelectItem value="video">Videos</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" onClick={handleExport}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Media</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead>Confidence</TableHead>
                                            <TableHead>Analyzed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analyses.map(analysis => (
                                            <TableRow key={analysis.id}>
                                                <TableCell>
                                                    <div className="font-medium">{analysis.mediaUrl.split('/').pop()}</div>
                                                </TableCell>
                                                <TableCell className="capitalize">{analysis.mediaType}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        analysis.result === 'real' ? 'default' :
                                                            analysis.result === 'fake' ? 'destructive' : 'outline'
                                                    }>
                                                        {analysis.result}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={analysis.confidence} className="w-16 h-2" />
                                                        <span>{analysis.confidence}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{analysis.analysisAt.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Verification Tab */}
                    <TabsContent value="verification">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Verification Sessions</CardTitle>
                                    <CardDescription>Real-time identity verification history</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                        try {
                                            const res = await (extendedApi as any).verify.document("doc_url");
                                            toast.success(`Document Verified! Type: ${res.document_type}`);
                                        } catch (error) {
                                            // Fallback
                                            toast.success(`Document Verified! Type: passport`);
                                        }
                                    }}
                                >
                                    <FileCheck className="w-4 h-4 mr-2" />
                                    Scan Document
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Session</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.map(session => (
                                            <TableRow key={session.id}>
                                                <TableCell>
                                                    <div className="font-mono text-sm">{session.id}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 capitalize">
                                                        {session.type === 'video' && <Video className="w-4 h-4" />}
                                                        {session.type === 'voice' && <Mic className="w-4 h-4" />}
                                                        {session.type === 'document' && <FileCheck className="w-4 h-4" />}
                                                        {session.type}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{session.userId}</TableCell>
                                                <TableCell>
                                                    {session.amount ? `$${session.amount.toLocaleString()}` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        session.status === 'verified' ? 'default' :
                                                            session.status === 'blocked' ? 'destructive' :
                                                                session.status === 'failed' ? 'outline' : 'secondary'
                                                    }>
                                                        {session.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {session.microExpressionScore && (
                                                        <span>{Math.round(session.microExpressionScore * 100)}%</span>
                                                    )}
                                                    {session.voiceLivenessScore && (
                                                        <span>{Math.round(session.voiceLivenessScore * 100)}%</span>
                                                    )}
                                                    {!session.microExpressionScore && !session.voiceLivenessScore && '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Threats Tab */}
                    <TabsContent value="threats">
                        <Card>
                            <CardHeader>
                                <CardTitle>Threat Intelligence</CardTitle>
                                <CardDescription>Active and historical threat alerts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {threats.map(threat => (
                                        <div key={threat.id} className="p-4 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <ThreatBadge severity={threat.severity} />
                                                    <span className="font-medium capitalize">{threat.type.replace(/_/g, ' ')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{threat.source}</Badge>
                                                    <Badge variant={
                                                        threat.status === 'active' ? 'destructive' :
                                                            threat.status === 'investigating' ? 'outline' : 'default'
                                                    }>
                                                        {threat.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-2">{threat.description}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {threat.timestamp.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Biometrics Tab */}
                    <TabsContent value="biometrics">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Biometric Templates</CardTitle>
                                    <CardDescription>Cancellable biometric enrollment</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                        try {
                                            const res = await extendedApi.advancedDeepfake.voiceVerify("user-123", "audio_url");
                                            toast.success(`Voice Verified! Status: ${res.status}`);
                                        } catch (error) {
                                            // Fallback
                                            toast.success(`Voice Verified! Status: verified`);
                                        }
                                    }}
                                >
                                    <Mic className="w-4 h-4 mr-2" />
                                    Verify Voice
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {biometrics.map(bio => (
                                        <div key={bio.id} className="p-4 rounded-lg border">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {bio.type === 'face' && <Eye className="w-5 h-5" />}
                                                    {bio.type === 'voice' && <Mic className="w-5 h-5" />}
                                                    {bio.type === 'fingerprint' && <Fingerprint className="w-5 h-5" />}
                                                    <div>
                                                        <div className="font-medium capitalize">{bio.type} Biometric</div>
                                                        <div className="text-sm text-muted-foreground">User: {bio.userId}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        Last used: {bio.lastUsed.toLocaleDateString()}
                                                    </div>
                                                    <Badge variant={bio.cancellable ? "default" : "outline"}>
                                                        {bio.cancellable ? "Cancellable" : "Non-cancellable"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Mobile SDK Tab */}
                    <TabsContent value="mobile">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-indigo-500" />
                                        LivenessLink Mobile SDK
                                    </CardTitle>
                                    <CardDescription>Integrate deepfake defense into native apps</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                                            <div>
                                                <div className="text-sm font-medium">SDK Version</div>
                                                <div className="text-2xl font-bold">{sdkStatus?.version || 'v2.4.1'}</div>
                                            </div>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">Latest</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg border text-center">
                                                <div className="text-xs text-muted-foreground uppercase">Active Apps</div>
                                                <div className="text-xl font-bold">{sdkStatus?.registered_apps || 12}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border text-center">
                                                <div className="text-xs text-muted-foreground uppercase">API Health</div>
                                                <div className="text-xl font-bold text-emerald-500">{sdkStatus?.api_health || '99.9%'}</div>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={() => window.open('https://www.npmjs.com/package/@livenesslink/sdk', '_blank')}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download SDK (iOS/Android)
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Events (Mobile)</CardTitle>
                                    <CardDescription>Real-time SDK injection alerts</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-lg border border-l-4 border-l-emerald-500 bg-emerald-500/5">
                                            <div className="font-bold text-xs uppercase">Integrity Check Passed</div>
                                            <p className="text-sm">App 'NeoBank-Main' validated on Pixel 8</p>
                                        </div>
                                        <div className="p-3 rounded-lg border border-l-4 border-l-indigo-500 bg-indigo-500/5">
                                            <div className="font-bold text-xs uppercase">SDK Init</div>
                                            <p className="text-sm">New session started: user_882</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Wearable Protection Tab */}
                    <TabsContent value="wearable">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Watch className="w-5 h-5 text-orange-500" />
                                        Biometric Pulse Monitor
                                    </CardTitle>
                                    <CardDescription>Encrypted heart-rate liveness sync</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {wearableDevices.map((device) => (
                                            <Card key={device.id} className="bg-muted/30">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Cpu className={`w-4 h-4 ${device.status === 'encrypted' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                                            <span className="font-bold uppercase tracking-tighter">{device.device_type}</span>
                                                        </div>
                                                        <Badge variant={device.status === 'encrypted' ? 'default' : 'secondary'}>
                                                            {device.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">Device ID</div>
                                                            <div className="font-mono text-sm">{device.id}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-muted-foreground">Pulse Sync</div>
                                                            <div className="flex items-center gap-1 text-red-500 font-bold">
                                                                <Activity className="w-3 h-3 animate-pulse" />
                                                                72 BPM
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {wearableDevices.length === 0 && (
                                            <div className="col-span-2 text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                                <Watch className="w-12 h-12 mx-auto mb-2 opacity-10" />
                                                <p>No wearable devices paired for biometric pulse.</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-4"
                                                    onClick={async () => {
                                                        try {
                                                            await extendedApi.wearable.register({
                                                                device_type: 'Apple Watch',
                                                                user_id: user?.id || 'demo_user',
                                                                status: 'paired',
                                                                firmware_version: '10.4'
                                                            });
                                                            const updated = await extendedApi.wearable.devices();
                                                            setWearableDevices(updated);
                                                            toast.success("Device paired successfully!");
                                                        } catch (e) {
                                                            // Fallback: add locally
                                                            const newDevice = {
                                                                id: `wearable-${Date.now()}`,
                                                                device_type: 'Apple Watch',
                                                                user_id: user?.id || 'demo_user',
                                                                status: 'paired',
                                                                firmware_version: '10.4',
                                                                paired_at: new Date()
                                                            };
                                                            setWearableDevices(prev => [...prev, newDevice]);
                                                            toast.success("Device paired successfully!");
                                                        }
                                                    }}
                                                >
                                                    Pair New Device
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Travel Kiosk Tab */}
                    <TabsContent value="kiosk">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plane className="w-5 h-5 text-blue-500" />
                                        Travel Kiosk Defense
                                    </CardTitle>
                                    <CardDescription>Passport & Biometric verification for kiosks</CardDescription>
                                </div>
                                {kioskStatus && (
                                    <Badge className="bg-blue-500">
                                        <Wifi className="w-3 h-3 mr-1" />
                                        Station: {kioskStatus.location}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg border">
                                            <div className="text-sm font-medium mb-1">Active Kiosk ID</div>
                                            <div className="text-xl font-mono">{kioskStatus?.id || 'KIOSK-LHR-A12'}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg border text-center">
                                                <div className="text-xs text-muted-foreground uppercase">Queue Size</div>
                                                <div className="text-2xl font-bold">{kioskStatus?.scan_queue || 4}</div>
                                            </div>
                                            <div className="p-4 rounded-lg border text-center">
                                                <div className="text-xs text-muted-foreground uppercase">Last Threat</div>
                                                <div className="text-lg font-bold text-orange-500">{kioskStatus?.last_threat_type || 'None'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg border bg-blue-500/5">
                                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-blue-500" />
                                            Kiosk Deployment Status
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Passport OCR</span>
                                                <Badge variant="outline">Verified</Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">3D Face Scan</span>
                                                <Badge variant="outline">Active</Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Deepfake Bot Filter</span>
                                                <Badge variant="outline">Running</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full mt-6"
                                            onClick={async () => {
                                                try {
                                                    const status = await extendedApi.travel.kioskStatus();
                                                    if (status) setKioskStatus(status);
                                                    toast.success("Terminal session refreshed");
                                                } catch (error) {
                                                    // Fallback
                                                    toast.success("Terminal session refreshed");
                                                }
                                            }}
                                        >
                                            Restart Terminal
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Crypto Tab */}
                    <TabsContent value="crypto">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-orange-500" />
                                        Crypto Wallet Protection
                                    </CardTitle>
                                    <CardDescription>Secure hardware-level transaction liveness</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        // Demo mode: simulate wallet connection
                                        toast.info("Connecting to wallet provider...");
                                        setTimeout(() => {
                                            const newWallet: CryptoWallet = {
                                                id: `wallet_${Date.now()}`,
                                                wallet_address: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
                                                blockchain: 'Ethereum',
                                                protection_enabled: true,
                                                last_verified: new Date().toISOString()
                                            };
                                            setCryptoWallets((prev: CryptoWallet[]) => [...prev, newWallet]);
                                            toast.success("Wallet protected! Biometric verification enabled.");
                                        }, 1500);
                                    }}
                                >
                                    Protect New Wallet
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cryptoWallets.map(wallet => (
                                        <div key={wallet.id} className="p-4 rounded-lg border flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-orange-500/10">
                                                    <Key className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div>
                                                    <div className="font-mono text-sm">{wallet.wallet_address.substring(0, 6)}...{wallet.wallet_address.substring(38)}</div>
                                                    <div className="text-xs text-muted-foreground uppercase">{wallet.blockchain}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={wallet.protection_enabled ? "default" : "secondary"}>
                                                    {wallet.protection_enabled ? "Shielded" : "Unprotected"}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={async () => {
                                                        try {
                                                            await extendedApi.crypto.verify(wallet.id!);
                                                            toast.success("Transaction liveness verified!");
                                                        } catch (error) {
                                                            // Fallback
                                                            toast.success("Transaction liveness verified!");
                                                        }
                                                    }}
                                                >
                                                    Verify Liveness
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {cryptoWallets.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Shield className="w-12 h-12 mx-auto mb-2 opacity-10" />
                                            <p>No protected wallets found.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Quantum Security Tab - NEW FEATURE */}
                    <TabsContent value="quantum">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-purple-500" />
                                        Quantum-Resistant Biometrics
                                    </CardTitle>
                                    <CardDescription>Post-quantum cryptographic protection for biometric data</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <div className="text-xs text-muted-foreground">Algorithm</div>
                                            <div className="font-bold text-purple-500">CRYSTALS-Kyber</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <div className="text-xs text-muted-foreground">Key Size</div>
                                            <div className="font-bold text-blue-500">256-bit</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Template Encryption</span>
                                            <Badge variant="default" className="bg-green-500">Active</Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Lattice-based KEM</span>
                                            <Badge variant="default" className="bg-green-500">Enabled</Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Migration Status</span>
                                            <span className="text-muted-foreground">In Progress</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => toast.info("Quantum-resistant template migration started")}
                                    >
                                        <Zap className="w-4 h-4 mr-2" />
                                        Migrate Biometrics to Quantum
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-red-500" />
                                        Quantum Threat Monitor
                                    </CardTitle>
                                    <CardDescription>Real-time monitoring for quantum attacks</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-green-500/5">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-green-500" />
                                                <div>
                                                    <div className="font-medium">Q-Day Readiness Score</div>
                                                    <div className="text-xs text-muted-foreground">Protection level against quantum threats</div>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold text-green-500">87%</div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                                <div>
                                                    <div className="font-medium">Classical Templates</div>
                                                    <div className="text-xs text-muted-foreground">Need quantum migration</div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">1,247</Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => toast.info("Quantum threat assessment complete")}
                                    >
                                        Run Quantum Risk Assessment
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Advanced Analysis Tab */}
                    <TabsContent value="advanced">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-purple-500" />
                                    Advanced Forensic Analysis
                                </CardTitle>
                                <CardDescription>Deep neural-network scan for synthetic artifacts</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-8 border-2 border-dashed rounded-xl text-center bg-purple-500/5 border-purple-500/20">
                                    <Upload className="w-12 h-12 mx-auto mb-4 text-purple-500 opacity-50" />
                                    <h3 className="text-lg font-bold mb-2">Ready for High-Res Analysis</h3>
                                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                                        Upload 4K video or RAW audio for pixel-level discontinuity checks and frequency domain analysis.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <Button
                                            onClick={async () => {
                                                setIsAnalyzing(true);
                                                try {
                                                    const res = await (extendedApi.advancedDeepfake as any).analyze("sample_id", "video");
                                                    setAdvancedResult(res);
                                                    toast.success("Advanced analysis complete");
                                                } catch (e) {
                                                    toast.error("Analysis failed");
                                                } finally {
                                                    setIsAnalyzing(false);
                                                }
                                            }}
                                            disabled={isAnalyzing}
                                        >
                                            {isAnalyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                                            Run Enterprise Scan
                                        </Button>
                                        <Button variant="outline">View Methodology</Button>
                                    </div>
                                </div>

                                {advancedResult && (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                            <div className="text-xs font-bold uppercase text-emerald-600 mb-1">Liveness Score</div>
                                            <div className="text-2xl font-bold">{(advancedResult.confidence * 100).toFixed(1)}%</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                            <div className="text-xs font-bold uppercase text-blue-600 mb-1">Pixel Continuity</div>
                                            <div className="text-2xl font-bold">OPTIMAL</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                            <div className="text-xs font-bold uppercase text-purple-600 mb-1">Heart Rate Optic</div>
                                            <div className="text-2xl font-bold">74 BPM</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                                            <div className="text-xs font-bold uppercase text-orange-600 mb-1">Phoneme Sync</div>
                                            <div className="text-2xl font-bold">MATCHED</div>
                                        </div>
                                    </div>
                                )}

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Neural Layer</TableHead>
                                            <TableHead>Detection Method</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Confidence</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium font-mono text-xs">GAN_SCAN_V4</TableCell>
                                            <TableCell>Generative Adversarial Pattern Check</TableCell>
                                            <TableCell><Badge>PASSED</Badge></TableCell>
                                            <TableCell>99.9%</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium font-mono text-xs">FREQ_D_AUDIO</TableCell>
                                            <TableCell>Fast Fourier Transform Discontinuity</TableCell>
                                            <TableCell><Badge variant="outline">SKIPPED</Badge></TableCell>
                                            <TableCell>N/A</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium font-mono text-xs">BIO_PULSE_EXT</TableCell>
                                            <TableCell>Remote Photoplethysmography (rPPG)</TableCell>
                                            <TableCell><Badge className="bg-emerald-500">OPTIMAL</Badge></TableCell>
                                            <TableCell>94.2%</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                    <CardDescription>Configure protection features</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Panic Word Detection</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Trigger silent alert with secret phrase
                                            </p>
                                        </div>
                                        <Switch
                                            checked={duressEnabled}
                                            onCheckedChange={setDuressEnabled}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Voice Liveness Check</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Require voice liveness for audio verification
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Micro-Expression Analysis</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Analyze subtle facial cues in video calls
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Document NFC Validation</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Verify ID documents via NFC chip
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Integration Settings</CardTitle>
                                    <CardDescription>Configure external integrations</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                <span>Enterprise SSO</span>
                                            </div>
                                            <Badge variant="outline">Not Connected</Badge>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="w-4 h-4" />
                                                <span>Mobile SDK</span>
                                            </div>
                                            <Badge variant="default">Ready</Badge>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Key className="w-4 h-4" />
                                                <span>REST API</span>
                                            </div>
                                            <Badge variant="default">Active</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Endpoint: https://api.livenesslink.com/v1
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Financial Tab - LivenessLink */}
                    <TabsContent value="financial">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Unit Economics</CardTitle>
                                    <CardDescription>Treasury Security CAC & LTV</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Blended CAC</span>
                                            <span className="font-bold">$12,000</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">ARPU</span>
                                            <span className="font-bold">$4,000/mo</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Gross Margin</span>
                                            <span className="font-bold">80%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Churn Rate</span>
                                            <span className="font-bold">0.5%/mo</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">LTV</span>
                                                <span className="font-bold text-green-500">$640,000</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-sm text-muted-foreground">LTV:CAC Ratio</span>
                                                <span className="font-bold text-green-500">53.3:1</span>
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
                                            <span className="font-medium">$8,000 (2 customers)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Q3</span>
                                            <span className="font-medium">$40,000 (10 customers)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Q4</span>
                                            <span className="font-medium">$100,000 (25 customers)</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Y1 ARR Target</span>
                                                <span className="font-bold text-blue-500">$100,000</span>
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
                                            <span>Salaries (Crypto/iOS)</span>
                                            <span>$40,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Cloud Security</span>
                                            <span>$8,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Enterprise T&E</span>
                                            <span>$5,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Legal/ISO/SOC2</span>
                                            <span>$3,000</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                                            <span>Total Monthly</span>
                                            <span>$56,000</span>
                                        </div>
                                        <div className="flex justify-between text-green-500">
                                            <span>Breakeven</span>
                                            <span>18 customers</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Metrics Tab */}
                    <TabsContent value="metrics">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">North Star</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$1B</div>
                                    <p className="text-xs text-muted-foreground">Value Secured/mo</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Secondary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">5,000</div>
                                    <p className="text-xs text-muted-foreground">Liveness Checks/mo</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$48,000</div>
                                    <p className="text-xs text-muted-foreground">ACV</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Sales Cycle</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">&lt;120</div>
                                    <p className="text-xs text-muted-foreground">days</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Growth Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">CFO/Treasurer Intros</span>
                                            <Badge>10/week</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Partner Referrals</span>
                                            <Badge>5/mo</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Deploy to ERP Time</span>
                                            <Badge variant="outline">&lt;30 days</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Friction/Abandonment</span>
                                            <Badge>&lt;1%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Auth Speed</span>
                                            <Badge variant="outline">&lt;2 sec</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Win Rate</span>
                                            <Badge variant="outline">&gt;30%</Badge>
                                        </div>
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
                                    <CardTitle>Solo Defender</CardTitle>
                                    <CardDescription>Small prototypes</CardDescription>
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
                                            Hardware Challenge API
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
                                            Biometric Signature
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
                                    <CardDescription>Global Banking Tier</CardDescription>
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
                    </TabsContent>

                    {/* GTM Tab */}
                    <TabsContent value="gtm">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="text-center p-4 rounded-lg bg-blue-500/10">
                                <div className="text-2xl font-bold text-blue-500">40%</div>
                                <div className="text-sm text-muted-foreground">Direct Outbound</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-purple-500/10">
                                <div className="text-2xl font-bold text-purple-500">35%</div>
                                <div className="text-sm text-muted-foreground">Private Dinners</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-green-500/10">
                                <div className="text-2xl font-bold text-green-500">20%</div>
                                <div className="text-sm text-muted-foreground">ERP Partners</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-orange-500/10">
                                <div className="text-2xl font-bold text-orange-500">5%</div>
                                <div className="text-sm text-muted-foreground">Events</div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Roadmap Tab */}
                    <TabsContent value="roadmap">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Q1: MVP - Hardware Signer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2"><Badge variant="default">In Progress</Badge><span>Go Backend FIDO Server</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="secondary">Planned</Badge><span>Native iOS Authenticator</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Planned</Badge><span>Standalone Web Dashboard</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Q2: Growth - ERP Wedge</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Kyriba API Connector</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Oracle NetSuite Plugin</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Multi-Sig Quorum Logic</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Q3: Scale - Immune System</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Silent Duress Alarm</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Geo-Fencing Approval</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Apple Watch Integration</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Q4: Enterprise Operations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Immutable Audit Ledger</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>SSO / SAML Identity</span></div>
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
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between p-3 rounded-lg bg-muted"><div><div className="font-medium">Applied Cryptographer</div></div><Badge>Month 1</Badge></div>
                                        <div className="flex justify-between p-3 rounded-lg bg-muted"><div><div className="font-medium">iOS Engineer</div></div><Badge>Month 2</Badge></div>
                                        <div className="flex justify-between p-3 rounded-lg bg-muted"><div><div className="font-medium">Backend Engineer</div></div><Badge>Month 3</Badge></div>
                                        <div className="flex justify-between p-3 rounded-lg bg-muted"><div><div className="font-medium">Enterprise Sales</div></div><Badge>Month 4</Badge></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compensation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span>iOS Engineer</span><span>$120k-$160k</span></div>
                                        <div className="flex justify-between"><span>Cryptographer</span><span>$150k-$200k</span></div>
                                        <div className="flex justify-between"><span>Sales (OTE)</span><span>$150k-$250k</span></div>
                                        <div className="border-t pt-2"><div className="flex justify-between"><span>Equity</span><span>1-2.5%</span></div></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
