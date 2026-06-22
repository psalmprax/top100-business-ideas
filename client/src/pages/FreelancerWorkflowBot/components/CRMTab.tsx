import { Users, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Client } from "@/lib/api";

export function CRMTab({
  clients,
  onAddClient,
}: {
  clients: Client[];
  onAddClient: () => void;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-caption-premium flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Client CRM
          </CardTitle>
          <Button
            size="sm"
            className="bg-indigo-600 h-8 text-[10px] uppercase"
            onClick={onAddClient}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Client
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-body-sm">
              No clients yet. Add your first client.
            </p>
          </div>
        ) : (
          clients.map((client: Client) => (
            <div
              key={client.id}
              className="flex items-center justify-between p-4 border-b border-border/30 last:border-0 hover:bg-muted/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-body-sm font-bold text-indigo-600">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-body-sm font-bold">{client.name}</div>
                  <div className="text-caption-premium">{client.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-body-sm">
                  {client.status === "active" ? "Active" : client.status}
                </span>
                <Badge
                  className={
                    client.status === "active"
                      ? "bg-green-500/10 text-green-500 text-caption-premium"
                      : "bg-amber-500/10 text-amber-500 text-caption-premium"
                  }
                >
                  {client.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
