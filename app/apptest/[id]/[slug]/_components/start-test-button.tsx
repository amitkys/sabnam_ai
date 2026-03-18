"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startTest } from "@/lib/action/startTest";

export function StartTestButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  console.log("testId", testId);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const attemptId = await startTest({ testId });
      if (attemptId) {
        // Direct to the attempt route, which will show the pre-flight info screen
        router.push(`/attempt/${attemptId}`);
      }
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Button
      className="w-full"
      onClick={handleStart}
      disabled={isStarting}
    >
      {isStarting ? "Preparing..." : "View Details & Start →"}
    </Button>
  );
}
