import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import {
  RoomStatusEnum,
  RoomActionEnum,
  AccommodationTypeEnum,
} from "@/util/status-rooms.enum";
import { AccommodationType, Room, RoomStatus, Stay } from "@/types";
import dayjs from "dayjs";
import { TaskCompletionForm } from "@/components/tasks/TaskCompletionForm";
import { StayInfoCard } from "@/components/forms/StayInfoCard";
import { RoomStatusForm } from "@/components/forms/RoomStatusForm";
import { RoomActionModalContent } from "./RoomActionModalContent";
import { useNavigate } from "react-router-dom";
import { UseQueryResult } from "@tanstack/react-query";

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
  // pendingAction: string | null;
  // formEmployeeId: string;
  // formObservation: string;
  // taskEmployees: any[];
  // onEmployeeChange: (value: string) => void;
  // onObservationChange: (value: string) => void;
  // onGoToCheckIn: () => void;
  // onGoToBooking: () => void;
  // onGoToCheckOut: () => void;
  // onRoomStatusChange: (action: string) => void;
  // onRoomStatusUpdate: (action: string) => void;
  // onCheckInAction: () => void;
  // onConfirmCheckIn: () => void;
  // checkInObservation: string;
  // onCheckInObservationChange: (value: string) => void;
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
  // room,
  // selectedDate,
  // activeStay,
  // pendingAction,
  // formEmployeeId,
  // formObservation,
  // taskEmployees,
  // onEmployeeChange,
  // onObservationChange,
  // onGoToCheckIn,
  // onGoToBooking,
  // onGoToCheckOut,
  // onRoomStatusChange,
  // onRoomStatusUpdate,
  // onCheckInAction,
  // onConfirmCheckIn,
  // checkInObservation,
  // onCheckInObservationChange,
}) => {
  const [accommodationTypeEnum, setAccommodationTypeEnum] =
    useState<AccommodationTypeEnum>(AccommodationTypeEnum.HABITACION);

  console.log(room);

  const modalHeader = (
    <div className="flex items-center gap-3">
      <i className="pi pi-building text-2xl text-gray-700"></i>
      <span className="text-2xl font-black text-gray-800 tracking-tight">
        {/* Habitacion {room?.room_number} */}
      </span>
    </div>
  );

  // const getReservationPaymentStatus = (stay: Stay | null) => {
  //   if (!stay)
  //     return {
  //       isFullyPaid: false,
  //       pendingAmount: 0,
  //       canCheckIn: false,
  //       needsPayment: false,
  //     };

  //   const isFullyPaid = (stay.paid_amount || 0) >= (stay.total_price || 0);
  //   const pendingAmount = (stay.total_price || 0) - (stay.paid_amount || 0);

  //   return {
  //     isFullyPaid,
  //     pendingAmount,
  //     canCheckIn: isFullyPaid,
  //     needsPayment: !isFullyPaid,
  //   };
  // };

  // const renderModalActions = () => {
  //   const isDate =
  //     dayjs(selectedDate).format("YYYY-MM-DD") === room?.status_date;
  //   const paymentStatus = getReservationPaymentStatus(activeStay);

  //   if (activeStay) {
  //     return (
  //       <div className="flex flex-col gap-4">
  //         <StayInfoCard
  //           activeStay={activeStay}
  //           onGoToCheckOut={onGoToCheckOut}
  //           checkInObservation={checkInObservation}
  //           onCheckInObservationChange={onCheckInObservationChange}
  //           paymentStatus={paymentStatus}
  //           onCheckInAction={onCheckInAction}
  //           onConfirmCheckIn={onConfirmCheckIn}
  //         />
  //       </div>
  //     );
  //   }

  //   if (room?.status?.name === RoomStatusEnum.LIMPIEZA && isDate) {
  //     return (
  //       <RoomStatusForm
  //         onSubmit={() => onRoomStatusUpdate(RoomActionEnum.FIN_LIMPIEZA)}
  //         onObservationChange={onObservationChange}
  //         onEmployeeChange={onEmployeeChange}
  //         selectedEmployeeId={formEmployeeId}
  //         observation={formObservation}
  //         employees={taskEmployees}
  //         placeholder="Notas sobre la limpieza..."
  //         submitLabel="Finalizar Limpieza"
  //         actionColor="blue"
  //       />
  //     );
  //   }

  //   if (room?.status?.name === RoomStatusEnum.MANTENIMIENTO && isDate) {
  //     return (
  //       <RoomStatusForm
  //         onSubmit={() => onRoomStatusUpdate(RoomActionEnum.FIN_MANT)}
  //         onObservationChange={onObservationChange}
  //         onEmployeeChange={onEmployeeChange}
  //         selectedEmployeeId={formEmployeeId}
  //         observation={formObservation}
  //         employees={taskEmployees}
  //         placeholder="Notas sobre el mantenimiento..."
  //         submitLabel="Finalizar Mantenimiento"
  //         actionColor="gray"
  //       />
  //     );
  //   }

  //   return (
  //     <div className="grid grid-cols-2 gap-4">
  //       <Button
  //         label="Check-in"
  //         className="bg-[#ff3d47] border-none text-white font-black py-4 rounded-2xl shadow-sm"
  //         onClick={onGoToCheckIn}
  //       />
  //       <Button
  //         label="Reservar"
  //         className="bg-[#f9b000] border-none text-white font-black py-4 rounded-2xl shadow-sm"
  //         onClick={onGoToBooking}
  //       />
  //       <Button
  //         label="Limpieza"
  //         className="bg-[#2d79ff] border-none text-white font-black py-4 rounded-2xl shadow-sm"
  //         onClick={() => onRoomStatusChange(RoomActionEnum.LIMPIEZA)}
  //       />
  //       <Button
  //         label="Mant."
  //         className="bg-[#6e7687] border-none text-white font-black py-4 rounded-2xl shadow-sm"
  //         onClick={() => onRoomStatusChange(RoomActionEnum.MANTENIMIENTO)}
  //       />
  //     </div>
  //   );
  // };

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
          value={accommodationTypeEnum}
          onChange={(e) => setAccommodationTypeEnum(e.value)}
          placeholder="Seleccionar tipo"
          className="w-full"
        />

        <div className="flex items-center gap-2 -mt-2">
          <Tag
            value={"askndjmjas"}
            severity={
              activeStay
                ? activeStay.status === "Active"
                  ? "danger"
                  : "warning"
                : room?.status?.name === RoomStatusEnum.LIMPIEZA
                  ? "info"
                  : room?.status?.name === RoomStatusEnum.MANTENIMIENTO
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
                {dayjs(date).format("YYYY-MM-DD")}
              </span>
            </p>
            <p>
              Habitación:{" "}
              <span className="font-bold text-gray-800">
                {room?.room_number} ({room?.category})
              </span>
            </p>
          </div>
        </div>
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
