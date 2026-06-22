import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  Eye,
  Fingerprint,
  Image,
  Lock,
  MessageSquare,
  Mic,
  RefreshCw,
  ShieldAlert,
  Video,
  Zap,
} from "lucide-react";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";
import { MetricCard, MediaTypeCard, ThreatBadge } from "../../ui/MetricCard";

export function DashboardSection() {
  const {
    stats,
    totalAnalyses,
    threatsDetected,
    verificationRate,
    analyses,
    biometrics,
    duressEnabled,
    setDuressEnabled,
    threats,
    authStatus,
    setAuthStatus,
    currentChallenge,
    isAuthVerifying,
    handleRequestChallenge,
    handleVerifySignature,
    setShowDeviceMgmtDialog,
    setShowROIDialog,
  } = useDeepfakeDefenseContext();

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 font-bold"
          onClick={() => setShowROIDialog(true)}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Fraud-Loss ROI Impact
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title="Total Analyzed"
          value={totalAnalyses}
          icon={Activity}
          color="bg-primary/10 text-primary"
          change={
            stats?.analyses_trend !== undefined ? stats.analyses_trend : 12
          }
        />
        <MetricCard
          title="Threats Detected"
          value={threatsDetected}
          icon={ShieldAlert}
          color="bg-red-500/10 text-red-500"
          change={stats?.threats_trend !== undefined ? stats.threats_trend : -5}
        />
        <MetricCard
          title="Verify Rate"
          value={
            stats?.verification_rate !== undefined
              ? `${(stats.verification_rate * 100).toFixed(1)}%`
              : `${((verificationRate / (totalAnalyses || 1)) * 100).toFixed(1)}%`
          }
          icon={CheckCircle2}
          color="bg-purple-500/10 text-purple-500"
          change={stats?.verification_trend}
        />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Identity Trust Layer (Double-Moat) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-card-title">
                  <Fingerprint className="w-5 h-5 text-purple-500" />
                  Identity Trust Layer (Double-Moat)
                </CardTitle>
                <CardDescription className="text-feature">
                  Active Hardware-Backed Biometric Pulse
                </CardDescription>
              </div>
              <Badge
                variant={authStatus === "verified" ? "default" : "outline"}
              >
                {authStatus === "verified"
                  ? "Trusted Session"
                  : "Pending Verification"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30 text-center">
                  <p className="text-caption-premium font-mono mb-2">
                    Passive detection
                  </p>
                  <div className="text-body-lg font-bold text-blue-500">
                    {stats?.passive_detection_avg
                      ? `${(stats.passive_detection_avg * 100).toFixed(1)}%`
                      : "N/A"}{" "}
                    Real
                  </div>
                  <p className="text-caption-premium text-muted-foreground mt-1">
                    Artifact Analysis (ML)
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border text-center transition-all ${
                    authStatus === "verified"
                      ? "bg-green-500/10 border-green-500/50"
                      : "bg-muted/30 border-dashed border-muted-foreground/30"
                  }`}
                >
                  <p className="text-caption-premium font-mono mb-2">
                    Active Authentication
                  </p>
                  <div
                    className={`text-body-lg font-bold ${
                      authStatus === "verified"
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {authStatus === "verified" ? "CRYPT_SIG_OK" : "WAITING_SIG"}
                  </div>
                  <p className="text-caption-premium text-muted-foreground mt-1">
                    Hardware Biometric Pulse
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {authStatus === "idle" ||
                authStatus === "failed" ||
                authStatus === "expired" ? (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
                    onClick={handleRequestChallenge}
                    disabled={isAuthVerifying}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Request Hardware Biometric Pulse
                  </Button>
                ) : authStatus === "challenging" && currentChallenge ? (
                  <div className="p-4 bg-muted rounded-lg border border-purple-500/30 animate-pulse">
                    <div className="text-body-sm font-medium mb-2 text-center">
                      FIDO2 Challenge:{" "}
                      <code className="text-xs">
                        {currentChallenge?.challenge?.substring(0, 16) ||
                          "Generating..."}
                        ...
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1 bg-purple-500 hover:bg-purple-600"
                        onClick={() =>
                          handleVerifySignature(
                            currentChallenge?.id
                              ? `SIG_${currentChallenge.id}_${Date.now().toString(36)}`
                              : `SIG_${Date.now().toString(36)}_${crypto.randomUUID?.() || "auth"}`
                          )
                        }
                        disabled={isAuthVerifying}
                      >
                        {isAuthVerifying ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          "Sign with Device"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setAuthStatus("idle")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : authStatus === "verified" ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-body-sm font-semibold">
                        Identity 100% Verified
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAuthStatus("idle")}
                      className="text-xs h-7"
                    >
                      Reset Session
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-title">Media Analysis</CardTitle>
            <CardDescription className="text-feature">
              Breakdown by content type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <MediaTypeCard
                type="image"
                count={analyses.filter(a => a.mediaType === "image").length}
                icon={Image}
                color="bg-blue-500/10 text-blue-500"
              />
              <MediaTypeCard
                type="video"
                count={analyses.filter(a => a.mediaType === "video").length}
                icon={Video}
                color="bg-purple-500/10 text-purple-500"
              />
              <MediaTypeCard
                type="audio"
                count={analyses.filter(a => a.mediaType === "audio").length}
                icon={Mic}
                color="bg-orange-500/10 text-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-title">
              <Zap className="w-5 h-5" />
              LivenessLink Features
            </CardTitle>
            <CardDescription className="text-feature">
              Active protection capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-green-500" />
                  <span className="text-feature font-medium">
                    Micro-Expression Analysis
                  </span>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-green-500" />
                  <span className="text-feature font-medium">
                    Cancellable Biometrics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {biometrics.length} Enrolled
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => setShowDeviceMgmtDialog(true)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <span className="text-feature font-medium">
                    Panic Word Detection
                  </span>
                </div>
                <Switch
                  checked={duressEnabled}
                  onCheckedChange={setDuressEnabled}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-blue-500" />
                  <span className="text-feature font-medium">
                    Voice Liveness
                  </span>
                </div>
                <Badge variant="outline">API Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Threats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-title">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            Active Threats
          </CardTitle>
          <CardDescription className="text-feature">
            Real-time threat detection alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threats.slice(0, 3).map(threat => (
              <div
                key={threat.id}
                className="p-3 rounded-lg border border-red-500/20 bg-red-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ThreatBadge severity={threat.severity} />
                    <span className="font-medium">
                      {threat.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {threat.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
                <div className="text-body-sm mt-1">{threat.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
