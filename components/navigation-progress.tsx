// ProgressBarProvider.tsx
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

  const progressColor =
    theme === "dark" ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))";

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ProgressProvider
      color={progressColor}
      height="2px"
      options={{
        showSpinner: false,
        trickle: true,
        trickleSpeed: 150,
        minimum: 0.08,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        speed: 400,
      }}
      shallowRouting={false}
    >
      {children}
    </ProgressProvider>
  );
};

export default ProgressBarProvider;
