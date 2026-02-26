import { useQuery } from "@tanstack/react-query";
import { staysApi } from "@/services/stays/staysApi";
import { Stay } from "@/types";

export const useStaysQuery = () => {
  const staysQuery = useQuery({
    queryKey: ["stays"],
    queryFn: ({ signal }) => staysApi.fetchStays(signal),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    staysQuery,
  };
};

export const useStayById = (stayId: string | undefined) => {
  return useQuery<Stay | null>({
    queryKey: ["stay", stayId],
    queryFn: () => staysApi.fetchStayWithDetails(stayId!) as Promise<Stay | null>,
    enabled: !!stayId,
    staleTime: 0,
  });
};
