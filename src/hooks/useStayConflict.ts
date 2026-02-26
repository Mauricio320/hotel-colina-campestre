import { Stay } from "@/types";
import { staysApi } from "@/services/stays/staysApi";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

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
    queryKey: ["stay-conflicts", accommodationTypeId, checkInDate, checkOutDate, active],
    queryFn: async () => {
      if (!accommodationTypeId || !checkInDate || !checkOutDate || !active) {
        return [];
      }

      const checkInStr = dayjs(checkInDate).format("YYYY-MM-DD");
      const checkOutStr = dayjs(checkOutDate).format("YYYY-MM-DD");

      return staysApi.fetchConflictingStays({
        accommodationTypeId,
        checkInDate: checkInStr,
        checkOutDate: checkOutStr,
      });
    },
    enabled: !!accommodationTypeId && !!checkInDate && !!checkOutDate && active,
    staleTime: 0,
  });
};
