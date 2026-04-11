import React from "react";
import { 
  History, 
  Search, 
  RefreshCw
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
import { AuditEntry } from "../../types";

interface AuditTrailSubsectionProps {
  auditLog: AuditEntry[];
  auditSearchQuery: string;
  setAuditSearchQuery: (q: string) => void;
  auditFilterOutcome: string;
  setAuditFilterOutcome: (o: string) => void;
  onSync?: () => void;
}

export function AuditTrailSubsection({
  auditLog,
  auditSearchQuery,
  setAuditSearchQuery,
  auditFilterOutcome,
  setAuditFilterOutcome,
  onSync
}: AuditTrailSubsectionProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <History className="w-5 h-5 text-primary" />
            Immutable Audit Trail
          </CardTitle>
          <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">
            Cryptographically signed log of all agent interactions.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={auditFilterOutcome} onValueChange={setAuditFilterOutcome}>
            <SelectTrigger className="w-[140px] bg-background/50 border-border/50 h-9">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
            <Input 
              className="pl-9 h-9 bg-background/50 border-border/50 w-[200px] text-xs font-bold" 
              placeholder="Filter by intent..." 
              value={auditSearchQuery}
              onChange={(e) => setAuditSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={onSync}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/20">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest py-4">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Agent</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Action</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Intent / Reasoning</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-40">
                    No records found in current enclave state.
                  </TableCell>
                </TableRow>
              ) : (
                auditLog.map(entry => (
                  <TableRow key={entry.id} className="hover:bg-primary/5 transition-colors border-border/10">
                    <TableCell className="text-[10px] font-mono tabular-nums opacity-60">
                      {entry.timestamp.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-xs">
                      {entry.agentName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tight bg-muted/50 border-border/50">
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white/80">{entry.intent}</span>
                        <span className="text-[10px] text-muted-foreground line-clamp-1 italic font-medium">"{entry.summary}"</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          entry.outcome === 'approved' ? 'default' : 
                          entry.outcome === 'denied' ? 'destructive' : 'outline'
                        }
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${
                          entry.outcome === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 
                          entry.outcome === 'denied' ? 'bg-red-500/20 text-red-400 border-red-500/20' : ''
                        }`}
                      >
                        {entry.outcome}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
