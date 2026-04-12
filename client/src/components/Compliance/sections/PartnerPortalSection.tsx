import { useState, useEffect } from "react";
import { 
  Globe, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck,
  Building,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { extendedApi, type WhiteLabelConfig } from "@/lib/api";
import { toast } from "sonner";

export function PartnerPortalSection() {
  const [configs, setConfigs] = useState<WhiteLabelConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    setLoading(true);
    try {
      const data = await extendedApi.whiteLabel.configs();
      setConfigs(data || []);
    } catch (err) {
      console.error("Failed to fetch white-label configs", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">Loading partner integrations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            Partner Portal & White-labeling
          </h3>
          <p className="text-sm text-muted-foreground">Managing delegated compliance nodes and multi-tenant branding</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Provision New Portal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-500/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Delegated Governance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Enable your partners to manage their own AI Act compliance while remaining under your master governance umbrella.
            </p>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Active Partners</span>
              <span className="text-purple-600">{configs.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Tenant Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Provisioned Capacity</span>
                    <span>12 / 100 Portals</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[12%]" />
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Managed Tenant Portals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Branding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Portal Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No partner portals provisioned yet.
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold">{config.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {config.tier || "standard"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full border border-border/50" 
                          style={{ backgroundColor: config.branding?.primary_color || '#3b82f6' }}
                        />
                        <span className="text-[10px] text-muted-foreground">Custom</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase">
                        {config.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-2 group">
                        Live Preview <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
