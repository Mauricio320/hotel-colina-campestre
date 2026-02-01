import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CheckInModal } from "@/components/calendar/CheckInModal";
import { PaymentModal } from "@/components/calendar/PaymentModal";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonUI } from "@/components/ui/SkeletonUI";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useReservationStatus } from "@/hooks/useReservationStatus";
import { useRooms } from "@/hooks/useRooms";
import { useRoomsActions } from "@/hooks/useRoomsActions";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useStays } from "@/hooks/useStays";
import { useStaysActions } from "@/hooks/useStaysActions";
import { useStaysCheckInActions } from "@/hooks/useStaysCheckInActions";
import { useUrlParams } from "@/hooks/useUrlParams";
import { Room, Stay } from "@/types";
import { RoomActionEnum, RoomStatusEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CalendarView: React.FC = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employee: currentEmployee } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().toDate());

  const { roomsQuery } = useRooms();
  const { staysQuery } = useStays();
  const { registerPayment, registerCheckInReserva } = useStaysActions();
  const { performCheckIn } = useStaysCheckInActions();
  const { employeesQuery } = useEmployees();
  const roomStatuses = useRoomStatuses();
  const paymentMethods = usePaymentMethods();
  const { updateRoomStatus } = useRoomsActions();
  const { parseTabParam, scrollToTabView } = useUrlParams();
  const { getPaymentStatus } = useReservationStatus();
  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStay, setActiveStay] = useState<Stay | null>(null);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const [formEmployeeId, setFormEmployeeId] = useState<string>("");
  const [formObservation, setFormObservation] = useState<string>("");
  const [checkInObservation, setCheckInObservation] = useState<string>("");
  const [newPaymentAmount, setNewPaymentAmount] = useState(0);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const isLoading =
    (roomsQuery.isLoading && !roomsQuery.data) ||
    (staysQuery.isLoading && !staysQuery.data) ||
    roomStatuses.isLoading ||
    paymentMethods.fetchAll.isLoading ||
    accommodationTypesQuery.isLoading;

  const isError = roomsQuery.isError || staysQuery.isError;

  const isPaymentMethodValid = paymentMethods.fetchAll.data?.some(
    (pm) => pm.id === paymentMethodId,
  );

  useEffect(() => {
    isLoading ? showBlockUI(`Cargando Calendario`) : hideBlockUI();
  }, [isLoading]);

  useEffect(() => {
    const tabIndex = parseTabParam(accommodationTypesQuery.data?.length || 0);
    if (tabIndex !== 0) {
      setActiveTab(tabIndex);
      scrollToTabView();
    }
  }, [accommodationTypesQuery.data]);

  useEffect(() => {
    if (
      paymentMethods.fetchAll.data &&
      paymentMethods.fetchAll.data.length > 0
    ) {
      setPaymentMethodId(paymentMethods.fetchAll.data[0].id);
    }
  }, [paymentMethods.fetchAll.data]);

  const filteredRooms = useMemo(() => {
    const activeType = accommodationTypesQuery.data?.[activeTab];
    return (roomsQuery.data || []).filter(
      (r) => r.accommodation_type_id === activeType?.id,
    );
  }, [roomsQuery.data, accommodationTypesQuery.data, activeTab]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      return dayjs(startDate).add(i, "day").toDate();
    });
  }, [startDate]);

  const getActiveStay = (room: Room, date: Date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return staysQuery.data?.find(
      (s) =>
        s.room_id === room.id &&
        dateStr >= s.check_in_date &&
        dateStr <= s.check_out_date &&
        (s.status === "Active" || s.status === "Reserved"),
    );
  };

  const handleRoomClick = (room: Room, stay: Stay | null, date: Date) => {
    setSelectedRoom(room);
    setActiveStay(stay || null);
    setSelectedDate(date);
    setFormEmployeeId(currentEmployee?.id || "");
    setFormObservation("");
    setShowMainModal(true);
  };

  const handleRoomStatusChange = async (action: string) => {
    if (!selectedRoom || !roomStatuses || !currentEmployee?.id) return;

    showBlockUI(`Actualizando estado de la habitación...`);

    let targetStatusName = RoomStatusEnum.DISPONIBLE;
    if (action === RoomActionEnum.LIMPIEZA)
      targetStatusName = RoomStatusEnum.LIMPIEZA;
    if (action === RoomActionEnum.MANTENIMIENTO)
      targetStatusName = RoomStatusEnum.MANTENIMIENTO;

    const targetStatus = roomStatuses.data.find(
      (s) => s.name === targetStatusName,
    );

    if (!targetStatus) {
      showBlockUI("Error: Estado de habitación no encontrado");
      hideBlockUI();
      return;
    }

    try {
      const timeStr = dayjs().format("hh:mm A");
      let defaultObservation = "";
      switch (action) {
        case RoomActionEnum.LIMPIEZA:
          defaultObservation = `Inicio de limpieza registrado el ${dayjs(selectedDate).format("YYYY-MM-DD")} a las ${timeStr}`;
          break;
        case RoomActionEnum.FIN_LIMPIEZA:
          defaultObservation = `Limpieza finalizada exitosamente a las ${timeStr}`;
          break;
        case RoomActionEnum.MANTENIMIENTO:
          defaultObservation = `Mantenimiento iniciado el ${dayjs(selectedDate).format("YYYY-MM-DD")} a las ${timeStr}`;
          break;
        case RoomActionEnum.FIN_MANT:
          defaultObservation = `Mantenimiento completado a las ${timeStr}`;
          break;
        default:
          defaultObservation = `Acción ${action} registrada a las ${timeStr}`;
      }

      await updateRoomStatus.mutateAsync({
        roomId: selectedRoom.id,
        statusId: targetStatus.id,
        selectedDate: selectedDate || new Date(),
        employeeId: currentEmployee.id,
        actionType: action,
        observation: defaultObservation,
        previousStatusId: selectedRoom.status_id,
      });

      showBlockUI(`Estado actualizado a: ${targetStatusName}`);
      setShowMainModal(false);
      roomsQuery.refetch();
    } catch (error: any) {
      showBlockUI("Error al actualizar estado: " + error.message);
    } finally {
      hideBlockUI();
    }
  };

  const handleRoomStatusUpdate = async (action: string) => {
    if (!selectedRoom || !roomStatuses.data || !formEmployeeId) {
      showBlockUI("Debe seleccionar un responsable para esta acción");
      hideBlockUI();
      return;
    }

    showBlockUI(`Actualizando estado de la habitación...`);

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

    const targetStatus = roomStatuses.data.find(
      (s) => s.name === targetStatusName,
    );

    if (!targetStatus) {
      showBlockUI("Error: Estado de habitación no encontrado");
      hideBlockUI();
      return;
    }

    try {
      const currentTime = dayjs().format("YYYY-MM-DD HH:mm");

      await updateRoomStatus.mutateAsync({
        roomId: selectedRoom.id,
        statusId: targetStatus.id,
        selectedDate: selectedDate || new Date(),
        employeeId: formEmployeeId,
        actionType: action,
        observation: formObservation
          ? `${formObservation} (finalizado a las ${currentTime})`
          : `${action} completado a las ${currentTime}`,
        previousStatusId: selectedRoom.status_id,
      });

      showBlockUI(actionMessage);
      setShowMainModal(false);
      roomsQuery.refetch();
    } catch (error: any) {
      showBlockUI("Error al actualizar estado: " + error.message);
    } finally {
      hideBlockUI();
    }
  };

  const handleCheckInAction = () => {
    if (!activeStay) return;
    const paymentStatus = getPaymentStatus(activeStay);

    if (paymentStatus.canCheckIn) {
      handleDirectCheckIn();
    } else {
      setNewPaymentAmount(paymentStatus.pendingAmount);
      setShowPaymentModal(true);
    }
  };

  const handleDirectCheckIn = async () => {
    if (!selectedRoom || !currentEmployee?.id) return;

    showBlockUI("Procesando check-in...");

    try {
      await performCheckIn.mutateAsync({
        stay: activeStay || undefined,
        roomId: selectedRoom.id,
        employeeId: currentEmployee.id,
        observation: checkInObservation,
        selectedDate: selectedDate || new Date(),
      });

      showBlockUI(
        "Check-in realizado exitosamente. Huésped alojado en habitación.",
      );
      setShowMainModal(false);
    } catch (error: any) {
      showBlockUI("Error al procesar check-in: " + error.message);
    } finally {
      hideBlockUI();
    }
  };

  const handleConfirmCheckIn = async () => {
    setShowCheckInModal(false);
    await handleDirectCheckIn();
  };

  const handleConfirmNewPayment = async () => {
    if (!activeStay || !selectedRoom || newPaymentAmount <= 0) {
      return;
    }

    if (!paymentMethodId) {
      showBlockUI("Por favor seleccione un método de pago válido");
      return;
    }

    try {
      setIsProcessingPayment(true);

      const isFullPayment =
        newPaymentAmount >= activeStay.total_price - activeStay.paid_amount;
      const customObservation = isFullPayment
        ? "Liquidación completa de reserva"
        : "Abono parcial";

      await registerPayment.mutateAsync({
        stayId: activeStay.id,
        roomId: selectedRoom.id,
        amount: newPaymentAmount,
        paymentMethodId: paymentMethodId,
        employeeId: currentEmployee?.id,
        customObservation,
      });

      if (activeStay) {
        const newPaidAmount = activeStay.paid_amount + newPaymentAmount;
        const newPendingAmount = activeStay.total_price - newPaidAmount;

        setActiveStay({
          ...activeStay,
          paid_amount: newPaidAmount,
        });
        setNewPaymentAmount(0);
        setShowPaymentModal(false);

        if (newPendingAmount <= 0) {
          showBlockUI(
            "Abono completado. Reserva fully pagada. Realice check-in para ocupar la habitación.",
          );
        } else {
          showBlockUI("Abono registrado correctamente. Queda saldo pendiente.");
        }
      }
    } catch (e: any) {
      showBlockUI("Error al registrar el pago: " + e.message);
    } finally {
      setIsProcessingPayment(false);
      hideBlockUI();
    }
  };

  const taskEmployees = useMemo(() => {
    const targetRole = selectedRoom?.status?.name;

    return (employeesQuery.data || []).filter(
      (emp) => emp.role?.name === targetRole,
    );
  }, [employeesQuery.data, selectedRoom?.status?.name]);

  const pendingAmount = getPaymentStatus(activeStay).pendingAmount;

  const handleGoToCheckIn = () =>
    selectedRoom &&
    navigate(
      `/check-in/${selectedRoom.id}?date=${dayjs(selectedDate).format("YYYY-MM-DD")}&tab=${activeTab}`,
    );
  const handleGoToBooking = () =>
    selectedRoom &&
    navigate(
      `/booking/${selectedRoom.id}?date=${dayjs(selectedDate).format("YYYY-MM-DD")}&tab=${activeTab}`,
    );
  const handleGoToCheckOut = () =>
    activeStay &&
    navigate(`/check-out/${selectedRoom?.id}?stayId=${activeStay.id}`);

  if (isLoading) return <SkeletonUI />;

  if (isError)
    return (
      <ErrorState
        onRetry={() => {
          roomsQuery.refetch();
          staysQuery.refetch();
          roomStatuses.refetch();
          paymentMethods.fetchAll.refetch();
          accommodationTypesQuery.refetch();
        }}
        onRefresh={() => window.location.reload()}
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <CalendarHeader startDate={startDate} onStartDateChange={setStartDate} />

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {accommodationTypesQuery.data?.map((type) => (
          <TabPanel key={type.id} header={type.name}>
            <CalendarGrid
              refectCalendar={() => {
                setTimeout(() => {
                  roomsQuery.refetch().then(() => {
                    hideBlockUI();
                  });
                }, 500);
              }}
              roomStatuses={roomStatuses?.data || []}
              filteredRooms={filteredRooms}
              getActiveStay={getActiveStay}
              accommodationType={type}
              activeStay={activeStay}
              activeTab={activeTab}
              days={days}
            />
          </TabPanel>
        ))}
      </TabView>
      {/* 
      <RoomActionModalB
        onCheckInObservationChange={setCheckInObservation}
        onRoomStatusChange={handleRoomStatusChange}
        onRoomStatusUpdate={handleRoomStatusUpdate}
        onObservationChange={setFormObservation}
        onHide={() => setShowMainModal(false)}
        onConfirmCheckIn={handleConfirmCheckIn}
        checkInObservation={checkInObservation}
        onCheckInAction={handleCheckInAction}
        onEmployeeChange={setFormEmployeeId}
        onGoToCheckOut={handleGoToCheckOut}
        formObservation={formObservation}
        onGoToCheckIn={handleGoToCheckIn}
        onGoToBooking={handleGoToBooking}
        formEmployeeId={formEmployeeId}
        taskEmployees={taskEmployees}
        selectedRoom={selectedRoom}
        selectedDate={selectedDate}
        visible={showMainModal}
        activeStay={activeStay}
        pendingAction={null}
      /> */}

      <PaymentModal
        isPaymentMethodValid={isPaymentMethodValid || false}
        paymentMethods={paymentMethods.fetchAll.data || []}
        onNewPaymentAmountChange={setNewPaymentAmount}
        onConfirmNewPayment={handleConfirmNewPayment}
        onHide={() => setShowPaymentModal(false)}
        onPaymentMethodChange={setPaymentMethodId}
        isProcessingPayment={isProcessingPayment}
        newPaymentAmount={newPaymentAmount}
        paymentMethodId={paymentMethodId}
        pendingAmount={pendingAmount}
        visible={showPaymentModal}
      />

      <CheckInModal
        onCheckInObservationChange={setCheckInObservation}
        onHide={() => setShowCheckInModal(false)}
        checkInObservation={checkInObservation}
        onConfirmCheckIn={handleConfirmCheckIn}
        selectedRoom={selectedRoom}
        visible={showCheckInModal}
        activeStay={activeStay}
      />
    </div>
  );
};

export default CalendarView;
