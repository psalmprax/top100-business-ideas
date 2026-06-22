import { History, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Agent } from "@/lib/api";

export function LogsTab({ agents }: { agents: Agent[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-caption-premium flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          Automation Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {agents.length > 0 ? (
          agents.map((agent: Agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-4 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-body-sm font-bold">{agent.name}</div>
                  <div className="text-caption-premium">
                    {agent.type} · {agent.model}
                  </div>
                </div>
              </div>
              <Badge
                className={
                  agent.status === "active"
                    ? "bg-green-500 text-white text-caption-premium"
                    : "bg-muted text-caption-premium"
                }
              >
                {agent.status}
              </Badge>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <History className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-body-sm">
              No agents deployed yet. Authorize an agent to see logs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
