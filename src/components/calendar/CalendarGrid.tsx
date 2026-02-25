import { CalendarMobile } from "@/components/calendar/CalendarMobile";
import { useBlockUI } from "@/context/BlockUIContext";
import { RoomsQueryAndStayCategory } from "@/hooks/useRooms";
import { AccommodationType, Room, RoomStatus, Stay } from "@/types";
import {
  RoomActionEnum,
  RoomStatusEnum,
} from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import React, { useEffect } from "react";

interface CalendarGridProps {
  onStartDateChange: (date: Date) => void;
  accommodationType: AccommodationType;
  activeTab: number;
  startDate: Date;
  days: Date[];
  onRoomClick: (
    room: Room,
    date: Date,
    stay: Stay | null,
    action: RoomActionEnum,
    accommodationType: AccommodationType
  ) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  accommodationType,
  onStartDateChange,
  activeTab,
  startDate,
  days,
  onRoomClick,
}) => {
  const startDateStr = dayjs(days[0]).format("YYYY-MM-DD");
  const endDateStr = dayjs(days[days.length - 1]).format("YYYY-MM-DD");

  const { data, isLoading } = RoomsQueryAndStayCategory({
    id: accommodationType.id,
    startDate: startDateStr,
    endDate: endDateStr,
  });

  const { hideBlockUI, showBlockUI } = useBlockUI();

  useEffect(() => {
    if (isLoading) {
      showBlockUI("Cargando habitaciones");
    } else {
      hideBlockUI();
    }
  }, [isLoading]);

  const getActiveStay = (room: Room, date: Date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return room.stays?.find((s) => dateStr >= s.check_in_date && dateStr <= s.check_out_date);
  };

  const handleRoomClick = (room: Room, date: Date, stay: Stay | null) => {
    let action = RoomActionEnum.MANAGEMENT;

    if (stay?.active === false) {
      action = RoomActionEnum.OCCUPIED;
    } else if (stay?.room_statuses?.name === RoomStatusEnum.OCUPADO) {
      action = RoomActionEnum.CHECK_IN;
    } else if (stay?.origin_was_reservation) {
      action = RoomActionEnum.BOOKING;
    }

    onRoomClick(room, date, stay, action, accommodationType);
  };

  return (
    <section>
      <CalendarMobile
        onStartDateChange={onStartDateChange}
        getActiveStay={getActiveStay}
        handleRoomClick={handleRoomClick}
        startDate={startDate}
        data={data ?? []}
        days={days}
      />
    </section>
  );
};
