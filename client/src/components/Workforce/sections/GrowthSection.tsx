import React from "react";
import { 
  TrendingUp, 
  Zap, 
  Send, 
  Activity,
  ChevronRight,
  Target
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SalesSubsection } from "./subsections/SalesSubsection";
import { MarketingSubsection } from "./subsections/MarketingSubsection";
import { OutreachSubsection } from "./subsections/OutreachSubsection";
import { RetentionSubsection } from "./subsections/RetentionSubsection";

interface GrowthSectionProps {
  revenueData: any;
  acquisitions: any[];
  contentDrafts: any[];
  autosearchNiche: string;
  setAutosearchNiche: (val: string) => void;
  targetProfile: string;
  setTargetProfile: (val: string) => void;
  isAutosearching: boolean;
  outreachDrafts: any[];
  isRunningMarketing: boolean;
  handleRunMarketing: () => void;
  handleRunAutosearch: () => void;
  handleApproveOutreach: (id: string) => void;
  handleShiftMarketFocus: () => void;
  // Sub-component helpers
  RevenueCard: React.ComponentType<any>;
  AcquisitionWin: React.ComponentType<any>;
}

export function GrowthSection({
  revenueData,
  acquisitions,
  contentDrafts,
  autosearchNiche,
  setAutosearchNiche,
  targetProfile,
  setTargetProfile,
  isAutosearching,
  outreachDrafts,
  isRunningMarketing,
  handleRunMarketing,
  handleRunAutosearch,
  handleApproveOutreach,
  handleShiftMarketFocus,
  RevenueCard,
  AcquisitionWin
}: GrowthSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-purple-500/5 p-6 rounded-3xl border border-purple-500/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-black flex items-center gap-2">
              Growth Engine <Badge variant="outline" className="text-purple-400 border-purple-400/20 h-5 px-1.5 text-[9px] uppercase font-black">ACTIVE</Badge>
            </div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              Multi-Agent Coordination & Revenue Attribution
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-background/50 px-4 py-2 rounded-2xl border border-border/50 shadow-inner">
           <Target className="w-4 h-4 text-purple-400" />
           <span className="text-[10px] font-black uppercase tracking-widest pr-4 opacity-50">Orchestrator:</span>
           <span className="text-xs font-bold text-white">CREWAI PRODUCTION CLUSTER</span>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-14 bg-muted/10 p-1.5 gap-2 border border-border/10 rounded-2xl">
          {[
            { value: "sales", label: "Revenue & Sales", icon: TrendingUp },
            { value: "marketing", label: "Marketing Lab", icon: Zap },
            { value: "outreach", label: "Outreach Ops", icon: Send },
            { value: "retention", label: "Churn Defense", icon: Activity }
          ].map(tab => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className="rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              <span className="text-xs font-bold">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-8 space-y-8">
          <TabsContent value="sales">
            <SalesSubsection 
              revenueData={revenueData}
              acquisitions={acquisitions}
              RevenueCard={RevenueCard}
              AcquisitionWin={AcquisitionWin}
            />
          </TabsContent>
          
          <TabsContent value="marketing">
            <MarketingSubsection 
              contentDrafts={contentDrafts}
              isRunningMarketing={isRunningMarketing}
              onRunMarketing={handleRunMarketing}
            />
          </TabsContent>
          
          <TabsContent value="outreach">
            <OutreachSubsection 
              autosearchNiche={autosearchNiche}
              setAutosearchNiche={setAutosearchNiche}
              targetProfile={targetProfile}
              setTargetProfile={setTargetProfile}
              isAutosearching={isAutosearching}
              outreachDrafts={outreachDrafts}
              onRunAutosearch={handleRunAutosearch}
              onApproveOutreach={handleApproveOutreach}
            />
          </TabsContent>
          
          <TabsContent value="retention">
            <RetentionSubsection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
