import React, { useState } from "react";
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

const CancelReservationPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employee } = useAuth();

  const {
    data: stay,
    isLoading: stayLoading,
    error: stayError,
  } = useStayById(stayId || null);

  const cancelStay = useCancelStay();
  const { data: roomStatuses } = useRoomStatuses();

  const roomIdFromUrl = searchParams.get("room_id");
  const tabParam = searchParams.get("tab");

  const [observation, setObservation] = useState<string>("");

  const navigateToCalendar = () => {
    navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
  };

  const handleCancel = async () => {
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
        observation: observation,
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

  const confirmCancel = () => {
    if (!observation.trim()) {
      console.log("Observacion vacia, retornando");
      return;
    }

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
      accept: handleCancel,
    });
  };

  const isFormValid = observation.trim().length > 0;

  if (stayLoading) {
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
    : "Sin huesped";
  const roomNumber = stay.room?.room_number || "-";
  const accommodationType = stay.room?.accommodation_types?.name || "-";
  const checkInDate = stay.check_in_date
    ? dayjs(stay.check_in_date).format("DD/MM/YYYY")
    : "-";
  const checkOutDate = stay.check_out_date
    ? dayjs(stay.check_out_date).format("DD/MM/YYYY")
    : "-";
  const totalPrice =
    stay.total_price?.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }) || "$0";

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
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

      <Card className="shadow-md border-0">
        <div className="flex flex-col gap-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-wide mb-3">
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
                <p className="font-bold text-lg text-gray-800">{totalPrice}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-black text-gray-500 uppercase tracking-wide">
              Motivo de cancelacion <span className="text-red-500">*</span>
            </p>
            <InputTextarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ingrese el motivo por el cual se cancela la reserva..."
              rows={4}
              className="w-full border-gray-200 rounded-xl"
            />
            <p className="text-xs text-gray-400">
              Este campo es obligatorio. La observacion quedara registrada en el
              historial.
            </p>
          </div>

          <Button
            label="Cancelar Reserva"
            icon="pi pi-times-circle"
            className="bg-red-500 hover:bg-red-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg mt-2"
            onClick={() => {
              confirmCancel();
            }}
            disabled={!isFormValid || cancelStay.isPending}
            loading={cancelStay.isPending}
          />
        </div>
      </Card>
    </div>
  );
};

export default CancelReservationPage;
