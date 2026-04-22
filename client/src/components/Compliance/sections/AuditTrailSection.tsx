import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  History,
  ShieldCheck,
  Activity,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { type AuditEntry } from "@/lib/api";

interface AuditTrailSectionProps {
  logs?: AuditEntry[];
  onExport?: () => void;
}

export function AuditTrailSection({
  logs = [],
  onExport,
}: AuditTrailSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredLogs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return logs.filter(log => {
      const matchesSearch =
        log.action?.toLowerCase().includes(query) ||
        log.actor?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query);

      if (filterType === "all") return matchesSearch;
      return matchesSearch && log.outcome === filterType;
    });
  }, [logs, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 h-10 border-border/50 bg-background/50"
            placeholder="Search immutable logs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 border-border/50">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 border-border/50"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-black/20">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Immutable Event Ledger
              </CardTitle>
              <CardDescription>
                Cryptographically signed audit logs for global compliance.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5 py-1 px-3"
            >
              <Lock className="w-3 h-3" /> SECURE ENCLAVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-border/30">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Activity className="w-10 h-10 opacity-20 mb-4" />
                  <p className="text-sm">
                    No matching audit events found in the ledger.
                  </p>
                </div>
              ) : (
                filteredLogs.map((log, i) => (
                  <div
                    key={log.id || i}
                    className="p-4 hover:bg-muted/10 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-lg ${log.outcome === "success" || log.outcome === "pass" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                        >
                          {log.outcome === "success" ||
                          log.outcome === "pass" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold group-hover:text-primary transition-colors">
                            {log.action || "System Event"}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                            {log.id?.slice(0, 8) || `TRX-${1000 + i}`} &middot;{" "}
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-background/50 border-border/30"
                      >
                        {log.agent_id || "System"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pl-10 leading-relaxed">
                      {log.details ||
                        "Automated compliance verification trace."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Retention Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Standard Archival</span>
              <span className="font-bold">7 Years</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-muted-foreground">Hot Buffer</span>
              <span className="font-bold">90 Days</span>
            </div>
            <Progress value={45} className="h-1 mt-4" />
            <p className="text-[10px] text-muted-foreground mt-3">
              Storage consumption: 4.2TB / 10TB. Auto-purge disabled for
              enterprise tier.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Encryption Key Rotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active Key ID</span>
              <span className="font-mono text-[10px]">KMS-AES-256-R42</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-muted-foreground">Last Rotation</span>
              <span className="font-bold">12 Days Ago</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-[10px] mt-4 border border-dashed hover:bg-white/5"
            >
              Trigger Manual Rotation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
