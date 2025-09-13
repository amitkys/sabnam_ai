// components/admin-panel/admin-panel-layout.tsx
"use client";

import { useEffect, useState } from "react";

import { Footer } from "@/components/admin-panel/footer";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { useSidebarContext } from "@/components/sidebarContext";
import { cn } from "@/lib/utils";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebar, (x) => x);
  const { setSidebarState } = useSidebarContext();
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Track screen size - only apply sidebar offset on lg screens and above
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (sidebar) {
      const { getOpenState, settings } = sidebar;

      // Only apply sidebar offset on large screens when sidebar is not disabled
      if (isLargeScreen && !settings.disabled) {
        const isOpen = getOpenState();
        const width = isOpen ? 288 : 90; // 72 * 4 = 288px (lg:ml-72), 90px for collapsed

        setSidebarState(true, width);
      } else {
        // Small screens or disabled sidebar - no offset needed
        setSidebarState(false, 0);
      }
    }

    // Cleanup when component unmounts
    return () => setSidebarState(false, 0);
  }, [sidebar?.getOpenState(), setSidebarState, isLargeScreen]);

  if (!sidebar) return null;
  const { getOpenState, settings } = sidebar;

  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh-56px)] transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72"),
        )}
      >
        {children}
      </main>
      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72"),
        )}
      >
        <Footer />
      </footer>
    </>
  );
}
