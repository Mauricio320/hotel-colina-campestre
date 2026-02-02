import { STATUS_MAP } from "@/constants";
import { Room, Stay } from "@/types";
import { RoomStatusEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import React from "react";

interface CalendarTableProps {
  data: Room[];
  days: Date[];
  getActiveStay: (room: Room, date: Date) => Stay | undefined;
  handleRoomClick: (room: Room, date: Date, stay: Stay | null) => void;
}

export const CalendarTable: React.FC<CalendarTableProps> = ({
  data,
  days,
  getActiveStay,
  handleRoomClick,
}) => {
  return (
    <div className="overflow-auto bg-white rounded-xl shadow-sm border bg-[#eeebe4] max-h-[75vh]">
      <table className="w-full border-separate border-spacing-0 min-w-[800px]">
        <thead>
          <tr className="border">
            <th className="p-2 text-center font-bold text-gray-400 w-[60px] min-w-[60px] border-r border-b sticky top-0 left-0 z-20 bg-[#eeebe4] shadow-sm">
              <span className="text-[10px]">HAB.</span>
            </th>
            {days.map((d) => (
              <th
                key={d.getTime()}
                className="p-4 text-center border-r border-b last:border-r-0 sticky top-0 z-10 bg-[#eeebe4] shadow-sm min-w-[120px] w-[120px]"
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
              <td className="p-1 border-r border-b bg-[#eeebe4] w-[60px] max-w-[60px] sticky left-0 z-[5] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
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
                    className="p-1 border-r border-b last:border-r-0 cursor-pointer bg-[#faf8f5] w-[120px] min-w-[120px]"
                    onClick={() => handleRoomClick(room, d, stay)}
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
