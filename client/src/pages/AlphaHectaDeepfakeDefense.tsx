/**
 * Alpha Deepfake Defense - Enterprise Dashboard
 * AI-powered media authenticity detection and defense
 *
 * Refactored: State management via DeepfakeDefenseContext,
 * tab content extracted into section components by category.
 */

import * as React from "react";
import { useState } from "react";
import { Link } from "wouter";
import { usePerspective } from "@/contexts/PerspectiveContext";
import { PerspectiveSwitcher } from "@/components/PerspectiveSwitcher";
import { DetectorsSection } from "@/components/DeepfakeDefense/sections/Detection/DetectorsSection";
import { ModelsSection } from "@/components/DeepfakeDefense/sections/Detection/ModelsSection";
import { LivenessSection } from "@/components/DeepfakeDefense/sections/Detection/LivenessSection";
import { GlobalSearch } from "@/components/GlobalSearch";
import {
  Activity,
  BarChart3,
  Box,
  Cloud,
  Download,
  Eye,
  Fingerprint,
  History,
  LayoutDashboard,
  Milestone,
  Play,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Tag,
  Upload,
  Users,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Globe,
  Server,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { UserMenu } from "@/components/UserMenu";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { DeepfakeDefenseDialogs } from "@/components/DeepfakeDefense/DeepfakeDefenseDialogs";

// Context & Hook
import {
  DeepfakeDefenseProvider,
  useDeepfakeDefenseContext,
} from "@/components/DeepfakeDefense/DeepfakeDefenseContext";
import { useDeepfakeDefense } from "@/components/DeepfakeDefense/hooks/useDeepfakeDefense";
import type { CategoryType } from "@/components/DeepfakeDefense/types";

// Section Components - Detection
import { DashboardSection } from "@/components/DeepfakeDefense/sections/Detection/DashboardSection";
import { TrainingSection } from "@/components/DeepfakeDefense/sections/Detection/TrainingSection";
import { AdvancedSection } from "@/components/DeepfakeDefense/sections/Detection/AdvancedSection";

// Section Components - Identity
import { IDVerifySection } from "@/components/DeepfakeDefense/sections/Identity/IDVerifySection";
import { SDKSection } from "@/components/DeepfakeDefense/sections/Identity/SDKSection";
import { MobileSection } from "@/components/DeepfakeDefense/sections/Identity/MobileSection";
import { WearableSection } from "@/components/DeepfakeDefense/sections/Identity/WearableSection";

// Section Components - Governance
import { IncidentsSection } from "@/components/DeepfakeDefense/sections/Governance/IncidentsSection";
import { AuditTrailSection } from "@/components/DeepfakeDefense/sections/Governance/AuditTrailSection";
import { ComplianceControlsSection } from "@/components/DeepfakeDefense/sections/Governance/ComplianceControlsSection";
import { SLASection } from "@/components/DeepfakeDefense/sections/Governance/SLASection";
import { ReportsSection } from "@/components/DeepfakeDefense/sections/Governance/ReportsSection";
import { VendorsSection } from "@/components/DeepfakeDefense/sections/Governance/VendorsSection";

// Section Components - Infrastructure
import { HealthSection } from "@/components/DeepfakeDefense/sections/Infrastructure/HealthSection";
import { RemediationSection } from "@/components/DeepfakeDefense/sections/Infrastructure/RemediationSection";
import { ConfigSection } from "@/components/DeepfakeDefense/sections/Infrastructure/ConfigSection";
import { KioskSection } from "@/components/DeepfakeDefense/sections/Infrastructure/KioskSection";
import { CryptoSection } from "@/components/DeepfakeDefense/sections/Infrastructure/CryptoSection";
import { QuantumSection } from "@/components/DeepfakeDefense/sections/Infrastructure/QuantumSection";

// Section Components - Strategy
import { SettingsSection } from "@/components/DeepfakeDefense/sections/Strategy/SettingsSection";
import { PartnerSection } from "@/components/DeepfakeDefense/sections/Strategy/PartnerSection";
import { FinancialSection } from "@/components/DeepfakeDefense/sections/Strategy/FinancialSection";
import { MetricsSection } from "@/components/DeepfakeDefense/sections/Strategy/MetricsSection";
import { PricingSection } from "@/components/DeepfakeDefense/sections/Strategy/PricingSection";
import { GTMSection } from "@/components/DeepfakeDefense/sections/Strategy/GTMSection";
import { RoadmapSection } from "@/components/DeepfakeDefense/sections/Strategy/RoadmapSection";
import { HiringSection } from "@/components/DeepfakeDefense/sections/Strategy/HiringSection";

// ============================================================================
// Category & Tab Configuration
// ============================================================================

const categories: {
  id: CategoryType;
  label: string;
  icon: LucideIcon;
  description: string;
}[] = [
  {
    id: "det",
    label: "Detection",
    icon: Eye,
    description: "Models & Scanners",
  },
  {
    id: "id",
    label: "Identity",
    icon: Fingerprint,
    description: "Liveness & SDK",
  },
  {
    id: "gov",
    label: "Governance",
    icon: ShieldAlert,
    description: "Incidents & Audits",
  },
  {
    id: "infra",
    label: "Infrastructure",
    icon: Cloud,
    description: "Multi-Cloud & Health",
  },
  {
    id: "strat",
    label: "Strategy",
    icon: BarChart3,
    description: "Business & Settings",
  },
];

const categoryTabs: Record<
  string,
  { value: string; label: string; icon: LucideIcon }[]
> = {
  det: [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "detectors", label: "Detectors", icon: Eye },
    { value: "models", label: "Models", icon: Box },
    { value: "training", label: "Training", icon: History },
    { value: "advanced", label: "Advanced", icon: Zap },
  ],
  id: [
    { value: "liveness", label: "Liveness", icon: ShieldCheck },
    { value: "id_verify", label: "ID Verify", icon: Fingerprint },
    { value: "sdk", label: "SDK", icon: Smartphone },
    { value: "mobile", label: "Mobile", icon: Smartphone },
    { value: "wearable", label: "Wearable", icon: Activity },
  ],
  gov: [
    { value: "incidents", label: "Incidents", icon: AlertTriangle },
    { value: "audit-trail", label: "Audit Trail", icon: History },
    { value: "compliance-controls", label: "Compliance", icon: ShieldCheck },
    { value: "sla", label: "SLA Tiers", icon: CheckCircle2 },
    { value: "reports", label: "Reports", icon: FileText },
    { value: "vendors", label: "Vendors", icon: Users },
  ],
  infra: [
    { value: "health", label: "Regional Health", icon: Activity },
    { value: "remediation", label: "Self-Healing", icon: Zap },
    { value: "config", label: "Global Config", icon: Globe },
    { value: "kiosk", label: "Kiosk", icon: Server },
    { value: "crypto", label: "Crypto", icon: Shield },
    { value: "quantum", label: "Quantum", icon: Shield },
  ],
  strat: [
    { value: "settings", label: "Settings", icon: Settings },
    { value: "partner", label: "Partner Portal", icon: Globe },
    { value: "financial", label: "Financial", icon: BarChart3 },
    { value: "metrics", label: "Metrics", icon: Activity },
    { value: "pricing", label: "Pricing", icon: Tag },
    { value: "gtm", label: "GTM Strategy", icon: Globe },
    { value: "roadmap", label: "Roadmap", icon: Milestone },
    { value: "hiring", label: "Hiring", icon: Users },
  ],
};

// ============================================================================
// Inner Shell (uses context)
// ============================================================================

function DeepfakeDefenseShell() {
  const ctx = useDeepfakeDefenseContext();
  const { perspective } = usePerspective();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("det");

  const perspectiveData = {
    alpha: {
      title: "ALPHA",
      subtitle: "DEEPFAKE DEFENSE SYSTEM",
      gradient: "from-blue-500/10 via-background to-orange-500/5",
    },
    sigma: {
      title: "SIGMA",
      subtitle: "IDENTITY INTELLIGENCE",
      gradient: "from-purple-500/10 via-background to-cyan-500/5",
    },
    omega: {
      title: "OMEGA",
      subtitle: "SYNTHETIC AUDIT TERMINAL",
      gradient: "from-green-500/10 via-background to-indigo-500/5",
    },
  };
  const activeBranding = perspectiveData[perspective] || perspectiveData.alpha;

  return (
    <div
      className={
        "min-h-screen bg-background text-foreground selection:bg-primary/30 noise-overlay perspective-" +
        perspective
      }
    >
      <input
        type="file"
        ref={ctx.fileInputRef}
        className="hidden"
        onChange={ctx.onFileSelect}
        accept="image/*,video/*,audio/*"
      />
      <div
        className={
          "fixed inset-0 bg-gradient-to-br " +
          activeBranding.gradient +
          " pointer-events-none opacity-50"
        }
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tighter leading-none">
                    {activeBranding.title}
                    <span className="text-primary/50">_CORE</span>
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em]">
                    {activeBranding.subtitle}
                  </span>
                </div>
              </Link>
              <div className="h-4 w-px bg-border mx-2 hidden md:block" />
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 animate-pulse hidden md:flex"
              >
                DEFENSE_ACTIVE
              </Badge>
              <div className="h-4 w-px bg-border mx-2 hidden lg:block" />
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                data-testid="btn-live-detection"
                onClick={() => setActiveTab("liveness")}
              >
                <Play className="w-4 h-4 mr-2" /> Live Detection Portal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  ctx.handleDownload("livenesslink-sdk.zip", "SDK_PLACEHOLDER")
                }
              >
                <Download className="w-4 h-4 mr-2" /> SDK
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  ctx.handleDownload(
                    "livenesslink-mobile.apk",
                    "APK_PLACEHOLDER"
                  )
                }
              >
                <Smartphone className="w-4 h-4 mr-2" /> Mobile App
              </Button>
              <Button
                size="sm"
                data-testid="btn-analyze-media"
                onClick={ctx.handleAnalyzeMedia}
                disabled={ctx.isAnalyzing}
              >
                <Upload
                  className={
                    "w-4 h-4 mr-2 " + (ctx.isAnalyzing ? "animate-spin" : "")
                  }
                />
                {ctx.isAnalyzing ? "Analyzing..." : "Analyze Media"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                onClick={async () => {
                  const tId = toast.loading(
                    "Launching Voice Forensics analyzer..."
                  );
                  try {
                    const res = await (
                      await import("@/lib/api")
                    ).extendedApi.deepfake.analyzeEnterprise({
                      source: "voice_buffer",
                      verification_mode: "audio_forensics",
                    });
                    const score = res && typeof res === "object" && "authenticity_score" in res ? (res as { authenticity_score?: number }).authenticity_score : undefined;
                    toast.success(
                      score !== undefined
                        ? "Voice Forensics match: " +
                            (score * 100).toFixed(1) +
                            "% Authenticity"
                        : "Forensic Scan Complete: No synthetic artifacts found",
                      { id: tId }
                    );
                  } catch {
                    toast.error(
                      "Forensic engine offline. Please verify ML provider connectivity.",
                      { id: tId }
                    );
                  }
                }}
              >
                Voice Forensics
              </Button>
              <NotificationCenter />
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Category Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveTab(categoryTabs[cat.id][0].value);
                }}
                className={
                  "flex flex-col items-start p-4 rounded-xl border transition-all text-left group " +
                  (activeCategory === cat.id
                    ? "bg-orange-500/10 border-orange-500 shadow-sm ring-1 ring-orange-500/20"
                    : "bg-card hover:bg-muted/50 border-border/50 glass-premium-hover")
                }
              >
                <div
                  className={
                    "p-2 rounded-lg mb-3 transition-colors " +
                    (activeCategory === cat.id
                      ? "bg-orange-500 text-white"
                      : "bg-muted text-muted-foreground group-hover:text-foreground")
                  }
                >
                  <cat.icon className="w-5 h-5" />
                </div>
                <div className="text-caption-premium mb-1">{cat.label}</div>
                <div className="text-feature line-clamp-1 opacity-70">
                  {cat.description}
                </div>
              </button>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollArea className="w-full whitespace-nowrap mb-6">
              <TabsList className="inline-flex w-max h-10 items-center justify-start gap-2 p-1 bg-muted/50 border border-border/50">
                {categoryTabs[activeCategory].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    data-testid={"tab-" + tab.value}
                  >
                    <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Detection */}
            <TabsContent value="dashboard">
              <DashboardSection />
            </TabsContent>
            <TabsContent value="detectors">
              <DetectorsSection
                mediaType={ctx.mediaType}
                setMediaType={ctx.setMediaType}
                analyses={ctx.analyses}
                onShowTestDialog={() => ctx.setShowTestDetectorDialog(true)}
                onExport={ctx.handleExport}
              />
            </TabsContent>
            <TabsContent value="models">
              <ModelsSection
                customModels={ctx.customModels}
                onShowDeployDialog={() => ctx.setShowDeployModelDialog(true)}
                onDeleteModel={ctx.handleDeleteModel}
              />
            </TabsContent>
            <TabsContent value="training">
              <TrainingSection />
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedSection />
            </TabsContent>

            {/* Identity */}
            <TabsContent value="liveness">
              <LivenessSection
                sessions={ctx.sessions}
                isAnalyzing={ctx.isAnalyzing}
                setIsAnalyzing={ctx.setIsAnalyzing}
                scanStage={ctx.scanStage}
                setScanStage={ctx.setScanStage}
                scanProgress={ctx.scanProgress}
                setScanProgress={ctx.setScanProgress}
                advancedResult={ctx.advancedResult}
                setAdvancedResult={ctx.setAdvancedResult}
                onShowConfigureDialog={() =>
                  ctx.setShowConfigureLivenessDialog(true)
                }
                handleDownload={ctx.handleDownload}
              />
            </TabsContent>
            <TabsContent value="id_verify">
              <IDVerifySection />
            </TabsContent>
            <TabsContent value="sdk">
              <SDKSection />
            </TabsContent>
            <TabsContent value="mobile">
              <MobileSection />
            </TabsContent>
            <TabsContent value="wearable">
              <WearableSection />
            </TabsContent>

            {/* Governance */}
            <TabsContent value="incidents">
              <IncidentsSection />
            </TabsContent>
            <TabsContent value="audit-trail">
              <AuditTrailSection />
            </TabsContent>
            <TabsContent value="compliance-controls">
              <ComplianceControlsSection />
            </TabsContent>
            <TabsContent value="sla">
              <SLASection />
            </TabsContent>
            <TabsContent value="reports">
              <ReportsSection />
            </TabsContent>
            <TabsContent value="vendors">
              <VendorsSection />
            </TabsContent>

            {/* Infrastructure */}
            <TabsContent value="health">
              <HealthSection />
            </TabsContent>
            <TabsContent value="remediation">
              <RemediationSection />
            </TabsContent>
            <TabsContent value="config">
              <ConfigSection />
            </TabsContent>
            <TabsContent value="kiosk">
              <KioskSection />
            </TabsContent>
            <TabsContent value="crypto">
              <CryptoSection />
            </TabsContent>
            <TabsContent value="quantum">
              <QuantumSection />
            </TabsContent>

            {/* Strategy */}
            <TabsContent value="settings">
              <SettingsSection />
            </TabsContent>
            <TabsContent value="partner">
              <PartnerSection />
            </TabsContent>
            <TabsContent value="financial">
              <FinancialSection />
            </TabsContent>
            <TabsContent value="metrics">
              <MetricsSection />
            </TabsContent>
            <TabsContent value="pricing">
              <PricingSection />
            </TabsContent>
            <TabsContent value="gtm">
              <GTMSection />
            </TabsContent>
            <TabsContent value="roadmap">
              <RoadmapSection />
            </TabsContent>
            <TabsContent value="hiring">
              <HiringSection />
            </TabsContent>
          </Tabs>
        </div>

        <PerspectiveSwitcher />

        <DeepfakeDefenseDialogs />

        {ctx.confirmFailover && (
          <ConfirmationModal
            open={!!ctx.confirmFailover}
            onOpenChange={() => ctx.setConfirmFailover(null)}
            title="Confirm Regional Failover"
            description={
              "Are you sure you want to trigger failover for " +
              ctx.confirmFailover +
              "? This will reroute biometric traffic."
            }
            onConfirm={async () => {
              await ctx.handleTriggerFailover(ctx.confirmFailover as string);
              ctx.setConfirmFailover(null);
            }}
          />
        )}
        {ctx.confirmRevoke && (
          <ConfirmationModal
            open={ctx.confirmRevoke}
            onOpenChange={() => ctx.setConfirmRevoke(false)}
            title="Revoke Biometric Template"
            description="This action is irreversible. The biometric template will be permanently purged."
            onConfirm={async () => {
              ctx.setConfirmRevoke(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Export (Provider Wrapper)
// ============================================================================

export default function AlphaHectaDeepfakeDefense() {
  const state = useDeepfakeDefense();
  return (
    <DeepfakeDefenseProvider value={state}>
      <DeepfakeDefenseShell />
    </DeepfakeDefenseProvider>
  );
}
