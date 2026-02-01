import { STATUS_MAP } from "@/constants";
import { AccommodationType, Room, RoomStatus, Stay } from "@/types";
import { RoomStatusEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import { Button } from "primereact/button";
import React, { useState } from "react";
import { RoomActionModal } from "./RoomActionModal";
import { UseQueryResult } from "@tanstack/react-query";

interface CalendarGridProps {
  getActiveStay: (room: Room, date: Date) => Stay | undefined;
  accommodationType: AccommodationType;
  filteredRooms: Room[];
  activeStay?: Stay;
  activeTab: number;
  days: Date[];
  roomStatuses: RoomStatus[];
  refectCalendar: () => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  accommodationType,
  getActiveStay,
  filteredRooms,
  activeStay,
  roomStatuses,
  refectCalendar,
  activeTab,
  days,
}) => {
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

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
        {accommodationType.is_rentable && (
          <div className="p-4 flex justify-end">
            <Button
              label={`Alquiler ${accommodationType.name}`}
              className="p-button-plain bg-[#faf8f5] border  text-gray-600 font-bold  p-2 h-full"
              onClick={() => setShowActionModal(true)}
            />
          </div>
        )}
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="border">
              <th className="p-4 text-left font-bold text-gray-400 w-[75px] border-r sticky top-0 z-10 bg-[#eeebe4] shadow-sm">
                Hab..
              </th>
              {days.map((d) => (
                <th
                  key={d.getTime()}
                  className="p-4 text-center border-r last:border-r-0 sticky top-0 z-10 bg-[#faf8f5]hadow-sm"
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
            {filteredRooms.map((room) => (
              <tr
                key={room.id}
                className="border-b last:border-b-0 hover:bg-emerald-50/30 transition-colors"
              >
                <td className="p-2 border-r bg-[#eeebe4]/50">
                  <div className="flex flex-col gap-1 items-start px-1">
                    <div className="flex items-center gap-1.5 bg-[#f3f0e9] px-1 py-1 rounded-xl border border-[#e5e0d3] w-fit">
                      <i className="pi pi-bed text-[#8b7e6a] text-xs"></i>
                      <span className="text-base font-bold text-[12px] text-[#0f2d52]">
                        {room.room_number}
                      </span>
                    </div>
                    <span className="text-[8px] font-black text-[#eeebe4]0 uppercase">
                      MAX: {room.beds_double * 2 + room.beds_single} PAX
                    </span>
                  </div>
                </td>
                {days.map((d) => {
                  const stay = getActiveStay(room, d);
                  const dateStr = dayjs(d).format("YYYY-MM-DD");
                  let statusColor =
                    STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color ||
                    "bg-green-500";
                  let cellContent = null;

                  if (stay) {
                    statusColor =
                      stay.status === "Active"
                        ? STATUS_MAP[RoomStatusEnum.OCUPADO]?.color ||
                          "bg-red-500"
                        : STATUS_MAP[RoomStatusEnum.RESERVED]?.color ||
                          "bg-yellow-500";
                    cellContent = (
                      <span className="text-[8px] px-1 truncate">
                        {stay.guest?.first_name} {stay.guest?.last_name}
                      </span>
                    );
                  } else if (
                    room.status_date === dateStr &&
                    room.status?.name !== RoomStatusEnum.DISPONIBLE
                  ) {
                    statusColor =
                      STATUS_MAP[room.status.name]?.color || statusColor;
                    cellContent = (
                      <span className="text-[8px] font-bold uppercase">
                        {room.status.name}
                      </span>
                    );
                  }

                  return (
                    <td
                      key={d.getTime()}
                      className="p-1 border-r last:border-r-0 cursor-pointer bg-[#faf8f5]"
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
