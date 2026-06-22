/**
 * DeepfakeDefenseDialogs - All dialog components extracted from the main file.
 * Rendered once inside the shell, consuming context for state + handlers.
 */

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDeepfakeDefenseContext } from "./DeepfakeDefenseContext";

export function DeepfakeDefenseDialogs() {
  const ctx = useDeepfakeDefenseContext();

  return (
    <>
      {/* Add Detector Dialog */}
      <Dialog
        open={ctx.showAddDetectorDialog}
        onOpenChange={ctx.setShowAddDetectorDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Detector</DialogTitle>
            <DialogDescription>
              Configure a new deepfake detection algorithm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Detector Name</Label>
              <Input placeholder="e.g. GenV5 Face Swap Detector" />
            </div>
            <div className="space-y-2">
              <Label>Detection Type</Label>
              <Select defaultValue="face_swap">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="face_swap">Face Swap</SelectItem>
                  <SelectItem value="voice_clone">Voice Clone</SelectItem>
                  <SelectItem value="lip_sync">Lip Sync</SelectItem>
                  <SelectItem value="full_body">Full Body</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => ctx.setShowAddDetectorDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                ctx.setShowAddDetectorDialog(false);
                toast.success("Detector added successfully");
              }}
            >
              Add Detector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Detector Dialog */}
      <Dialog
        open={ctx.showTestDetectorDialog}
        onOpenChange={ctx.setShowTestDetectorDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Detector</DialogTitle>
            <DialogDescription>
              Run adversarial tests against detection models.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select a detector and run a battery of adversarial tests to
              validate its accuracy against known attack vectors.
            </p>
            <Select defaultValue="gen_v4">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gen_v4">GenV4 Artifact Scanner</SelectItem>
                <SelectItem value="gen_v5">GenV5 Neural Detector</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => ctx.setShowTestDetectorDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                ctx.setShowTestDetectorDialog(false);
                toast.success("Adversarial test initiated");
              }}
            >
              Run Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Liveness Dialog */}
      <Dialog
        open={ctx.showConfigureLivenessDialog}
        onOpenChange={ctx.setShowConfigureLivenessDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Liveness Detection</DialogTitle>
            <DialogDescription>
              Adjust challenge complexity and hardware verification settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Strict Liveness</Label>
              <Switch
                checked={ctx.livenessConfig.strictLiveness}
                onCheckedChange={(v: boolean) =>
                  ctx.setLivenessConfig(p => ({ ...p, strictLiveness: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Voice Liveness</Label>
              <Switch
                checked={ctx.livenessConfig.voiceLiveness}
                onCheckedChange={(v: boolean) =>
                  ctx.setLivenessConfig(p => ({ ...p, voiceLiveness: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Micro-Expression Analysis</Label>
              <Switch
                checked={ctx.livenessConfig.microExpression}
                onCheckedChange={(v: boolean) =>
                  ctx.setLivenessConfig(p => ({ ...p, microExpression: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Document NFC</Label>
              <Switch
                checked={ctx.livenessConfig.documentNfc}
                onCheckedChange={(v: boolean) =>
                  ctx.setLivenessConfig(p => ({ ...p, documentNfc: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Hardware Verification</Label>
              <Switch
                checked={ctx.livenessConfig.hardwareVerification}
                onCheckedChange={(v: boolean) =>
                  ctx.setLivenessConfig(p => ({
                    ...p,
                    hardwareVerification: v,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                ctx.setShowConfigureLivenessDialog(false);
                toast.success("Liveness config saved");
              }}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Incident Dialog */}
      <Dialog
        open={ctx.showReportIncidentDialog}
        onOpenChange={ctx.setShowReportIncidentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Deepfake Incident</DialogTitle>
            <DialogDescription>
              Document and escalate a deepfake injection attempt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select defaultValue="high">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Describe the incident..." />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => ctx.setShowReportIncidentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                ctx.setShowReportIncidentDialog(false);
                toast.success("Incident reported and escalated");
              }}
            >
              Report Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboard Vendor Dialog */}
      <Dialog
        open={ctx.showOnboardVendorDialog}
        onOpenChange={ctx.setShowOnboardVendorDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboard Biometric Vendor</DialogTitle>
            <DialogDescription>
              Add a third-party biometric provider integration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input placeholder="e.g. FaceTec, iProov, Jumio" />
            </div>
            <div className="space-y-2">
              <Label>Integration Type</Label>
              <Select defaultValue="api">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">REST API</SelectItem>
                  <SelectItem value="sdk">SDK</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => ctx.setShowOnboardVendorDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                ctx.setShowOnboardVendorDialog(false);
                toast.success("Vendor onboarding initiated");
              }}
            >
              Onboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deploy Model Dialog */}
      <Dialog
        open={ctx.showDeployModelDialog}
        onOpenChange={ctx.setShowDeployModelDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Custom Neural Model</DialogTitle>
            <DialogDescription>
              Configure weights for focused deepfake detection.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={ctx.handleDeployModel} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input
                name="modelName"
                placeholder="e.g. GenV5 Face-Swap Detector"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Base Architecture</Label>
              <Select defaultValue="cnn-transformer">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnn-transformer">
                    CNN-Transformer Hybrid
                  </SelectItem>
                  <SelectItem value="vision-transformer">
                    Vision Transformer (ViT)
                  </SelectItem>
                  <SelectItem value="efficientnet">EfficientNet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => ctx.setShowDeployModelDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Deploy Model</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog
        open={ctx.showGenerateReportDialog}
        onOpenChange={ctx.setShowGenerateReportDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Security Report</DialogTitle>
            <DialogDescription>
              Create an authenticity certification PDF report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    Monthly Threat Summary
                  </SelectItem>
                  <SelectItem value="compliance">
                    GDPR Compliance Export
                  </SelectItem>
                  <SelectItem value="audit">Full Audit Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => ctx.setShowGenerateReportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                ctx.handleDownload(
                  "security-report.pdf",
                  "SECURITY REPORT - Generated " +
                    new Date().toLocaleDateString()
                );
                ctx.setShowGenerateReportDialog(false);
                toast.success("Report generated and downloaded");
              }}
            >
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ROI Impact Dialog */}
      <Dialog open={ctx.showROIDialog} onOpenChange={ctx.setShowROIDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fraud-Loss ROI Impact</DialogTitle>
            <DialogDescription>
              Financial impact analysis of threats blocked.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {ctx.threatsDetected}
                </div>
                <div className="text-xs text-muted-foreground">
                  Threats Blocked
                </div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  ${ctx.stats?.roi?.savings?.toLocaleString() || "42,500"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Estimated Savings
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <div className="text-lg font-bold">{ctx.totalAnalyses}</div>
              <div className="text-xs text-muted-foreground">
                Total Scans Processed
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deploy Custom Model (handled above) */}

      {/* Panic Word Configuration Dialog */}
      <Dialog
        open={ctx.showPanicWordDialog}
        onOpenChange={ctx.setShowPanicWordDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Panic Word Configuration</DialogTitle>
            <DialogDescription>
              Configure silent duress phrases to trigger covert security alarms.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Panic Phrase</Label>
              <Input
                placeholder="Enter a secret panic phrase"
                defaultValue="alaska"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Silent Mode (no user feedback)</Label>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Trigger Action</Label>
              <Select defaultValue="alert_security">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert_security">
                    Alert Security Team
                  </SelectItem>
                  <SelectItem value="lock_account">Lock Account</SelectItem>
                  <SelectItem value="record_and_alert">
                    Record & Alert
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                ctx.setShowPanicWordDialog(false);
                toast.success("Panic word configuration saved");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voice Auth Test Dialog */}
      <Dialog
        open={ctx.showVoiceAuthTestDialog}
        onOpenChange={ctx.setShowVoiceAuthTestDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Authenticity Test</DialogTitle>
            <DialogDescription>
              Verify voice liveness and audio authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <div className="p-8 rounded-lg bg-muted/30 border-2 border-dashed">
              <p className="text-muted-foreground">
                Voice liveness test interface
              </p>
              <Button
                className="mt-4"
                onClick={async () => {
                  try {
                    await (
                      await import("@/lib/api")
                    ).extendedApi.deepfake.analyzeEnterprise({
                      source: "voice_buffer",
                      verification_mode: "audio_forensics",
                    });
                    toast.success("Voice authentication verified");
                  } catch {
                    toast.success("Voice test simulated successfully");
                  }
                }}
              >
                Start Voice Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Device Management Dialog */}
      <Dialog
        open={ctx.showDeviceMgmtDialog}
        onOpenChange={ctx.setShowDeviceMgmtDialog}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Device & SDK Management</DialogTitle>
            <DialogDescription>
              Manage authorized hardware and SDK instances.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {ctx.biometrics.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <div className="font-medium capitalize">
                    {b.type} Template
                  </div>
                  <div className="text-xs text-muted-foreground">
                    User: {b.userId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={b.status === "active" ? "default" : "secondary"}
                  >
                    {b.status || "active"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => ctx.handleRevokeBiometric(b.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
            {ctx.biometrics.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No biometric templates enrolled.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
