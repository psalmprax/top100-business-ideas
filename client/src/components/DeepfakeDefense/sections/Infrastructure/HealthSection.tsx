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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, AlertTriangle, Globe, Server, Zap } from "lucide-react";
import { toast } from "sonner";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";
import { MetricCard } from "../../ui/MetricCard";

const regions = [
  {
    id: "us-east-1",
    name: "US East",
    provider: "AWS",
    status: "healthy",
    latency: "12ms",
  },
  {
    id: "eu-west-1",
    name: "EU West",
    provider: "GCP",
    status: "healthy",
    latency: "18ms",
  },
  {
    id: "ap-southeast-1",
    name: "AP Southeast",
    provider: "Azure",
    status: "degraded",
    latency: "45ms",
  },
  {
    id: "us-west-2",
    name: "US West",
    provider: "AWS",
    status: "healthy",
    latency: "14ms",
  },
];

export function HealthSection() {
  const { setConfirmFailover } = useDeepfakeDefenseContext();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Detection SDK Uptime"
          value="99.97%"
          icon={Activity}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <MetricCard
          title="Avg Latency"
          value="22ms"
          icon={Zap}
          color="bg-blue-500/10 text-blue-500"
        />
        <MetricCard
          title="Active PoPs"
          value="4"
          icon={Globe}
          color="bg-purple-500/10 text-purple-500"
        />
        <MetricCard
          title="Regional Failovers"
          value="0"
          icon={Server}
          color="bg-orange-500/10 text-orange-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-title">
            <Globe className="w-5 h-5" />
            Global Fraud Defense Mesh
          </CardTitle>
          <CardDescription>Multi-cloud biometric relay health</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Defense Layer</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.map(region => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell>{region.provider}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        region.status === "healthy" ? "default" : "destructive"
                      }
                    >
                      {region.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{region.latency}</TableCell>
                  <TableCell>
                    <Badge variant="outline">LivenessLink v4</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setConfirmFailover(region.id);
                        toast.info(`Initiating failover for ${region.name}...`);
                      }}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Failover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
