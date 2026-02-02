import React from "react";
import { Controller } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DocsTypesConst } from "@/util/const/types-docs.const";

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
  guestFound = false,
  searchMessage = { type: null, text: "" },
  watchDocNumber,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <i className="pi pi-users text-gray-600"></i>
        <h3 className="font-bold text-gray-700">Datos del Huésped</h3>
      </div>
      <p className="text-xs text-gray-400 font-medium mb-6">
        Busque por número de documento o ingrese los datos del nuevo huésped
      </p>

      <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
        <div className="md:col-span-2">
          <Controller
            name="doc_type"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={DocsTypesConst}
                className="w-full "
              />
            )}
          />
        </div>
        <div className="md:col-span-8 p-inputgroup">
          <InputText
            {...register("doc_number", { required: true })}
            placeholder="Número de documento"
          />
        </div>

        <div className="md:col-span-2">
          <Button
            type="button"
            icon={searching ? "pi pi-spin pi-spinner" : "pi pi-search"}
            label="Buscar"
            className="p-button-plain bg-gray-100 border  text-gray-600 font-bold  px-6 h-full"
            onClick={searchGuest}
            disabled={searching || watchDocNumber?.length < 5}
          />
        </div>

        {/* Mensajes de búsqueda - posicionados bajo el área de búsqueda */}
        {searchMessage.type && (
          <div className="md:col-span-12 mt-2 mb-4">
            <div
              className={`p-3 rounded-lg flex items-center gap-2 animate-fade-in ${
                searchMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <i
                className={`${
                  searchMessage.type === "success"
                    ? "pi pi-check-circle text-emerald-600"
                    : "pi pi-info-circle text-blue-600"
                }`}
              ></i>
              <span
                className={`text-sm font-medium ${
                  searchMessage.type === "success"
                    ? "text-emerald-700"
                    : "text-blue-700"
                }`}
              >
                {searchMessage.text}
              </span>
            </div>
          </div>
        )}

        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Nombres *</label>
          <InputText
            {...register("first_name", { required: true })}
            className="w-full bg-white "
          />
        </div>
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Apellidos *</label>
          <InputText
            {...register("last_name", { required: true })}
            className="w-full bg-white "
          />
        </div>
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Teléfono *</label>
          <InputText
            {...register("phone", { required: true })}
            className="w-full bg-white "
          />
        </div>
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Correo Electrónico
          </label>
          <InputText {...register("email")} className="w-full bg-white " />
        </div>

        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Departamento
          </label>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={colombiaData.map((d) => d.departamento)}
                placeholder="Seleccionar departamento"
                className="w-full bg-white "
                onChange={(e) => {
                  field.onChange(e.value);
                  setValue("city", "");
                }}
                filter
              />
            )}
          />
        </div>
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Municipio</label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={cityOptions}
                placeholder={
                  selectedDepartment
                    ? "Seleccionar municipio"
                    : "Primero elija departamento"
                }
                className="w-full bg-white "
                disabled={!selectedDepartment}
                filter
              />
            )}
          />
        </div>
        <div className="md:col-span-12 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Dirección</label>
          <InputText {...register("address")} className="w-full bg-white " />
        </div>
      </div>
    </div>
  );
};

export default GuestDataForm;
