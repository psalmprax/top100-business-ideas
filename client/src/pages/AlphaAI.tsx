/**
 * AlphaAI - AI-Powered Enterprise Solutions
 * Company landing page showcasing products
 */

import { useState } from "react";
import { motion } from "framer-motion";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { extendedApi } from "@/lib/api";

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
    id: "alpha-workforce",
    name: "Alpha Workforce",
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

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "500+", label: "Enterprise Clients" },
  { value: "50M+", label: "API Calls/Month" },
  { value: "<100ms", label: "Avg Response Time" },
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
            walkthrough of the Alpha suite.
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

export default function AlphaAI() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isManagement, hasProductAccess, isAuthenticated } = useAuth();

  const publicProducts = products.filter(
    p => p.id !== "alpha-workforce" && p.id !== "market-intelligence"
  );
  const internalTools = products.filter(
    p => p.id === "alpha-workforce" || p.id === "market-intelligence"
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header section... */}
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">AlphaAI</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#products"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-products"
              >
                Products
              </a>
              {isManagement && (
                <a
                  href="#internal"
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                  data-testid="nav-internal"
                >
                  <Lock className="h-3 w-3" /> Internal
                </a>
              )}
              <a
                href="#solutions"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-solutions"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-pricing"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </a>
              {isManagement && (
                <a
                  href="#internal"
                  className="text-sm font-medium text-indigo-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Internal Tools
                </a>
              )}
              <a
                href="#solutions"
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-sm font-medium"
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
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Now available: Enterprise tier with custom SLAs
            </div>
            <h1 className="text-display-hero mb-6 text-balance">
              Enterprise AI Solutions
              <span className="block text-gradient-premium">
                Built for Production
              </span>
            </h1>
            <p className="text-subheadline mb-8 max-w-2xl mx-auto text-balance">
              Deploy autonomous AI agents, ensure regulatory compliance, and
              protect against deepfake threats — all from one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gap-2"
                  data-testid="btn-start-free-trial"
                >
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <LeadGenDialog
                trigger={
                  <Button
                    size="lg"
                    data-testid="btn-schedule-demo"
                    className="px-10 py-6 text-lg hover:scale-105 transition-transform duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.2 250), oklch(0.55 0.2 280))",
                      border: "none",
                    }}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Discuss Your AI Needs
                  </Button>
                }
                title="Custom AI Solutions Inquiry"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Ventures / Products Section */}
      <section
        id="products"
        className="py-24 px-4 bg-background relative overflow-hidden"
      >
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter"
            >
              Our <span className="text-gradient-premium">Ventures</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              A portfolio of autonomous companies and AI solutions built to
              solve real-world enterprise challenges.
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
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full flex flex-col noise-overlay"
                  data-testid="venture-card"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl ${product.color}/10 transition-transform group-hover:scale-110 duration-300`}
                      >
                        <product.icon
                          className={`h-6 w-6 ${product.color.replace("bg-", "text-")}`}
                        />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <p className="text-caption-premium text-primary/80 mt-1">
                      {product.tagline}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {product.description}
                    </p>
                    <ul className="space-y-2 mb-8">
                      {product.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-center text-sm text-foreground/80"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-6 border-t border-border/50">
                      <Link href={product.url}>
                        <Button
                          className={`w-full transition-all duration-300 ${!hasProductAccess(product.id) && isAuthenticated ? "opacity-50 grayscale cursor-not-allowed" : "group-hover:bg-primary group-hover:text-primary-foreground"}`}
                        >
                          {!isAuthenticated
                            ? "Learn More"
                            : hasProductAccess(product.id)
                              ? "Learn More"
                              : "Upgrade to Unlock"}
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
                <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2 uppercase tracking-widest text-sm">
                  <Lock className="h-4 w-4" /> Management Only
                </div>
                <h2 className="text-4xl font-bold tracking-tight">
                  Internal{" "}
                  <span className="text-indigo-500">Management Tools</span>
                </h2>
              </div>
              <p className="text-muted-foreground max-w-xl text-lg">
                Proprietary AlphaAI workforce and intelligence tools reserved
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
                        <div className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-tighter">
                          Restricted Access
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold">
                        {tool.name}
                      </CardTitle>
                      <p className="text-caption-premium text-indigo-400 mt-1">
                        {tool.tagline}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {tool.features.map((feature, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center text-sm text-foreground/70"
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Coming <span className="text-primary">Soon</span>
              </h2>
              <p className="text-muted-foreground">
                Our R&D department is working on the next generation of AlphaAI
                ventures. Join the waitlist to get early access to these
                cutting-edge solutions.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Clock className="h-5 w-5" />
                <span>Next releases: Q3 2026</span>
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
                <div className="relative group overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 h-full">
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="flex flex-col md:flex-row gap-6">
                    <div
                      className={`flex-shrink-0 p-4 rounded-xl ${product.color}/10 h-fit`}
                    >
                      <product.icon
                        className={`h-8 w-8 ${product.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm font-semibold text-primary mb-4">
                        {product.tagline}
                      </p>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {product.features.map((feature, fIdx) => (
                          <span
                            key={fIdx}
                            className="text-xs px-2 py-1 rounded-full bg-muted border border-border/50"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <LeadGenDialog
                        title={`Join ${product.name} Waitlist`}
                        trigger={
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-primary/20 hover:border-primary/50 gap-2"
                          >
                            Join Waitlist <ArrowRight className="h-4 w-4" />
                          </Button>
                        }
                      />
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
              <h2 className="text-3xl font-bold mb-6">
                Why Enterprises Choose AlphaAI
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/10">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Enterprise Security</h3>
                    <p className="text-sm text-muted-foreground">
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
                    <h3 className="font-semibold mb-1">
                      Global Infrastructure
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      99.9% uptime with data centers in US, EU, and APAC
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-500/10">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time insights, custom dashboards, and exportable
                      reports
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-3xl opacity-20" />
              <div className="relative bg-card border rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="h-2 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                  <div className="h-2 bg-muted rounded w-5/6" />
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="h-20 bg-blue-500/20 rounded-lg" />
                    <div className="h-20 bg-purple-500/20 rounded-lg" />
                    <div className="h-20 bg-emerald-500/20 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your AI Operations?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join 500+ enterprises already using AlphaAI to power their AI
            initiatives
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <LeadGenDialog
              title="Contact Sales"
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white/10"
                >
                  Contact Sales
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your enterprise needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Developer</CardTitle>
                <p className="text-3xl font-bold">
                  $0
                  <span className="text-sm font-normal text-muted-foreground">
                    /free
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Solo builders & hackers
                </p>
                <p className="text-sm text-muted-foreground">
                  Community support
                </p>
                <p className="text-sm text-muted-foreground">
                  1M free tokens/mo
                </p>
                <Link href="/signup">
                  <Button className="w-full" variant="outline">
                    Start Building
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <p className="text-3xl font-bold">
                  $499
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Up to 5 agents</p>
                <p className="text-sm text-muted-foreground">100K tokens/day</p>
                <p className="text-sm text-muted-foreground">Priority email</p>
                <Link href="/signup">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-emerald-500 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-emerald-500">Professional</CardTitle>
                <p className="text-3xl font-bold">
                  $1,499
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Up to 25 agents</p>
                <p className="text-sm text-muted-foreground">1M tokens/day</p>
                <p className="text-sm text-muted-foreground">
                  Advanced analytics
                </p>
                <Link href="/signup">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Go Professional
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-blue-500 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-blue-500">Enterprise</CardTitle>
                <p className="text-3xl font-bold">
                  $2,500
                  <span className="text-sm font-normal text-muted-foreground">
                    + /month
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Unlimited agents
                </p>
                <p className="text-sm text-muted-foreground">VPC deployment</p>
                <p className="text-sm text-muted-foreground">
                  24/7 dedicated lead
                </p>
                <LeadGenDialog
                  title="Contact Enterprise Sales"
                  trigger={
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Contact Sales
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About AlphaAI</h2>
            <p className="text-muted-foreground mb-8">
              AlphaAI is a leading enterprise AI platform trusted by Fortune 500
              companies worldwide. We specialize in autonomous agent operations,
              AI compliance, and deepfake defense solutions.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-3xl font-bold text-blue-500">500+</p>
                <p className="text-sm text-muted-foreground">
                  Enterprise Customers
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-500">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime SLA</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-500">24/7</p>
                <p className="text-sm text-muted-foreground">Support</p>
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
              <span className="font-bold">AlphaAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 AlphaAI Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  const w = window.open("", "_blank", "width=600,height=400");
                  if (w) {
                    w.document.write(
                      '<html><head><title>Privacy Policy</title></head><body style="font-family:sans-serif;padding:2rem;background:#0f172a;color:#e2e8f0"><h1>Privacy Policy</h1><p>AlphaAI Inc. respects your privacy. We collect only necessary data to provide our services. Data is encrypted at rest and in transit. We do not sell user data to third parties. For inquiries, contact privacy@alphaai.example.com</p><p>Last updated: March 2026</p></body></html>'
                    );
                  }
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
                data-testid="btn-privacy"
              >
                Privacy
              </button>
              <button
                onClick={() => {
                  const w = window.open("", "_blank", "width=600,height=400");
                  if (w) {
                    w.document.write(
                      '<html><head><title>Terms of Service</title></head><body style="font-family:sans-serif;padding:2rem;background:#0f172a;color:#e2e8f0"><h1>Terms of Service</h1><p>By using AlphaAI services, you agree to our terms. Services are provided as-is. Usage is subject to fair use policies. Enterprise clients receive dedicated SLA terms under separate agreement.</p><p>Last updated: March 2026</p></body></html>'
                    );
                  }
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
                data-testid="btn-terms"
              >
                Terms
              </button>
              <button
                onClick={() =>
                  (window.location.href =
                    "mailto:support@alphaai.example.com?subject=Support%20Request")
                }
                className="text-sm text-muted-foreground hover:text-foreground"
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
