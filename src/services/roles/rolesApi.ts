import { supabase } from "@/config/supabase";

export const rolesApi = {
  getRoles: async () => {
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },
};
