import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../lib/storage";

export type LayoutPerspective = "alpha" | "sigma" | "omega";

interface PerspectiveContextType {
  perspective: LayoutPerspective;
  setPerspective: (perspective: LayoutPerspective) => void;
}

const PerspectiveContext = createContext<PerspectiveContextType | undefined>(
  undefined
);

export function PerspectiveProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [perspective, setPerspective] = useState<LayoutPerspective>(() => {
    return storage.get<LayoutPerspective>("app_perspective", "alpha");
  });

  useEffect(() => {
    // Apply perspective class to document root for global CSS styling
    const root = document.documentElement;
    root.classList.remove(
      "perspective-alpha",
      "perspective-sigma",
      "perspective-omega"
    );
    root.classList.add(`perspective-${perspective}`);

    // Persist selection
    storage.set("app_perspective", perspective);
  }, [perspective]);

  return (
    <PerspectiveContext.Provider value={{ perspective, setPerspective }}>
      {children}
    </PerspectiveContext.Provider>
  );
}

export function usePerspective() {
  const context = useContext(PerspectiveContext);
  if (!context) {
    throw new Error("usePerspective must be used within a PerspectiveProvider");
  }
  return context;
}
