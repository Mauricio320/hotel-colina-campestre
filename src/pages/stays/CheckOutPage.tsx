import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { InputTextarea } from "primereact/inputtextarea";
import { useStays } from "@/hooks/useStays";
import { useRooms } from "@/hooks/useRooms";
import { useAuth } from "@/hooks/useAuth";
import { usePayments } from "@/hooks/usePayments";
import { useBlockUI } from "@/context/BlockUIContext";
import { supabase } from "@/config/supabase";
import { Stay } from "@/types";

const CheckOutPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const stayId = searchParams.get("stayId");
  const navigate = useNavigate();
  const { employee } = useAuth();
  const { updateStatus } = useRooms();
  const { createPaymentWithAutoType } = usePayments();
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stay, setStay] = useState<Stay | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [finalPayment, setFinalPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [observation, setObservation] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!stayId) return;

      const { data: stayData } = await supabase
        .from("stays")
        .select("*, guest:guests(*), room:rooms(*)")
        .eq("id", stayId)
        .single();

      if (stayData) {
        setStay(stayData);
        setFinalPayment(stayData.total_price - stayData.paid_amount);
      }

      const { data: methods } = await supabase
        .from("payment_methods")
        .select("*");
      if (methods) {
        setPaymentMethods(methods);
        setPaymentMethod(methods[0].id);
      }
      setLoading(false);
    };

    fetchData();
  }, [stayId]);

  const handleCheckOut = async () => {
    if (!stay) return;

    if (finalPayment > 0 && !paymentMethod) {
      alert("Por favor seleccione un método de pago");
      return;
    }

    setSubmitting(true);
    showBlockUI("Procesando check-out...");

    try {
      const todayStr = new Date().toLocaleDateString("sv-SE");

      // 1. Si hay pago final, registrar en la tabla payments
      if (finalPayment > 0) {
        await createPaymentWithAutoType({
          stay_id: stay.id,
          payment_method_id: paymentMethod,
          employee_id: employee?.id || "",
          amount: finalPayment,
          totalPrice: stay.total_price,
          context: "checkin_direct", // Es un pago de cierre
          customObservation: `Pago final de check-out${observation ? ": " + observation : ""}`,
        });
      }

      // 2. Actualizar la estadía como completada
      const { error: stayError } = await supabase
        .from("stays")
        .update({
          status: "Completed",
          observation: observation || stay.observation,
        })
        .eq("id", stay.id);

      if (stayError) throw stayError;

      // 3. Cambiar estado de la habitación a "Limpieza"
      const { data: cleaningStatus } = await supabase
        .from("room_statuses")
        .select("id")
        .eq("name", "Limpieza")
        .single();

      if (cleaningStatus) {
        const finalObservation =
          `Check-out realizado${finalPayment > 0 ? ". Pago final: $" + finalPayment.toLocaleString() : ""}${observation ? ". " + observation : ""}`.trim();

        await updateStatus.mutateAsync({
          roomId: roomId!,
          stayId: stay.id,
          statusId: cleaningStatus.id,
          actionType: "CHECK-OUT",
          employeeId: employee?.id,
          statusDate: todayStr,
          observation: finalObservation,
        });
      }

      showBlockUI("Check-out procesado correctamente");
      setTimeout(() => {
        navigate("/calendar");
      }, 1500);
    } catch (e: any) {
      showBlockUI("Error al procesar check-out: " + e.message);
      setTimeout(hideBlockUI, 3000);
    } finally {
      setSubmitting(false);
      hideBlockUI();
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-24">
        <ProgressSpinner />
      </div>
    );
  if (!stay)
    return (
      <div className="p-8">
        <Message severity="error" text="Estadía no encontrada" />
      </div>
    );

  const pendingAmount = stay.total_price - stay.paid_amount;

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button
          icon="pi pi-arrow-left"
          onClick={() => navigate("/calendar")}
          className="p-button-text p-button-plain p-button-rounded"
        />
        <h1 className="text-3xl font-black text-gray-800">
          Liquidación y Check-out
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col gap-6">
        <div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            Huésped
          </span>
          <h2 className="text-2xl font-black text-gray-800">
            {stay.guest?.first_name} {stay.guest?.last_name}
          </h2>
          <p className="text-gray-500 text-sm">
            {stay.guest?.doc_type}: {stay.guest?.doc_number}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <span className="text-xs text-gray-400 font-bold uppercase block mb-1">
              Habitación
            </span>
            <span className="text-xl font-black text-gray-700">
              {stay.room?.room_number}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <span className="text-xs text-gray-400 font-bold uppercase block mb-1">
              Fecha Salida
            </span>
            <span className="text-xl font-black text-gray-700">
              {stay.check_out_date}
            </span>
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-500">Total Estadía</span>
            <span className="text-xl font-bold text-gray-800">
              $ {stay.total_price.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-green-600">
            <span className="font-bold">Abonos Realizados</span>
            <span className="text-xl font-bold">
              - $ {stay.paid_amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-6 bg-red-50 rounded-2xl text-red-700 border border-red-100">
            <span className="text-lg font-black uppercase">
              Saldo Pendiente
            </span>
            <span className="text-3xl font-black">
              $ {pendingAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {pendingAmount > 0 && (
          <div className="bg-gray-50 p-6 rounded-3xl border flex flex-col gap-4">
            <h3 className="font-black text-gray-700">Registrar Pago Final</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Monto Recibido
              </label>
              <InputNumber
                value={finalPayment}
                onValueChange={(e) => setFinalPayment(e.value || 0)}
                mode="currency"
                currency="COP"
                className="w-full"
                inputClassName="text-2xl font-black py-4"
                minFractionDigits={0}
                maxFractionDigits={0}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Método de Pago
              </label>
              <Dropdown
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.value)}
                options={paymentMethods}
                optionLabel="name"
                optionValue="id"
                className="w-full p-2"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">
            Observaciones del Check-out
          </label>
          <InputTextarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={3}
            className="w-full bg-gray-50 border-gray-100"
            placeholder="Ingrese notas adicionales o novedades aquí..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            label="Cancelar"
            className="p-button-outlined p-button-secondary py-4 rounded-2xl font-bold"
            onClick={() => navigate("/calendar")}
          />
          <Button
            label="Confirmar Check-out"
            icon="pi pi-check-circle"
            className="bg-[#ff3d47] border-none text-white py-4 rounded-2xl font-black shadow-lg"
            onClick={handleCheckOut}
            loading={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;
