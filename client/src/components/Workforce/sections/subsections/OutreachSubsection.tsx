import React from "react";
import { 
  Rocket, 
  Brain, 
  RefreshCw, 
  Play, 
  Send,
  Check,
  X,
  FileText,
  Search,
  Zap,
  CheckCircle2
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OutreachSubsectionProps {
  autosearchNiche: string;
  setAutosearchNiche: (val: string) => void;
  targetProfile: string;
  setTargetProfile: (val: string) => void;
  isAutosearching: boolean;
  outreachDrafts: any[];
  onRunAutosearch: () => void;
  onApproveOutreach: (id: string) => void;
}

export function OutreachSubsection({
  autosearchNiche,
  setAutosearchNiche,
  targetProfile,
  setTargetProfile,
  isAutosearching,
  outreachDrafts,
  onRunAutosearch,
  onApproveOutreach
}: OutreachSubsectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Autosearch Control Center */}
      <Card className="lg:col-span-1 border-indigo-500/20 bg-indigo-500/5 shadow-2xl h-fit overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-indigo-500/10 to-transparent border-b border-indigo-500/10 py-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2 text-indigo-400 font-black text-xl">
              <Rocket className="w-6 h-6" /> Autosearch
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[8px] font-black uppercase tracking-tighter flex items-center gap-1.5"
            >
              <Brain className="w-2.5 h-2.5" /> PAPERCLIP ENGINE
            </Badge>
          </div>
          <CardDescription className="text-xs font-medium opacity-70">Closed-Loop Autonomous Prospecting & Market Intelligence Nodes.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Campaign Niche</Label>
              <Input
                value={autosearchNiche}
                onChange={e => setAutosearchNiche(e.target.value)}
                placeholder="e.g. AI Compliance for Fintech"
                className="h-10 text-xs border-indigo-500/10 focus-visible:ring-indigo-500/30 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Target Growth Profile</Label>
              <Select
                value={targetProfile}
                onValueChange={setTargetProfile}
              >
                <SelectTrigger className="h-10 text-xs border-indigo-500/10 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enterprise">Enterprise (F500/Global)</SelectItem>
                  <SelectItem value="mid-market">Mid-Market ($10M-$100M)</SelectItem>
                  <SelectItem value="startups">High-Growth Startups</SelectItem>
                  <SelectItem value="government">Government Sector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-indigo-500/10 shadow-inner">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Auto-Deployment</span>
                <span className="text-[9px] text-muted-foreground italic">Skip manual draft preview</span>
              </div>
              <Switch className="data-[state=checked]:bg-indigo-500" />
            </div>
          </div>

          <Button
            onClick={onRunAutosearch}
            disabled={isAutosearching}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 rounded-xl"
          >
            {isAutosearching ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isAutosearching ? "Agents Researching..." : "Kick Off Autosearch Cycle"}
          </Button>

          <div className="pt-6 border-t border-indigo-500/10 space-y-4">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-widest text-center">Engine Performance</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-background border border-border shadow-inner text-center">
                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Precision</div>
                <div className="text-xl font-black text-indigo-400">92.4%</div>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border shadow-inner text-center">
                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter flex items-center justify-center gap-1">
                   <Zap className="w-2.5 h-2.5 text-amber-500" /> Neural Optim
                </div>
                <div className="text-xs font-black text-indigo-400 mt-1 uppercase tracking-widest">STABLE</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outreach Approval Queue */}
      <Card className="lg:col-span-2 shadow-2xl border-border/50 bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 py-6">
          <div>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Send className="w-6 h-6 text-blue-500" />
              Outreach Approval Queue
            </CardTitle>
            <CardDescription className="text-xs font-medium opacity-60">
              {outreachDrafts.length} personalized messages pending forensic human review.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-indigo-400 border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest"
          >
            HUMAN-IN-THE-LOOP
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] custom-scrollbar">
            {outreachDrafts.length > 0 ? (
              <div className="divide-y divide-border/30">
                {outreachDrafts.map(draft => (
                  <div
                    key={draft.id}
                    className="p-6 hover:bg-muted/10 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-lg shadow-inner">
                          {draft.recipient_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-base font-black leading-none mb-1 shadow-indigo-500/10">
                            {draft.recipient_name}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">
                            {draft.recipient_role} @{" "}
                            <span className="text-white">{draft.recipient_company}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black h-5">
                          RESONANCE: {draft.score}%
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[8px] uppercase font-bold h-4 px-1.5 border-border/50 opacity-50"
                        >
                          {draft.profile}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-16 pl-6 border-l-2 border-indigo-500/20 py-2 space-y-3">
                      <div className="text-xs font-black text-indigo-400 uppercase tracking-tight flex items-center gap-2">
                        <FileText className="w-3 h-3 opacity-60" /> Subject: {draft.subject}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed italic opacity-80 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                        "{draft.body}"
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 text-xs font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/5"
                      >
                        <X className="w-4 h-4 mr-2" /> Discard
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 text-xs font-bold border-indigo-500/20 bg-background/50 hover:bg-indigo-500/5 text-indigo-400"
                          >
                            <FileText className="w-4 h-4 mr-2" /> Full Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-zinc-950 border-indigo-500/20 shadow-2xl">
                          <DialogHeader className="border-b border-white/5 pb-4">
                            <DialogTitle className="text-2xl font-black">Forensic Review</DialogTitle>
                            <DialogDescription className="text-xs font-medium opacity-60 uppercase tracking-widest mt-1 text-indigo-400">
                               Personalized Payload for {draft.recipient_company} (Niche: {draft.niche})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-8">
                             <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Subject Line</Label>
                               <Input value={draft.subject} className="h-11 bg-white/5 border-white/10 font-bold" readOnly />
                             </div>
                             <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Message Payload</Label>
                               <textarea
                                 className="w-full min-h-[300px] p-6 text-sm font-medium bg-white/5 rounded-2xl border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed custom-scrollbar shadow-inner text-white/90"
                                 defaultValue={draft.body}
                               />
                             </div>
                          </div>
                          <DialogFooter className="bg-white/5 p-6 rounded-b-2xl border-t border-white/5 mt-4">
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 rounded-xl"
                              onClick={() => onApproveOutreach(draft.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Dispatch Payload
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        className="h-9 px-5 text-xs font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 rounded-lg"
                        onClick={() => onApproveOutreach(draft.id)}
                      >
                        <Check className="w-4 h-4 mr-2" /> Quick Dispatch
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-32 text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 animate-pulse shadow-2xl shadow-indigo-500/20">
                  <Search className="w-10 h-10 text-indigo-500 opacity-40 italic" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black italic">No Payloads Detected</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto font-medium leading-relaxed opacity-60">
                    Kick off a new <span className="text-white font-bold">Autosearch</span> research cycle or ingest fresh lead data to generate forensic-grade outreach messages.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onRunAutosearch}
                  className="border-indigo-500/30 text-indigo-400 font-bold hover:bg-indigo-500/10 rounded-xl h-12 px-8"
                >
                  Initiate Research Cycle &rarr;
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
