import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { landingPageApi } from "@/services/landing/landingPageApi";
import { SectionType, SaveImageParams, UpdateLandingImageParams } from "@/types/landingPage";

export const LANDING_CMS_KEYS = {
  all: ["landing-cms"] as const,
  content: (section: SectionType) => ["landing-cms", "content", section] as const,
  images: (section: SectionType) => ["landing-cms", "images", section] as const,
  allSections: ["landing-cms", "all-sections"] as const,
  allImages: ["landing-cms", "all-images"] as const,
};

export const useAllLandingSections = () => {
  return useQuery({
    queryKey: LANDING_CMS_KEYS.allSections,
    queryFn: () => landingPageApi.fetchAllSections(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAllLandingImages = () => {
  return useQuery({
    queryKey: LANDING_CMS_KEYS.allImages,
    queryFn: () => landingPageApi.fetchAllImagesGrouped(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useLandingContent = (sectionType: SectionType) => {
  return useQuery({
    queryKey: LANDING_CMS_KEYS.content(sectionType),
    queryFn: () => landingPageApi.fetchSection(sectionType),
    staleTime: 1000 * 60 * 5,
  });
};

export const useLandingImages = (sectionType: SectionType) => {
  return useQuery({
    queryKey: LANDING_CMS_KEYS.images(sectionType),
    queryFn: () => landingPageApi.fetchImages(sectionType),
    staleTime: 1000 * 60 * 5,
  });
};

interface SaveContentParams {
  sectionType: SectionType;
  content: unknown;
  employeeId: string;
}

export const useSaveLandingContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionType, content, employeeId }: SaveContentParams) =>
      landingPageApi.updateSection(sectionType, content, employeeId),
    onSuccess: (_, { sectionType }) => {
      queryClient.invalidateQueries({ queryKey: LANDING_CMS_KEYS.content(sectionType) });
      queryClient.invalidateQueries({ queryKey: LANDING_CMS_KEYS.allSections });
    },
  });
};

interface UploadImageParams {
  file: File;
  sectionType: SectionType;
  sectionId: string;
  slot?: string;
  displayOrder?: number;
  altText?: string;
  category?: string | null;
}

export const useUploadLandingImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      sectionType,
      sectionId,
      slot,
      displayOrder,
      altText,
      category,
    }: UploadImageParams) => {
      const { url, path } = await landingPageApi.uploadImage(file, sectionType);
      const imageParams: SaveImageParams = {
        section_id: sectionId,
        storage_path: path,
        public_url: url,
        slot: slot ?? `${sectionType}_bg`,
        display_order: displayOrder ?? 0,
        alt_text: altText,
        category: category ?? undefined,
      };
      return landingPageApi.saveImage(imageParams);
    },
    onSuccess: (data) => {
      const section = data.section_id;
      queryClient.invalidateQueries({ queryKey: ["landing-cms", "images"] });
      queryClient.invalidateQueries({ queryKey: LANDING_CMS_KEYS.allImages });
      void section;
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-cms", "images"] });
      queryClient.invalidateQueries({ queryKey: LANDING_CMS_KEYS.allImages });
    },
  });
};

interface DeleteImageParams {
  id: string;
  storagePath: string;
  sectionType: SectionType;
}

export const useDeleteLandingImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storagePath }: DeleteImageParams) => {
      await landingPageApi.deleteImage(storagePath);
      await landingPageApi.deleteImageRecord(id);
    },
    onSuccess: (_, { sectionType }) => {
      queryClient.invalidateQueries({ queryKey: LANDING_CMS_KEYS.images(sectionType) });
      queryClient.invalidateQueries({ queryKey: LANDING_CMS_KEYS.allImages });
    },
  });
};

export const useUpdateLandingImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateLandingImageParams) => landingPageApi.updateImage(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-cms", "images"] });
      queryClient.invalidateQueries({ queryKey: LANDING_CMS_KEYS.allImages });
    },
  });
};
