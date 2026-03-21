"use client";
import { Button } from "@/components/ui/button";
import { startTest } from "@/lib/action/startTest";
import { useRouter } from "next/navigation";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { createToast } from "vercel-toast";

export function StartTest({ testId }: { testId: string }) {
  const router = useRouter();

  const handleTestStart = async () => {
    const response = await startTest({ testId });
    if (!response.success) {
      createToast(response.error || "Failed to start test", { type: "error", timeout: 5000 });
      return;
    }
    if (response.data) {
      useNewTestAttemptStore.getState().reset();
      router.push(`/attempt/${response.data}`);
    }
  }
  return (
    <Button onClick={handleTestStart} size="lg" className="w-full md:w-auto text-lg px-8 shadow-md hover:shadow-lg transition-all">
      Start Test
    </Button>
  )
}
