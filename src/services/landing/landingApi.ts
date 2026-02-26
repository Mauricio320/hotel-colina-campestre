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

  fetchState: async (): Promise<LandingPageState | null> => {
    const { data, error } = await supabase
      .from("landing_page_state")
      .select("*")
      .eq("landing_page_id", "default")
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  saveLandingPageState: async (
    nodesJson: Record<string, unknown>,
    htmlContent: string,
    globalStyles: GlobalStyles,
    employeeId: string
  ): Promise<LandingPageState> => {
    // Update the landing_pages table to track who last edited
    const { error: updateError } = await supabase
      .from("landing_pages")
      .update({ last_edited_by: employeeId, updated_at: new Date().toISOString() })
      .eq("id", "default");

    if (updateError) throw updateError;

    // Upsert: create if not exists, update if exists
    const { data, error } = await supabase
      .from("landing_page_state")
      .upsert(
        {
          landing_page_id: "default",
          nodes_json: nodesJson,
          global_styles: globalStyles,
          html_content: htmlContent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "landing_page_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
