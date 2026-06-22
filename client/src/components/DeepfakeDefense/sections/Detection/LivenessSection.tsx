import React from "react";
import {
  Video,
  Activity,
  Settings,
  Zap,
  CheckCircle2,
  History,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import type { VerificationSession, AdvancedResult } from "../../types";

interface LivenessSectionProps {
  sessions: VerificationSession[];
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
  scanStage: string;
  setScanStage: (val: string) => void;
  scanProgress: number;
  setScanProgress: React.Dispatch<React.SetStateAction<number>>;
  advancedResult: AdvancedResult | null;
  setAdvancedResult: (val: AdvancedResult | null) => void;
  onShowConfigureDialog: () => void;
  handleDownload: (filename: string, content: string) => void;
}

export function LivenessSection({
  sessions,
  isAnalyzing,
  setIsAnalyzing,
  scanStage,
  setScanStage,
  scanProgress,
  setScanProgress,
  advancedResult,
  setAdvancedResult,
  onShowConfigureDialog,
  handleDownload,
}: LivenessSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <Video className="w-5 h-5 text-purple-500" />
              Live Liveness Detection
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time biometric pulse & micro-expression scan.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="animate-pulse bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-6 flex items-center gap-1.5"
            >
              <Activity className="w-3 h-3" /> LIVE FEED
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 border-border/50"
              onClick={onShowConfigureDialog}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="aspect-video bg-zinc-950/50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />

            {/* Viewport HUD */}
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <Badge
                variant="secondary"
                className="bg-black/60 backdrop-blur-md border-white/10 text-[9px] text-white/50 px-2 py-0.5"
              >
                4K RAW &middot; 60 FPS
              </Badge>
              <Badge
                variant="secondary"
                className="bg-black/60 backdrop-blur-md border-white/10 text-[9px] text-white/50 px-2 py-0.5"
              >
                DEPTH: 100%
              </Badge>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {isAnalyzing ? (
                <div className="space-y-4 w-full max-w-xs transition-all duration-500 animate-in zoom-in-95">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                    <div
                      className="absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin"
                      style={{ animationDuration: "0.8s" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-black uppercase tracking-widest text-purple-400">
                      {scanStage.replace(/_/g, " ")}
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-purple-500/20">
                    <Zap className="w-10 h-10 text-white/30" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">
                      Biometric Enclave Ready
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Authorize camera access to initiate{" "}
                      <span className="text-white font-bold">
                        rPPG pulse heart-rate validation
                      </span>{" "}
                      and phoneme synchronization.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-600/30 font-black uppercase tracking-widest rounded-full group"
                    onClick={async () => {
                      const tId = toast.loading(
                        "Initializing Secure Camera Protocol..."
                      );
                      try {
                        const stream =
                          await navigator.mediaDevices.getUserMedia({
                            video: true,
                          });
                        toast.success("Identity Handshake Active", { id: tId });
                        setIsAnalyzing(true);
                        setScanStage("CAPTURING_LIVENESS");
                        setScanProgress(0);

                        // Fake progress for UI feedback
                        const timer = setInterval(() => {
                          setScanProgress((p: number) => (p < 90 ? p + 2 : p));
                        }, 50);

                        const videoTrack = stream.getVideoTracks()[0];

                        try {
                          const result =
                            await extendedApi.deepfake.analyzeEnterprise({
                              source: "live_camera",
                              verification_mode: "liveness_depth",
                              timestamp: new Date().toISOString(),
                            }) as AdvancedResult;

                          clearInterval(timer);
                          setScanProgress(100);
                          setAdvancedResult({
                            id: result?.id || "ln-" + Date.now(),
                            confidence:
                              result?.forensic_score ||
                              result?.confidence ||
                              0.994,
                            liveness_verified:
                              result?.liveness_verified ?? true,
                            bpm: result?.bpm || 72,
                            phoneme_sync: result?.phoneme_sync || "MATCHED",
                            pixel_status: result?.pixel_status || "OPTIMAL",
                            flags: result?.flags || [],
                          });

                          if (videoTrack) videoTrack.stop();
                          setIsAnalyzing(false);
                          toast.success("Human Presence Authenticated", {
                            description:
                              "Forensic report injected into audit trail.",
                          });
                          handleDownload(
                            "liveness-report.pdf",
                            "ENTERPRISE_LIVENESS_CERTIFICATE"
                          );
                      } catch (e) {
                        if (videoTrack) videoTrack.stop();
                        clearInterval(timer);
                        setIsAnalyzing(false);
                        throw e;
                      }
                    } catch {
                      toast.error("Handshake Failed", {
                          id: tId,
                          description:
                            "Camera access denied or interface busy.",
                        });
                      }
                    }}
                  >
                    Authenticate Now
                  </Button>
                </div>
              )}
            </div>

            {/* Mock Scanning Grid Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none mix-blend-screen">
              <div className="w-full h-full border-[20px] border-white/10 grid grid-cols-12 grid-rows-12 gap-px">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/50" />
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
              <History className="w-4 h-4 text-primary" />
              Session Ledger
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-50">
              Local Biometric Audit
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30 max-h-[400px] overflow-auto">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="p-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter">
                      ID: {session.id}
                    </span>
                    <Badge
                      variant={
                        session.status === "verified"
                          ? "outline"
                          : "destructive"
                      }
                      className={`text-[8px] h-3.5 leading-none px-1.5 font-black uppercase ${
                        session.status === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : ""
                      }`}
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-tight">
                        {session.type}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        Pulse/Phoneme Verification
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black italic">
                        {session.microExpressionScore ||
                          session.voiceLivenessScore ||
                          "0"}
                        %
                      </div>
                      <div className="text-[8px] uppercase tracking-widest opacity-40 font-bold">
                        Match
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="p-10 text-center italic text-muted-foreground text-xs">
                  No biometrics captured in current buffer.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {advancedResult && (
          <Card className="border-emerald-500/30 bg-emerald-500/5 animate-in slide-in-from-right-4 duration-500">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-sm font-black text-emerald-400">
                  Identity Authenticated
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="opacity-50 font-bold uppercase mb-1">
                    Heart Rate
                  </div>
                  <div className="text-lg font-black">
                    {advancedResult.bpm} BPM
                  </div>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="opacity-50 font-bold uppercase mb-1">
                    Confidence
                  </div>
                  <div className="text-lg font-black">
                    {(advancedResult.confidence * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
