/**
 * Billing Page
 * Subscription management and payment settings
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CreditCard,
    Check,
    X,
    ExternalLink,
    Download,
    History,
    Shield,
    Zap,
    Building2,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
    highlighted?: boolean;
}

const plans: Plan[] = [
    {
        id: 'developer',
        name: 'Developer',
        price: 0,
        interval: 'forever',
        features: [
            'Up to 1M tokens/mo',
            '1 agent',
            'Basic dashboard',
            'Community support',
        ],
    },
    {
        id: 'starter',
        name: 'Starter',
        price: 499,
        interval: 'month',
        features: [
            'Up to 5 agents',
            '100K tokens/day',
            'Basic analytics',
            'Priority support',
        ],
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 1499,
        interval: 'month',
        highlighted: true,
        features: [
            'Up to 25 agents',
            '1M tokens/day',
            'Advanced analytics',
            'Custom rules engine',
            'Slack/Teams integration',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 2500,
        interval: 'month',
        features: [
            'Unlimited agents',
            'Unlimited tokens',
            'VPC deployment',
            'PII masking',
            'SSO/SAML',
            'Dedicated support',
            '24/7 SLA guarantee',
        ],
    },
];

const invoices = [
    { id: 'INV-001', date: '2024-03-01', amount: 49, status: 'paid' },
    { id: 'INV-002', date: '2024-02-01', amount: 49, status: 'paid' },
    { id: 'INV-003', date: '2024-01-01', amount: 49, status: 'paid' },
];

export default function Billing() {
    const [selectedPlan, setSelectedPlan] = useState('professional');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPlan] = useState('starter');

    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const handleUpgrade = async (planId: string) => {
        setIsLoading(true);
        setSelectedPlan(planId);

        // Simulate API call to create checkout session
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In production, this would redirect to Stripe Checkout
        // For hardening, we show a success simulation
        setShowSuccessDialog(true);
        toast.success("Subscription upgraded successfully", {
            description: `You are now on the ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan.`
        });

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
                    <p className="text-slate-400">Manage your subscription and billing details</p>
                </div>

                <Tabs defaultValue="plans" className="space-y-6">
                    <TabsList className="bg-slate-800">
                        <TabsTrigger value="plans">Plans</TabsTrigger>
                        <TabsTrigger value="payment">Payment Method</TabsTrigger>
                        <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    </TabsList>

                    <TabsContent value="plans" className="space-y-6">
                        {/* Current Plan Banner */}
                        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-400">Current Plan: {currentPlan === 'growth' ? 'Growth' : currentPlan === 'enterprise' ? 'Enterprise' : 'Developer'}</h3>
                                        <p className="text-sm text-slate-400">Your next billing date is April 1, 2024</p>
                                    </div>
                                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                        Active
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Plans Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`relative ${plan.highlighted
                                            ? 'bg-slate-800 border-blue-500'
                                            : 'bg-slate-800/50 border-slate-700'
                                        }`}
                                >
                                    {plan.highlighted && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-blue-600">Most Popular</Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            {plan.price === 0 ? 'Free forever' : `$${plan.price}/mo`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            onClick={() => handleUpgrade(plan.id)}
                                            disabled={currentPlan === plan.id || isLoading}
                                            className={`w-full ${plan.highlighted
                                                    ? 'bg-blue-600 hover:bg-blue-700'
                                                    : 'bg-slate-700 hover:bg-slate-600'
                                                }`}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : currentPlan === plan.id ? (
                                                'Current Plan'
                                            ) : plan.price === 0 ? (
                                                'Downgrade'
                                            ) : (
                                                'Upgrade'
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="payment">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Manage your payment methods
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Current Card */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-slate-400">Expires 12/2025</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                        Default
                                    </Badge>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Add Payment Method
                                    </Button>
                                    <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Billing Address
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    <p className="text-sm text-amber-200">
                                        Your subscription will automatically renew on April 1, 2024
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="invoices">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle>Invoice History</CardTitle>
                                <CardDescription className="text-slate-400">
                                    View and download your past invoices
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {invoices.map((invoice) => (
                                        <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
                                                    <History className="w-5 h-5 text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{invoice.id}</p>
                                                    <p className="text-sm text-slate-400">{invoice.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold">${invoice.amount}.00</span>
                                                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                                    {invoice.status}
                                                </Badge>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Usage Section */}
                <div className="mt-8 grid md:grid-cols-3 gap-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">This Month's Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">2.4M</div>
                            <p className="text-sm text-slate-400">of 5M tokens</p>
                            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '48%' }} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">API Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">12,847</div>
                            <p className="text-sm text-green-400">+23% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Active Agents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">4</div>
                            <p className="text-sm text-slate-400">of unlimited</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl font-bold">Payment Successful</DialogTitle>
                        <DialogDescription className="text-center text-slate-400">
                            Your account has been upgraded to the <strong>{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</strong> plan.
                            A confirmation and invoice have been sent to your email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 text-sm text-slate-300">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span>Transaction ID</span>
                            <span className="text-white font-mono">TXN_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span>Plan</span>
                            <span className="text-white">{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span>Billing Cycle</span>
                            <span className="text-white">Monthly</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800" onClick={() => setShowSuccessDialog(false)}>
                            Return to Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
