import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pauseAttempt } from "@/lib/action/attempt-actions";
import { createToast } from "vercel-toast";

export function useCancelTest({
  attemptId,
  beforeExit,
}: {
  attemptId: string;
  beforeExit?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await beforeExit?.();

      const res = await pauseAttempt({ attemptId });
      if (!res.success) {
        throw new Error(res.error || "Failed to exit test");
      }

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attempt-test", attemptId] });
    },
    onError: (error) => {
      createToast(error.message || "An error occurred while exiting", { type: "error", timeout: 5000 });
    }
  });
}
