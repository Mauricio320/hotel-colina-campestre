/**
 * Landing Page API Service
 *
 * Service layer for interacting with Supabase for landing page data.
 * Follows the 3-layer architecture: Service -> Hook -> Component
 */

import { supabase } from "@/config/supabase";
import {
  LandingPageSection,
  LandingPageContent,
  SectionContent,
  SectionType,
  HotelContent,
  ComfaboyContent,
  TurismoContent,
  FotosContent,
  ContactoContent,
  UploadImageResult,
} from "@/types/landingPage";

// Default content for each section type
const getDefaultContent = (
  sectionType: SectionType
): HotelContent | ComfaboyContent | TurismoContent | FotosContent | ContactoContent => {
  switch (sectionType) {
    case "hotel":
      return {
        hero: {
          title: "",
          subtitle: "",
          background_image: "",
          cta_text: "Reservar ahora",
          cta_link: "/reservar",
        },
        about: {
          label: "Nuestra Esencia",
          title: "",
          description_1: "",
          description_2: "",
          image_1: "",
        },
        services: { title: "Servicios Exclusivos", items: [] },
      } as HotelContent;
    case "comfaboy":
      return {
        hero: { title: "", background_image: "" },
        description: "",
        benefits: [],
      } as ComfaboyContent;
    case "turismo":
      return {
        title: "",
        subtitle: "",
        attractions: [],
      } as TurismoContent;
    case "fotos":
      return {
        title: "",
        photos: [],
      } as FotosContent;
    case "contacto":
      return {
        title: "",
        description: "",
        map_embed_url: "",
        contact_info: { address: "", phone: "", email: "", hours: "" },
        form_enabled: true,
      } as ContactoContent;
    default:
      return {} as HotelContent;
  }
};

/**
 * Parse content JSON based on section type
 */
const parseContent = (
  sectionType: SectionType,
  contentJson: Record<string, unknown>
): HotelContent | ComfaboyContent | TurismoContent | FotosContent | ContactoContent => {
  if (!contentJson || Object.keys(contentJson).length === 0) {
    return getDefaultContent(sectionType);
  }
  return contentJson as unknown as
    | HotelContent
    | ComfaboyContent
    | TurismoContent
    | FotosContent
    | ContactoContent;
};

export const landingPageApi = {
  /**
   * Fetch all landing page sections with their content
   */
  fetchAllSections: async (): Promise<SectionContent[]> => {
    const { data, error } = await supabase
      .from("landing_page_sections")
      .select(
        `
        *,
        landing_page_content!inner(*)
      `
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching landing page sections:", error);
      throw new Error(`Failed to fetch sections: ${error.message}`);
    }

    if (!data) return [];

    return data.map((item: LandingPageSection & { landing_page_content: LandingPageContent[] }) => {
      const content = item.landing_page_content?.[0];
      const sectionType = item.section_type as SectionType;
      return {
        section: {
          id: item.id,
          section_type: sectionType,
          is_active: item.is_active,
          display_order: item.display_order,
          created_at: item.created_at,
          updated_at: item.updated_at,
        },
        content: content
          ? parseContent(sectionType, content.content_json)
          : getDefaultContent(sectionType),
        lastEditedBy: content?.last_edited_by,
        updatedAt: content?.updated_at || item.updated_at,
      };
    });
  },

  /**
   * Fetch a single section by type
   */
  fetchSection: async (sectionType: SectionType): Promise<SectionContent | null> => {
    const { data, error } = await supabase
      .from("landing_page_sections")
      .select(
        `
        *,
        landing_page_content!inner(*)
      `
      )
      .eq("section_type", sectionType)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error(`Error fetching section ${sectionType}:`, error);
      throw new Error(`Failed to fetch section: ${error.message}`);
    }

    if (!data) return null;

    const content = (data as LandingPageSection & { landing_page_content: LandingPageContent[] })
      .landing_page_content?.[0];

    return {
      section: {
        id: data.id,
        section_type: data.section_type as SectionType,
        is_active: data.is_active,
        display_order: data.display_order,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
      content: content
        ? parseContent(sectionType, content.content_json)
        : getDefaultContent(sectionType),
      lastEditedBy: content?.last_edited_by,
      updatedAt: content?.updated_at || data.updated_at,
    };
  },

  /**
   * Update section content
   */
  updateSection: async (
    sectionType: SectionType,
    content: unknown,
    employeeId: string
  ): Promise<LandingPageContent> => {
    // First, get the section ID
    const { data: sectionData, error: sectionError } = await supabase
      .from("landing_page_sections")
      .select("id")
      .eq("section_type", sectionType)
      .single();

    if (sectionError || !sectionData) {
      throw new Error(`Section ${sectionType} not found`);
    }

    // Upsert the content
    const { data, error } = await supabase
      .from("landing_page_content")
      .upsert(
        {
          section_id: sectionData.id,
          content_json: content as Record<string, unknown>,
          last_edited_by: employeeId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "section_id" }
      )
      .select()
      .single();

    if (error) {
      console.error(`Error updating section ${sectionType}:`, error);
      throw new Error(`Failed to update section: ${error.message}`);
    }

    return data;
  },

  /**
   * Upload image to storage
   */
  uploadImage: async (file: File, sectionType: SectionType): Promise<UploadImageResult> => {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${sectionType}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("landing-page-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("landing-page-images").getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  },

  /**
   * Delete image from storage
   */
  deleteImage: async (path: string): Promise<void> => {
    const { error } = await supabase.storage.from("landing-page-images").remove([path]);

    if (error) {
      console.error("Error deleting image:", error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  },

  /**
   * Get public URL for an image path
   */
  getImageUrl: (path: string): string => {
    const {
      data: { publicUrl },
    } = supabase.storage.from("landing-page-images").getPublicUrl(path);

    return publicUrl;
  },
};
