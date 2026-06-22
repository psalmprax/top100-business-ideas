import { Layers, Unlink, Link2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Integration } from "@/lib/api";

export function IntegrationsTab({
  integrations,
  onToggleIntegration,
}: {
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-caption-premium flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Integration Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <div className="text-card-title">{integration.name}</div>
                  <div className="text-caption-premium">
                    {integration.connected ? "Connected" : "Not connected"}
                  </div>
                </div>
              </div>
              <Button
                variant={
                  integration.connected ? "destructive" : "outline"
                }
                size="sm"
                className="h-8 text-[10px]"
                onClick={() => onToggleIntegration(integration.id)}
              >
                {integration.connected ? (
                  <>
                    <Unlink className="w-3 h-3 mr-1" /> Disconnect
                  </>
                ) : (
                  <>
                    <Link2 className="w-3 h-3 mr-1" /> Connect
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
