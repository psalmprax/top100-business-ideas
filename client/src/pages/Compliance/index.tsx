import { useState, useMemo } from "react";
import {
  Shield,
  Search,
  Bell,
  Plus,
  Scale,
  Database,
  Download,
  FileCheck,
  RefreshCw,
  Zap,
  ChevronDown,
  Calendar,
  Archive,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenu } from "@/components/UserMenu";

// Sections
import { DashboardSection } from "./sections/DashboardSection";
import { ChecklistSection } from "@/components/Compliance/sections/ChecklistSection";
import { ModelsSection } from "./sections/ModelsSection";
import { AuditTrailSection } from "@/components/Compliance/sections/AuditTrailSection";
import { RegionalComplianceSection } from "@/components/Compliance/sections/RegionalComplianceSection";
import { RiskAssessmentSection } from "@/components/Compliance/sections/RiskAssessmentSection";
import { GovernanceSection } from "@/components/Compliance/sections/GovernanceSection";
import { SLATiersSection } from "@/components/Compliance/sections/SLATiersSection";
import { RedTeamSection } from "@/components/Compliance/sections/RedTeamSection";
import { MonitoringSection } from "@/components/Compliance/sections/MonitoringSection";
import { ShadowAISection } from "@/components/Compliance/sections/ShadowAISection";
import { BiometricsSection } from "@/components/Deepfake/sections/BiometricsSection";

// Hardened Sections (New)
import { EnterpriseAuditsSection } from "@/components/Compliance/sections/EnterpriseAuditsSection";
import { IncidentsSection } from "@/components/Compliance/sections/IncidentsSection";
import { VendorsSection } from "@/components/Compliance/sections/VendorsSection";
import { LiteracySection } from "@/components/Compliance/sections/LiteracySection";
import { SettingsSection } from "@/components/Compliance/sections/SettingsSection";
import { BiasScanSection } from "@/components/Compliance/sections/BiasScanSection";
import { EdgeAISection } from "@/components/Compliance/sections/EdgeAISection";
import { PartnerPortalSection } from "@/components/Compliance/sections/PartnerPortalSection";

// Components
import { ModelProfileDialog } from "./components/ModelProfileDialog";
import { UploadArtifactDialog } from "./components/UploadArtifactDialog";
import { GenericChecklist } from "./components/GenericChecklist";

import { categories, categoryTabs } from "./constants";
import { useCompliance } from "./hooks/useCompliance";

export default function ComplianceHub() {
  const { state, actions } = useCompliance();
  const {
    activeCategory,
    activeTab,
    articles,
    loadingArticles,
    models,
    avgScore,
    compliantModels,
    totalModels,
    highRiskModels,
    incidents,
    roiMetrics,
    velocityTrends,
    biasReports,
    euDatabaseRegistered,
    deadlines,
    selectedModelForView,
    modelBreakdown,
    modelAudits,
    modelHandshakes,
    modelArtifacts,
    checklists,
    showUploadDialog,
    auditLogs,
  } = state;

  const {
    setActiveCategory,
    setActiveTab,
    setSelectedModelForView,
    setShowModelDialog,
    handleExportReport,
    handleDownload,
    handleToggleGuardrail,
    setShowUploadDialog,
    handleUpdateChecklistItem,
    handleEURegister,
    refresh,
  } = actions;

  const [searchQuery, setSearchQuery] = useState("");

  const openIncidentsCount = useMemo(
    () =>
      incidents.filter(i => i.status !== "resolved" && i.status !== "closed")
        .length,
    [incidents]
  );

  const renderTabContent = (value: string) => {
    switch (value) {
      // Governance
      case "dashboard":
        return (
          <DashboardSection
            avgScore={avgScore}
            compliantModels={compliantModels}
            totalModels={totalModels}
            highRiskModels={highRiskModels}
            openIncidents={openIncidentsCount}
            roiMetrics={roiMetrics}
            velocityTrends={velocityTrends}
            biasReports={biasReports}
            euDatabaseRegistered={euDatabaseRegistered}
            deadlines={deadlines}
          />
        );
      case "monitoring":
        return <MonitoringSection />;
      case "audits":
        return <RedTeamSection />;
      case "compliance-audits":
        return <EnterpriseAuditsSection />;
      case "sla":
        return <SLATiersSection />;
      case "audit-trail":
        return <AuditTrailSection logs={auditLogs} />;
      case "risk":
        return <RiskAssessmentSection />;
      case "settings":
        return <SettingsSection />;

      // Regulatory
      case "compliance":
        return (
          <ChecklistSection articles={articles} loading={loadingArticles} />
        );
      case "regional":
        return <RegionalComplianceSection />;
      case "docs":
        return (
          <GenericChecklist
            category="docs"
            items={checklists.filter(c => c.category === "docs")}
            loading={loadingArticles}
            onUpdate={handleUpdateChecklistItem}
          />
        );
      case "reports":
        return (
          <GenericChecklist
            category="reports"
            items={checklists.filter(c => c.category === "reports")}
            loading={loadingArticles}
            onUpdate={handleUpdateChecklistItem}
          />
        );

      // Technical
      case "models":
        return (
          <ModelsSection
            models={models}
            onViewModel={m => setSelectedModelForView(m)}
            onDeleteModel={() => {}}
          />
        );
      case "bias":
        return <BiasScanSection />;
      case "edge":
        return <EdgeAISection />;
      case "shadow":
        return <ShadowAISection />;

      // Operations
      case "vendors":
        return <VendorsSection />;
      case "partner":
        return <PartnerPortalSection />;
      case "training":
        return <LiteracySection />;
      case "identity":
        return <BiometricsSection />;
      case "incidents":
        return <IncidentsSection />;

      // Infrastructure / Strategic Fallbacks
      case "financial":
      case "metrics":
        return <GovernanceSection />; // Business Strategy placeholders

      default:
        // Generic checklist fallback for dynamically typed categories
        if (["docs", "reports", "config", "remediation"].includes(value)) {
          return (
            <GenericChecklist
              category={value}
              items={checklists.filter(c => c.category === value)}
              loading={loadingArticles}
              onUpdate={handleUpdateChecklistItem}
            />
          );
        }

        return (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-primary/20 animate-pulse" />
              <Zap className="w-6 h-6 text-primary absolute bottom-0 right-0 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Section Optimized</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                The {value} module is running in background autonomous mode.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" /> Force Sync
            </Button>
          </div>
        );
    }
  };

  const handleGenerateDocs = async () => {
    toast.promise(
      extendedApi.compliance.generateDocumentation("all"),
      {
        loading: "Generating enterprise compliance documentation pack...",
        success: "Documentation pack generated and stored in Vault.",
        error: "Documentation generation failed. Check API connectivity.",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Alpha Hub
              </Button>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-product-title text-white text-xl">
                Compliance<span>Hub</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5"
              onClick={handleGenerateDocs}
            >
              <FileCheck className="w-4 h-4 mr-2" /> Generate Docs
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEURegister()}
                disabled={euDatabaseRegistered}
              >
                <Database className="w-4 h-4 mr-2" />
                {euDatabaseRegistered
                  ? "Registered (EU)"
                  : "EU Database Register"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("sdk.zip", "")}
              >
                <Download className="w-4 h-4 mr-2" /> SDK
              </Button>
              <Button variant="outline" size="sm">
                <FileCheck className="w-4 h-4 mr-2" /> Generate Docs
              </Button>
              <Button size="sm" onClick={() => setShowModelDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Model
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveTab(categoryTabs[cat.id][0].value);
              }}
              className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left group ${
                activeCategory === cat.id
                  ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20"
                  : "bg-card hover:bg-muted/50 border-border/50"
              }`}
            >
              <div
                className={`p-2 rounded-lg mb-3 transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <cat.icon className="w-5 h-5" />
              </div>
              <div className="text-caption-premium text-[11px] mb-1 font-bold">
                {cat.label}
              </div>
              <div className="text-[10px] text-muted-foreground line-clamp-1 opacity-70">
                {cat.description}
              </div>
            </button>
          ))}
        </div>

        {/* Modular Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <ScrollArea className="w-full whitespace-nowrap mb-6">
            <TabsList className="inline-flex w-max h-10 items-center justify-start gap-2 p-1 bg-muted/50 border border-border/50">
              {categoryTabs[activeCategory].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}

              <div className="h-8 w-px bg-border mx-2" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Strategic Strategy <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveTab("financial")}>
                    Financial Model
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("metrics")}>
                    Metrics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Render Active Tab */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderTabContent(activeTab)}
          </div>
        </Tabs>
      </main>

      <ModelProfileDialog
        selectedModelForView={selectedModelForView}
        setSelectedModelForView={setSelectedModelForView}
        handleToggleGuardrail={handleToggleGuardrail}
        setShowUploadDialog={setShowUploadDialog}
        handleExportReport={handleExportReport}
        modelBreakdown={modelBreakdown}
        modelAudits={modelAudits}
        modelHandshakes={modelHandshakes}
        modelArtifacts={modelArtifacts}
        handleDownload={handleDownload}
        handleEURegister={handleEURegister}
      />

      <UploadArtifactDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        selectedModel={selectedModelForView}
        onUploadSuccess={() => {
          setSelectedModelForView({ ...selectedModelForView });
        }}
      />
    </div>
  );
}
