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
  getNextStay?: (room: Room, date: Date) => Stay | undefined;
}

export const CalendarTable: React.FC<CalendarTableProps> = ({
  data,
  days,
  getActiveStay,
  handleRoomClick,
}) => {
  const getStayStartingOnDate = (room: Room, date: Date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return room.stays?.find((stay) => stay.check_in_date === dateStr);
  };
  return (
    <div className="overflow-auto bg-white rounded-xl  border bg-[#eeebe4] max-h-[75vh]">
      <table className="w-full border-separate border-spacing-0 min-w-[800px]">
        <thead>
          <tr className="border">
            <th className="p-2 text-center font-bold text-gray-400 w-[60px] min-w-[60px] border-r border-b sticky top-0 left-0 z-20 bg-[#eeebe4] ">
              <span className="text-[10px]">HAB.</span>
            </th>
            {days.map((d) => (
              <th
                key={d.getTime()}
                className="p-4 text-center border-r border-b last:border-r-0 sticky top-0 z-10 bg-[#eeebe4]  min-w-[120px] w-[120px]"
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
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-black text-emerald-800">
                      #{room.room_number}
                    </span>
                    <span className="text-[9px] font-bold text-gray-600">
                      (MAX: {room.beds_double * 2 + room.beds_single})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 opacity-70">
                    {room.beds_double}D | {room.beds_single}S
                  </span>
                </div>
              </td>
              {days.map((d) => {
                const stay = getActiveStay(room, d);

                const dateStr = dayjs(d).format("YYYY-MM-DD");
                let statusColor =
                  stay?.room_statuses?.color ||
                  STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color;
                let cellContent = null;
                let isCheckOutDay = false;

                if (stay) {
                  const isFullRental = !stay.room_id;
                  // Verificar si es el día de salida
                  isCheckOutDay = dateStr === stay.check_out_date;

                  cellContent = (
                    <div className="flex flex-col items-center leading-none gap-0.5 w-full">
                      <span className="text-[9px] font-black opacity-90 uppercase">
                        {isFullRental ? "🏠" : "🛏️"}
                      </span>

                      <span className="text-[12px] mt-1 flex items-center">
                        #{stay.order_number} - {stay.guest?.first_name} {String(stay.active)}
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

                const nextStay = getStayStartingOnDate(room, d);
                const hasNextStay = isCheckOutDay && nextStay;

                return (
                  <td
                    key={d.getTime()}
                    className="p-1 border-r border-b last:border-r-0 bg-[#faf8f5] w-[120px] min-w-[120px]"
                  >
                    {isCheckOutDay ? (
                      <div className="h-10 w-full rounded-lg flex overflow-hidden">
                        {/* Mitad izquierda: ocupada - abre modal de estadía */}
                        <div
                          className={`${statusColor} text-white font-bold h-full w-1/2 flex items-center  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px; justify-center rounded-l-lg rounded-r-none border-r-2 border-white/50 cursor-pointer hover:opacity-90`}
                          onClick={() => handleRoomClick(room, d, stay || null)}
                        >
                          {cellContent}
                        </div>
                        {/* Mitad derecha: siguiente estancia si existe, sino disponible */}
                        {hasNextStay ? (
                          <div
                            className={`${nextStay?.room_statuses?.color || statusColor} h-full w-1/2 flex items-center justify-center rounded-r-lg rounded-l-none cursor-pointer hover:opacity-90`}
                            onClick={() =>
                              handleRoomClick(room, d, nextStay || null)
                            }
                          >
                            <div className="flex flex-col font-bold items-center leading-none gap-0.5 w-full">
                              <span className="text-[9px] font-black opacity-90 uppercase">
                                {!nextStay?.room_id ? "🏠" : "🛏️"}
                              </span>
                              <span className="text-[12px] mt-1 flex items-center">
                                #{nextStay?.order_number} -{" "}
                                {nextStay?.guest?.first_name}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`${STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color} h-full w-1/2 flex items-center justify-center rounded-r-lg rounded-l-none cursor-pointer hover:opacity-90`}
                            onClick={() => handleRoomClick(room, d, null)}
                          ></div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`h-10 text-gray-700 w-full rounded-lg flex items-center justify-center text-white font-bold transition-all ${statusColor}  overflow-hidden cursor-pointer`}
                        onClick={() => handleRoomClick(room, d, stay)}
                      >
                        {cellContent}
                      </div>
                    )}
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
