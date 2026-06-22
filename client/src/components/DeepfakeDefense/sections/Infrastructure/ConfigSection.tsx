import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Download, Globe, Lock, Server, Shield } from "lucide-react";
import { toast } from "sonner";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function ConfigSection() {
  const {
    retentionDays,
    handleSaveRetention,
    livenessConfig,
    setLivenessConfig,
    ssoConfig,
    handleSSOHandshake,
    proxyEndpoint,
    setProxyEndpoint,
    handleDownload,
  } = useDeepfakeDefenseContext();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Global Identity Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Global Identity Policy
          </CardTitle>
          <CardDescription>
            Enforce organization-wide biometric rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Biometric Data Retention</Label>
            <Select
              value={String(retentionDays)}
              onValueChange={(v: string) => handleSaveRetention(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">180 Days</SelectItem>
                <SelectItem value="365">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Strict Liveness Enforcement</Label>
            <Switch
              checked={livenessConfig.strictLiveness}
              onCheckedChange={(v: boolean) =>
                setLivenessConfig(prev => ({ ...prev, strictLiveness: v }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Enterprise SSO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-500" />
            Enterprise SSO Handshake
          </CardTitle>
          <CardDescription>
            Identity federation for biometric auth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <div className="text-sm font-medium">Provider</div>
              <div className="text-muted-foreground capitalize">
                {ssoConfig.provider}
              </div>
            </div>
            <Badge
              variant={ssoConfig.status === "active" ? "default" : "secondary"}
            >
              {ssoConfig.status}
            </Badge>
          </div>
          <Button
            className="w-full"
            variant="outline"
            onClick={handleSSOHandshake}
          >
            <Lock className="w-4 h-4 mr-2" />
            Verify SSO Handshake
          </Button>
        </CardContent>
      </Card>

      {/* On-Prem Deployment Manifest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-orange-500" />
            On-Prem Deployment Manifest
          </CardTitle>
          <CardDescription>Infrastructure-as-code templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              handleDownload("helm-chart-values.yaml", "HELM_CHART_CONTENT")
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Download Helm Chart
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              handleDownload("terraform-main.tf", "TERRAFORM_CONTENT")
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Download Terraform Config
          </Button>
        </CardContent>
      </Card>

      {/* Multi-Cloud Proxy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            Multi-Cloud Proxy Rules
          </CardTitle>
          <CardDescription>
            Route biometric traffic across providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Biometric Liveness Proxy Endpoint</Label>
            <Input
              placeholder="https://proxy.example.com/biometric"
              value={proxyEndpoint}
              onChange={e => setProxyEndpoint(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() =>
              toast.success(`Proxy updated: ${proxyEndpoint || "(default)"}`)
            }
          >
            Save Rule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
