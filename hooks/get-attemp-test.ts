import { getAttemptAction } from "@/lib/action/get-attempt-action"
import { useQuery } from "@tanstack/react-query"


export const useAttemptTest =  ({ attemptId }: {attemptId: string}) => {
  return useQuery({
    queryKey: ["attempt-test", attemptId],
    queryFn: async () => {
      const res = await getAttemptAction({ attemptId });
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    retry: false,
  });
}
