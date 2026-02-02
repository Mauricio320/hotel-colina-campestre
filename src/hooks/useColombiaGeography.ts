import { useQuery } from "@tanstack/react-query";
import geographyApi from "@/services/geography/geographyApi";

export const useColombiaGeography = () => {
  const colombiaQuery = useQuery({
    queryKey: ["colombia-geography"],
    queryFn: async () => {
      return await geographyApi.fetchColombiaData();
    },
    retry: 1,
  });

  return {
    colombiaData: colombiaQuery.data,
    loadingGeo: colombiaQuery.isLoading,
    error: colombiaQuery.error,
  };
};