import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { useCleaningLogs, useCreateCleaningLog } from "@/hooks/useCleaningLogs";
import { useRooms } from "@/hooks/useRooms";
import { useEmployeesByRole } from "@/hooks/useEmployees";
import { useBlockUI } from "@/context/BlockUIContext";
import { CleaningType } from "@/types";
import dayjs from "dayjs";

const CLEANING_TYPES: { label: string; value: CleaningType }[] = [
  { label: "Aseo parcial", value: "Aseo parcial" },
  { label: "Aseo general", value: "Aseo general" },
];

const CleaningLogs: React.FC = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { data: cleaningLogs, isLoading: logsLoading } = useCleaningLogs();
  const { roomsQuery } = useRooms();
  const { data: cleaningEmployees } = useEmployeesByRole("Limpieza");
  const createCleaningLog = useCreateCleaningLog();

  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedCleaningType, setSelectedCleaningType] = useState<CleaningType | "">("");
  const [observation, setObservation] = useState<string>("");

  const rooms = roomsQuery.data || [];
  const employees = cleaningEmployees || [];

  const handleSubmit = async () => {
    if (!selectedRoomId || !selectedEmployeeId || !selectedCleaningType) return;

    showBlockUI("Guardando registro de limpieza...");
    try {
      await createCleaningLog.mutateAsync({
        room_id: selectedRoomId,
        employee_id: selectedEmployeeId,
        cleaning_type: selectedCleaningType,
        observation: observation || undefined,
        date: dayjs().format(),
      });

      setSelectedRoomId("");
      setSelectedEmployeeId("");
      setSelectedCleaningType("");
      setObservation("");
    } finally {
      hideBlockUI();
    }
  };

  const isFormValid = selectedRoomId && selectedEmployeeId && selectedCleaningType;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-800">Registro de Limpieza</h2>

      <Card
        title="Nuevo Registro de Limpieza"
        className="shadow-md"
        pt={{
          title: { className: "text-lg font-bold text-emerald-800" },
          content: { className: "p-4" },
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-500 uppercase">Habitación</label>
            <Dropdown
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.value)}
              options={rooms.map((room) => ({
                ...room,
                label: `Habitación ${room.room_number}`,
              }))}
              optionLabel="label"
              optionValue="id"
              placeholder="Seleccione habitación"
              className="w-full"
              filter
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-500 uppercase">Tipo de Limpieza</label>
            <Dropdown
              value={selectedCleaningType}
              onChange={(e) => setSelectedCleaningType(e.value)}
              options={CLEANING_TYPES}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione tipo"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-500 uppercase">
              Encargado de Limpieza
            </label>
            <Dropdown
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.value)}
              options={employees.map((emp) => ({
                ...emp,
                fullName: `${emp.first_name} ${emp.last_name}`,
              }))}
              optionLabel="fullName"
              optionValue="id"
              placeholder="Seleccione encargado"
              className="w-full"
              filter
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
            <label className="text-xs font-black text-gray-500 uppercase">Observación</label>
            <InputTextarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Notas sobre la limpieza..."
              rows={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            unstyled
            label="Guardar Registro"
            icon="pi pi-check-circle"
            className="rounded-xl border-none bg-emerald-600 px-6 py-3 text-base font-black text-white shadow-lg hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={!isFormValid || createCleaningLog.isPending}
            loading={createCleaningLog.isPending}
          />
        </div>
      </Card>

      <Card
        title="Historial de Limpiezas"
        className="shadow-md"
        pt={{
          title: { className: "text-lg font-bold text-emerald-800" },
          content: { className: "p-4" },
        }}
      >
        {logsLoading ? (
          <div className="flex justify-center p-8">
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={cleaningLogs || []}
            responsiveLayout="scroll"
            className="p-datatable-sm"
            emptyMessage="No hay registros de limpieza."
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
          >
            <Column
              field="created_at"
              header="Fecha y Hora"
              body={(row) => dayjs(row.created_at).format("DD/MM/YYYY HH:mm")}
              sortable
            />
            <Column
              field="room.room_number"
              header="Habitación"
              body={(row) => `Habitación ${row.room?.room_number || "-"}`}
              sortable
            />
            <Column field="cleaning_type" header="Tipo de Limpieza" sortable />
            <Column
              header="Encargado"
              body={(row) =>
                row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : "-"
              }
              sortable
            />
            <Column
              field="observation"
              header="Observación"
              body={(row) => row.observation || "-"}
            />
            <Column
              header="Estancia Asociada"
              body={(row) =>
                row.stay
                  ? `#${row.stay.order_number} - ${row.stay.guest?.first_name} ${row.stay.guest?.last_name}`
                  : "-"
              }
            />
          </DataTable>
        )}
      </Card>
    </div>
  );
};

export default CleaningLogs;
