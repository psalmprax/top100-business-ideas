import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { extendedApi, type Vendor } from "@/lib/api";
import { toast } from "sonner";
import { RiskBadge, StatusBadge } from "@/pages/Compliance/components/ComplianceBadges";

export function VendorsSection() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    setLoading(true);
    try {
      const data = await extendedApi.vendors.list();
      setVendors(data || []);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
      toast.error("Failed to load supply chain data");
    } finally {
      setLoading(false);
    }
  }

  async function deleteVendor(id: string) {
    try {
      await extendedApi.vendors.delete(id);
      toast.success("Vendor removed from compliance registry");
      loadVendors();
    } catch (err) {
      toast.error("Failed to remove vendor");
    }
  }

  async function handleRunGlobalAudit() {
    setIsAuditing(true);
    toast.info("Triggering global supply chain audit...");
    try {
      const result = await extendedApi.vendors.audit();
      toast.success("Global audit completed successfully");
      loadVendors();
    } catch (err) {
      toast.error("Audit failed: Connection timeout or unreachable host");
    } finally {
      setIsAuditing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">
          Loading supply chain entities...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            AI Supply Chain Governance
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitoring Tier-1/2/3 vendors for EU AI Act Article 28/29 compliance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRunGlobalAudit}
            disabled={isAuditing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? "Auditing..." : "Global Audit"}
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> Onboard Vendor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-muted/30 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Primary Providers (Tier 1)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {vendors.filter(v => v.type === 'llm' || v.category === 'primary_ai').length}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Foundation model providers and core AI services.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/30 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden flex">
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${vendors.length ? (vendors.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length / vendors.length) * 100 : 0}%` }} 
                />
                <div 
                  className="bg-yellow-500 h-full" 
                  style={{ width: `${vendors.length ? (vendors.filter(v => v.risk_level === 'medium').length / vendors.length) * 100 : 0}%` }} 
                />
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${vendors.length ? (vendors.filter(v => v.risk_level === 'low').length / vendors.length) * 100 : 0}%` }} 
                />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono uppercase">
              <span className="text-red-400">High: {vendors.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length}</span>
              <span className="text-yellow-400">Med: {vendors.filter(v => v.risk_level === 'medium').length}</span>
              <span className="text-green-400">Low: {vendors.filter(v => v.risk_level === 'low').length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Evidence Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-2xl font-bold">
                {vendors.filter(v => v.compliance_status === 'passed' || v.compliance_status === 'vetted').length}
              </span>
              <span className="text-xs text-muted-foreground">Compliant</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Verified technical documentation and Article 11 evidence.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Entity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Audit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-muted/50 group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Globe className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {vendor.name}
                          </div>
                          {vendor.website && (
                            <a 
                              href={vendor.website} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                            >
                              {vendor.website.replace(/^https?:\/\//, '').split('/')[0]}
                              <ExternalLink className="w-2 h-2" />
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {vendor.category || vendor.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RiskBadge category={vendor.risk_level} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={vendor.compliance_status || vendor.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {vendor.last_assessment 
                        ? new Date(vendor.last_assessment).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-xs gap-2" onClick={() => vendor.website && window.open(vendor.website, '_blank')}>
                            <ExternalLink className="w-3 h-3" /> View Docs
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs gap-2 text-destructive"
                            onClick={() => deleteVendor(vendor.id)}
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No vendors registered in the supply chain.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {vendors.some(v => v.risk_level === 'high' || v.risk_level === 'critical') && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-400">Supply Chain Risk Alert</h4>
            <p className="text-xs text-red-300/70 mt-1">
              High-risk vendors detected in the primary AI tier. Article 28 requires immediate verification of 
              technical documentation and model usage policies to maintain overall compliance status.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
