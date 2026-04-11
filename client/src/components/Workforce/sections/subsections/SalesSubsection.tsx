import React from "react";
import { 
  TrendingUp, 
  Shield, 
  Search
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { RevenueCard } from "../../ui/RevenueCard";
import { AcquisitionWin } from "../../ui/AcquisitionWin";

interface SalesSubsectionProps {
  revenueData: any;
  acquisitions: any[];
}

export function SalesSubsection({
  revenueData,
  acquisitions
}: SalesSubsectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RevenueCard
          product="Agent Ops"
          revenue={`$${((revenueData?.agentOps?.revenue || 0) / 1000).toFixed(1)}k`}
          growth={`${revenueData?.agentOps?.growth || 0}%`}
          roi={`${revenueData?.agentOps?.roi || 0}x`}
        />
        <RevenueCard
          product="Compliance Hub"
          revenue={`$${((revenueData?.compliance?.revenue || 0) / 1000).toFixed(1)}k`}
          growth={`${revenueData?.compliance?.growth || 0}%`}
          roi={`${revenueData?.compliance?.roi || 0}x`}
        />
        <RevenueCard
          product="Deepfake Defense"
          revenue={`$${((revenueData?.deepfake?.revenue || 0) / 1000).toFixed(1)}k`}
          growth={`${revenueData?.deepfake?.growth || 0}%`}
          roi={`${revenueData?.deepfake?.roi || 0}x`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/50 shadow-xl overflow-hidden">
          <CardHeader className="bg-indigo-500/5 border-b border-border/10 py-5">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Live ROI Attribution
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest opacity-60">Recent Acquisition Wins</h4>
                <div className="space-y-2">
                  {acquisitions.map((win: any, idx: number) => (
                    <AcquisitionWin
                      key={idx}
                      client={win.client}
                      value={win.value}
                      source={win.source}
                      time={win.time}
                    />
                  ))}
                  {acquisitions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-[10px] text-muted-foreground uppercase font-bold gap-3 border border-dashed rounded-xl border-border/50">
                      <Search className="w-5 h-5 opacity-20" />
                      No recent wins detected in current cycle.
                    </div>
                  )}
                </div>
             </div>
             
             <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Strategy Refinement Impact</span>
                  <span className="text-sm font-black text-indigo-400">+{revenueData?.agentOps?.growth || 0}% ROI Lift</span>
                </div>
                <Progress value={85} className="h-1.5 bg-indigo-500/10" />
                <p className="text-[10px] italic leading-relaxed text-muted-foreground opacity-80">
                  "Marketing agents have pivoted outreach for <span className="text-white font-bold">Deepfake Defense</span> from 'Security Compliance' to <span className="text-indigo-400 font-bold">'Executive Liability'</span>—increasing conversion velocity by <span className="text-white font-bold">{revenueData?.deepfake?.roi || 12}x</span>."
                </p>
              </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-xl overflow-hidden">
          <CardHeader className="bg-emerald-500/5 border-b border-border/10 py-5">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
               <Shield className="w-4 h-4" /> Offer Engineering
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Active Global Offer</Label>
                <div className="p-5 rounded-2xl bg-background border border-border/50 shadow-inner font-bold text-sm italic leading-relaxed text-white">
                  "Autonomous Compliance within 48 hours or we manage the infrastructure for free."
                </div>
              </div>
              <div className="space-y-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Parallel Experiment (B)</Label>
                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-400 font-bold text-sm italic shadow-lg shadow-blue-500/5">
                  "Unlimited AI Policy Monitoring & Neural Forensics for a $499/mo Flat Fee."
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                size="sm"
                className="font-bold border-indigo-500/20 text-indigo-400 h-9"
                onClick={() =>
                  toast.promise(
                    extendedApi.workforce.analyzeInsights("Test pricing variant B validation"),
                    {
                      loading: "Deploying Variant B to Edge Nodes...",
                      success: "Variant B test initiated. Results in 24hrs.",
                      error: "Experiment active.",
                    }
                  )
                }
              >
                Test Variant B
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 font-bold h-9 shadow-lg shadow-emerald-600/20"
                onClick={() =>
                  toast.promise(
                    extendedApi.workforce.runCampaign("Global Offer Deployment", "enterprise"),
                    {
                      loading: "Deploying Global Offer Cluster...",
                      success: "Global offer deployed across all multi-agent channels.",
                      error: "Campaign queued.",
                    }
                  )
                }
              >
                Deploy Global Offer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
