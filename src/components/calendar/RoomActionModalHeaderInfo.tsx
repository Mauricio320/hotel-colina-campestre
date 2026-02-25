import { Room } from "@/types";
import { AccommodationTypeEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import React from "react";

interface RoomActionModalHeaderInfoProps {
  room?: Room;
  date: Date | null;
  accommodationTypeEnum?: AccommodationTypeEnum;
}

export const RoomActionModalHeaderInfo: React.FC<RoomActionModalHeaderInfoProps> = ({
  room,
  date,
  accommodationTypeEnum,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-[#f5f2eb] p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="pi pi-calendar text-sm text-gray-500"></i>
            <span className="text-sm text-gray-600">{dayjs(date).format("DD/MM/YYYY")}</span>
          </div>
        </div>

        {accommodationTypeEnum === AccommodationTypeEnum.HABITACION && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {room?.rates?.map((rate) => (
              <div
                key={rate.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2 px-3"
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
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
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
