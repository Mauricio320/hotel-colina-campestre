import React from "react";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Employee } from "@/types";

interface TaskCompletionFormProps {
  employees: Employee[];
  selectedEmployeeId: string;
  onEmployeeChange: (id: string) => void;
  observation: string;
  onObservationChange: (text: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  placeholder?: string;
  actionColor?: string;
}

export const TaskCompletionForm: React.FC<TaskCompletionFormProps> = ({
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  observation,
  onObservationChange,
  onSubmit,
  submitLabel,
  placeholder = "Notas sobre la tarea...",
  actionColor = "blue",
}) => {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black text-gray-500 uppercase">
          Responsable
        </label>
        <Dropdown
          value={selectedEmployeeId}
          onChange={(e) => onEmployeeChange(e.value)}
          options={employees.map((emp) => ({
            ...emp,
            fullName: `${emp.first_name} ${emp.last_name}`,
          }))}
          optionLabel="fullName"
          optionValue="id"
          placeholder="Seleccione el encargado"
          className="w-full p-2 border-emerald-200"
          filter
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black text-gray-500 uppercase">
          Observación / Novedad
        </label>
        <InputTextarea
          value={observation}
          onChange={(e) => onObservationChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full border-emerald-200"
          autoFocus
        />
      </div>
      <Button
        label={submitLabel}
        icon="pi pi-check-circle"
        className={`${actionColor} border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg`}
        onClick={onSubmit}
        disabled={!selectedEmployeeId}
      />
    </div>
  );
};
