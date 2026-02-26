import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useStayById } from "@/hooks/useStayById";
import { useCancelStay } from "@/hooks/useCancelStay";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/ui/PageHeader";
import dayjs from "dayjs";
import { useForm, Controller } from "react-hook-form";

interface CancelFormData {
  observation: string;
}

const CancelReservationPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employee } = useAuth();

  const { data: stay, isLoading: stayLoading, error: stayError } = useStayById(stayId || null);

  const cancelStay = useCancelStay();
  const { data: roomStatuses } = useRoomStatuses();

  const roomIdFromUrl = searchParams.get("room_id");
  const tabParam = searchParams.get("tab");

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CancelFormData>({
    mode: "onChange",
    defaultValues: {
      observation: "",
    },
  });

  const observation = watch("observation");

  const navigateToCalendar = () => {
    navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
  };

  const handleCancel = async (data: CancelFormData) => {
    if (!stay || !stayId || !roomIdFromUrl || !employee?.id) return;

    const availableStatus = roomStatuses?.find((s) => s.name === "Disponible");
    if (!availableStatus) {
      console.error("No se encontro el estado Disponible");
      return;
    }

    showBlockUI("Cancelando reserva...");
    try {
      await cancelStay.mutateAsync({
        stayId: stayId,
        roomId: roomIdFromUrl,
        observation: data.observation,
        employeeId: employee.id,
        availableStatusId: availableStatus.id,
        previous_status_id: stay.room_status_id,
      });

      navigateToCalendar();
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
    } finally {
      hideBlockUI();
    }
  };

  const onSubmit = (data: CancelFormData) => {
    confirmDialog({
      message:
        "¿Esta seguro que desea cancelar esta reserva? Esta accion no se puede deshacer.",
      header: "Confirmar cancelacion",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Si, cancelar",
      rejectLabel: "No, volver",
      acceptIcon: "pi pi-check",
      rejectIcon: "pi pi-times",
      acceptClassName: "p-button-danger",
      accept: () => handleCancel(data),
    });
  };

  if (stayLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ProgressSpinner />
        <p className="text-gray-500">Cargando reserva...</p>
      </div>
    );
  }

  if (stayError || !stay) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <i className="pi pi-exclamation-circle text-5xl text-red-500"></i>
        <h3 className="text-center text-xl font-bold text-gray-800">Reserva no encontrada</h3>
        <p className="text-center text-gray-500">No se pudo cargar la reserva. Verifica la URL.</p>
        {stayError && (
          <p className="max-w-xs text-center text-xs text-red-400">Error: {stayError.message}</p>
        )}
      </div>
    );
  }

  const displayDate = dayjs().format("DD/MM/YYYY");
  const guestName = stay.guest ? `${stay.guest.first_name} ${stay.guest.last_name}` : "Sin huesped";
  const roomNumber = stay.room?.room_number || "-";
  const accommodationType = stay.room?.accommodation_types?.name || "-";
  const checkInDate = stay.check_in_date ? dayjs(stay.check_in_date).format("DD/MM/YYYY") : "-";
  const checkOutDate = stay.check_out_date ? dayjs(stay.check_out_date).format("DD/MM/YYYY") : "-";
  const totalPrice =
    stay.total_price?.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }) || "$0";

  return (
    <div className="animate-fade-in mx-auto max-w-4xl pb-12">
      <ConfirmDialog />
      <PageHeader
        title={`Reserva #${stay.order_number || "-"}`}
        subtitle={displayDate}
        icon="pi-times-circle"
        tag="Cancelar"
        color="red"
        onBack={navigateToCalendar}
        backTooltip="Volver al calendario"
      />

      <Card className="border-0 shadow-md">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-black tracking-wide text-gray-500 uppercase">
              Informacion de la reserva
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Habitacion</p>
                <p className="font-bold text-gray-800">
                  {roomNumber} · {accommodationType}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Huesped</p>
                <p className="font-bold text-gray-800">{guestName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Entrada</p>
                <p className="font-bold text-gray-800">{checkInDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Salida</p>
                <p className="font-bold text-gray-800">{checkOutDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-800">{totalPrice}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">
              Motivo de cancelacion <span className="text-amber-500">*</span>
            </label>
            <Controller
              name="observation"
              control={control}
              rules={{ required: "Campo requerido" }}
              render={({ field }) => (
                <InputTextarea
                  {...field}
                  placeholder="Ingrese el motivo por el cual se cancela la reserva..."
                  rows={4}
                  className={`w-full rounded-xl border-gray-200 ${errors.observation ? "p-invalid" : ""}`}
                />
              )}
            />
            {errors.observation && (
              <p className="text-xs text-red-500">{errors.observation.message}</p>
            )}
            <p className="text-xs text-gray-400">
              Este campo es obligatorio. La observacion quedara registrada en el historial.
            </p>

            <Button
              unstyled
              type="submit"
              label="Cancelar Reserva"
              icon="pi pi-times-circle"
              className="mt-4 w-full rounded-2xl border-none bg-red-500 py-4 text-lg font-black text-white shadow-lg hover:bg-red-600"
              loading={cancelStay.isPending}
            />
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CancelReservationPage;
