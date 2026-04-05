import { useQuery } from "@tanstack/react-query";

// Types
interface LandingPageSection {
  id: string;
  name: string;
  content: Record<string, unknown>;
}

// Keys for React Query
const LANDING_SECTION_KEYS = {
  all: ["landing-section"] as const,
  section: (name: string) => [...LANDING_SECTION_KEYS.all, name] as const,
};

// Placeholder hook for landing page sections
export const useLandingPageSection = (sectionName: string) => {
  return useQuery<LandingPageSection | null>({
    queryKey: LANDING_SECTION_KEYS.section(sectionName),
    queryFn: async () => {
      // Placeholder implementation - returns empty section data
      return {
        id: sectionName,
        name: sectionName,
        content: {},
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
