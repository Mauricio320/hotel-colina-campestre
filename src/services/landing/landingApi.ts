import { supabase } from "@/config/supabase";
import { GlobalStyles, LandingPage, LandingPageState } from "@/types";

export const landingApi = {
  fetchLandingPage: async (): Promise<LandingPage | null> => {
    const { data, error } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("id", "default")
      .single();

    if (error) throw error;
    return data;
  },

  fetchLatestState: async (): Promise<LandingPageState | null> => {
    const { data, error } = await supabase
      .from("landing_page_state")
      .select("*")
      .eq("landing_page_id", "default")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  saveLandingPageState: async (
    nodesJson: Record<string, unknown>,
    globalStyles: GlobalStyles,
    employeeId: string
  ): Promise<LandingPageState> => {
    const { error: updateError } = await supabase
      .from("landing_pages")
      .update({ last_edited_by: employeeId, updated_at: new Date().toISOString() })
      .eq("id", "default");

    if (updateError) throw updateError;

    const { data, error } = await supabase
      .from("landing_page_state")
      .insert({
        landing_page_id: "default",
        nodes_json: nodesJson,
        global_styles: globalStyles,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
