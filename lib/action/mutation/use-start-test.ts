import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startTest } from "@/lib/action/startTest";
import { ErrorTypes } from "@/lib/error-type";
import { createToast } from "vercel-toast";

export function useStartTest({ testId }: { testId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await startTest({ testId });
    },
    onSuccess: (res) => {
      if (!res.success) {
        if (res.errorCode === ErrorTypes.UNAUTHORIZED) {
          createToast("Unauthorized User", { type: "error", timeout: 500 });
        }
      }
      if (res.success) {
        window.open(`/attempt/${res.data}`)
      }
    },
  });
}