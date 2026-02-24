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

const LAST_EMPLOYEE_KEY = "last_cleaning_employee_id";

const CleaningTaskPage: React.FC = () => {
  const { room_id } = useParams<{ room_id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { data: room, isLoading: roomLoading, error: roomError } = useRoomById(room_id || null);
  const {
    data: receptionistEmployees,
    isLoading: employeesLoading,
    error: employeesError,
  } = useEmployeesByRole("Recepcionista");
  const createCleaningLog = useCreateCleaningLog();
  const createRoomHistory = useCreateRoomHistory();
  const { data: roomStatuses } = useRoomStatuses();

  const stayIdFromUrl = searchParams.get("stay_id");
  const { data: stay } = useStayById(stayIdFromUrl);
  const tabParam = searchParams.get("tab");
  const displayDate = dayjs().format("YYYY-MM-DD");

  const [selectedCleaningType, setSelectedCleaningType] = useState<CleaningType | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const [observation, setObservation] = useState<string>("");

  const employees = receptionistEmployees || [];

  const accommodationTypeName = room?.accommodation_types?.name || "-";

  useEffect(() => {
    const lastEmployee = localStorage.getItem(LAST_EMPLOYEE_KEY);
    if (lastEmployee && employees.some((e) => e.id === lastEmployee)) {
      setSelectedEmployeeId(lastEmployee);
    }
  }, [employees]);

  const handleCleaningTypeSelect = (type: CleaningType) => {
    setSelectedCleaningType(type);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    localStorage.setItem(LAST_EMPLOYEE_KEY, employeeId);
  };

  const navigateToCalendar = () => {
    navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
  };

  const handleSubmit = async () => {
    if (!room || !selectedEmployeeId || !selectedCleaningType) return;

    showBlockUI("Guardando...");
    try {
      await createCleaningLog.mutateAsync({
        room_id: room.id,
        stay_id: stayIdFromUrl || undefined,
        employee_id: selectedEmployeeId,
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
        employee_id: selectedEmployeeId,
        action_type: "Limpieza",
        observation: observation || "Sin novedad",
      });

      navigateToCalendar();
    } finally {
      hideBlockUI();
    }
  };

  const isFormValid = room && selectedEmployeeId && selectedCleaningType;

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

          <div className="flex flex-col gap-3">
            <p className="text-sm font-black tracking-wide text-gray-500 uppercase">Encargado</p>

            {employeesLoading ? (
              <div className="flex items-center justify-center p-4">
                <ProgressSpinner style={{ width: "2rem", height: "2rem" }} />
              </div>
            ) : employeesError ? (
              <div className="p-4 text-center text-red-500">
                <i className="pi pi-exclamation-circle mb-2 text-2xl"></i>
                <p className="text-sm">Error al cargar empleados</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <i className="pi pi-users mb-2 text-3xl text-gray-400"></i>
                <p className="text-sm text-gray-500">No hay empleados con rol "Recepcionista"</p>
                <p className="mt-1 text-xs text-gray-400">
                  Contacta al administrador para crear empleados con este rol
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleEmployeeSelect(emp.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      selectedEmployeeId === emp.id
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                        selectedEmployeeId === emp.id
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {emp.first_name[0]}
                      {emp.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-xs text-gray-500">Recepcionista</p>
                    </div>
                    {selectedEmployeeId === emp.id && (
                      <i className="pi pi-check-circle ml-auto text-xl text-emerald-500"></i>
                    )}
                  </button>
                ))}
              </div>
            )}
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
            disabled={!isFormValid || createCleaningLog.isPending || employees.length === 0}
            loading={createCleaningLog.isPending}
          />
        </div>
      </Card>
    </div>
  );
};

export default CleaningTaskPage;
