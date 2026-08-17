import { useMutation } from "@tanstack/react-query";
import { createToast } from "vercel-toast";

import { saveStudentResponse } from "@/lib/action/attempt-actions";

type SaveStudentResponseInput = {
  attemptId: string;
  questionId: string;
  userAnswer: string;
};

export function useSaveStudentResponse({
  onSynced,
}: {
  onSynced?: (questionId: string) => void;
} = {}) {
  return useMutation({
    mutationFn: async (input: SaveStudentResponseInput) => {
      const res = await saveStudentResponse(input);

      if (!res.success) {
        throw new Error(res.error || "Failed to save response");
      }

      return input.questionId;
    },
    onSuccess: (questionId) => {
      onSynced?.(questionId);
    },
    onError: (error) => {
      createToast(error.message || "Failed to save response", {
        type: "error",
        timeout: 5000,
      });
    },
  });
}
