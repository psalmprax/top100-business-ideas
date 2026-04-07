/**
 * Webhook Execution History
 * Viewer for webhook delivery attempts and results
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Webhook,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Send,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

export default function WebhookHistory() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: "agent.created,agent.deleted",
  });

  useEffect(() => {
    fetchWebhooks();
    fetchExecutions();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await extendedApi.webhooks.list();
      setWebhooks(res || []);
    } catch {
      setWebhooks([]);
    }
  };

  const fetchExecutions = async () => {
    try {
      const allExecs: any[] = [];
      for (const wh of webhooks) {
        const res = await extendedApi.webhooks.executions(wh.id);
        if (res) allExecs.push(...(Array.isArray(res) ? res : []));
      }
      setExecutions(allExecs);
    } catch {
      setExecutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Name and URL are required");
      return;
    }
    try {
      await extendedApi.webhooks.create({
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events.split(",").map(e => e.trim()),
        enabled: true,
      });
      toast.success("Webhook created");
      setShowCreateForm(false);
      setNewWebhook({ name: "", url: "", events: "" });
      fetchWebhooks();
    } catch (err: any) {
      toast.error(err.message || "Failed to create webhook");
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!window.confirm("Delete this webhook?")) return;
    try {
      await extendedApi.webhooks.delete(id);
      toast.success("Webhook deleted");
      fetchWebhooks();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete webhook");
    }
  };

  const testWebhook = async (id: string) => {
    try {
      await extendedApi.webhooks.test(id);
      toast.success("Test webhook sent");
    } catch (err: any) {
      toast.error(err.message || "Test failed");
    }
  };

  const filteredExecutions = selectedWebhook
    ? executions.filter(e => e.webhook_id === selectedWebhook)
    : executions;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-display-hero mb-2">Webhook History</h1>
            <p className="text-slate-400">
              Monitor webhook delivery attempts and results
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Webhook
          </Button>
        </div>

        {showCreateForm && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Create Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createWebhook} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      className="bg-slate-700 border-slate-600 text-white"
                      value={newWebhook.name}
                      onChange={e =>
                        setNewWebhook({ ...newWebhook, name: e.target.value })
                      }
                      placeholder="e.g. Production Alerts"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      className="bg-slate-700 border-slate-600 text-white"
                      value={newWebhook.url}
                      onChange={e =>
                        setNewWebhook({ ...newWebhook, url: e.target.value })
                      }
                      placeholder="https://your-app.com/webhooks"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Events (comma-separated)</Label>
                  <Input
                    className="bg-slate-700 border-slate-600 text-white"
                    value={newWebhook.events}
                    onChange={e =>
                      setNewWebhook({ ...newWebhook, events: e.target.value })
                    }
                    placeholder="agent.created, agent.deleted, alert.triggered"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="executions" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="executions">
              <Webhook className="w-4 h-4 mr-2" />
              Delivery Log
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Send className="w-4 h-4 mr-2" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Deliveries</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchExecutions();
                  fetchWebhooks();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : filteredExecutions.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    No webhook deliveries recorded
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredExecutions.map(exec => (
                  <Card key={exec.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {exec.status === "delivered" ||
                          exec.status === "success" ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : exec.status === "failed" ||
                            exec.status === "error" ? (
                            <XCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {exec.event || exec.event_type}
                            </p>
                            <p className="text-xs text-slate-400">
                              {exec.webhook_url || exec.webhook_id} ·{" "}
                              {exec.created_at
                                ? new Date(exec.created_at).toLocaleString()
                                : "Just now"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              exec.status === "delivered" ||
                              exec.status === "success"
                                ? "bg-green-500/20 text-green-400"
                                : exec.status === "failed" ||
                                    exec.status === "error"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                            }
                          >
                            {exec.status || "pending"}
                          </Badge>
                          {exec.response_code && (
                            <span className="text-xs text-slate-500">
                              {exec.response_code}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            {webhooks.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Webhook className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No webhooks configured</p>
                  <Button
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create Your First Webhook
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {webhooks.map(wh => (
                  <Card key={wh.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">
                            {wh.name}
                          </h3>
                          <p className="text-sm text-slate-400">{wh.url}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Events: {(wh.events || []).join(", ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              wh.enabled
                                ? "bg-green-500/20 text-green-400"
                                : "bg-slate-600 text-slate-400"
                            }
                          >
                            {wh.enabled ? "Active" : "Disabled"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testWebhook(wh.id)}
                          >
                            Test
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWebhook(wh.id)}
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
        </Tabs>
      </div>
    </div>
  );
}
