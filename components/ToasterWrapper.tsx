"use client"; // Force client-side rendering

import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { inter } from "@/config/fonts";

export default function ToasterWrapper() {
  const { theme } = useTheme();

  return (
    <Toaster
      richColors
      theme={theme === "light" ? "light" : "dark"} // Dynamically set theme
      toastOptions={{
        className: inter.className,
      }}
    />
  );
}
