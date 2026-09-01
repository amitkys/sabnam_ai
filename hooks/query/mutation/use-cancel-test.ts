import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pauseAttempt } from "@/lib/action/attempt-actions";
import { toast } from "@/components/ui/toast";

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
      toast.add({
        type: "info",
        title: "Test Paused",
        description:
          "Your answers are saved. You can resume this test anytime.",
      });
      queryClient.invalidateQueries({ queryKey: ["attempt-test", attemptId] });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        title: "Failed to Pause",
        description: err?.message || "Could not pause test session.",
      });
    },
  });
}
