"use client";

import { GeistSans } from "geist/font/sans";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

import { useSidebarContext } from "@/components/sidebarContext";

export default function ToasterWrapper() {
  const { theme, systemTheme } = useTheme();
  const { hasSidebar, sidebarWidth } = useSidebarContext();

  // Determine the *active* theme
  const activeTheme = theme === "system" ? systemTheme : theme;

  // Determine the *opposite* theme
  const oppositeTheme =
    activeTheme === "dark"
      ? "light"
      : activeTheme === "light"
        ? "dark"
        : "system";

  return (
    <Toaster
      position="top-center"
      theme={oppositeTheme as "light" | "dark" | "system"}
      toastOptions={{
        className: GeistSans.className,
        style: hasSidebar
          ? {
            marginLeft: `${sidebarWidth / 2}px`,
          }
          : {},
      }}
    />
  );
}
