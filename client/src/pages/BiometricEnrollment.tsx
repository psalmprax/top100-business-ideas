/**
 * Biometric Enrollment UI
 * Register and manage biometric templates for identity verification
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
  Fingerprint,
  Camera,
  Mic,
  Plus,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

export default function BiometricEnrollment() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    enrollment_type: "facial",
    device_id: "",
    user_id: "",
  });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await extendedApi.deepfake.listBiometrics();
      setEnrollments(res || []);
    } catch {
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.enrollment_type || !formData.device_id) {
      toast.error("Enrollment type and device ID are required");
      return;
    }
    try {
      await extendedApi.deepfake.enrollBiometric({
        enrollment_type: formData.enrollment_type,
        device_id: formData.device_id,
        user_id: formData.user_id || undefined,
      });
      toast.success("Biometric enrolled successfully");
      setShowForm(false);
      setFormData({ enrollment_type: "facial", device_id: "", user_id: "" });
      fetchEnrollments();
    } catch (err: any) {
      toast.error(err.message || "Failed to enroll biometric");
    }
  };

  const revokeEnrollment = async (id: string) => {
    if (!window.confirm("Revoke this biometric enrollment?")) return;
    try {
      await extendedApi.deepfake.revokeBiometric(id);
      toast.success("Biometric revoked");
      fetchEnrollments();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke biometric");
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "facial":
        return <Camera className="w-5 h-5 text-blue-400" />;
      case "voice":
        return <Mic className="w-5 h-5 text-purple-400" />;
      case "fingerprint":
        return <Fingerprint className="w-5 h-5 text-green-400" />;
      default:
        return <Shield className="w-5 h-5 text-slate-400" />;
    }
  };

  const activeCount = enrollments.filter(e => e.is_active !== false).length;
  const revokedCount = enrollments.filter(e => e.is_active === false).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-display-hero mb-2">Biometric Enrollment</h1>
            <p className="text-slate-400">
              Manage biometric templates for identity verification
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Enroll Biometric
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-slate-800 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {activeCount}
                  </p>
                  <p className="text-sm text-slate-400">Active Enrollments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {revokedCount}
                  </p>
                  <p className="text-sm text-slate-400">Revoked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                New Biometric Enrollment
              </CardTitle>
              <CardDescription>
                Register a biometric template for identity verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Biometric Type</Label>
                    <select
                      className="w-full bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
                      value={formData.enrollment_type}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          enrollment_type: e.target.value,
                        })
                      }
                    >
                      <option value="facial">Facial Recognition</option>
                      <option value="voice">Voice Print</option>
                      <option value="fingerprint">Fingerprint</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Device ID</Label>
                    <Input
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g. device-001"
                      value={formData.device_id}
                      onChange={e =>
                        setFormData({ ...formData, device_id: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>User ID (optional)</Label>
                  <Input
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Link to specific user"
                    value={formData.user_id}
                    onChange={e =>
                      setFormData({ ...formData, user_id: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Enroll
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

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="revoked">Revoked</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderList(enrollments)}
          </TabsContent>
          <TabsContent value="active" className="space-y-4">
            {renderList(enrollments.filter(e => e.is_active !== false))}
          </TabsContent>
          <TabsContent value="revoked" className="space-y-4">
            {renderList(enrollments.filter(e => e.is_active === false))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function renderList(items: any[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <Fingerprint className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No biometric enrollments found</p>
            <Button
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowForm(true)}
            >
              Enroll Your First Biometric
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="grid gap-4">
        {items.map(e => (
          <Card key={e.id} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                    {typeIcon(e.enrollment_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white capitalize">
                      {e.enrollment_type}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Device: {e.device_id}
                    </p>
                    {e.user_id && (
                      <p className="text-xs text-slate-500">
                        User: {e.user_id}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      e.is_active !== false
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }
                  >
                    {e.is_active !== false ? "Active" : "Revoked"}
                  </Badge>
                  {e.is_active !== false && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeEnrollment(e.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}
