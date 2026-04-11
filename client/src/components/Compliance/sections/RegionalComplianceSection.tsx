import React from "react";
import { 
  Globe2, 
  MapPin, 
  ShieldCheck, 
  ChevronRight,
  AlertCircle,
  Activity,
  Server
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
import { ScrollArea } from "@/components/ui/scroll-area";

export function RegionalComplianceSection() {
  const regions = [
    { 
      id: "eu", 
      name: "European Union", 
      certifications: ["GDPR", "AI Act", "ISO 27001"], 
      status: "compliant",
      nodes: 12,
      latency: "24ms"
    },
    { 
      id: "us", 
      name: "United States", 
      certifications: ["HIPAA", "SOC-2", "CCPA"], 
      status: "compliant",
      nodes: 45,
      latency: "12ms"
    },
    { 
      id: "cn", 
      name: "China", 
      certifications: ["PIPL", "MLPS 2.0"], 
      status: "warning",
      nodes: 4,
      latency: "210ms"
    },
    { 
      id: "uk", 
      name: "United Kingdom", 
      certifications: ["UK-GDPR", "Cyber Essentials"], 
      status: "compliant",
      nodes: 8,
      latency: "18ms"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="w-6 h-6 text-primary" />
                  Global Residency & Jurisdiction
                </CardTitle>
                <CardDescription>Geo-fencing and data sovereignty status across active regions.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 h-6">
                WORLDWIDE MONITORING
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {regions.map((region) => (
                <div key={region.id} className="p-5 flex items-center justify-between hover:bg-muted/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl border border-border/50 transition-colors ${
                      region.status === 'compliant' ? 'bg-emerald-500/5 text-emerald-500 group-hover:bg-emerald-500/10' : 'bg-yellow-500/5 text-yellow-500'
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black flex items-center gap-2">
                        {region.name}
                        {region.status === 'compliant' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex gap-1.5 mt-1.5">
                        {region.certifications.map(cert => (
                          <Badge key={cert} variant="secondary" className="text-[9px] h-4 bg-background/50 border-border/20 px-1.5 font-bold uppercase tracking-tight">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Topology</div>
                      <div className="text-xs font-mono text-white mt-1 flex items-center gap-2">
                         <Server className="w-3 h-3 opacity-40" /> {region.nodes} Active Nodes
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Backhaul</div>
                      <div className="text-xs font-mono text-white mt-1">
                        {region.latency}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Infrastructure Localization Drift
            </CardTitle>
            <CardDescription>Real-time detection of data packets exiting designated jurisdictions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-background/40 border border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold">Residency Isolation Active</span>
              </div>
              <Badge className="bg-emerald-500 text-white border-none text-[9px]">ENFORCED</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed px-1">
              Sentinel's Geo-Geist layer is preventing cross-border data leakage. Currently, 99.98% of PII is sequestered within primary jurisdictions.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Certification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "SOC-2 Type II", progress: 95, color: "bg-emerald-500" },
              { label: "ISO 27001:2022", progress: 82, color: "bg-blue-500" },
              { label: "HIPAA Final Rule", progress: 100, color: "bg-emerald-500" },
              { label: "EU AI Act - High Risk", progress: 64, color: "bg-yellow-500" }
            ].map((cert) => (
              <div key={cert.label} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>{cert.label}</span>
                  <span>{cert.progress}%</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${cert.color} transition-all duration-1000`} style={{ width: `${cert.progress}%` }} />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full h-9 text-xs border-dashed mt-2">
              Add Regional Requirement
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-indigo-500/5">
          <CardContent className="pt-6">
             <h4 className="text-xs font-black uppercase text-indigo-400 mb-2">Alpha Insight</h4>
             <p className="text-xs text-indigo-300/80 leading-relaxed italic">
               "New data residency laws in Brasil (LGPD) may require a local node expansion by Q2. Current latency from US-East is ~140ms."
             </p>
             <Button variant="link" className="text-xs px-0 text-indigo-400 font-bold mt-2">Generate Infrastructure Plan →</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
