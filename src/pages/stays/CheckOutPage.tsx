import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import { useStayById } from "@/hooks/useStaysQuery";
import { useCheckOut } from "@/hooks/useCheckOut";
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
  const checkOut = useCheckOut();

  const tabParam = searchParams.get("tab");

  const [finalPayment, setFinalPayment] = useState(0);
  const [observation, setObservation] = useState("");

  useEffect(() => {
    if (stay) setFinalPayment(stay.total_price - stay.paid_amount);
  }, [stay]);

  const handleCheckOut = async () => {
    showBlockUI("Procesando check-out...");

    try {
      const combinedObservation = `${stay.observation ?? ""}${observation ? "\n" + observation : ""}`.trim();

      await checkOut.mutateAsync({
        stayId: stay.id,
        observation: combinedObservation,
        finalPayment,
        employeeId: employee?.id,
        roomId: stay.room?.id,
        accommodationTypeId: stay.accommodation_type_id,
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
    <div className="animate-fade-in mx-auto max-w-2xl pb-12">
      <div className="mb-8 flex items-center gap-4">
        <Button
          unstyled
          icon="pi pi-arrow-left"
          onClick={() => navigate(`/calendar?tab=${tabParam}`)}
          className="p-button-text p-button-plain p-button-rounded"
        />
        <h1 className="text-3xl font-black text-gray-800">Liquidación y Check-out</h1>
      </div>

      <div className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <StaySummaryHeader stay={stay} />

        <div className="h-1 bg-gray-100"></div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-500">Total Estadía</span>
            <span className="text-xl font-bold text-gray-800">
              $ {stay.total_price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-green-600">
            <span className="font-bold">Abonos Realizados</span>
            <span className="text-xl font-bold">- $ {stay.paid_amount.toLocaleString()}</span>
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
            className="w-full border-gray-100 bg-[#eeebe4]"
            placeholder="Ingrese notas adicionales o novedades aquí..."
          />
        </div>

        <div className="flex justify-end">
          <Button
            unstyled
            label="Confirmar Check-out"
            icon="pi pi-check-circle"
            className="rounded-2xl border-none bg-green-500 px-8 font-black text-white shadow-lg"
            onClick={handleCheckOut}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;
