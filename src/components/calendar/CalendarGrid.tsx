import { CalendarMobile } from "@/components/calendar/CalendarMobile";
import { CalendarTable } from "@/components/calendar/CalendarTable";
import { RoomActionModal } from "@/components/calendar/RoomActionModal";
import { RoomOccupiedModal } from "@/components/calendar/RoomOccupiedModal";
import { StayInactiveModal } from "@/components/calendar/StayInactiveModal";
import { RoomActionModalHeaderInfo } from "@/components/calendar/RoomActionModalHeaderInfo";
import { StayInfoCard } from "@/components/forms/StayInfoCard";
import { useBlockUI } from "@/context/BlockUIContext";
import { RoomsQueryCategory } from "@/hooks/useRooms";
import { AccommodationType, Room, RoomStatus, Stay } from "@/types";
import { AccommodationTypeEnum } from "@/util/enums/status-rooms.enum";
import { GetReservationPaymentStatus } from "@/util/helper/helpers";
import dayjs from "dayjs";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CalendarGridProps {
  accommodationType: AccommodationType;
  roomStatuses: RoomStatus[];
  activeTab: number;
  days: Date[];
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  accommodationType,
  roomStatuses,
  activeTab,
  days,
}) => {
  const {
    data,
    isLoading,
    refetch: refectCalendar,
  } = RoomsQueryCategory(accommodationType.id);
  const { hideBlockUI, showBlockUI } = useBlockUI();

  const navigate = useNavigate();

  const [showAbonoCheckOutModal, setShowAbonoCheckOutModal] = useState(false);
  const [showOccupiedModal, setShowOccupiedModal] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStay, setActiveStay] = useState<Stay | null>(null);
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

  const handleRoomClick = async (
    roomC: Room,
    date: Date,
    stay: Stay | null,
  ) => {
    setRoom(roomC);
    setSelectedDate(date);
    setActiveStay(stay);

    // Si hay un stay inactivo (finalizado)
    if (stay?.active === false) {
      setShowInactiveModal(true);
      return;
    }

    // Si hay una estadía activa (habitación ocupada)
    if (stay?.status === "Active") {
      setShowOccupiedModal(true);
      return;
    }

    // Si hay una reserva (origin_was_reservation)
    if (stay?.origin_was_reservation) {
      setShowAbonoCheckOutModal(true);
      return;
    }

    return setShowActionModal(true);
  };

  const handleGoToCheckOut = () => {
    const id = activeStay?.id;

    const accommodationTypeEnum = activeStay?.room_id
      ? AccommodationTypeEnum.HABITACION
      : AccommodationTypeEnum.APARTAMENTO;

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

      {/* Vista mobile del calendario */}
      <CalendarMobile
        data={data ?? []}
        days={days}
        getActiveStay={getActiveStay}
      />

      {/* Modal para habitaciones disponibles (Check-in / Reservar) */}
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

      {/* Modal para habitaciones ocupadas (Check-out) */}
      <RoomOccupiedModal
        visible={showOccupiedModal}
        onHide={() => setShowOccupiedModal(false)}
        stay={activeStay}
        room={room}
        accommodationType={accommodationType}
        date={selectedDate}
        activeTab={activeTab}
      />

      {/* Modal para stays inactivos (Ver orden / Limpieza / Mantenimiento) */}
      <StayInactiveModal
        visible={showInactiveModal}
        onHide={() => setShowInactiveModal(false)}
        stay={activeStay}
        room={room}
        accommodationType={accommodationType}
        date={selectedDate}
        activeTab={activeTab}
      />

      {/* Modal para reservas (Abonar / Check-in) */}
      <Dialog
        header={
          paymentStatus?.canCheckIn
            ? "Reserva"
            : "Abonar reserva"
        }
        visible={showAbonoCheckOutModal}
        onHide={() => setShowAbonoCheckOutModal(false)}
        className="w-full max-w-[500px]"
        breakpoints={{ "960px": "90vw", "641px": "95vw" }}
        dismissableMask
      >
        <div className="flex flex-col gap-5 py-2">
          <RoomActionModalHeaderInfo
            accommodationTypeEnum={room ? AccommodationTypeEnum.HABITACION : AccommodationTypeEnum.APARTAMENTO}
            date={selectedDate}
            room={room}
          />
          <StayInfoCard
            onConfirmCheckIn={handleCheckInAction}
            onCheckInAction={handleCheckInAction}
            onGoToCheckOut={handleGoToCheckOut}
            activeStay={activeStay}
            selectedDate={selectedDate}
            activeTab={activeTab}
            room={room}
          />
        </div>
      </Dialog>
    </section>
  );
};
