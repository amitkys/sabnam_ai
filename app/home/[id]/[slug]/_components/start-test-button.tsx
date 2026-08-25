"use client";

import { Button } from "@/components/ui/button";
import { useStartTest } from "@/hooks/query/mutation/use-start-test";
import { usePathname, useSearchParams } from "next/navigation";

export function StartTestButton({ testId }: { testId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const nextPath = `${pathname}${query ? `?${query}` : ""}`;

  const { mutateAsync: startTest, isPending } = useStartTest({
    testId,
    onUnauthorized: () => {
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
