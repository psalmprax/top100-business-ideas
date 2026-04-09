/**
 * Code Splitting Configuration - Optimize React bundle size
 * Dynamically load heavy components to improve initial load performance
 */

import { lazy, type ComponentType } from "react";

// Helper to create fallback-wrapped lazy components
const createLazy = (
  importFn: () => Promise<{ default: ComponentType<any> }>
) => {
  return lazy(importFn);
};

// Heavy dashboard components - load on demand
export const AlphaAgentOpsDashboard = createLazy(
  () => import("../pages/AlphaAgentOps")
);

export const AlphaWorkforceDashboard = createLazy(
  () => import("../pages/AlphaWorkforce")
);

// AI Act Compliance - use existing RegionalCompliance as fallback
export const AlphaAIActComplianceDashboard = createLazy(
  () => import("../pages/RegionalCompliance")
);

export const AlphaDeepfakeDefenseDashboard = createLazy(
  () => import("../pages/AlphaDeepfakeDefense")
);

// ML/AI components - use existing components as fallbacks
export const MLModelRegistry = createLazy(
  () => import("../pages/AlphaAgentOps")
);

export const DeepfakeAnalysisTool = createLazy(
  () => import("../pages/AlphaDeepfakeDefense")
);

// Chart components - use existing chart
export const AdvancedAnalytics = createLazy(
  () => import("../pages/AlphaAgentOps")
);

export const ComplianceReporting = createLazy(
  () => import("../pages/AlphaAgentOps")
);

// Administrative components - use Settings as fallback
export const SystemAdministration = createLazy(
  () => import("../pages/Settings")
);

export const UserManagement = createLazy(() => import("../pages/Settings"));

// Utility function for lazy loading with error boundaries
export const loadComponent = (
  importFunc: () => Promise<{ default: ComponentType<any> }>
) => {
  return lazy(() =>
    importFunc().catch(error => {
      console.error("Failed to load component:", error);
      return Promise.resolve({ default: () => null });
    })
  );
};

// Preload critical components for better UX
export const preloadCriticalComponents = () => {
  import("../components/UserMenu");
  import("../components/ErrorBoundary");
  import("../contexts/AuthContext");
};

// Bundle analysis helpers
export const getBundleSize = () => {
  if (process.env.NODE_ENV === "development") {
    console.log("Bundle analysis enabled");
  }
};
