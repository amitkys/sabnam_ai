import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAttempt } from "@/lib/action/attempt-actions";
import { createToast } from "vercel-toast";

export function useSubmitTest({ attemptId }: { attemptId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await submitAttempt(attemptId);
    },
    onSuccess: (res) => {
      if (!res.success) {
        createToast("Failed to submit test", { type: "error", timeout: 5000 });
      }
      if (res.success) {
        createToast("Test submitted successfully", { type: "success", timeout: 3000 });
        // After successful submit, we might want to invalidate queries or navigate
        // However, the caller component handles navigation, we just return the result.
      }
    },
    onError: (error) => {
      createToast(error.message || "An error occurred while submitting", { type: "error", timeout: 5000 });
    }
  });
}
