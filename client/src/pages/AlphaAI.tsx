/**
 * AlphaAI - AI-Powered Enterprise Solutions
 * Company landing page showcasing products
 */

import { useState } from "react";
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
    Users
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

const products = [
    {
        id: "agent-ops",
        name: "AgentOps",
        tagline: "Autonomous AI Workforce Management",
        description: "Deploy, monitor, and scale autonomous AI agents across your organization. Real-time performance tracking, error handling, and seamless integrations.",
        icon: Bot,
        color: "bg-blue-500",
        features: [
            "Multi-agent orchestration",
            "Real-time monitoring dashboard",
            "Automated error recovery",
            "Performance analytics",
            "API integrations"
        ],
        url: "/products/agent-ops"
    },
    {
        id: "ai-compliance",
        name: "AI Compliance Hub",
        tagline: "EU AI Act Compliance Made Simple",
        description: "Ensure your AI systems meet EU AI Act requirements. Automated risk assessments, documentation, and continuous monitoring.",
        icon: Shield,
        color: "bg-emerald-500",
        features: [
            "EU AI Act compliance scoring",
            "Automated risk assessments",
            "Documentation generation",
            "Audit trail & reporting",
            "Policy template library"
        ],
        url: "/products/ai-compliance"
    },
    {
        id: "deepfake-defense",
        name: "Deepfake Defense",
        tagline: "AI-Powered Media Authenticity",
        description: "Detect and prevent deepfake attacks with state-of-the-art AI detection. Protect your brand, employees, and customers from synthetic media threats.",
        icon: Eye,
        color: "bg-purple-500",
        features: [
            "Video & audio analysis",
            "Real-time threat detection",
            "API for integration",
            "Batch processing",
            "Threat intelligence feeds"
        ],
        url: "/products/deepfake-defense"
    },
    {
        id: "alpha-workforce",
        name: "Alpha Workforce",
        tagline: "Autonomous Company Simulation",
        description: "Deploy an entire C-Suite of AI Executives. Sales, Marketing, and Accounting agents run your business autonomously in your absence.",
        icon: Users,
        color: "bg-indigo-600",
        features: [
            "Autonomous C-Suite",
            "Delegated Authority Mode",
            "Self-Scaling Operations",
            "Cross-agent coordination",
            "Direct KPI alignment"
        ],
        url: "/products/workforce"
    }
];

const stats = [
    { value: "99.9%", label: "Uptime SLA" },
    { value: "500+", label: "Enterprise Clients" },
    { value: "50M+", label: "API Calls/Month" },
    { value: "<100ms", label: "Avg Response Time" }
];

function LeadGenDialog({ trigger, title = "Schedule a Demo" }: { trigger: React.ReactNode, title?: string }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        toast.success("Thank you! Our enterprise team will contact you within 24 hours.", {
            description: "A confirmation email has been sent to your inbox."
        });
        setIsSubmitting(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Enter your details and our team will prepare a personalized walkthrough of the Alpha suite.
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
                        <Input
                            id="lead-company"
                            placeholder="Acme Inc."
                            required
                        />
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
    const { isManagement } = useAuth();

    const visibleProducts = products.filter(p => {
        if (p.id === 'alpha-workforce') return isManagement;
        return true;
    });

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
                            <a href="#products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</a>
                            <a href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
                            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
                            <Link href="/signup">
                                <Button>Get Started</Button>
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t p-4 bg-background">
                        <nav className="flex flex-col gap-4">
                            <a href="#products" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Products</a>
                            <a href="#solutions" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
                            <a href="#pricing" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                            <a href="#about" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>About</a>
                            <Link href="/signup">
                                <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>Get Started</Button>
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
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Enterprise AI Solutions
                            <span className="block text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                                Built for Production
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Deploy autonomous AI agents, ensure regulatory compliance, and protect against deepfake threats — all from one platform.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <Button size="lg" className="gap-2">
                                    Start Free Trial <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <LeadGenDialog
                                trigger={
                                    <Button 
                                        size="lg" 
                                        variant="outline"
                                    >
                                        Schedule Demo
                                    </Button>
                                }
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-20 px-4 bg-muted/30">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Our Products</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Comprehensive AI solutions designed for enterprise needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {visibleProducts.map((product) => (
                            <Link key={product.id} href={product.url}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                                    <CardContent className="p-6">
                                        <div className={`inline-flex p-3 rounded-lg ${product.color} mb-4`}>
                                            <product.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-1 group-hover:text-blue-500 transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">{product.tagline}</p>
                                        <p className="text-sm text-muted-foreground mb-6">
                                            {product.description}
                                        </p>
                                        <ul className="space-y-2 mb-6">
                                            {product.features.slice(0, 3).map((feature) => (
                                                <li key={feature} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex items-center text-blue-500 font-medium">
                                            Learn more <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
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
                                            SOC 2 Type II certified, GDPR compliant, end-to-end encryption
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/10">
                                        <Globe className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Global Infrastructure</h3>
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
                                            Real-time insights, custom dashboards, and exportable reports
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
                        Join 500+ enterprises already using AlphaAI to power their AI initiatives
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
                        <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Choose the plan that fits your enterprise needs
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle>Developer</CardTitle>
                                <p className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/free</span></p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Solo builders & hackers</p>
                                <p className="text-sm text-muted-foreground">Community support</p>
                                <p className="text-sm text-muted-foreground">1M free tokens/mo</p>
                                <Link href="/signup">
                                    <Button className="w-full" variant="outline">Start Building</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Starter</CardTitle>
                                <p className="text-3xl font-bold">$499<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Up to 5 agents</p>
                                <p className="text-sm text-muted-foreground">100K tokens/day</p>
                                <p className="text-sm text-muted-foreground">Priority email</p>
                                <Link href="/signup">
                                    <Button className="w-full" variant="outline">Get Started</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="border-emerald-500 bg-emerald-500/5">
                            <CardHeader>
                                <CardTitle className="text-emerald-500">Professional</CardTitle>
                                <p className="text-3xl font-bold">$1,499<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Up to 25 agents</p>
                                <p className="text-sm text-muted-foreground">1M tokens/day</p>
                                <p className="text-sm text-muted-foreground">Advanced analytics</p>
                                <Link href="/signup">
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Go Professional</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-500 bg-blue-500/5">
                            <CardHeader>
                                <CardTitle className="text-blue-500">Enterprise</CardTitle>
                                <p className="text-3xl font-bold">$2,500<span className="text-sm font-normal text-muted-foreground">+ /month</span></p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Unlimited agents</p>
                                <p className="text-sm text-muted-foreground">VPC deployment</p>
                                <p className="text-sm text-muted-foreground">24/7 dedicated lead</p>
                                <LeadGenDialog
                                    title="Contact Enterprise Sales"
                                    trigger={
                                        <Button 
                                            className="w-full bg-blue-600 hover:bg-blue-700" 
                                        >
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
                            AlphaAI is a leading enterprise AI platform trusted by Fortune 500 companies worldwide.
                            We specialize in autonomous agent operations, AI compliance, and deepfake defense solutions.
                        </p>
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <p className="text-3xl font-bold text-blue-500">500+</p>
                                <p className="text-sm text-muted-foreground">Enterprise Customers</p>
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
                            © 2025 AlphaAI Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <button onClick={() => toast.info("Privacy Policy coming soon.")} className="text-sm text-muted-foreground hover:text-foreground">Privacy</button>
                            <button onClick={() => toast.info("Terms of Service coming soon.")} className="text-sm text-muted-foreground hover:text-foreground">Terms</button>
                            <button onClick={() => toast.info("Contact support: support@alphaai.example.com")} className="text-sm text-muted-foreground hover:text-foreground">Contact</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
