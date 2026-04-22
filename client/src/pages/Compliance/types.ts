import {
  type TrainingModule,
  type EdgeDeployment,
  type ShadowAIDetection,
  type Vendor,
  type Incident,
  type BiasReport,
} from "@/lib/api";

export interface AIModel {
  id: string;
  name: string;
  riskCategory: "unacceptable" | "high" | "limited" | "minimal";
  status: "compliant" | "non_compliant" | "pending" | "review";
  complianceScore: number;
  lastAudit: Date;
  articles: ArticleStatus[];
  provider?: string;
  activeBiasMitigation?: boolean;
  endpointUrl?: string;
  toxicLanguageFilter?: boolean;
  promptPrivacyGuard?: boolean;
}

export interface ArticleStatus {
  article: string;
  title: string;
  status: "compliant" | "non_compliant" | "not_applicable" | "pending";
  evidence?: string;
}

export interface AuditReport {
  id: string;
  modelId: string;
  type: "red_team" | "penetration" | "vulnerability";
  status: "completed" | "in_progress" | "scheduled";
  findings: number;
  criticalFindings: number;
  date: Date;
}

export interface DocumentationPackage {
  id: string;
  modelId: string;
  articles: string[];
  generatedAt: Date;
  status: "draft" | "ready" | "submitted";
}

export type CategoryType = "gov" | "reg" | "tech" | "ops" | "infra" | "fin";

export {
  type TrainingModule,
  type EdgeDeployment,
  type ShadowAIDetection,
  type Vendor,
  type Incident,
};
