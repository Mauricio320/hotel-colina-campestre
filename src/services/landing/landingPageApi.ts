import { supabase } from "@/config/supabase";
import {
  LandingPageSection,
  LandingPageContent,
  SectionContent,
  SectionType,
  HeroContent,
  AboutContent,
  ServicesContent,
  TourismContent,
  ContactContent,
  BalnearioContent,
  UploadImageResult,
  LandingPageImage,
  SaveImageParams,
  UpdateLandingImageParams,
} from "@/types/landingPage";

const getDefaultContent = (
  sectionType: SectionType
):
  | HeroContent
  | AboutContent
  | ServicesContent
  | TourismContent
  | ContactContent
  | BalnearioContent => {
  switch (sectionType) {
    case "hero":
      return {
        title: "",
        subtitle: "",
        cta_text: "Reservar ahora",
        cta_link: "/reservar",
      } as HeroContent;
    case "about":
      return {
        label: "Nuestra Esencia",
        title: "",
        description: "",
        cta_text: "Reservar Apartamento",
        cta_link: "/reservar",
        features: [],
        gallery_items: [],
      } as AboutContent;
    case "services":
      return {
        title: "Nuestros Servicios",
        description: "",
        featured_image_slot: "comfaboy_featured",
        featured_alt: "Convenio Comfaboy",
        items: [],
      } as ServicesContent;
    case "tourism":
      return { title: "", subtitle: "", attractions: [] } as TourismContent;
    case "contact":
      return {
        title: "Contacto",
        description: "",
        address: "",
        phone1: "",
        phone2: "",
        email: "",
        hours: "",
        whatsapp: "",
        map_lat: 0,
        map_lng: 0,
      } as ContactContent;
    case "balneario":
      return {
        title: "Balneario",
        description: "",
        gallery_alt: "Balneario del hotel",
        items: [],
      } as BalnearioContent;
    default:
      return {} as HeroContent;
  }
};

const parseContent = (
  sectionType: SectionType,
  contentJson: Record<string, unknown>
):
  | HeroContent
  | AboutContent
  | ServicesContent
  | TourismContent
  | ContactContent
  | BalnearioContent => {
  if (!contentJson || Object.keys(contentJson).length === 0) {
    return getDefaultContent(sectionType);
  }
  return contentJson as unknown as
    | HeroContent
    | AboutContent
    | ServicesContent
    | TourismContent
    | ContactContent
    | BalnearioContent;
};

export const landingPageApi = {
  fetchAllSections: async (): Promise<SectionContent[]> => {
    const { data, error } = await supabase
      .from("landing_page_sections")
      .select(`*, landing_page_content!inner(*)`)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw new Error(`Failed to fetch sections: ${error.message}`);
    if (!data) return [];

    return data.map(
      (
        item: LandingPageSection & {
          landing_page_content: LandingPageContent | LandingPageContent[] | null;
        }
      ) => {
        const rawContent = item.landing_page_content;
        const content = Array.isArray(rawContent) ? rawContent[0] : rawContent;
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
      }
    );
  },

  fetchSection: async (sectionType: SectionType): Promise<SectionContent | null> => {
    const { data, error } = await supabase
      .from("landing_page_sections")
      .select(`*, landing_page_content(*)`)
      .eq("section_type", sectionType)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch section: ${error.message}`);
    }
    if (!data) return null;

    const rawContent = (
      data as LandingPageSection & {
        landing_page_content: LandingPageContent | LandingPageContent[] | null;
      }
    ).landing_page_content;
    const content = Array.isArray(rawContent) ? rawContent[0] : rawContent;

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

  updateSection: async (
    sectionType: SectionType,
    content: unknown,
    employeeId: string
  ): Promise<LandingPageContent> => {
    const { data: sectionData, error: sectionError } = await supabase
      .from("landing_page_sections")
      .select("id")
      .eq("section_type", sectionType)
      .single();

    if (sectionError || !sectionData) {
      throw new Error(`Section ${sectionType} not found`);
    }

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

    if (error) throw new Error(`Failed to update section: ${error.message}`);
    return data;
  },

  fetchImages: async (sectionType: SectionType): Promise<LandingPageImage[]> => {
    const { data, error } = await supabase
      .from("landing_page_images")
      .select("*, section:landing_page_sections!inner(section_type)")
      .eq("section.section_type", sectionType)
      .order("display_order", { ascending: true });

    if (error) throw new Error(`Failed to fetch images: ${error.message}`);
    return (data as LandingPageImage[]) || [];
  },

  fetchAllImagesGrouped: async (): Promise<Record<SectionType, LandingPageImage[]>> => {
    const { data, error } = await supabase
      .from("landing_page_images")
      .select("*, section:landing_page_sections!inner(section_type)")
      .order("display_order", { ascending: true });

    if (error) throw new Error(`Failed to fetch images: ${error.message}`);

    const grouped: Record<SectionType, LandingPageImage[]> = {
      hero: [],
      about: [],
      services: [],
      tourism: [],
      contact: [],
      balneario: [],
    };

    for (const row of (data ?? []) as (LandingPageImage & {
      section: { section_type: SectionType };
    })[]) {
      const type = row.section.section_type;
      if (grouped[type]) grouped[type].push(row);
    }

    return grouped;
  },

  saveImage: async (params: SaveImageParams): Promise<LandingPageImage> => {
    const { data, error } = await supabase
      .from("landing_page_images")
      .insert({
        section_id: params.section_id,
        storage_path: params.storage_path,
        public_url: params.public_url,
        alt_text: params.alt_text,
        title: params.title,
        description: params.description,
        category: params.category,
        badge: params.badge,
        featured: params.featured ?? false,
        slot: params.slot,
        display_order: params.display_order ?? 0,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save image: ${error.message}`);
    return data as LandingPageImage;
  },

  deleteImageRecord: async (id: string): Promise<void> => {
    const { error } = await supabase.from("landing_page_images").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete image record: ${error.message}`);
  },

  updateImage: async (params: UpdateLandingImageParams): Promise<LandingPageImage> => {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (params.alt_text !== undefined) patch.alt_text = params.alt_text;
    if (params.category !== undefined) patch.category = params.category;

    const { data, error } = await supabase
      .from("landing_page_images")
      .update(patch)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update image: ${error.message}`);
    return data as LandingPageImage;
  },

  uploadImage: async (file: File, sectionType: SectionType): Promise<UploadImageResult> => {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${sectionType}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("landing-page-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from("landing-page-images").getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  },

  deleteImage: async (path: string): Promise<void> => {
    const { error } = await supabase.storage.from("landing-page-images").remove([path]);
    if (error) throw new Error(`Failed to delete image: ${error.message}`);
  },

  getImageUrl: (path: string): string => {
    const {
      data: { publicUrl },
    } = supabase.storage.from("landing-page-images").getPublicUrl(path);
    return publicUrl;
  },
};
