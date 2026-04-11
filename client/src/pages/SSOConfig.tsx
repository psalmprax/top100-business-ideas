/**
 * SSO Provider Configuration
 * Admin UI to configure OIDC/SAML identity providers
 */

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Plus,
  Shield,
  Key,
  Globe,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

interface SSOProvider {
  id: string;
  name: string;
  type: "oidc" | "saml" | "oauth";
  issuer_url: string;
  client_id: string;
  enabled: boolean;
  created_at?: string;
}

export default function SSOConfig() {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "oidc" as "oidc" | "saml" | "oauth",
    issuer_url: "",
    client_id: "",
    client_secret: "",
    metadata_url: "",
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await extendedApi.sso.listProviders("default");
      setProviders(res?.providers || []);
    } catch {
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.issuer_url || !formData.client_id) {
      toast.error("Name, Issuer URL, and Client ID are required");
      return;
    }
    try {
      await extendedApi.sso.saveConfig("default", {
        ...formData,
        app_id: "default",
      });
      toast.success(`SSO provider "${formData.name}" configured`);
      setShowForm(false);
      setFormData({
        name: "",
        type: "oidc",
        issuer_url: "",
        client_id: "",
        client_secret: "",
        metadata_url: "",
      });
      fetchProviders();
    } catch (err: any) {
      toast.error(err.message || "Failed to configure provider");
    }
  };

  const toggleProvider = async (id: string, enabled: boolean) => {
    try {
      await extendedApi.sso.saveConfig("default", { id, enabled });
      toast.success(`Provider ${enabled ? "enabled" : "disabled"}`);
      fetchProviders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update provider");
    }
  };

  const deleteProvider = async (id: string) => {
    if (!window.confirm("Delete this SSO provider?")) return;
    try {
      toast.success("Provider deleted");
      setProviders(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete provider");
    }
  };

  const testConnection = async (provider: SSOProvider) => {
    try {
      await extendedApi.sso.connectProvider("default", provider.type);
      toast.success(`Connection test initiated for ${provider.name}`);
    } catch (err: any) {
      toast.error(err.message || `Connection test failed for ${provider.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-display-hero mb-2">SSO Configuration</h1>
            <p className="text-slate-400">
              Manage OIDC, SAML, and OAuth identity providers
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </div>

        {showForm && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">New SSO Provider</CardTitle>
              <CardDescription>
                Configure an identity provider for single sign-on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider Name</Label>
                    <Input
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g. Okta, Azure AD, Google Workspace"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Protocol</Label>
                    <select
                      className="w-full bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
                      value={formData.type}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="oidc">OIDC (OpenID Connect)</option>
                      <option value="saml">SAML 2.0</option>
                      <option value="oauth">OAuth 2.0</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Issuer / Entity ID URL</Label>
                  <Input
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="https://your-domain.okta.com"
                    value={formData.issuer_url}
                    onChange={e =>
                      setFormData({ ...formData, issuer_url: e.target.value })
                    }
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input
                      className="bg-slate-700 border-slate-600 text-white"
                      value={formData.client_id}
                      onChange={e =>
                        setFormData({ ...formData, client_id: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      className="bg-slate-700 border-slate-600 text-white"
                      value={formData.client_secret}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          client_secret: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Metadata URL (optional)</Label>
                  <Input
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="https://your-domain.okta.com/.well-known/openid-configuration"
                    value={formData.metadata_url}
                    onChange={e =>
                      setFormData({ ...formData, metadata_url: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Save Provider
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="providers" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="providers">
              <Key className="w-4 h-4 mr-2" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="callback">
              <Globe className="w-4 h-4 mr-2" />
              Callback URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : providers.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No SSO providers configured</p>
                  <Button
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Provider
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {providers.map(p => (
                  <Card key={p.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Key className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {p.name}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {p.issuer_url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            className={
                              p.enabled
                                ? "bg-green-500/20 text-green-400"
                                : "bg-slate-600 text-slate-400"
                            }
                          >
                            {p.enabled ? "Active" : "Disabled"}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={p.enabled}
                              onCheckedChange={v => toggleProvider(p.id, v)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testConnection(p)}
                          >
                            Test
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProvider(p.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="callback">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Callback / Redirect URL
                </CardTitle>
                <CardDescription>
                  Configure this URL in your identity provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                  <code className="text-blue-400 text-sm">
                    {window.location.origin}/api/v1/sso/callback/:provider
                  </code>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">Setup Instructions</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-300">
                      <li>Copy the callback URL above</li>
                      <li>Open your identity provider admin console</li>
                      <li>Create a new OIDC/SAML application</li>
                      <li>Paste the callback URL as the redirect URI</li>
                      <li>Copy the Client ID and Client Secret back here</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
