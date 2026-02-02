import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { Stay } from "@/types";

export const useStaysQuery = () => {
  const staysQuery = useQuery({
    queryKey: ["stays"],
    queryFn: async ({ signal }) => {
      try {
        const { data, error } = await supabase
          .from("stays")
          .select("*, room:rooms(*), guest:guests(*)")
          .abortSignal(signal)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Stay[];
      } catch (e: any) {
        if (e.name === "AbortError" || e.message?.includes("aborted")) {
          console.debug("Stays fetch aborted by system");
          return [];
        }
        throw e;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    staysQuery,
  };
};

export const useStayById = (stayId: string | undefined) => {
  return useQuery({
    queryKey: ["stay", stayId],
    queryFn: async () => {
      if (!stayId) return null;

      const { data, error } = await supabase
        .from("stays")
        .select(
          "*, guest:guests(*), room:rooms(*), accommodation_type:accommodation_types(*)",
        )
        .eq("id", stayId)
        .single();

      if (error) throw error;
      return data as Stay;
    },
    enabled: !!stayId,
    staleTime: 0,
  });
};
