/**
 * On-Prem Deployment Manager
 * Manage on-premises Kubernetes deployments
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Server,
  Download,
  CheckCircle,
  AlertTriangle,
  Plus,
  Copy,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

export default function OnPremManager() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manifest, setManifest] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<any[]>([]);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    try {
      const data = await extendedApi.edge.deployments();
      setDeployments(data || []);
    } catch {
      setDeployments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      setIsLoading(true);
      const res = await extendedApi.onPrem.deploy({
        name: "alpha-on-prem-" + Date.now().toString().slice(-4),
        type: "kubernetes",
        nodes: 3
      });
      toast.success(res.message || "Deployment handshake initiated");
      await fetchDeployments();
    } catch (err: any) {
      toast.error(err.message || "Deployment handshake failed");
    } finally {
      setIsLoading(false);
    }
  };

  const generateManifest = async () => {
    try {
      const res = await extendedApi.onPrem.manifest("kubernetes");
      setManifest(res?.manifest || res?.content || "");
      toast.success("Manifest generated");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate manifest");
    }
  };

  const getChecklist = async () => {
    try {
      const res = await extendedApi.onPrem.checklist();
      const items = (res?.checklist || []).map((item: string, i: number) => ({
        title: item,
        description: `Requirement ${i + 1} for on-prem deployment`,
        met: false,
      }));
      setChecklist(items);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch checklist");
    }
  };

  const copyManifest = () => {
    if (manifest) {
      navigator.clipboard.writeText(manifest);
      toast.success("Manifest copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display-hero mb-2">On-Prem Deployments</h1>
          <p className="text-slate-400">
            Manage self-hosted Kubernetes deployments
          </p>
        </div>

        <Tabs defaultValue="deployments" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="deployments">
              <Server className="w-4 h-4 mr-2" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="manifest">
              <FileText className="w-4 h-4 mr-2" />
              Manifest
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <CheckCircle className="w-4 h-4 mr-2" />
              Checklist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deployments" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Active Deployments</h2>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleDeploy}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Deployment
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : deployments.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Server className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    No on-prem deployments configured
                  </p>
                  <Button
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={handleDeploy}
                  >
                    Initiate Production Handshake
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {deployments.map(dep => (
                  <Card key={dep.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">
                            {dep.name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {dep.location} · {dep.model_version}
                          </p>
                        </div>
                        <Badge
                          className={
                            dep.status === "healthy"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {dep.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manifest" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Kubernetes Manifest
                </CardTitle>
                <CardDescription>
                  Generate and download deployment manifests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Deployment Name</Label>
                    <Input
                      className="bg-slate-700 border-slate-600"
                      placeholder="alpha-on-prem"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Node Count</Label>
                    <Input
                      type="number"
                      className="bg-slate-700 border-slate-600"
                      defaultValue="3"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={generateManifest}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                  {manifest && (
                    <Button variant="outline" onClick={copyManifest}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </div>
                {manifest && (
                  <pre className="font-mono text-sm text-green-400 bg-slate-900 p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap">
                    {manifest}
                  </pre>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Pre-Deployment Checklist
                </CardTitle>
                <CardDescription>
                  Verify requirements before deploying
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={getChecklist}
                  className="mb-4 bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Load Checklist
                </Button>
                {checklist.length > 0 ? (
                  <div className="space-y-3">
                    {checklist.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600"
                      >
                        {item.met ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    Click "Load Checklist" to view requirements
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
