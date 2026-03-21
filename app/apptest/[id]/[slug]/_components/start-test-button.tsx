"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startTest } from "@/lib/action/startTest";
import { createToast } from "vercel-toast";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useStartTest } from "@/hooks/query/mutation/use-start-test";

export function StartTestButton({ testId }: { testId: string }) {

  const { mutateAsync: startTest, isPending } = useStartTest({ testId });

  const handleStart = async () => {
    try {
      await startTest();
    } catch (error) {
      // Handle error appropriately (e.g., show toast notification)
      console.error("Failed to start test:", error);
    }
  };

  return (
    <Button
      className="w-full"
      onClick={handleStart}
      disabled={isPending}
      isLoading={isPending}
    >
      Start Test
    </Button>
  );
}
