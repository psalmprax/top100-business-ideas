import { Zap, Target, Send, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { type Client } from "@/lib/api";

export function GrowthTab({
  clients,
  onDelegateTask,
}: {
  clients: Client[];
  onDelegateTask: () => void;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-caption-premium flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          Growth Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
            <div className="text-caption-premium">Active Clients</div>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.status === "active").length}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-center">
            <div className="text-caption-premium">Prospects</div>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.status === "prospect").length}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              toast.info("Lead sourcing: Connect to prospecting service")
            }
          >
            <Target className="w-4 h-4 mr-2" /> Source New Leads
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onDelegateTask}
          >
            <Send className="w-4 h-4 mr-2" /> Launch Outreach Campaign
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={async () => {
              try {
                await extendedApi.workforce.activateReferral();
                toast.success(
                  "Referral program activated! Your unique referral code has been generated."
                );
              } catch (err: unknown) {
                const message =
                  err instanceof Error
                    ? err.message
                    : "Failed to activate referral program";
                toast.error(message);
              }
            }}
          >
            <Users className="w-4 h-4 mr-2" /> Activate Referral Program
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
