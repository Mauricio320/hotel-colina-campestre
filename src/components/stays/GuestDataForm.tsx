import React from "react";
import { Controller } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DocsTypesConst } from "@/util/const/types-docs.const";
import { Guest } from "@/types";

interface ColombiaData {
  departamento: string;
  ciudades: string[];
}

interface GuestDataFormProps {
  selectedDepartment: string | null;
  colombiaData: ColombiaData[];
  searchGuest: () => void;
  guestNotFound: boolean;
  cityOptions: string[];
  searching: boolean;
  register: any;
  control: any;
  setValue: any;
  guestFound?: boolean;
  searchMessage?: {
    type: "success" | "info" | null;
    text: string;
  };
  watchDocNumber: string;
  index?: number;
  initialData?: Partial<Guest>;
  excludeDocNumber?: string;
  title?: string;
  compact?: boolean;
}

export const GuestDataForm: React.FC<GuestDataFormProps> = ({
  selectedDepartment,
  colombiaData,
  searchGuest,
  guestNotFound,
  cityOptions,
  searching,
  register,
  control,
  setValue,
  searchMessage = { type: null, text: "" },
  watchDocNumber,
  index,
  initialData,
  excludeDocNumber,
}) => {
  // Pre-poblar formulario con datos iniciales si se proporcionan
  React.useEffect(() => {
    if (initialData && index !== undefined) {
      Object.keys(initialData).forEach((key) => {
        const fieldPath = index === undefined ? key : `additional_guests.${index}.${key}`;
        setValue(fieldPath, initialData[key]);
      });
    }
  }, [index, initialData, setValue]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-3">
          <Controller
            name={index === undefined ? "doc_type" : `additional_guests.${index}.doc_type`}
            control={control}
            render={({ field }) => (
              <Dropdown {...field} options={DocsTypesConst} className="w-full text-sm" />
            )}
          />
        </div>
        <div className="col-span-7">
          <InputText
            {...register(
              index === undefined ? "doc_number" : `additional_guests.${index}.doc_number`,
              {
                required: true,
                validate: (value) => {
                  if (excludeDocNumber && value === excludeDocNumber) {
                    return "Documento ya usado";
                  }
                  return true;
                },
              }
            )}
            placeholder="Documento"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-2">
          <Button
            unstyled
            type="button"
            icon={searching ? "pi pi-spin pi-spinner" : "pi pi-search"}
            className="p-button-plain h-full w-full border bg-white text-xs"
            onClick={searchGuest}
            disabled={searching || watchDocNumber?.length < 5}
          />
        </div>

        {searchMessage.type && (
          <div className="col-span-12">
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                searchMessage.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <i
                className={`${
                  searchMessage.type === "success" ? "pi pi-check" : "pi pi-info"
                } text-xs`}
              ></i>
              {searchMessage.text}
            </div>
          </div>
        )}

        <div className="col-span-6">
          <InputText
            {...register(
              index === undefined ? "first_name" : `additional_guests.${index}.first_name`,
              { required: true }
            )}
            placeholder="Nombres *"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-6">
          <InputText
            {...register(
              index === undefined ? "last_name" : `additional_guests.${index}.last_name`,
              { required: true }
            )}
            placeholder="Apellidos *"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-6">
          <InputText
            {...register(index === undefined ? "phone" : `additional_guests.${index}.phone`, {
              required: true,
            })}
            placeholder="Teléfono *"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-6">
          <InputText
            {...register(index === undefined ? "email" : `additional_guests.${index}.email`)}
            placeholder="Email"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-6">
          <Controller
            name={index === undefined ? "department" : `additional_guests.${index}.department`}
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={colombiaData.map((d) => d.departamento)}
                placeholder="Depto"
                className="w-full text-sm"
                onChange={(e) => {
                  field.onChange(e.value);
                  setValue(index === undefined ? "city" : `additional_guests.${index}.city`, "");
                }}
                filter
              />
            )}
          />
        </div>
        <div className="col-span-6">
          <Controller
            name={index === undefined ? "city" : `additional_guests.${index}.city`}
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={cityOptions}
                placeholder={selectedDepartment ? "Ciudad" : "Depto primero"}
                className="w-full text-sm"
                disabled={!selectedDepartment}
                filter
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestDataForm;
