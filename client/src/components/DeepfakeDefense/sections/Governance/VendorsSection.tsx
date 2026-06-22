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
import { Plus } from "lucide-react";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function VendorsSection() {
  const { setShowOnboardVendorDialog } = useDeepfakeDefenseContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Third-Party Integration</CardTitle>
          <CardDescription>Manage external biometric providers</CardDescription>
        </div>
        <Button
          data-testid="btn-onboard-vendor"
          onClick={() => setShowOnboardVendorDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Onboard Vendor
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                <span className="font-bold text-blue-600">ID</span>
              </div>
              <div>
                <div className="font-bold text-sm">Idenify Global</div>
                <div className="text-xs text-muted-foreground">
                  Biometric Partner
                </div>
              </div>
            </div>
            <Badge>Connected</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
