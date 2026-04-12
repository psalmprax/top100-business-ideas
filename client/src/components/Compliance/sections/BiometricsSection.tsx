import { useState, useEffect } from "react";
import { 
  Fingerprint, 
  Trash2, 
  Plus, 
  ShieldCheck,
  RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { extendedApi } from "@/lib/api";
import { toast } from "sonner";

export function BiometricsSection() {
  const [biometrics, setBiometrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBiometrics();
  }, []);

  async function loadBiometrics() {
    setLoading(true);
    try {
      const data = await extendedApi.deepfake.listBiometrics();
      setBiometrics(data || []);
    } catch (err) {
      console.error("Failed to fetch biometrics", err);
    } finally {
      setLoading(false);
    }
  }

  async function revokeBiometric(id: string) {
    try {
      await extendedApi.deepfake.revokeBiometric(id);
      toast.success("Biometric revoked");
      loadBiometrics();
    } catch (err) {
      toast.error("Failed to revoke biometric");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">Synchronizing biometric vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-blue-500" />
            Biometric Signatures
          </h3>
          <p className="text-sm text-muted-foreground">Managing hardware-backed biometric identities for Deepfake Defense</p>
        </div>
        <Button onClick={() => window.location.href = "/biometric-enrollment"}>
          <Plus className="w-4 h-4 mr-2" />
          Enroll New Identity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Registered Biometrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hardware ID</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {biometrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No biometric signatures found.
                  </TableCell>
                </TableRow>
              ) : (
                biometrics.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{b.label}</TableCell>
                    <TableCell className="capitalize">{b.biometric_type}</TableCell>
                    <TableCell className="font-mono text-[10px]">{b.hardware_id}</TableCell>
                    <TableCell>{new Date(b.enrolled_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => revokeBiometric(b.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
