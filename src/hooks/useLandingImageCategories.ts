import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { landingImageCategoriesApi } from "@/services/landing/landingImageCategoriesApi";

export const LANDING_IMAGE_CATEGORIES_KEY = ["landing-image-categories"] as const;

export const useLandingImageCategories = () => {
  return useQuery({
    queryKey: LANDING_IMAGE_CATEGORIES_KEY,
    queryFn: () => landingImageCategoriesApi.fetchAll(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateLandingImageCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, displayOrder }: { name: string; displayOrder?: number }) =>
      landingImageCategoriesApi.create(name, displayOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LANDING_IMAGE_CATEGORIES_KEY });
    },
  });
};

interface UpdateCategoryParams {
  id: string;
  patch: { name?: string; display_order?: number; is_active?: boolean };
}

export const useUpdateLandingImageCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: UpdateCategoryParams) =>
      landingImageCategoriesApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LANDING_IMAGE_CATEGORIES_KEY });
    },
  });
};

export const useDeleteLandingImageCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => landingImageCategoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LANDING_IMAGE_CATEGORIES_KEY });
    },
  });
};
