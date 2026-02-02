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

export const CheckInPayment = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { data: roomStatuses } = useRoomStatuses();
  const { employee } = useAuth();
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { control, getValues, setValue, watch, register } = useForm({
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

  const getStatusId = (name: RoomStatusEnum) =>
    roomStatuses?.find((rs) => rs.name === name)?.id;

  const handlePayment = async () => {
    showBlockUI("Procesando pago...");
    const isFullPayment =
      getValues("paid_amount") >= stay?.total_price - paymentSummary?.totalPaid;
    const room_status_current_id = getStatusId(RoomStatusEnum.OCUPADO);

    const customObservation = isFullPayment
      ? "Liquidación completa de reserva"
      : "Abono parcial";
    const isApartmentAction = !!stay.accommodation_type_id;

    const keyId = isApartmentAction
      ? { accommodation_type_id: stay.accommodation_type_id }
      : { room_id: stay.room_id };

    await UpdateStay({
      id: stayId,
      paid_amount: (paymentSummary?.totalPaid || 0) + getValues("paid_amount"),
    });

    await CreatePayment({
      stay_id: stayId,
      amount: getValues("paid_amount"),
      payment_method_id: getValues("payment_method_id"),
      employee_id: employee?.id,
      observation: customObservation,
      payment_type:
        getValues("paid_amount") >= stay?.total_price
          ? PaymentType.PAGO_COMPLETO_RESERVA
          : PaymentType.ABONO_RESERVA,
      payment_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    await CreateRoomHistory({
      ...keyId,
      stay_id: stayId,
      previous_status_id: stay.room_status_id,
      new_status_id:
        pendingBalance > 0 ? stay.room_status_id : room_status_current_id,
      employee_id: employee.id,
      action_type:
        getValues("paid_amount") >= stay?.total_price
          ? PaymentType.PAGO_COMPLETO_RESERVA
          : PaymentType.ABONO_RESERVA,
      observation: customObservation,
    });

    setTimeout(() => {
      Promise.all([refetch(), refetchPaymentSummary()]).then(() =>
        hideBlockUI(),
      );
    }, 1000);
  };

  const handleCheckIn = async () => {
    showBlockUI("Procesando CheckIn...");
    const room_status_current_id = getStatusId(RoomStatusEnum.OCUPADO);

    const isApartmentAction = !!stay.accommodation_type_id;

    const keyId = isApartmentAction
      ? { accommodation_type_id: stay.accommodation_type_id }
      : { room_id: stay.room_id };

    await UpdateStay({
      id: stayId,
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
    <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button
          icon="pi pi-arrow-left"
          onClick={navigateCalendar}
          className="p-button-text p-button-plain p-button-rounded"
        />
        <h1 className="text-3xl font-black text-gray-800">
          CheckIn/Abonos Reserva
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col gap-6">
        <StaySummaryHeader stay={stay} />
        <div className="h-1 bg-gray-100"></div>
        <PaymentHistoryTable
          payments={paymentSummary?.payments || []}
          variant="compact"
        />

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-500">Total Estadía</span>
            <span className="text-xl font-bold text-gray-800">
              $ {stay?.total_price?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-500">Saldo pendiente </span>
            <span className="text-xl font-bold text-gray-800">
              $ {pendingBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sección de Abono */}
        {pendingBalance > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#eeebe4] rounded-2xl">
                <span className="text-xs text-gray-400 font-bold uppercase block mb-2">
                  Método de Pago
                </span>
                <Controller
                  name="payment_method_id"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={paymentMethods}
                      optionLabel="name"
                      optionValue="id"
                      className="w-full border-none shadow-sm"
                      placeholder="Seleccionar..."
                      filter
                    />
                  )}
                />
              </div>

              <div className="p-4 bg-[#eeebe4] rounded-2xl">
                <span className="text-xs text-gray-400 font-bold uppercase block mb-2">
                  Monto a Abonar
                </span>
                <Controller
                  name="paid_amount"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      value={field.value}
                      onValueChange={(e) => field.onChange(e.value)}
                      className="w-full"
                      inputClassName="w-full text-xl font-black text-gray-700 border-none shadow-sm"
                      mode="currency"
                      currency="COP"
                      locale="es-CO"
                      minFractionDigits={0}
                      maxFractionDigits={0}
                    />
                  )}
                />
              </div>
            </div>

            <Button
              label={
                pendingBalance > 0 ? "Confirmar Abono" : "Confirmar Check-In"
              }
              icon="pi pi-check-circle"
              className={`w-full mt-4  border-none text-white py-3 rounded-2xl font-black shadow-lg  transition-all bg-emerald-500 hover:bg-emerald-600`}
              onClick={handlePayment}
              disabled={
                !watch("paid_amount") ||
                watch("paid_amount") <= 0 ||
                !watch("payment_method_id")
              }
            />
          </div>
        )}
        {pendingBalance <= 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="p-4 bg-[#eeebe4] rounded-2xl">
                <span className="text-xs text-gray-400 font-bold uppercase block mb-2">
                  Observación del Check-in (Opcional)
                </span>
                <InputTextarea
                  {...register("observation")}
                  rows={3}
                  className="w-full bg-[#eeebe4] border-gray-100"
                  placeholder="Ingrese notas adicionales o novedades aquí..."
                />
              </div>
            </div>

            <Button
              label="Confirmar Check-In"
              icon="pi pi-check-circle"
              className={`w-full mt-4  border-none text-white py-3 rounded-2xl font-black shadow-lg  transition-all bg-emerald-500 hover:bg-emerald-600`}
              onClick={handleCheckIn}
            />
          </div>
        )}
      </div>
    </div>
  );
};
