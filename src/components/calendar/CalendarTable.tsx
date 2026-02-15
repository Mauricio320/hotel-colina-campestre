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

  const getStayEndingOnDate = (room: Room, date: Date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return room.stays?.find(
      (stay) =>
        stay.check_out_date === dateStr &&
        stay.origin_was_reservation === false,
    );
  };

  const todayStr = dayjs().format("YYYY-MM-DD");
  const todayRooms = data.filter((room) => {
    const hasCheckoutToday = room.stays?.some((stay) => {
      const checkInDate = dayjs(stay.check_in_date);
      const checkOutDate = dayjs(stay.check_out_date);
      const today = dayjs(todayStr);

      return (
        stay.origin_was_reservation === false &&
        stay.active === true &&
        (today.isSame(checkInDate, "day") ||
          today.isSame(checkOutDate, "day") ||
          (today.isAfter(checkInDate, "day") &&
            today.isBefore(checkOutDate, "day")))
      );
    });

    const hasCheckInToday = room.stays?.some(
      (stay) =>
        stay.origin_was_reservation === true &&
        stay.active === true &&
        stay.check_in_date === todayStr,
    );

    return hasCheckoutToday || hasCheckInToday;
  });

  const totalStaysToday = todayRooms.length;
  const cleanedRooms = todayRooms.filter(
    (room) => room.cleaning_log && room.cleaning_log.length > 0,
  ).length;
  const pendingCleaning = totalStaysToday - cleanedRooms;

  return (
    <div className="flex flex-col gap-2">
      {/* Dashboard de estadísticas del día */}
      <div className="bg-white rounded-xl border p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">
            Resumen del día {dayjs().format("D/M/YYYY")}
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              <i className="pi pi-users text-blue-600 text-sm"></i>
              <span className="text-xs font-semibold text-blue-700">
                Estadías: {totalStaysToday}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              <i className="pi pi-check-circle text-green-600 text-sm"></i>
              <span className="text-xs font-semibold text-green-700">
                Limpias: {cleanedRooms}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <span className="text-sm">🧹</span>
              <span className="text-xs font-semibold text-amber-700">
                Pendientes: {pendingCleaning}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto bg-white rounded-xl border bg-[#eeebe4] max-h-[75vh]">
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
                <td className="p-1 border-r border-b bg-[#eeebe4] w-[60px] max-w-[60px] sticky left-0 z-5 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
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
                  const todayStr = dayjs().format("YYYY-MM-DD");
                  const isToday = dateStr === todayStr;
                  let statusColor =
                    stay?.room_statuses?.color ||
                    STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color;
                  let cellContent = null;
                  let isCheckOutDay = false;

                  if (stay) {
                    const isFullRental = !stay.room_id;
                    const isActive = stay.active !== false;
                    isCheckOutDay = dateStr === stay.check_out_date;

                    if (!isActive) {
                      statusColor = "bg-[#a8b6cd]";
                    }

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

                  // Indicador de limpieza para el día actual
                  const cleaningIndicator = isToday ? (
                    room.cleaning_log && room.cleaning_log.length > 0 ? (
                      <i
                        className="pi pi-check-circle text-[15px] absolute top-2 right-2 text-green-200 font-bold"
                        title="Limpieza realizada"
                        style={{ WebkitTextStroke: "1px black" }}
                      ></i>
                    ) : (
                      <span
                        className="absolute top-2 right-2 text-[10px]"
                        title="Pendiente por limpieza"
                      >
                        🧹
                      </span>
                    )
                  ) : null;

                  const nextStay = getStayStartingOnDate(room, d);
                  const hasNextStay = isCheckOutDay && nextStay;

                  const isCheckInDay = stay && dateStr === stay.check_in_date;
                  const previousStay = isCheckInDay
                    ? getStayEndingOnDate(room, d)
                    : null;
                  const hasPreviousStay = isCheckInDay && previousStay;

                  return (
                    <td
                      key={d.getTime()}
                      className="p-1 border-r border-b last:border-r-0 bg-[#faf8f5] w-[120px] min-w-[120px]"
                    >
                      {isCheckOutDay ? (
                        <div className="h-10 w-full rounded-lg flex overflow-hidden">
                          {/* Mitad izquierda: ocupada - abre modal de estadía */}
                          <div
                            className={`${statusColor} text-white font-bold h-full w-1/2 flex items-center  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px; justify-center rounded-l-lg rounded-r-none border-r-2 border-white/50 cursor-pointer hover:opacity-90 relative`}
                            onClick={() =>
                              handleRoomClick(room, d, stay || null)
                            }
                          >
                            {cellContent}
                            {cleaningIndicator}
                          </div>
                          {/* Mitad derecha: siguiente estancia si existe, sino disponible */}
                          {hasNextStay ? (
                            <div
                              className={`${nextStay?.room_statuses?.color || statusColor} h-full w-1/2 flex items-center justify-center rounded-r-lg rounded-l-none cursor-pointer hover:opacity-90 relative`}
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
                              {cleaningIndicator}
                            </div>
                          ) : (
                            <div
                              className={`${STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color} h-full w-1/2 flex items-center justify-center rounded-r-lg rounded-l-none cursor-pointer hover:opacity-90 relative`}
                              onClick={() => handleRoomClick(room, d, null)}
                            >
                              {cleaningIndicator}
                            </div>
                          )}
                        </div>
                      ) : isCheckInDay ? (
                        <div className="h-10 w-full rounded-lg flex overflow-hidden">
                          {/* Mitad izquierda: estadía anterior si existe, sino disponible */}
                          {hasPreviousStay ? (
                            <div
                              className={`${statusColor} text-white font-bold h-full w-1/2 flex items-center justify-center rounded-l-lg rounded-r-none border-r-2 border-white/50 cursor-pointer hover:opacity-90 relative`}
                              onClick={() =>
                                handleRoomClick(room, d, previousStay)
                              }
                            >
                              <div className="flex flex-col items-center leading-none gap-0.5 w-full">
                                <span className="text-[9px] font-black opacity-90 uppercase">
                                  {!previousStay?.room_id ? "🏠" : "🛏️"}
                                </span>
                                <span className="text-[12px] mt-1 flex items-center">
                                  #{previousStay?.order_number} -{" "}
                                  {previousStay?.guest?.first_name}
                                </span>
                              </div>
                              {cleaningIndicator}
                            </div>
                          ) : (
                            <div
                              className={`${STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color} h-full w-1/2 flex items-center justify-center rounded-l-lg rounded-r-none border-r-2 border-white/50 cursor-pointer hover:opacity-90 relative`}
                              onClick={() => handleRoomClick(room, d, null)}
                            >
                              {cleaningIndicator}
                            </div>
                          )}
                          {/* Mitad derecha: nueva estadía (check-in) */}
                          <div
                            className={`${statusColor} h-full w-1/2 flex items-center justify-center rounded-r-lg rounded-l-none cursor-pointer hover:opacity-90 relative`}
                            onClick={() => handleRoomClick(room, d, stay)}
                          >
                            {cellContent}
                            {cleaningIndicator}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`h-10 text-gray-700 w-full rounded-lg flex items-center justify-center text-white font-bold transition-all ${statusColor}  overflow-hidden cursor-pointer relative`}
                          onClick={() => handleRoomClick(room, d, stay)}
                        >
                          {cellContent}
                          {cleaningIndicator}
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
    </div>
  );
};
