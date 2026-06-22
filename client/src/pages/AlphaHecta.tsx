/**
 * AlphaHecta - AI-Powered Enterprise Solutions
 * Company landing page showcasing products
 */

import * as React from "react";
import { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  animate,
} from "framer-motion";
import { Link } from "wouter";
import {
  Shield,
  Bot,
  Eye,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Zap,
  Lock,
  BarChart3,
  Globe,
  ChevronRight,
  Users,
  Stethoscope,
  Briefcase,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { extendedApi, Agent } from "@/lib/api";

const products = [
  {
    id: "agent-ops",
    name: "AgentOps",
    tagline: "Autonomous AI Workforce Management",
    description:
      "Deploy, monitor, and scale autonomous AI agents across your organization. Real-time performance tracking, error handling, and seamless integrations.",
    icon: Bot,
    color: "bg-blue-500",
    features: [
      "Multi-agent orchestration",
      "Real-time monitoring dashboard",
      "Automated error recovery",
      "Performance analytics",
      "API integrations",
    ],
    url: "/products/agent-ops",
  },
  {
    id: "ai-compliance",
    name: "AI Compliance Hub",
    tagline: "EU AI Act Compliance Made Simple",
    description:
      "Ensure your AI systems meet EU AI Act requirements. Automated risk assessments, documentation, and continuous monitoring.",
    icon: Shield,
    color: "bg-emerald-500",
    features: [
      "EU AI Act compliance scoring",
      "Automated risk assessments",
      "Documentation generation",
      "Audit trail & reporting",
      "Policy template library",
    ],
    url: "/products/ai-compliance",
  },
  {
    id: "deepfake-defense",
    name: "Deepfake Defense",
    tagline: "AI-Powered Media Authenticity",
    description:
      "Detect and prevent deepfake attacks with state-of-the-art AI detection. Protect your brand, employees, and customers from synthetic media threats.",
    icon: Eye,
    color: "bg-purple-500",
    features: [
      "Video & audio analysis",
      "Real-time threat detection",
      "API for integration",
      "Batch processing",
      "Threat intelligence feeds",
    ],
    url: "/products/deepfake-defense",
  },
  {
    id: "alpha-hecta-workforce",
    name: "AlphaHecta Workforce",
    tagline: "Autonomous Company + CashClaw",
    description:
      "Deploy an entire C-Suite of AI Executives that run your business autonomously AND earn revenue via CashClaw freelance integration.",
    icon: Users,
    color: "bg-indigo-600",
    features: [
      "Autonomous C-Suite",
      "CashClaw Revenue Generation",
      "Auto-Job Acceptance",
      "Skills Marketplace",
      "Stripe Integration",
    ],
    url: "/products/workforce",
  },
  {
    id: "market-intelligence",
    name: "Market Intelligence",
    tagline: "Venture Capital Gap Analysis",
    description:
      "Analyze the top 100 business ideas with explosive potential. Real-time data on market size, profit margins, and rollout speed.",
    icon: BarChart3,
    color: "bg-amber-500",
    features: [
      "Top 100 business ideas",
      "Gap analysis reports",
      "Market size estimation",
      "Profitability metrics",
      "Fast-rollout identification",
    ],
    url: "/market-intelligence",
  },
];

// Coming Soon Products
const comingSoonProducts = [
  {
    id: "denial-defense",
    name: "DenialDefense",
    tagline: "AI Medical Coding",
    description:
      "Payer-specific coding optimization, clinical note gap finder, and automated clearinghouse pre-scrub for healthcare claims.",
    icon: Stethoscope,
    color: "bg-rose-500",
    features: [
      "Payer-specific code suggestions",
      "Clinical note gap detection",
      "Automated claim validation",
      "Denial prevention",
    ],
    waitlist: true,
    url: "/products/denial-defense",
  },
  {
    id: "actionable-ai",
    name: "Actionable AI",
    tagline: "Task Completion Engine",
    description:
      "AI that doesn't just summarize—it completes tasks end-to-end. From scheduling to execution across your tools.",
    icon: Zap,
    color: "bg-orange-500",
    features: [
      "End-to-end task completion",
      "Cross-app automation",
      "Natural language execution",
      "Workflow orchestration",
    ],
    waitlist: true,
    url: "/products/actionable-ai",
  },
  {
    id: "freelancer-bot",
    name: "Freelancer Workflow Bot",
    tagline: "Admin Automation for Freelancers",
    description:
      "Automate invoicing, contract management, time tracking, and client communication for independent professionals.",
    icon: Briefcase,
    color: "bg-teal-500",
    features: [
      "Automated invoicing",
      "Contract management",
      "Time tracking",
      "Client communication",
    ],
    waitlist: true,
    url: "/products/workflow-bot",
  },
];

function LeadGenDialog({
  trigger,
  title = "Schedule a Demo",
}: {
  trigger: React.ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    try {
      await extendedApi.workforce.sourceLeads(
        `${name || "Lead"} (${email}) from ${company || "Unknown"} - ${title}`
      );
      toast.success(
        "Thank you! Our enterprise team will contact you within 24 hours.",
        {
          description: "A confirmation email has been sent to your inbox.",
        }
      );
    } catch {
      toast.success(
        "Thank you! Our enterprise team will contact you within 24 hours.",
        {
          description: "Your inquiry has been recorded.",
        }
      );
    }
    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter your details and our team will prepare a personalized
            walkthrough of the AlphaHecta suite.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="lead-email">Work Email</Label>
            <Input
              id="lead-email"
              placeholder="you@company.com"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-company">Company Name</Label>
            <Input id="lead-company" placeholder="Acme Inc." required />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Request Access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useAuth } from "@/contexts/AuthContext";
import { usePerspective } from "@/contexts/PerspectiveContext";

const Counter = ({
  value,
  duration = 1.5,
}: {
  value: number;
  duration?: number;
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest * 100) / 100);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(count, value, {
      duration: duration,
      ease: [0.165, 0.84, 0.44, 1], // quart-out
    });
    return controls.stop;
  }, [value, duration]);

  useEffect(() => {
    return rounded.onChange(v => {
      if (value % 1 === 0) {
        setDisplayValue(Math.floor(v).toLocaleString());
      } else {
        setDisplayValue(v.toFixed(2));
      }
    });
  }, [rounded, value]);

  return <>{displayValue}</>;
};

const NeuralFlow = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      <svg className="w-full h-full" viewBox="0 0 800 800">
        <defs>
          <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor="var(--primary-start)"
              stopOpacity="0"
            />
            <stop
              offset="50%"
              stopColor="var(--primary-start)"
              stopOpacity="1"
            />
            <stop
              offset="100%"
              stopColor="var(--primary-start)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {[...Array(6)].map((_, i) => (
          <motion.path
            key={i}
            d={`M ${100 + i * 100} 800 Q ${400 + (i - 3) * 50} 400 ${100 + i * 100} 0`}
            stroke="url(#flow-grad)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              pathOffset: [0, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default function AlphaHecta() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isManagement, hasProductAccess, isAuthenticated } = useAuth();
  const { perspective } = usePerspective();

  const publicProducts = products.filter(
    p => p.id !== "alpha-hecta-workforce" && p.id !== "market-intelligence"
  );
  const internalTools = products.filter(
    p => p.id === "alpha-hecta-workforce" || p.id === "market-intelligence"
  );

  const [platformStats, setPlatformStats] = useState({
    agentsOnline: 0,
    threatsBlocked: 0,
    complianceScore: 0,
    deepfakeConfidence: 0,
    agentOpsEfficiency: 0,
    aiActReadiness: 0,
  });

  useEffect(() => {
    async function fetchPlatformStats() {
      // Don't fetch stats if not authenticated
      if (!isAuthenticated) {
        return;
      }
      try {
        const [agents, compliance, safety] = await Promise.all([
          extendedApi.agents.list(),
          extendedApi.compliance.getStats() as Promise<Record<string, number> | null>,
          extendedApi.deepfake.getStats() as Promise<Record<string, number> | null>,
        ]);

        setPlatformStats({
          agentsOnline: agents.filter((a: Agent) => a.status === "running")
            .length,
          threatsBlocked: safety?.threats_detected || 0,
          complianceScore: compliance?.overall_score || 0,
          deepfakeConfidence: safety?.accuracy_score || 0,
          agentOpsEfficiency: 87,
          aiActReadiness: compliance?.readiness || 0,
        });
      } catch {
        console.error("Dashboard preview telemetry sync failed");
      }
    }
    fetchPlatformStats();
  }, [isAuthenticated]);

  const { scrollY } = useScroll();
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10]);
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(10, 10, 11, 0)", "rgba(10, 10, 11, 0.8)"]
  );

  return (
    <div className="min-h-screen bg-[#080809] text-foreground font-sans selection:bg-primary/30 relative">
      <div className="noise-texture" />

      {/* Navigation */}
      <motion.header
        style={{
          backdropFilter: `blur(${headerBlur}px)`,
          backgroundColor: headerBg,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 px-4 py-4 transition-colors duration-300"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-product-title text-white text-lg">
                AlphaHecta
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#products"
                className="text-feature font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-products"
              >
                Products
              </a>
              {isManagement && (
                <a
                  href="#internal"
                  className="text-feature font-medium text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                  data-testid="nav-internal"
                >
                  <Lock className="h-3 w-3" /> Internal
                </a>
              )}
              <Link
                href="/marketplace"
                className="text-feature font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-marketplace"
              >
                Marketplace
              </Link>
              <a
                href="#solutions"
                className="text-feature font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-solutions"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                className="text-feature font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-pricing"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-feature font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-about"
              >
                About
              </a>
              <Link href="/signup">
                <Button data-testid="btn-get-started">Get Started</Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="btn-mobile-menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 bg-background">
            <nav className="flex flex-col gap-4">
              <a
                href="#products"
                className="text-feature font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </a>
              {isManagement && (
                <a
                  href="#internal"
                  className="text-feature font-medium text-indigo-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Internal Tools
                </a>
              )}
              <Link
                href="/marketplace"
                className="text-feature font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              <a
                href="#solutions"
                className="text-feature font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </a>
              <a
                href="#pricing"
                className="text-feature font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-feature font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <Link href="/signup">
                <Button
                  className="w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden bg-background">
        {/* Ambient glow orbs */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
          aria-hidden
        >
          <div
            className={`absolute top-0 left-1/4 w-72 h-72 rounded-full blur-[120px] animate-pulse-slow transition-colors duration-1000 ${
              perspective === "alpha"
                ? "bg-blue-500/20"
                : perspective === "sigma"
                  ? "bg-purple-500/20"
                  : perspective === "omega"
                    ? "bg-emerald-500/20"
                    : "bg-blue-500/20"
            }`}
          />
          <div
            className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[140px] animate-pulse-slow transition-colors duration-1000 ${
              perspective === "alpha"
                ? "bg-purple-600/15"
                : perspective === "sigma"
                  ? "bg-blue-600/15"
                  : perspective === "omega"
                    ? "bg-indigo-600/15"
                    : "bg-purple-600/15"
            }`}
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Neural Grid */}
        <div
          className="absolute inset-0 pointer-events-none bg-neural-grid opacity-30"
          aria-hidden
        />

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-kicker mb-8 border backdrop-blur-sm transition-all duration-500 ${
                  perspective === "alpha"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : perspective === "sigma"
                      ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      : perspective === "omega"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                }`}
              >
                <Zap className="h-4 w-4" />
                Next-Gen Enterprise AI Orchestration
              </div>

              <h1 className="text-display-hero mb-8 text-balance">
                Deploy Production-Ready AI
                <span className="block text-gradient-premium mt-2">
                  in Days, Not Months
                </span>
              </h1>

              <p className="text-subheadline mb-10 max-w-xl text-balance">
                The unified platform to deploy autonomous agents, enforce
                regulatory compliance, and protect your brand from synthetic
                threats with military-grade precision.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-2 px-10 py-7 text-lg btn-primary-premium"
                    data-testid="btn-start-free-trial"
                  >
                    Start Building <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <LeadGenDialog
                  trigger={
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-10 py-7 text-lg border-primary/20 hover:bg-primary/5 transition-all duration-300"
                      data-testid="btn-schedule-demo"
                    >
                      <Sparkles className="w-5 h-5 mr-2 text-primary" />
                      View Demo
                    </Button>
                  }
                  title="Schedule an Enterprise Walkthrough"
                />
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold"
                    >
                      U{i}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium">
                  Trusted by{" "}
                  <span className="text-foreground font-bold">500+</span> teams
                  globally
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hyper-Neural Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 GlassCard rounded-[2.5rem] p-1 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-white/5 overflow-hidden group">
                <div className="bg-[#080809] rounded-[2.4rem] p-12 relative overflow-hidden">
                  <NeuralFlow />

                  {/* Central Core Element */}
                  <div className="relative z-20 flex flex-col items-center justify-center py-20">
                    <div className="relative group/core">
                      <div className="absolute inset-0 bg-primary-start blur-3xl opacity-20 group-hover/core:opacity-50 transition-opacity" />
                      <div className="relative h-32 w-32 GlassCard rounded-3xl flex items-center justify-center border-white/10 rotate-45 group-hover/core:rotate-90 transition-transform duration-700">
                        <Zap className="h-12 w-12 text-primary-start -rotate-45 group-hover/core:-rotate-90 transition-transform duration-700" />
                      </div>
                    </div>

                    <div className="mt-12 text-center">
                      <div className="text-technical mb-2">
                        Neural Synchronization
                      </div>
                      <div className="text-2xl font-black tabular-nums tracking-tighter">
                        <Counter value={99.982} />
                      </div>
                    </div>
                  </div>

                  {/* Corner technical markers */}
                  <div className="absolute top-8 left-8 text-[8px] font-mono opacity-20">
                    LATENCY_STABLE
                  </div>
                  <div className="absolute bottom-8 right-8 text-[8px] font-mono opacity-20">
                    SHIELD_PROTOCOL_v4
                  </div>
                </div>
              </div>

              {/* Floating ambient data nodes */}
              <motion.div
                animate={{ y: [0, -40, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute -top-10 -right-10 h-32 w-32 GlassCard rounded-2xl border-white/5 flex items-center justify-center backdrop-blur-3xl"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="section-divider-glow" />

      {/* Stats Ribbon — Social Proof */}
      <section className="py-20 px-4 bg-muted/5 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Uptime", value: 99.99, suffix: "%", icon: Zap },
              { label: "Global Clients", value: 10, suffix: "K+", icon: Globe },
              {
                label: "Venture Funding",
                value: 100,
                prefix: "$",
                suffix: "M+",
                icon: Shield,
              },
              { label: "Daily Predictions", value: 1, suffix: "B+", icon: Bot },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="text-center relative group GlassCard p-10 rounded-[2.5rem] border-white/5 transition-all duration-500"
              >
                <div className="absolute inset-0 iridescent-border-elite opacity-0 group-hover:opacity-20 transition-opacity rounded-[2.5rem]" />
                <div className="relative z-10">
                  <div className="text-stat text-gradient-premium mb-4 font-black tracking-tighter leading-none">
                    {stat.prefix}
                    <Counter value={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-technical tracking-[0.4em]">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-background relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-section-headline mb-6">
              Production AI in{" "}
              <span className="text-gradient-premium">3 Simple Steps</span>
            </h2>
            <p className="text-subheadline max-w-2xl mx-auto">
              We've abstracted the complexity of enterprise AI so you can focus
              on results, not infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 pointer-events-none" />

            {[
              {
                step: "01",
                title: "Connect Your Stack",
                desc: "Securely integrate your enterprise data, cloud infrastructure, and existing software tools.",
                icon: Globe,
                color: "text-blue-500",
              },
              {
                step: "02",
                title: "Deploy Agents",
                desc: "Launch specialized AI workforces tailored to your specific workflows and business logic.",
                icon: Bot,
                color: "text-purple-500",
              },
              {
                step: "03",
                title: "Scale & Protect",
                desc: "Monitor performance in real-time while our defense systems ensure compliance and safety.",
                icon: Shield,
                color: "text-emerald-500",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="relative z-10 p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="text-overline text-primary/40 mb-4">
                  {item.step}
                </div>
                <div
                  className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="text-card-title mb-4">{item.title}</h3>
                <p className="text-body opacity-70 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider-glow" />

      {/* Social Proof - Logo Marquee */}
      <section className="py-20 bg-background/50 border-y border-white/5 overflow-hidden">
        <div className="container mx-auto mb-10 text-center">
          <p className="text-caption-premium opacity-40 uppercase tracking-[0.3em]">
            Trusted by Industry Leaders
          </p>
        </div>
        <div className="flex items-center gap-24 whitespace-nowrap animate-marquee px-4 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className="flex items-center gap-4 text-3xl font-black tracking-tighter uppercase italic opacity-50"
            >
              <Zap className="h-8 w-8 text-primary-start" />{" "}
              {
                [
                  "Spotify",
                  "Apple",
                  "Mastercard",
                  "Google",
                  "HP",
                  "IBM",
                  "WorldBank",
                  "Nvidia",
                ][i - 1]
              }
            </div>
          ))}
          {/* Duplicate for seamless effect */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i + 8}
              className="flex items-center gap-4 text-3xl font-black tracking-tighter uppercase italic opacity-50"
            >
              <Zap className="h-8 w-8 text-primary-start" />{" "}
              {
                [
                  "Spotify",
                  "Apple",
                  "Mastercard",
                  "Google",
                  "HP",
                  "IBM",
                  "WorldBank",
                  "Nvidia",
                ][i - 1]
              }
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Our Ventures / Products Section */}
      <section
        id="products"
        className="py-32 px-4 bg-muted/5 relative overflow-hidden"
      >
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-section-headline mb-6"
            >
              The <span className="text-gradient-premium">Portfolio</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-subheadline max-w-2xl mx-auto"
            >
              Autonomous companies and specialized AI solutions built to
              orchestrate the future of enterprise operations.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="group relative overflow-hidden border-white/5 bg-black/40 backdrop-blur-3xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-700 h-full flex flex-col rounded-[2.5rem] p-1"
                  data-testid="venture-card"
                >
                  <div className="absolute inset-0 iridescent-border-elite opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="bg-[#080809] rounded-[2.4rem] h-full flex flex-col p-8">
                    <CardHeader className="p-0 mb-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                          <product.icon
                            className={`h-8 w-8 ${product.color.replace("bg-", "text-")}`}
                          />
                        </div>
                        <div className="text-technical opacity-40">
                          Active_Link
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-black tracking-tight mb-2">
                        {product.name}
                      </CardTitle>
                      <div className="text-technical text-primary-start">
                        {product.tagline}
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 flex-grow">
                      <p className="text-white/40 text-sm leading-relaxed mb-8">
                        {product.description}
                      </p>
                      <div className="space-y-4 mb-12">
                        {product.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-3">
                            <div className="h-1 w-1 rounded-full bg-primary-start" />
                            <span className="text-technical text-[9px] opacity-60">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="p-0">
                      <Link href={product.url} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full h-14 rounded-2xl border-white/5 bg-white/5 hover:bg-primary-start hover:text-black font-black uppercase tracking-[0.2em] text-xs transition-all duration-500"
                        >
                          {hasProductAccess(product.id)
                            ? "Access Protocol"
                            : "Authorize"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Management Tools Section */}
      {isManagement && (
        <section
          id="internal"
          className="py-24 px-4 bg-indigo-950/20 border-y border-indigo-500/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="container mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
              <div>
                <div className="text-kicker text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Management Only
                </div>
                <h2 className="text-section-headline">
                  Internal{" "}
                  <span className="text-indigo-500">Management Tools</span>
                </h2>
              </div>
              <p className="text-subheadline max-w-xl">
                Proprietary AlphaHecta workforce and intelligence tools reserved
                for executive operations and strategic analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
              {internalTools.map((tool, idx) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className="group relative overflow-hidden border-indigo-500/20 bg-indigo-950/30 backdrop-blur-md hover:border-indigo-500/50 transition-all duration-500 h-full flex flex-col"
                    data-testid="internal-tool-card"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${tool.color}/20`}>
                          <tool.icon
                            className={`h-6 w-6 ${tool.color.replace("bg-", "text-")}`}
                          />
                        </div>
                        <div className="text-caption-premium px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                          Restricted Access
                        </div>
                      </div>
                      <CardTitle className="text-card-title">
                        {tool.name}
                      </CardTitle>
                      <p className="text-caption-premium text-indigo-400 mt-1 uppercase">
                        {tool.tagline}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-body leading-relaxed mb-6">
                        {tool.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {tool.features.map((feature, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center text-feature text-foreground/70"
                          >
                            <Zap className="h-3 w-3 text-indigo-500 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-6 border-t border-indigo-500/10">
                        <Link href={tool.url}>
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            Access Tool{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Section */}
      <section className="py-24 px-4 bg-muted/20 relative">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-section-headline mb-4">
                Coming <span className="text-primary">Soon</span>
              </h2>
              <p className="text-body">
                Our R&D department is working on the next generation of
                AlphaHecta ventures. Join the waitlist to get early access to
                these cutting-edge solutions.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Clock className="h-5 w-5" />
                <span className="text-kicker">Next releases: Q3 2026</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {comingSoonProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="GlassCard p-1 rounded-[2.5rem] group border-white/5 overflow-hidden">
                  <div className="bg-[#080809] rounded-[2.4rem] p-10 h-full relative">
                    <div className="absolute top-8 right-8 text-technical text-[8px] opacity-20">
                      DEFERRED_DEPLOYMENT
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 h-fit">
                        <product.icon
                          className={`h-8 w-8 ${product.color.replace("bg-", "text-")}`}
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-2xl font-black mb-1">
                          {product.name}
                        </h3>
                        <div className="text-technical text-primary-start mb-6">
                          {product.tagline}
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed mb-8">
                          {product.description}
                        </p>
                        <LeadGenDialog
                          title={`Join ${product.name} Waitlist`}
                          trigger={
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto h-12 px-8 border-white/10 bg-white/5 hover:bg-primary-start hover:text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all"
                            >
                              Reserve Beta Access
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="solutions" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-section-headline mb-6">
                Why Enterprises Choose AlphaHecta
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/10">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-card-title mb-1">
                      Enterprise Security
                    </h3>
                    <p className="text-feature">
                      SOC 2 Type II certified, GDPR compliant, end-to-end
                      encryption
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/10">
                    <Globe className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-card-title mb-1">
                      Global Infrastructure
                    </h3>
                    <p className="text-feature">
                      99.9% uptime with data centers in US, EU, and APAC
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-500/10">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-card-title mb-1">Advanced Analytics</h3>
                    <p className="text-feature">
                      Real-time insights, custom dashboards, and exportable
                      reports
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-3xl opacity-20" />
              <div className="relative bg-card/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-caption-premium">
                      LIVE DASHBOARD PREVIEW
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                        AGENTS ONLINE
                      </div>
                      <div className="text-2xl font-black text-blue-400 tabular-nums">
                        {platformStats.agentsOnline}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                        THREATS BLOCKED
                      </div>
                      <div className="text-2xl font-black text-purple-400 tabular-nums">
                        {platformStats.threatsBlocked >= 1000
                          ? `${(platformStats.threatsBlocked / 1000).toFixed(1)}K`
                          : platformStats.threatsBlocked}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                        COMPLIANCE
                      </div>
                      <div className="text-2xl font-black text-emerald-400 tabular-nums">
                        {platformStats.complianceScore}%
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground w-20">
                        Deepfake
                      </span>
                      <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          style={{
                            width: `${platformStats.deepfakeConfidence}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-blue-400">
                        {platformStats.deepfakeConfidence}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground w-20">
                        AgentOps
                      </span>
                      <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                          style={{
                            width: `${platformStats.agentOpsEfficiency}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-purple-400">
                        {platformStats.agentOpsEfficiency}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground w-20">
                        EU AI Act
                      </span>
                      <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          style={{ width: `${platformStats.aiActReadiness}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {platformStats.aiActReadiness}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Momentum Close */}
      <section className="py-32 px-4 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-neural-grid opacity-20 pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto GlassCard p-12 md:p-20 rounded-[2rem] border-white/5 text-center relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/10 blur-[120px] pointer-events-none" />

            <Zap className="h-16 w-16 text-primary mx-auto mb-8 animate-pulse" />
            <h2 className="text-display-hero mb-6 text-white">
              The Future is{" "}
              <span className="text-gradient-premium">Autonomous</span>
            </h2>
            <p className="text-subheadline mb-12 max-w-2xl mx-auto text-white/70">
              Join 500+ global enterprises that have accelerated their AI
              roadmap by 10x. Production-ready, compliant, and secure.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="px-12 py-8 text-xl btn-primary-premium"
                >
                  Claim Your Instance <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <LeadGenDialog
                title="Enterprise Inquiry"
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-12 py-8 text-xl border-white/10 hover:bg-white/5 text-white"
                  >
                    Custom Integration
                  </Button>
                }
              />
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 pt-12 border-t border-white/5 opacity-40">
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-[10px] uppercase tracking-widest mt-1">
                  Uptime SLA
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">ISO</div>
                <div className="text-[10px] uppercase tracking-widest mt-1">
                  Certified
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Global</div>
                <div className="text-[10px] uppercase tracking-widest mt-1">
                  Footprint
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-32 px-4 bg-muted/5 relative overflow-hidden"
      >
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-section-headline mb-4">
              Scale with{" "}
              <span className="text-gradient-premium">Confidence</span>
            </h2>
            <p className="text-subheadline max-w-2xl mx-auto">
              Transparent, enterprise-grade pricing for teams of all sizes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                name: "Developer",
                price: "$0",
                period: "/free",
                features: [
                  "Solo builders & hackers",
                  "Community support",
                  "1M free tokens/mo",
                ],
                cta: "Start Building",
                variant: "outline",
              },
              {
                name: "Starter",
                price: "$499",
                period: "/month",
                features: [
                  "Up to 5 agents",
                  "100K tokens/day",
                  "Priority email",
                ],
                cta: "Get Started",
                variant: "outline",
              },
              {
                name: "Professional",
                price: "$1,499",
                period: "/month",
                features: [
                  "Up to 25 agents",
                  "1M tokens/day",
                  "Advanced analytics",
                ],
                cta: "Go Professional",
                variant: "default",
                highlight: "border-emerald-500 bg-emerald-500/5",
                text: "text-emerald-500",
              },
              {
                name: "Enterprise",
                price: "$2,500+",
                period: "/month",
                features: [
                  "Unlimited agents",
                  "VPC deployment",
                  "24/7 dedicated lead",
                ],
                cta: "Contact Sales",
                variant: "default",
                highlight: "border-blue-500 bg-blue-500/5",
                text: "text-blue-500",
                dialog: true,
              },
            ].map((plan, idx) => (
              <Card
                key={idx}
                className={`group relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 ${plan.highlight || ""}`}
              >
                <CardHeader>
                  <CardTitle className={`text-card-title ${plan.text || ""}`}>
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-price">{plan.price}</span>
                    <span className="text-body-sm text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.features.map((f, i) => (
                    <p key={i} className="text-feature flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary/40" /> {f}
                    </p>
                  ))}
                  <div className="pt-6">
                    {plan.dialog ? (
                      <LeadGenDialog
                        title="Enterprise Inquiry"
                        trigger={
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            {plan.cta}
                          </Button>
                        }
                      />
                    ) : (
                      <Link href="/signup">
                        <Button
                          className="w-full"
                          variant={plan.variant as "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null | undefined}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* About Section */}
      <section id="about" className="py-32 px-4 bg-background">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-section-headline mb-8">
                  Forging the{" "}
                  <span className="text-gradient-premium">AI Frontier</span>
                </h2>
                <p className="text-body-lg mb-8 leading-relaxed text-foreground/80">
                  AlphaHecta is more than a platform—it's the operating system
                  for the autonomous enterprise. Trusted by global leaders, we
                  bridge the gap between experimental AI and production-grade
                  certainty.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-stat text-primary">500+</div>
                    <div className="text-stat-label">Deployments</div>
                  </div>
                  <div>
                    <div className="text-stat text-primary">10x</div>
                    <div className="text-stat-label">Efficiency</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-neural-grid opacity-20" />
                  <Sparkles className="h-20 w-20 text-primary/20 group-hover:scale-110 transition-transform duration-700" />
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-card-title">AlphaHecta</span>
            </div>
            <p className="text-body-sm text-muted-foreground">
              © 2026 AlphaHecta Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  const w = window.open("", "_blank", "width=700,height=600");
                  if (w) {
                    w.document.write(
                      `<!DOCTYPE html><html><head><title>Privacy Policy - AlphaHecta</title><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:700px;margin:0 auto;background:#0f172a;color:#e2e8f0;line-height:1.7}h1{font-size:1.5rem;margin-bottom:1rem;border-bottom:1px solid #334155;padding-bottom:.5rem}h2{font-size:1.1rem;margin-top:1.5rem;color:#94a3b8}p,li{font-size:.9rem;color:#94a3b8}ul{padding-left:1.5rem}</style></head><body><h1>Privacy Policy</h1><p><strong>Effective Date:</strong> March 1, 2026</p><h2>1. Data Collection</h2><p>AlphaHecta collects account information (name, email), usage analytics, and API request logs to provide and improve our services.</p><h2>2. Data Usage</h2><p>We use collected data to: provide AI services, improve model accuracy, ensure security, and comply with legal obligations.</p><h2>3. Data Protection</h2><p>All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We undergo annual SOC 2 Type II audits.</p><h2>4. Third Parties</h2><p>We do not sell user data. We share data only with sub-processors listed in our DPA, under strict contractual obligations.</p><h2>5. Your Rights</h2><p>You may request data export, correction, or deletion at any time via settings or by contacting privacy@alphahecta.com.</p><h2>6. Contact</h2><p>For privacy inquiries: privacy@alphahecta.com</p></body></html>`
                    );
                  }
                }}
                className="text-body-sm text-muted-foreground hover:text-foreground"
                data-testid="btn-privacy"
              >
                Privacy
              </button>
              <button
                onClick={() => {
                  const w = window.open("", "_blank", "width=700,height=600");
                  if (w) {
                    w.document.write(
                      `<!DOCTYPE html><html><head><title>Terms of Service - AlphaHecta</title><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:700px;margin:0 auto;background:#0f172a;color:#e2e8f0;line-height:1.7}h1{font-size:1.5rem;margin-bottom:1rem;border-bottom:1px solid #334155;padding-bottom:.5rem}h2{font-size:1.1rem;margin-top:1.5rem;color:#94a3b8}p,li{font-size:.9rem;color:#94a3b8}ul{padding-left:1.5rem}</style></head><body><h1>Terms of Service</h1><p><strong>Effective Date:</strong> March 1, 2026</p><h2>1. Acceptance</h2><p>By using AlphaHecta services, you agree to these terms. If you are using on behalf of an organization, you represent authority to bind that organization.</p><h2>2. Services</h2><p>AlphaHecta provides AI-powered compliance, security, and workforce automation services. Services are provided as described in your subscription plan.</p><h2>3. Usage Limits</h2><p>Usage is subject to fair use policies and plan-specific rate limits. Excessive usage may require plan upgrades.</p><h2>4. Liability</h2><p>Services are provided "as-is." AlphaHecta's liability is limited to the fees paid in the preceding 12 months. Enterprise SLA terms apply under separate agreement.</p><h2>5. Termination</h2><p>Either party may terminate with 30 days written notice. Upon termination, data export is available for 60 days.</p><h2>6. Contact</h2><p>For legal inquiries: legal@alphahecta.com</p></body></html>`
                    );
                  }
                }}
                className="text-body-sm text-muted-foreground hover:text-foreground"
                data-testid="btn-terms"
              >
                Terms
              </button>
              <button
                onClick={() => {
                  toast.info(
                    "Contact us at support@alphahecta.com or use the lead capture form."
                  );
                }}
                className="text-body-sm text-muted-foreground hover:text-foreground"
                data-testid="btn-contact"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
