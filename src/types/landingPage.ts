export type SectionType = "hero" | "about" | "services" | "gallery" | "tourism" | "contact";

export interface LandingPageSection {
  id: string;
  section_type: SectionType;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LandingPageContent {
  id: string;
  section_id: string;
  content_json: Record<string, unknown>;
  last_edited_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LandingPageImage {
  id: string;
  section_id: string;
  storage_path: string;
  public_url: string;
  alt_text?: string;
  title?: string;
  description?: string;
  category?: string;
  badge?: string;
  featured: boolean;
  slot?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SectionContent {
  section: LandingPageSection;
  content:
    | HeroContent
    | AboutContent
    | ServicesContent
    | GalleryContent
    | TourismContent
    | ContactContent;
  lastEditedBy?: string;
  updatedAt: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
}

export interface AboutContent {
  label: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  features: AboutFeature[];
  gallery_items: AboutGalleryItem[];
}

export interface AboutFeature {
  id: string;
  icon: string;
  label: string;
}

export interface AboutGalleryItem {
  id: string;
  slot: string;
  title: string;
  description: string;
}

export interface ServicesContent {
  title: string;
  description: string;
  featured_image_slot: string;
  featured_alt: string;
  items: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
}

export interface GalleryContent {
  title: string;
  description: string;
  featured_slots: string[];
}

export interface TourismContent {
  title: string;
  subtitle: string;
  attractions: AttractionItem[];
}

export interface AttractionItem {
  id: string;
  slot: string;
  name: string;
  description: string;
  category: string;
  cta_link?: string;
}

export interface ContactContent {
  title: string;
  description: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  hours: string;
  whatsapp: string;
  map_lat: number;
  map_lng: number;
}

export interface UpdateSectionParams {
  sectionType: SectionType;
  content: unknown;
  employeeId: string;
}

export interface UploadImageParams {
  file: File;
  sectionType: SectionType;
}

export interface UploadImageResult {
  url: string;
  path: string;
}

export interface SaveImageParams {
  section_id: string;
  storage_path: string;
  public_url: string;
  alt_text?: string;
  title?: string;
  description?: string;
  category?: string;
  badge?: string;
  featured?: boolean;
  slot?: string;
  display_order?: number;
}

export interface UpdateLandingImageParams {
  id: string;
  alt_text?: string | null;
  category?: string | null;
}

export interface LandingImageCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
