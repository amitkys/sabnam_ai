import { getPlayground } from "@/lib/action/get/playground";
import { useQuery } from "@tanstack/react-query";


export const usePlayground = () => {
  return useQuery({
    queryKey: ["playground"],
    queryFn: async () => {
      const res = await getPlayground();
      if(!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
   retry: false 
  })
}