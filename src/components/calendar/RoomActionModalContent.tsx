import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import { useRoomHistory } from "@/hooks/useRoomHistory";
import { useRoomsActions } from "@/hooks/useRoomsActions";
import { roomsApi } from "@/services/rooms/roomsApi";
import { AccommodationType, Room, RoomStatus, Stay } from "@/types";
import {
  AccommodationTypeEnum,
  RoomActionEnum,
  RoomStatusEnum,
} from "@/util/status-rooms.enum";
import dayjs from "dayjs";
import { Button } from "primereact/button";
import React from "react";
import { useNavigate } from "react-router-dom";

interface RoomActionModalContentProps {
  activeStay: Stay;
  accommodationType?: AccommodationType;
  accommodationTypeEnum: AccommodationTypeEnum;
  date: Date | null;
  activeTab: number;
  roomStatuses: RoomStatus[];
  room?: Room;
  onHide: () => void;
  refectCalendar: () => void;
}

export const RoomActionModalContent = ({
  accommodationTypeEnum,
  accommodationType,
  roomStatuses,
  activeStay,
  activeTab,
  onHide,
  room,
  date,
  refectCalendar,
}: RoomActionModalContentProps) => {
  const navigate = useNavigate();
  const { showBlockUI } = useBlockUI();
  const { employee } = useAuth();
  const { createRecord } = useRoomHistory();

  const isHabitacion =
    accommodationTypeEnum === AccommodationTypeEnum.HABITACION;

  const id = isHabitacion ? room?.id : accommodationType.id;
  const params = [
    `date=${dayjs(date).format("YYYY-MM-DD")}`,
    `tab=${activeTab}`,
    `action=${accommodationTypeEnum}`,
  ];

  const handleGoToCheckIn = () => {
    const url = `/check-in/${id}?${params.join("&")}`;
    navigate(url);
  };
  const handleGoToBooking = () => {
    const url = `/booking/${id}?${params.join("&")}`;
    navigate(url);
  };
  const handleGoToCheckOut = () => {
    const url = `/check-out/${id}?stayId=${activeStay.id}`;
    navigate(url);
  };

  const getTargetStatusName = (action: string) => {
    switch (action) {
      case RoomActionEnum.LIMPIEZA:
        return RoomStatusEnum.LIMPIEZA;
      case RoomActionEnum.MANTENIMIENTO:
        return RoomStatusEnum.MANTENIMIENTO;
      default:
        return RoomStatusEnum.DISPONIBLE;
    }
  };

  const getObservation = (action: string) => {
    const timeStr = dayjs().format("hh:mm A");
    const dateStr = dayjs(date).format("YYYY-MM-DD");

    switch (action) {
      case RoomActionEnum.LIMPIEZA:
        return `Inicio de limpieza registrado el ${dateStr} a las ${timeStr}`;
      case RoomActionEnum.FIN_LIMPIEZA:
        return `Limpieza finalizada exitosamente a las ${timeStr}`;
      case RoomActionEnum.MANTENIMIENTO:
        return `Mantenimiento iniciado el ${dateStr} a las ${timeStr}`;
      case RoomActionEnum.FIN_MANT:
        return `Mantenimiento completado a las ${timeStr}`;
      default:
        return `Acción ${action} registrada a las ${timeStr}`;
    }
  };

  const handleRoomStatusChange = async (action: string) => {
    if (!room || !employee?.id) return;

    showBlockUI(`Actualizando habitación...`);

    const targetStatusName = getTargetStatusName(action);
    const targetStatus = roomStatuses.find((s) => s.name === targetStatusName);
    const disponibleId = roomStatuses.find(
      (s) => s.name === RoomStatusEnum.DISPONIBLE,
    )?.id;

    if (!targetStatus) {
      showBlockUI("Error al encontrar el estado de la habitación");
      return;
    }

    try {
      const id = isHabitacion
        ? { room_id: room.id }
        : { accommodation_type_id: accommodationType.id };

      await createRecord.mutateAsync({
        ...id,
        previous_status_id: activeStay?.room_status_id ?? disponibleId,
        new_status_id: targetStatus.id,
        employee_id: employee.id,
        action_type: action,
        observation: getObservation(action),
      });

      roomsApi.updateStatus(room.id, targetStatus.id, date);
      refectCalendar();
      onHide();
    } catch (error: any) {
      showBlockUI("Error al actualizar estado: " + error.message);
    }
  };

  if (!activeStay || accommodationType) {
    return (
      <ActionsButtons
        accommodationTypeEnum={accommodationTypeEnum}
        handleRoomStatusChange={handleRoomStatusChange}
        onGoToCheckIn={handleGoToCheckIn}
        onGoToBooking={handleGoToBooking}
      />
    );
  }
  return <div></div>;
};

interface ActionsButtons {
  handleRoomStatusChange: (action: string) => Promise<void>;
  accommodationTypeEnum: AccommodationTypeEnum;
  onGoToCheckIn: () => void;
  onGoToBooking: () => void;
}

const ActionsButtons = ({
  handleRoomStatusChange,
  accommodationTypeEnum,
  onGoToCheckIn,
  onGoToBooking,
}: ActionsButtons) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        label="Check-in"
        className="bg-[#ff3d47] border-none text-white font-black py-4 rounded-2xl shadow-sm"
        onClick={onGoToCheckIn}
      />
      <Button
        label="Reservar"
        className="bg-[#f9b000] border-none text-white font-black py-4 rounded-2xl shadow-sm"
        onClick={onGoToBooking}
      />
      <Button
        label="Limpieza"
        className="bg-[#2d79ff] border-none text-white font-black py-4 rounded-2xl shadow-sm"
        hidden={accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO}
        onClick={() => handleRoomStatusChange(RoomActionEnum.LIMPIEZA)}
      />
      <Button
        label="Mant."
        className="bg-[#6e7687] border-none text-white font-black py-4 rounded-2xl shadow-sm"
        hidden={accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO}
        onClick={() => handleRoomStatusChange(RoomActionEnum.MANTENIMIENTO)}
      />
    </div>
  );
};
