import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelAttempt } from "@/lib/action/attempt-actions";
import { createToast } from "vercel-toast";

export function useCancelTest({ attemptId }: { attemptId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await cancelAttempt({ attemptId });
    },
    onSuccess: (res) => {
      if (!res.success) {
        createToast(res.error || "Failed to cancel test", { type: "error", timeout: 5000 });
      } else {
        // We can invalidate attempt queries if needed
        queryClient.invalidateQueries({ queryKey: ["attempt-test", attemptId] });
      }
    },
    onError: (error) => {
      createToast(error.message || "An error occurred while canceling", { type: "error", timeout: 5000 });
    }
  });
}
