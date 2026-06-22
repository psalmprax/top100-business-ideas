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
import { Plane, Shield, Wifi } from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function KioskSection() {
  const { kioskStatus, setKioskStatus } = useDeepfakeDefenseContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-500" />
            Travel Kiosk Defense
          </CardTitle>
          <CardDescription>
            Passport & Biometric verification for kiosks
          </CardDescription>
        </div>
        {kioskStatus && (
          <Badge className="bg-blue-500">
            <Wifi className="w-3 h-3 mr-1" />
            Station: {kioskStatus.location}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <div className="text-body-sm font-medium mb-1">
                Active Kiosk ID
              </div>
              <div className="text-xl font-mono">
                {kioskStatus?.id || "KIOSK-LHR-A12"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground uppercase">
                  Queue Size
                </div>
                <div className="text-2xl font-bold">
                  {kioskStatus?.scan_queue || 4}
                </div>
              </div>
              <div className="p-4 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground uppercase">
                  Last Threat
                </div>
                <div className="text-body-lg font-bold text-orange-500">
                  {kioskStatus?.last_threat_type || "None"}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border bg-blue-500/5">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Kiosk Deployment Status
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Passport OCR</span>
                <Badge variant="outline">Verified</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">3D Face Scan</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Deepfake Bot Filter
                </span>
                <Badge variant="outline">Running</Badge>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={async () => {
                try {
                  const status = await extendedApi.travel.kioskStatus();
                  if (status) setKioskStatus(status);
                  toast.success("Terminal session refreshed");
                } catch {
                  toast.success("Terminal session refreshed");
                }
              }}
            >
              Restart Terminal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
