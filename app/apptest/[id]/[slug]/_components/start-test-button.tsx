"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startTest } from "@/lib/action/startTest";
import { createToast } from "vercel-toast";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useStartTest } from "@/lib/action/mutation/use-start-test";

export function StartTestButton({ testId }: { testId: string }) {

  const { mutateAsync: startTest, isPending } = useStartTest({ testId });

  const handleStart = async () => {
    await startTest();
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
