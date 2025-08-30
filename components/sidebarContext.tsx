// contexts/SidebarContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  hasSidebar: boolean;
  sidebarWidth: number;
  setSidebarState: (hasSidebar: boolean, width: number) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [hasSidebar, setHasSidebar] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);

  const setSidebarState = (hasSidebar: boolean, width: number) => {
    setHasSidebar(hasSidebar);
    setSidebarWidth(width);
  };

  return (
    <SidebarContext.Provider
      value={{ hasSidebar, sidebarWidth, setSidebarState }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);

  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }

  return context;
}
