import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useFullscreen } from "@/hooks/use-fullscreen";
import { submitAttempt } from "@/lib/action/attempt-actions";
import {
  clearAttemptLocalStorage,
  useNewTestAttemptStore,
} from "@/lib/store/new-attempt-store";
import { toast } from "@/components/ui/toast";

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
      if (beforeSubmit) {
        await beforeSubmit();
      }

      // Collect only pending unsynced responses to keep submission instant
      const { answers, pendingSync, questionTimes } =
        useNewTestAttemptStore.getState();
      const pendingResponses: Array<{
        questionId: string;
        userAnswer: string;
        timeTaken?: number;
      }> = [];

      for (const questionId of pendingSync) {
        const userAnswer = answers.get(questionId);

        if (userAnswer && userAnswer.trim().length > 0) {
          const timeTaken = questionTimes.get(questionId) || 0;

          pendingResponses.push({ questionId, userAnswer, timeTaken });
        }
      }

      const res = await submitAttempt({
        attemptId,
        responses: pendingResponses.length > 0 ? pendingResponses : undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit test");
      }

      return res;
    },
    onSuccess: () => {
      // 1. Wipe all local attempt storage to prevent cross-test interference
      clearAttemptLocalStorage(attemptId);

      toast.add({
        type: "success",
        title: "Test Submitted Successfully",
        description:
          "Redirecting to your performance evaluation and answer solutions...",
      });
      onSubmitted?.();
      if (isFullscreen) {
        exitFullscreen();
      }
      queryClient.invalidateQueries({ queryKey: ["attempt-test", attemptId] });
      queryClient.invalidateQueries({ queryKey: ["result", attemptId] });
      window.location.href = `/result/${attemptId}`;
    },
    onError: (error: any) => {
      toast.add({
        type: "error",
        title: "Submission Failed",
        description:
          error?.message ||
          "Failed to submit test. Your answers are saved locally, please retry.",
      });
    },
  });
}
