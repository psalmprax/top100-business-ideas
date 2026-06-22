import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Globe,
  Lock,
  MessageSquare,
  Mic,
  Settings,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function SettingsSection() {
  const {
    duressEnabled,
    setDuressEnabled,
    livenessConfig,
    setLivenessConfig,
    setShowDeviceMgmtDialog,
  } = useDeepfakeDefenseContext();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Label>GraphQL Gateway</Label>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <Label>Panic Word Detection</Label>
              </div>
              <Switch
                checked={duressEnabled}
                onCheckedChange={setDuressEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-muted-foreground" />
                <Label>Voice Liveness</Label>
              </div>
              <Switch
                checked={livenessConfig.voiceLiveness}
                onCheckedChange={(v: boolean) =>
                  setLivenessConfig(p => ({ ...p, voiceLiveness: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <Label>Micro-Expression Analysis</Label>
              </div>
              <Switch
                checked={livenessConfig.microExpression}
                onCheckedChange={(v: boolean) =>
                  setLivenessConfig(p => ({ ...p, microExpression: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Label>Document NFC Validation</Label>
              </div>
              <Switch
                checked={livenessConfig.documentNfc}
                onCheckedChange={(v: boolean) =>
                  setLivenessConfig(p => ({ ...p, documentNfc: v }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Integrations & Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Integration & Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                <span className="text-sm">SSO (Okta)</span>
              </div>
              <Badge variant="outline">Connected</Badge>
            </div>
            <div className="p-3 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">Mobile SDK</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => setShowDeviceMgmtDialog(true)}
              >
                Manage Devices
              </Button>
            </div>
            <div className="p-3 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <span className="text-sm">REST API</span>
              </div>
              <Badge className="bg-emerald-500">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Security Threshold Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Alert Channel</Label>
              <Select defaultValue="slack">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack #security-alerts</SelectItem>
                  <SelectItem value="email">
                    Email (security@alpha.ai)
                  </SelectItem>
                  <SelectItem value="pagerduty">PagerDuty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.success("Alert channel configured")}
            >
              Save Alert Config
            </Button>
          </CardContent>
        </Card>

        {/* Fraud Webhook Relay */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Fraud Webhook Relay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input placeholder="https://hooks.example.com/fraud-alerts" />
            </div>
            <Button
              className="w-full"
              onClick={() => toast.success("Webhook relay saved")}
            >
              Save Webhook
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
