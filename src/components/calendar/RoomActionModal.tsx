import { AccommodationType, Room, RoomStatus, Stay } from "@/types";
import { AccommodationTypeEnum } from "@/util/enums/status-rooms.enum";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import React, { useState } from "react";
import { RoomActionModalContent } from "@/components/calendar/RoomActionModalContent";
import { RoomActionModalHeaderInfo } from "@/components/calendar/RoomActionModalHeaderInfo";

interface RoomActionModalProps {
  visible: boolean;
  onHide: () => void;
  accommodationType?: AccommodationType;
  room?: Room;
  date: Date | null;
  activeStay?: Stay;
  activeTab: number;
  roomStatuses: RoomStatus[];
  refectCalendar: () => void;
}

export const RoomActionModal: React.FC<RoomActionModalProps> = ({
  visible,
  onHide,
  activeStay,
  accommodationType,
  activeTab,
  room,
  date,
  roomStatuses,
  refectCalendar,
}) => {
  const [accommodationTypeEnum, setAccommodationTypeEnum] =
    useState<AccommodationTypeEnum>(AccommodationTypeEnum.HABITACION);

  const modalHeader = (
    <div className="flex items-center gap-3">
      <i className="pi pi-building text-2xl text-gray-700"></i>
      <span className="text-2xl font-black text-gray-800 tracking-tight">
        Acciones
      </span>
    </div>
  );

  return (
    <Dialog
      header={modalHeader}
      visible={visible}
      onHide={onHide}
      className="w-full max-w-xl"
    >
      <div className="flex flex-col gap-5 py-2">
        <Dropdown
          options={[
            { label: "Habitación", value: AccommodationTypeEnum.HABITACION },
            {
              label: accommodationType.name,
              value: AccommodationTypeEnum.APARTAMENTO,
            },
          ]}
          disabled={!accommodationType.is_rentable}
          value={accommodationTypeEnum}
          onChange={(e) => setAccommodationTypeEnum(e.value)}
          placeholder="Seleccionar tipo"
          className="w-full"
        />

        <RoomActionModalHeaderInfo
          accommodationTypeEnum={accommodationTypeEnum}
          room={room}
          date={date}
        />
        <RoomActionModalContent
          roomStatuses={roomStatuses || []}
          accommodationTypeEnum={accommodationTypeEnum}
          accommodationType={accommodationType}
          refectCalendar={refectCalendar}
          activeStay={activeStay}
          activeTab={activeTab}
          onHide={onHide}
          date={date}
          room={room}
        />
      </div>
    </Dialog>
  );
};
