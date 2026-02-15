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
} from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import { Button } from "primereact/button";

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
  activeStay,
  accommodationTypeEnum,
  accommodationType,
  roomStatuses,
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
    const queryParams = [...params];
    if (activeStay?.id) {
      queryParams.push(`stay_id=${activeStay.id}`);
    }
    const url = `/check-in/${id}?${queryParams.join("&")}`;
    navigate(url);
  };

  const handleGoToBooking = () => {
    const queryParams = [...params];
    if (activeStay?.id) {
      queryParams.push(`stay_id=${activeStay.id}`);
    }
    const url = `/booking/${id}?${queryParams.join("&")}`;
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
        activeStay={activeStay}
        room={room}
        accommodationType={accommodationType}
        activeTab={activeTab}
        date={date}
      />
    );
  }
  return <div></div>;
};

interface ActionsButtonsProps {
  handleRoomStatusChange: (action: string) => Promise<void>;
  accommodationTypeEnum: AccommodationTypeEnum;
  onGoToCheckIn: () => void;
  onGoToBooking: () => void;
  activeStay?: Stay | null;
  room?: Room;
  accommodationType?: AccommodationType;
  activeTab: number;
  date: Date | null;
}

const ActionsButtons = ({
  handleRoomStatusChange,
  accommodationTypeEnum,
  onGoToCheckIn,
  onGoToBooking,
  activeStay,
  room,
  accommodationType,
  activeTab,
  date,
}: ActionsButtonsProps) => {
  const navigate = useNavigate();

  // Verificar si es el día actual
  const isToday = date && dayjs(date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");

  // Verificar si ya tiene limpieza realizada
  const hasCleaning = room?.cleaning_log && room.cleaning_log.length > 0;

  const handleLimpieza = () => {
    const roomId =
      accommodationTypeEnum === AccommodationTypeEnum.HABITACION
        ? room?.id
        : accommodationType?.id;

    if (!roomId) return;

    const queryParams = activeStay?.id
      ? `?stay_id=${activeStay.id}&tab=${activeTab}`
      : "";
    navigate(`/limpieza/${roomId}${queryParams}`);
  };

  const handleMantenimiento = () => {
    const roomId =
      accommodationTypeEnum === AccommodationTypeEnum.HABITACION
        ? room?.id
        : accommodationType?.id;

    if (!roomId) return;

    const queryParams = activeStay?.id
      ? `?stay_id=${activeStay.id}&tab=${activeTab}`
      : "";
    navigate(`/mantenimiento/${roomId}${queryParams}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        icon="pi pi-sign-in"
        label="Check-in"
        className="p-3 bg-[#ff3d47] border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
        onClick={onGoToCheckIn}
      />
      <Button
        icon="pi pi-calendar"
        label="Reservar"
        className="p-3 bg-[#f9b000] border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
        onClick={onGoToBooking}
      />
      {/* Botones de Limpieza y Mantenimiento - solo visibles el día actual */}
      {isToday && (
        <>
          <Button
            icon="pi pi-sparkles"
            label={hasCleaning ? "Limpieza realizada" : "Limpieza"}
            className="p-3 bg-[#2d79ff] border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
            hidden={accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO}
            disabled={hasCleaning}
            onClick={handleLimpieza}
          />
          <Button
            icon="pi pi-wrench"
            label="Mantenimiento"
            className="p-3 bg-[#6e7687] border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
            hidden={accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO}
            onClick={handleMantenimiento}
          />
        </>
      )}
    </div>
  );
};
