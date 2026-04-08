/**
 * Code Splitting Configuration - Optimize React bundle size
 * Dynamically load heavy components to improve initial load performance
 */

import { lazy } from "react";

// Heavy dashboard components - load on demand
export const AlphaAgentOpsDashboard = lazy(() =>
  import("../pages/AlphaAgentOps").then(module => ({ default: module.default }))
);

export const AlphaWorkforceDashboard = lazy(() =>
  import("../pages/AlphaWorkforce").then(module => ({
    default: module.default,
  }))
);

export const AlphaAIActComplianceDashboard = lazy(() =>
  import("../pages/AlphaAIActCompliance").then(module => ({
    default: module.default,
  }))
);

export const AlphaDeepfakeDefenseDashboard = lazy(() =>
  import("../pages/AlphaDeepfakeDefense").then(module => ({
    default: module.default,
  }))
);

// ML/AI heavy components - load with ML libraries
export const MLModelRegistry = lazy(() =>
  import("../components/ml/ModelRegistry").then(module => ({
    default: module.default,
  }))
);

export const DeepfakeAnalysisTool = lazy(() =>
  import("../components/deepfake/AnalysisTool").then(module => ({
    default: module.default,
  }))
);

// Chart and visualization components - load with charting libraries
export const AdvancedAnalytics = lazy(() =>
  import("../components/analytics/AdvancedAnalytics").then(module => ({
    default: module.default,
  }))
);

export const ComplianceReporting = lazy(() =>
  import("../components/compliance/ComplianceReporting").then(module => ({
    default: module.default,
  }))
);

// Administrative components - load on admin access
export const SystemAdministration = lazy(() =>
  import("../pages/admin/SystemAdministration").then(module => ({
    default: module.default,
  }))
);

export const UserManagement = lazy(() =>
  import("../pages/admin/UserManagement").then(module => ({
    default: module.default,
  }))
);

// Utility function for lazy loading with error boundaries
export const loadComponent = (importFunc: () => Promise<any>) => {
  return lazy(() =>
    importFunc().catch(error => {
      console.error("Failed to load component:", error);
      // Return a fallback component
      return import("../components/common/ErrorFallback").then(module => ({
        default: module.ErrorFallback,
      }));
    })
  );
};

// Preload critical components for better UX
export const preloadCriticalComponents = () => {
  // Preload commonly used components
  import("../components/UserMenu");
  import("../components/common/LoadingSpinner");
  import("../contexts/AuthContext");
};

// Bundle analysis helpers
export const getBundleSize = () => {
  // Development helper to track bundle sizes
  if (process.env.NODE_ENV === "development") {
    console.log("Bundle analysis enabled");
    // Could integrate with webpack-bundle-analyzer here
  }
};
