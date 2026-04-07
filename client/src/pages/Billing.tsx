/**
 * Billing Page
 * Subscription management and payment settings
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { billingApi, Subscription, Invoice } from "@/lib/api";

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
    id: "developer",
    name: "Developer",
    price: 0,
    interval: "forever",
    features: [
      "Up to 1M tokens/mo",
      "1 agent",
      "Basic dashboard",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 499,
    interval: "month",
    features: [
      "Up to 5 agents",
      "100K tokens/day",
      "Basic analytics",
      "Priority support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 1499,
    interval: "month",
    highlighted: true,
    features: [
      "Up to 25 agents",
      "1M tokens/day",
      "Advanced analytics",
      "Custom rules engine",
      "Slack/Teams integration",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 2500,
    interval: "month",
    features: [
      "Unlimited agents",
      "Unlimited tokens",
      "VPC deployment",
      "PII masking",
      "SSO/SAML",
      "Dedicated support",
      "24/7 SLA guarantee",
    ],
  },
];

export default function Billing() {
  const [location] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Parse query params for success/canceled feedback
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("success") === "true") {
      setShowSuccessDialog(true);
      toast.success("Payment completed successfully!");
    }
    if (searchParams.get("canceled") === "true") {
      toast.error("Checkout was canceled.");
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sub, inv] = await Promise.all([
          billingApi.subscription(),
          billingApi.invoices(),
        ]);
        setSubscription(sub);
        setInvoiceHistory(inv);
      } catch (err) {
        console.error("Failed to fetch billing data", err);
        // Fallback or error state
      } finally {
        setIsDataLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpgrade = async (
    planId: string,
    provider: "stripe" | "paypal" = "stripe"
  ) => {
    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      toast.loading(
        `Redirecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`
      );
      const response = await billingApi.createCheckout(planId);

      if (response && response.url) {
        window.location.assign(response.url);
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err: any) {
      toast.error("Failed to initiate checkout", {
        description: err.message || "Please check your network connection.",
      });
      setIsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    toast.info("Securely redirecting to your Customer Portal...");
    try {
      const response = await billingApi.updatePaymentMethod("portal");
      // REAL-FIRST: Redirect to actual portal URL if provided
      if (response && (response as any).url) {
        window.location.assign((response as any).url);
      } else {
        toast.success("Portal access granted - No direct redirect provided");
      }
    } catch (err) {
      toast.error("Cloud vault connection failed");
    }
  };

  const handleDownloadInvoice = (id: string) => {
    toast.info(`Fetching secure document ${id}...`);
    // In production, this would open the pdfUrl from the invoice object
    const invoice = invoiceHistory.find(inv => inv.id === id);
    if (invoice && invoice.pdfUrl) {
      window.open(invoice.pdfUrl, "_blank");
    }
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display-hero mb-2">Billing & Subscription</h1>
          <p className="text-caption-premium text-[11px] text-slate-400/80 leading-none mt-1">
            Real-time subscription management via Stripe & PayPal
          </p>
        </div>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="plans" data-testid="tab-plans">
              Plans
            </TabsTrigger>
            <TabsTrigger value="payment" data-testid="tab-payment">
              Payment Method
            </TabsTrigger>
            <TabsTrigger value="invoices" data-testid="tab-invoices">
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Current Plan Banner */}
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-card-title text-blue-400">
                      Current Plan:{" "}
                      {subscription?.plan
                        ? subscription.plan.charAt(0).toUpperCase() +
                          subscription.plan.slice(1)
                        : "Free"}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Renews on:{" "}
                      {subscription?.currentPeriodEnd
                        ? new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      {subscription?.status || "Active"}
                    </Badge>
                    {subscription?.plan &&
                      subscription.plan !== "developer" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Are you sure you want to cancel your subscription? Access will continue until the end of your billing period."
                              )
                            ) {
                              try {
                                await billingApi.cancel();
                                toast.success(
                                  "Subscription cancelled. Access continues until period end."
                                );
                                const sub = await billingApi.subscription();
                                setSubscription(sub);
                              } catch (err: any) {
                                toast.error(
                                  err.message || "Failed to cancel subscription"
                                );
                              }
                            }
                          }}
                        >
                          Cancel Subscription
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map(plan => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.highlighted
                      ? "bg-slate-800 border-blue-500"
                      : "bg-slate-800/50 border-slate-700"
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
                      {plan.price === 0 ? "Free forever" : `$${plan.price}/mo`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-body-sm"
                        >
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={subscription?.plan === plan.id || isLoading}
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                      data-testid={`btn-upgrade-${plan.id}`}
                    >
                      {isLoading && selectedPlan === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : subscription?.plan === plan.id ? (
                        "Current Plan"
                      ) : plan.price === 0 ? (
                        "Downgrade"
                      ) : (
                        "Upgrade"
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
                <CardTitle>Secure Checkout & Portal</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your payment methods via the Stripe/PayPal native
                  environments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-700"
                    data-testid="btn-add-payment"
                    onClick={handleAddPayment}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Open Billing Portal
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-blue-200">
                    Your payment data is fully encrypted and managed by
                    Stripe/PayPal.
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
                  Download official tax invoices from your history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoiceHistory.length > 0 ? (
                    invoiceHistory.map(invoice => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
                            <History className="w-5 h-5 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-body-sm font-medium">
                              {invoice.id}
                            </p>
                            <p className="text-body-sm text-slate-400">
                              {new Date(invoice.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            ${invoice.amount / 100}
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            {invoice.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`btn-download-invoice-${invoice.id}`}
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-8">
                      No invoices found for this account.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>
            <DialogTitle className="text-section-headline text-center">
              Subscription Active
            </DialogTitle>
            <DialogDescription className="text-body-sm text-center">
              Your account has been successfully synchronized with the payment
              provider.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full border-slate-700 hover:bg-slate-800"
              onClick={() => setShowSuccessDialog(false)}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
