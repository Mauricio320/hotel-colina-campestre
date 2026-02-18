import { useQuery } from "@tanstack/react-query";
import {
  fetchMaintenanceCategories,
  fetchMaintenanceSubcategoriesByCategory,
} from "@/services/maintenance/maintenanceCategoriesApi";

export const useMaintenanceCategories = () => {
  return useQuery({
    queryKey: ["maintenance-categories"],
    queryFn: fetchMaintenanceCategories,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useMaintenanceSubcategories = (categoryId: string | null) => {
  return useQuery({
    queryKey: ["maintenance-subcategories", categoryId],
    queryFn: () => fetchMaintenanceSubcategoriesByCategory(categoryId!),
    enabled: !!categoryId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
