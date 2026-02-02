import { useBlockUI } from "@/context/BlockUIContext";
import { FetchEmployeesByRole } from "@/hooks/useEmployees";
import { RoomsQueryCtegory } from "@/hooks/useRooms";
import { useRoomsActions } from "@/hooks/useRoomsActions";
import { AccommodationType, Employee, Room, RoomStatus, Stay } from "@/types";
import {
  AccommodationTypeEnum,
  RoomActionEnum,
  RoomStatusEnum,
} from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StayInfoCard } from "@/components/forms/StayInfoCard";
import { TaskCompletionForm } from "@/components/tasks/TaskCompletionForm";
import { CalendarTable } from "@/components/calendar/CalendarTable";
import { RoomActionModal } from "@/components/calendar/RoomActionModal";
import { RoomActionModalHeaderInfo } from "@/components/calendar/RoomActionModalHeaderInfo";
import { GetReservationPaymentStatus } from "@/util/helper/helpers";

interface CalendarGridProps {
  getActiveStay: (room: Room, date: Date) => Stay | undefined;
  accommodationType: AccommodationType;
  refectCalendar: () => void;
  roomStatuses: RoomStatus[];
  activeTab: number;
  days: Date[];
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  accommodationType,
  roomStatuses,
  refectCalendar,
  activeTab,
  days,
}) => {
  const { data, isLoading } = RoomsQueryCtegory(accommodationType.id);
  const { hideBlockUI, showBlockUI } = useBlockUI();
  const { updateRoomStatus } = useRoomsActions();
  const navigate = useNavigate();

  const [showAbonoCheckOutModal, setShowAbonoCheckOutModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSecundaryModal, setShowSecundaryModal] = useState(false);
  const [formObservation, setFormObservation] = useState<string>("");
  const [activeStay, setActiveStay] = useState<Stay | null>(null);
  const [formEmployeeId, setFormEmployeeId] = useState<string>("");
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const paymentStatus = GetReservationPaymentStatus(activeStay);

  useEffect(() => {
    if (isLoading) {
      showBlockUI("Cargando habitaciones");
    } else {
      hideBlockUI();
    }
  }, [isLoading]);

  const getActiveStay = (room: Room, date: Date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return room.stays?.find(
      (s) => dateStr >= s.check_in_date && dateStr <= s.check_out_date,
    );
  };

  const getStatusActionDetails = (action: string) => {
    let targetStatusName = RoomStatusEnum.DISPONIBLE;
    let actionMessage = "";

    switch (action) {
      case RoomActionEnum.FIN_LIMPIEZA:
        targetStatusName = RoomStatusEnum.DISPONIBLE;
        actionMessage = "Limpieza finalizada, habitación disponible";
        break;
      case RoomActionEnum.FIN_MANT:
        targetStatusName = RoomStatusEnum.DISPONIBLE;
        actionMessage = "Mantenimiento completado, habitación disponible";
        break;
      case RoomActionEnum.LIMPIEZA:
        targetStatusName = RoomStatusEnum.LIMPIEZA;
        actionMessage = "Habitación en proceso de limpieza";
        break;
      case RoomActionEnum.MANTENIMIENTO:
        targetStatusName = RoomStatusEnum.MANTENIMIENTO;
        actionMessage = "Habitación en mantenimiento";
        break;
      default:
        actionMessage = "Estado actualizado";
    }

    return { targetStatusName, actionMessage };
  };

  const handleRoomStatusUpdate = async (room: Room, action: string) => {
    if (!room || !roomStatuses || !formEmployeeId) {
      showBlockUI("Debe seleccionar un responsable para esta acción");
      hideBlockUI();
      return;
    }

    showBlockUI(`Actualizando estado de la habitación...`);

    const { targetStatusName, actionMessage } = getStatusActionDetails(action);

    const targetStatus = roomStatuses.find((s) => s.name === targetStatusName);

    if (!targetStatus) {
      showBlockUI("Error: Estado de habitación no encontrado");
      hideBlockUI();
      return;
    }

    try {
      const currentTime = dayjs().format("YYYY-MM-DD HH:mm");

      await updateRoomStatus.mutateAsync({
        roomId: room.id,
        statusId: targetStatus.id,
        selectedDate: selectedDate || new Date(),
        employeeId: formEmployeeId,
        actionType: action,
        observation: formObservation
          ? `${formObservation} (finalizado a las ${currentTime})`
          : `${action} completado a las ${currentTime}`,
        previousStatusId: room.status_id,
      });

      showBlockUI(actionMessage);
      setFormObservation("");
      setFormEmployeeId("");
    } catch (error: any) {
      showBlockUI("Error al actualizar estado: " + error.message);
    } finally {
      hideBlockUI();
      refectCalendar();
      setShowSecundaryModal(false);
    }
  };

  const handleRoomClick = async (
    roomC: Room,
    date: Date,
    stay: Stay | null,
  ) => {
    setRoom(roomC);
    setSelectedDate(date);
    setActiveStay(stay);

    const isDate = dayjs(date).format("YYYY-MM-DD") === roomC?.status_date;

    const genericModalObservation = [
      RoomStatusEnum.MANTENIMIENTO,
      RoomStatusEnum.LIMPIEZA,
    ];

    const genericModalCheckOut = [
      RoomStatusEnum.RESERVADO,
      RoomStatusEnum.OCUPADO,
    ];

    const isGeneric = genericModalObservation.includes(
      roomC.status?.name as RoomStatusEnum,
    );

    const isCheckOut = genericModalCheckOut.includes(
      stay?.room_statuses?.name as RoomStatusEnum,
    );

    if (isCheckOut) {
      setShowAbonoCheckOutModal(true);
      return;
    }

    if (isGeneric && isDate) {
      showBlockUI("Cargando");
      const taskEmployees = await FetchEmployeesByRole(roomC.status?.name);
      setEmployeeList(taskEmployees);
      setShowSecundaryModal(true);
      hideBlockUI();
      return;
    }

    return setShowActionModal(true);
  };

  const handleGoToCheckOut = () => {
    const id = activeStay?.id;

    const accommodationTypeEnum = activeStay.accommodation_type_id
      ? AccommodationTypeEnum.APARTAMENTO
      : AccommodationTypeEnum.HABITACION;

    const params = [`tab=${activeTab}`, `action=${accommodationTypeEnum}`];
    const url = `/check-out/${id}?${params.join("&")}`;
    navigate(url);
  };

  const handleCheckInAction = () => {
    const params = [`tab=${activeTab}`];
    const url = `/check-in-payment/${activeStay?.id}?${params.join("&")}`;
    navigate(url);
  };

  return (
    <section>
      <CalendarTable
        data={data ?? []}
        days={days}
        getActiveStay={getActiveStay}
        handleRoomClick={handleRoomClick}
      />
      <RoomActionModal
        roomStatuses={roomStatuses}
        onHide={() => setShowActionModal(false)}
        accommodationType={accommodationType}
        visible={showActionModal}
        refectCalendar={() => refectCalendar()}
        activeStay={activeStay}
        activeTab={activeTab}
        date={selectedDate}
        room={room}
      />
      <Dialog
        header={
          room?.status?.name === RoomStatusEnum.LIMPIEZA
            ? "Finalizar Limpieza"
            : "Finalizar Mantenimiento"
        }
        visible={showSecundaryModal}
        onHide={() => setShowSecundaryModal(false)}
        className="w-full max-w-xl"
      >
        <div className="flex flex-col gap-5 py-2">
          <RoomActionModalHeaderInfo
            accommodationTypeEnum={AccommodationTypeEnum.HABITACION}
            date={selectedDate}
            room={room}
          />
          <TaskCompletionForm
            onSubmit={() =>
              handleRoomStatusUpdate(
                room,
                room?.status?.name === RoomStatusEnum.LIMPIEZA
                  ? RoomActionEnum.FIN_LIMPIEZA
                  : RoomActionEnum.FIN_MANT,
              )
            }
            onObservationChange={setFormObservation}
            onEmployeeChange={setFormEmployeeId}
            selectedEmployeeId={formEmployeeId}
            observation={formObservation}
            employees={employeeList}
            placeholder={
              room?.status?.name === RoomStatusEnum.LIMPIEZA
                ? "Notas sobre la limpieza..."
                : "Notas sobre el mantenimiento..."
            }
            submitLabel={
              room?.status?.name === RoomStatusEnum.LIMPIEZA
                ? "Finalizar Limpieza"
                : "Finalizar Mantenimiento"
            }
            actionColor={room?.status?.color}
          />
        </div>
      </Dialog>

      <Dialog
        header={
          paymentStatus?.canCheckIn ? "Check-in reserva" : "Abonar reserva"
        }
        visible={showAbonoCheckOutModal}
        onHide={() => setShowAbonoCheckOutModal(false)}
        className="w-full max-w-xl"
      >
        <div className="flex flex-col gap-5 py-2">
          <RoomActionModalHeaderInfo
            accommodationTypeEnum={AccommodationTypeEnum.HABITACION}
            date={selectedDate}
            room={room}
          />
          <StayInfoCard
            onConfirmCheckIn={handleCheckInAction}
            onCheckInAction={handleCheckInAction}
            onGoToCheckOut={handleGoToCheckOut}
            activeStay={activeStay}
          />
        </div>
      </Dialog>
    </section>
  );
};
