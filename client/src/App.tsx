import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import AlphaAI from "./pages/AlphaAI";
import AlphaAgentOpsPage from "./pages/AlphaAgentOps";
import AlphaAIActCompliancePage from "./pages/AlphaAIActCompliance";
import AlphaDeepfakeDefensePage from "./pages/AlphaDeepfakeDefense";
import AlphaWorkforcePage from "./pages/AlphaWorkforce";
import DenialDefensePage from "./pages/DenialDefense";
import ActionableAIPage from "./pages/ActionableAI";
import FreelancerWorkflowBotPage from "./pages/FreelancerWorkflowBot";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import BillingPage from "./pages/Billing";
import SettingsPage from "./pages/Settings";
import VentureDetailPage from "./pages/VentureUniversalTemplate";
import SkillMarketplacePage from "./pages/SkillMarketplace";


import { useAuth } from "./contexts/AuthContext";
import { Redirect } from "wouter";

function ProtectedRoute({ 
  component: Component, 
  path, 
  productId, 
  requireManagement = false 
}: { 
  component: React.ComponentType, 
  path: string, 
  productId?: string,
  requireManagement?: boolean
}) {
  const { user, isManagement, isLoading, hasProductAccess } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    const loginPath = productId ? `/login?product=${productId}` : "/login";
    return <Redirect to={loginPath} />;
  }

  if (requireManagement && !isManagement) {
    return <Redirect to="/" />;
  }

  if (productId && !hasProductAccess(productId)) {
    return <Redirect to="/" />;
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}


function Router() {
  return (
    <Switch>
      {/* Company Landing Page */}
      <Route path={"/"} component={AlphaAI} />
      <Route path={"/market-intelligence"} component={Home} />
      <Route path={"/marketplace"} component={SkillMarketplacePage} />

      {/* Product Pages */}
      <ProtectedRoute path="/products/agent-ops" component={AlphaAgentOpsPage} productId="agent-ops" />
      <ProtectedRoute path="/products/ai-compliance" component={AlphaAIActCompliancePage} productId="ai-compliance" />
      <ProtectedRoute path="/products/deepfake-defense" component={AlphaDeepfakeDefensePage} productId="deepfake-defense" />
      <ProtectedRoute path="/products/denial-defense" component={DenialDefensePage} productId="denial-defense" />
      <ProtectedRoute path="/products/actionable-ai" component={ActionableAIPage} productId="actionable-ai" />
      <ProtectedRoute path="/products/workflow-bot" component={FreelancerWorkflowBotPage} productId="workflow-bot" />
      
      {/* Gated Management Pages */}
      <ProtectedRoute path="/products/workforce" component={AlphaWorkforcePage} productId="alpha-workforce" requireManagement={true} />

      {/* Auth & User Pages */}
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/signup"} component={LoginPage} />
      <Route path="/billing" component={BillingPage} />
      <Route path={"/settings"} component={SettingsPage} />

      {/* Legacy routes redirect to products */}
      <Route path={"/ventures/alpha-agent-ops"}>
        {() => { window.location.replace("/products/agent-ops"); return null; }}
      </Route>
      <Route path={"/agent-ops"}>
        {() => { window.location.replace("/products/agent-ops"); return null; }}
      </Route>
      <Route path={"/ai-compliance"}>
        {() => { window.location.replace("/products/ai-compliance"); return null; }}
      </Route>
      <Route path={"/deepfake-defense"}>
        {() => { window.location.replace("/products/deepfake-defense"); return null; }}
      </Route>
      <Route path={"/ventures/alpha-ai-act-compliance"}>
        {() => { window.location.replace("/products/ai-compliance"); return null; }}
      </Route>
      <Route path={"/ventures/alpha-deepfake-defense"}>
        {() => { window.location.replace("/products/deepfake-defense"); return null; }}
      </Route>

      <Route path={"/dashboard"}>
        {() => { window.location.replace("/products/agent-ops"); return null; }}
      </Route>
      
      {/* 130+ Dynamic Ventures */}
      <Route path="/ventures/:id" component={VentureDetailPage} />

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      // switchable
      >
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
