import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createToast } from "vercel-toast";
import { useFullscreen } from "@/hooks/use-fullscreen";

import { submitAttempt } from "@/lib/action/attempt-actions";

export function useSubmitTest({
  attemptId,
  onSubmitted,
}: {
  attemptId: string;
  onSubmitted?: () => void;
}) {
  const queryClient = useQueryClient();
  const { exitFullscreen, isFullscreen } = useFullscreen();

  return useMutation({
    mutationFn: async () => {
      const res = await submitAttempt({ attemptId });
      if (!res.success) {
        throw new Error(res.error || "Failed to submit test");
      }
      return res;
    },
    onSuccess: (res) => {
      onSubmitted?.();
      if (isFullscreen) {
        exitFullscreen();
      }
      window.location.href = `/analysis/${attemptId}`;
    },
    onError: (error) => {
      createToast(error.message || "An error occurred while submitting", {
        type: "error",
        timeout: 5000,
      });
    },
  });
}
