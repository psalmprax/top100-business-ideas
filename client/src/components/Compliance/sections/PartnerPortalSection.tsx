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

  const handleProvision = async () => {
    toast.promise(
      extendedApi.whiteLabel.create({
        name: `New Partner ${configs.length + 1}`,
        tier: "standard",
        branding: {
          primary_color: "#3b82f6",
          secondary_color: "#1e40af",
          accent_color: "#60a5fa",
          company_name: "New Partner Corp"
        }
      }),
      {
        loading: "Provisioning isolated tenant compliance node...",
        success: (data) => {
          setConfigs([data, ...configs]);
          return "Tenant portal provisioned successfully.";
        },
        error: "Provisioning failed. Check enterprise quota.",
      }
    );
  };

  const handlePreview = async (id: string) => {
    toast.promise(
      extendedApi.whiteLabel.preview(id),
      {
        loading: "Generating secure tenant preview...",
        success: (data) => {
          // In a real app, we'd open a new window with the HTML or redirect
          return `Preview generated for ${data.config.name}. Portal is LIVE.`;
        },
        error: "Preview generation failed.",
      }
    );
  };

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
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Globe className="w-5 h-5 text-purple-500" />
            Partner Portal & White-labeling
          </h3>
          <p className="text-sm text-muted-foreground">Managing delegated compliance nodes and multi-tenant branding</p>
        </div>
        <Button size="sm" onClick={handleProvision}>
          <Plus className="w-4 h-4 mr-2" /> Provision New Portal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-500/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Delegated Governance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Enable your partners to manage their own AI Act compliance while remaining under your master governance umbrella.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Active Partners</span>
              <span className="text-purple-600">{configs.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/10 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
              <Building className="w-4 h-4 text-primary" />
              Tenant Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Provisioned Capacity</span>
                    <span>{configs.length} / 100 Portals</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${(configs.length / 100) * 100}%` }} />
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/5">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white">Managed Tenant Portals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-white/10">
              <TableRow className="hover:bg-transparent border-white/10">
                <TableHead className="text-white/60">Partner Name</TableHead>
                <TableHead className="text-white/60">Tier</TableHead>
                <TableHead className="text-white/60">Branding</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-right text-white/60">Portal Link</TableHead>
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
                  <TableRow key={i} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell className="font-bold text-white">{config.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize border-white/10 text-white/60">
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
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase">
                        {config.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-2 group text-white/60 hover:text-white hover:bg-white/5"
                        onClick={() => config.tenant_id && handlePreview(config.tenant_id)}
                      >
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
