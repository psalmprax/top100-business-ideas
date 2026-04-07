import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
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
  "alpha-workforce": {
    label: "Workforce",
    icon: Users,
    color: "text-indigo-400",
    path: "/products/workforce",
  },
};

export default function Login() {
  const { login, signUp } = useAuth();
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
    console.log("[Login] handleLogin called, email:", email);
    setIsLoading(true);
    setError("");

    try {
      console.log("[Login] Calling login function...");
      const result = await login(email, password, selectedProduct);
      console.log("[Login] Got result:", result);

      if (result.requiresSelection) {
        setAvailableProducts(result.availableProducts || []);
        setRequiresSelection(true);
        return;
      }

      // Redirect to selected product or default
      const productKey = selectedProduct || "agent-ops";
      const redirectUrl =
        PRODUCT_MAPPING[productKey]?.path || "/products/agent-ops";
      console.log("[Login] Redirecting to:", redirectUrl);
      window.location.href = redirectUrl;
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />

      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x" />

        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
              <Rocket className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-display-hero text-white mb-2">
            AlphaAI Access
          </CardTitle>
          <CardDescription className="text-feature text-slate-400">
            Secure product-aware gateway
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!requiresSelection ? (
            <>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="tab-signin">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-4">
                      {selectedProduct && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const P =
                                PRODUCT_MAPPING[selectedProduct] ||
                                PRODUCT_MAPPING["agent-ops"];
                              const Icon = P.icon;
                              return (
                                <>
                                  <div
                                    className={`p-2 bg-slate-800 rounded-lg ${P.color}`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-caption-premium">
                                      Signing into
                                    </div>
                                    <div className="text-body-sm font-bold">
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
                            className="text-blue-400 hover:text-blue-300 h-8 px-2"
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
                        <Label htmlFor="email" className="text-slate-300">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500"
                            required
                            data-testid="input-email"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-slate-300">
                            Password
                          </Label>
                          <Link href="/reset-password" title="Forgot password?">
                            <span className="text-body-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                              Forgot password?
                            </span>
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500"
                            required
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
                      <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                      disabled={isLoading}
                      data-testid="btn-signin"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In to Product
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                data-testid="btn-oauth-google"
                onClick={() => handleOAuthLogin("google")}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                data-testid="btn-oauth-apple"
                onClick={() => handleOAuthLogin("apple")}
                disabled={isLoading}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Apple
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
