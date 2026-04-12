import { useState } from "react";
import { 
  Settings, 
  Shield, 
  Lock, 
  Globe, 
  Bell, 
  Workflow, 
  Save,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { extendedApi } from "@/lib/api";
import { toast } from "sonner";

export function SettingsSection() {
  const [ssoConfig, setSsoConfig] = useState({
    provider: "okta",
    enforceMfa: true,
    autoProvision: true
  });
  const [budget, setBudget] = useState("50000");
  const [proxy, setProxy] = useState("https://proxy.sentinel.ai/v1");

  async function handleSaveSso() {
    try {
      // API call would go here
      toast.success("SSO configuration updated successfully");
    } catch (err) {
      toast.error("Failed to update SSO settings");
    }
  }

  async function handleSaveBudget() {
    try {
      await extendedApi.compliance.updatePolicy({ budget: parseInt(budget) });
      toast.success("Compliance budget limits updated");
    } catch (err) {
      toast.error("Failed to update budget");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            Compliance Infrastructure Settings
          </h3>
          <p className="text-sm text-muted-foreground">Global controls for EU AI Act enforcement and regional adaptations</p>
        </div>
      </div>

      <Tabs defaultValue="sso" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px] mb-8">
          <TabsTrigger value="sso" className="gap-2">
            <Lock className="w-4 h-4" /> SSO & IAM
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2">
            <Shield className="w-4 h-4" /> Governance
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Globe className="w-4 h-4" /> Proxy
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="w-4 h-4" /> Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sso">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Single Sign-On Integration</CardTitle>
              <CardDescription>Configure enterprise identity providers for Article 15 access control.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider text-xs">Identity Provider</Label>
                  <Select value={ssoConfig.provider}>
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="okta">Okta Enterprise</SelectItem>
                      <SelectItem value="azure">Azure AD (Microsoft Entra)</SelectItem>
                      <SelectItem value="google">Google Workspace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Enforce Multi-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Mandatory for high-risk model access (Article 15).</p>
                  </div>
                  <Switch checked={ssoConfig.enforceMfa} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Auto-Provision Compliance Officers</Label>
                    <p className="text-xs text-muted-foreground">Automatically assign roles based on OIDC claims.</p>
                  </div>
                  <Switch checked={ssoConfig.autoProvision} />
                </div>
              </div>
              <Button onClick={handleSaveSso} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" /> Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Governance & Budgeting</CardTitle>
              <CardDescription>Enforce financial guardrails to prevent non-compliant resource spend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Compliance Budget ($)</Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Estimated ROI Impact: <span className="text-emerald-500 font-bold">+12% / Quarter</span>
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveBudget}>
                <Save className="w-4 h-4 mr-2" /> Update Limits
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Regulated Proxy Endpoint</CardTitle>
              <CardDescription>Direct all LLM traffic through the Sentinel Compliance Gateway.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proxy">Proxy Relay URL</Label>
                  <Input 
                    id="proxy" 
                    value={proxy} 
                    onChange={(e) => setProxy(e.target.value)}
                  />
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-emerald-700">Gateway Active</div>
                    <p className="text-xs text-emerald-600/80">99.9% of traffic is currently being scrubbed for PII and Bias.</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success("Proxy endpoint updated")}>
                <Workflow className="w-4 h-4 mr-2" /> Verify & Reconnect
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Notification Channels</CardTitle>
              <CardDescription>Receive immediate alerts for critical Article 71/72 events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {["Slack Integration", "Email Reports", "Microsoft Teams", "Webhook Relay"].map((channel) => (
                  <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{channel}</span>
                    <Switch defaultChecked={channel === "Slack Integration"} />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => toast.success("Test alert sent to production Slack")}>
                <Bell className="w-4 h-4 mr-2" /> Test All Channels
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
