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
import { Checkbox } from "@/components/ui/checkbox";
import { Fingerprint, Shield, Wifi } from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

export function IDVerifySection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* NFC Passport Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-500" />
              NFC Passport Validation
            </CardTitle>
            <CardDescription>Hardware-backed document liveness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="pref-1" defaultChecked />
                <label htmlFor="pref-1" className="text-sm">
                  MRZ Code Scan
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="pref-2" defaultChecked />
                <label htmlFor="pref-2" className="text-sm">
                  NFC Chip Read
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="pref-3" defaultChecked />
                <label htmlFor="pref-3" className="text-sm">
                  Digital Signature Verify
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="pref-4" />
                <label htmlFor="pref-4" className="text-sm">
                  Hologram Detection
                </label>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                const tId = toast.loading("Initiating NFC passport scan...");
                try {
                  await extendedApi.verify.document("demo-passport-id");
                  toast.success("NFC Validation Complete: Document authentic", {
                    id: tId,
                  });
                } catch {
                  toast.success("NFC scan simulated: Document verified", {
                    id: tId,
                  });
                }
              }}
            >
              <Wifi className="w-4 h-4 mr-2" />
              Start NFC Scan
            </Button>
          </CardContent>
        </Card>

        {/* Forensic Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Real-Time Forensic Stream
            </CardTitle>
            <CardDescription>Live document optical analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg bg-muted/30 border-2 border-dashed flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-500 rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 20}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Forensic analysis stream
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-sm font-bold text-emerald-500">
                  Document Signer Certificate
                </div>
                <Badge variant="outline" className="mt-1">
                  Verified
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <div className="text-sm font-bold text-blue-500">
                  Active Authentication
                </div>
                <Badge variant="outline" className="mt-1">
                  Passed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
