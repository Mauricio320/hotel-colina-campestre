import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Card } from "primereact/card";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Checkbox } from "primereact/checkbox";
import { useStayById } from "@/hooks/useStayById";
import { RoomsQueryCategory } from "@/hooks/useRooms";
import { useMoveStay, useCheckRoomAvailability } from "@/hooks/useMoveStay";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/ui/PageHeader";
import AvailabilityConflictModal from "@/components/stays/AvailabilityConflictModal";
import dayjs from "dayjs";
import { Room, Stay } from "@/types";
import { FormattedConflicts } from "@/util/helper/formattedConflicts";
import { useRoomRates } from "@/hooks/useRoomRates";
import { useSettings } from "@/hooks/useSettings";
import { useStayPricing } from "@/hooks/useStayPricing";

interface RoomOption {
  label: string;
  value: string;
  room: Room;
}

interface MoveReservationFormData {
  selectedRoomId: string;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  observation: string;
  personCount: number;
  extraMattressCount: number;
  isInvoiceRequested: boolean;
}

const MoveReservationPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employee } = useAuth();

  const roomIdFromUrl = searchParams.get("room_id");
  const tabParam = searchParams.get("tab");
  const accommodation_type_id = searchParams.get("accommodation_type_id");

  const {
    data: stay,
    isLoading: stayLoading,
    error: stayError,
  } = useStayById(stayId || null);
  const { data: roomsQuery } = RoomsQueryCategory(accommodation_type_id);
  const moveStay = useMoveStay();
  const checkAvailability = useCheckRoomAvailability();
  const { settings } = useSettings();

  // Estado para conflictos de disponibilidad
  const [conflicts, setConflicts] = useState<Stay[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MoveReservationFormData>({
    mode: "onChange",
    defaultValues: {
      selectedRoomId: "",
      checkInDate: null,
      checkOutDate: null,
      observation: "",
      personCount: 1,
      extraMattressCount: 0,
      isInvoiceRequested: false,
    },
  });

  const selectedRoomId = watch("selectedRoomId");
  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");
  const personCount = watch("personCount");
  const extraMattressCount = watch("extraMattressCount");
  const isInvoiceRequested = watch("isInvoiceRequested");

  useEffect(() => {
    if (stay) {
      reset({
        selectedRoomId: stay.room_id || "",
        checkInDate: stay.check_in_date ? new Date(stay.check_in_date + "T12:00:00") : null,
        checkOutDate: stay.check_out_date ? new Date(stay.check_out_date + "T12:00:00") : null,
        observation: "",
        personCount: stay.person_count || 1,
        extraMattressCount: stay.extra_mattress_count || 0,
        isInvoiceRequested: stay.is_invoice_requested || false,
      });
    }
  }, [stay, reset]);

  const navigateToCalendar = () => {
    navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
  };

  const roomOptions: RoomOption[] =
    roomsQuery?.map((room) => ({
      label: `Hab. ${room.room_number} - ${room.accommodation_types?.name || "Sin tipo"}`,
      value: room.id,
      room,
    })) || [];

  const selectedRoom = roomOptions.find(
    (opt) => opt.value === selectedRoomId,
  )?.room;
  const currentRoom = stay?.room;
  const isRoomChanged = currentRoom?.id !== selectedRoomId;
  const isDatesChanged =
    stay &&
    checkInDate &&
    checkOutDate &&
    (dayjs(checkInDate).format("YYYY-MM-DD") !==
      dayjs(stay.check_in_date).format("YYYY-MM-DD") ||
      dayjs(checkOutDate).format("YYYY-MM-DD") !==
        dayjs(stay.check_out_date).format("YYYY-MM-DD"));

  // Tarifas de la habitación seleccionada
  const { data: roomRates } = useRoomRates(selectedRoomId || null);

  // Cálculo dinámico del precio nuevo
  const { nights, priceInfo } = useStayPricing({
    room: selectedRoom as any,
    checkInDate,
    checkOutDate,
    personCount,
    extraMattressCount,
    invoiceRequested: isInvoiceRequested,
    settings,
    roomRates,
  });

  const isGuestsOrMattressChanged =
    stay &&
    (personCount !== (stay.person_count || 1) ||
      extraMattressCount !== (stay.extra_mattress_count || 0));

  const mattressOptions = Array.from({ length: 7 }, (_, i) => ({
    label: `${i}${i > 0 ? ` ($${(i * settings.mat).toLocaleString()})` : ""}`,
    value: i,
  }));

  const onSubmit = async (data: MoveReservationFormData) => {
    if (!stay || !stayId || !employee?.id) return;
    if (!data.checkInDate || !data.checkOutDate) return;

    showBlockUI("Moviendo reserva...");
    try {
      await moveStay.mutateAsync({
        stayId: stayId,
        currentRoomId: roomIdFromUrl,
        newRoomId: data.selectedRoomId,
        newCheckInDate: dayjs(data.checkInDate).format("YYYY-MM-DD"),
        newCheckOutDate: dayjs(data.checkOutDate).format("YYYY-MM-DD"),
        moveDate: dayjs().format("YYYY-MM-DD"),
        employeeId: employee.id,
        observation: data.observation.trim() || undefined,
        stayStatusId: stay.room_status_id || "",
        personCount: data.personCount,
        extraMattressCount: data.extraMattressCount,
        newTotalPrice: priceInfo.total,
        extraMattressPrice: data.extraMattressCount * settings.mat * nights,
        isInvoiceRequested: data.isInvoiceRequested,
        ivaAmount: priceInfo.iva,
        ivaPercentage: settings.iva,
      });

      const newTotalIsHigher = priceInfo.total > (stay.total_price || 0);

      if (newTotalIsHigher) {
        hideBlockUI();
        confirmDialog({
          message: `El nuevo total ($${priceInfo.total.toLocaleString()}) es mayor al anterior ($${(stay.total_price || 0).toLocaleString()}). ¿Desea registrar un pago ahora?`,
          header: "Registrar pago",
          icon: "pi pi-credit-card",
          acceptLabel: "Sí, ir a pagos",
          rejectLabel: "No, volver al calendario",
          acceptIcon: "pi pi-check",
          rejectIcon: "pi pi-times",
          acceptClassName: "p-button-success",
          accept: () => navigate(tabParam ? `/check-in-payment/${stayId}?tab=${tabParam}` : `/check-in-payment/${stayId}`),
          reject: () => navigateToCalendar(),
        });
      } else {
        navigateToCalendar();
      }
    } catch (error: any) {
      console.error("Error al mover reserva:", error);
    } finally {
      hideBlockUI();
    }
  };

  const handleCheckAndConfirm = async (data: MoveReservationFormData) => {
    if (!stay || !stayId) return;
    if (!data.checkInDate || !data.checkOutDate) return;

    try {
      // Verificar disponibilidad de la habitación seleccionada
      const result = await checkAvailability.mutateAsync({
        roomId: data.selectedRoomId,
        checkInDate: dayjs(data.checkInDate).format("YYYY-MM-DD"),
        checkOutDate: dayjs(data.checkOutDate).format("YYYY-MM-DD"),
        excludeStayId: stayId,
      });

      if (!result.available && result.conflictingStays) {
        const formattedConflicts: Stay[] = FormattedConflicts(
          result.conflictingStays,
        );
        setConflicts(formattedConflicts);
        setShowConflictModal(true);
        return;
      }

      const changes: string[] = [];
      if (isRoomChanged) {
        changes.push(`habitación a ${selectedRoom?.room_number}`);
      }
      if (isDatesChanged) {
        changes.push(
          `fechas a ${dayjs(data.checkInDate).format("DD/MM/YYYY")} - ${dayjs(data.checkOutDate).format("DD/MM/YYYY")}`,
        );
      }
      if (isGuestsOrMattressChanged) {
        changes.push(`huéspedes a ${data.personCount} y colchonetas a ${data.extraMattressCount}`);
      }

      confirmDialog({
        message: `¿Está seguro que desea modificar esta reserva? Se cambiará ${changes.join(", ")}.`,
        header: "Confirmar cambios",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "Sí, guardar",
        rejectLabel: "No, volver",
        acceptIcon: "pi pi-check",
        rejectIcon: "pi pi-times",
        acceptClassName: "p-button-warning",
        accept: () => onSubmit(data),
      });
    } catch (error: any) {
      console.error("Error al verificar disponibilidad:", error);
    }
  };

  if (stayLoading || !roomsQuery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ProgressSpinner />
        <p className="text-gray-500">Cargando reserva...</p>
      </div>
    );
  }

  if (stayError || !stay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <i className="pi pi-exclamation-circle text-5xl text-red-500"></i>
        <h3 className="text-xl font-bold text-gray-800 text-center">
          Reserva no encontrada
        </h3>
        <p className="text-gray-500 text-center">
          No se pudo cargar la reserva. Verifica la URL.
        </p>
        {stayError && (
          <p className="text-xs text-red-400 text-center max-w-xs">
            Error: {stayError.message}
          </p>
        )}
      </div>
    );
  }

  const displayDate = dayjs().format("DD/MM/YYYY");
  const guestName = stay.guest
    ? `${stay.guest.first_name} ${stay.guest.last_name}`
    : "Sin huésped";
  const roomNumber = stay.room?.room_number || "-";
  const currentCheckInDate = stay.check_in_date
    ? dayjs(stay.check_in_date).format("DD/MM/YYYY")
    : "-";
  const currentCheckOutDate = stay.check_out_date
    ? dayjs(stay.check_out_date).format("DD/MM/YYYY")
    : "-";
  const totalPrice =
    stay.total_price?.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }) || "$0";

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in px-4 sm:px-6">
      <ConfirmDialog />
      <AvailabilityConflictModal
        visible={showConflictModal}
        onHide={() => setShowConflictModal(false)}
        conflicts={conflicts}
        context="move"
      />
      <PageHeader
        title={`Reserva #${stay.order_number || "-"}`}
        subtitle={displayDate}
        icon="pi-calendar"
        tag="Mover"
        color="amber"
        onBack={navigateToCalendar}
        backTooltip="Volver al calendario"
      />

      <Card className="shadow-md border-0">
        <form
          onSubmit={handleSubmit(handleCheckAndConfirm)}
          className="flex flex-col gap-6"
        >
          {/* Info actual */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-wide mb-3">
              Información actual de la reserva
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Habitación</p>
                <p className="font-bold text-gray-800">{roomNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Huésped</p>
                <p className="font-bold text-gray-800">{guestName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Personas</p>
                <p className="font-bold text-gray-800">{stay.person_count || 1}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Colchonetas</p>
                <p className="font-bold text-gray-800">{stay.extra_mattress_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Entrada actual</p>
                <p className="font-bold text-gray-800">{currentCheckInDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Salida actual</p>
                <p className="font-bold text-gray-800">{currentCheckOutDate}</p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-xs text-gray-500">Total actual</p>
                <p className="font-bold text-lg text-gray-800">{totalPrice}</p>
              </div>
            </div>
          </div>

          {/* Nuevos datos */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-wide">
              Nuevos datos de la reserva
            </h3>

            {/* Habitación */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Habitación <span className="text-amber-500">*</span>
              </label>
              <Controller
                name="selectedRoomId"
                control={control}
                rules={{ required: "Campo requerido" }}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    options={roomOptions}
                    placeholder="Seleccionar habitación"
                    className={`w-full ${errors.selectedRoomId ? "p-invalid" : ""}`}
                    panelClassName="rounded-xl"
                  />
                )}
              />
              {errors.selectedRoomId && (
                <p className="text-xs text-red-500">
                  {errors.selectedRoomId.message}
                </p>
              )}
              {isRoomChanged && (
                <p className="text-xs text-amber-600 font-medium">
                  <i className="pi pi-info-circle mr-1"></i>
                  Se cambiará de habitación {currentRoom?.room_number} a{" "}
                  {selectedRoom?.room_number}
                </p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Nueva fecha de entrada{" "}
                  <span className="text-amber-500">*</span>
                </label>
                <Controller
                  name="checkInDate"
                  control={control}
                  rules={{ required: "Campo requerido" }}
                  render={({ field }) => (
                    <Calendar
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value as Date)}
                      dateFormat="dd/mm/yy"
                      placeholder="Seleccionar fecha"
                      className={`w-full ${errors.checkInDate ? "p-invalid" : ""}`}
                      showIcon
                      iconPos="right"
                    />
                  )}
                />
                {errors.checkInDate && (
                  <p className="text-xs text-red-500">
                    {errors.checkInDate.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Nueva fecha de salida{" "}
                  <span className="text-amber-500">*</span>
                </label>
                <Controller
                  name="checkOutDate"
                  control={control}
                  rules={{
                    required: "Campo requerido",
                    validate: (value) => {
                      if (!value || !checkInDate) return true;
                      return (
                        dayjs(value).isAfter(dayjs(checkInDate)) ||
                        "La fecha de salida debe ser posterior a la fecha de entrada"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <Calendar
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value as Date)}
                      dateFormat="dd/mm/yy"
                      placeholder="Seleccionar fecha"
                      className={`w-full ${errors.checkOutDate ? "p-invalid" : ""}`}
                      showIcon
                      iconPos="right"
                      minDate={checkInDate || new Date()}
                    />
                  )}
                />
                {errors.checkOutDate && (
                  <p className="text-xs text-red-500">
                    {errors.checkOutDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Personas y colchonetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Cantidad de personas <span className="text-amber-500">*</span>
                </label>
                <Controller
                  name="personCount"
                  control={control}
                  rules={{ required: "Campo requerido" }}
                  render={({ field }) => (
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      options={
                        roomRates && roomRates.length > 0
                          ? roomRates.map((rate) => ({
                              label: `${rate.person_count} pers. - $${rate.rate.toLocaleString()}`,
                              value: rate.person_count,
                            }))
                          : Array.from({ length: 10 }, (_, i) => ({
                              label: `${i + 1} persona${i > 0 ? "s" : ""}`,
                              value: i + 1,
                            }))
                      }
                      placeholder="Seleccione"
                      className={`w-full ${errors.personCount ? "p-invalid" : ""}`}
                    />
                  )}
                />
                {errors.personCount && (
                  <p className="text-xs text-red-500">{errors.personCount.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Colchonetas adicionales
                </label>
                <Controller
                  name="extraMattressCount"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      options={mattressOptions}
                      placeholder="0"
                      className="w-full"
                    />
                  )}
                />
              </div>
            </div>

            {/* Factura electrónica */}
            <div className="flex items-center gap-2 pt-1">
              <Controller
                name="isInvoiceRequested"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    inputId="isInvoiceRequested"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.checked)}
                  />
                )}
              />
              <label htmlFor="isInvoiceRequested" className="text-sm font-medium text-gray-700 cursor-pointer">
                Requiere factura electrónica <span className="text-gray-500">(+{settings.iva}% IVA)</span>
              </label>
            </div>

            {/* Resumen de precio nuevo */}
            {selectedRoom && checkInDate && checkOutDate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="text-sm font-black text-amber-700 uppercase tracking-wide mb-3">
                  Nuevo precio estimado
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Tarifa/noche ({personCount} pers.)
                    </span>
                    <span className="font-medium text-gray-800">
                      ${priceInfo.rate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Hospedaje ({nights} noche{nights > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium text-gray-800">
                      ${priceInfo.subtotalHospedaje.toLocaleString()}
                    </span>
                  </div>
                  {extraMattressCount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Colchonetas ({extraMattressCount} x ${settings.mat.toLocaleString()} x {nights} noche{nights > 1 ? "s" : ""})
                      </span>
                      <span className="font-medium text-gray-800">
                        ${(extraMattressCount * settings.mat * nights).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-amber-200 my-2"></div>
                  {isInvoiceRequested && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">IVA ({settings.iva}%)</span>
                      <span className="font-medium text-gray-800">
                        ${priceInfo.iva.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Nuevo total</span>
                    <span className="text-xl font-black text-amber-700">
                      ${priceInfo.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Observación */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Observación <span className="text-amber-500">*</span>
              </label>
              <Controller
                name="observation"
                control={control}
                rules={{ required: "Campo requerido" }}
                render={({ field }) => (
                  <InputTextarea
                    {...field}
                    placeholder="Ingrese alguna observación sobre el movimiento..."
                    rows={3}
                    className={`w-full border-gray-200 rounded-xl ${errors.observation ? "p-invalid" : ""}`}
                  />
                )}
              />
              {errors.observation && (
                <p className="text-xs text-red-500">
                  {errors.observation.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            label="Guardar cambios"
            icon="pi pi-calendar-plus"
            className="bg-amber-500 hover:bg-amber-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg mt-2"
            loading={moveStay.isPending || checkAvailability.isPending}
          />

          {moveStay.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <i className="pi pi-exclamation-circle text-red-500 mt-0.5"></i>
              <div>
                <p className="text-sm font-bold text-red-700">
                  Error al mover la reserva
                </p>
                <p className="text-xs text-red-600">
                  {(moveStay.error as Error).message}
                </p>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default MoveReservationPage;
