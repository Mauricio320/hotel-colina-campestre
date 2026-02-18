import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { Stay } from "@/types";

export const useStayById = (stayId: string | null) => {
  return useQuery({
    queryKey: ["stay", stayId],
    queryFn: async () => {
      if (!stayId) return null;

      const { data, error } = await supabase
        .from("stays")
        .select("*, room:rooms(*), guest:guests!stays_guest_id_fkey(*)")
        .eq("id", stayId)
        .single();

      if (error) throw error;
      return data as Stay;
    },
    enabled: !!stayId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
};
