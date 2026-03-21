import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAttempt } from "@/lib/action/attempt-actions";
import { createToast } from "vercel-toast";

export function useSubmitTest({ attemptId }: { attemptId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await submitAttempt({ attemptId });
    },
    onSuccess: (res) => {
      if (!res.success) {
        createToast(res.error || "Failed to submit test", { type: "error", timeout: 5000 });
      } else {
        queryClient.invalidateQueries({ queryKey: ["attempt-test", attemptId] });
      }
    },
    onError: (error) => {
      createToast(error.message || "An error occurred while submitting", { type: "error", timeout: 5000 });
    }
  });
}
