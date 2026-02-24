import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { STATUS_MAP } from "@/constants";
import { Room, Stay } from "@/types";
import { RoomStatusEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import React from "react";

interface CalendarMobileProps {
  data: Room[];
  days: Date[];
  getActiveStay: (room: Room, date: Date) => Stay | undefined;
  handleRoomClick?: (room: Room, date: Date, stay: Stay | null) => void;
  startDate: Date;
  onStartDateChange: (date: Date) => void;
}

export const CalendarMobile: React.FC<CalendarMobileProps> = ({
  data,
  days,
  getActiveStay,
  handleRoomClick,
  startDate,
  onStartDateChange,
}) => {
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

  // Obtener el color para una estadía específica
  const getStayColor = (stay: Stay | undefined): string => {
    if (!stay) return STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color;

    const isActive = stay.active !== false;
    if (!isActive) return "bg-[#a8b6cd]";

    return (
      stay?.room_statuses?.color || STATUS_MAP[RoomStatusEnum.DISPONIBLE]?.color
    );
  };

  return (
    <div className="flex flex-col gap-3 mb-[80px]">
      {/* Dashboard de estadísticas del día */}
      <div className="bg-white rounded-xl border p-3 shadow-sm border-[#eeebe4]">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-gray-700">
            Resumen del día {dayjs().format("D/M/YYYY")}
          </h3>
          <div className="flex justify-between flex-wrap">
            <div className=" flex justify-end gap-2 mb-2">
              <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                <i className="pi pi-users text-blue-600 text-xs"></i>
                <span className="text-xs font-semibold text-blue-700">
                  Estadías: {totalStaysToday}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                <i className="pi pi-check-circle text-green-600 text-xs"></i>
                <span className="text-xs font-semibold text-green-700">
                  Limpias: {cleanedRooms}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                <span className="text-xs">🧹⚠️</span>
                <span className="text-xs font-semibold text-amber-700">
                  Pendientes: {pendingCleaning}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mb-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-emerald-700">
                  Ocupadas
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="text-xs font-semibold text-yellow-700">
                  Reservadas
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a8b6cd]"></span>
                <span className="text-xs font-semibold text-slate-700">
                  Check-out
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header de navegación de semanas */}
      <CalendarHeader
        startDate={startDate}
        onStartDateChange={onStartDateChange}
      />

      {/* Contenedor principal */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden border-[#eeebe4]">
        <div className="overflow-auto max-h-[70vh]">
          <div className="min-w-[600px]">
            {/* Header de días - Fijo en top */}
            <div className="flex border-b border-[#eeebe4] bg-[#eeebe4] sticky top-0 z-20">
              <div className="w-[85px] p-3 border-r border-[#eeebe4] flex items-center justify-center bg-[#eeebe4] sticky left-0 z-30">
                <span className="text-[10px] font-bold text-gray-400">
                  HAB.
                </span>
              </div>
              <div className="flex flex-1">
                {days.map((d) => {
                  const dateStr = dayjs(d).format("YYYY-MM-DD");
                  const isToday = dateStr === todayStr;
                  return (
                    <div
                      key={d.getTime()}
                      className="flex flex-col items-center flex-1 min-w-[70px] p-2 border-r last:border-r-0 border-[#eeebe4]"
                    >
                      <span className="text-[10px] font-bold uppercase text-gray-400">
                        {dayjs(d).format("ddd")}
                      </span>
                      <span
                        className={`text-sm font-black ${
                          isToday ? "text-emerald-600 text-lg" : "text-gray-700"
                        }`}
                      >
                        {dayjs(d).format("D")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lista de habitaciones con timeline */}
            <div className="flex flex-col">
              {(data ?? []).map((room) => {
                const isRoomWithActivityToday = todayRooms.find(
                  (t) => t.id === room.id,
                );

                // Obtener todas las estadías únicas para esta habitación en el rango de días
                const staysInRange = React.useMemo(() => {
                  const uniqueStays = new Map<
                    string,
                    Stay & {
                      startIndex: number;
                      endIndex: number;
                      startOffset: number;
                      endOffset: number;
                    }
                  >();

                  days.forEach((day) => {
                    const stay = getActiveStay(room, day);
                    if (stay?.id && !uniqueStays.has(stay.id)) {
                      const checkInIndex = days.findIndex(
                        (d) =>
                          dayjs(d).format("YYYY-MM-DD") === stay.check_in_date,
                      );
                      const checkOutIndex = days.findIndex(
                        (d) =>
                          dayjs(d).format("YYYY-MM-DD") === stay.check_out_date,
                      );

                      // Calcular offsets: 0.5 = mitad de celda (check-in empieza al medio día, check-out termina al medio día)
                      const startOffset = checkInIndex >= 0 ? 0.5 : 0;
                      const endOffset = checkOutIndex >= 0 ? 0.5 : 0;

                      uniqueStays.set(stay.id, {
                        ...stay,
                        startIndex: checkInIndex >= 0 ? checkInIndex : 0,
                        endIndex: checkOutIndex >= 0 ? checkOutIndex : days.length - 1,
                        startOffset,
                        endOffset,
                      });
                    }
                  });

                  return Array.from(uniqueStays.values());
                }, [room, days]);

                // Verificar si hay estado especial (limpieza/mantenimiento) para hoy
                const todayDay = days.find(
                  (d) => dayjs(d).format("YYYY-MM-DD") === todayStr,
                );
                const hasSpecialStatus =
                  todayDay &&
                  room.status_date === todayStr &&
                  room.status?.name !== RoomStatusEnum.DISPONIBLE;

                return (
                  <div
                    key={room.id}
                    className="flex border-b last:border-b-0 hover:bg-emerald-50/30 transition-colors border-[#eeebe4]"
                  >
                    {/* Lateral con número de habitación - sticky en left y top */}
                    <div className="w-[85px] p-1 border-r border-[#eeebe4] bg-gray-50/70 flex flex-col items-center justify-center gap-1 sticky left-0 z-10">
                      <span className="text-[11px] font-black text-emerald-800">
                        #{room.room_number}
                        <span className="text-[9px] text-gray-600">
                          ( MAX: {room.beds_double * 2 + room.beds_single})
                        </span>
                      </span>
                      <span className="text-[9px] text-gray-700 font-bold">
                        {room.beds_double}D | {room.beds_single}S
                      </span>
                      <div className="mt-[-10px]">
                        {room.cleaning_log && room.cleaning_log.length > 0 ? (
                          <i
                            className="pi pi-check-circle text-green-500 text-sm"
                            title="Limpieza realizada"
                          ></i>
                        ) : (
                          <span
                            className="text-xs"
                            title="Pendiente por limpieza"
                          >
                            🧹{isRoomWithActivityToday && "⚠️"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline de ocupación */}
                    <div className="flex-1">
                      <div className="relative h-[60px]">
                        {/* Línea base de los días */}
                        <div className="absolute inset-0 flex">
                          {days.map((d) => {
                            const dateStr = dayjs(d).format("YYYY-MM-DD");
                            const isToday = dateStr === todayStr;

                            return (
                              <div
                                key={d.getTime()}
                                className={`flex-1 min-w-17.5 border-[#eeebe4] border-r last:border-r-0 flex flex-col items-center justify-end pb-1 cursor-pointer ${
                                  isToday ? "bg-emerald-50" : ""
                                }`}
                                onClick={() =>
                                  // console.log(stay)
                                  handleRoomClick?.(room, d, null)
                                }
                              >
                                {/* Indicador de día actual */}

                                {/* Marcadores de check-in/check-out */}
                              </div>
                            );
                          })}
                        </div>

                        {/* Bloques de ocupación */}
                        {staysInRange.map((stay) => {
                          const startIndex = stay.startIndex;
                          const endIndex = stay.endIndex;
                          const colorClass = getStayColor(stay);

                          // Calcular posición y ancho del bloque con offsets de media celda
                          // startOffset: 0.5 si el check-in está en el rango (empieza al medio día)
                          // endOffset: 0.5 si el check-out está en el rango (termina al medio día)
                          const leftPercent =
                            ((startIndex + stay.startOffset) / days.length) *
                            100;
                          const widthPercent =
                            ((endIndex -
                              startIndex +
                              1 -
                              stay.startOffset -
                              stay.endOffset) /
                              days.length) *
                            99;

                          return (
                            <div
                              key={stay.id}
                              className={`absolute h-[90%]  ${colorClass} shadow-md flex flex-col justify-center px-2 overflow-hidden cursor-pointer`}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${Math.max(widthPercent, 5)}%`, // Mínimo 5% para que se vea algo
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                              onClick={() =>
                                handleRoomClick?.(room, days[startIndex], stay)
                              }
                            >
                              <div className="flex items-center gap-1 font-bold">
                                <span className="text-xs">
                                  {/* {!stay.room_id ? "🏠" : "🛏️"} */}
                                </span>
                                <span className="text-xs font-bold text-white truncate">
                                  #{stay.order_number}
                                </span>
                              </div>
                              <span className="text-[10px] text-white/90 truncate font-bold">
                                {stay.guest?.first_name}{" "}
                                {stay.guest?.last_name?.[0]}.
                              </span>
                              <span className="text-[10px] text-white/70 font-bold">
                                {dayjs(stay.check_in_date).format("D/M")} -{" "}
                                {dayjs(stay.check_out_date).format("D/M")}
                              </span>
                            </div>
                          );
                        })}

                        {/* Estado especial (limpieza/mantenimiento) */}
                        {hasSpecialStatus && room.status && (
                          <div
                            className={`absolute h-10 rounded-lg ${STATUS_MAP[room.status.name]?.color} shadow-md flex items-center justify-center px-2`}
                            style={{
                              left: `${(days.findIndex((d) => dayjs(d).format("YYYY-MM-DD") === todayStr) / days.length) * 100}%`,
                              width: `${100 / days.length}%`,
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            <span className="text-xs font-bold text-white text-center">
                              {room.status.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
