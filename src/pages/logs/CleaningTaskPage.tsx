import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { useRoomById } from "@/hooks/useRooms";
import { useEmployeesByRole } from "@/hooks/useEmployees";
import { useCreateCleaningLog } from "@/hooks/useCleaningLogs";
import { useStayById } from "@/hooks/useStayById";
import { useCreateRoomHistory } from "@/hooks/useRoomHistory";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useBlockUI } from "@/context/BlockUIContext";
import PageHeader from "@/components/ui/PageHeader";
import { CleaningType } from "@/types";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";

const CLEANING_TYPES: {
  label: string;
  value: CleaningType;
  icon: string;
  color: string;
}[] = [
  {
    label: "Aseo Parcial",
    value: "Aseo parcial",
    icon: "pi pi-broom",
    color: "bg-blue-500",
  },
  {
    label: "Aseo General",
    value: "Aseo general",
    icon: "pi pi-sparkles",
    color: "bg-emerald-600",
  },
];

const CleaningTaskPage: React.FC = () => {
  const { room_id } = useParams<{ room_id: string }>();
  const [searchParams] = useSearchParams();
  const { employee } = useAuth();
  const navigate = useNavigate();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { data: room, isLoading: roomLoading, error: roomError } = useRoomById(room_id || null);

  const createCleaningLog = useCreateCleaningLog();
  const createRoomHistory = useCreateRoomHistory();
  const { data: roomStatuses } = useRoomStatuses();

  const stayIdFromUrl = searchParams.get("stay_id");
  const { data: stay } = useStayById(stayIdFromUrl);
  const tabParam = searchParams.get("tab");
  const displayDate = dayjs().format("YYYY-MM-DD");

  const [selectedCleaningType, setSelectedCleaningType] = useState<CleaningType | null>(null);

  const [observation, setObservation] = useState<string>("");

  const accommodationTypeName = room?.accommodation_types?.name || "-";

  const handleCleaningTypeSelect = (type: CleaningType) => {
    setSelectedCleaningType(type);
  };

  const navigateToCalendar = () => {
    navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
  };

  const handleSubmit = async () => {
    if (!room || !employee.id || !selectedCleaningType) return;

    showBlockUI("Guardando...");
    try {
      await createCleaningLog.mutateAsync({
        room_id: room.id,
        stay_id: stayIdFromUrl || undefined,
        employee_id: employee.id,
        cleaning_type: selectedCleaningType,
        date: displayDate,
        observation: observation || "Sin novedad",
      });

      const cleaningStatus = roomStatuses?.find((s) => s.name === "Limpieza");

      await createRoomHistory.mutateAsync({
        room_id: room.id,
        stay_id: stayIdFromUrl || undefined,
        previous_status_id: cleaningStatus?.id,
        new_status_id: stay?.room_status_id ?? room?.status_id,
        employee_id: employee.id,
        action_type: "Limpieza",
        observation: observation || "Sin novedad",
      });

      navigateToCalendar();
    } finally {
      hideBlockUI();
    }
  };

  const isFormValid = room && employee.id && selectedCleaningType;

  if (roomLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ProgressSpinner />
        <p className="text-gray-500">Cargando habitación...</p>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <i className="pi pi-exclamation-circle text-5xl text-red-500"></i>
        <h3 className="text-center text-xl font-bold text-gray-800">Habitación no encontrada</h3>
        <p className="text-center text-gray-500">
          No se pudo cargar la habitación. Verifica la URL.
        </p>
        {roomError && (
          <p className="max-w-xs text-center text-xs text-red-400">Error: {roomError.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-4xl pb-12">
      <PageHeader
        title={`Hab ${room.room_number} · ${accommodationTypeName}`}
        subtitle={displayDate}
        icon="pi-home"
        tag="Limpieza"
        color="emerald"
        onBack={navigateToCalendar}
        backTooltip="Volver al calendario"
      />

      <Card className="border-0 shadow-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-black tracking-wide text-gray-500 uppercase">
              Tipo de limpieza
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CLEANING_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleCleaningTypeSelect(type.value)}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                    selectedCleaningType === type.value
                      ? `${type.color} border-transparent text-white shadow-lg`
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <i className={`${type.icon} mb-2 text-3xl`}></i>
                  <span className="font-bold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-black tracking-wide text-gray-500 uppercase">
              Observación (opcional)
            </p>
            <InputTextarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="¿Algo para reportar?"
              rows={3}
              className="w-full rounded-xl border-gray-200"
            />
          </div>

          <Button
            unstyled
            label="Guardar Registro"
            icon="pi pi-check"
            className="mt-2 w-full rounded-2xl border-none bg-emerald-600 py-4 text-lg font-black text-white shadow-lg hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={!isFormValid || createCleaningLog.isPending}
            loading={createCleaningLog.isPending}
          />
        </div>
      </Card>
    </div>
  );
};

export default CleaningTaskPage;
