import { useMutation } from "@tanstack/react-query";
import { startTest } from "@/lib/action/mutation/startTest";
import { ErrorTypes } from "@/lib/error-type";
import { createToast } from "vercel-toast";

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
          if (onUnauthorized) {
            onUnauthorized();
          } else {
            createToast("Unauthorized User", { type: "error", timeout: 5000 });
          }
          return;
        }
        createToast(res.error || "Failed to start test", { type: "error", timeout: 5000 });
        return;
      }

      window.open(`/attempt/${res.data}`);
    },
  });
}
