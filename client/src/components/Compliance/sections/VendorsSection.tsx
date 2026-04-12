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
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { extendedApi, type Vendor } from "@/lib/api";
import { toast } from "sonner";

export function VendorsSection() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  }

  async function deleteVendor(id: string) {
    try {
      await extendedApi.compliance.deleteVendor(id);
      toast.success("Vendor removed from compliance registry");
      loadVendors();
    } catch (err) {
      toast.error("Failed to remove vendor");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">Loading supply chain entities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Vendor Ecosystem
          </h3>
          <p className="text-sm text-muted-foreground">Managing AI value chain participants and Article 28 obligations</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Onboard Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {vendors.filter(v => v.riskLevel === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {vendors.filter(v => v.complianceStatus === 'compliant').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Supply Chain Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Last Audit</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No vendors registered in focus.
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {vendor.name}
                        {vendor.complianceStatus === 'compliant' && (
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{vendor.type}</TableCell>
                    <TableCell>
                      <Badge variant={vendor.riskLevel === 'high' ? 'destructive' : 'outline'} className="capitalize text-[10px]">
                        {vendor.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize text-[10px] ${
                          vendor.complianceStatus === 'compliant' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {vendor.complianceStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(vendor.lastAssessment).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-xs gap-2">
                            <ExternalLink className="w-3 h-3" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => deleteVendor(vendor.id)}>
                            <Trash2 className="w-3 h-3" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
