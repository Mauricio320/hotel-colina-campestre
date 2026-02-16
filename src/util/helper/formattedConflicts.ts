import { ConflictingStay } from "@/services/stays/stayMovesApi";
import { Stay } from "@/types";

export const FormattedConflicts = (conflictingStays?: ConflictingStay[]) => {
  return conflictingStays.map(
    (conflict) =>
      ({
        id: conflict.id,
        order_number: conflict.order_number,
        check_in_date: conflict.check_in_date,
        check_out_date: conflict.check_out_date,
        guest: {
          first_name: conflict.guest_name.split(" ")[0] || "",
          last_name: conflict.guest_name.split(" ").slice(1).join(" ") || "",
        },
        room: conflict.room
          ? {
              id: conflict.room.id,
              room_number: conflict.room.room_number,
            }
          : undefined,
      }) as Stay,
  );
};
