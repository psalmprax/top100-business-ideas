/**
 * Settings Page
 * User account settings, profile, and preferences
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Eye, Download, Copy, LogOut } from 'lucide-react';
import {
    User,
    Mail,
    Lock,
    Bell,
    Shield,
    Key,
    Save,
    Loader2,
    Check,
    AlertCircle,
    Globe,
    Smartphone,
    Monitor,
    Database,
    Trash2
} from 'lucide-react';

export default function Settings() {
    const [isLoading, setIsLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form states
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@company.com',
        company: 'Acme Inc.',
        role: 'CTO',
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        slackIntegration: false,
        weeklyDigest: true,
        securityAlerts: true,
        productUpdates: false,
    });

    const [preferences, setPreferences] = useState({
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        defaultModel: 'gpt-4',
        autoSave: true,
    });

    const handleSaveProfile = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-slate-400">Manage your account and preferences</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="bg-slate-800">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        <TabsTrigger value="api">API Keys</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription className="text-slate-400">
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
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            value={profile.company}
                                            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Input
                                            id="role"
                                            value={profile.role}
                                            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : saved ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {saved ? 'Saved!' : 'Save Changes'}
                                    </Button>
                                    {saved && (
                                        <span className="text-green-400 text-sm">Your changes have been saved</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="space-y-6">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="w-5 h-5" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Update your password regularly for security
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Current Password</Label>
                                        <Input
                                            id="current"
                                            type="password"
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new">New Password</Label>
                                            <Input
                                                id="new"
                                                type="password"
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm">Confirm Password</Label>
                                            <Input
                                                id="confirm"
                                                type="password"
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={() => {
                                            toast.success("Password updated successfully", {
                                                description: "Your security credentials have been refreshed."
                                            });
                                        }}
                                    >
                                        Update Password
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Two-Factor Authentication
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Add an extra layer of security to your account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Authenticator App</p>
                                            <p className="text-sm text-slate-400">Use an app like Google Authenticator</p>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="border-slate-600"
                                            onClick={() => {
                                                toast.success("Authenticator app linked", {
                                                    description: "2FA is now active for your account."
                                                });
                                            }}
                                        >
                                            Enable
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-400">
                                        <LogOut className="w-5 h-5" />
                                        Danger Zone
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Irreversible actions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <div>
                                            <p className="font-medium">Delete Account</p>
                                            <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
                                        </div>
                                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notification Preferences
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Choose how you want to be notified
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {[
                                        { key: 'emailAlerts', label: 'Email Alerts', desc: 'Get notified via email for important updates' },
                                        { key: 'slackIntegration', label: 'Slack Integration', desc: 'Receive notifications in your Slack workspace' },
                                        { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your usage' },
                                        { key: 'securityAlerts', label: 'Security Alerts', desc: 'Get notified about security events' },
                                        { key: 'productUpdates', label: 'Product Updates', desc: 'Learn about new features and improvements' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{item.label}</p>
                                                <p className="text-sm text-slate-400">{item.desc}</p>
                                            </div>
                                            <Switch
                                                checked={notifications[item.key as keyof typeof notifications]}
                                                onCheckedChange={(checked) => setNotifications({
                                                    ...notifications,
                                                    [item.key]: checked
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preferences">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="w-5 h-5" />
                                    User Preferences
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Customize your experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Theme</Label>
                                        <div className="flex gap-2">
                                            {['light', 'dark', 'system'].map((theme) => (
                                                <Button
                                                    key={theme}
                                                    variant={preferences.theme === theme ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setPreferences({ ...preferences, theme })}
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
                                            {['en', 'es', 'fr', 'de'].map((lang) => (
                                                <Button
                                                    key={lang}
                                                    variant={preferences.language === lang ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setPreferences({ ...preferences, language: lang })}
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
                                            onChange={(e) => setPreferences({ ...preferences, defaultModel: e.target.value })}
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
                                                onCheckedChange={(checked) => setPreferences({ ...preferences, autoSave: checked })}
                                            />
                                            <span className="text-sm text-slate-400">Automatically save changes</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="api">
                        <div className="space-y-6">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5" />
                                        API Keys
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Manage your API keys for programmatic access
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">Production Key</p>
                                            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                                        </div>
                                        <p className="font-mono text-sm text-slate-400 mb-2">sk_live_••••••••••••••••••••••••</p>
                                        <p className="text-xs text-slate-500">Created: Jan 15, 2024</p>
                                        <div className="flex gap-2 mt-3">
                                            <Button variant="outline" size="sm" className="border-slate-600">
                                                Copy
                                            </Button>
                                            <Button variant="outline" size="sm" className="border-slate-600">
                                                Regenerate
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">Development Key</p>
                                            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                                Test Mode
                                            </Badge>
                                        </div>
                                        <p className="font-mono text-sm text-slate-400 mb-2">sk_test_••••••••••••••••••••••••</p>
                                        <p className="text-xs text-slate-500">Created: Jan 10, 2024</p>
                                        <div className="flex gap-2 mt-3">
                                            <Button variant="outline" size="sm" className="border-slate-600">
                                                Copy
                                            </Button>
                                            <Button variant="outline" size="sm" className="border-slate-600">
                                                Regenerate
                                            </Button>
                                        </div>
                                    </div>

                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Key className="w-4 h-4 mr-2" />
                                        Create New Key
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        Webhooks
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Configure webhooks for real-time events
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400 text-sm mb-4">No webhooks configured</p>
                                    <Button variant="outline" className="border-slate-600">
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
