import { AccommodationType, Room, RoomStatus, Stay } from "@/types";
import { AccommodationTypeEnum, RoomActionEnum } from "@/util/enums/status-rooms.enum";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import React, { useState, useMemo, useCallback } from "react";
import { RoomActionModalHeaderInfo } from "@/components/calendar/RoomActionModalHeaderInfo";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { StayInfoCard } from "../forms/StayInfoCard";
import { GetReservationPaymentStatus } from "@/util/helper/helpers";

interface RoomActionModalProps {
  visible: boolean;
  onHide: () => void;
  accommodationType?: AccommodationType;
  room?: Room;
  date: Date | null;
  activeStay?: Stay;
  activeTab: number;
  action: RoomActionEnum;
  onConfirmCheckIn: () => void;
  onCheckInAction: () => void;
  onGoToCheckOut: () => void;
}

interface ActionButtonConfig {
  icon: string;
  label: string;
  className: string;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

const BASE_BUTTON_CLASSES =
  "flex h-auto flex-col items-center gap-1 rounded-xl border-none p-3 font-bold text-white shadow-sm";

export const RoomActionModal: React.FC<RoomActionModalProps> = ({
  onConfirmCheckIn,
  accommodationType,
  onCheckInAction,
  onGoToCheckOut,
  activeTab,
  activeStay,
  visible,
  onHide,
  action,
  room,
  date,
}) => {
  const [selectedAccommodationType, setSelectedAccommodationType] = useState<AccommodationTypeEnum>(
    AccommodationTypeEnum.HABITACION
  );
  const paymentStatus = GetReservationPaymentStatus(activeStay);
  const navigate = useNavigate();

  const isRoom = selectedAccommodationType === AccommodationTypeEnum.HABITACION;
  const isToday = date && !dayjs(date).isAfter(dayjs(), "day");
  const hasCleaning = room?.cleaning_log && room.cleaning_log.length > 0;

  const accommodationId = useMemo(() => {
    return isRoom ? room?.id : accommodationType?.id;
  }, [isRoom, room?.id, accommodationType?.id]);

  const buildUrlWithParams = useCallback(
    (basePath: string, additionalParams: string[] = []) => {
      const queryParams = [
        `date=${dayjs(date).format("YYYY-MM-DD")}`,
        `tab=${activeTab}`,
        `action=${selectedAccommodationType}`,
        ...additionalParams,
      ];
      if (activeStay?.id) queryParams.push(`stay_id=${activeStay.id}`);
      return `${basePath}/${accommodationId}?${queryParams.join("&")}`;
    },
    [date, activeTab, selectedAccommodationType, activeStay?.id, accommodationId]
  );

  const navigateToMaintenanceTask = useCallback(() => {
    if (!accommodationId) return;
    const queryParams = activeStay?.id ? `?stay_id=${activeStay.id}&tab=${activeTab}` : "";
    navigate(`/mantenimiento/${accommodationId}${queryParams}`);
  }, [accommodationId, activeStay?.id, activeTab, navigate]);

  const navigateToCleaningTask = useCallback(() => {
    if (!accommodationId) return;
    const queryParams = activeStay?.id ? `?stay_id=${activeStay.id}&tab=${activeTab}` : "";
    navigate(`/limpieza/${accommodationId}${queryParams}`);
  }, [accommodationId, activeStay?.id, activeTab, navigate]);

  const navigateToCheckIn = useCallback(() => {
    navigate(buildUrlWithParams("/check-in"));
  }, [buildUrlWithParams, navigate]);

  const navigateToBooking = useCallback(() => {
    navigate(buildUrlWithParams("/booking"));
  }, [buildUrlWithParams, navigate]);

  const navigateToCancelReservation = useCallback(() => {
    navigate(`/cancelar-reserva/${activeStay?.id}?room_id=${activeStay?.room_id}&tab=${activeTab}`);
  }, [activeStay?.id, activeStay?.room_id, activeTab, navigate]);

  const navigateToMoveReservation = useCallback(() => {
    navigate(
      `/mover-reserva/${activeStay?.id}?room_id=${activeStay?.room_id}&accommodation_type_id=${activeStay?.room?.accommodation_type_id}&tab=${activeTab}`
    );
  }, [
    activeStay?.id,
    activeStay?.room_id,
    activeStay?.room?.accommodation_type_id,
    activeTab,
    navigate,
  ]);

  const navigateToInvoice = useCallback(() => {
    navigate(`/invoice/${activeStay?.id}`, {
      state: { from: location.pathname + location.search },
    });
  }, [activeStay?.id, navigate]);

  const managementButtons: ActionButtonConfig[] = useMemo(() => {
    const buttons: ActionButtonConfig[] = [
      {
        icon: "pi pi-calendar",
        label: "Reservar",
        className: "bg-amber-600 hover:bg-amber-700",
        onClick: navigateToBooking,
      },
    ];

    if (isToday) {
      buttons.unshift({
        icon: "pi pi-sign-in",
        label: "Check-in",
        className: "bg-amber-500 hover:bg-amber-600",
        onClick: navigateToCheckIn,
      });
    }

    return buttons;
  }, [isToday, navigateToBooking, navigateToCheckIn]);

  const bookingActionButton: ActionButtonConfig | null = useMemo(() => {
    if (activeStay?.status === "Active") {
      return {
        icon: "pi pi-sign-out",
        label: "Realizar Check-out",
        className: "bg-orange-600 hover:bg-orange-700",
        onClick: onGoToCheckOut,
      };
    }

    if (paymentStatus?.canCheckIn && isToday) {
      return {
        icon: "pi pi-sign-in",
        label: "Check-in",
        className: "bg-amber-500 hover:bg-amber-600",
        onClick: onConfirmCheckIn,
      };
    }

    if (!paymentStatus?.canCheckIn) {
      return {
        icon: "pi pi-dollar",
        label: "Abonar",
        className: "bg-yellow-600 hover:bg-yellow-700",
        onClick: onCheckInAction,
      };
    }

    return null;
  }, [
    activeStay?.status,
    paymentStatus?.canCheckIn,
    isToday,
    onGoToCheckOut,
    onConfirmCheckIn,
    onCheckInAction,
  ]);

  const renderActionButton = (button: ActionButtonConfig) => (
    <Button
      key={button.label}
      unstyled
      icon={button.icon}
      label={button.label}
      disabled={button.disabled}
      className={`${BASE_BUTTON_CLASSES} ${button.className} ${button.hidden ? "hidden" : ""}`}
      onClick={button.onClick}
    />
  );

  const modalHeader = (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
        <i className="pi pi-home text-xs text-gray-500"></i>
      </div>
      <span className="text-sm font-bold text-gray-800">Gestión Hab. {room?.room_number}</span>
    </div>
  );

  const dropdownOptions = useMemo(() => {
    return [
      { label: "Habitación", value: AccommodationTypeEnum.HABITACION },
      { label: accommodationType?.name || "Apartamento", value: AccommodationTypeEnum.APARTAMENTO },
    ];
  }, [accommodationType?.name]);

  return (
    <Dialog
      header={modalHeader}
      visible={visible}
      onHide={onHide}
      className="w-full max-w-125"
      breakpoints={{ "960px": "90vw", "641px": "95vw" }}
      dismissableMask
    >
      <div className="flex flex-col gap-4 py-2">
        {action === RoomActionEnum.MANAGEMENT && (
          <Dropdown
            options={dropdownOptions}
            disabled={!accommodationType?.is_rentable}
            value={selectedAccommodationType}
            onChange={(e) => setSelectedAccommodationType(e.value)}
            placeholder="Seleccionar tipo"
            className="w-full"
          />
        )}

        <RoomActionModalHeaderInfo
          accommodationTypeEnum={selectedAccommodationType}
          room={room}
          date={date}
        />

        {action !== RoomActionEnum.MANAGEMENT && <StayInfoCard activeStay={activeStay} />}

        {action === RoomActionEnum.MANAGEMENT && (
          <div className={`grid gap-3 ${isToday ? "grid-cols-2" : "grid-cols-1"}`}>
            {managementButtons.map(renderActionButton)}
          </div>
        )}

        {action === RoomActionEnum.BOOKING && bookingActionButton && (
          <div className="grid grid-cols-1 gap-3">{renderActionButton(bookingActionButton)}</div>
        )}

        {action === RoomActionEnum.CHECK_IN && (
          <div className="grid grid-cols-1 gap-3">
            {renderActionButton({
              icon: "pi pi-sign-out",
              label: "Realizar Check-out",
              className: "bg-orange-600 hover:bg-orange-700",
              onClick: onGoToCheckOut,
            })}
          </div>
        )}

        {isToday && (
          <div className="grid grid-cols-2 gap-3">
            {renderActionButton({
              icon: "pi pi-sparkles",
              label: hasCleaning ? "Limpieza realizada" : "Limpieza",
              className: "bg-slate-500 hover:bg-slate-600",
              onClick: navigateToCleaningTask,
              disabled: hasCleaning,
            })}
            {renderActionButton({
              icon: "pi pi-wrench",
              label: "Mantenimiento",
              className: "bg-slate-600 hover:bg-slate-700",
              onClick: navigateToMaintenanceTask,
            })}
          </div>
        )}

        {action === RoomActionEnum.BOOKING && activeStay?.origin_was_reservation && (
          <div className="grid grid-cols-2 gap-3">
            {renderActionButton({
              icon: "pi pi-calendar-plus",
              label: "Mover Reserva",
              className: "bg-blue-600 hover:bg-blue-700",
              onClick: navigateToMoveReservation,
            })}
          </div>
        )}

        {activeStay && (
          <div className="grid grid-cols-2 gap-3">
            {renderActionButton({
              icon: "pi pi-file",
              label: "Ver Orden",
              className: "bg-blue-600 hover:bg-blue-700",
              onClick: navigateToInvoice,
            })}
            {renderActionButton({
              icon: "pi pi-times-circle",
              label: "Cancelar estadía",
              className: "bg-red-600 hover:bg-red-700",
              onClick: navigateToCancelReservation,
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
};
