import React from "react";
import dayjs from "dayjs";
import { Room, Stay } from "@/types";
import { RoomStatusEnum } from "@/util/status-rooms.enum";
import { STATUS_MAP } from "@/constants";

interface CalendarGridProps {
  days: Date[];
  filteredRooms: Room[];
  accommodationTypes: any[];
  getActiveStay: (room: Room, date: Date) => Stay | undefined;
  handleRoomClick: (room: Room, stay: Stay | null, date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  filteredRooms,
  accommodationTypes,
  getActiveStay,
  handleRoomClick,
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border mt-4">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[#eeebe4] border-b">
            <th className="p-4 text-left font-bold text-gray-400 w-[75px] border-r sticky top-0 z-10 bg-[#eeebe4] shadow-sm">
              Hab..
            </th>
            {days.map((d) => (
              <th
                key={d.getTime()}
                className="p-4 text-center border-r last:border-r-0 sticky top-0 z-10 bg-[#eeebe4] shadow-sm"
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
                    className="p-1 border-r last:border-r-0 cursor-pointer"
                    onClick={() => handleRoomClick(room, stay || null, d)}
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
  );
};
