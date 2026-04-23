import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Rocket,
  ShieldCheck,
  Cpu,
  Fingerprint,
  Zap,
  Bot,
  Users,
} from "lucide-react";
import { extendedApi } from "@/lib/api";
import { toast } from "sonner";

const PRODUCT_MAPPING: Record<
  string,
  { label: string; icon: any; color: string; path: string }
> = {
  "agent-ops": {
    label: "AgentOps",
    icon: Cpu,
    color: "text-blue-400",
    path: "/products/agent-ops",
  },
  "ai-compliance": {
    label: "Compliance",
    icon: ShieldCheck,
    color: "text-green-400",
    path: "/products/ai-compliance",
  },
  "deepfake-defense": {
    label: "Deepfake Defense",
    icon: Fingerprint,
    color: "text-purple-400",
    path: "/products/deepfake-defense",
  },
  "denial-defense": {
    label: "Denial Defense",
    icon: ShieldCheck,
    color: "text-red-400",
    path: "/products/denial-defense",
  },
  "actionable-ai": {
    label: "Actionable AI",
    icon: Zap,
    color: "text-yellow-400",
    path: "/products/actionable-ai",
  },
  "workflow-bot": {
    label: "Workflow Bot",
    icon: Bot,
    color: "text-cyan-400",
    path: "/products/workflow-bot",
  },
  "alpha-hecta-workforce": {
    label: "Workforce",
    icon: Users,
    color: "text-indigo-400",
    path: "/products/workforce",
  },
};

export default function Login() {
  const { login, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialProduct = params.get("product") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [requiresSelection, setRequiresSelection] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  // Auto-redirect when authentication succeeds
  useEffect(() => {
    // Only redirect if authenticated and NOT currently performing an action
    if (isAuthenticated && !isLoading && !authLoading) {
      const productKey = selectedProduct || "agent-ops";
      const redirectUrl =
        PRODUCT_MAPPING[productKey]?.path || "/products/agent-ops";

      setLocation(redirectUrl);
    }
  }, [isAuthenticated, isLoading, authLoading, selectedProduct, setLocation]);

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setError("");
    try {
      const result = await extendedApi.sso.connectProvider("default", provider);
      if (result?.auth_url) {
        window.location.href = result.auth_url;
      } else if (result?.redirect_url) {
        window.location.href = result.redirect_url;
      } else {
        toast.success(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth initiated`
        );
      }
    } catch (err: any) {
      setError(err.message || `Failed to connect with ${provider}`);
      toast.error(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs before proceeding
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password, selectedProduct);

      if (result.requiresSelection) {
        setAvailableProducts(result.availableProducts || []);
        setRequiresSelection(true);
        return;
      }

      // Authentication state will be updated and useEffect will handle redirect
    } catch (err: any) {
      console.error("[Login] Error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signUp(email, password, name);
      window.location.href = "/products/agent-ops";
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080809] relative overflow-hidden">
      <div className="noise-texture" />
      
      {/* Ambient Glow Orbs */}
      <div className="hero-glow-orb -top-40 -left-40 animate-pulse-slow" />
      <div className="hero-glow-orb -bottom-40 -right-40 opacity-10" />

      <Card className="w-full max-w-md glass-premium rounded-[2.5rem] border-white/5 relative overflow-hidden p-1">
        <div className="absolute inset-0 iridescent-border-elite opacity-20" />
        <div className="bg-[#080809] rounded-[2.4rem] relative z-10">

        <CardHeader className="text-center pt-12 pb-4">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-white/5 rounded-3xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-8 h-8 text-primary-start" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight mb-2">
            AlphaHecta Access
          </CardTitle>
          <div className="text-technical">Secure Protocol Gateway</div>
        </CardHeader>

        <CardContent>
          {!requiresSelection ? (
            <>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
                  <TabsTrigger 
                    value="login" 
                    data-testid="tab-signin"
                    className="rounded-xl data-[state=active]:bg-primary-start data-[state=active]:text-black font-black uppercase tracking-widest text-[10px]"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    data-testid="tab-signup"
                    className="rounded-xl data-[state=active]:bg-primary-start data-[state=active]:text-black font-black uppercase tracking-widest text-[10px]"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    <div className="space-y-4">
                      {selectedProduct && (
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const P =
                                PRODUCT_MAPPING[selectedProduct] ||
                                PRODUCT_MAPPING["agent-ops"];
                              const Icon = P.icon;
                              return (
                                <>
                                  <div className="p-2 bg-white/5 rounded-xl text-primary-start">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">
                                      Targeting
                                    </div>
                                    <div className="text-sm font-black uppercase tracking-tight">
                                      {P.label}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary-start hover:bg-white/5 h-8 px-2 text-[10px] uppercase font-bold"
                            onClick={e => {
                              e.preventDefault();
                              setSelectedProduct("");
                            }}
                          >
                            Change
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-technical mb-2 opacity-100">Identity Identifier</div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="authorized@alpha.ai"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="pl-12 h-14 bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-2xl focus:border-primary-start/50 transition-all"
                            required
                            data-testid="input-email"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-technical opacity-100">Secure Passkey</div>
                          <Link href="/reset-password" title="Forgot password?">
                            <span className="text-[10px] text-primary-start hover:opacity-100 opacity-60 transition-opacity cursor-pointer font-bold uppercase">
                              Recovery
                            </span>
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="pl-12 pr-12 h-14 bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-2xl focus:border-primary-start/50 transition-all"
                            required
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"
                            data-testid="btn-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div
                        data-testid="error-message"
                        className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20"
                      >
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-14 bg-white/5 hover:bg-primary-start hover:text-black font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 rounded-2xl mt-8"
                      disabled={isLoading}
                      data-testid="btn-signin"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          Authorize Session
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500"
                          required
                          data-testid="input-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-email"
                          className="text-slate-300"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500"
                            required
                            data-testid="input-signup-email"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-password"
                          className="text-slate-300"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500"
                            required
                            minLength={8}
                            data-testid="input-signup-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            data-testid="btn-toggle-signup-password"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                      disabled={isLoading}
                      data-testid="btn-signup"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-section-headline text-white">
                  Select Product
                </h3>
                <p className="text-body-sm">
                  Please choose which product you'd like to sign into
                </p>
              </div>

              <div className="grid gap-3">
                {availableProducts.map(productId => {
                  const P = PRODUCT_MAPPING[productId] || {
                    label: productId,
                    icon: Zap,
                    color: "text-slate-400",
                    path: "/products/agent-ops",
                  };
                  const Icon = P.icon;
                  return (
                    <button
                      key={productId}
                      onClick={() => {
                        setSelectedProduct(productId);
                        setRequiresSelection(false);
                      }}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-blue-500/50 transition-all text-left group"
                    >
                      <div
                        className={`p-3 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform ${P.color}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{P.label}</div>
                        <div className="text-caption-premium mt-0.5">
                          Active Subscription
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                className="w-full text-slate-400 hover:text-white"
                onClick={() => setRequiresSelection(false)}
              >
                Back to Login
              </Button>
            </div>
          )}

          <div className="mt-12 pb-12">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#080809] px-4 text-technical opacity-40">External Auth</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-14 bg-white/5 border-white/5 hover:bg-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                data-testid="btn-oauth-google"
                onClick={() => handleOAuthLogin("google")}
                disabled={isLoading}
              >
                Google
              </Button>
              <Button
                variant="outline"
                className="h-14 bg-white/5 border-white/5 hover:bg-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                data-testid="btn-oauth-apple"
                onClick={() => handleOAuthLogin("apple")}
                disabled={isLoading}
              >
                Apple
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
      </Card>
    </div>
  );
}
