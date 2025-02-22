"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/custom/spinner";

export default function NeonGradientCardDemo() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Prevent rendering any UI until authentication status is determined
  if (
    status === "loading" ||
    status === "unauthenticated" ||
    status === "authenticated"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col space-y-2">
        <Spinner variant="primary" size="xl" />
        <p>Authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
      <NeonGradientCard className="max-w-sm items-center justify-center text-center">
        <span className="pointer-events-none z-10 h-full whitespace-pre-wrap bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-6xl font-bold leading-none tracking-tighter text-transparent drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          Sabnam AI
        </span>
      </NeonGradientCard>
    </div>
  );
}


