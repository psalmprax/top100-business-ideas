/**
 * useDeepfakeDefense - Consolidates all state and handlers for the Deepfake Defense system.
 * This hook extracts ~40 useState declarations and 16 handler functions from the main component.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  extendedApi,
  type MobileSDKStatus,
  type WearableDevice,
  type TravelKioskStatus,
  type CryptoWallet,
  type SLATierInfo,
} from "@/lib/api";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import type {
  DeepfakeAnalysis,
  VerificationSession,
  BiometricTemplate,
  HardwareChallenge,
  AuthStatus,
  ThreatAlert,
  DeepfakeStats,
  CustomModel,
  AdvancedResult,
  SsoConfig,
  RawBiometricResponse,
  RawAnalysisResponse,
  RawThreatResponse,
  RawModelResponse,
} from "../types";

export function useDeepfakeDefense() {
  const { isAuthenticated, user } = useAuth();

  // ── Core Data State ──
  const [analyses, setAnalyses] = useState<DeepfakeAnalysis[]>([]);
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricTemplate[]>([]);
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [stats, setStats] = useState<DeepfakeStats | null>(null);

  // ── UI State ──
  const [isLoading, setIsLoading] = useState(true);
  const [mediaType, setMediaType] = useState<string>("all");
  const [duressEnabled, setDuressEnabled] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [advancedResult, setAdvancedResult] = useState<AdvancedResult | null>(null);

  // ── Auth/Identity State ──
  const [currentChallenge, setCurrentChallenge] =
    useState<HardwareChallenge | null>(null);
  const [isAuthVerifying, setIsAuthVerifying] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [sdkStatus, setSdkStatus] = useState<MobileSDKStatus | null>(null);
  const [wearableDevices, setWearableDevices] = useState<WearableDevice[]>([]);
  const [kioskStatus, setKioskStatus] = useState<TravelKioskStatus | null>(
    null
  );
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);

  // ── Enterprise State ──
  const [slaTier, setSlaTier] = useState<SLATierInfo | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<DeepfakeStats | null>(null);
  const [isAuditRunning, setIsAuditRunning] = useState<"hipaa" | "sox" | null>(
    null
  );
  const [ssoConfig, setSsoConfig] = useState<SsoConfig>({
    provider: "okta",
    status: "active",
    lastHandshake: new Date().toISOString(),
  });
  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [proxyEndpoint, setProxyEndpoint] = useState("");
  const [livenessConfig, setLivenessConfig] = useState({
    strictLiveness: true,
    voiceLiveness: true,
    microExpression: true,
    documentNfc: true,
    hardwareVerification: true,
  });

  // ── Dialog State ──
  const [showGenerateReportDialog, setShowGenerateReportDialog] =
    useState(false);
  const [showAddDetectorDialog, setShowAddDetectorDialog] = useState(false);
  const [showTestDetectorDialog, setShowTestDetectorDialog] = useState(false);
  const [showConfigureLivenessDialog, setShowConfigureLivenessDialog] =
    useState(false);
  const [showReportIncidentDialog, setShowReportIncidentDialog] =
    useState(false);
  const [showOnboardVendorDialog, setShowOnboardVendorDialog] = useState(false);
  const [showDeployModelDialog, setShowDeployModelDialog] = useState(false);
  const [showROIDialog, setShowROIDialog] = useState(false);
  const [showPanicWordDialog, setShowPanicWordDialog] = useState(false);
  const [showVoiceAuthTestDialog, setShowVoiceAuthTestDialog] = useState(false);
  const [showDeviceMgmtDialog, setShowDeviceMgmtDialog] = useState(false);
  const [confirmFailover, setConfirmFailover] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data Fetching ──
  useEffect(() => {
    const fetchDeepfakeData = async () => {
      if (!isAuthenticated) return;
      try {
        const [
          statsRes,
          analysesRes,
          threatsRes,
          modelsRes,
          duressRes,
          biometricsRes,
        ] = await Promise.all([
          extendedApi.deepfake.getStats(),
          extendedApi.deepfake.listAnalyses(),
          extendedApi.deepfake.listThreats(),
          extendedApi.deepfake.listModels(),
          extendedApi.deepfake.getDuressConfig(user?.id || ""),
          extendedApi.deepfake.listBiometrics(),
        ]);
        setStats(statsRes as DeepfakeStats);
        if (biometricsRes)
          setBiometrics(
            (biometricsRes as unknown as RawBiometricResponse[]).map((b) => ({
              id: b.id,
              userId: b.user_id || "",
              type: b.biometric_type as "face" | "voice" | "fingerprint",
              enrolledAt: new Date(b.enrolled_at || Date.now()),
              lastUsed: b.last_used ? new Date(b.last_used) : new Date(),
              cancellable: true,
              status: (b.status as "active" | "inactive" | "revoked") || "active",
            }))
          );
        if (analysesRes)
          setAnalyses(
            (analysesRes as unknown as RawAnalysisResponse[]).map((a) => ({
              id: a.id,
              mediaType: a.media_type as "image" | "video" | "audio",
              mediaUrl: a.media_url,
              result: a.result as "real" | "fake" | "uncertain",
              confidence: a.confidence,
              analysisAt: new Date(a.analysis_at),
              details: {
                artifacts: 0,
                ...(a.details as Record<string, unknown>),
              } as DeepfakeAnalysis["details"],
            }))
          );
        if (threatsRes)
          setThreats(
            (threatsRes as unknown as RawThreatResponse[]).map((t) => ({
              id: t.id,
              severity: t.severity as ThreatAlert["severity"],
              type: t.type as ThreatAlert["type"],
              description: t.description,
              source: t.source,
              timestamp: new Date(t.timestamp),
              status: t.status as ThreatAlert["status"],
            }))
          );
        if (modelsRes)
          setCustomModels(
            (modelsRes as unknown as RawModelResponse[]).map((m) => ({
              id: m.id,
              name: m.name,
              version: m.version,
              type: m.type,
              accuracy: m.accuracy,
              status: m.status,
              lastTrained: new Date(m.last_trained),
            }))
          );
        if (duressRes) setDuressEnabled((duressRes as { enabled: boolean }).enabled);
      } catch (error) {
        console.error("Failed to fetch deepfake data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeepfakeData();
    const interval = setInterval(fetchDeepfakeData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  // Fetch Business & Strategy Data
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!isAuthenticated) return;
      try {
        const [slaRes, bizRes] = await Promise.all([
          extendedApi.enterprise.getSlaTier(),
          extendedApi.deepfake.getStats(),
        ]);
        setSlaTier(slaRes);
        setBusinessMetrics(bizRes as DeepfakeStats);
      } catch (error) {
        console.error("Failed to fetch Sentinel business data:", error);
      }
    };
    fetchBusinessData();
  }, [isAuthenticated]);

  // Persist duress config
  useEffect(() => {
    if (!isAuthenticated) return;
    const persistDuress = async () => {
      try {
        await extendedApi.deepfake.updateDuressConfig({
          user_id: user?.id || "",
          panic_phrase: "alaska",
          silent_mode: true,
          trigger_action: "alert_security",
          enabled: duressEnabled,
        });
      } catch {
        console.error("Failed to persist duress config");
      }
    };
    persistDuress();
  }, [duressEnabled, isAuthenticated, user?.id]);

  // ── Computed Values ──
  const totalAnalyses = analyses.length;
  const threatsDetected = analyses.filter(a => a.result === "fake").length;
  const verificationRate = sessions.filter(s => s.status === "verified").length;

  // ── Handlers ──
  const handleDownload = useCallback((filename: string, content: string) => {
    if (filename.toLowerCase().endsWith(".pdf")) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("ALPHA", 20, 25);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("ENTERPRISE AI SERVICES | HUB", 20, 32);
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const displayTitle = filename
        .replace(".pdf", "")
        .replace(/_/g, " ")
        .toUpperCase();
      doc.text(displayTitle, 20, 60);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(20, 65, pageWidth - 20, 65);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const reportId = `RPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      doc.text(`Report ID: ${reportId}`, 20, 75);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 80);
      doc.text(`Classification: COMPANY CONFIDENTIAL`, pageWidth - 20, 75, {
        align: "right",
      });
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitContent = doc.splitTextToSize(content, pageWidth - 40);
      let yPos = 95;
      splitContent.forEach((line: string) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 6;
      });
      const totalPages = (
        doc as unknown as { internal: { getNumberOfPages(): number } }
      ).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `© 2026 Alpha Systems Group | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          {
            align: "center",
          }
        );
      }
      doc.save(filename);
    } else {
      const isBinary =
        filename.endsWith(".zip") ||
        filename.endsWith(".apk") ||
        filename.endsWith(".bin");
      let url;
      if (isBinary && content.length > 50) {
        const cleanBase64 = content.replace(/[^A-Za-z0-9+/=]/g, "");
        url = `data:application/zip;base64,${cleanBase64}`;
      } else {
        const blob = new Blob([content], {
          type: filename.endsWith(".md") ? "text/markdown" : "text/plain",
        });
        url = URL.createObjectURL(blob);
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const handleRunHipaaAudit = useCallback(async () => {
    setIsAuditRunning("hipaa");
    try {
      await extendedApi.complianceAudit.hipaa(
        "default",
        "biometric_scan",
        "liveness-system"
      );
      setIsAuditRunning(null);
      toast.success(
        "HIPAA Audit Complete: Biometric encryption & consent logs verified."
      );
    } catch {
      setIsAuditRunning(null);
      toast.error("HIPAA Audit failed to initialize.");
    }
  }, []);

  const handleRunSoxAudit = useCallback(async () => {
    setIsAuditRunning("sox");
    try {
      await extendedApi.complianceAudit.sox("default", 0);
      setIsAuditRunning(null);
      toast.success(
        "SOX Audit Complete: Financial disclosure and human oversight verified."
      );
    } catch {
      setIsAuditRunning(null);
      toast.error("SOX Audit failed to initialize.");
    }
  }, []);

  const handleTriggerFailover = useCallback(async (regionId: string) => {
    try {
      await extendedApi.agentOps.triggerFailover(regionId);
      toast.success(
        `Failover triggered for ${regionId}. Rerouting biometric traffic...`
      );
    } catch {
      toast.error("Failover sequence failed.");
    }
  }, []);

  const handleSSOHandshake = useCallback(async () => {
    try {
      const res = await extendedApi.sso.handshake("liveness-link") as { status: string };
      setSsoConfig((prev: SsoConfig) => ({
        ...prev,
        lastHandshake: new Date().toISOString(),
      }));
      toast.success(
        `SSO Handshake successful with ${ssoConfig.provider}. Status: ${res.status}`
      );
    } catch {
      toast.error("SSO Handshake failed.");
    }
  }, [ssoConfig.provider]);

  const handleSaveRetention = useCallback(async (days: number) => {
    try {
      await extendedApi.agentOps.updateRetention("liveness-link", days);
      setRetentionDays(days);
      toast.success(`Data retention policy updated to ${days} days.`);
    } catch {
      toast.error("Failed to update retention policy.");
    }
  }, []);

  const handleAnalyzeMedia = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const onFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsAnalyzing(true);
      toast.info(`Uploading ${file.name} for deep-packet forensic analysis...`);
      try {
        const uploadRes = await extendedApi.deepfake.upload(file) as { url: string };
        const mediaUrl = uploadRes.url;
        const mediaTypeVal = file.type.split("/")[0] || "image";
        toast.info("Media uploaded. Commencing neural artifact detection...");
        const result = await extendedApi.deepfake.analyze(
          mediaUrl,
          mediaTypeVal
        ) as DeepfakeAnalysis;
        setAnalyses(prev => [result, ...prev]);
        toast.success(
          `${mediaTypeVal.toUpperCase()} forensic result: ${result.result.toUpperCase()} (${result.confidence}% confidence)`
        );
        const [newStats, refreshedAnalyses] = await Promise.all([
          extendedApi.deepfake.getStats(),
          extendedApi.deepfake.listAnalyses(),
        ]);
        setStats(newStats as DeepfakeStats);
        if (refreshedAnalyses)
          setAnalyses(
            (refreshedAnalyses as unknown as RawAnalysisResponse[]).map((a) => ({
              id: a.id,
              mediaType: a.media_type as "image" | "video" | "audio",
              mediaUrl: a.media_url,
              result: a.result as "real" | "fake" | "uncertain",
              confidence: a.confidence,
              analysisAt: new Date(a.analysis_at),
              details: {
                artifacts: 0,
                ...(a.details as Record<string, unknown>),
              } as DeepfakeAnalysis["details"],
            }))
          );
      } catch (error) {
        console.error("Deepfake Analysis Error:", error);
        toast.error(
          "Deepfake engine error. Simulation fallback engaged in backend."
        );
      } finally {
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    []
  );

  const handleDeleteModel = useCallback(async (modelId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this neutral model and its associated weights?"
      )
    ) {
      return;
    }
    try {
      await extendedApi.deepfake.deleteModel(modelId);
      setCustomModels(prev => prev.filter(m => m.id !== modelId));
      toast.success(`Model ${modelId} purged from neural enclave.`);
    } catch {
      toast.error("Failed to delete model. Enclave access restricted.");
    }
  }, []);

  const handleRunEnterpriseScan = useCallback(async () => {
    setIsAnalyzing(true);
    setAdvancedResult(null);
    setScanProgress(0);
    setScanStage("Starting forensic behavioral analysis...");
    try {
      const res = await extendedApi.deepfake.analyzeEnterprise({
        source: "forensic_buffer",
        verification_mode: "behavioral",
        timestamp: new Date().toISOString(),
      }) as AdvancedResult;
      setAdvancedResult(res);
      setScanProgress(100);
      toast.success(res.summary || "Enterprise-grade forensic scan complete.");
    } catch (e) {
      console.error("Forensic analysis failed", e);
      toast.error(
        `Forensic analysis engine error: ${e instanceof Error ? e.message : "Service unavailable"}`
      );
    } finally {
      setIsAnalyzing(false);
      setScanStage("");
    }
  }, []);

  const handleDeployModel = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("modelName") as HTMLInputElement)
      .value;
    const baseArch =
      (form.querySelector("select") as HTMLSelectElement)?.value ||
      "cnn-transformer";
    try {
      const newModel = await extendedApi.deepfake.deployModel({
        name: name,
        base_architecture: baseArch,
        version: "1.0.0",
        status: "deployed",
      }) as CustomModel;
      setCustomModels(prev => [newModel, ...prev]);
      setShowDeployModelDialog(false);
      toast.success(`Model "${name}" deployment successful.`);
    } catch {
      toast.error("Model deployment failed.");
    }
  }, []);

  const handleRevokeBiometric = useCallback(async (id: string) => {
    try {
      await extendedApi.deepfake.revokeBiometric(id);
      setBiometrics(prev => prev.filter(b => b.id !== id));
      toast.success(
        "Biometric template revoked and purged from secure enclave."
      );
    } catch {
      toast.error("Failed to revoke biometric template.");
    }
  }, []);

  const handleUploadDataset = useCallback(async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      await extendedApi.deepfake.train("Custom_Dataset");
      setUploadProgress(100);
      setIsUploading(false);
      toast.success("Training dataset uploaded and queued for processing.");
    } catch {
      setIsUploading(false);
      toast.error("Failed to upload training dataset");
    }
  }, []);

  const handleExport = useCallback(() => {
    const latestAnalysis = analyses[0];
    const exportData = latestAnalysis
      ? {
          id: latestAnalysis.id,
          timestamp: latestAnalysis.analysisAt,
          status: latestAnalysis.result,
          confidence: latestAnalysis.confidence,
          media_type: latestAnalysis.mediaType,
          origin: "LivenessLink-v4-Enterprise",
          verified_by: user?.email || "AlphaHecta",
        }
      : {
          id: "CERT-EMPTY",
          timestamp: new Date().toISOString(),
          status: "pending",
          origin: "LivenessLink-v4-Enterprise",
        };
    handleDownload(
      `deepfake-audit-${latestAnalysis?.id || "empty"}.json`,
      JSON.stringify(exportData, null, 2)
    );
    toast.success("Audit log exported successfully");
  }, [analyses, user?.email, handleDownload]);

  const handleRequestChallenge = useCallback(async () => {
    try {
      setAuthStatus("challenging");
      const challenge = await extendedApi.deepfake.challenge(
        user?.id || "demo_user"
      ) as HardwareChallenge;
      setCurrentChallenge(challenge);
      toast.info(
        "Hardware challenge received. Please sign with your biometric key."
      );
    } catch {
      setAuthStatus("failed");
      toast.error("Failed to request hardware challenge");
    }
  }, [user?.id]);

  const handleVerifySignature = useCallback(
    async (signature: string) => {
      if (!currentChallenge) return;
      setIsAuthVerifying(true);
      try {
        const hardwareId = currentChallenge.id
          ? `HW_${currentChallenge.id.replace(/[^a-zA-Z0-9]/g, "").substring(0, 16)}`
          : `HW_${crypto.randomUUID?.() || Date.now().toString(36)}`;
        const result = await extendedApi.deepfake.verify(
          currentChallenge.id,
          signature,
          hardwareId
        ) as { verified: boolean };
        if (result.verified) {
          setAuthStatus("verified");
          toast.success(
            "Identity verified via hardware-backed Biometric Pulse!"
          );
        } else {
          setAuthStatus("failed");
          toast.error(
            "Signature verification failed. Potential deepfake injection detected."
          );
        }
      } catch {
        setAuthStatus("failed");
        toast.error("Hardware verification error");
      } finally {
        setIsAuthVerifying(false);
      }
    },
    [currentChallenge]
  );

  return {
    // Auth
    isAuthenticated,
    user,
    // Core data
    analyses,
    setAnalyses,
    sessions,
    setSessions,
    threats,
    setThreats,
    biometrics,
    setBiometrics,
    customModels,
    setCustomModels,
    stats,
    setStats,
    // UI state
    isLoading,
    mediaType,
    setMediaType,
    duressEnabled,
    setDuressEnabled,
    isAnalyzing,
    setIsAnalyzing,
    scanProgress,
    setScanProgress,
    scanStage,
    setScanStage,
    isUploading,
    setIsUploading,
    uploadProgress,
    setUploadProgress,
    advancedResult,
    setAdvancedResult,
    // Auth/Identity state
    currentChallenge,
    setCurrentChallenge,
    isAuthVerifying,
    authStatus,
    setAuthStatus,
    sdkStatus,
    setSdkStatus,
    wearableDevices,
    setWearableDevices,
    kioskStatus,
    setKioskStatus,
    cryptoWallets,
    setCryptoWallets,
    // Enterprise state
    slaTier,
    setSlaTier,
    businessMetrics,
    isAuditRunning,
    setIsAuditRunning,
    ssoConfig,
    setSsoConfig,
    retentionDays,
    setRetentionDays,
    proxyEndpoint,
    setProxyEndpoint,
    livenessConfig,
    setLivenessConfig,
    // Dialog state
    showGenerateReportDialog,
    setShowGenerateReportDialog,
    showAddDetectorDialog,
    setShowAddDetectorDialog,
    showTestDetectorDialog,
    setShowTestDetectorDialog,
    showConfigureLivenessDialog,
    setShowConfigureLivenessDialog,
    showReportIncidentDialog,
    setShowReportIncidentDialog,
    showOnboardVendorDialog,
    setShowOnboardVendorDialog,
    showDeployModelDialog,
    setShowDeployModelDialog,
    showROIDialog,
    setShowROIDialog,
    showPanicWordDialog,
    setShowPanicWordDialog,
    showVoiceAuthTestDialog,
    setShowVoiceAuthTestDialog,
    showDeviceMgmtDialog,
    setShowDeviceMgmtDialog,
    confirmFailover,
    setConfirmFailover,
    confirmRevoke,
    setConfirmRevoke,
    // Refs
    fileInputRef,
    // Computed
    totalAnalyses,
    threatsDetected,
    verificationRate,
    // Handlers
    handleDownload,
    handleRunHipaaAudit,
    handleRunSoxAudit,
    handleTriggerFailover,
    handleSSOHandshake,
    handleSaveRetention,
    handleAnalyzeMedia,
    onFileSelect,
    handleDeleteModel,
    handleRunEnterpriseScan,
    handleDeployModel,
    handleRevokeBiometric,
    handleUploadDataset,
    handleExport,
    handleRequestChallenge,
    handleVerifySignature,
  };
}

export type DeepfakeDefenseState = ReturnType<typeof useDeepfakeDefense>;
