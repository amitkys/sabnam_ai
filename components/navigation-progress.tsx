"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ProgressBarProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use primary color from theme
  const progressColor =
    theme === "dark" ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))";

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ProgressProvider
      shallowRouting
      color={progressColor}
      height="2px"
      options={{
        showSpinner: false,
        trickle: true,
        trickleSpeed: 200, // Faster trickle for smoother progress
        minimum: 0.08, // Lower to ensure visibility for fast navigations
        easing: "cubic-bezier(0.4, 0, 0.2, 1)", // Smoother easing curve
        speed: 600, // Slower animation for fluid transitions
      }}
    >
      {children}
    </ProgressProvider>
  );
};

export default ProgressBarProvider;
