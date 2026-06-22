/**
 * DeepfakeDefenseContext - Provides all state and handlers to child section components.
 * Eliminates prop-drilling across 30+ tab components.
 */

import * as React from "react";
import { createContext, useContext } from "react";
import type { DeepfakeDefenseState } from "./hooks/useDeepfakeDefense";

const DeepfakeDefenseContext = createContext<DeepfakeDefenseState | null>(null);

export function DeepfakeDefenseProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: DeepfakeDefenseState;
}) {
  return (
    <DeepfakeDefenseContext.Provider value={value}>
      {children}
    </DeepfakeDefenseContext.Provider>
  );
}

export function useDeepfakeDefenseContext(): DeepfakeDefenseState {
  const ctx = useContext(DeepfakeDefenseContext);
  if (!ctx) {
    throw new Error(
      "useDeepfakeDefenseContext must be used within a DeepfakeDefenseProvider"
    );
  }
  return ctx;
}
