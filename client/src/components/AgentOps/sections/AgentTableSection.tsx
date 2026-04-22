import {
  Plus,
  Settings,
  Bot,
  Zap,
  Activity,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentStatusBadge } from "../Atoms";
import { DashboardAgent } from "../types";

interface AgentTableSectionProps {
  agents: DashboardAgent[];
  onToggleStatus: (id: string) => void;
  onOpenSettings: (agent: DashboardAgent) => void;
  onDecommission: (id: string) => void;
  onNewAgent: () => void;
  onInjectHint: (agent: DashboardAgent) => void;
  onUpdateAssets: (agent: DashboardAgent) => void;
  onConfigureStream: (agent: DashboardAgent) => void;
  onSync: () => void;
}

export function AgentTableSection({
  agents,
  onToggleStatus,
  onOpenSettings,
  onDecommission,
  onNewAgent,
  onInjectHint,
  onUpdateAssets,
  onConfigureStream,
  onSync,
}: AgentTableSectionProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Autonomous Agent Multi-Tenancy</CardTitle>
          <CardDescription>
            Managed enterprise agents across production clusters.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSync}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Hardware
          </Button>
          <Button size="sm" onClick={onNewAgent}>
            <Plus className="w-4 h-4 mr-2" />
            Deploy Agent
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10 h-10 bg-background/50"
              placeholder="Search by agent name, model, or org_id..."
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[200px]">Agent Identity</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Execution Stack</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resource Usage</TableHead>
              <TableHead className="text-right">Orchestration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map(agent => (
              <TableRow
                key={agent.id}
                className="hover:bg-muted/10 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-primary" />
                      {agent.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">
                      {agent.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold tracking-tighter bg-zinc-900 border-zinc-800"
                  >
                    {agent.environment || "production"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs font-semibold">
                        {agent.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {agent.config.model}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <AgentStatusBadge status={agent.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-2 max-w-[120px]">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${Math.min((agent.daily_spend / agent.budget) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold">
                        ${agent.daily_spend.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[9px] font-medium text-muted-foreground">
                      <span>
                        {agent.metrics.total_tokens.toLocaleString()} tokens
                      </span>
                      <span>${agent.metrics.total_cost.toFixed(3)} total</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                      {agent.metrics.total_requests.toLocaleString()} reqs /{" "}
                      {agent.metrics.error_rate.toFixed(1)}% error
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => onToggleStatus(agent.id)}
                    >
                      {agent.status === "running" ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-zinc-900 border-zinc-800"
                      >
                        <DropdownMenuLabel>
                          Governance Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onOpenSettings(agent)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Modify Blueprint
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInjectHint(agent)}>
                          <Activity className="w-4 h-4 mr-2" />
                          Inject Steering Hint
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateAssets(agent)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Update Assets
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onConfigureStream(agent)}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Configure Stream
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => onDecommission(agent.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Decommission Node
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
