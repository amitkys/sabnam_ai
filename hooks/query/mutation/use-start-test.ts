import { useMutation } from "@tanstack/react-query";
import { startTest } from "@/lib/action/mutation/startTest";
import { ErrorTypes } from "@/lib/error-type";

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
          }
          return;
        }
        return;
      }

      window.open(`/attempt/${res.data}`);
    },
  });
}
