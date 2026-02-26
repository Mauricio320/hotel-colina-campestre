import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { landingApi } from "@/services/landing/landingApi";
import { GlobalStyles } from "@/types";

export const LANDING_PAGE_KEYS = {
  all: ["landing-page"] as const,
  page: () => [...LANDING_PAGE_KEYS.all, "page"] as const,
  state: () => [...LANDING_PAGE_KEYS.all, "state"] as const,
};

export const useLandingPage = () => {
  return useQuery({
    queryKey: LANDING_PAGE_KEYS.page(),
    queryFn: () => landingApi.fetchLandingPage(),
    refetchOnWindowFocus: false,
  });
};

export const useLandingPageState = () => {
  return useQuery({
    queryKey: LANDING_PAGE_KEYS.state(),
    queryFn: () => landingApi.fetchState(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

interface SaveLandingPageParams {
  nodesJson: Record<string, unknown>;
  htmlContent: string;
  globalStyles: GlobalStyles;
  employeeId: string;
}

export const useSaveLandingPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodesJson, htmlContent, globalStyles, employeeId }: SaveLandingPageParams) =>
      landingApi.saveLandingPageState(nodesJson, htmlContent, globalStyles, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LANDING_PAGE_KEYS.state() });
      queryClient.invalidateQueries({ queryKey: LANDING_PAGE_KEYS.page() });
    },
  });
};
