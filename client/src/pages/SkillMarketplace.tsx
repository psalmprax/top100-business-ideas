/**
 * SkillMarketplace - Discovery & Deployment Center
 * Showcases AI Agent skills powering the 100 business ventures.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Search,
  Filter,
  Zap,
  Shield,
  Bot,
  Brain,
  Download,
  ExternalLink,
  ChevronRight,
  HardHat,
  Stethoscope,
  Briefcase,
  Globe,
  Database,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { agentsApi } from "@/lib/api";

const categories = ["All", "Fintech", "Healthcare", "Construction", "ESG", "Creator", "Legal"];

const skills = [
  {
    id: "construction-estimate",
    name: "Open Construction Estimate",
    provider: "ClawHub",
    description: "Accesses standardized unit price databases (55k+ items) for BIM and cost calculation.",
    category: "Construction",
    powers: ["v001", "v004"],
    icon: HardHat,
    color: "bg-orange-500",
    repoUrl: "https://clawhub.ai/skills/construction-estimate",
    isProprietary: false,
  },
  {
    id: "medical-billing",
    name: "Medical Billing Optimizer",
    provider: "Alpha Proprietary",
    description: "Autonomously scans clinical notes to detect revenue leaks and optimize claim submissions.",
    marketingDescription: "Expert AI coding and optimization engine to maximize healthcare revenue cycle efficiency.",
    category: "Healthcare",
    powers: ["v061"],
    icon: Stethoscope,
    color: "bg-rose-500",
    isProprietary: true,
  },
  {
    id: "payment-guard",
    name: "Payment Guard",
    provider: "ClawHub",
    description: "Real-time verification of beneficiaries and intent before a transaction is signed.",
    category: "Fintech",
    powers: ["v002", "v108"],
    icon: Shield,
    color: "bg-blue-500",
    repoUrl: "https://clawhub.ai/skills/payment-guard",
    isProprietary: false,
  },
  {
    id: "carbon-calc",
    name: "Lifecycle Carbon Calculator",
    provider: "ClawHub",
    description: "Calculates embodied carbon for construction and manufacturing materials in real-time.",
    category: "ESG",
    powers: ["v064", "v104"],
    icon: Globe,
    color: "bg-emerald-500",
    repoUrl: "https://clawhub.ai/skills/carbon-calc",
    isProprietary: false,
  },
  {
    id: "contract-analyzer",
    name: "AfrexAI Contract Analyzer",
    provider: "Alpha Proprietary",
    description: "Identifies risky clauses, unusual terms, and missing legal protections in enterprise contracts.",
    marketingDescription: "Advanced risk intelligence engine for automated legal document audit and protection.",
    category: "Legal",
    powers: ["v105", "v115"],
    icon: Briefcase,
    color: "bg-purple-500",
    isProprietary: true,
  },
  {
    id: "content-repurpose",
    name: "Blog to Social Media",
    provider: "GitHub",
    description: "Transforms long-form content into targeted X threads and LinkedIn carousels autonomously.",
    category: "Creator",
    powers: ["v114"],
    icon: Zap,
    color: "bg-amber-500",
    repoUrl: "https://github.com/openclaw/blog-to-social",
    isProprietary: false,
  },
  {
    id: "mema-vault",
    name: "A2A & Mema Vault",
    provider: "GitHub",
    description: "Zero-knowledge, AES-256 encrypted credential and secrets management for digital estates.",
    category: "Legal",
    powers: ["v120"],
    icon: Lock,
    color: "bg-indigo-500",
    repoUrl: "https://github.com/mema/vault-skill",
    isProprietary: false,
  },
];

export default function SkillMarketplace() {
  const { isManagement } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isInstalling, setIsInstalling] = useState<string | null>(null);

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = async (skillId: string) => {
    setIsInstalling(skillId);
    try {
      await agentsApi.installSkill(skillId);
      toast.success(`Skill deployed to active Agent pool`, {
        description: "The autonomous workforce has been equipped with the new capability.",
      });
    } catch (error: any) {
      toast.error("Installation failed", {
        description: error.message || "Failed to deploy skill to backend",
      });
    } finally {
      setIsInstalling(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-24 px-4 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header section... */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
              <Sparkles className="h-3 w-3" />
              100 Ventures Infrastructure
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
              Agent <span className="text-gradient-premium">Skill Marketplace</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Equip your autonomous workforce with specialized expertise sourced from the top 2026 agent registries.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
             <div className="flex items-center gap-4 bg-card/30 backdrop-blur-md border border-border/50 p-4 rounded-2xl">
                <div className="text-right">
                    <div className="text-sm font-medium text-foreground/70">Certified skills</div>
                    <div className="text-2xl font-bold text-primary">{skills.length}</div>
                </div>
                <div className="h-10 w-[1px] bg-border/50" />
                <div className="text-right">
                    <div className="text-sm font-medium text-foreground/70">Alpha Verified</div>
                    <div className="text-2xl font-bold text-indigo-400">
                      {new Set(skills.map(s => s.provider)).size}
                    </div>
                </div>
             </div>
             {isManagement && (
                <div className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-400/5 border border-emerald-400/20 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Management Access: Full Deployment Tier
                </div>
             )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-grow max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by skill, capability, or venture ID..."
              className="pl-10 h-12 bg-card/30 border-border/50 backdrop-blur-sm focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className={`rounded-full px-5 ${selectedCategory === cat ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "border-border/50 hover:bg-card/50"}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill, idx) => (
            <motion.div
              layout
              key={skill.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="group h-full flex flex-col glass-card border-border/50 hover:border-primary/50 transition-all duration-300 relative overflow-hidden noise-overlay">
                <div className={`absolute top-0 left-0 w-1 h-full ${skill.color}`} />
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${skill.color}/10 group-hover:scale-110 transition-transform duration-300`}>
                      <skill.icon className={`h-6 w-6 ${skill.color.replace('bg-', 'text-')}`} />
                    </div>
                    <Badge variant="secondary" className={`bg-muted/50 border-border/50 text-[10px] uppercase tracking-wider h-fit ${skill.isProprietary ? 'text-indigo-400 border-indigo-500/20' : ''}`}>
                      {skill.isProprietary ? 'Proprietary' : skill.provider}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{skill.name}</CardTitle>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                     <span className="font-semibold text-primary/80 uppercase">{skill.category}</span>
                     {!skill.isProprietary && (
                        <>
                           <span>•</span>
                           <Link href={skill.repoUrl || "#"} target="_blank" className="hover:text-foreground flex items-center gap-1 underline underline-offset-2">
                              View Repository <ExternalLink className="h-3 w-3" />
                           </Link>
                        </>
                     )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-sm text-balance leading-relaxed mb-6">
                    {(skill.isProprietary && !isManagement) ? skill.marketingDescription : skill.description}
                  </p>
                  
                  <div className="space-y-3">
                     <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Powers Ventures
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {skill.powers.map(vId => (
                           <Link key={vId} href={`/ventures/${vId}`}>
                              <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors cursor-pointer">
                                 {vId}
                              </span>
                           </Link>
                        ))}
                     </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-6 border-t border-border/20">
                    <div className="flex flex-col w-full gap-3">
                         {isManagement ? (
                            <Button 
                                className="w-full gap-2 shadow-lg shadow-primary/20"
                                onClick={() => handleInstall(skill.id)}
                                disabled={isInstalling === skill.id}
                            >
                                {isInstalling === skill.id ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        Deploying...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" /> Install & Deploy to Workforce
                                    </>
                                )}
                            </Button>
                         ) : (
                            <div className="flex flex-col gap-2">
                                <Link href="/signup">
                                    <Button variant="outline" className="w-full gap-2 border-primary/20 hover:border-primary/50">
                                        Learn More <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                                    <Lock className="h-3 w-3" /> Deployment gated for Enterprise tiers
                                </div>
                            </div>
                         )}
                    </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
        
        {/* Transparent Attribution Footer */}
        <div className="mt-24 pt-12 border-t border-border/50 text-center">
             <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center border border-border/50">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-muted-foreground">"Ingredient AI" Transparency Mode Active</div>
             </div>
             <p className="text-xs text-muted-foreground/60 max-w-2xl mx-auto italic">
                Sentinel uses a "Best-in-Class" modular architecture. Skills identified above are either proprietary extensions, 
                open-source certified plugins from GitHub, or integrated via the ClawHub (OpenClaw) marketplace.
             </p>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
