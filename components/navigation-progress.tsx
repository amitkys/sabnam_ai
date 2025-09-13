// ProgressBarProvider.tsx
"use client";
import { ProgressProvider } from "@bprogress/next/app";

const ProgressBarProvider = ({ children }: { children: React.ReactNode }) => {
  const progressColor = "var(--primary)";

  return (
    <ProgressProvider
      color={progressColor}
      height="2px"
      options={{
        showSpinner: false,
        trickle: true,
        trickleSpeed: 300,
        minimum: 0.15,
        easing: "ease-out",
        speed: 500,
      }}
      shallowRouting={false}
    >
      {children}
    </ProgressProvider>
  );
};

export default ProgressBarProvider;