import React from "react";
import { 
  Wallet, 
  Activity, 
  TrendingUp, 
  PieChart, 
  Plus, 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

interface FinanceSectionProps {
  revenueData: any;
  fiscalRequests: any[];
  setFiscalRequests: React.Dispatch<React.SetStateAction<any[]>>;
  ventures: any[];
  onFiscalApproval: (id: string, status: string) => void;
  MetricCard: React.ComponentType<any>;
}

export function FinanceSection({
  revenueData,
  fiscalRequests,
  setFiscalRequests,
  ventures,
  onFiscalApproval,
  MetricCard
}: FinanceSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Enterprise Capital"
          value={`$${revenueData?.totalCapital?.toLocaleString() || "0"}`}
          icon={Wallet}
          footer="Liquidity Velocity: 85%"
          color="bg-blue-500/10"
        />
        <MetricCard
          title="Net Burn Rate"
          value={`$${revenueData?.burnRate || "0"}/hr`}
          icon={Activity}
          footer="Runway: 18.4 Months"
          color="bg-amber-500/10"
        />
        <MetricCard
          title="Avg Venture ROI"
          value={`+${revenueData?.avgRoi || "0"}%`}
          icon={TrendingUp}
          footer={`Top Cap: V-${ventures[0]?.id?.slice(-3) || "121"}`}
          color="bg-emerald-500/10"
        />
        <MetricCard
          title="Sovereign Allocation"
          value="OPTIMIZED"
          icon={PieChart}
          footer={`Last Rebalance: 2.1h ago`}
          color="bg-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1 border-indigo-500/20 bg-indigo-500/5 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-br from-indigo-500/10 to-transparent border-b border-indigo-500/10 py-6">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Fiscal Queue
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-indigo-500/20 shadow-2xl">
                  <DialogHeader className="border-b border-white/5 pb-4">
                    <DialogTitle className="text-xl font-black">Create Fiscal Request</DialogTitle>
                    <DialogDescription className="text-xs uppercase tracking-widest text-indigo-400 mt-1">Submit expenditure for CFO AI forensic review.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-8">
                    <div className="space-y-2">
                      <Label htmlFor="req-purpose" className="text-[10px] uppercase font-black tracking-widest opacity-60">Expenditure Purpose</Label>
                      <Input
                        id="req-purpose"
                        placeholder="e.g. Cloud Compute Overages (EU-West)"
                        className="h-11 bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="req-amount" className="text-[10px] uppercase font-black tracking-widest opacity-60">Requested Amount (USD)</Label>
                      <Input id="req-amount" placeholder="$2,500" className="h-11 bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="req-priority" className="text-[10px] uppercase font-black tracking-widest opacity-60">Approval Priority</Label>
                      <Select defaultValue="MEDIUM">
                        <SelectTrigger className="h-11 bg-white/5 border-white/10 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="LOW" className="text-xs font-bold">LOW</SelectItem>
                          <SelectItem value="MEDIUM" className="text-xs font-bold">MEDIUM</SelectItem>
                          <SelectItem value="HIGH" className="text-xs font-bold">HIGH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="bg-white/5 p-6 rounded-b-2xl border-t border-white/5">
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 rounded-xl"
                      onClick={async () => {
                        const p = (document.getElementById("req-purpose") as HTMLInputElement)?.value;
                        const a = (document.getElementById("req-amount") as HTMLInputElement)?.value;
                        if (!p || !a) {
                           toast.error("Forensic data missing.");
                           return;
                        }

                        try {
                          const newReq = await extendedApi.workforce.createFiscalRequest(p, a, "MEDIUM");
                          setFiscalRequests(prev => [newReq, ...prev]);
                          toast.success("Fiscal request submitted to CFO AI.");
                        } catch (error) {
                          toast.error("Submission failed (Offline Mode).");
                        }
                      }}
                    >
                      Submit for Forensic Review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription className="text-[10px] font-medium opacity-60">Authorized department spend & allocation requests.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
              {fiscalRequests.map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/10 transition-all space-y-3 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black truncate max-w-[120px] uppercase tracking-tighter text-white">
                      {req.purpose}
                    </div>
                    <div className="text-xs font-black text-indigo-400">
                      {req.amount}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[8px] font-black h-4 px-1.5 border-none ${req.priority === "HIGH" ? "bg-red-500/10 text-red-400 animate-pulse" : "bg-indigo-500/10 text-indigo-400"}`}
                    >
                      {req.priority}
                    </Badge>
                    <div className="flex gap-1.5">
                      {req.status === "PENDING" ? (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-lg border-white/10 text-red-500 hover:bg-red-500/10"
                            onClick={() => onFiscalApproval(req.id, "DENIED")}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-lg border-white/10 text-emerald-500 hover:bg-emerald-500/10"
                            onClick={() => onFiscalApproval(req.id, "APPROVED")}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <Badge
                          className={`text-[8px] font-black h-5 px-2 ${
                            req.status === "APPROVED"
                              ? "bg-emerald-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {req.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {fiscalRequests.length === 0 && (
                 <div className="text-center py-20 text-[10px] font-black uppercase tracking-widest opacity-20 italic">
                    Fiscal Inbox Empty
                 </div>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground italic text-center pt-4 border-t border-white/5">
              "CFO AI reconciles department liquidity at <span className="text-white font-bold">00:00 UTC</span> daily."
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-border/50 bg-card/30 backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/10 py-6">
              <CardTitle className="text-xl font-black">Venture Hub Performance</CardTitle>
              <CardDescription className="text-xs font-medium opacity-60">
                Real-time yield tracking for active autonomous enterprise ventures.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow className="border-border/30">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">Deployment</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">Sector</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">Health</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest h-12">Yield (ROI)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventures.map(v => (
                    <TableRow key={v.id} className="border-border/10 hover:bg-white/5 transition-all">
                      <TableCell className="font-bold py-5">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-white">V-{v.id.substring(0, 4)} &middot; {v.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs opacity-60 font-medium">{v.sector}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-black h-5 uppercase tracking-widest border-none ${
                            v.status === "PROFITABLE"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-black tabular-nums py-5 ${v.trend === "up" ? "text-emerald-400" : "text-red-400"}`}
                      >
                        <div className="flex items-center justify-end gap-1.5 text-base">
                          {v.roi >= 0 ? "+" : ""}
                          {v.roi}%
                          {v.trend === "up" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ventures.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-32 text-[10px] font-black uppercase tracking-widest opacity-20 italic"
                      >
                        No active ventures detected in current ecosystem.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-indigo-500/20 shadow-2xl bg-gradient-to-br from-card to-indigo-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400">
               <PieChart className="w-32 h-32" />
            </div>
            <CardHeader className="py-6 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-black">
                Neural Allocation Split
              </CardTitle>
              <CardDescription className="text-[10px] font-medium opacity-60 uppercase tracking-widest">
                Dynamic department capital weighting.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {[
                { label: "R&D Cluster", value: 45, color: "bg-blue-500 shadow-blue-500/50" },
                { label: "Governance & Legal", value: 20, color: "bg-emerald-500 shadow-emerald-500/50" },
                { label: "Growth Engines", value: 15, color: "bg-purple-500 shadow-purple-500/50" },
                { label: "Ops & Infrastructure", value: 20, color: "bg-amber-500 shadow-amber-500/50" },
              ].map(dept => (
                <div key={dept.label} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-60">{dept.label}</span>
                    <span className="text-white">{dept.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${dept.color} shadow-lg transition-all duration-1000 ease-out flex items-center justify-end px-1`}
                      style={{ width: `${dept.value}%` }}
                    >
                       <div className="w-1 h-1 bg-white rounded-full opacity-40 shadow-white" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-6 mt-6 border-t border-white/5">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 rounded-xl"
                  onClick={() =>
                    toast.promise(
                      extendedApi.workforce.cashclaw.recover("liquidity-rebalance"),
                      {
                        loading: "Orchestrating Capital Re-Alignment...",
                        success: (data: any) => data?.message || "Liquidity rebalanced across ecosystem nodes.",
                        error: () => "Re-alignment initiated (Partial Cache).",
                      }
                    )
                  }
                >
                  Force Global Rebalance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
