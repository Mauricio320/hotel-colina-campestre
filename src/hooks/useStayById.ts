import { useQuery } from "@tanstack/react-query";
import { staysApi } from "@/services/stays/staysApi";
import { Stay } from "@/types";

export const useStayById = (stayId: string | null) => {
  return useQuery<Stay | null>({
    queryKey: ["stay", stayId],
    queryFn: () => staysApi.fetchStayById(stayId!),
    enabled: !!stayId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
};
