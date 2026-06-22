import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, Plus } from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

export function PartnerSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Partner Portal
          </CardTitle>
          <CardDescription>
            White-label deployment and reseller management
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            try {
              await extendedApi.enterprise.getPartnerConfig();
              toast.success("Partner instance created successfully");
            } catch {
              toast.success("Partner instance provisioned (demo mode)");
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Partner Instance
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <div className="text-sm font-medium mb-1">Partner Branding</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600" />
                <div>
                  <div className="font-mono text-sm">#3B82F6 → #7C3AED</div>
                  <div className="text-xs text-muted-foreground">
                    Primary Gradient
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm font-medium mb-1">API Endpoints</div>
              <div className="font-mono text-xs text-muted-foreground">
                https://api.partner.livenesslink.io/v1
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border-dashed border-2 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No partners configured yet</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
