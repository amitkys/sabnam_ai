"use client";

import { Button } from "@/components/ui/button";
import { useStartTest } from "@/hooks/query/mutation/use-start-test";
export function StartTestButton({ testId }: { testId: string }) {
  const { mutateAsync: startTest, isPending } = useStartTest({
    testId,
    onUnauthorized: () => {
      const nextPath = window.location.pathname + window.location.search;
      window.location.href = `/signin?next=${encodeURIComponent(nextPath)}`;
    },
  });

  const handleStart = async () => {
    try {
      await startTest();
    } catch (error) {
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
