import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";
import { StaySummaryHeader } from "@/components/stays/StaySummaryHeader";
import { useBlockUI } from "@/context/BlockUIContext";
import { GetPaymentSummary } from "@/hooks/usePayments";
import { useStayById } from "@/hooks/useStaysQuery";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { usePaymentMethods, useSettings } from "@/hooks/useSettings";
import { Dropdown } from "primereact/dropdown";
import { useAuth } from "@/hooks/useAuth";
import { PaymentType } from "@/types";
import { CreatePayment } from "@/services/payment/paymentApi";
import { CreateRoomHistory } from "@/services/room-history/roomHistoryApi";
import { UpdateStay } from "@/hooks/useStays";
import { RoomStatusEnum } from "@/util/enums/status-rooms.enum";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { InputTextarea } from "primereact/inputtextarea";
import PageHeader from "@/components/ui/PageHeader";
import dayjs from "dayjs";

const CheckInPayment = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { data: roomStatuses } = useRoomStatuses();
  const { employee } = useAuth();
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const {
    control,
    getValues,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      payment_method_id: "",
      paid_amount: 0,
      observation: "",
    },
  });

  const { data: stay, isLoading: loadingStay, refetch } = useStayById(stayId);
  const {
    data: paymentSummary,
    refetch: refetchPaymentSummary,
    isLoading,
  } = GetPaymentSummary(stayId);
  const { paymentMethods } = usePaymentMethods();
  const navigate = useNavigate();

  const pendingBalance = useMemo(() => {
    const totalPrice = stay?.total_price || 0;
    const totalPaid = paymentSummary?.totalPaid || 0;
    return Math.max(0, totalPrice - totalPaid);
  }, [stay?.total_price, paymentSummary?.totalPaid]);

  // Actualizar el monto por defecto cuando cambie el saldo pendiente
  useEffect(() => {
    if (pendingBalance > 0) {
      setValue("paid_amount", pendingBalance);
    }
  }, [pendingBalance, setValue]);

  useEffect(() => {
    if (loadingStay || isLoading) {
      showBlockUI("Cargando página...");
    } else {
      hideBlockUI();
    }
  }, [loadingStay, isLoading]);

  const navigateCalendar = () => navigate(`/calendar?tab=${tabParam}`);

  const getStatusId = (name: RoomStatusEnum) => roomStatuses?.find((rs) => rs.name === name)?.id;

  const handlePayment = async () => {
    showBlockUI("Procesando pago...");
    const paidAmount = getValues("paid_amount");
    const paymentMethod = paymentMethods?.find((pm) => pm.id === getValues("payment_method_id"));
    const isFullPayment = paidAmount >= stay?.total_price - paymentSummary?.totalPaid;
    const room_status_current_id = getStatusId(RoomStatusEnum.OCUPADO);
    const customObservation = isFullPayment ? "Liquidación completa de reserva" : "Abono parcial";
    const isApartmentAction = !!stay.accommodation_type_id;

    const keyId = isApartmentAction
      ? { accommodation_type_id: stay.accommodation_type_id }
      : { room_id: stay.room_id };

    await UpdateStay(stayId, {
      paid_amount: (paymentSummary?.totalPaid || 0) + paidAmount,
    });

    await CreatePayment({
      stay_id: stayId,
      amount: paidAmount,
      payment_method_id: getValues("payment_method_id"),
      employee_id: employee?.id,
      observation: customObservation,
      payment_type:
        paidAmount >= stay?.total_price
          ? PaymentType.PAGO_COMPLETO_RESERVA
          : PaymentType.ABONO_RESERVA,
      payment_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    const pendingAfterPayment = Math.max(0, pendingBalance - paidAmount);
    const paymentHistoryObservation = isFullPayment
      ? `${customObservation} - $${paidAmount.toLocaleString()}  (${paymentMethod?.name || "Método desconocido"})`
      : `${customObservation} - $${paidAmount.toLocaleString()}  (${paymentMethod?.name || "Método desconocido"}) - Saldo pendiente: $${pendingAfterPayment.toLocaleString()} COP`;

    await CreateRoomHistory({
      ...keyId,
      stay_id: stayId,
      previous_status_id: stay.room_status_id,
      new_status_id: pendingBalance > 0 ? stay.room_status_id : room_status_current_id,
      employee_id: employee.id,
      action_type:
        paidAmount >= stay?.total_price
          ? PaymentType.PAGO_COMPLETO_RESERVA
          : PaymentType.ABONO_RESERVA,
      observation: paymentHistoryObservation,
    });

    Promise.all([refetch(), refetchPaymentSummary()]).then(() => hideBlockUI());
  };

  const handleCheckIn = async () => {
    showBlockUI("Procesando CheckIn...");
    const room_status_current_id = getStatusId(RoomStatusEnum.OCUPADO);

    const isApartmentAction = !!stay.accommodation_type_id;

    const keyId = isApartmentAction
      ? { accommodation_type_id: stay.accommodation_type_id }
      : { room_id: stay.room_id };

    await UpdateStay(stayId, {
      room_status_id: room_status_current_id,
    });

    await CreateRoomHistory({
      ...keyId,
      stay_id: stayId,
      previous_status_id: stay.room_status_id,
      new_status_id: room_status_current_id,
      employee_id: employee.id,
      action_type: "CheckIn desde reserva",
      observation: `CheckIn desde reserva - ${getValues("observation")}`,
    });
    hideBlockUI();
    navigateCalendar();
  };

  return (
    <div className="animate-fade-in mx-auto max-w-2xl pb-12">
      <PageHeader
        title="CheckIn/Abonos Reserva"
        subtitle={dayjs().format("DD/MM/YYYY")}
        icon="pi-money-bill"
        color="emerald"
        onBack={navigateCalendar}
        backTooltip="Volver al calendario"
      />

      <div className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <StaySummaryHeader stay={stay} />
        <div className="h-1 bg-gray-100"></div>
        <PaymentHistoryTable payments={paymentSummary?.payments || []} variant="compact" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-500">Total Estadía</span>
            <span className="text-xl font-bold text-gray-800">
              $ {stay?.total_price?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-500">Saldo pendiente </span>
            <span className="text-xl font-bold text-gray-800">
              $ {pendingBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sección de Abono */}
        {pendingBalance > 0 && (
          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Método de Pago <span className="text-amber-500">*</span>
                </label>
                <Controller
                  name="payment_method_id"
                  control={control}
                  rules={{ required: "Campo requerido" }}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={paymentMethods}
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Seleccionar..."
                      filter
                      className={errors.payment_method_id ? "p-invalid" : ""}
                    />
                  )}
                />
                {errors.payment_method_id && (
                  <p className="text-xs text-red-500">{errors.payment_method_id.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Monto a Abonar <span className="text-amber-500">*</span>
                </label>
                <Controller
                  name="paid_amount"
                  control={control}
                  rules={{
                    required: "Campo requerido",
                    min: { value: 1, message: "El monto debe ser mayor a 0" },
                  }}
                  render={({ field }) => (
                    <InputNumber
                      value={field.value}
                      onValueChange={(e) => field.onChange(e.value)}
                      mode="currency"
                      currency="COP"
                      locale="es-CO"
                      minFractionDigits={0}
                      maxFractionDigits={0}
                      className={errors.paid_amount ? "p-invalid" : ""}
                    />
                  )}
                />
                {errors.paid_amount && (
                  <p className="text-xs text-red-500">{errors.paid_amount.message}</p>
                )}
              </div>
            </div>

            <Button
              unstyled
              label={pendingBalance > 0 ? "Confirmar Abono" : "Confirmar Check-In"}
              icon="pi pi-check-circle"
              className={`mt-4 w-full rounded-2xl border-none bg-emerald-500 py-3 font-black text-white shadow-lg transition-all hover:bg-emerald-600`}
              onClick={handleSubmit(handlePayment)}
            />
          </div>
        )}
        {pendingBalance <= 0 && (
          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <div className="rounded-2xl bg-[#eeebe4] p-4">
                <span className="mb-2 block text-xs font-bold text-gray-400 uppercase">
                  Observación del Check-in (Opcional)
                </span>
                <InputTextarea
                  {...register("observation")}
                  rows={3}
                  className="w-full border-gray-100 bg-[#eeebe4]"
                  placeholder="Ingrese notas adicionales o novedades aquí..."
                />
              </div>
            </div>

            <Button
              unstyled
              label="Confirmar Check-In"
              icon="pi pi-check-circle"
              className={`mt-4 w-full rounded-2xl border-none bg-emerald-500 py-3 font-black text-white shadow-lg transition-all hover:bg-emerald-600`}
              onClick={handleCheckIn}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default CheckInPayment;
