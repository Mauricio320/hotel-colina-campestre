import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useRoomById } from "@/hooks/useRooms";
import { useEmployeesByRole } from "@/hooks/useEmployees";
import {
  useMaintenanceCategories,
  useMaintenanceSubcategories,
} from "@/hooks/useMaintenanceCategories";
import { useCreateMaintenanceLog } from "@/hooks/useMaintenanceLogs";
import { useStayById } from "@/hooks/useStayById";
import { useCreateRoomHistory } from "@/hooks/useRoomHistory";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useBlockUI } from "@/context/BlockUIContext";
import PageHeader from "@/components/ui/PageHeader";
import { MaintenanceCategory, MaintenanceSubcategory } from "@/types";
import dayjs from "dayjs";

const LAST_EMPLOYEE_KEY = "last_maintenance_employee_id";

const MaintenanceTaskPage: React.FC = () => {
  const { room_id } = useParams<{ room_id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const { data: room, isLoading: roomLoading, error: roomError } = useRoomById(room_id || null);

  const {
    data: maintenanceEmployees,
    isLoading: employeesLoading,
    error: employeesError,
  } = useEmployeesByRole("Mantenimiento");

  const { data: categories, isLoading: categoriesLoading } = useMaintenanceCategories();

  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<MaintenanceSubcategory | null>(
    null
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [observation, setObservation] = useState<string>("");

  const { data: subcategories, isLoading: subcategoriesLoading } = useMaintenanceSubcategories(
    selectedCategory?.id || null
  );

  const createMaintenanceLog = useCreateMaintenanceLog();
  const createRoomHistory = useCreateRoomHistory();
  const { data: roomStatuses } = useRoomStatuses();

  const stayIdFromUrl = searchParams.get("stay_id");
  const { data: stay } = useStayById(stayIdFromUrl);
  const tabParam = searchParams.get("tab");
  const displayDate = dayjs().format("DD/MM/YYYY");

  const employees = maintenanceEmployees || [];
  const accommodationTypeName = room?.accommodation_types?.name || "-";

  useEffect(() => {
    const lastEmployee = localStorage.getItem(LAST_EMPLOYEE_KEY);
    if (lastEmployee && employees.some((e) => e.id === lastEmployee)) {
      setSelectedEmployeeId(lastEmployee);
    }
  }, [employees]);

  const handleCategorySelect = (category: MaintenanceCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: MaintenanceSubcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    localStorage.setItem(LAST_EMPLOYEE_KEY, employeeId);
  };

  const navigateToCalendar = () => {
    navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
  };

  const navigateToCalendarAfterSave = () => {
    navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
  };

  const handleSubmit = async () => {
    if (!room || !selectedEmployeeId || !selectedCategory || !selectedSubcategory) return;

    showBlockUI("Guardando...");
    try {
      await createMaintenanceLog.mutateAsync({
        room_id: room.id,
        stay_id: stayIdFromUrl || undefined,
        employee_id: selectedEmployeeId,
        category_id: selectedCategory.id,
        subcategory_id: selectedSubcategory.id,
        observation: observation || "Sin novedad",
        date: dayjs().format("YYYY-MM-DD"),
      });

      const maintenanceStatus = roomStatuses?.find((s) => s.name === "Mantenimiento");

      await createRoomHistory.mutateAsync({
        room_id: room.id,
        stay_id: stayIdFromUrl || undefined,
        previous_status_id: maintenanceStatus?.id,
        new_status_id: stay?.room_status_id || room?.status_id,
        employee_id: selectedEmployeeId,
        action_type: "Mantenimiento",
        observation: observation || "Sin novedad",
      });

      confirmDialog({
        message: "¿Desea registrar un nuevo mantenimiento?",
        header: "Mantenimiento guardado",
        icon: "pi pi-check-circle",
        acceptLabel: "Sí, registrar otro",
        rejectLabel: "No, volver al calendario",
        acceptIcon: "pi pi-plus",
        rejectIcon: "pi pi-calendar",
        acceptClassName: "p-button-success",
        accept: () => {
          setSelectedCategory(null);
          setSelectedSubcategory(null);
          setObservation("");
        },
        reject: () => {
          navigateToCalendarAfterSave();
        },
      });
    } finally {
      hideBlockUI();
    }
  };

  const isFormValid = room && selectedEmployeeId && selectedCategory && selectedSubcategory;

  if (roomLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ProgressSpinner />
        <p className="text-gray-500">Cargando habitacion...</p>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <i className="pi pi-exclamation-circle text-5xl text-red-500"></i>
        <h3 className="text-center text-xl font-bold text-gray-800">Habitacion no encontrada</h3>
        <p className="text-center text-gray-500">
          No se pudo cargar la habitacion. Verifica la URL.
        </p>
        {roomError && (
          <p className="max-w-xs text-center text-xs text-red-400">Error: {roomError.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-4xl pb-12">
      <ConfirmDialog />
      <PageHeader
        title={`Hab ${room.room_number} · ${accommodationTypeName}`}
        subtitle={displayDate}
        icon="pi-wrench"
        tag="Mantenimiento"
        color="amber"
        onBack={navigateToCalendar}
        backTooltip="Volver al calendario"
      />

      <Card className="border-0 shadow-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-black tracking-wide text-gray-500 uppercase">Categoria</p>
            {categoriesLoading ? (
              <div className="flex items-center justify-center p-4">
                <ProgressSpinner style={{ width: "2rem", height: "2rem" }} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                      selectedCategory?.id === category.id
                        ? `border-transparent text-white shadow-lg`
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    style={
                      selectedCategory?.id === category.id
                        ? { backgroundColor: category.color || "#f59e0b" }
                        : {}
                    }
                  >
                    <span className="text-center font-bold">{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCategory && (
            <div className="animate-fade-in flex flex-col gap-3">
              <p className="text-sm font-black tracking-wide text-gray-500 uppercase">
                Tipo de problema
              </p>
              {subcategoriesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <ProgressSpinner style={{ width: "2rem", height: "2rem" }} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {subcategories?.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubcategorySelect(sub)}
                      className={`flex items-center justify-center rounded-xl border-2 p-3 text-center transition-all ${
                        selectedSubcategory?.id === sub.id
                          ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-bold">{sub.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                <p className="text-sm text-gray-500">No hay empleados con rol "Mantenimiento"</p>
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
                        ? "border-amber-500 bg-amber-50 shadow-sm"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                        selectedEmployeeId === emp.id
                          ? "bg-amber-500 text-white"
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
                      <p className="text-xs text-gray-500">Mantenimiento</p>
                    </div>
                    {selectedEmployeeId === emp.id && (
                      <i className="pi pi-check-circle ml-auto text-xl text-amber-500"></i>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-black tracking-wide text-gray-500 uppercase">
              Observacion (opcional)
            </p>
            <InputTextarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Describe el problema con mas detalle..."
              rows={3}
              className="w-full rounded-xl border-gray-200"
            />
          </div>

          <Button
            unstyled
            label="Guardar Mantenimiento"
            icon="pi pi-check"
            className="mt-2 w-full rounded-2xl border-none bg-amber-500 py-4 text-lg font-black text-white shadow-lg hover:bg-amber-600"
            onClick={handleSubmit}
            disabled={!isFormValid || createMaintenanceLog.isPending || employees.length === 0}
            loading={createMaintenanceLog.isPending}
          />
        </div>
      </Card>
    </div>
  );
};

export default MaintenanceTaskPage;
