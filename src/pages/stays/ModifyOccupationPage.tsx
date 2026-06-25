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
import { useMoveStay, useCheckRoomAvailability } from "@/hooks/useMoveStay";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/ui/PageHeader";
import AvailabilityConflictModal from "@/components/stays/AvailabilityConflictModal";
import dayjs from "dayjs";
import { Stay } from "@/types";
import { FormattedConflicts } from "@/util/helper/formattedConflicts";
import { useRoomRates } from "@/hooks/useRoomRates";
import { useSettings } from "@/hooks/useSettings";
import { useStayPricing } from "@/hooks/useStayPricing";

interface ModifyOccupationFormData {
  checkInDate: Date | null;
  checkOutDate: Date | null;
  observation: string;
  personCount: number;
  extraMattressCount: number;
  isInvoiceRequested: boolean;
}

const ModifyOccupationPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employee } = useAuth();

  const tabParam = searchParams.get("tab");

  const { data: stay, isLoading: stayLoading, error: stayError } = useStayById(stayId || null);
  const moveStay = useMoveStay();
  const checkAvailability = useCheckRoomAvailability();
  const { settings } = useSettings();

  const [conflicts, setConflicts] = useState<Stay[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ModifyOccupationFormData>({
    mode: "onChange",
    defaultValues: {
      checkInDate: null,
      checkOutDate: null,
      observation: "",
      personCount: 1,
      extraMattressCount: 0,
      isInvoiceRequested: false,
    },
  });

  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");
  const personCount = watch("personCount");
  const extraMattressCount = watch("extraMattressCount");
  const isInvoiceRequested = watch("isInvoiceRequested");

  useEffect(() => {
    if (stay) {
      reset({
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

  const currentRoom = stay?.room;

  const isDatesChanged =
    stay &&
    checkInDate &&
    checkOutDate &&
    (dayjs(checkInDate).format("YYYY-MM-DD") !== dayjs(stay.check_in_date).format("YYYY-MM-DD") ||
      dayjs(checkOutDate).format("YYYY-MM-DD") !== dayjs(stay.check_out_date).format("YYYY-MM-DD"));

  const { data: roomRates } = useRoomRates(stay?.room_id || null);

  const { nights, priceInfo } = useStayPricing({
    room: currentRoom as any,
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

  const onSubmit = async (data: ModifyOccupationFormData) => {
    if (!stay || !stayId || !employee?.id || !stay.room_id) return;
    if (!data.checkInDate || !data.checkOutDate) return;

    showBlockUI("Actualizando ocupación...");
    try {
      await moveStay.mutateAsync({
        stayId: stayId,
        currentRoomId: stay.room_id,
        newRoomId: stay.room_id,
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
          accept: () =>
            navigate(
              tabParam
                ? `/check-in-payment/${stayId}?tab=${tabParam}`
                : `/check-in-payment/${stayId}`
            ),
          reject: () => navigateToCalendar(),
        });
      } else {
        navigateToCalendar();
      }
    } catch (error: any) {
      console.error("Error al modificar ocupación:", error);
    } finally {
      hideBlockUI();
    }
  };

  const handleCheckAndConfirm = async (data: ModifyOccupationFormData) => {
    if (!stay || !stayId || !stay.room_id) return;
    if (!data.checkInDate || !data.checkOutDate) return;

    try {
      const result = await checkAvailability.mutateAsync({
        roomId: stay.room_id,
        checkInDate: dayjs(data.checkInDate).format("YYYY-MM-DD"),
        checkOutDate: dayjs(data.checkOutDate).format("YYYY-MM-DD"),
        excludeStayId: stayId,
      });

      if (!result.available && result.conflictingStays) {
        const formattedConflicts: Stay[] = FormattedConflicts(result.conflictingStays);
        setConflicts(formattedConflicts);
        setShowConflictModal(true);
        return;
      }

      const changes: string[] = [];
      if (isDatesChanged) {
        changes.push(
          `fechas a ${dayjs(data.checkInDate).format("DD/MM/YYYY")} - ${dayjs(data.checkOutDate).format("DD/MM/YYYY")}`
        );
      }
      if (isGuestsOrMattressChanged) {
        changes.push(`huéspedes a ${data.personCount} y colchonetas a ${data.extraMattressCount}`);
      }

      confirmDialog({
        message: changes.length
          ? `¿Está seguro que desea modificar esta ocupación? Se cambiará ${changes.join(", ")}.`
          : "¿Está seguro que desea guardar los cambios de esta ocupación?",
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

  if (stayLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ProgressSpinner />
        <p className="text-gray-500">Cargando ocupación...</p>
      </div>
    );
  }

  if (stayError || !stay) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <i className="pi pi-exclamation-circle text-5xl text-red-500"></i>
        <h3 className="text-center text-xl font-bold text-gray-800">Ocupación no encontrada</h3>
        <p className="text-center text-gray-500">No se pudo cargar la estadía. Verifica la URL.</p>
        {stayError && (
          <p className="max-w-xs text-center text-xs text-red-400">Error: {stayError.message}</p>
        )}
      </div>
    );
  }

  const displayDate = dayjs().format("DD/MM/YYYY");
  const guestName = stay.guest ? `${stay.guest.first_name} ${stay.guest.last_name}` : "Sin huésped";
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
    <div className="animate-fade-in mx-auto max-w-4xl px-4 pb-12 sm:px-6">
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
        icon="pi-pencil"
        tag="Ocupación"
        color="amber"
        onBack={navigateToCalendar}
        backTooltip="Volver al calendario"
      />

      <Card className="border-0 shadow-md">
        <form onSubmit={handleSubmit(handleCheckAndConfirm)} className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-black tracking-wide text-gray-500 uppercase">
              Información actual de la ocupación
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
                <p className="text-lg font-bold text-gray-800">{totalPrice}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black tracking-wide text-gray-500 uppercase">
              Nuevos datos de la ocupación
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Nueva fecha de entrada <span className="text-amber-500">*</span>
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
                  <p className="text-xs text-red-500">{errors.checkInDate.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Nueva fecha de salida <span className="text-amber-500">*</span>
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
                  <p className="text-xs text-red-500">{errors.checkOutDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <label className="text-sm font-bold text-gray-700">Colchonetas adicionales</label>
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
              <label
                htmlFor="isInvoiceRequested"
                className="cursor-pointer text-sm font-medium text-gray-700"
              >
                Requiere factura electrónica{" "}
                <span className="text-gray-500">(+{settings.iva}% IVA)</span>
              </label>
            </div>

            {currentRoom && checkInDate && checkOutDate && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="mb-3 text-sm font-black tracking-wide text-amber-700 uppercase">
                  Nuevo precio estimado
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tarifa/noche ({personCount} pers.)</span>
                    <span className="font-medium text-gray-800">
                      ${priceInfo.rate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Hospedaje ({nights} noche{nights > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium text-gray-800">
                      ${priceInfo.subtotalHospedaje.toLocaleString()}
                    </span>
                  </div>
                  {extraMattressCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Colchonetas ({extraMattressCount} x ${settings.mat.toLocaleString()} x{" "}
                        {nights} noche
                        {nights > 1 ? "s" : ""})
                      </span>
                      <span className="font-medium text-gray-800">
                        ${(extraMattressCount * settings.mat * nights).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="my-2 h-px bg-amber-200"></div>
                  {isInvoiceRequested && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">IVA ({settings.iva}%)</span>
                      <span className="font-medium text-gray-800">
                        ${priceInfo.iva.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">Nuevo total</span>
                    <span className="text-xl font-black text-amber-700">
                      ${priceInfo.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                    placeholder="Ingrese alguna observación sobre la modificación..."
                    rows={3}
                    className={`w-full rounded-xl border-gray-200 ${errors.observation ? "p-invalid" : ""}`}
                  />
                )}
              />
              {errors.observation && (
                <p className="text-xs text-red-500">{errors.observation.message}</p>
              )}
            </div>
          </div>

          <Button
            unstyled
            type="submit"
            label="Guardar cambios"
            icon="pi pi-pencil"
            className="mt-2 w-full rounded-2xl border-none bg-amber-500 py-4 text-lg font-black text-white shadow-lg hover:bg-amber-600"
            loading={moveStay.isPending || checkAvailability.isPending}
          />

          {moveStay.error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <i className="pi pi-exclamation-circle mt-0.5 text-red-500"></i>
              <div>
                <p className="text-sm font-bold text-red-700">Error al modificar la ocupación</p>
                <p className="text-xs text-red-600">{(moveStay.error as Error).message}</p>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ModifyOccupationPage;
