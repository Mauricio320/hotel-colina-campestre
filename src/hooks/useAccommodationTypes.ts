import { accommodationTypesApi } from "@/services/accommodation_types/accommodationTypesApi";
import { useQuery } from "@tanstack/react-query";

export const useAccommodationTypes = () => {
  const fetchAll = useQuery({
    queryKey: ["accommodation_types"],
    queryFn: () => accommodationTypesApi.fetchAll(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    fetchAll,
  };
};
