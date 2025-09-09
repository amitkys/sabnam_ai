// components/ToasterWrapper.tsx
"use client";

import { GeistSans } from "geist/font/sans";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

import { useSidebarContext } from "@/components/sidebarContext"; // Add this

export default function ToasterWrapper() {
  const { theme } = useTheme();
  const { hasSidebar, sidebarWidth } = useSidebarContext(); // Add this

  return (
    <Toaster
      position="top-center"
      theme={theme === "light" ? "dark" : "light"}
      toastOptions={{
        className: GeistSans.className,
        style: hasSidebar
          ? {
            marginLeft: `${sidebarWidth / 2}px`, // Offset by half sidebar width
          }
          : {},
      }}
    />
  );
}
