import React from "react";
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  BarChart3,
  PieChart,
  ArrowUpRight,
  Target
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BudgetSectionProps {
  liveMetrics: any;
  budgetRules?: any[];
}

export function BudgetSection({ liveMetrics, budgetRules = [] }: BudgetSectionProps) {
  // Derived state from metrics
  const totalSpend = liveMetrics?.totalFinancialImpact || 0;
  const budgetLimit = 50000; // Example limit for alpha
  const percentUsed = Math.min(100, (totalSpend / budgetLimit) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projected Spend</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black">${totalSpend.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12.4% vs last cycle</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Budget Utilization</span>
              <PieChart className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black">{percentUsed.toFixed(1)}%</div>
            <Progress value={percentUsed} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ROI Efficiency</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black">4.2x</div>
            <div className="text-[10px] text-muted-foreground mt-1">Strategic target: 3.5x</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Risk Score</span>
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-black">Low</div>
            <div className="text-[10px] text-muted-foreground mt-1">Governance threshold: Nominal</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Cost Allocation by Agent Swarm
            </CardTitle>
            <CardDescription>Direct compute and API costs per operational unit.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { name: "Recruitment Swarm", spend: 12400, color: "bg-blue-500" },
                { name: "Compliance Guard", spend: 8100, color: "bg-purple-500" },
                { name: "Market Intelligence", spend: 15600, color: "bg-emerald-500" },
                { name: "Customer Experience", spend: 4300, color: "bg-orange-500" }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{item.name}</span>
                    <span className="font-mono">${item.spend.toLocaleString()}</span>
                  </div>
                  <Progress value={(item.spend / totalSpend) * 100} className={`h-1.5 ${item.color}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Budget Guardrails
            </CardTitle>
            <CardDescription>Autonomous spending constraints.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border border-border/50 bg-background/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold">Hard Cap (Monthly)</div>
                <div className="text-[10px] text-muted-foreground">Terminate agents matching 95% spend</div>
              </div>
              <Badge variant="outline">$100k</Badge>
            </div>
            <div className="p-3 rounded-lg border border-border/50 bg-background/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold">Inference Ceiling</div>
                <div className="text-[10px] text-muted-foreground">Global token spend limit per hour</div>
              </div>
              <Badge variant="outline">$2.5k</Badge>
            </div>
            <Button variant="outline" className="w-full text-xs font-bold border-dashed mt-2">
              Add Constraint Rule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
