"use client";
import { Button } from "@/components/ui/button";
import { startTest } from "@/lib/action/mutation/startTest";
import { ErrorTypes } from "@/lib/error-type";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createToast } from "vercel-toast";

export function StartTest({ testId }: { testId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTestStart = async () => {
    const query = searchParams.toString();
    const nextPath = `${pathname}${query ? `?${query}` : ""}`;
    const response = await startTest({ testId });

    if (!response.success) {
      if (response.errorCode === ErrorTypes.UNAUTHORIZED) {
        router.push(`/signin?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      createToast(response.error || "Failed to start test", { type: "error", timeout: 5000 });
      return;
    }

    if (response.data) {
      useNewTestAttemptStore.getState().reset();
      router.push(`/attempt/${response.data}`);
    }
  };

  return (
    <Button onClick={handleTestStart} size="lg" className="w-full md:w-auto text-lg px-8 shadow-md hover:shadow-lg transition-all">
      Start Test
    </Button>
  )
}
