"use client";
import { Button } from "@/components/ui/button";
import { startTest } from "@/lib/action/startTest";
import { useRouter } from "next/navigation";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";

export function StartTest({ testId }: { testId: string }) {
  const router = useRouter();

  const handleTestStart = async () => {
    const attemptId = await startTest({ testId });
    console.log(attemptId)
    if (attemptId) {
      useNewTestAttemptStore.getState().reset();
    }
  }
  return (
    <Button onClick={handleTestStart} size="lg" className="w-full md:w-auto text-lg px-8 shadow-md hover:shadow-lg transition-all">
      Start Test
    </Button>
  )
}