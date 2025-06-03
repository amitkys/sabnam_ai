// ProgressBarProvider.tsx - WITH MUTED COLORS
"use client";
import { ProgressProvider } from "@bprogress/next/app";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ProgressBarProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use muted colors for a more subtle appearance
  const progressColor = mounted
    ? theme === "dark"
      ? "hsl(var(--primary-foreground) / 0.7)" // 70% opacity in dark mode
      : "hsl(var(--primary) / 0.7)" // 70% opacity in light mode
    : "rgb(59 130 246 / 0.7)"; // 70% opacity blue fallback

  return (
    <ProgressProvider
      color={progressColor}
      height="2.5px"
      options={{
        showSpinner: false,
        trickle: true,
        trickleSpeed: 150,
        minimum: 0.08,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        speed: 400,
      }}
      shallowRouting={false} // Disable shallow routing for progress bar
    >
      {children}
    </ProgressProvider>
  );
};

export default ProgressBarProvider;
