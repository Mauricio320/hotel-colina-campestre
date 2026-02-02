import { supabase } from "@/config/supabase";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import { useStayById } from "@/hooks/useStaysQuery";
import { StaySummaryHeader } from "@/components/stays/StaySummaryHeader";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const CheckOutPage: React.FC = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: stay, isLoading: loadingStay } = useStayById(stayId);

  const { employee } = useAuth();

  const tabParam = searchParams.get("tab");

  const [finalPayment, setFinalPayment] = useState(0);
  const [observation, setObservation] = useState("");

  useEffect(() => {
    if (stay) setFinalPayment(stay.total_price - stay.paid_amount);
  }, [stay]);

  const handleCheckOut = async () => {
    showBlockUI("Procesando check-out...");
    const isApartmentAction = !!stay.accommodation_type_id;

    try {
      const _observation = `${stay.observation ?? ""} ${!observation ? "" : "\n"} ${observation ?? ""} `;

      const { data: disponibleStatus } = await supabase
        .from("room_statuses")
        .select("id")
        .eq("name", "Disponible")
        .single();

      const { error: stayError } = await supabase
        .from("stays")
        .update({
          status: "Completed",
          observation: _observation,
          active: false,
          room_status_id: disponibleStatus.id,
        })
        .eq("id", stay.id);

      if (stayError) throw stayError;

      const { data: occupiedStatus } = await supabase
        .from("room_statuses")
        .select("id")
        .eq("name", "Ocupado")
        .single();

      const finalObservation =
        `Check-out realizado${finalPayment > 0 ? ". Pago final: $" + finalPayment.toLocaleString() : ""}${observation ? ". " + observation : ""}`.trim();

      const keyId = isApartmentAction
        ? { accommodation_type_id: stay.accommodation_type_id }
        : { room_id: stay.room?.id };

      await supabase.from("room_history").insert({
        ...keyId,
        stay_id: stay.id,
        previous_status_id: occupiedStatus.id,
        new_status_id: disponibleStatus.id,
        action_type: "CHECK-OUT",
        observation: finalObservation,
        employee_id: employee?.id,
      });

      showBlockUI("Check-out procesado correctamente");
    } catch (e: any) {
      showBlockUI("Error al procesar check-out: " + e.message);
      setTimeout(hideBlockUI, 3000);
    } finally {
      setTimeout(() => {
        hideBlockUI();
        navigate(`/calendar?tab=${tabParam}`);
      }, 1500);
    }
  };

  if (loadingStay)
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

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button
          icon="pi pi-arrow-left"
          onClick={() => navigate(`/calendar?tab=${tabParam}`)}
          className="p-button-text p-button-plain p-button-rounded"
        />
        <h1 className="text-3xl font-black text-gray-800">
          Liquidación y Check-out
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col gap-6">
        <StaySummaryHeader stay={stay} />

        <div className="h-1 bg-gray-100"></div>

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
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">
            Observaciones del Check-out
          </label>
          <InputTextarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={3}
            className="w-full bg-[#eeebe4] border-gray-100"
            placeholder="Ingrese notas adicionales o novedades aquí..."
          />
        </div>

        <div className="flex justify-end">
          <Button
            label="Confirmar Check-out"
            icon="pi pi-check-circle"
            className="bg-green-500 border-none text-white  px-8 rounded-2xl font-black shadow-lg"
            onClick={handleCheckOut}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;
