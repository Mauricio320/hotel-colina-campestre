import React from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Controller } from "react-hook-form";

export interface StayDetailsFormProps {
  title: string;
  control: Control<any>;
  register: any;
  setValue: UseFormSetValue<any>;
  watch: any;
  checkInDate: Date | null;
  maxCapacity: number;
  settings: {
    iva: number;
    mat: number;
  };
}

const StayDetailsForm: React.FC<StayDetailsFormProps> = ({
  title,
  control,
  register,
  setValue,
  watch,
  checkInDate,
  maxCapacity,
  settings,
}) => {
  const personCount = watch("person_count");
  const extraMattressCount = watch("extra_mattress_count");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <i className="pi pi-calendar text-gray-600"></i>
        <h3 className="font-bold text-gray-700">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Fecha de Entrada *
          </label>
          <Controller
            name="check_in_date"
            control={control}
            render={({ field }) => (
              <Calendar
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                showIcon
                dateFormat="dd/mm/yy"
                className="w-full"
                readOnlyInput
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Fecha de Salida *
          </label>
          <Controller
            name="check_out_date"
            control={control}
            render={({ field }) => (
              <Calendar
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                showIcon
                dateFormat="dd/mm/yy"
                className="w-full"
                placeholder="dd/mm/aaaa"
                minDate={checkInDate}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Número de Huéspedes *
          </label>
          <Controller
            name="person_count"
            control={control}
            render={({ field }) => (
              <InputNumber
                id={field.name}
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                min={1}
                showButtons
                buttonLayout="horizontal"
                step={1}
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className="w-full"
                inputClassName="w-full"
                minFractionDigits={0}
                maxFractionDigits={0}
              />
            )}
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Colchonetas Adicionales
          </label>
          <Controller
            name="extra_mattress_count"
            control={control}
            render={({ field }) => (
              <Dropdown
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                options={Array.from({ length: 7 }, (_, i) => ({
                  label: `${i} ($ ${(i * settings.mat).toLocaleString()})`,
                  value: i,
                }))}
                className="w-full max-w-xs"
              />
            )}
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2 mt-2">
          <Controller
            name="is_invoice_requested"
            control={control}
            render={({ field }) => (
              <Checkbox
                inputId="iva"
                checked={field.value}
                onChange={(e) => field.onChange(e.checked)}
              />
            )}
          />
          <label htmlFor="iva" className="text-sm font-medium text-gray-600">
            Requiere factura electrónica (+19% IVA)
          </label>
        </div>

        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Observación (opcional)
          </label>
          <InputTextarea
            {...register("observation")}
            placeholder="Agregar observación..."
            rows={3}
            className="w-full bg-gray-50 border-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default StayDetailsForm;
