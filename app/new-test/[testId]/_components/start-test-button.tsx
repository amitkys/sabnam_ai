"use client";
import { Button } from "@/components/ui/button";
import { startTest } from "@/lib/action/startTest";
import { useRouter } from "next/navigation";

export function StartTest({ testId }: { testId: string }) {
  const router = useRouter();
  const handleTestStart = async () => {
    const attemptId = await startTest({ testId });
    if (attemptId) {
      router.push(`/attempt/${attemptId}`);
    }
  }
  return (
    <Button onClick={handleTestStart} size="lg" className="w-full md:w-auto text-lg px-8 shadow-md hover:shadow-lg transition-all">
      Start Test
    </Button>
  )
}