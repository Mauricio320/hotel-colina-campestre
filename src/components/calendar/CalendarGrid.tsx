import { STATUS_MAP } from "@/constants";
import { AccommodationType, Room, RoomStatus, Stay } from "@/types";
import { RoomStatusEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import { RoomActionModal } from "./RoomActionModal";
import { UseQueryResult } from "@tanstack/react-query";
import { RoomsQueryCtegory } from "@/hooks/useRooms";
import { useBlockUI } from "@/context/BlockUIContext";

interface CalendarGridProps {
  getActiveStay: (room: Room, date: Date) => Stay | undefined;
  accommodationType: AccommodationType;
  activeStay?: Stay;
  activeTab: number;
  days: Date[];
  roomStatuses: RoomStatus[];
  refectCalendar: () => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  accommodationType,
  activeStay,
  roomStatuses,
  refectCalendar,
  activeTab,
  days,
}) => {
  const { hideBlockUI, showBlockUI } = useBlockUI();
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const { data, isLoading } = RoomsQueryCtegory(accommodationType.id);

  useEffect(() => {
    if (isLoading) {
      showBlockUI("Cargando habitaciones");
    } else {
      hideBlockUI();
    }
  }, [isLoading]);

  const getActiveStay = (room: Room, date: Date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return room.stays?.find(
      (s) => dateStr >= s.check_in_date && dateStr <= s.check_out_date,
    );
  };

  const handleRoomClick = (room: Room, date: Date) => {
    setRoom(room);
    setSelectedDate(date);
    if (!activeStay) setShowActionModal(true);
  };

  return (
    <section>
      <div
        className="overflow-x-auto bg-white
       rounded-xl shadow-sm border mt-4 bg-[#eeebe4]"
      >
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="border">
              <th className="p-2 text-center font-bold text-gray-400 w-[60px] min-w-[60px] border-r sticky top-0 z-10 bg-[#eeebe4] shadow-sm">
                <span className="text-[10px]">HAB.</span>
              </th>
              {days.map((d) => (
                <th
                  key={d.getTime()}
                  className="p-4 text-center border-r last:border-r-0 sticky top-0 z-10 bg-[#eeebe4] shadow-sm min-w-[120px] w-[120px]"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-gray-400">
                      {dayjs(d).format("ddd")}
                    </span>
                    <span
                      className={`text-lg font-black ${
                        dayjs(d).format("YYYY-MM-DD") ===
                        dayjs(new Date()).format("YYYY-MM-DD")
                          ? "text-emerald-600 font-bold text-[25px]"
                          : "text-gray-700"
                      }`}
                    >
                      {dayjs(d).format("D")}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((room) => (
              <tr
                key={room.id}
                className="border-b last:border-b-0 hover:bg-emerald-50/30 transition-colors"
              >
                <td className="p-1 border-r bg-[#eeebe4]/70 w-[60px] max-w-[60px]">
                  <div className="flex flex-col items-center leading-tight">
                    <span className="text-[11px] font-black text-emerald-800">
                      #{room.room_number}
                    </span>
                    <div className="flex flex-col items-center opacity-60 scale-[0.85] origin-top">
                      <span className="text-[11px] font-bold whitespace-nowrap text-gray-700">
                        {room.beds_double}D | {room.beds_single}S - MAX:{" "}
                        {room.beds_double * 2 + room.beds_single}
                      </span>
                    </div>
                  </div>
                </td>
                {days.map((d) => {
                  const stay = getActiveStay(room, d);
                  console.log(stay, "asndkjas");

                  const dateStr = dayjs(d).format("YYYY-MM-DD");
                  let statusColor =
                    stay?.["room_statuses"].color ||
                    STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color;
                  let cellContent = null;

                  if (stay) {
                    const isFullRental = !stay.room_id;
                    cellContent = (
                      <div className="flex flex-col items-center leading-none gap-0.5 w-full">
                        <span className="text-[9px] font-black opacity-90 uppercase">
                          {isFullRental ? "🏠" : "🛏️"}
                        </span>

                        <span className="text-[12px] mt-1 flex items-center">
                          #{stay.order_number} - {stay.guest?.first_name}
                        </span>
                      </div>
                    );
                  } else if (
                    room.status_date === dateStr &&
                    room.status?.name !== RoomStatusEnum.DISPONIBLE
                  ) {
                    statusColor = STATUS_MAP[room.status.name]?.color;

                    cellContent = (
                      <span className="text-[8px] font-bold uppercase">
                        {room.status.name}
                      </span>
                    );
                  }

                  return (
                    <td
                      key={d.getTime()}
                      className="p-1 border-r last:border-r-0 cursor-pointer bg-[#faf8f5] w-[120px] min-w-[120px]"
                      onClick={() => handleRoomClick(room, d)}
                    >
                      <div
                        className={`h-10 w-full rounded-lg flex items-center justify-center text-white font-bold transition-all ${statusColor} shadow-sm overflow-hidden`}
                      >
                        {cellContent}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RoomActionModal
        roomStatuses={roomStatuses}
        onHide={() => setShowActionModal(false)}
        accommodationType={accommodationType}
        visible={showActionModal}
        refectCalendar={() => refectCalendar()}
        activeStay={activeStay}
        date={selectedDate}
        activeTab={activeTab}
        room={room}
      />
    </section>
  );
};
