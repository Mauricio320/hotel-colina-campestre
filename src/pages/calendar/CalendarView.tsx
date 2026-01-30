import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TabView, TabPanel } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { addLocale } from "primereact/api";
import { CATEGORIES, STATUS_MAP } from "@/constants";
import { useRooms } from "@/hooks/useRooms";
import { useStays } from "@/hooks/useStays";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/hooks/useAuth";
import { usePayments } from "@/hooks/usePayments";
import { supabase } from "@/config/supabase";
import { Room, Stay, Role } from "@/types";
import { RoomActionEnum, RoomStatusEnum } from "@/util/status-rooms.enum";
import dayjs from "dayjs";
import { useBlockUI } from "@/context/BlockUIContext";
import { TaskCompletionForm } from "@/components/tasks/TaskCompletionForm";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";

const CalendarView: React.FC = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employee: currentEmployee } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().toDate());

  // Leer parámetro tab de la URL y establecer el tab activo
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");

    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam);
      // Validar que el índice sea válido
      if (tabIndex >= 0 && tabIndex < CATEGORIES.length) {
        setActiveTab(tabIndex);

        // Scroll suave al TabView para mejor UX
        setTimeout(() => {
          const tabViewElement = document.querySelector(".p-tabview-nav");
          if (tabViewElement) {
            tabViewElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    }
  }, [window.location.search]);

  const { roomsQuery } = useRooms();
  const { staysQuery, registerPayment, registerCheckInReserva } = useStays();

  const { employeesQuery } = useEmployees();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStay, setActiveStay] = useState<Stay | null>(null);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [formEmployeeId, setFormEmployeeId] = useState<string>("");
  const [formObservation, setFormObservation] = useState<string>("");
  const [checkInObservation, setCheckInObservation] = useState<string>("");
  const [checkInEmployeeId, setCheckInEmployeeId] = useState<string>("");

  const [roomStatuses, setRoomStatuses] = useState<any[]>([]);
  const [newPaymentAmount, setNewPaymentAmount] = useState(0);
  const [paymentMethodId, setPaymentMethodId] = useState<string>(""); // Will be set when payment methods load
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Opciones de métodos de pago (vienen de la BD)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("room_statuses")
      .select("*")
      .then(({ data }) => setRoomStatuses(data || []));

    // Cargar métodos de pago desde la BD
    supabase
      .from("payment_methods")
      .select("*")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPaymentMethods(data);
          setPaymentMethodId(data[0].id); // Establecer el primer método como default
        }
      });
  }, []);

  const filteredRooms = useMemo(() => {
    return (roomsQuery.data || []).filter(
      (r) => r.category === CATEGORIES[activeTab],
    );
  }, [roomsQuery.data, activeTab]);

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
    setPendingAction(null);
    setFormEmployeeId(currentEmployee?.id || "");
    setFormObservation("");
    setShowMainModal(true);
  };

  const handleStatusChangeSubmit = async (status: string) => {
    showBlockUI(`Actualizando estado de la habitación...`);

    let targetStatusName = RoomStatusEnum.DISPONIBLE;
    if (status === RoomActionEnum.LIMPIEZA)
      targetStatusName = RoomStatusEnum.LIMPIEZA;
    if (status === RoomActionEnum.MANTENIMIENTO)
      targetStatusName = RoomStatusEnum.MANTENIMIENTO;

    const targetStatus = roomStatuses.find((s) => s.name === targetStatusName);

    const timeStr = dayjs().format("hh:mm A");

    let defaultObservation = "";
    switch (status) {
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
        defaultObservation = `Acción ${status} registrada a las ${timeStr}`;
    }

    setIsProcessingPayment(true);

    try {
      const isFullPayment = newPaymentAmount >= pendingAmount;

      const customObservation = isFullPayment
        ? "Liquidación completa de reserva desde calendario"
        : "Abono parcial desde calendario";

      const result = await registerPayment.mutateAsync({
        stayId: activeStay.id,
        roomId: selectedRoom.id,
        amount: newPaymentAmount,
        paymentMethodId: paymentMethodId,
        employeeId: currentEmployee?.id,
        customObservation,
      });

      const message = result?.isFullyPaid
        ? "Pago completado. La habitación ha pasado a estado Ocupado."
        : "Abono registrado correctamente.";

      showBlockUI(message);
      setShowPaymentModal(false);

      if (result?.isFullyPaid) {
        setShowMainModal(false);
      }

      setNewPaymentAmount(0);
    } catch (e: any) {
      showBlockUI("Error al procesar el pago: " + e.message);
    } finally {
      setIsProcessingPayment(false);
      hideBlockUI();
    }
  };

  const handleRoomStatusChange = async (action: string) => {
    showBlockUI(`Actualizando estado de la habitación...`);

    let targetStatusName = RoomStatusEnum.DISPONIBLE;
    if (action === RoomActionEnum.LIMPIEZA)
      targetStatusName = RoomStatusEnum.LIMPIEZA;
    if (action === RoomActionEnum.MANTENIMIENTO)
      targetStatusName = RoomStatusEnum.MANTENIMIENTO;

    const targetStatus = roomStatuses.find((s) => s.name === targetStatusName);

    if (!targetStatus) {
      showBlockUI("Error: Estado de habitación no encontrado");
      hideBlockUI();
      return;
    }

    try {
      // 1. Actualizar estado de la habitación
      await supabase
        .from("rooms")
        .update({
          status_id: targetStatus.id,
          status_date: dayjs(selectedDate).format("YYYY-MM-DD"),
        })
        .eq("id", selectedRoom.id);

      // 2. Crear registro en room_history
      await supabase.from("room_history").insert({
        room_id: selectedRoom.id,
        previous_status_id: selectedRoom.status_id,
        new_status_id: targetStatus.id,
        employee_id: currentEmployee?.id,
        action_type: action,
        observation: `${action} iniciado el ${dayjs().format("YYYY-MM-DD HH:mm")}`,
      });

      showBlockUI(`Estado actualizado a: ${targetStatusName}`);
      setShowMainModal(false);

      // 3. Refrescar datos
      roomsQuery.refetch();
    } catch (error: any) {
      showBlockUI("Error al actualizar estado: " + error.message);
    } finally {
      hideBlockUI();
    }
  };

  const handleRoomStatusUpdate = async (action: string) => {
    showBlockUI(`Actualizando estado de la habitación...`);

    // Validación requerida: responsable
    if (!formEmployeeId) {
      showBlockUI("Debe seleccionar un responsable para esta acción");
      hideBlockUI();
      return;
    }

    let targetStatusName = RoomStatusEnum.DISPONIBLE;
    let actionMessage = "";

    // Mapeo de acciones a estados y mensajes
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

    const targetStatus = roomStatuses.find((s) => s.name === targetStatusName);

    if (!targetStatus) {
      showBlockUI("Error: Estado de habitación no encontrado");
      hideBlockUI();
      return;
    }

    try {
      // 1. Actualizar estado de la habitación
      await supabase
        .from("rooms")
        .update({
          status_id: targetStatus.id,
          status_date: dayjs(selectedDate).format("YYYY-MM-DD"),
        })
        .eq("id", selectedRoom.id);

      // 2. Crear registro en room_history
      const currentTime = dayjs().format("YYYY-MM-DD HH:mm");
      await supabase.from("room_history").insert({
        room_id: selectedRoom.id,
        previous_status_id: selectedRoom.status_id,
        new_status_id: targetStatus.id,
        employee_id: formEmployeeId,
        action_type: action,
        observation: formObservation
          ? `${formObservation} (finalizado a las ${currentTime})`
          : `${action} completado a las ${currentTime}`,
      });

      showBlockUI(actionMessage);
      setShowMainModal(false);

      // 3. Refrescar datos
      roomsQuery.refetch();
    } catch (error: any) {
      showBlockUI("Error al actualizar estado: " + error.message);
    } finally {
      hideBlockUI();
    }
  };

  // 1. Nueva función para evaluar el estado de pago de la reserva
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

  // 2. Nueva función para check-in directo con observación
  const handleDirectCheckIn = async () => {
    if (!currentEmployee?.id) {
      showBlockUI("Debe haber un empleado logueado para realizar el check-in");
      hideBlockUI();
      return;
    }

    showBlockUI("Procesando check-in de reserva...");

    try {
      // 1. Cambiar estado de la estancia a "Active"
      await supabase
        .from("stays")
        .update({ status: "Active" })
        .eq("id", activeStay.id);

      // 2. Cambiar estado de habitación a "Ocupado"
      const occupiedStatus = roomStatuses.find((s) => s.name === "Ocupado");
      if (occupiedStatus) {
        await supabase
          .from("rooms")
          .update({
            status_id: occupiedStatus.id,
            status_date: dayjs(selectedDate).format("YYYY-MM-DD"),
          })
          .eq("id", selectedRoom.id);
      }

      // 3. Registrar en room_history
      await supabase.from("room_history").insert({
        room_id: selectedRoom.id,
        stay_id: activeStay.id,
        previous_status_id: selectedRoom.status_id,
        new_status_id: occupiedStatus?.id,
        employee_id: currentEmployee.id,
        action_type: "CHECK-IN-RESERVA",
        observation: formObservation || "Check-in directo sin observación",
      });

      showBlockUI(
        "Check-in de reserva realizado exitosamente. Huésped alojado en habitación.",
      );
      setShowMainModal(false);
      roomsQuery.refetch();
      staysQuery.refetch();
    } catch (error: any) {
      showBlockUI("Error al procesar check-in de reserva: " + error.message);
    } finally {
      hideBlockUI();
    }
  };

  const handleCheckInAction = () => {
    if (!activeStay) return;
    const paymentStatus = getReservationPaymentStatus(activeStay);

    if (paymentStatus.canCheckIn) {
      // Si está pagada, va directamente a check-in
      handleDirectCheckIn();
    } else {
      // Si tiene saldo, va a modal de pago
      setNewPaymentAmount(paymentStatus.pendingAmount);
      setShowPaymentModal(true);
    }
  };

  const handleConfirmCheckInReserva = async () => {
    showBlockUI("Procesando check-in de reserva...");

    setIsProcessingPayment(true);

    console.log(activeStay);

    //TODO: NO ESTA CREANDO BIEN EL REGISTRO DE SEGUIMIENDO AL CHECK IN DE RESERVA

    try {
      await registerCheckInReserva.mutateAsync({
        stayId: activeStay.id,
        roomId: selectedRoom.id,
        employeeId: currentEmployee?.id,
        previous_status_id: activeStay.status_id,
      });

      showBlockUI("Check-in de reserva realizado correctamente.");
      setShowMainModal(false);
      roomsQuery.refetch();
      staysQuery.refetch();
    } catch (e: any) {
      showBlockUI("Error al procesar el check-in de reserva: " + e.message);
    } finally {
      setIsProcessingPayment(false);
      hideBlockUI();
    }
  };

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

  const handleConfirmNewPayment = async () => {
    if (!activeStay || !selectedRoom || newPaymentAmount <= 0) {
      return;
    }

    if (!paymentMethodId || !isPaymentMethodValid) {
      showBlockUI("Por favor seleccione un método de pago válido");
      return;
    }

    try {
      setIsProcessingPayment(true);

      const isFullPayment = newPaymentAmount >= pendingAmount;
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

      // NUEVO: Actualizar información del modal después del pago (sin check-in automático)
      if (activeStay) {
        const newPaidAmount = activeStay.paid_amount + newPaymentAmount;
        const newPendingAmount = activeStay.total_price - newPaidAmount;

        // Actualizar modal principal con nuevos valores
        setActiveStay({
          ...activeStay,
          paid_amount: newPaidAmount,
        });
        setNewPaymentAmount(0);
        setPendingAction("SUCCESS");
        setShowPaymentModal(false);

        // Mensaje diferente si el pago está completo
        if (newPendingAmount <= 0) {
          showBlockUI(
            "Abono completado. Reserva fully pagada. Realice check-in para ocupar la habitación.",
          );
        } else {
          showBlockUI("Abono registrado correctamente. Queda saldo pendiente.");
        }
      }
    } catch (e) {
      console.error("Payment error:", e);
      showBlockUI("Error al registrar el pago: " + e.message);
    } finally {
      setIsProcessingPayment(false);
      hideBlockUI();
    }
  };

  // Nueva función unificada para confirmar check-in (para habitaciones disponibles y reservadas)
  const handleConfirmCheckIn = async () => {
    if (!selectedRoom || !currentEmployee?.id) {
      showBlockUI("Debe haber un empleado logueado para realizar el check-in");
      return;
    }

    showBlockUI("Procesando check-in...");

    try {
      // 1. Cambiar estado de habitación a "Ocupado"
      const occupiedStatus = roomStatuses.find((s) => s.name === "Ocupado");
      if (occupiedStatus) {
        await supabase
          .from("rooms")
          .update({
            status_id: occupiedStatus.id,
            status_date: dayjs(selectedDate).format("YYYY-MM-DD"),
          })
          .eq("id", selectedRoom.id);
      }

      // 2. Si es una reservada, también actualizar stay a "Active"
      if (activeStay) {
        await supabase
          .from("stays")
          .update({ status: "Active" })
          .eq("id", activeStay.id);
      }

      // 3. Crear room_history record
      await supabase.from("room_history").insert({
        room_id: selectedRoom.id,
        stay_id: activeStay?.id,
        previous_status_id: selectedRoom.status_id,
        new_status_id: occupiedStatus?.id,
        employee_id: currentEmployee.id,
        action_type: activeStay ? "CHECK-IN-RESERVA" : "CHECK-IN-DIRECTO",
        observation: checkInObservation || "Check-in sin observación",
      });

      showBlockUI(
        "Check-in realizado exitosamente. Huésped alojado en habitación.",
      );
      setShowCheckInModal(false);
      setShowMainModal(false);
      roomsQuery.refetch();
      staysQuery.refetch();
    } catch (error: any) {
      showBlockUI("Error al procesar check-in: " + error.message);
    } finally {
      hideBlockUI();
    }
  };

  // Filtrado de empleados según la acción
  const taskEmployees = useMemo(() => {
    const targetRole = selectedRoom?.status.name;

    return (employeesQuery.data || []).filter(
      (emp) => emp.role?.name === targetRole,
    );
  }, [employeesQuery.data, selectedRoom?.status.name]);

  // Manejo de carga resiliente
  const isLoading =
    (roomsQuery.isLoading && !roomsQuery.data) ||
    (staysQuery.isLoading && !staysQuery.data);
  const isError = roomsQuery.isError || staysQuery.isError;

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-4">
        <ProgressSpinner strokeWidth="4" />
        <p className="text-emerald-600 font-bold animate-pulse">
          Cargando disponibilidad...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="p-8">
        <Message
          severity="error"
          text="Se perdió la conexión con la base de datos temporalmente."
          className="w-full"
        />
        <div className="mt-4 flex flex-col items-center gap-2">
          <Button
            label="Reintentar ahora"
            icon="pi pi-refresh"
            onClick={() => {
              roomsQuery.refetch();
              staysQuery.refetch();
            }}
          />
          <Button
            label="Refrescar Página"
            className="p-button-text text-gray-400"
            onClick={() => window.location.reload()}
          />
        </div>
      </div>
    );

  const modalHeader = (
    <div className="flex items-center gap-3">
      <i className="pi pi-building text-2xl text-gray-700"></i>
      <span className="text-2xl font-black text-gray-800 tracking-tight">
        Habitacion {selectedRoom?.room_number}
      </span>
    </div>
  );

  const paymentStatus = getReservationPaymentStatus(activeStay);
  const pendingAmount = activeStay
    ? activeStay.total_price - activeStay.paid_amount
    : 0;

  // Validar que paymentMethodId sea válido
  const isPaymentMethodValid = paymentMethods.some(
    (pm) => pm.id === paymentMethodId,
  );

  // Renderizar los botones según el estado
  const renderModalActions = () => {
    const isDate =
      dayjs(selectedDate).format("YYYY-MM-DD") === selectedRoom?.status_date;

    // 1. Si hay una estancia activa (Ocupado o Reservado)
    if (activeStay) {
      return (
        <div className="flex flex-col gap-4">
          <div className="p-6 border border-emerald-200 rounded-3xl bg-white shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">
                  Huésped
                </span>
                <p className="text-2xl font-black text-gray-800 leading-tight">
                  {activeStay.guest?.first_name} {activeStay.guest?.last_name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">
                  Salida
                </span>
                <p className="text-base font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                  {activeStay.check_out_date}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
                <span className="text-[9px] font-black text-gray-400 uppercase">
                  Abonado
                </span>
                <span className="text-sm font-black text-emerald-600">
                  $ {activeStay.paid_amount?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
                <span className="text-[9px] font-black text-gray-400 uppercase">
                  Total
                </span>
                <span className="text-sm font-black text-emerald-800">
                  $ {activeStay.total_price?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-red-50 rounded-xl">
                <span className="text-[9px] font-black text-red-400 uppercase">
                  Saldo
                </span>
                <span className="text-sm font-black text-red-600">
                  $ {pendingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {activeStay.status === "Active" ? (
            <Button
              label="Realizar Check-out"
              className="bg-[#ff3d47] border-none text-white w-full py-4 text-lg font-black rounded-2xl"
              onClick={handleGoToCheckOut}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {/* Campo de observación para check-in */}
              {activeStay.paid_amount >= activeStay.total_price && (
                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-sm font-black text-gray-700">
                    Observación del Check-in (Opcional)
                  </label>
                  <InputTextarea
                    value={checkInObservation}
                    onChange={(e) => setCheckInObservation(e.target.value)}
                    placeholder="Agregar observación del check-in..."
                    rows={3}
                    className="w-full bg-gray-50 border-gray-100"
                  />
                </div>
              )}

              {paymentStatus.canCheckIn ? (
                <Button
                  label="Check-in"
                  className="bg-emerald-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg"
                  onClick={handleConfirmCheckIn}
                />
              ) : (
                <Button
                  label="Abonar"
                  className="bg-orange-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg"
                  onClick={handleCheckInAction}
                />
              )}
            </div>
          )}
        </div>
      );
    }

    // 2. Si el estado de la celda es Limpieza (permitir finalizar)
    if (selectedRoom?.status?.name === RoomStatusEnum.LIMPIEZA && isDate) {
      return (
        <TaskCompletionForm
          onSubmit={() => handleRoomStatusUpdate(RoomActionEnum.FIN_LIMPIEZA)}
          onObservationChange={setFormObservation}
          onEmployeeChange={setFormEmployeeId}
          selectedEmployeeId={formEmployeeId}
          observation={formObservation}
          employees={taskEmployees}
          placeholder="Notas sobre la limpieza..."
          submitLabel="Finalizar Limpieza"
          actionColor="blue"
        />
      );
    }

    // 3. Si el estado de la celda es Mantenimiento (permitir finalizar)
    if (selectedRoom?.status?.name === RoomStatusEnum.MANTENIMIENTO && isDate) {
      return (
        <TaskCompletionForm
          onSubmit={() => handleRoomStatusUpdate(RoomActionEnum.FIN_MANT)}
          onObservationChange={setFormObservation}
          onEmployeeChange={setFormEmployeeId}
          selectedEmployeeId={formEmployeeId}
          observation={formObservation}
          employees={taskEmployees}
          placeholder="Notas sobre el mantenimiento..."
          submitLabel="Finalizar Mantenimiento"
          actionColor="gray"
        />
      );
    }

    // 4. Por defecto: Disponible
    return (
      <div className="grid grid-cols-2 gap-4">
        <Button
          label="Check-in"
          className="bg-[#ff3d47] border-none text-white font-black py-4 rounded-2xl shadow-sm"
          onClick={handleGoToCheckIn}
        />
        <Button
          label="Reservar"
          className="bg-[#f9b000] border-none text-white font-black py-4 rounded-2xl shadow-sm"
          onClick={handleGoToBooking}
        />
        <Button
          label="Limpieza"
          className="bg-[#2d79ff] border-none text-white font-black py-4 rounded-2xl shadow-sm"
          onClick={() => handleRoomStatusChange(RoomActionEnum.LIMPIEZA)}
        />
        <Button
          label="Mant."
          className="bg-[#6e7687] border-none text-white font-black py-4 rounded-2xl shadow-sm"
          onClick={() => handleRoomStatusChange(RoomActionEnum.MANTENIMIENTO)}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Calendario de Ocupación
        </h2>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
          <Button
            icon="pi pi-chevron-left"
            onClick={() => {
              const nd = new Date(startDate);
              nd.setDate(nd.getDate() - 7);
              setStartDate(nd);
            }}
            className="p-button-text p-button-sm"
          />
          <Calendar
            value={startDate}
            onChange={(e) => e.value && setStartDate(e.value)}
            showIcon
            className="p-inputtext-sm"
          />
          <Button
            icon="pi pi-chevron-right"
            onClick={() => {
              const nd = new Date(startDate);
              nd.setDate(nd.getDate() + 7);
              setStartDate(nd);
            }}
            className="p-button-text p-button-sm"
          />
        </div>
      </div>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {CATEGORIES.map((cat) => (
          <TabPanel key={cat} header={cat}>
            <CalendarGrid
              days={days}
              filteredRooms={filteredRooms}
              getActiveStay={getActiveStay}
              handleRoomClick={handleRoomClick}
            />
          </TabPanel>
        ))}
      </TabView>

      <Dialog
        header={modalHeader}
        visible={showMainModal}
        onHide={() => setShowMainModal(false)}
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

      <Dialog
        header="Registrar Abono"
        visible={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        className="w-full max-w-md rounded-2xl"
      >
        <div className="flex flex-col gap-5 py-2">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <p className="text-emerald-800 text-sm font-medium">
              <i className="pi pi-info-circle mr-2"></i>
              Para proceder con el check-in de una reserva, el saldo pendiente
              debe ser cero.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500">
              <span>SALDO PENDIENTE:</span>
              <span className="text-red-600 font-black text-xl">
                $ {pendingAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-gray-700">
                Método de Pago
              </label>
              <Dropdown
                value={paymentMethodId}
                options={paymentMethods}
                optionLabel="name"
                optionValue="id"
                onChange={(e) => setPaymentMethodId(e.value)}
                placeholder="Seleccionar método de pago"
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-gray-700">
                Monto a Abonar
              </label>
              <InputNumber
                value={newPaymentAmount}
                onValueChange={(e) => setNewPaymentAmount(e.value || 0)}
                mode="currency"
                currency="COP"
                className="w-full"
                inputClassName="text-2xl font-black py-4 border-emerald-200"
                autoFocus
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              label="Volver"
              className="p-button-text p-button-plain font-bold"
              onClick={() => setShowPaymentModal(false)}
            />
            <Button
              label="Confirmar Abono"
              icon="pi pi-money-bill"
              className="bg-green-600 border-none text-white font-black py-4 rounded-xl shadow-lg"
              onClick={handleConfirmNewPayment}
              loading={isProcessingPayment}
              disabled={
                newPaymentAmount <= 0 ||
                !paymentMethodId ||
                !isPaymentMethodValid
              }
            />
          </div>
        </div>
      </Dialog>

      {/* Modal de Check-in - Nueva modal para observación */}
      <Dialog
        visible={showCheckInModal}
        onHide={() => setShowCheckInModal(false)}
        header="Confirmar Check-in"
        modal
        className="w-full max-w-md"
        resizable={false}
        draggable={false}
      >
        <div className="flex flex-col gap-4">
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">🏨</div>
            <h3 className="text-lg font-bold text-gray-800">
              {selectedRoom?.room_number} - Check-in
            </h3>
            <p className="text-sm text-gray-600">
              {activeStay ? "Check-in de reserva" : "Check-in directo"}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-gray-700">
              Observación del Check-in (Opcional)
            </label>
            <InputTextarea
              value={checkInObservation}
              onChange={(e) => setCheckInObservation(e.target.value)}
              placeholder="Agregar observación del check-in..."
              rows={3}
              className="w-full bg-gray-50 border-gray-100"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              label="Cancelar"
              className="p-button-text p-button-plain font-bold"
              onClick={() => setShowCheckInModal(false)}
            />
            <Button
              label="Confirmar Check-in"
              icon="pi pi-check"
              className="bg-emerald-600 border-none text-white font-black py-4 rounded-xl shadow-lg"
              onClick={handleConfirmCheckIn}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CalendarView;
