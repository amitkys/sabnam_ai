import { useMutation } from "@tanstack/react-query";

import { startTest } from "@/lib/action/mutation/startTest";
import { ErrorTypes } from "@/lib/error-type";
import { toast } from "@/components/ui/toast";

export function useStartTest({
  testId,
  onUnauthorized,
}: {
  testId: string;
  onUnauthorized?: () => void;
}) {
  return useMutation({
    mutationFn: async () => {
      return await startTest({ testId });
    },
    onSuccess: (res) => {
      if (!res.success) {
        if (res.errorCode === ErrorTypes.UNAUTHORIZED) {
          toast.add({
            type: "warning",
            title: "Sign-in Required",
            description: "Please sign in to start or resume this test.",
          });
          if (onUnauthorized) {
            onUnauthorized();
          }

          return;
        }

        toast.add({
          type: "error",
          title: "Unable to Start Test",
          description: res.error || "Failed to initialize test session.",
        });

        return;
      }

      window.open(`/attempt/${res.data}`);
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        title: "Connection Error",
        description: err?.message || "Failed to contact test server.",
      });
    },
  });
}
