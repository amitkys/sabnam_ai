import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createToast } from "vercel-toast";
import { useFullscreen } from "@/hooks/use-fullscreen";

import { submitAttempt } from "@/lib/action/attempt-actions";

export function useSubmitTest({
  attemptId,
  onSubmitted,
  beforeSubmit,
}: {
  attemptId: string;
  onSubmitted?: () => void;
  beforeSubmit?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { exitFullscreen, isFullscreen } = useFullscreen();

  return useMutation({
    mutationFn: async () => {
      await beforeSubmit?.();

      const res = await submitAttempt({ attemptId });
      if (!res.success) {
        throw new Error(res.error || "Failed to submit test");
      }
      return res;
    },
    onSuccess: () => {
      onSubmitted?.();
      if (isFullscreen) {
        exitFullscreen();
      }
      queryClient.invalidateQueries({ queryKey: ["attempt-test", attemptId] });
      queryClient.invalidateQueries({ queryKey: ["result", attemptId] });
      window.location.href = `/result/${attemptId}`;
    },
    onError: (error) => {
      createToast(error.message || "An error occurred while submitting", {
        type: "error",
        timeout: 5000,
      });
    },
  });
}
