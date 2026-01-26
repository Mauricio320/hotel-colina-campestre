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
import { supabase } from "@/config/supabase";
import { Room, Stay, Role } from "@/types";

addLocale("es", {
  firstDayOfWeek: 1,
  dayNames: [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ],
  dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
  today: "Hoy",
  clear: "Limpiar",
});

const toISODate = (date: Date | null): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("sv-SE");
};

const CalendarView: React.FC = () => {
  const { employee: currentEmployee } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(new Date());

  const { roomsQuery, updateStatus } = useRooms();
  const { staysQuery, registerPayment } = useStays();
  const { employeesQuery } = useEmployees();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStay, setActiveStay] = useState<Stay | null>(null);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // pendingAction puede ser: 'LIMPIEZA', 'FIN-LIMPIEZA', 'MANTENIMIENTO', 'FIN-MANT'
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [formEmployeeId, setFormEmployeeId] = useState<string>("");
  const [formObservation, setFormObservation] = useState<string>("");

  const [roomStatuses, setRoomStatuses] = useState<any[]>([]);
  const [newPaymentAmount, setNewPaymentAmount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    supabase
      .from("room_statuses")
      .select("*")
      .then(({ data }) => setRoomStatuses(data || []));
  }, []);

  const filteredRooms = useMemo(() => {
    return (roomsQuery.data || []).filter(
      (r) => r.category === CATEGORIES[activeTab],
    );
  }, [roomsQuery.data, activeTab]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startDate]);

  const getActiveStay = (room: Room, date: Date) => {
    const dateStr = toISODate(date);
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

  const handleStatusChangeSubmit = async () => {
    if (!selectedRoom || !selectedDate || !pendingAction) return;

    let targetStatusName = "Disponible";
    if (pendingAction === "LIMPIEZA") targetStatusName = "Limpieza";
    if (pendingAction === "MANTENIMIENTO") targetStatusName = "Mantenimiento";

    const targetStatus = roomStatuses.find((s) => s.name === targetStatusName);
    if (!targetStatus) return;

    try {
      await updateStatus.mutateAsync({
        roomId: selectedRoom.id,
        statusId: targetStatus.id,
        actionType: pendingAction,
        employeeId: formEmployeeId || currentEmployee?.id || null,
        statusDate: toISODate(selectedDate),
        observation:
          formObservation ||
          `${pendingAction} desde el calendario para el día ${toISODate(selectedDate)}`,
      });
      setShowMainModal(false);
      setPendingAction(null);
    } catch (e) {
      alert("Error: " + (e as any).message);
    }
  };

  const handleConfirmNewPayment = async () => {
    if (!activeStay || !selectedRoom || newPaymentAmount <= 0) {
      alert("Ingrese un monto válido para el abono.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const result = await registerPayment.mutateAsync({
        stayId: activeStay.id,
        roomId: selectedRoom.id,
        amount: newPaymentAmount,
        employeeId: currentEmployee?.id,
      });

      alert("Abono registrado correctamente.");
      setShowPaymentModal(false);

      if (result.isFullyPaid) {
        alert("Pago completado. La habitación ha pasado a estado Ocupado.");
        setShowMainModal(false);
      }

      setNewPaymentAmount(0);
      roomsQuery.refetch();
      staysQuery.refetch();
    } catch (e: any) {
      alert("Error al procesar el abono: " + e.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCheckInAction = () => {
    if (!activeStay) return;
    const isFullyPaid =
      (activeStay.paid_amount || 0) >= (activeStay.total_price || 0);
    if (isFullyPaid) {
      handleGoToCheckIn();
    } else {
      setNewPaymentAmount(
        (activeStay.total_price || 0) - (activeStay.paid_amount || 0),
      );
      setShowPaymentModal(true);
    }
  };

  const handleGoToCheckIn = () =>
    selectedRoom &&
    navigate(`/check-in/${selectedRoom.id}?date=${toISODate(selectedDate)}`);
  const handleGoToBooking = () =>
    selectedRoom &&
    navigate(`/booking/${selectedRoom.id}?date=${toISODate(selectedDate)}`);
  const handleGoToCheckOut = () =>
    activeStay &&
    navigate(`/check-out/${selectedRoom?.id}?stayId=${activeStay.id}`);

  // Filtrado de empleados según la acción
  const taskEmployees = useMemo(() => {
    if (!pendingAction) return [];
    const targetRole = pendingAction.includes("LIMPIEZA")
      ? Role.Limpieza
      : Role.Mantenimiento;
    return (employeesQuery.data || []).filter(
      (emp) => emp.role?.name === targetRole || emp.role?.name === Role.Admin,
    );
  }, [employeesQuery.data, pendingAction]);

  // Manejo de carga resiliente
  const isLoading =
    (roomsQuery.isLoading && !roomsQuery.data) ||
    (staysQuery.isLoading && !staysQuery.data);
  const isError = roomsQuery.isError || staysQuery.isError;

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-4">
        <ProgressSpinner strokeWidth="4" />
        <p className="text-indigo-600 font-bold animate-pulse">
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

  const pendingAmount = activeStay
    ? activeStay.total_price - activeStay.paid_amount
    : 0;

  // Renderizar los botones según el estado
  const renderModalActions = () => {
    // 0. Si hay un formulario de acción pendiente
    if (pendingAction) {
      const isFinishing = pendingAction.startsWith("FIN-");
      const actionBase = isFinishing
        ? pendingAction.substring(4)
        : pendingAction;
      const colorClass = actionBase === "LIMPIEZA" ? "blue" : "gray";

      return (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div
            className={`bg-${colorClass}-50 p-4 rounded-2xl border border-${colorClass}-100 flex items-center gap-3`}
          >
            <i
              className={`pi ${actionBase === "LIMPIEZA" ? "pi-star text-blue-500" : "pi-cog text-gray-500"} text-xl`}
            ></i>
            <div className="flex flex-col">
              <p
                className={`text-sm font-black text-${colorClass}-900 uppercase`}
              >
                {isFinishing ? "Finalizar" : "Iniciar"}{" "}
                {actionBase.toLowerCase()}
              </p>
              <p className={`text-[10px] text-${colorClass}-600 font-bold`}>
                Se creará un registro en el historial
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-500 uppercase">
              Responsable
            </label>
            <Dropdown
              value={formEmployeeId}
              onChange={(e) => setFormEmployeeId(e.value)}
              options={taskEmployees}
              optionLabel={(emp) => `${emp.first_name} ${emp.last_name}`}
              optionValue="id"
              placeholder="Seleccione el encargado"
              className="w-full p-2 border-indigo-200"
              filter
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-500 uppercase">
              Observación / Novedad
            </label>
            <InputTextarea
              value={formObservation}
              onChange={(e) => setFormObservation(e.target.value)}
              placeholder={`Notas sobre la ${actionBase.toLowerCase()}...`}
              rows={3}
              className="w-full border-indigo-200"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              label="Atrás"
              className="p-button-text p-button-plain font-bold"
              onClick={() => setPendingAction(null)}
            />
            <Button
              label="Guardar Registro"
              icon="pi pi-save"
              className={`bg-${colorClass === "blue" ? "blue-600" : "gray-700"} border-none text-white font-black py-3 rounded-xl shadow-lg`}
              disabled={!formEmployeeId}
              onClick={handleStatusChangeSubmit}
            />
          </div>
        </div>
      );
    }

    // 1. Si hay una estancia activa (Ocupado o Reservado)
    if (activeStay) {
      return (
        <div className="flex flex-col gap-4">
          <div className="p-6 border border-indigo-100 rounded-3xl bg-white shadow-md">
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
                <p className="text-base font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  {activeStay.check_out_date}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
                <span className="text-[9px] font-black text-gray-400 uppercase">
                  Abonado
                </span>
                <span className="text-sm font-black text-indigo-600">
                  $ {activeStay.paid_amount?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
                <span className="text-[9px] font-black text-gray-400 uppercase">
                  Total
                </span>
                <span className="text-sm font-black text-gray-800">
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
            <Button
              label="Check-in (Reserva)"
              className="bg-indigo-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg"
              onClick={handleCheckInAction}
            />
          )}
        </div>
      );
    }

    // 2. Si el estado de la celda es Limpieza (permitir finalizar)
    if (
      selectedRoom?.status?.name === "Limpieza" &&
      toISODate(selectedDate) === selectedRoom.status_date
    ) {
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
            <i className="pi pi-star text-4xl text-blue-500 mb-2"></i>
            <p className="text-blue-800 font-bold text-lg">
              Habitación en proceso de limpieza
            </p>
            <p className="text-blue-600 text-sm">
              ¿Ya se terminó la limpieza de la habitación?
            </p>
          </div>
          <Button
            label="Finalizar Limpieza"
            icon="pi pi-check-circle"
            className="bg-blue-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg"
            onClick={() => setPendingAction("FIN-LIMPIEZA")}
          />
        </div>
      );
    }

    // 3. Si el estado de la celda es Mantenimiento (permitir finalizar)
    if (
      selectedRoom?.status?.name === "Mantenimiento" &&
      toISODate(selectedDate) === selectedRoom.status_date
    ) {
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200 text-center">
            <i className="pi pi-cog text-4xl text-gray-500 mb-2"></i>
            <p className="text-gray-800 font-bold text-lg">
              Habitación en mantenimiento
            </p>
            <p className="text-gray-600 text-sm">
              ¿Ya finalizó el mantenimiento técnico?
            </p>
          </div>
          <Button
            label="Finalizar Mantenimiento"
            icon="pi pi-check-circle"
            className="bg-gray-700 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg"
            onClick={() => setPendingAction("FIN-MANT")}
          />
        </div>
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
          onClick={() => setPendingAction("LIMPIEZA")}
        />
        <Button
          label="Mant."
          className="bg-[#6e7687] border-none text-white font-black py-4 rounded-2xl shadow-sm"
          onClick={() => setPendingAction("MANTENIMIENTO")}
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
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border mt-4">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-left font-bold text-gray-400 w-[75px] border-r">
                      Hab..
                    </th>
                    {days.map((d) => (
                      <th
                        key={d.getTime()}
                        className="p-4 text-center border-r last:border-r-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-gray-400">
                            {d.toLocaleDateString("es-CO", {
                              weekday: "short",
                            })}
                          </span>
                          <span
                            className={`text-lg font-black ${toISODate(d) === toISODate(new Date()) ? "text-indigo-600" : "text-gray-700"}`}
                          >
                            {d.getDate()}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr
                      key={room.id}
                      className="border-b last:border-b-0 hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="p-2 border-r bg-gray-50/50">
                        <div className="flex flex-col gap-1 items-start px-1">
                          <div className="flex items-center gap-1.5 bg-[#f3f0e9] px-1 py-1 rounded-xl border border-[#e5e0d3] w-fit">
                            <i className="pi pi-bed text-[#8b7e6a] text-xs"></i>
                            <span className="text-base font-bold text-[12px] text-[#0f2d52]">
                              {room.room_number}
                            </span>
                          </div>
                          <span className="text-[8px] font-black text-gray-500 uppercase">
                            MAX: {room.beds_double * 2 + room.beds_single} PAX
                          </span>
                        </div>
                      </td>
                      {days.map((d) => {
                        const stay = getActiveStay(room, d);
                        const dateStr = toISODate(d);
                        let statusColor =
                          STATUS_MAP["Disponible"]?.color || "bg-green-500";
                        let cellContent = null;

                        if (stay) {
                          statusColor =
                            stay.status === "Active"
                              ? STATUS_MAP["Ocupado"]?.color || "bg-red-500"
                              : STATUS_MAP["Reserved"]?.color ||
                                "bg-yellow-500";
                          cellContent = (
                            <span className="text-[8px] px-1 truncate">
                              {stay.guest?.first_name} {stay.guest?.last_name}
                            </span>
                          );
                        } else if (
                          room.status_date === dateStr &&
                          room.status?.name !== "Disponible"
                        ) {
                          statusColor =
                            STATUS_MAP[room.status.name]?.color || statusColor;
                          cellContent = (
                            <span className="text-[8px] font-bold uppercase">
                              {room.status.name}
                            </span>
                          );
                        }

                        return (
                          <td
                            key={d.getTime()}
                            className="p-1 border-r last:border-r-0 cursor-pointer"
                            onClick={() =>
                              handleRoomClick(room, stay || null, d)
                            }
                          >
                            <div
                              className={`h-10 w-full rounded-lg flex items-center justify-center text-white font-bold transition-all ${statusColor} shadow-sm overflow-hidden`}
                            >
                              {cellContent}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                        ? "Ocupado"
                        : "Reserved"
                      : selectedRoom?.status?.name || "Disponible"
                  }
                  severity={
                    activeStay
                      ? activeStay.status === "Active"
                        ? "danger"
                        : "warning"
                      : selectedRoom?.status?.name === "Limpieza"
                        ? "info"
                        : selectedRoom?.status?.name === "Mantenimiento"
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
                    <span className="font-bold text-indigo-600">
                      {toISODate(selectedDate)}
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
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <p className="text-indigo-800 text-sm font-medium">
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
                Monto a Abonar
              </label>
              <InputNumber
                value={newPaymentAmount}
                onValueChange={(e) => setNewPaymentAmount(e.value || 0)}
                mode="currency"
                currency="COP"
                className="w-full"
                inputClassName="text-2xl font-black py-4 border-indigo-200"
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
              disabled={newPaymentAmount <= 0}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CalendarView;
