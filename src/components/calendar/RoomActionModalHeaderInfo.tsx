import { Room } from "@/types";
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
    <div className="bg-[#f5f2eb] rounded-xl p-4 border border-gray-200">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="pi pi-calendar text-gray-500 text-sm"></i>
            <span className="text-sm text-gray-600">
              {dayjs(date).format("DD/MM/YYYY")}
            </span>
          </div>
          {accommodationTypeEnum === AccommodationTypeEnum.HABITACION && (
            <div className="flex items-center gap-1.5">
              <i className="pi pi-home text-gray-500 text-xs"></i>
              <span className="text-sm font-bold text-gray-800">
                Hab. {room?.room_number}
              </span>
            </div>
          )}
        </div>

        {accommodationTypeEnum === AccommodationTypeEnum.HABITACION && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {room?.rates?.map((rate) => (
              <div
                key={rate.id}
                className="flex items-center justify-between bg-white p-2 px-3 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <i className="pi pi-users text-xs text-emerald-600"></i>
                  <span className="text-sm font-medium text-gray-700">
                    {rate.person_count} pers.
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-700">
                  ${rate.rate.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <i className="pi pi-building text-xs text-emerald-600"></i>
              Alquiler Completo
            </div>
            <span className="text-sm font-bold text-emerald-700">
              ${(room?.accommodation_types?.price || 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
