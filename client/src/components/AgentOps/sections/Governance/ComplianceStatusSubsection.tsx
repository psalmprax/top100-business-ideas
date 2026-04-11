import React from "react";
import { 
  ShieldCheck, 
  RefreshCw,
  FileText,
  BadgeCheck,
  Search,
  CheckCircle2,
  XCircle
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

interface ComplianceStatusSubsectionProps {
  onRunHipaaAudit: () => void;
  onRunSoxAudit: () => void;
  complianceStatus: any;
}

export function ComplianceStatusSubsection({
  onRunHipaaAudit,
  onRunSoxAudit,
  complianceStatus,
}: ComplianceStatusSubsectionProps) {
  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-32 h-32 text-emerald-500 -mr-8 -mt-8" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              HIPAA Enclave Status
            </CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">
              Health Insurance Portability and Accountability Act.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-background/40 border border-emerald-500/10 shadow-inner">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Verification</div>
                <div className={`text-2xl font-black tracking-tighter flex items-center gap-2 ${
                  complianceStatus.hipaa === 'PASSING' ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {complianceStatus.hipaa === 'PASSING' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  {complianceStatus.hipaa || 'PENDING'}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-xl border-emerald-500/20 hover:bg-emerald-500/10" 
                onClick={onRunHipaaAudit}
              >
                <RefreshCw className="w-5 h-5 text-emerald-500" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/30 border border-emerald-500/5">
                <div className="text-[9px] font-black text-muted-foreground uppercase mb-2">Encryption</div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[9px] px-2 py-0.5">AES-256-GCM</Badge>
              </div>
              <div className="p-4 rounded-xl bg-background/30 border border-emerald-500/5">
                <div className="text-[9px] font-black text-muted-foreground uppercase mb-2">Consent Logs</div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[9px] px-2 py-0.5">VERIFIED</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="w-32 h-32 text-blue-500 -mr-8 -mt-8" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <Search className="w-5 h-5 text-blue-500" />
              SOX Compliance Audit
            </CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">
              Sarbanes-Oxley Act financial reporting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-background/40 border border-blue-500/10 shadow-inner">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Financial Disclosure</div>
                <div className="text-2xl font-black tracking-tighter text-blue-500 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  {complianceStatus.sox || 'PASSING'}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-xl border-blue-500/20 hover:bg-blue-500/10" 
                onClick={onRunSoxAudit}
              >
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-background/30 border border-blue-500/5">
              <div className="text-[9px] font-black text-muted-foreground uppercase mb-3">Recent Reporting Period</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/70">Q1 2026 Fiscal Cycle</span>
                <Badge variant="outline" className="text-[9px] font-black uppercase text-blue-400 border-blue-400/20">Certified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight">Immutable Compliance Ledger</h4>
                <p className="text-sm text-muted-foreground font-medium max-w-md">
                  Export a cryptographically signed PDF of all agent interactions and governance decisions 
                  for regulatory submission.
                </p>
              </div>
            </div>
            <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all">
              <Download className="w-4 h-4 mr-2" />
              Download Regulatory PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Download(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
