"use client"; // Force client-side rendering

import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { geist } from "@/config/fonts";

export default function ToasterWrapper() {
  const { theme } = useTheme();

  return (
    <Toaster
      richColors
      theme={theme === "light" ? "dark" : "light"} // Dynamically set theme
      toastOptions={{
        className: geist.className,
      }}
    />
  );
}
