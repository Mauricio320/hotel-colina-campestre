import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import { useStayById } from "@/hooks/useStaysQuery";
import { useCheckOut } from "@/hooks/useCheckOut";
import { StaySummaryHeader } from "@/components/stays/StaySummaryHeader";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import PageHeader from "@/components/ui/PageHeader";

interface CheckOutFormData {
  observation: string;
}

const CheckOutPage: React.FC = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: stay, isLoading: loadingStay } = useStayById(stayId);
  const { employee } = useAuth();
  const checkOut = useCheckOut();

  const tabParam = searchParams.get("tab");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckOutFormData>({
    mode: "onChange",
    defaultValues: {
      observation: "",
    },
  });

  const finalPayment = stay ? stay.total_price - stay.paid_amount : 0;

  const onSubmit = async (data: CheckOutFormData) => {
    if (!stay) return;

    showBlockUI("Procesando check-out...");

    try {
      const combinedObservation =
        `${stay.observation ?? ""}${data.observation ? "\n" + data.observation : ""}`.trim();

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
      <PageHeader
        title={`Liquidación y Check-out `}
        subtitle={`Factura #${stay?.order_number || "N/A"}`}
        icon="pi-file-text"
        color="emerald"
        onBack={() => navigate(`/calendar?tab=${tabParam}`)}
        backTooltip="Volver al calendario"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl"
      >
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
          <label className="text-sm font-bold text-gray-700">
            Observaciones del Check-out <span className="text-amber-500">*</span>
          </label>
          <Controller
            name="observation"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <InputTextarea
                {...field}
                rows={3}
                className={`w-full border-gray-100 bg-[#eeebe4] ${errors.observation ? "p-invalid" : ""}`}
                placeholder="Ingrese notas adicionales o novedades aquí..."
              />
            )}
          />
          {errors.observation && (
            <p className="text-xs text-red-500">{errors.observation.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            unstyled
            type="submit"
            label="Confirmar Check-out"
            icon="pi pi-check-circle"
            className="rounded-2xl border-none bg-green-500 px-8 font-black text-white shadow-lg"
          />
        </div>
      </form>
    </div>
  );
};

export default CheckOutPage;
