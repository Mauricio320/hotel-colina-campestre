import { supabase } from "@/config/supabase";
import { LandingImageCategory } from "@/types/landingPage";

const TABLE = "landing_page_image_categories";

export const landingImageCategoriesApi = {
  fetchAll: async (): Promise<LandingImageCategory[]> => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to fetch image categories: ${error.message}`);
    return (data as LandingImageCategory[]) ?? [];
  },

  create: async (name: string, displayOrder = 0): Promise<LandingImageCategory> => {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ name, display_order: displayOrder })
      .select()
      .single();

    if (error) throw new Error(`Failed to create category: ${error.message}`);
    return data as LandingImageCategory;
  },

  update: async (
    id: string,
    patch: { name?: string; display_order?: number; is_active?: boolean }
  ): Promise<LandingImageCategory> => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update category: ${error.message}`);
    return data as LandingImageCategory;
  },

  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  },
};
