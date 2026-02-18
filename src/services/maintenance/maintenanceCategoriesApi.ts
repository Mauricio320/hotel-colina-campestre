import { supabase } from "@/config/supabase";
import { MaintenanceCategory, MaintenanceSubcategory } from "@/types";

export const fetchMaintenanceCategories = async (): Promise<MaintenanceCategory[]> => {
  const { data, error } = await supabase
    .from("maintenance_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
};

export const fetchMaintenanceSubcategoriesByCategory = async (
  categoryId: string,
): Promise<MaintenanceSubcategory[]> => {
  const { data, error } = await supabase
    .from("maintenance_subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
};
