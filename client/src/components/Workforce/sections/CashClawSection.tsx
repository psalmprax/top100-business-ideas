import React from "react";
import { 
  TrendingUp, 
  Wallet, 
  Briefcase, 
  Activity, 
  Plus, 
  Zap, 
  RefreshCw 
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { storage } from "@/lib/storage";

interface CashClawSectionProps {
  cashclawData: any;
  setCashclawData: React.Dispatch<React.SetStateAction<any>>;
  skillsMarketplace: any[];
  setSkillsMarketplace: React.Dispatch<React.SetStateAction<any[]>>;
  jobFeed: any[];
  isRecovering: boolean;
  onRecoverRevenue: () => void;
}

export function CashClawSection({
  cashclawData,
  setCashclawData,
  skillsMarketplace,
  setSkillsMarketplace,
  jobFeed,
  isRecovering,
  onRecoverRevenue
}: CashClawSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingUp className="w-20 h-20" />
          </div>
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-amber-200" />
              <Badge className="bg-white/20 text-white border-none font-black text-[9px] uppercase tracking-widest px-2 h-5">LIVE YIELD</Badge>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">$2,847.42</div>
               <div className="text-amber-100/60 text-[10px] font-black uppercase tracking-widest mt-1">Found This Cycle</div>
            </div>
          </CardContent>
        </Card>
        
        {[
          { label: "Treasury Balance", value: `$${cashclawData?.balance?.toLocaleString() || "0"}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Active Job Clusters", value: cashclawData?.activeJobs || "0", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Neural Skills Active", value: cashclawData?.skillsActive || "0", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/40 backdrop-blur-sm shadow-xl hover:border-border transition-all">
            <CardContent className="p-8 space-y-4">
              <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 w-fit">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                 <div className="text-3xl font-black tracking-tighter text-white">{stat.value}</div>
                 <div className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/10 py-6">
            <div className="flex items-center justify-between">
               <CardTitle className="text-xl font-black flex items-center gap-2 text-amber-500">
                 <Briefcase className="w-6 h-6" /> Skills Marketplace
               </CardTitle>
               <Button 
                variant="outline" 
                size="sm" 
                className="h-8 border-amber-500/20 text-amber-500 font-black text-[9px] uppercase tracking-widest bg-amber-500/5 hover:bg-amber-500 hover:text-white transition-all"
                onClick={() => {
                  const skillName = window.prompt("Node Skill Designation:");
                  if (!skillName) return;
                  const price = window.prompt("Unit Price (USD):") || "$10.00";
                  const newSkill = { name: skillName, price, jobs: 0, status: "active" };
                  const updated = [...skillsMarketplace, newSkill];
                  setSkillsMarketplace(updated);
                  storage.set("workforce_marketplace", updated);
                  setCashclawData((prev: any) => ({ ...prev, skillsActive: (prev.skillsActive || 0) + 1 }));
                  toast.success(`Skill node "${skillName}" deployed at ${price}/unit`);
                }}
              >
                 <Plus className="w-3.5 h-3.5 mr-1.5" /> Deploy Node
               </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30 max-h-[400px] overflow-auto custom-scrollbar">
              {skillsMarketplace.map((skill: any, idx: number) => (
                <div key={idx} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Zap className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="text-sm font-black text-white">{skill.name}</div>
                        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">{skill.jobs} successful executions</div>
                     </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <div className="text-base font-black text-emerald-500 tabular-nums">{skill.price}</div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black h-4 px-1.5 uppercase tracking-widest leading-none">
                      {skill.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {skillsMarketplace.length === 0 && (
                 <div className="text-center py-20 text-[10px] font-black uppercase tracking-widest opacity-20 italic">
                    Marketplace Staged & Empty
                 </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
           <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
             <CardHeader className="bg-muted/10 border-b border-border/10 py-6">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4 text-indigo-400" /> Yield Guardrails
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-3">
                {[
                  { rule: "Floor Yield ($5.00)", key: "min_price", default: true },
                  { rule: "Concurrency Cap (3 Nodes)", key: "max_concurrent", default: true },
                  { rule: "Reputation Threshold (>4.5)", key: "client_rating", default: true },
                  { rule: "Forensic NDA Rejection", key: "reject_nda", default: false }
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/50 shadow-inner group transition-all">
                     <span className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors">{r.rule}</span>
                     <Switch 
                       className="data-[state=checked]:bg-indigo-500"
                       checked={storage.get(`autojob_${r.key}`, r.default)}
                       onCheckedChange={(val) => {
                          storage.set(`autojob_${r.key}`, val);
                          toast.success(`${r.rule} guardrail ${val ? 'Active' : 'Bypassed'}`);
                       }}
                     />
                  </div>
                ))}
             </CardContent>
           </Card>

           <Card className="border-amber-500/20 bg-amber-500/5 shadow-2xl relative overflow-hidden group">
              <CardHeader className="py-6 border-b border-amber-500/10">
                 <CardTitle className="text-xl font-black flex items-center gap-3 text-amber-500">
                    <TrendingUp className="w-7 h-7" /> CashClaw Recovery
                 </CardTitle>
                 <CardDescription className="text-xs font-medium opacity-60">Autonomous retrieval of leaked or uncollected revenue nodes.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="p-6 rounded-3xl bg-background/80 border border-amber-500/10 shadow-inner backdrop-blur-sm relative z-10">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Leaked Revenue Detected</span>
                       <span className="text-3xl font-black text-amber-500 tabular-nums">
                          ${cashclawData?.leakedRevenue?.toLocaleString() || "0"}.00
                       </span>
                    </div>
                    <p className="text-[10px] text-amber-200/60 leading-relaxed italic border-l-2 border-amber-500/20 pl-4 py-1">
                      "AI agents have identified <span className="text-white font-bold">4 uncollected payment vectors</span> from historical invoicing drift. Forensic recovery possible."
                    </p>
                 </div>
                 <Button
                   className="w-full bg-amber-600 hover:bg-amber-700 h-14 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-amber-600/30 rounded-2xl relative z-10"
                   onClick={onRecoverRevenue}
                   disabled={isRecovering}
                 >
                   {isRecovering ? (
                     <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Retrieving Nodes...</>
                   ) : (
                     <><Zap className="w-5 h-5 mr-3" /> Execute Recovery Cycle</>
                   )}
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/10 py-6">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-500" /> Live Job Feed
          </CardTitle>
          <CardDescription className="text-xs font-medium opacity-60">Real-time stream of autonomous skill execution & settlement.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-border/30">
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-14">Job Designation</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-14">Client Node</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-14">Settlement</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-14">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-14">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobFeed.map((item, idx) => (
                <TableRow key={idx} className="border-border/10 hover:bg-white/5 transition-all">
                  <TableCell className="font-black text-sm text-white py-5">{item.job}</TableCell>
                  <TableCell className="text-xs font-medium opacity-60">{item.client}</TableCell>
                  <TableCell className="font-black text-base text-emerald-500 tabular-nums">{item.price}</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-black h-5 uppercase tracking-widest">
                       {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground/40">{item.time}</TableCell>
                </TableRow>
              ))}
              {jobFeed.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center py-32 text-[10px] font-black uppercase tracking-widest opacity-20 italic">
                      No active jobs being executed.
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
