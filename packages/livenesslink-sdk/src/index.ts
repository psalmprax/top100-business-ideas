/**
 * LivenessLink Deepfake Defense SDK
 * Biometric Authentication & Fraud Prevention
 *
 * @package @livenesslink/sdk
 * @version 1.0.0
 */

import axios, { AxiosInstance } from "axios";

// Types
export interface LivenessConfig {
  apiKey: string;
  endpoint?: string;
}

export interface LivenessSession {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}

export interface LivenessResult {
  sessionId: string;
  isLive: boolean;
  confidence: number;
  livenessScore: number;
  faceDetected: boolean;
  multipleFaces: boolean;
  spoofingDetected: boolean;
  details: LivenessDetails;
}

export interface LivenessDetails {
  eyeBlinkDetected: boolean;
  mouthMovementDetected: boolean;
  headRotationVerified: boolean;
  reflectionAnalysis: boolean;
  textureAnalysis: number;
}

export interface VerificationSession {
  id: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}

export interface VerificationResult {
  sessionId: string;
  userId: string;
  verified: boolean;
  confidence: number;
  matchScore: number;
  livenessPassed: boolean;
  documentVerified: boolean;
  details: VerificationDetails;
}

export interface VerificationDetails {
  faceMatchScore: number;
  documentAuthenticity: number;
  selfieMatchScore: number;
  expiryCheck: boolean;
  tamperCheck: boolean;
}

export interface BiometricTemplate {
  id: string;
  userId: string;
  type: "face" | "voice" | "iris";
  createdAt: Date;
  lastUsed?: Date;
}

export interface FraudAlert {
  id: string;
  sessionId: string;
  type: "deepfake" | "mask" | "replay" | "multiple-faces" | "unknown";
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  details: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalVerifications: number;
  successRate: number;
  fraudAttemptsDetected: number;
  averageConfidence: number;
  livenessPassRate: number;
}

/**
 * LivenessLinkClient
 * Main SDK client for interacting with Deepfake Defense
 */
export class LivenessLinkClient {
  private client: AxiosInstance;

  constructor(config: LivenessConfig) {
    const baseURL = config.endpoint || "https://api.livenesslink.dev";

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error(
          "[LivenessLink] API Error:",
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a new liveness session
   */
  async createLivenessSession(): Promise<LivenessSession> {
    const response = await this.client.post("/liveness/sessions");
    return response.data;
  }

  /**
   * Submit liveness proof (image/video)
   */
  async submitLivenessProof(
    sessionId: string,
    imageData: string | Blob
  ): Promise<LivenessResult> {
    const formData = new FormData();
    if (typeof imageData === "string") {
      formData.append("image", imageData);
    } else {
      formData.append("image", imageData, "liveness.jpg");
    }

    const response = await this.client.post(
      `/liveness/sessions/${sessionId}/verify`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  /**
   * Get liveness session result
   */
  async getLivenessResult(sessionId: string): Promise<LivenessResult> {
    const response = await this.client.get(`/liveness/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Create verification session
   */
  async createVerificationSession(
    userId: string
  ): Promise<VerificationSession> {
    const response = await this.client.post("/verification/sessions", {
      userId,
    });
    return response.data;
  }

  /**
   * Submit verification data (selfie + document)
   */
  async submitVerification(
    sessionId: string,
    selfieData: string | Blob,
    documentData: string | Blob
  ): Promise<VerificationResult> {
    const formData = new FormData();
    if (typeof selfieData === "string") {
      formData.append("selfie", selfieData);
    } else {
      formData.append("selfie", selfieData, "selfie.jpg");
    }
    if (typeof documentData === "string") {
      formData.append("document", documentData);
    } else {
      formData.append("document", documentData, "document.jpg");
    }

    const response = await this.client.post(
      `/verification/sessions/${sessionId}/verify`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  /**
   * Get verification result
   */
  async getVerificationResult(sessionId: string): Promise<VerificationResult> {
    const response = await this.client.get(
      `/verification/sessions/${sessionId}`
    );
    return response.data;
  }

  /**
   * Enroll user biometric
   */
  async enrollBiometric(
    userId: string,
    biometricType: "face" | "voice" | "iris",
    biometricData: string | Blob
  ): Promise<BiometricTemplate> {
    const formData = new FormData();
    if (typeof biometricData === "string") {
      formData.append("biometric", biometricData);
    } else {
      formData.append("biometric", biometricData, "biometric.dat");
    }

    const response = await this.client.post(
      `/biometrics/${userId}/enroll`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        params: { type: biometricType },
      }
    );
    return response.data;
  }

  /**
   * Get user's biometric templates
   */
  async getBiometricTemplates(userId: string): Promise<BiometricTemplate[]> {
    const response = await this.client.get(`/biometrics/${userId}`);
    return response.data;
  }

  /**
   * Delete biometric template
   */
  async deleteBiometricTemplate(
    userId: string,
    templateId: string
  ): Promise<void> {
    await this.client.delete(`/biometrics/${userId}/${templateId}`);
  }

  /**
   * Get fraud alerts
   */
  async getFraudAlerts(options?: {
    startDate?: Date;
    endDate?: Date;
    severity?: string;
  }): Promise<FraudAlert[]> {
    const response = await this.client.get("/fraud/alerts", {
      params: options,
    });
    return response.data;
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await this.client.get("/analytics/summary");
    return response.data;
  }

  /**
   * Get verification history for user
   */
  async getVerificationHistory(userId: string): Promise<VerificationSession[]> {
    const response = await this.client.get(`/verification/history/${userId}`);
    return response.data;
  }

  /**
   * Webhook configuration
   */
  async configureWebhook(url: string, events: string[]): Promise<void> {
    await this.client.post("/webhooks", { url, events });
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId: string): Promise<{ success: boolean }> {
    const response = await this.client.post(`/webhooks/${webhookId}/test`);
    return response.data;
  }
}

// React Hook for easy integration
export function useLivenessLink(config: LivenessConfig) {
  const client = new LivenessLinkClient(config);

  return {
    client,
    createSession: () => client.createLivenessSession(),
    verify: (sessionId: string, image: string | Blob) =>
      client.submitLivenessProof(sessionId, image),
    getResult: (sessionId: string) => client.getLivenessResult(sessionId),
  };
}

// Convenience function to create client
export function createLivenessLinkClient(
  config: LivenessConfig
): LivenessLinkClient {
  return new LivenessLinkClient(config);
}

// Panic Word Detection exports
export {
  PanicWordDetector,
  createPanicDetector,
  type PanicDetectorConfig,
  type PanicEvent,
  type PanicCallback,
} from "./panic-word";

export default LivenessLinkClient;
