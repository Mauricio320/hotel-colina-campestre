import { Room, Stay } from "@/types";
import { AccommodationTypeEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import React from "react";

interface RoomActionModalHeaderInfoProps {
  room?: Room;
  date: Date | null;
  accommodationTypeEnum?: AccommodationTypeEnum;
}

export const RoomActionModalHeaderInfo: React.FC<
  RoomActionModalHeaderInfoProps
> = ({ room, date, accommodationTypeEnum }) => {
  return (
    <>
      <div className="bg-[#fdf8f1] p-6 rounded-2xl border border-orange-100/50 shadow-sm">
        <div className="flex flex-col gap-2 text-gray-600 text-base font-medium">
          <p>
            Fecha seleccionada:{" "}
            <span className="font-bold text-emerald-600">
              {dayjs(date).format("YYYY-MM-DD")}
            </span>
          </p>
          {accommodationTypeEnum === AccommodationTypeEnum.HABITACION && (
            <div className="flex flex-col gap-3 pt-2 border-t border-orange-100/30 mt-1">
              <div className="flex items-center gap-2">
                <i className="pi pi-home text-orange-400"></i>
                <span className="font-bold text-gray-800">
                  Habitación {room?.room_number}
                  <span className="ml-2 font-medium text-gray-500 text-sm">
                    ({room?.category})
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {room?.rates?.map((rate) => (
                  <div
                    key={rate.id}
                    className="flex items-center justify-between bg-white/50 p-2 px-3 rounded-xl border border-orange-50"
                  >
                    <div className="flex items-center gap-2">
                      <i className="pi pi-users text-xs text-orange-400"></i>
                      <span className="text-sm font-semibold text-gray-700">
                        {rate.person_count}{" "}
                        {rate.person_count === 1 ? "Persona" : "Personas"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-emerald-600">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(rate.rate)}
                      </span>
                      <span className="text-[10px] text-gray-400 -mt-1 uppercase font-bold tracking-wider">
                        / Noche
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO && (
            <div className="flex flex-col gap-3 pt-2 border-t border-orange-100/30 mt-1">
              <div className="flex items-center gap-2">
                <i className="pi pi-building text-orange-400"></i>
                <span className="font-bold text-gray-800">
                  {room?.room_number}
                  <span className="ml-2 font-medium text-gray-500 text-sm">
                    ({room?.category})
                  </span>
                </span>
              </div>
              <div className="bg-white/50 p-3 rounded-xl border border-orange-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <i className="pi pi-list text-xs text-orange-400"></i>
                  Alquiler Completo
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-emerald-600">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(room?.accommodation_types?.price || 0)}
                  </span>
                  <span className="text-[10px] text-gray-400 -mt-1 uppercase font-bold tracking-wider">
                    / Noche
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
