import { supabase } from "@/config/supabase";
import { Stay } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface ConflictParams {
  accommodationTypeId?: string;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  active: boolean;
}

export const useStayConflict = ({
  accommodationTypeId,
  checkInDate,
  checkOutDate,
  active = true,
}: ConflictParams) => {
  return useQuery({
    queryKey: [
      "stay-conflicts",
      accommodationTypeId,
      checkInDate,
      checkOutDate,
      active,
    ],
    queryFn: async () => {
      if (!accommodationTypeId || !checkInDate || !checkOutDate || !active) {
        return [];
      }

      const checkInStr = checkInDate.toLocaleDateString("sv-SE");
      const checkOutStr = checkOutDate.toLocaleDateString("sv-SE");

      // 1. Obtener los IDs de las habitaciones que pertenecen a este tipo de alojamiento
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .eq("accommodation_type_id", accommodationTypeId);

      if (roomsError) throw roomsError;

      const roomIds = rooms?.map((r) => r.id) || [];

      // 2. Buscar estancias activas que se solapen y pertenezcan al alojamiento o a sus habitaciones
      // Lógica de solapamiento: (start1 < end2) AND (end1 > start2)
      let query = supabase
        .from("stays")
        .select(
          `
          *,
          guest:guests(*),
          room:rooms(*)
        `,
        )
        .eq("active", true)
        .lt("check_in_date", checkOutStr)
        .gt("check_out_date", checkInStr);

      // Filtro jerárquico: El conflicto puede ser con el alojamiento mismo o con cualquiera de sus habitaciones
      if (roomIds.length > 0) {
        query = query.or(
          `accommodation_type_id.eq.${accommodationTypeId},room_id.in.(${roomIds.join(",")})`,
        );
      } else {
        query = query.eq("accommodation_type_id", accommodationTypeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Stay & { guest: any; room: any })[];
    },
    enabled: !!accommodationTypeId && !!checkInDate && !!checkOutDate && active,
    staleTime: 0, // Queremos datos frescos para validación
  });
};
