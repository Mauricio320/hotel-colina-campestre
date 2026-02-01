import React from "react";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { RoomStatusEnum, RoomActionEnum } from "@/util/status-rooms.enum";
import { Room, Stay } from "@/types";
import dayjs from "dayjs";
import { TaskCompletionForm } from "@/components/tasks/TaskCompletionForm";
import { StayInfoCard } from "@/components/forms/StayInfoCard";
import { RoomStatusForm } from "@/components/forms/RoomStatusForm";

interface RoomActionModalProps {
  visible: boolean;
  onHide: () => void;
  selectedRoom: Room | null;
  selectedDate: Date | null;
  activeStay: Stay | null;
  pendingAction: string | null;
  formEmployeeId: string;
  formObservation: string;
  taskEmployees: any[];
  onEmployeeChange: (value: string) => void;
  onObservationChange: (value: string) => void;
  onGoToCheckIn: () => void;
  onGoToBooking: () => void;
  onGoToCheckOut: () => void;
  onRoomStatusChange: (action: string) => void;
  onRoomStatusUpdate: (action: string) => void;
  onCheckInAction: () => void;
  onConfirmCheckIn: () => void;
  checkInObservation: string;
  onCheckInObservationChange: (value: string) => void;
}

export const RoomActionModalB: React.FC<RoomActionModalProps> = ({
  visible,
  onHide,
  selectedRoom,
  selectedDate,
  activeStay,
  pendingAction,
  formEmployeeId,
  formObservation,
  taskEmployees,
  onEmployeeChange,
  onObservationChange,
  onGoToCheckIn,
  onGoToBooking,
  onGoToCheckOut,
  onRoomStatusChange,
  onRoomStatusUpdate,
  onCheckInAction,
  onConfirmCheckIn,
  checkInObservation,
  onCheckInObservationChange,
}) => {
  const modalHeader = (
    <div className="flex items-center gap-3">
      <i className="pi pi-building text-2xl text-gray-700"></i>
      <span className="text-2xl font-black text-gray-800 tracking-tight">
        Habitacion {selectedRoom?.room_number}
      </span>
    </div>
  );

  console.log({ activeStay });

  const getReservationPaymentStatus = (stay: Stay | null) => {
    if (!stay)
      return {
        isFullyPaid: false,
        pendingAmount: 0,
        canCheckIn: false,
        needsPayment: false,
      };

    const isFullyPaid = (stay.paid_amount || 0) >= (stay.total_price || 0);
    const pendingAmount = (stay.total_price || 0) - (stay.paid_amount || 0);

    return {
      isFullyPaid,
      pendingAmount,
      canCheckIn: isFullyPaid,
      needsPayment: !isFullyPaid,
    };
  };

  const renderModalActions = () => {
    const isDate =
      dayjs(selectedDate).format("YYYY-MM-DD") === selectedRoom?.status_date;
    const paymentStatus = getReservationPaymentStatus(activeStay);

    if (activeStay) {
      return (
        <div className="flex flex-col gap-4">
          <StayInfoCard
            activeStay={activeStay}
            onGoToCheckOut={onGoToCheckOut}
            checkInObservation={checkInObservation}
            onCheckInObservationChange={onCheckInObservationChange}
            paymentStatus={paymentStatus}
            onCheckInAction={onCheckInAction}
            onConfirmCheckIn={onConfirmCheckIn}
          />
        </div>
      );
    }

    if (selectedRoom?.status?.name === RoomStatusEnum.LIMPIEZA && isDate) {
      return (
        <RoomStatusForm
          onSubmit={() => onRoomStatusUpdate(RoomActionEnum.FIN_LIMPIEZA)}
          onObservationChange={onObservationChange}
          onEmployeeChange={onEmployeeChange}
          selectedEmployeeId={formEmployeeId}
          observation={formObservation}
          employees={taskEmployees}
          placeholder="Notas sobre la limpieza..."
          submitLabel="Finalizar Limpieza"
          actionColor="blue"
        />
      );
    }

    if (selectedRoom?.status?.name === RoomStatusEnum.MANTENIMIENTO && isDate) {
      return (
        <RoomStatusForm
          onSubmit={() => onRoomStatusUpdate(RoomActionEnum.FIN_MANT)}
          onObservationChange={onObservationChange}
          onEmployeeChange={onEmployeeChange}
          selectedEmployeeId={formEmployeeId}
          observation={formObservation}
          employees={taskEmployees}
          placeholder="Notas sobre el mantenimiento..."
          submitLabel="Finalizar Mantenimiento"
          actionColor="gray"
        />
      );
    }

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
          onClick={() => onRoomStatusChange(RoomActionEnum.LIMPIEZA)}
        />
        <Button
          label="Mant."
          className="bg-[#6e7687] border-none text-white font-black py-4 rounded-2xl shadow-sm"
          onClick={() => onRoomStatusChange(RoomActionEnum.MANTENIMIENTO)}
        />
      </div>
    );
  };

  return (
    <Dialog
      header={modalHeader}
      visible={visible}
      onHide={onHide}
      className="w-full max-w-xl"
    >
      <div className="flex flex-col gap-5 py-2">
        {!pendingAction && (
          <>
            <div className="flex items-center gap-2 -mt-2">
              <Tag
                value={
                  activeStay
                    ? activeStay.status === "Active"
                      ? RoomStatusEnum.OCUPADO
                      : RoomStatusEnum.RESERVED
                    : selectedRoom?.status?.name || RoomStatusEnum.DISPONIBLE
                }
                severity={
                  activeStay
                    ? activeStay.status === "Active"
                      ? "danger"
                      : "warning"
                    : selectedRoom?.status?.name === RoomStatusEnum.LIMPIEZA
                      ? "info"
                      : selectedRoom?.status?.name ===
                          RoomStatusEnum.MANTENIMIENTO
                        ? "secondary"
                        : "success"
                }
                className="px-3 py-1 font-bold text-xs"
              />
            </div>

            <div className="bg-[#fdf8f1] p-6 rounded-2xl border border-orange-100/50 shadow-sm">
              <div className="flex flex-col gap-2 text-gray-600 text-base font-medium">
                <p>
                  Fecha seleccionada:{" "}
                  <span className="font-bold text-emerald-600">
                    {dayjs(selectedDate).format("YYYY-MM-DD")}
                  </span>
                </p>
                <p>
                  Habitación:{" "}
                  <span className="font-bold text-gray-800">
                    {selectedRoom?.room_number} ({selectedRoom?.category})
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
        {renderModalActions()}
      </div>
    </Dialog>
  );
};
