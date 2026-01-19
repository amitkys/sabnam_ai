import { getAttemptAction } from "@/lib/action/get-attempt-action";
import { useQuery } from "@tanstack/react-query";

export const useAttemptAction = ({ attemptId }: {attemptId: string}) => {
  return useQuery({
    queryKey: ["test-action", attemptId],
    queryFn: async () => {
      const res = await getAttemptAction(attemptId);
    }
  })
}