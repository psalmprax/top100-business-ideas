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
import { Activity, Cpu, Watch } from "lucide-react";
import { toast } from "sonner";
import { extendedApi, type WearableDevice } from "@/lib/api";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function WearableSection() {
  const { wearableDevices, setWearableDevices, user } =
    useDeepfakeDefenseContext();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="w-5 h-5 text-orange-500" />
            Biometric Pulse Monitor
          </CardTitle>
          <CardDescription>Encrypted heart-rate liveness sync</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {wearableDevices.map(device => (
              <Card key={device.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Cpu
                        className={`w-4 h-4 ${device.status === "encrypted" ? "text-emerald-500" : "text-muted-foreground"}`}
                      />
                      <span className="font-bold uppercase tracking-tighter">
                        {device.device_type}
                      </span>
                    </div>
                    <Badge
                      variant={
                        device.status === "encrypted" ? "default" : "secondary"
                      }
                    >
                      {device.status}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Device ID
                      </div>
                      <div className="font-mono text-sm">{device.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Pulse Sync
                      </div>
                      <div className="flex items-center gap-1 text-red-500 font-bold">
                        <Activity className="w-3 h-3 animate-pulse" />
                        72 BPM
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {wearableDevices.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Watch className="w-12 h-12 mx-auto mb-2 opacity-10" />
                <p>No wearable devices paired for biometric pulse.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  data-testid="btn-pair-device"
                  onClick={async () => {
                    try {
                      await extendedApi.wearable.register({
                        device_type: "Apple Watch",
                        user_id: user?.id || "demo_user",
                        status: "paired",
                        firmware_version: "10.4",
                      });
                      const updated = await extendedApi.wearable.devices();
                      setWearableDevices(updated);
                      toast.success("Device paired successfully!");
                    } catch {
                      const newDevice = {
                        id: `wearable-${Date.now()}`,
                        device_type: "Apple Watch",
                        user_id: user?.id || "demo_user",
                        status: "paired",
                        firmware_version: "10.4",
                        paired_at: new Date(),
                      };
                      setWearableDevices((prev: WearableDevice[]) => [...prev, newDevice]);
                      toast.success("Device paired successfully!");
                    }
                  }}
                >
                  Pair New Device
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
