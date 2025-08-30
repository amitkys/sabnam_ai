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
    ? "hsl(var(--primary) / 0.7)"
    : "hsl(var(--primary) / 0.7)";

  return (
    <ProgressProvider
      color={progressColor}
      height="3.5px"
      options={{
        showSpinner: false,
        trickle: true,
        trickleSpeed: 500,
        minimum: 0.4,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        speed: 600,
      }}
      shallowRouting={false} // Disable shallow routing for progress bar
    >
      {children}
    </ProgressProvider>
  );
};

export default ProgressBarProvider;
