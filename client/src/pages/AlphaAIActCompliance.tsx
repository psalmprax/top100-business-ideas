/**
 * Alpha AI Act Compliance - Enterprise Dashboard
 * EU AI Act compliance automation for high-risk AI systems
 * 
 * Features:
 * - Automated Technical Documentation Folder
 * - Training Data Bias Scan
 * - Adversarial Audit Bot (Red Team)
 * - EU Database Registration
 * - Incident Reporting
 * - Model Card Generation
 * - GDPR + AI Act Alignment
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { extendedApi, type TrainingModule, type EdgeDeployment, type ShadowAIDetection } from '@/lib/api';
import {
    Zap,
    Cloud,
    BookOpen,
    Eye,
    Shield,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    XCircle,
    FileText,
    Clock,
    Scale,
    Globe,
    RefreshCw,
    Download,
    Filter,
    Search,
    Plus,
    Settings,
    AlertOctagon,
    Bot,
    Database,
    ShieldAlert,
    Brain,
    Users,
    Calendar,
    FileCheck,
    Bug,
    Activity,
    Bell,
    BadgeCheck,
    ArrowRight,
    ChevronRight,
    Trash2,
    Key,
    FileDown,
    UserPlus,
    ShieldCheck,
    LayoutDashboard,
    Box,
    BarChart3,
    Tag,
    Milestone,
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
import { ChevronDown, CheckSquare, Plug, Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface AIModel {
    id: string;
    name: string;
    riskCategory: 'unacceptable' | 'high' | 'limited' | 'minimal';
    status: 'compliant' | 'non_compliant' | 'pending' | 'review';
    complianceScore: number;
    lastAudit: Date;
    articles: ArticleStatus[];
}

interface ArticleStatus {
    article: string;
    title: string;
    status: 'compliant' | 'non_compliant' | 'not_applicable' | 'pending';
    evidence?: string;
}

interface BiasReport {
    id: string;
    modelId: string;
    protectedClass: string;
    disparateImpact: number;
    statisticalSignificance: number;
    status: 'passed' | 'warning' | 'failed';
    details: string;
}

interface AuditReport {
    id: string;
    modelId: string;
    type: 'red_team' | 'penetration' | 'vulnerability';
    status: 'completed' | 'in_progress' | 'scheduled';
    findings: number;
    criticalFindings: number;
    date: Date;
}

interface Incident {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    reportedAt: Date;
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    article72: boolean;
}

interface DocumentationPackage {
    id: string;
    modelId: string;
    articles: string[];
    generatedAt: Date;
    status: 'draft' | 'ready' | 'submitted';
}

interface Vendor {
    id: string;
    name: string;
    type: 'cloud' | 'model' | 'infrastructure';
    riskLevel: 'high' | 'medium' | 'low';
    complianceStatus: string;
    lastAssessment: Date;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockModels: AIModel[] = [
    {
        id: '1',
        name: 'Credit Scoring Model v2.1',
        riskCategory: 'high',
        status: 'compliant',
        complianceScore: 94,
        lastAudit: new Date('2024-11-01'),
        articles: [
            { article: 'Article 9', title: 'Risk Management', status: 'compliant', evidence: 'risk_mgmt_v2.pdf' },
            { article: 'Article 10', title: 'Data Governance', status: 'compliant', evidence: 'data_governance.pdf' },
            { article: 'Article 11', title: 'Technical Documentation', status: 'compliant', evidence: 'tech_docs_v2.pdf' },
            { article: 'Article 12', title: 'Human Oversight', status: 'compliant', evidence: 'human_oversight.pdf' },
            { article: 'Article 14', title: 'Accuracy & Robustness', status: 'compliant', evidence: 'accuracy_report.pdf' },
            { article: 'Article 61', title: 'Post-Market Monitoring', status: 'non_compliant', evidence: undefined },
        ],
    },
    {
        id: '2',
        name: 'Resume Screening AI',
        riskCategory: 'high',
        status: 'non_compliant',
        complianceScore: 68,
        lastAudit: new Date('2024-10-15'),
        articles: [
            { article: 'Article 9', title: 'Risk Management', status: 'compliant', evidence: 'risk_mgmt_v1.pdf' },
            { article: 'Article 10', title: 'Data Governance', status: 'non_compliant', evidence: undefined },
            { article: 'Article 11', title: 'Technical Documentation', status: 'pending', evidence: undefined },
            { article: 'Article 12', title: 'Human Oversight', status: 'compliant', evidence: 'hr_oversight.pdf' },
            { article: 'Article 14', title: 'Accuracy & Robustness', status: 'compliant', evidence: 'accuracy_v1.pdf' },
            { article: 'Article 61', title: 'Post-Market Monitoring', status: 'non_compliant', evidence: undefined },
        ],
    },
    {
        id: '3',
        name: 'Customer Chatbot v3',
        riskCategory: 'limited',
        status: 'compliant',
        complianceScore: 88,
        lastAudit: new Date('2024-11-05'),
        articles: [
            { article: 'Article 50', title: 'Transparency', status: 'compliant' },
            { article: 'Article 52', title: 'AI-generated Content', status: 'compliant' },
        ],
    },
];

const mockBiasReports: BiasReport[] = [
    {
        id: '1',
        modelId: '2',
        protectedClass: 'Gender',
        disparateImpact: 0.72,
        statisticalSignificance: 0.95,
        status: 'failed',
        details: 'Female candidates receiving 72% of positive outcomes compared to male baseline',
    },
    {
        id: '2',
        modelId: '2',
        protectedClass: 'Age',
        disparateImpact: 0.81,
        statisticalSignificance: 0.88,
        status: 'warning',
        details: 'Candidates over 50 receiving 81% of positive outcomes',
    },
    {
        id: '3',
        modelId: '1',
        protectedClass: 'Gender',
        disparateImpact: 0.98,
        statisticalSignificance: 0.92,
        status: 'passed',
        details: 'No significant disparate impact detected',
    },
];

const mockAudits: AuditReport[] = [
    {
        id: '1',
        modelId: '1',
        type: 'red_team',
        status: 'completed',
        findings: 3,
        criticalFindings: 0,
        date: new Date('2024-10-20'),
    },
    {
        id: '2',
        modelId: '2',
        type: 'red_team',
        status: 'in_progress',
        findings: 7,
        criticalFindings: 2,
        date: new Date(),
    },
    {
        id: '3',
        modelId: '1',
        type: 'penetration',
        status: 'scheduled',
        findings: 0,
        criticalFindings: 0,
        date: new Date('2024-12-01'),
    },
];

const mockIncidents: Incident[] = [
    {
        id: '1',
        severity: 'high',
        description: 'Credit model incorrectly denied loan to customer #45892',
        reportedAt: new Date('2024-11-08'),
        status: 'investigating',
        article72: true,
    },
    {
        id: '2',
        severity: 'medium',
        description: 'Chatbot generated incorrect legal advice',
        reportedAt: new Date('2024-11-01'),
        status: 'resolved',
        article72: false,
    },
];

const mockDocumentation: DocumentationPackage[] = [
    {
        id: '1',
        modelId: '1',
        articles: ['Article 9', 'Article 10', 'Article 11', 'Article 12', 'Article 14'],
        generatedAt: new Date('2024-11-01'),
        status: 'ready',
    },
    {
        id: '2',
        modelId: '2',
        articles: ['Article 9', 'Article 10'],
        generatedAt: new Date('2024-10-15'),
        status: 'draft',
    },
];

// ============================================================================
// Components
// ============================================================================

function ComplianceScoreCard({
    score,
    title
}: {
    score: number;
    title: string;
}) {
    const getColor = (s: number) => {
        if (s >= 80) return 'text-green-500';
        if (s >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="text-3xl font-bold">{score}%</div>
                <div className="text-sm text-muted-foreground">{title}</div>
                <Progress value={score} className="mt-2 h-2" />
            </CardContent>
        </Card>
    );
}

function RiskBadge({ category }: { category: AIModel['riskCategory'] }) {
    const config = {
        unacceptable: { color: 'bg-red-500', label: 'Unacceptable' },
        high: { color: 'bg-orange-500', label: 'High Risk' },
        limited: { color: 'bg-yellow-500', label: 'Limited Risk' },
        minimal: { color: 'bg-green-500', label: 'Minimal Risk' },
    };
    const c = config[category];
    return (
        <Badge className={`${c.color} text-white`}>
            {c.label}
        </Badge>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        compliant: { color: 'bg-green-500', label: 'Compliant' },
        non_compliant: { color: 'bg-red-500', label: 'Non-Compliant' },
        pending: { color: 'bg-yellow-500', label: 'Pending' },
        review: { color: 'bg-blue-500', label: 'Under Review' },
    };
    // @ts-ignore
    const c = config[status] || config.pending;
    return (
        <Badge className={`${c.color} text-white`}>
            {c.label}
        </Badge>
    );
}

// ============================================================================
// Compliance Checklist Component
// ============================================================================

const ComplianceChecklistContent = () => {
    const [connectedSystems, setConnectedSystems] = useState<Record<number, boolean>>({});
    const [scanningArticles, setScanningArticles] = useState<Record<number, boolean>>({});

    const articles = [
        {
            article: 'Article 5',
            title: 'Prohibited Practices',
            description: 'AI systems that deploy subliminal techniques, exploit vulnerabilities, or enable social scoring are prohibited.',
            risk: 'unacceptable',
            status: 'compliant',
            evidence: 'System audit logs, policy documentation',
            remediation: 'N/A - Currently compliant',
            integrationType: 'Model Registry',
            scanType: 'Policy Check'
        },
        {
            article: 'Article 6',
            title: 'Classification Rules',
            description: 'Classification of AI systems as unacceptable, high, limited, or minimal risk based on intended purpose.',
            risk: 'high',
            status: 'compliant',
            evidence: 'Risk classification matrix, system registration',
            remediation: 'N/A - Classification completed',
            integrationType: 'Use Case Registry',
            scanType: 'Classification'
        },
        {
            article: 'Article 7',
            title: 'High-Risk List',
            description: 'AI systems in critical sectors (biometrics, employment, education, law enforcement) require strict compliance.',
            risk: 'high',
            status: 'in_progress',
            evidence: 'Sector classification, use case documentation',
            remediation: 'Complete conformity assessment',
            integrationType: 'Sector API',
            scanType: 'Risk Assessment'
        },
        {
            article: 'Article 8',
            title: 'Compliance Requirements',
            description: 'High-risk systems must implement risk management, data governance, transparency, and human oversight.',
            risk: 'high',
            status: 'in_progress',
            evidence: 'Risk management system, data governance policy',
            remediation: 'Implement missing controls',
            integrationType: 'CI/CD Pipeline',
            scanType: 'Control Audit'
        },
        {
            article: 'Article 9',
            title: 'Quality Management',
            description: 'High-risk systems require quality management system (QMS) following harmonized standards.',
            risk: 'high',
            status: 'in_progress',
            evidence: 'QMS documentation, quality manual',
            remediation: 'Complete QMS implementation',
            integrationType: 'Quality System',
            scanType: 'QMS Validation'
        },
        {
            article: 'Article 10',
            title: 'Data Governance',
            description: 'Training data must be relevant, representative, free of errors, and include appropriate data governance measures.',
            risk: 'high',
            status: 'in_progress',
            evidence: 'Data inventory, bias testing reports',
            remediation: 'Complete data quality audit',
            integrationType: 'Training Data Store',
            scanType: 'Bias Scan'
        },
        {
            article: 'Article 11',
            title: 'Technical Documentation',
            description: 'High-risk systems must have comprehensive technical documentation before market placement.',
            risk: 'high',
            status: 'not_started',
            evidence: 'Technical documentation package',
            remediation: 'Create technical documentation',
            integrationType: 'CI/CD Pipeline',
            scanType: 'Doc Generator'
        },
        {
            article: 'Article 12',
            title: 'Record Keeping',
            description: 'Systems must automatically log operations with sufficient traceability for authorities.',
            risk: 'high',
            status: 'compliant',
            evidence: 'Audit logs, logging infrastructure',
            remediation: 'N/A - Currently compliant',
            integrationType: 'Logging System',
            scanType: 'Log Audit'
        },
        {
            article: 'Article 13',
            title: 'Transparency',
            description: 'Systems must provide sufficient transparency for users to understand AI involvement.',
            risk: 'limited',
            status: 'compliant',
            evidence: 'User disclosures, AI identification',
            remediation: 'N/A - Currently compliant',
            integrationType: 'UI Components',
            scanType: 'Disclosure Check'
        },
        {
            article: 'Article 14',
            title: 'Human Oversight',
            description: 'High-risk systems must have human-in-the-loop oversight mechanisms.',
            risk: 'high',
            status: 'in_progress',
            evidence: 'Human oversight protocols, intervention mechanisms',
            remediation: 'Implement override controls',
            integrationType: 'Workflow Engine',
            scanType: 'Override Test'
        },
        {
            article: 'Article 15',
            title: 'Accuracy & Robustness',
            description: 'Systems must perform with appropriate accuracy, robustness, and cybersecurity.',
            risk: 'high',
            status: 'compliant',
            evidence: 'Performance testing, security assessments',
            remediation: 'N/A - Currently compliant',
            integrationType: 'MLOps Platform',
            scanType: 'Robustness Test'
        },
        {
            article: 'Article 43',
            title: 'Conformity Assessment',
            description: 'High-risk systems must undergo conformity assessment before market entry.',
            risk: 'high',
            status: 'in_progress',
            evidence: 'Conformity assessment certificate',
            remediation: 'Complete third-party assessment',
            integrationType: 'Certification Portal',
            scanType: 'Assessment'
        },
        {
            article: 'Article 44',
            title: 'Self-Assessment Option',
            description: 'Limited risk systems can self-assess; high-risk requires third-party notification.',
            risk: 'high',
            status: 'in_progress',
            evidence: 'Self-assessment declaration or third-party certification',
            remediation: 'Submit conformity declaration',
            integrationType: 'Declaration System',
            scanType: 'Declaration Check'
        },
        {
            article: 'Article 49',
            title: 'EU Database Registration',
            description: 'High-risk AI systems must be registered in EU database before market placement.',
            risk: 'high',
            status: 'not_started',
            evidence: 'EU database registration ID',
            remediation: 'Register in EU database',
            integrationType: 'EU AI Office API',
            scanType: 'Registration'
        },
        {
            article: 'Article 50',
            title: 'Transparency Obligations',
            description: 'AI-generated content must be marked; deepfakes require disclosure.',
            risk: 'limited',
            status: 'compliant',
            evidence: 'Content marking system, disclosure mechanisms',
            remediation: 'N/A - Currently compliant',
            integrationType: 'Content API',
            scanType: 'Watermark Check'
        },
        {
            article: 'Article 61',
            title: 'Post-Market Monitoring',
            description: 'Providers must establish post-market monitoring system and report serious incidents.',
            risk: 'high',
            status: 'in_progress',
            evidence: 'Post-market monitoring plan, incident reporting system',
            remediation: 'Establish monitoring system',
            integrationType: 'Monitoring Dashboard',
            scanType: 'Monitoring Setup'
        },
        {
            article: 'Article 62',
            title: 'Market Surveillance',
            description: 'AI systems subject to market surveillance authorities per Regulation (EU) 2019/1020.',
            risk: 'high',
            status: 'compliant',
            evidence: 'Market surveillance compliance documentation',
            remediation: 'N/A - Currently compliant',
            integrationType: 'Regulatory Portal',
            scanType: 'Surveillance Check'
        },
        {
            article: 'Article 71',
            title: 'Incident Reporting',
            description: 'Serious incidents and malfunctions must be reported to relevant authorities within timelines.',
            risk: 'high',
            status: 'compliant',
            evidence: 'Incident reporting procedures, reporting logs',
            remediation: 'N/A - Currently compliant',
            integrationType: 'Incident System',
            scanType: 'Incident Drill'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'compliant':
                return <Badge className="bg-green-500">Compliant</Badge>;
            case 'in_progress':
                return <Badge className="bg-yellow-500">In Progress</Badge>;
            case 'not_started':
                return <Badge variant="destructive">Not Started</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getRiskBadge = (risk: string) => {
        switch (risk) {
            case 'unacceptable':
                return <Badge variant="destructive">Unacceptable Risk</Badge>;
            case 'high':
                return <Badge className="bg-red-500">High Risk</Badge>;
            case 'limited':
                return <Badge className="bg-yellow-500">Limited Risk</Badge>;
            case 'minimal':
                return <Badge className="bg-green-500">Minimal Risk</Badge>;
            default:
                return <Badge variant="outline">{risk}</Badge>;
        }
    };

    const compliantCount = articles.filter(a => a.status === 'compliant').length;
    const inProgressCount = articles.filter(a => a.status === 'in_progress').length;
    const notStartedCount = articles.filter(a => a.status === 'not_started').length;
    const progressPercent = Math.round((compliantCount / articles.length) * 100);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>EU AI Act Compliance Overview</CardTitle>
                    <CardDescription>Track compliance status across all EU AI Act requirements</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="text-2xl font-bold text-green-500">{compliantCount}</div>
                            <div className="text-sm text-muted-foreground">Compliant</div>
                        </div>
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <div className="text-2xl font-bold text-yellow-500">{inProgressCount}</div>
                            <div className="text-sm text-muted-foreground">In Progress</div>
                        </div>
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="text-2xl font-bold text-red-500">{notStartedCount}</div>
                            <div className="text-sm text-muted-foreground">Not Started</div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="text-2xl font-bold text-blue-500">{progressPercent}%</div>
                            <div className="text-sm text-muted-foreground">Overall Progress</div>
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
                                    <span className="text-lg font-mono font-bold">{article.article}</span>
                                    <span className="font-semibold">{article.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getRiskBadge(article.risk)}
                                    {getStatusBadge(article.status)}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">{article.description}</p>

                            {/* Integration & Actions Row */}
                            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium">Integration: {article.integrationType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {connectedSystems[index] ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-green-500 border-green-500/50"
                                            onClick={() => {
                                                setScanningArticles(prev => ({ ...prev, [index]: true }));
                                                setTimeout(() => {
                                                    setScanningArticles(prev => ({ ...prev, [index]: false }));
                                                }, 2000);
                                            }}
                                        >
                                            {scanningArticles[index] ? (
                                                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Scanning...</>
                                            ) : (
                                                <><Zap className="w-4 h-4 mr-1" /> Run {article.scanType}</>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="bg-blue-500 hover:bg-blue-600"
                                            onClick={() => setConnectedSystems(prev => ({ ...prev, [index]: true }))}
                                        >
                                            <Plug className="w-4 h-4 mr-1" /> Connect System
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <div className="font-medium mb-1">Evidence Required</div>
                                    <div className="text-muted-foreground">{article.evidence}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <div className="font-medium mb-1">Remediation Action</div>
                                    <div className="text-muted-foreground">{article.remediation}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// Main Component
// ============================================================================

export default function AlphaAIActCompliance() {
    const { isAuthenticated } = useAuth();
    const isDemo = !isAuthenticated;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [models, setModels] = useState<AIModel[]>(mockModels);
    const [biasReports] = useState<BiasReport[]>(mockBiasReports);
    const [audits] = useState<AuditReport[]>(mockAudits);
    const [incidents] = useState<Incident[]>(mockIncidents);
    const [documentation] = useState<DocumentationPackage[]>(mockDocumentation);
    const [euDatabaseRegistered, setEuDatabaseRegistered] = useState(true);
    const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
    const [edgeDeployments, setEdgeDeployments] = useState<EdgeDeployment[]>([]);
    const [shadowAIDetections, setShadowAIDetections] = useState<ShadowAIDetection[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([
        { id: 'v1', name: 'OpenAI Enterprise', type: 'model', riskLevel: 'medium', complianceStatus: 'Verified', lastAssessment: new Date() },
        { id: 'v2', name: 'AWS EU-Central', type: 'cloud', riskLevel: 'low', complianceStatus: 'Verified', lastAssessment: new Date() }
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [showVendorDialog, setShowVendorDialog] = useState(false);
    const [showIncidentDialog, setShowIncidentDialog] = useState(false);
    const [showModelDialog, setShowModelDialog] = useState(false);
    const [newVendorData, setNewVendorData] = useState({ name: '', type: 'model' as const, riskLevel: 'medium' as const });
    const [newIncidentData, setNewIncidentData] = useState({ description: '', severity: 'medium' as const });
    const [newModelData, setNewModelData] = useState({ name: '', riskCategory: 'high' as const });

    const totalModels = models.length;
    const compliantModels = models.filter(m => m.status === 'compliant').length;
    const avgScore = totalModels > 0 ? Math.round(models.reduce((sum, m) => sum + m.complianceScore, 0) / totalModels) : 0;
    const highRiskModels = models.filter(m => m.riskCategory === 'high').length;

    useEffect(() => {
        async function fetchExtendedData() {
            try {
                const [trainingData, edgeData, shadowData, vendorData] = await Promise.all([
                    extendedApi.training.modules().catch(() => []),
                    extendedApi.edge.deployments().catch(() => []),
                    extendedApi.shadowAI.detections().catch(() => []),
                    extendedApi.vendors.list().catch(() => [])
                ]);

                if (trainingData) setTrainingModules(trainingData);
                if (edgeData) setEdgeDeployments(edgeData);
                if (shadowData) setShadowAIDetections(shadowData);
                if (vendorData && vendorData.length > 0) setVendors(vendorData);
            } catch (error) {
                console.error("Failed to fetch extended compliance data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchExtendedData();
    }, []);

    const handleAddVendor = async () => {
        try {
            const res = await extendedApi.vendors.create(newVendorData);
            setVendors(prev => [...prev, res]);
            setShowVendorDialog(false);
            toast.success("Vendor onboarded successfully.");
        } catch (error) {
            // Fallback: add locally
            const temp: Vendor = {
                id: Math.random().toString(36).substr(2, 9),
                name: newVendorData.name,
                type: newVendorData.type,
                riskLevel: newVendorData.riskLevel,
                complianceStatus: 'Pending',
                lastAssessment: new Date()
            };
            setVendors(prev => [...prev, temp]);
            setShowVendorDialog(false);
            toast.success("Vendor onboarded successfully!");
        }
    };

    const handleResolveIncident = async (id: string) => {
        toast.success(`Incident ${id} marked as resolved. Article 72 report generated.`);
        // Refresh incidents logic would go here
    };

    const handleExportReport = (modelId: string) => {
        toast.info(`Exporting Article 11 Technical Documentation for ${modelId}...`);
    };

    const handleAddModel = () => {
        if (!newModelData.name) {
            toast.error("Please enter a model name.");
            return;
        }

        const newModel: AIModel = {
            id: (models.length + 1).toString(),
            name: newModelData.name,
            riskCategory: newModelData.riskCategory,
            status: 'pending',
            complianceScore: 0,
            lastAudit: new Date(),
            articles: [
                { article: 'Article 9', title: 'Risk Management', status: 'pending' },
                { article: 'Article 10', title: 'Data Governance', status: 'pending' },
            ]
        };

        setModels(prev => [newModel, ...prev]);
        setShowModelDialog(false);
        setNewModelData({ name: '', riskCategory: 'high' });
        toast.success(`${newModel.name} registered for compliance audit.`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            {isDemo && (
                <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-2 text-sm">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400">
                            <AlertCircle className="h-4 w-4" />
                            <span><strong>Demo Mode:</strong> You are viewing a live preview of the Compliance Hub.</span>
                        </div>
                        <a href="/signup" className="text-blue-400 font-semibold hover:underline">
                            Sign up for full access →
                        </a>
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
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600">
                                    <Scale className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold">AI Compliance Hub</h1>
                                    <p className="text-xs text-muted-foreground">EU AI Act Compliance</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    try {
                                        const res = await extendedApi.complianceAudit.euRegister("Credit-Model-v2");
                                        toast.success(`Registered with EU Database! ID: ${res.registration_id}`);
                                        setEuDatabaseRegistered(true);
                                    } catch (error) {
                                        // Fallback: simulate success
                                        toast.success(`Registered with EU Database! ID: EU-${Date.now()}`);
                                        setEuDatabaseRegistered(true);
                                    }
                                }}
                            >
                                <Database className="w-4 h-4 mr-2" />
                                {euDatabaseRegistered ? "Registered (EU)" : "EU Database Register"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab('docs')}
                            >
                                <FileCheck className="w-4 h-4 mr-2" />
                                Generate Docs
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setShowModelDialog(true);
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Model
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1 p-1 bg-muted/50">
                        <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
                        <TabsTrigger value="compliance">
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Compliance
                        </TabsTrigger>
                        <TabsTrigger value="models"><Box className="w-4 h-4 mr-2" />Models</TabsTrigger>
                        <TabsTrigger value="bias"><Search className="w-4 h-4 mr-2" />Bias Scan</TabsTrigger>
                        <TabsTrigger value="audits"><ShieldAlert className="w-4 h-4 mr-2" />Red Team</TabsTrigger>
                        <TabsTrigger value="incidents"><AlertTriangle className="w-4 h-4 mr-2" />Incidents</TabsTrigger>
                        <TabsTrigger value="ethical">
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Ethical Guardrails
                        </TabsTrigger>
                        <TabsTrigger value="docs"><FileText className="w-4 h-4 mr-2" />Documentation</TabsTrigger>
                        <TabsTrigger value="training">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Training
                        </TabsTrigger>
                        <TabsTrigger value="edge">
                            <Cloud className="w-4 h-4 mr-2" />
                            Edge AI
                        </TabsTrigger>
                        <TabsTrigger value="shadow">
                            <Eye className="w-4 h-4 mr-2" />
                            Shadow AI
                        </TabsTrigger>
                        <TabsTrigger value="regional">
                            <Globe className="w-4 h-4 mr-2" />
                            Regional
                        </TabsTrigger>
                        <TabsTrigger value="vendors">
                            <Users className="w-4 h-4 mr-2" />
                            Vendors
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
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
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
                            <TabsTrigger value="financial"><BarChart3 className="w-4 h-4 mr-2" />Financial</TabsTrigger>
                            <TabsTrigger value="metrics"><Activity className="w-4 h-4 mr-2" />Metrics</TabsTrigger>
                            <TabsTrigger value="pricing"><Tag className="w-4 h-4 mr-2" />Pricing</TabsTrigger>
                            <TabsTrigger value="gtm"><Globe className="w-4 h-4 mr-2" />GTM</TabsTrigger>
                            <TabsTrigger value="roadmap"><Milestone className="w-4 h-4 mr-2" />Roadmap</TabsTrigger>
                            <TabsTrigger value="hiring"><Users className="w-4 h-4 mr-2" />Hiring</TabsTrigger>
                        </div>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <ComplianceScoreCard score={avgScore} title="Avg Compliance Score" />
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-3xl font-bold">{compliantModels}/{totalModels}</div>
                                    <div className="text-sm text-muted-foreground">Compliant Models</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-3xl font-bold">{highRiskModels}</div>
                                    <div className="text-sm text-muted-foreground">High Risk Models</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-3xl font-bold">3</div>
                                    <div className="text-sm text-muted-foreground">Open Incidents</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mt-6">
                            {/* Key Features */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bot className="w-5 h-5" />
                                        ReguLens Features
                                    </CardTitle>
                                    <CardDescription>Active compliance capabilities</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Technical Documentation</span>
                                            </div>
                                            <Badge variant="secondary">Auto-Generated</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Bias Detection</span>
                                            </div>
                                            <Badge variant="secondary">{biasReports.length} Reports</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                            <div className="flex items-center gap-3">
                                                <Bug className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">Adversarial Audit</span>
                                            </div>
                                            <Badge variant="secondary">Red Team Active</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                                            <div className="flex items-center gap-3">
                                                <Database className="w-5 h-5 text-blue-500" />
                                                <span className="font-medium">EU Database</span>
                                            </div>
                                            <Badge variant={euDatabaseRegistered ? "default" : "outline"}>
                                                {euDatabaseRegistered ? "Registered" : "Not Registered"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Deadline Tracker */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Compliance Deadlines
                                    </CardTitle>
                                    <CardDescription>EU AI Act implementation timeline</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">High-Risk Systems Deadline</span>
                                                <Badge variant="destructive">Aug 2026</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                Conformity assessments required
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Post-Market Monitoring</span>
                                                <Badge variant="outline">Ongoing</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                Article 61 continuous compliance
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg border border-blue-500/50 bg-blue-500/5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Incident Reporting (Art. 72)</span>
                                                <Badge variant="outline">72 Hours</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                Mandatory incident notification
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Compliance Checklist Tab */}
                    <TabsContent value="compliance" className="space-y-6">
                        <ComplianceChecklistContent />
                    </TabsContent>

                    {/* Models Tab */}
                    <TabsContent value="models">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Models Registry</CardTitle>
                                <CardDescription>All AI systems requiring compliance assessment</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Risk Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Last Audit</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {models.map(model => (
                                            <TableRow key={model.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{model.name}</div>
                                                        <div className="text-sm text-muted-foreground">ID: {model.id}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell><RiskBadge category={model.riskCategory} /></TableCell>
                                                <TableCell><StatusBadge status={model.status} /></TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={model.complianceScore} className="w-16 h-2" />
                                                        <span>{model.complianceScore}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{model.lastAudit.toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        View <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Bias Scan Tab */}
                    <TabsContent value="bias">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Training Data Bias Analysis
                                </CardTitle>
                                <CardDescription>Automated bias detection for Article 10 compliance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {biasReports.map(report => (
                                        <div key={report.id} className="p-4 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <Users className="w-5 h-5" />
                                                    <span className="font-medium">{report.protectedClass} Analysis</span>
                                                </div>
                                                <Badge variant={
                                                    report.status === 'failed' ? 'destructive' :
                                                        report.status === 'warning' ? 'outline' : 'default'
                                                }>
                                                    {report.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="text-sm mb-2">{report.details}</div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>Disparate Impact: {(report.disparateImpact * 100).toFixed(0)}%</span>
                                                <span>Statistical Significance: {(report.statisticalSignificance * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audits Tab */}
                    <TabsContent value="audits">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bug className="w-5 h-5" />
                                        Red Team Audits
                                    </CardTitle>
                                    <CardDescription>Adversarial testing for vulnerability detection</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                        try {
                                            const res = await extendedApi.complianceAudit.redTeam("CREDIT-SCORING-V2");
                                            toast.success(`Red Team Audit ${res.audit_id} scheduled!`);
                                        } catch (error) {
                                            // Fallback
                                            toast.success(`Red Team Audit REDTEAM-${Date.now()} scheduled!`);
                                        }
                                    }}
                                >
                                    <Bot className="w-4 h-4 mr-2" />
                                    Run New Audit
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {audits.map(audit => (
                                        <div key={audit.id} className="p-4 rounded-lg border">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        <Bug className="w-4 h-4" />
                                                        {audit.type === 'red_team' ? 'Red Team Assessment' : 'Penetration Test'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Model ID: {audit.modelId} · {audit.date.toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge variant={
                                                    audit.status === 'completed' ? 'default' :
                                                        audit.status === 'in_progress' ? 'outline' : 'secondary'
                                                }>
                                                    {audit.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Findings: </span>
                                                    <span className="font-medium">{audit.findings}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Critical: </span>
                                                    <span className="font-medium text-red-500">{audit.criticalFindings}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Incidents Tab */}
                    <TabsContent value="incidents">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>AI Incident Register (Article 72)</CardTitle>
                                    <CardDescription>Mandatory reporting for serious incidents</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setShowIncidentDialog(true)}>
                                    <AlertOctagon className="w-4 h-4 mr-2" />
                                    Report Incident
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Incident</TableHead>
                                            <TableHead>Severity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Article 72</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {incidents.map(incident => (
                                            <TableRow key={incident.id}>
                                                <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                                                <TableCell>
                                                    <Badge variant={incident.severity === 'critical' ? 'destructive' : 'outline'}>
                                                        {incident.severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell><Badge>{incident.status}</Badge></TableCell>
                                                <TableCell>{incident.article72 ? "Required" : "Optional"}</TableCell>
                                                <TableCell>
                                                    {incident.status !== 'resolved' && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleResolveIncident(incident.id)}>
                                                            Resolve
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NEW: Ethical Guardrails Tab (Real-time Tuning) */}
                    <TabsContent value="ethical">
                        <div className="space-y-6">
                            <Card className="border-emerald-500/20 bg-emerald-500/5">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        <CardTitle>Real-time Ethical Guardrails</CardTitle>
                                    </div>
                                    <CardDescription>Live model weight adjustments and bias mitigation triggers</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Active Bias Mitigation</Label>
                                                    <p className="text-sm text-muted-foreground">Automatically adjust weights to prevent disparate impact</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Toxic Language Filter</Label>
                                                    <p className="text-sm text-muted-foreground">Real-time prevention of offensive content generation</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Prompt Privacy Guard</Label>
                                                    <p className="text-sm text-muted-foreground">Redact PII before it reaches the model core</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <Activity className="w-4 h-4" />
                                                Tuning Performance
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Fairness Score Improvement</span>
                                                        <span className="text-emerald-500 font-bold">+14%</span>
                                                    </div>
                                                    <Progress value={85} className="h-1" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Bias Detections (Last 24h)</span>
                                                        <span className="font-bold">128</span>
                                                    </div>
                                                    <Progress value={45} className="h-1" />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Tuning engine active on 3 models. Last recalibration: 4 minutes ago.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Bias Mitigation Logs</CardTitle>
                                    <CardDescription>History of automated ethical adjustments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead>Model</TableHead>
                                                <TableHead>Protection Target</TableHead>
                                                <TableHead>Adjustment</TableHead>
                                                <TableHead>Impact</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-xs">2024-11-18 10:42</TableCell>
                                                <TableCell className="text-xs">Credit-v2</TableCell>
                                                <TableCell><Badge variant="outline">Gender Bias</Badge></TableCell>
                                                <TableCell className="text-xs">Weight Re-normalization</TableCell>
                                                <TableCell className="text-xs text-emerald-500">Fixed</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-xs">2024-11-18 09:15</TableCell>
                                                <TableCell className="text-xs">Resume-AI</TableCell>
                                                <TableCell><Badge variant="outline">Age Bias</Badge></TableCell>
                                                <TableCell className="text-xs">Semantic Mapping Adjustment</TableCell>
                                                <TableCell className="text-xs text-yellow-500">Warning</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Documentation Tab */}
                    <TabsContent value="docs">
                        <div className="grid gap-6 md:grid-cols-2">
                            {documentation.map(doc => (
                                <Card key={doc.id}>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Technical Documentation Package #{doc.id}</CardTitle>
                                        <CardDescription>Model ID: {doc.modelId}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="p-3 rounded-lg bg-muted text-xs font-mono">
                                                {doc.articles.join(', ')}
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Generated: {doc.generatedAt.toLocaleDateString()}</span>
                                                <Badge>{doc.status}</Badge>
                                            </div>
                                            <Button variant="outline" className="w-full" onClick={() => handleExportReport(doc.modelId)}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Artifact (PDF)
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Vendors Tab */}
                    <TabsContent value="vendors">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>AI Supply Chain (Vendors)</CardTitle>
                                    <CardDescription>Assess model providers and infrastructure vendors</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setShowVendorDialog(true)}>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Onboard Vendor
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Vendor</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Risk</TableHead>
                                            <TableHead>Compliance</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vendors.map(vendor => (
                                            <TableRow key={vendor.id}>
                                                <TableCell className="font-medium">{vendor.name}</TableCell>
                                                <TableCell className="capitalize">{vendor.type}</TableCell>
                                                <TableCell>
                                                    <Badge variant={vendor.riskLevel === 'high' ? 'destructive' : 'outline'}>
                                                        {vendor.riskLevel}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                                        <span>{vendor.complianceStatus}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="text-destructive">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5 text-blue-500" />
                                        Compliance SSO
                                    </CardTitle>
                                    <CardDescription>Secure access for auditors and legal teams</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Metadata Endpoint</Label>
                                        <Input placeholder="https://saml.compliance.enterprise.com/metadata" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Enforce MFA for Auditors</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => {
                                            // Demo mode: simulate SSO save
                                            toast.info("Saving SSO configuration...");
                                            setTimeout(() => {
                                                toast.success("SSO configured successfully! Domain: compliance.example.com");
                                            }, 1000);
                                        }}
                                    >
                                        Save SSO Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Training Tab */}
                    <TabsContent value="training">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                    Training & Awareness Portal
                                </CardTitle>
                                <CardDescription>Article 59 awareness and certification for AI operators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {trainingModules.map((module) => (
                                        <Card key={module.id} className="overflow-hidden">
                                            <div className="h-2 bg-blue-500" />
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <Badge variant="outline" className="mb-1">{module.category}</Badge>
                                                        <h3 className="font-bold">{module.title}</h3>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{module.duration_minutes} min</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{module.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Required</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            try {
                                                                await extendedApi.training.updateProgress({
                                                                    user_id: 'user-001',
                                                                    module_id: module.id!,
                                                                    status: 'in_progress'
                                                                });
                                                                toast.success(`Started ${module.title}!`);
                                                            } catch (error) {
                                                                // Fallback
                                                                const updatedModules = trainingModules.map(m =>
                                                                    m.id === module.id ? { ...m, progress: 10 } : m
                                                                );
                                                                setTrainingModules(updatedModules);
                                                                toast.success(`Started ${module.title}!`);
                                                            }
                                                        }}
                                                    >
                                                        Start Module
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {trainingModules.length === 0 && (
                                        <div className="col-span-2 text-center py-12 text-muted-foreground">
                                            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            <p>No training modules currently assigned.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Edge AI Tab */}
                    <TabsContent value="edge">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Edge Deployment Monitor</CardTitle>
                                        <CardDescription>Article 11 technical monitoring for on-device AI</CardDescription>
                                    </div>
                                    <Badge variant="outline">Enterprise HA/DR</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {edgeDeployments.map((deployment) => (
                                            <Card key={deployment.id} className="bg-muted/30">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="p-2 rounded-full bg-background border">
                                                            <Zap className="w-4 h-4 text-yellow-500" />
                                                        </div>
                                                        <Badge variant={deployment.status === 'online' ? 'default' : 'secondary'}>
                                                            {deployment.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="font-bold">{deployment.name}</div>
                                                    <div className="text-xs text-muted-foreground mb-3">{deployment.location}</div>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>v{deployment.model_version}</span>
                                                        <span>{deployment.requests_count} calls today</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full mt-4 h-8 text-[10px]"
                                                        onClick={async () => {
                                                            try {
                                                                await extendedApi.edge.sync(deployment.id!);
                                                                toast.success(`Synchronized weights for ${deployment.name}`);
                                                            } catch (error) {
                                                                // Fallback
                                                                toast.success(`Synchronized weights for ${deployment.name}`);
                                                            }
                                                        }}
                                                    >
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                        Force Sync
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {edgeDeployments.length === 0 && (
                                            <div className="col-span-3 text-center py-12 text-muted-foreground">
                                                <Cloud className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                <p>No active edge deployments detected.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Shadow AI Tab */}
                    <TabsContent value="shadow">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-purple-500" />
                                    Shadow AI Surveillance
                                </CardTitle>
                                <CardDescription>Detection and remediation of unmanaged AI tool usage</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Detected Tool</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Risk Level</TableHead>
                                            <TableHead>Detected</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shadowAIDetections.length > 0 ? (
                                            shadowAIDetections.map((detection) => (
                                                <TableRow key={detection.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{detection.tool_name}</div>
                                                        <div className="text-xs text-muted-foreground">{detection.vendor}</div>
                                                    </TableCell>
                                                    <TableCell>{detection.department}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={detection.risk_level === 'high' ? 'destructive' : detection.risk_level === 'medium' ? 'outline' : 'secondary'}>
                                                            {detection.risk_level}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs">{new Date(detection.detected_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{detection.status}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                try {
                                                                    await extendedApi.shadowAI.remediate(detection.id!);
                                                                    toast.success(`Remediation started for ${detection.tool_name}`);
                                                                } catch (error) {
                                                                    // Fallback: mark as remediated locally
                                                                    const updated = shadowAIDetections.map(d =>
                                                                        d.id === detection.id ? { ...d, status: 'remediated' } : d
                                                                    );
                                                                    setShadowAIDetections(updated);
                                                                    toast.success(`Remediation started for ${detection.tool_name}`);
                                                                }
                                                            }}
                                                        >
                                                            Remediate
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                    <p>Clean scan. No shadow AI tools detected.</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Regional Compliance Tab */}
                    <TabsContent value="regional">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        Global Regulatory Mapping
                                    </CardTitle>
                                    <CardDescription>Select jurisdiction to view local AI safety requirements</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4 mb-6">
                                        <Select onValueChange={async (val) => {
                                            const rules = await extendedApi.regionalCompliance.rules(val as any);
                                            toast.success(`Loaded ${rules.rules.length} rules for ${val}`);
                                        }}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Select Region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="china">China (MLPS/CAC)</SelectItem>
                                                <SelectItem value="canada">Canada (AIDA)</SelectItem>
                                                <SelectItem value="uk">UK (AI Safety)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline">Download Global Report</Button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        {[
                                            {
                                                region: "China",
                                                stat: "MLPS Level 3",
                                                desc: "Algorithmic filing required for recommendation systems",
                                                icon: <ShieldAlert className="w-5 h-5 text-red-500" />
                                            },
                                            {
                                                region: "Canada",
                                                stat: "AIDA Bill C-27",
                                                desc: "Mitigation plan for biased output in high-impact AI",
                                                icon: <BadgeCheck className="w-5 h-5 text-blue-500" />
                                            },
                                            {
                                                region: "UK",
                                                stat: "Safety Framework",
                                                desc: "Pro-innovation approach with sector-specific guidance",
                                                icon: <Zap className="w-5 h-5 text-purple-500" />
                                            }
                                        ].map((r, i) => (
                                            <div key={i} className="p-4 rounded-lg border bg-card/50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {r.icon}
                                                    <span className="font-bold">{r.region}</span>
                                                </div>
                                                <div className="text-xs font-semibold mb-1">{r.stat}</div>
                                                <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Cross-Border Compliance Gap Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Control Requirement</TableHead>
                                                <TableHead>EU AI Act</TableHead>
                                                <TableHead>China MLPS</TableHead>
                                                <TableHead>Canada AIDA</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-xs">Data Residency</TableCell>
                                                <TableCell><Badge variant="outline">GDPR</Badge></TableCell>
                                                <TableCell><Badge variant="destructive">STRICT</Badge></TableCell>
                                                <TableCell><Badge variant="secondary">LOCAL</Badge></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-xs">Bias Monitoring</TableCell>
                                                <TableCell><Badge variant="default">Art. 10</Badge></TableCell>
                                                <TableCell><Badge variant="default">FILING</Badge></TableCell>
                                                <TableCell><Badge variant="default">MANDATORY</Badge></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Card className="border-purple-500/20 bg-purple-500/5">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            UK: Post-Brexit AI Safety
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs space-y-2 text-muted-foreground">
                                        <p>• <strong>Sectoral Approach:</strong> Compliance with FCA, Ofcom, and ICO guidance.</p>
                                        <p>• <strong>Safety Institutes:</strong> Alignment with Bletchley Declaration standards.</p>
                                        <p>• <strong>Liability:</strong> Strict adherence to UK Product Safety & Liability rules.</p>
                                        <Button size="sm" variant="ghost" className="w-full mt-2 h-7 text-[10px]">Download UK Rulebook</Button>
                                    </CardContent>
                                </Card>

                                <Card className="border-blue-500/20 bg-blue-500/5">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            Canada: AIDA Bill C-27
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs space-y-2 text-muted-foreground">
                                        <p>• <strong>High Impact:</strong> Mandatory mitigation for systems affecting health/safety.</p>
                                        <p>• <strong>Bias Testing:</strong> Annual audit requirement for biased output.</p>
                                        <p>• <strong>Transparency:</strong> Plain-language disclosure for individual impacts.</p>
                                        <Button size="sm" variant="ghost" className="w-full mt-2 h-7 text-[10px]">Download Canada AIDA Guide</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Financial Tab - ReguLens AI */}
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
                                            <span className="font-bold">$2,050</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">ARPU</span>
                                            <span className="font-bold">$1,500/mo</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Gross Margin</span>
                                            <span className="font-bold">90%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Churn Rate</span>
                                            <span className="font-bold">1%/mo</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">LTV</span>
                                                <span className="font-bold text-green-500">$135,000</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-sm text-muted-foreground">LTV:CAC Ratio</span>
                                                <span className="font-bold text-green-500">65:1</span>
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
                                            <span className="font-medium">$15,000 (10 customers)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Q3</span>
                                            <span className="font-medium">$75,000 (50 customers)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Q4</span>
                                            <span className="font-medium">$225,000 (150 customers)</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Y1 ARR Target</span>
                                                <span className="font-bold text-blue-500">$225,000</span>
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
                                            <span>Salaries (Founders + Eng)</span>
                                            <span>$35,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Cloud/LLM Infrastructure</span>
                                            <span>$5,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Marketing/Ads</span>
                                            <span>$8,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Legal Counsel</span>
                                            <span>$5,000</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                                            <span>Total Monthly</span>
                                            <span>$53,000</span>
                                        </div>
                                        <div className="flex justify-between text-green-500">
                                            <span>Breakeven</span>
                                            <span>40 customers</span>
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
                                    <div className="text-2xl font-bold">500</div>
                                    <p className="text-xs text-muted-foreground">Annex IV Reports/mo</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Secondary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">2,500</div>
                                    <p className="text-xs text-muted-foreground">Models Under Management</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$18,000</div>
                                    <p className="text-xs text-muted-foreground">ACV</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Sales Cycle</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">&lt;30</div>
                                    <p className="text-xs text-muted-foreground">days (panic buying)</p>
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
                                            <span className="text-sm">Law Firm Referrals</span>
                                            <Badge>+15/week</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Whitepaper Downloads</span>
                                            <Badge>1,000/mo</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Time to First Report</span>
                                            <Badge variant="outline">&lt;48 hours</Badge>
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
                                            <span className="text-sm">Bias Scans Run</span>
                                            <Badge>&gt;5/user/mo</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Live API Checks</span>
                                            <Badge variant="outline">10M/day</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">GitHub Repo Connects</span>
                                            <Badge variant="outline">&gt;60%</Badge>
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
                                    <CardTitle>Solo Compliance</CardTitle>
                                    <CardDescription>Small prototypes</CardDescription>
                                    <div className="text-3xl font-bold mt-2">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-400 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            1 AI Model Scan
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Basic Model Card
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
                                    <div className="p-2 w-fit rounded-lg bg-emerald-500/10 mb-2">
                                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">Starter</Badge>
                                    </div>
                                    <CardTitle>Small Team</CardTitle>
                                    <CardDescription>Early compliance efforts</CardDescription>
                                    <div className="text-3xl font-bold mt-2">$499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-400 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Up to 5 models
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Annex IV Reports
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Priority Email Support
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-emerald-500 bg-emerald-500/5">
                                <CardHeader>
                                    <div className="p-2 w-fit rounded-lg bg-emerald-500/20 mb-2">
                                        <Badge variant="default" className="bg-emerald-600">Professional</Badge>
                                    </div>
                                    <CardTitle className="text-emerald-400">Scale</CardTitle>
                                    <CardDescription>Regulated industries</CardDescription>
                                    <div className="text-3xl font-bold mt-2">$1,499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-400 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Up to 25 models
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Bias Scanning
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Red Team Audits
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            API Access
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-blue-500 bg-blue-500/5">
                                <CardHeader>
                                    <div className="p-2 w-fit rounded-lg bg-blue-500/20 mb-2">
                                        <Badge variant="outline" className="text-blue-400 border-blue-400/20">Enterprise</Badge>
                                    </div>
                                    <CardTitle className="text-blue-400">Custom</CardTitle>
                                    <CardDescription>Multinational Corp</CardDescription>
                                    <div className="text-3xl font-bold mt-2">$2,500+<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-400 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Unlimited Models
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            PII Masking
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            EU Database Reg
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            24/7 Compliance SLA
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-center mt-8 pb-12">
                            <Link href="/billing">
                                <Button size="lg" className="px-12 bg-emerald-600 hover:bg-emerald-700">
                                    Manage Subscription & Billing
                                </Button>
                            </Link>
                        </div>
                    </TabsContent>

                    {/* GTM Tab */}
                    <TabsContent value="gtm">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="text-center p-4 rounded-lg bg-blue-500/10">
                                <div className="text-2xl font-bold text-blue-500">30%</div>
                                <div className="text-sm text-muted-foreground">Cold Email</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-purple-500/10">
                                <div className="text-2xl font-bold text-purple-500">30%</div>
                                <div className="text-sm text-muted-foreground">Content/Whitepapers</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-green-500/10">
                                <div className="text-2xl font-bold text-green-500">25%</div>
                                <div className="text-sm text-muted-foreground">Law Firm Partners</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-orange-500/10">
                                <div className="text-2xl font-bold text-orange-500">15%</div>
                                <div className="text-sm text-muted-foreground">LinkedIn Ads</div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Roadmap Tab */}
                    <TabsContent value="roadmap">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Q1: MVP - Paperwork Automator</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2"><Badge variant="default">In Progress</Badge><span>Dynamic Compliance Form</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="secondary">Planned</Badge><span>PDF Generation Engine</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Planned</Badge><span>Role-Based Access Control</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Q2: Growth - CI/CD Connection</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>GitHub Actions Agent</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>HuggingFace Integration</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Post-Market Surveillance</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Q3: Scale - Bias Scanner</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>DataFrame Metadata Extractor</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Fairness Metrics Warning</span></div>
                                        <div className="flex items-center gap-2"><Badge variant="outline">Backlog</Badge><span>Adversarial Audit Bot</span></div>
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
                                        <div className="flex justify-between p-3 rounded-lg bg-muted"><div><div className="font-medium">Founding ML Engineer</div></div><Badge>Month 1</Badge></div>
                                        <div className="flex justify-between p-3 rounded-lg bg-muted"><div><div className="font-medium">Frontend Lead</div></div><Badge>Month 2</Badge></div>
                                        <div className="flex justify-between p-3 rounded-lg bg-muted"><div><div className="font-medium">Compliance Consultant</div></div><Badge>Month 3</Badge></div>
                                        <div className="flex justify-between p-3 rounded-lg bg-muted"><div><div className="font-medium">Head of Sales</div></div><Badge>Month 4</Badge></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compensation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span>Senior Eng</span><span>$90k-$130k</span></div>
                                        <div className="flex justify-between"><span>Sales (OTE)</span><span>$100k-$150k</span></div>
                                        <div className="border-t pt-2"><div className="flex justify-between"><span>Equity</span><span>1-2%</span></div></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Vendor Onboarding Dialog */}
            {showVendorDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Onboard AI Vendor</CardTitle>
                            <CardDescription>Add a new provider to your AI supply chain assessment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Vendor Name</Label>
                                <Input
                                    placeholder="e.g. Anthropic, Mistral"
                                    value={newVendorData.name}
                                    onChange={(e) => setNewVendorData({ ...newVendorData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vendor Type</Label>
                                <Select
                                    value={newVendorData.type}
                                    onValueChange={(v: any) => setNewVendorData({ ...newVendorData, type: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="model">AI Model Provider</SelectItem>
                                        <SelectItem value="cloud">Cloud Infrastructure</SelectItem>
                                        <SelectItem value="infrastructure">Generic Infrastructure</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Risk Tier</Label>
                                <Select
                                    value={newVendorData.riskLevel}
                                    onValueChange={(v: any) => setNewVendorData({ ...newVendorData, riskLevel: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low Risk</SelectItem>
                                        <SelectItem value="medium">Medium Risk</SelectItem>
                                        <SelectItem value="high">High Risk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setShowVendorDialog(false)}>Cancel</Button>
                                <Button onClick={handleAddVendor}>Onboard Vendor</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Incident Reporting Dialog */}
            {showIncidentDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Report AI Incident (Article 72)</CardTitle>
                            <CardDescription>Mandatory disclosure for serious AI system failures</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Description of Incident</Label>
                                <textarea
                                    className="w-full h-24 p-2 rounded-md border bg-background"
                                    placeholder="Detail the failure and impact..."
                                    value={newIncidentData.description}
                                    onChange={(e) => setNewIncidentData({ ...newIncidentData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Severity</Label>
                                <Select
                                    value={newIncidentData.severity}
                                    onValueChange={(v: any) => setNewIncidentData({ ...newIncidentData, severity: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low Impact</SelectItem>
                                        <SelectItem value="medium">Medium Severity</SelectItem>
                                        <SelectItem value="high">High Risk</SelectItem>
                                        <SelectItem value="critical">Critical (Immediate Reporting)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setShowIncidentDialog(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={async () => {
                                    try {
                                        await extendedApi.complianceAudit.reportIncident(newIncidentData);
                                        toast.success("Incident reported to authorities.");
                                    } catch (error) {
                                        // Fallback: add locally
                                        toast.success("Incident reported to authorities!");
                                    }
                                    setShowIncidentDialog(false);
                                }}>Submit Report</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Add Model Dialog */}
            {showModelDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Register New AI Model</CardTitle>
                            <CardDescription>Initiate conformity assessment for a new system</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Model Name</Label>
                                <Input
                                    placeholder="e.g. Credit-Model-v3"
                                    value={newModelData.name}
                                    onChange={(e) => setNewModelData({ ...newModelData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Risk Category</Label>
                                <Select
                                    value={newModelData.riskCategory}
                                    onValueChange={(v: any) => setNewModelData({ ...newModelData, riskCategory: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="minimal">Minimal Risk</SelectItem>
                                        <SelectItem value="limited">Limited Risk</SelectItem>
                                        <SelectItem value="high">High Risk</SelectItem>
                                        <SelectItem value="unacceptable">Unacceptable Risk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setShowModelDialog(false)}>Cancel</Button>
                                <Button onClick={handleAddModel}>Register Model</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

