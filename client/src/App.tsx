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


import { useAuth } from "./contexts/AuthContext";
import { Redirect } from "wouter";

function ManagementRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { user, isManagement, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isManagement) {
    return <Redirect to="/login" />;
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

      {/* Product Pages */}
      <Route path={"/products/agent-ops"} component={AlphaAgentOpsPage} />
      <Route path={"/products/ai-compliance"} component={AlphaAIActCompliancePage} />
      <Route path={"/products/deepfake-defense"} component={AlphaDeepfakeDefensePage} />
      <Route path={"/products/denial-defense"} component={DenialDefensePage} />
      <Route path={"/products/actionable-ai"} component={ActionableAIPage} />
      <Route path={"/products/workflow-bot"} component={FreelancerWorkflowBotPage} />
      
      {/* Gated Management Pages */}
      <ManagementRoute path="/products/workforce" component={AlphaWorkforcePage} />

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
