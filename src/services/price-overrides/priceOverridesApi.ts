import { supabase } from "@/config/supabase";
import { PriceOverride } from "@/types";

export const priceOverridesApi = {
  createRecord: async (record: PriceOverride): Promise<PriceOverride> => {
    const { data, error } = await supabase
      .from("price_overrides")
      .insert(record)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export const CreatePriceOverrides = async (
  record: PriceOverride,
): Promise<PriceOverride> => {
  return supabase
    .from("price_overrides")
    .insert(record)
    .select()
    .single() as unknown as Promise<PriceOverride>;
};
