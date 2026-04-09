import { 
  History, 
  ShieldCheck, 
  Search, 
  RefreshCw,
  Bell,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  FileText
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuditEntry, AlertConfig } from "../types";

interface GovernanceSectionProps {
  auditLog: AuditEntry[];
  auditSearchQuery: string;
  setAuditSearchQuery: (q: string) => void;
  auditFilterOutcome: string;
  setAuditFilterOutcome: (o: string) => void;
  alertConfigs: AlertConfig[];
  onToggleAlert: (id: string) => void;
  onRunHipaaAudit: () => void;
  onRunSoxAudit: () => void;
  complianceStatus: any;
}

export function GovernanceSection({
  auditLog,
  auditSearchQuery,
  setAuditSearchQuery,
  auditFilterOutcome,
  setAuditFilterOutcome,
  alertConfigs,
  onToggleAlert,
  onRunHipaaAudit,
  onRunSoxAudit,
  complianceStatus,
}: GovernanceSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Immutable Audit Trail
            </CardTitle>
            <CardDescription>Cryptographically signed log of all agent interactions.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={auditFilterOutcome} onValueChange={setAuditFilterOutcome}>
              <SelectTrigger className="w-[140px] bg-background/50">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="modified">Modified</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-10 h-10 bg-background/50 w-[240px]" 
                placeholder="Search reasoning..." 
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[150px]">Timestamp</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Intent / Reasoning</TableHead>
                <TableHead>Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map(entry => (
                <TableRow key={entry.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="text-[10px] font-mono whitespace-nowrap">
                    {entry.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    {entry.agentName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-tight">
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-300">{entry.intent}</span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1 italic">"{entry.summary}"</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        entry.outcome === 'approved' ? 'default' : 
                        entry.outcome === 'denied' ? 'destructive' : 'outline'
                      }
                      className="text-[10px] uppercase"
                    >
                      {entry.outcome}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Governance Alerts
            </CardTitle>
            <CardDescription>Monitored safety thresholds and active callbacks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertConfigs.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Key className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{alert.channel}</div>
                      <div className="text-[10px] text-muted-foreground">Threshold: {alert.threshold} events/min</div>
                    </div>
                  </div>
                  <Button 
                    variant={alert.is_active ? "secondary" : "outline"} 
                    size="sm"
                    className="h-8"
                    onClick={() => onToggleAlert(alert.id)}
                  >
                    {alert.is_active ? 'ACTIVE' : 'MUTED'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              Enterprise Compliance
            </CardTitle>
            <CardDescription>Automated regulatory reporting and audit readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">HIPAA Status</div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black ${complianceStatus.hipaa === 'PASSING' ? 'text-green-500' : 'text-red-500'}`}>
                    {complianceStatus.hipaa}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRunHipaaAudit}>
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">SOX Compliance</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-green-500">{complianceStatus.sox}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRunSoxAudit}>
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11">
              <FileText className="w-4 h-4 mr-2" />
              Download Regulatory Ledger (PDF)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
