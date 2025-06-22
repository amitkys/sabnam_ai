"use client"; // Force client-side rendering

import { GeistSans } from "geist/font/sans";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export default function ToasterWrapper() {
  const { theme } = useTheme();

  return (
    <Toaster
      richColors
      theme={theme === "light" ? "dark" : "light"} // Dynamically set theme
      toastOptions={{
        className: GeistSans.className,
        style: {
          fontWeight: "700",
        }
      }}
    />
  );
}
