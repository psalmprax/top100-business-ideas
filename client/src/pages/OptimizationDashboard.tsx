/**
 * Optimization Dashboard
 * LLM Performance and Workforce Optimization Interface
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  BarChart3,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  DollarSign,
} from "lucide-react";
import { extendedApi } from "@/lib/api";
import { toast } from "sonner";

interface LLMPerformance {
  total_requests: number;
  total_cost: number;
  avg_latency_ms: number;
  success_rate: number;
  recommendation: string;
}

interface EfficiencyReport {
  overall_efficiency: number;
  cost_savings: number;
  optimization_opportunities: number;
  agents: Array<{
    id: string;
    name: string;
    efficiency: number;
    cost: number;
    recommendation: string;
  }>;
}

export default function OptimizationDashboard() {
  const [efficiency, setEfficiency] = useState<EfficiencyReport | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentPerformance, setAgentPerformance] =
    useState<LLMPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      loadAgentPerformance(selectedAgent);
    }
  }, [selectedAgent, days]);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await extendedApi.optimization.getWorkforceEfficiency();
      setEfficiency(data);
    } catch (err) {
      toast.error("Failed to load optimization data");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAgentPerformance(agentId: string) {
    try {
      const data = await extendedApi.optimization.getLLMPerformance(
        agentId,
        days
      );
      setAgentPerformance(data);
    } catch (err) {
      toast.error("Failed to load agent performance");
    }
  }

  async function runOptimization(agentId: string) {
    setIsOptimizing(true);
    try {
      await extendedApi.optimization.optimizeAgent(agentId);
      toast.success("Optimization cycle completed");
      loadData();
    } catch (err) {
      toast.error("Optimization failed");
    } finally {
      setIsOptimizing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Optimization Dashboard</h1>
          <p className="text-muted-foreground">
            LLM performance tuning and workforce efficiency
          </p>
        </div>
        <Button onClick={loadData} variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {efficiency?.overall_efficiency.toFixed(1)}%
            </div>
            <Progress
              value={efficiency?.overall_efficiency || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Estimated Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" />$
              {efficiency?.cost_savings.toFixed(2)}/mo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {efficiency?.optimization_opportunities}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {efficiency?.agents.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="llm">LLM Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Efficiency Ranking</CardTitle>
              <CardDescription>
                Click on an agent to view detailed performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Monthly Cost</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {efficiency?.agents.map(agent => (
                    <TableRow
                      key={agent.id}
                      className={`cursor-pointer hover:bg-muted/50 ${selectedAgent === agent.id ? "bg-muted" : ""}`}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <TableCell className="font-medium">
                        {agent.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={agent.efficiency} className="w-24" />
                          <span>{agent.efficiency.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>${agent.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            agent.recommendation === "UPGRADE_MODEL"
                              ? "destructive"
                              : agent.recommendation === "DOWNGRADE_MODEL"
                                ? "default"
                                : "outline"
                          }
                        >
                          {agent.recommendation}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            runOptimization(agent.id);
                          }}
                          disabled={isOptimizing}
                        >
                          <Zap className="w-3 h-3 mr-1" /> Optimize
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select
              value={days.toString()}
              onValueChange={v => setDays(parseInt(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {agentPerformance && selectedAgent && (
            <Card>
              <CardHeader>
                <CardTitle>LLM Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Total Requests
                  </div>
                  <div className="text-xl font-bold">
                    {agentPerformance.total_requests}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Total Cost
                  </div>
                  <div className="text-xl font-bold">
                    ${agentPerformance.total_cost.toFixed(4)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Avg Latency
                  </div>
                  <div className="text-xl font-bold">
                    {agentPerformance.avg_latency_ms}ms
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Success Rate
                  </div>
                  <div className="text-xl font-bold">
                    {(agentPerformance.success_rate * 100).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {efficiency?.agents
                .filter(a => a.recommendation !== "MAINTAIN")
                .map(agent => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.recommendation}
                      </div>
                    </div>
                    <Button size="sm">Apply</Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
