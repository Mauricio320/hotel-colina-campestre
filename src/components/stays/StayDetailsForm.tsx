import React from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { Controller } from "react-hook-form";
import { RoomRate } from "@/types";

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
  roomRates?: RoomRate[];
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
  roomRates = [],
}) => {
  const personCount = watch("person_count");
  const extraMattressCount = watch("extra_mattress_count");
  const checkOutDate = watch("check_out_date");

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <i className="pi pi-calendar text-blue-600 text-sm"></i>
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>

      <div className="bg-[#f5f2eb] rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Entrada *
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Salida *
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Huéspedes *
            </label>
            <Controller
              name="person_count"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id={field.name}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={roomRates.map((rate) => ({
                    label: `${rate.person_count} pers. - $${rate.rate.toLocaleString()}`,
                    value: rate.person_count,
                  }))}
                  placeholder="Seleccione"
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Colchonetas
            </label>
            <Controller
              name="extra_mattress_count"
              control={control}
              render={({ field }) => (
                <Dropdown
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={Array.from({ length: 7 }, (_, i) => ({
                    label: `${i} ($${(i * settings.mat).toLocaleString()})`,
                    value: i,
                  }))}
                  placeholder="0"
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Observación
            </label>
            <InputTextarea
              {...register("observation")}
              placeholder="Agregar observación..."
              rows={2}
              className="w-full bg-white border-gray-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-300">
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
          <label htmlFor="iva" className="text-sm font-medium text-gray-700">
            Requiere factura electrónica <span className="text-gray-500">(+19% IVA)</span>
          </label>
        </div>
      </div>

      {personCount > 0 && checkOutDate && (
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
            <i className="pi pi-users text-emerald-600 text-xs"></i>
            <span className="text-xs font-semibold text-emerald-700">{personCount} pers.</span>
          </div>
          {extraMattressCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
              <i className="pi pi-circle-off text-amber-600 text-xs"></i>
              <span className="text-xs font-semibold text-amber-700">{extraMattressCount} colch.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StayDetailsForm;
