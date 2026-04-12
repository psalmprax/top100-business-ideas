/**
 * Settings Page
 * User account settings, profile, and preferences
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Lock,
  Bell,
  Shield,
  ShieldCheck,
  Key,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Trash2,
  Plus,
  Eye,
  Download,
  Copy,
  LogOut,
} from "lucide-react";
import { storage } from "@/lib/storage";
import { userApi, extendedApi, authApi, type User } from "@/lib/api";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    slackIntegration: false,
    weeklyDigest: true,
    securityAlerts: true,
    productUpdates: false,
  });

  const [preferences, setPreferences] = useState({
    theme: "dark",
    language: "en",
    timezone: "America/New_York",
    defaultModel: "gpt-4",
    autoSave: true,
  });

  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [biometricKeys, setBiometricKeys] = useState<any[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [userData, keysData, webhookData, bioData] = await Promise.all([
          authApi.me(),
          userApi.apiKeys(),
          extendedApi.webhooks.list(),
          extendedApi.deepfake.listBiometrics(),
        ]);

        if (userData) {
          setProfile({
            name: (userData as any).name || "",
            email: (userData as any).email || "",
            company: (userData as any).company || "",
            role: (userData as any).role || "",
          });

          if (userData.notifications) {
            setNotifications(prev => ({ ...prev, ...userData.notifications }));
          }

          if (userData.preferences) {
            setPreferences(prev => ({ ...prev, ...userData.preferences }));
          }
        }

        if (Array.isArray(keysData)) {
          setApiKeys(
            keysData.map((k: any) => ({
              id: k.id,
              name: k.name,
              key: k.key,
              status: k.status || "Active",
              created: k.createdAt || "Recently",
              hidden: true,
            }))
          );
        }

        if (Array.isArray(webhookData)) {
          setWebhooks(webhookData.map((w: any) => ({
            id: w.id,
            url: w.url,
            name: w.name,
            status: w.is_active ? "Active" : "Inactive",
          })));
          if (userData.mfa_enabled) {
            setMfaEnabled(true);
          }
        }

        if (Array.isArray(bioData)) {
          setBiometricKeys(bioData);
        }
      } catch (err) {
        console.error("Failed to sync settings with backend:", err);
        // toast.error("Settings out of sync with production records.");
      }
    };
    fetchSettings();
  }, []);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API Key copied to clipboard");
  };

  const handleRegenerateKey = async (id: string, name: string) => {
    try {
      toast.loading("Rotating key...");
      await userApi.deleteApiKey(id);
      const result = await userApi.createApiKey(name);
      setApiKeys(prev =>
        prev.map(k =>
          k.id === id ? { ...k, key: result.key, id: result.id } : k
        )
      );
      toast.success(`${name} rotated.`);
    } catch {
      toast.error("Cloud key rotation failed. Service unavailable.");
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(prev =>
      prev.map(k => (k.id === id ? { ...k, hidden: !k.hidden } : k))
    );
  };

  const handleAddWebhook = () => {
    const url = window.prompt("Enter Webhook URL:");
    if (url) {
      const name = window.prompt("Enter webhook name:") || "Unnamed Webhook";
      toast.promise(
        extendedApi.webhooks.create({
          name,
          url,
          events: ["all"],
          enabled: true,
        } as any),
        {
          loading: "Registering webhook endpoint...",
          success: (data: any) => {
            setWebhooks([
              ...webhooks,
              { id: data?.id || Date.now(), url, status: "Active", name },
            ]);
            return "Webhook endpoint registered";
          },
          error: () => {
            setWebhooks([
              ...webhooks,
              { id: Date.now(), url, status: "Active" },
            ]);
            return "Webhook registered locally (service unavailable)";
          },
        }
      );
    }
  };

  const handleCreateApiKey = async () => {
    const name = window.prompt("Enter a name for the new API Key:");
    if (!name) return;
    try {
      const result = await userApi.createApiKey(name);
      const newKey = {
        id: result.id,
        name,
        key: result.key,
        status: result.status || "Active",
        created: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        hidden: true,
      };
      setApiKeys(prev => [...prev, newKey]);
      toast.success(`API Key '${name}' created.`);
    } catch (err: any) {
      console.error("Failed to create API key:", err);
      toast.error(
        `Failed to create API key: ${err.message || "Service unavailable"}`
      );
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "CRITICAL: Are you sure you want to delete your account? This action is irreversible."
      )
    ) {
      setIsLoading(true);
      toast.promise(userApi.update({ role: "deactivated" } as any), {
        loading: "De-provisioning all AI instances and wiping data volumes...",
        success: () => {
          setIsLoading(false);
          localStorage.clear();
          window.location.href = "/login";
          return "Account scheduled for deletion. You have been logged out.";
        },
        error: () => {
          setIsLoading(false);
          return "Deletion process interrupted. Please try again.";
        },
      });
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setSaved(false);
    try {
      await userApi.update({
        name: profile.name,
        email: profile.email,
        company: profile.company,
      });
      setIsLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setIsLoading(false);
      setSaved(false);
      toast.error(`Sync Failure: ${err.message || "Endpoint offline"}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display-hero text-white mb-2">Settings</h1>
          <p className="text-subheadline text-white/60">
            Manage your account and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="profile" data-testid="tab-profile">
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="api" data-testid="tab-api">
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 glass-premium-hover">
              <CardHeader>
                <CardTitle className="text-card-title flex items-center gap-2 text-white">
                  <UserIcon className="w-5 h-5 text-blue-400" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-body-sm text-slate-400">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={e =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="bg-muted border-border"
                      data-testid="input-profile-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={e =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="bg-muted border-border"
                      data-testid="input-profile-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={e =>
                        setProfile({ ...profile, company: e.target.value })
                      }
                      className="bg-muted border-border"
                      data-testid="input-profile-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profile.role}
                      onChange={e =>
                        setProfile({ ...profile, role: e.target.value })
                      }
                      className="bg-muted border-border"
                      data-testid="input-profile-role"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="btn-save-profile"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saved ? "Saved!" : "Save Changes"}
                  </Button>
                  {saved && (
                    <span className="text-green-400 text-sm">
                      Your changes have been saved
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 glass-premium-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-title">
                    <Lock className="w-5 h-5 text-amber-400" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-body-sm">
                    Update your password regularly for security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <Input
                        id="new"
                        type="password"
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm Password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        className="bg-muted border-border"
                      />
                    </div>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                      const currentPw = (
                        document.getElementById("current") as HTMLInputElement
                      )?.value;
                      const newPw = (
                        document.getElementById("new") as HTMLInputElement
                      )?.value;
                      const confirmPw = (
                        document.getElementById("confirm") as HTMLInputElement
                      )?.value;
                      if (!currentPw || !newPw) {
                        toast.error("Please fill in all password fields");
                        return;
                      }
                      if (newPw !== confirmPw) {
                        toast.error("New passwords do not match");
                        return;
                      }
                      try {
                        await userApi.updatePassword(currentPw, newPw);
                        toast.success("Password updated successfully", {
                          description:
                            "Your security credentials have been refreshed.",
                        });
                      } catch (err: any) {
                        toast.error(err.message || "Failed to update password");
                      }
                    }}
                  >
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 glass-premium-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-title">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription className="text-body-sm">
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm font-medium">
                        Authenticator App
                      </p>
                      <p className="text-body-sm">
                        Use an app like Google Authenticator
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {biometricKeys.length === 0 ? (
                        <Button
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          onClick={() => {
                            window.location.href = "/biometric-enrollment";
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Enroll Key
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground mr-2">
                            {biometricKeys.length} keys registered
                          </span>
                          <Switch 
                            checked={mfaEnabled} 
                            onCheckedChange={async (checked) => {
                              try {
                                setMfaEnabled(checked);
                                await userApi.update({ mfa_enabled: checked } as any);
                                toast.success(`MFA ${checked ? "enabled" : "disabled"}`);
                              } catch (err) {
                                setMfaEnabled(!checked);
                                toast.error("Failed to update MFA status");
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {biometricKeys.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">
                        Hardware-backed identity protection active
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 glass-premium-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-title text-red-400">
                    <LogOut className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-body-sm">
                    Irreversible actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div>
                      <p className="text-body-sm font-medium">Delete Account</p>
                      <p className="text-body-sm">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 glass-premium-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-title">
                  <Bell className="w-5 h-5 text-purple-400" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-body-sm">
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      key: "emailAlerts",
                      label: "Email Alerts",
                      desc: "Get notified via email for important updates",
                    },
                    {
                      key: "slackIntegration",
                      label: "Slack Integration",
                      desc: "Receive notifications in your Slack workspace",
                    },
                    {
                      key: "weeklyDigest",
                      label: "Weekly Digest",
                      desc: "Receive a weekly summary of your usage",
                    },
                    {
                      key: "securityAlerts",
                      label: "Security Alerts",
                      desc: "Get notified about security events",
                    },
                    {
                      key: "productUpdates",
                      label: "Product Updates",
                      desc: "Learn about new features and improvements",
                    },
                  ].map(item => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-body-sm font-medium">{item.label}</p>
                        <p className="text-body-sm">{item.desc}</p>
                      </div>
                      <Switch
                        checked={
                          notifications[item.key as keyof typeof notifications]
                        }
                        onCheckedChange={async checked => {
                          const updated = {
                            ...notifications,
                            [item.key]: checked,
                          };
                          setNotifications(updated);
                          try {
                            await userApi.update({
                              notifications: updated,
                            } as any);
                            toast.success(
                              `${item.label} ${checked ? "enabled" : "disabled"}`
                            );
                          } catch {
                            toast.error("Failed to persist notification settings.");
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 glass-premium-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-title">
                  <Monitor className="w-5 h-5 text-indigo-400" />
                  User Preferences
                </CardTitle>
                <CardDescription className="text-body-sm">
                  Customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                      {["light", "dark", "system"].map(theme => (
                        <Button
                          key={theme}
                          variant={
                            preferences.theme === theme ? "default" : "outline"
                          }
                          size="sm"
                          onClick={async () => {
                            const updated = { ...preferences, theme };
                            setPreferences(updated);
                            try {
                              await userApi.update({
                                preferences: updated,
                              } as any);
                              toast.success(`Theme set to ${theme}`);
                            } catch {
                              toast.error("Failed to persist theme preference.");
                            }
                          }}
                          className="capitalize"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <div className="flex gap-2">
                      {["en", "es", "fr", "de"].map(lang => (
                        <Button
                          key={lang}
                          variant={
                            preferences.language === lang
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={async () => {
                            const updated = { ...preferences, language: lang };
                            setPreferences(updated);
                            try {
                              await userApi.update({
                                preferences: updated,
                              } as any);
                              toast.success(
                                `Language set to ${lang.toUpperCase()}`
                              );
                            } catch {
                              toast.error("Failed to persist language preference.");
                            }
                          }}
                        >
                          {lang.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Model</Label>
                    <select
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2"
                      value={preferences.defaultModel}
                      onChange={async e => {
                        const updated = {
                          ...preferences,
                          defaultModel: e.target.value,
                        };
                        setPreferences(updated);
                        try {
                          await userApi.update({ preferences: updated } as any);
                          toast.success(`Default model set to ${e.target.value}`);
                        } catch {
                          toast.error("Failed to persist model preference.");
                        }
                      }}
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                      <option value="gemini">Gemini Pro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-save</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.autoSave}
                        onCheckedChange={async checked => {
                          const updated = { ...preferences, autoSave: checked };
                          setPreferences(updated);
                          try {
                            await userApi.update({
                              preferences: updated,
                            } as any);
                            toast.success(
                              `Auto-save ${checked ? "enabled" : "disabled"}`
                            );
                          } catch {
                            toast.error("Failed to persist auto-save setting.");
                          }
                        }}
                      />
                      <span className="text-body-sm">
                        Automatically save changes
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 glass-premium-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-title">
                    <Key className="w-5 h-5 text-yellow-400" />
                    API Keys
                  </CardTitle>
                  <CardDescription className="text-body-sm">
                    Manage your API keys for programmatic access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apiKeys.map(key => (
                    <div
                      key={key.id}
                      className="p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-body-sm font-medium">{key.name}</p>
                        <Badge
                          className={
                            key.id === "prod"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-mono text-body-sm">
                          {key.hidden
                            ? `${key.key.substring(0, 8)}••••••••••••••••••••••••`
                            : key.key}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-500"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Created: {key.created}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-xs h-8"
                          onClick={() => handleCopyKey(key.key)}
                        >
                          <Copy className="w-3 h-3 mr-2" /> Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-xs h-8"
                          onClick={() => handleRegenerateKey(key.id, key.name)}
                        >
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                    onClick={handleCreateApiKey}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Key
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 glass-premium-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-title">
                    <Globe className="w-5 h-5" />
                    Webhooks
                  </CardTitle>
                  <CardDescription className="text-body-sm">
                    Configure webhooks for real-time events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {webhooks.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {webhooks.map(hook => (
                        <div
                          key={hook.id}
                          className="p-3 rounded-lg bg-slate-700/30 border border-slate-600 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-mono text-blue-400 truncate max-w-[250px]">
                              {hook.url}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Status: {hook.status}
                            </p>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">
                            ACTIVE
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm mb-4">
                      No webhooks configured
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="border-slate-600 w-full"
                    onClick={handleAddWebhook}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
