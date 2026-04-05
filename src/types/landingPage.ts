/**
 * Landing Page Types
 *
 * TypeScript interfaces and types for the landing page feature.
 * These types support the 5-section editable landing page.
 */

// ============================================================================
// Enums
// ============================================================================

export type SectionType = "hotel" | "comfaboy" | "turismo" | "fotos" | "contacto";

// ============================================================================
// Database Models
// ============================================================================

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

// Combined type with content parsed
export interface SectionContent {
  section: LandingPageSection;
  content: HotelContent | ComfaboyContent | TurismoContent | FotosContent | ContactoContent;
  lastEditedBy?: string;
  updatedAt: string;
}

// ============================================================================
// Section Content Types
// ============================================================================

// Hotel Section
export interface HotelContent {
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    background_images?: string[];
    cta_text: string;
    cta_link: string;
  };
  about: {
    label: string;
    title: string;
    description_1: string;
    description_2?: string;
    image_1: string;
    image_2?: string;
    cta_text?: string;
    cta_link?: string;
  };
  services: {
    title: string;
    items: ServiceItem[];
  };
}

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
}

// Comfaboy Section
export interface ComfaboyContent {
  hero: {
    title: string;
    background_image: string;
  };
  description: string;
  benefits: BenefitItem[];
}

export interface BenefitItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// Turismo Section
export interface TurismoContent {
  title: string;
  subtitle: string;
  attractions: AttractionItem[];
}

export interface AttractionItem {
  id: string;
  name: string;
  description: string;
  image: string;
  distance_km: number;
}

// Fotos Section
export interface FotosContent {
  title: string;
  photos: PhotoItem[];
}

export interface PhotoItem {
  id: string;
  image_url: string;
  caption?: string;
  alt: string;
}

// Contacto Section
export interface ContactoContent {
  title: string;
  description: string;
  map_embed_url: string;
  contact_info: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
  form_enabled: boolean;
}

// ============================================================================
// API Types
// ============================================================================

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

// ============================================================================
// Form Types
// ============================================================================

export type HotelFormData = HotelContent;
export type ComfaboyFormData = ComfaboyContent;
export type TurismoFormData = TurismoContent;
export type FotosFormData = FotosContent;
export type ContactoFormData = ContactoContent;

// ============================================================================
// Component Prop Types
// ============================================================================

export interface SectionComponentProps<T> {
  content: T;
  isLoading?: boolean;
}

export interface EditorComponentProps<T> {
  sectionType: SectionType;
  initialData?: T;
  onSave: (data: T) => void;
  isSaving?: boolean;
}
