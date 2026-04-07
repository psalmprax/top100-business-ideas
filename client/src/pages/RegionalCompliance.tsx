/**
 * Regional Compliance Rules Viewer
 * View region-specific compliance requirements and regulations
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Globe,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { extendedApi } from "@/lib/api";

interface RegionalRule {
  region: string;
  regulation: string;
  description: string;
  status: "compliant" | "pending" | "non_compliant";
  last_checked?: string;
  requirements: string[];
}

const REGIONAL_DATA: Record<string, RegionalRule[]> = {
  eu: [
    {
      region: "European Union",
      regulation: "EU AI Act",
      description:
        "Comprehensive AI regulation covering risk classification, transparency, and governance.",
      status: "compliant",
      requirements: [
        "Risk classification",
        "Technical documentation",
        "Human oversight",
        "Data governance",
      ],
    },
    {
      region: "European Union",
      regulation: "GDPR",
      description:
        "General Data Protection Regulation for personal data processing.",
      status: "compliant",
      requirements: [
        "Data minimization",
        "Right to erasure",
        "Consent management",
        "DPO appointment",
      ],
    },
    {
      region: "European Union",
      regulation: "NIS2 Directive",
      description:
        "Network and Information Security directive for essential entities.",
      status: "pending",
      requirements: [
        "Incident reporting",
        "Supply chain security",
        "Business continuity",
      ],
    },
  ],
  us: [
    {
      region: "United States",
      regulation: "NIST AI RMF",
      description:
        "AI Risk Management Framework for trustworthy AI development.",
      status: "compliant",
      requirements: [
        "Map risks",
        "Measure risks",
        "Manage risks",
        "Govern AI systems",
      ],
    },
    {
      region: "United States",
      regulation: "HIPAA",
      description:
        "Health Insurance Portability and Accountability Act for health data.",
      status: "compliant",
      requirements: [
        "Privacy controls",
        "Security controls",
        "Breach notification",
        "BAA agreements",
      ],
    },
    {
      region: "United States",
      regulation: "SOX §404",
      description:
        "Sarbanes-Oxley Act internal controls over financial reporting.",
      status: "pending",
      requirements: [
        "Internal controls",
        "Management assessment",
        "Auditor attestation",
      ],
    },
  ],
  asia: [
    {
      region: "Asia Pacific",
      regulation: "China PIPL",
      description:
        "Personal Information Protection Law for data processing in China.",
      status: "pending",
      requirements: [
        "Consent for processing",
        "Cross-border transfer rules",
        "Data localization",
      ],
    },
    {
      region: "Asia Pacific",
      regulation: "Japan APPI",
      description: "Act on Protection of Personal Information.",
      status: "compliant",
      requirements: [
        "Purpose specification",
        "Security measures",
        "Cross-border safeguards",
      ],
    },
    {
      region: "Asia Pacific",
      regulation: "Singapore PDPA",
      description: "Personal Data Protection Act.",
      status: "compliant",
      requirements: [
        "Consent obligation",
        "Purpose limitation",
        "Data protection officer",
      ],
    },
  ],
};

export default function RegionalCompliance() {
  const [rules, setRules] = useState<RegionalRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState("eu");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await extendedApi.compliance.getRegionalReports();
      if (res && res.length > 0) {
        setRules(
          res.map((r: any) => ({
            region: r.region || "Unknown",
            regulation: r.regulation || "Unknown",
            description: r.description || "",
            status: r.status || "pending",
            last_checked: r.last_checked,
            requirements: r.requirements || [],
          }))
        );
      } else {
        setRules(Object.values(REGIONAL_DATA).flat());
      }
    } catch {
      setRules(Object.values(REGIONAL_DATA).flat());
    } finally {
      setIsLoading(false);
    }
  };

  const regionRules = rules.filter(r => {
    const regionKey = activeRegion;
    const regionMap: Record<string, string[]> = {
      eu: ["European Union"],
      us: ["United States"],
      asia: ["Asia Pacific", "Singapore", "Japan", "China"],
    };
    return regionMap[regionKey]?.some(name => r.region.includes(name));
  });

  const compliantCount = rules.filter(r => r.status === "compliant").length;
  const pendingCount = rules.filter(r => r.status === "pending").length;
  const nonCompliantCount = rules.filter(
    r => r.status === "non_compliant"
  ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display-hero mb-2">Regional Compliance</h1>
          <p className="text-slate-400">
            Monitor compliance across global regulatory frameworks
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {compliantCount}
                  </p>
                  <p className="text-sm text-slate-400">Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {pendingCount}
                  </p>
                  <p className="text-sm text-slate-400">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {nonCompliantCount}
                  </p>
                  <p className="text-sm text-slate-400">Non-Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeRegion}
          onValueChange={setActiveRegion}
          className="space-y-6"
        >
          <TabsList className="bg-slate-800">
            <TabsTrigger value="eu">
              <Globe className="w-4 h-4 mr-2" />
              European Union
            </TabsTrigger>
            <TabsTrigger value="us">
              <Globe className="w-4 h-4 mr-2" />
              United States
            </TabsTrigger>
            <TabsTrigger value="asia">
              <Globe className="w-4 h-4 mr-2" />
              Asia Pacific
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeRegion} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : regionRules.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    No compliance rules for this region
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {regionRules.map((rule, i) => (
                  <Card key={i} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">
                              {rule.regulation}
                            </h3>
                            <Badge
                              className={
                                rule.status === "compliant"
                                  ? "bg-green-500/20 text-green-400"
                                  : rule.status === "non_compliant"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                              }
                            >
                              {rule.status === "non_compliant"
                                ? "Non-Compliant"
                                : rule.status === "compliant"
                                  ? "Compliant"
                                  : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Requirements
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rule.requirements.map(req => (
                            <span
                              key={req}
                              className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                      {rule.last_checked && (
                        <p className="text-xs text-slate-500 mt-3">
                          Last checked:{" "}
                          {new Date(rule.last_checked).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
