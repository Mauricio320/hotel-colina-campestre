import { supabase } from "@/config/supabase";

export const geographyApi = {
  /**
   * Fetch Colombia geographical data
   */
  fetchColombiaData: async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json"
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error cargando geografía de Colombia: ${error}`);
    }
  },
};

export default geographyApi;