import { 
  ShieldCheck, 
  Scale, 
  Zap, 
  LayoutDashboard, 
  Cloud, 
  Briefcase,
  Activity,
  ShieldAlert,
  CheckCircle2,
  History,
  AlertOctagon,
  Settings,
  CheckSquare,
  Globe,
  FileText,
  FileDown,
  Box,
  Search,
  Eye,
  Users,
  BookOpen,
  Key,
  AlertTriangle,
  Calculator,
  TrendingUp
} from "lucide-react";
import { type CategoryType } from "./types";

export const initialModels = [];
export const initialBiasReports = [];
export const initialAudits = [];
export const initialIncidents = [];
export const initialDocumentation = [];

export const connectionTemplates: Record<string, string> = {
  ci_cd: JSON.stringify(
    {
      repository: "alpha-corp/credit-risk-v2",
      branch: "main",
      api_token: "YOUR_GITHUB_TOKEN_HERE",
      check_name: "compliance-validation-gate",
      trigger_on: ["push", "pull_request"],
    },
    null,
    2
  ),
  model_registry: JSON.stringify(
    {
      registry_url: "https://mlflow.alpha-internal.ai",
      model_name: "credit-scoring-plus",
      version: "2.4.1",
      api_key: "YOUR_MLFLOW_API_KEY_HERE",
    },
    null,
    2
  ),
  data_store: JSON.stringify(
    {
      provider: "s3",
      bucket: "training-data-compliance-v2",
      region: "eu-central-1",
      access_key: "YOUR_AWS_ACCESS_KEY_HERE",
      secret_key: "YOUR_AWS_SECRET_ACCESS_KEY_HERE",
      path: "datasets/v2/audited/",
    },
    null,
    2
  ),
  monitoring: JSON.stringify(
    {
      endpoint: "https://prometheus.internal:9090",
      metrics: ["accuracy", "f1_score", "drift_detected"],
      alert_threshold: 0.85,
      interval: "1h",
    },
    null,
    2
  ),
  eu_database: JSON.stringify(
    {
      organization_id: "EU-AI-92837",
      ec_operator_id: "EO-4451",
      cert_thumbprint: "0x82a8bf...928c",
    },
    null,
    2
  ),
  regulatory_portal: JSON.stringify(
    {
      portal_url: "https://compliance-portal.gov.eu",
      auth_method: "oauth2",
      client_id: "regulens-alpha-node",
    },
    null,
    2
  ),
  vector_db: JSON.stringify(
    {
      provider: "pinecone",
      environment: "us-east-1-aws",
      api_key: "YOUR_PINECONE_API_KEY_HERE",
      index_name: "compliance-knowledge-base",
    },
    null,
    2
  ),
  compute_cluster: JSON.stringify(
    {
      orchestrator: "kubernetes",
      endpoint: "https://k8s.alpha.ai:6443",
      namespace: "ai-workloads",
      ca_cert: "-----BEGIN CERTIFICATE-----\n...",
    },
    null,
    2
  ),
  identity_iam: JSON.stringify(
    {
      provider: "auth0",
      tenant_id: "alpha-ai-prod",
      client_id: "YOUR_AUTH0_CLIENT_ID_HERE",
      client_secret: "YOUR_AUTH0_CLIENT_SECRET_HERE",
    },
    null,
    2
  ),
  human_feedback: JSON.stringify(
    {
      platform: "scale_ai",
      project_id: "hitl-qa-v2",
      api_key: "YOUR_SCALE_AI_API_KEY_HERE",
      callback_url: "https://api.regu-lens.com/v1/callback/hitl",
    },
    null,
    2
  ),
  legal_repository: JSON.stringify(
    {
      url: "https://sharepoint.alpha.com/legal/ai-act",
      auth_type: "ms_graph",
      docs_path: "/compliance/2026/evidence/",
    },
    null,
    2
  ),
  cloud_infra: JSON.stringify(
    {
      provider: "aws",
      subscription_id: "7283-XXXX-9281",
      iam_role: "arn:aws:iam::123456789012:role/ComplianceAuditor",
      regions: ["us-east-1", "eu-west-1"],
      service_audit: ["S3", "SageMaker", "IAM"],
    },
    null,
    2
  ),
  ai_gateway: JSON.stringify(
    {
      provider: "openai",
      organization_id: "org-alpha-928",
      api_key: "sk-proj-xxxxxxxxxxxx",
      enforce_moderation: true,
      data_residency: "eu",
    },
    null,
    2
  ),
  data_lakehouse: JSON.stringify(
    {
      provider: "snowflake",
      account_url: "alpha-ai.snowflakecomputing.com",
      warehouse: "COMPLIANCE_WH",
      database: "AI_ACT_GOVERNANCE",
      role: "AUDITOR_ADMIN",
    },
    null,
    2
  ),
};

export const connectionHelp: Record<string, string> = {
  ci_cd: "Automate compliance gates within your development pipeline. Blocks non-compliant models from deployment.",
  model_registry: "Synchronize compliance status with your production model versioning system.",
  data_store: "Enable Article 10 Data Governance scans directly on your training and validation datasets.",
  monitoring: "Monitor real-time accuracy, bias, and drift metrics from production inference logs.",
  eu_database: "Direct integration with the official EU AI Act Central Database (Article 51 registration).",
  regulatory_portal: "Standardized handshake with regional or industry-specific regulatory reporting portals.",
  vector_db: "Audit RAG (Retrieval Augmented Generation) data lineage and knowledge base privacy.",
  compute_cluster: "Monitor resource allocation and hardware-level compliance for Large AI Models (Article 40).",
  identity_iam: "Enforce Article 15 requirements for authorized access and human-over-loop identity validation.",
  human_feedback: "Audit the Human-in-the-loop (HI-T-L) feedback cycle and labeling quality metrics.",
  legal_repository: "Centralized storage and discovery for legal evidence and conformity assessments.",
  cloud_infra: "Broad-spectrum auditing of cloud infrastructure (AWS/Azure/GCP) for resource hygiene and regionality.",
  ai_gateway: "Direct audit of Model-as-a-Service (MaaS) providers like OpenAI, Anthropic, or Vertex AI.",
  data_lakehouse: "Integrate with governed data platforms like Snowflake or Databricks for enterprise-wide data auditing.",
};

export const categories: {
  id: CategoryType;
  label: string;
  icon: any;
  description: string;
}[] = [
  { id: "gov", label: "Governance", icon: ShieldCheck, description: "Ethics, Risk & Audit" },
  { id: "reg", label: "Regulatory", icon: Scale, description: "EU AI Act & Mapping" },
  { id: "tech", label: "Technical", icon: Zap, description: "Model Scans & Edge" },
  { id: "ops", label: "Operations", icon: LayoutDashboard, description: "Vendors & Incidents" },
  { id: "infra", label: "Infrastructure", icon: Cloud, description: "Multi-Cloud & Health" },
  { id: "fin", label: "Finance", icon: Briefcase, description: "Budget & ROI" },
];

export const categoryTabs: Record<string, { value: string; label: string; icon: any }[]> = {
  gov: [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "monitoring", label: "Live Monitoring", icon: Activity },
    { value: "audits", label: "Red Team", icon: ShieldAlert },
    { value: "compliance-audits", label: "Enterprise Audits", icon: ShieldCheck },
    { value: "sla", label: "SLA Tiers", icon: CheckCircle2 },
    { value: "audit-trail", label: "Audit Trail", icon: History },
    { value: "risk", label: "Risk Assessment", icon: AlertOctagon },
    { value: "settings", label: "Settings", icon: Settings },
  ],
  reg: [
    { value: "compliance", label: "Compliance", icon: CheckSquare },
    { value: "regional", label: "Regional", icon: Globe },
    { value: "docs", label: "Documentation", icon: FileText },
    { value: "reports", label: "Reports", icon: FileDown },
  ],
  tech: [
    { value: "models", label: "Models", icon: Box },
    { value: "bias", label: "Bias Scan", icon: Search },
    { value: "edge", label: "Edge AI", icon: Cloud },
    { value: "shadow", label: "Shadow AI", icon: Eye },
  ],
  ops: [
    { value: "vendors", label: "Vendors", icon: Users },
    { value: "partner", label: "Partner Portal", icon: Globe },
    { value: "training", label: "Training", icon: BookOpen },
    { value: "identity", label: "Identity & Biometrics", icon: Key },
    { value: "incidents", label: "Incidents", icon: AlertTriangle },
  ],
  infra: [
    { value: "health", label: "Cloud Health", icon: Activity },
    { value: "remediation", label: "Self-Healing", icon: Zap },
    { value: "config", label: "Global Config", icon: Globe },
  ],
  fin: [
    { value: "budget", label: "Budget Rules", icon: Calculator },
    { value: "roi", label: "ROI Impact", icon: TrendingUp },
  ],
};
