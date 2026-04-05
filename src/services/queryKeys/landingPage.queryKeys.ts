/**
 * Landing Page Query Keys
 *
 * Centralized query key definitions for TanStack Query.
 * Follows the pattern: [feature, entity, ...identifiers]
 */

export const LANDING_PAGE_KEYS = {
  // Base key
  all: ["landing-page"] as const,

  // All sections
  sections: () => [...LANDING_PAGE_KEYS.all, "sections"] as const,

  // Single section
  section: (sectionType: string) => [...LANDING_PAGE_KEYS.all, "section", sectionType] as const,

  // Images
  images: () => [...LANDING_PAGE_KEYS.all, "images"] as const,
  imagesForSection: (sectionType: string) => [...LANDING_PAGE_KEYS.images(), sectionType] as const,
};
