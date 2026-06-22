/**
 * Shared types for the Deepfake Defense system
 */

export type MediaType = "image" | "video" | "audio";
export type AnalysisResult = "real" | "fake" | "uncertain";

export interface DeepfakeAnalysis {
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

export interface VerificationSession {
  id: string;
  type: "video" | "voice" | "document";
  status: "pending" | "in_progress" | "verified" | "failed" | "blocked";
  userId: string;
  amount?: number;
  createdAt: Date;
  completedAt?: Date;
  microExpressionScore?: number;
  voiceLivenessScore?: number;
  biometricMatch?: boolean;
}

export interface ThreatAlert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  type:
    | "deepfake_detected"
    | "suspicious_activity"
    | "biometric_mismatch"
    | "duress_detected";
  description: string;
  source: string;
  timestamp: Date;
  status: "active" | "investigating" | "resolved";
}

export interface BiometricTemplate {
  id: string;
  userId: string;
  type: "face" | "voice" | "fingerprint";
  enrolledAt: Date;
  lastUsed: Date;
  cancellable: boolean;
  status?: "active" | "inactive" | "revoked";
}

export interface HardwareChallenge {
  id: string;
  user_id: string;
  challenge: string;
  status: "pending" | "verified" | "failed" | "expired";
}

export interface BiometricSignature {
  id: string;
  challenge_id: string;
  signature: string;
  verified: boolean;
}

export type CategoryType = "det" | "id" | "gov" | "infra" | "strat";

export type AuthStatus =
  | "idle"
  | "challenging"
  | "verified"
  | "failed"
  | "expired";

export interface DeepfakeRoiStats {
  manual_cost?: number;
  ai_cost?: number;
  savings?: number;
  total_scans?: number;
}

export interface DeepfakeBusinessStats {
  arr?: number;
  revenue_growth?: string;
  pipeline?: number;
  target_progress?: string;
  burn_infra?: number;
  burn_rd?: number;
  burn_compliance?: number;
  runway?: string;
  avg_deal?: number;
  sales_cycle?: string;
}

export interface DeepfakeStats {
  total_analyses?: number;
  threats_detected?: number;
  models_deployed?: number;
  avg_confidence?: number;
  analyses_trend?: number;
  threats_trend?: number;
  verification_rate?: number;
  verification_trend?: number;
  passive_detection_avg?: number;
  avg_latency?: string;
  roi?: DeepfakeRoiStats;
  business?: DeepfakeBusinessStats;
}

export interface CustomModel {
  id: string;
  name: string;
  version: string;
  type?: string;
  accuracy: number;
  status: string;
  lastTrained: Date;
}

export interface AdvancedResult {
  id?: string;
  summary?: string;
  confidence: number;
  liveness_score?: number;
  authenticity_score?: number;
  artifacts_detected?: number;
  liveness_verified?: boolean;
  bpm?: number;
  phoneme_sync?: string;
  pixel_status?: string;
  flags?: string[];
  forensic_score?: number;
}

export interface SsoConfig {
  provider: string;
  status: string;
  lastHandshake: string;
}

export interface RawBiometricResponse {
  id: string;
  label: string;
  biometric_type: string;
  hardware_id: string;
  enrolled_at: string;
  user_id?: string;
  last_used?: string;
  status?: string;
}

export interface RawAnalysisResponse {
  id: string;
  media_type: string;
  media_url: string;
  result: string;
  confidence: number;
  analysis_at: string;
  details?: Record<string, unknown>;
}

export interface RawThreatResponse {
  id: string;
  severity: string;
  type: string;
  description: string;
  source: string;
  timestamp: string;
  status: string;
}

export interface RawModelResponse {
  id: string;
  name: string;
  version: string;
  type?: string;
  accuracy: number;
  status: string;
  last_trained: string;
}
