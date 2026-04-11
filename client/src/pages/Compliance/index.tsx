import { useState } from "react";
import { 
  Scale, 
  Database, 
  Plus, 
  Download, 
  Smartphone, 
  FileCheck, 
  LayoutDashboard, 
  ChevronDown, 
  BarChart3, 
  Activity, 
  Tag, 
  Globe, 
  Milestone, 
  Users, 
  AlertOctagon, 
  History, 
  FileDown, 
  Key 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useCompliance } from "./hooks/useCompliance";
import { categories, categoryTabs } from "./constants";
import { ModelProfileDialog } from "./components/ModelProfileDialog";
import { DashboardSection } from "./sections/DashboardSection";
import { ChecklistSection } from "./sections/ChecklistSection";
import { ModelsSection } from "./sections/ModelsSection";
import { AuditTrailSection } from "@/components/Compliance/sections/AuditTrailSection";
import { RegionalComplianceSection } from "@/components/Compliance/sections/RegionalComplianceSection";
import { RiskAssessmentSection } from "@/components/Compliance/sections/RiskAssessmentSection";
import { GovernanceSection } from "@/components/Compliance/sections/GovernanceSection";
import { GenericChecklist } from "./components/GenericChecklist";
import { UploadArtifactDialog } from "./components/UploadArtifactDialog";

export default function ComplianceLayout() {
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
    isLoadingChecklists,
    showUploadDialog
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
    handleEURegister
  } = actions;

  const openIncidentsCount = incidents.filter(
    i => i.status !== "resolved" && i.status !== "closed"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-product-title text-white text-xl">
                    AI <span>Compliance Hub</span>
                  </h1>
                  <p className="text-caption-premium text-[9px] text-muted-foreground/60 leading-none mt-0.5">
                    EU AI Act Compliance Engine
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEURegister()}
                disabled={euDatabaseRegistered}
              >
                <Database className="w-4 h-4 mr-2" />
                {euDatabaseRegistered ? "Registered (EU)" : "EU Database Register"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("sdk.zip", "")}>
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
              
              {/* Strategic Strategy Dropdown - Simplified for Reassembly */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Strategic Strategy <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveTab("financial")}>Financial Model</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("metrics")}>Metrics</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="dashboard">
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
          </TabsContent>

          <TabsContent value="compliance">
            <ChecklistSection articles={articles} loading={loadingArticles} />
          </TabsContent>

          <TabsContent value="models">
            <ModelsSection 
              models={models} 
              onViewModel={(m) => setSelectedModelForView(m)} 
              onDeleteModel={() => {}} 
            />
          </TabsContent>

          <TabsContent value="audit-trail">
            <AuditTrailSection />
          </TabsContent>

          <TabsContent value="regional">
            <RegionalComplianceSection />
          </TabsContent>

          <TabsContent value="risk">
            <RiskAssessmentSection />
          </TabsContent>

          <TabsContent value="governance">
            <GovernanceSection />
          </TabsContent>

          {/* Fallback for other tabs */}
          <TabsContent value={activeTab}>
             {activeTab !== "dashboard" && 
              activeTab !== "compliance" && 
              activeTab !== "models" && 
              activeTab !== "audit-trail" && 
              activeTab !== "regional" && 
              activeTab !== "risk" && 
              activeTab !== "governance" && (
                <div className="space-y-6">
                  {/* REAL-FIRST: Categorizing tabs into functional clusters */}
                  {["docs", "reports", "sla"].includes(activeTab) ? (
                    <GenericChecklist 
                      category={activeTab} 
                      items={checklists.filter(c => c.category === activeTab)} 
                      loading={isLoadingChecklists}
                      onUpdate={handleUpdateChecklistItem}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl">
                      <Activity className="w-12 h-12 text-muted-foreground mb-4 animate-pulse" />
                      <h3 className="text-xl font-bold">Section Under Construction</h3>
                      <p className="text-muted-foreground">The module for {activeTab} is being migrated to the new architecture.</p>
                    </div>
                  )}
                </div>
             )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Profile Dialog */}
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

      {/* Artifact Upload Dialog */}
      <UploadArtifactDialog 
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        selectedModel={selectedModelForView}
        onUploadSuccess={() => {
          // Re-fetch model details to show new artifact
          setSelectedModelForView({ ...selectedModelForView });
        }}
      />
    </div>
  );
}
