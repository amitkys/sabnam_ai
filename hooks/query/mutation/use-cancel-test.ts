import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pauseAttempt } from "@/lib/action/attempt-actions";

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
  });
}
