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
  onDataChange?: (data: Partial<Guest>) => void;
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
  guestFound = false,
  searchMessage = { type: null, text: "" },
  watchDocNumber,
  index,
  initialData,
  excludeDocNumber,
  title,
  compact = false,
}) => {
  const isCompact = compact || index !== undefined;
  // Pre-poblar formulario con datos iniciales si se proporcionan
  React.useEffect(() => {
    if (initialData && index !== undefined) {
      Object.keys(initialData).forEach((key) => {
        const fieldPath =
          index === undefined ? key : `additional_guests.${index}.${key}`;
        setValue(fieldPath, initialData[key]);
      });
    }
    console.log("Tenemos problemas", initialData, index, setValue);
  }, [index]);

  const formTitle =
    title ||
    (index === undefined
      ? "Datos del Huésped Principal"
      : `Huésped ${index + 1}`);

  if (isCompact) {
    return (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-3">
            <Controller
              name={
                index === undefined
                  ? "doc_type"
                  : `additional_guests.${index}.doc_type`
              }
              control={control}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={DocsTypesConst}
                  className="w-full text-sm"
                />
              )}
            />
          </div>
          <div className="col-span-7">
            <InputText
              {...register(
                index === undefined
                  ? "doc_number"
                  : `additional_guests.${index}.doc_number`,
                {
                  required: true,
                  validate: (value) => {
                    if (excludeDocNumber && value === excludeDocNumber) {
                      return "Documento ya usado";
                    }
                    return true;
                  },
                },
              )}
              placeholder="Documento"
              className="w-full text-sm"
            />
          </div>
          <div className="col-span-2">
            <Button
              type="button"
              icon={searching ? "pi pi-spin pi-spinner" : "pi pi-search"}
              className="p-button-plain bg-white border w-full h-full text-xs"
              onClick={searchGuest}
              disabled={searching || watchDocNumber?.length < 5}
            />
          </div>

          {searchMessage.type && (
            <div className="col-span-12">
              <div
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
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
                index === undefined
                  ? "first_name"
                  : `additional_guests.${index}.first_name`,
                { required: true },
              )}
              placeholder="Nombres *"
              className="w-full text-sm"
            />
          </div>
          <div className="col-span-6">
            <InputText
              {...register(
                index === undefined
                  ? "last_name"
                  : `additional_guests.${index}.last_name`,
                { required: true },
              )}
              placeholder="Apellidos *"
              className="w-full text-sm"
            />
          </div>
          <div className="col-span-6">
            <InputText
              {...register(
                index === undefined
                  ? "phone"
                  : `additional_guests.${index}.phone`,
                { required: true },
              )}
              placeholder="Teléfono *"
              className="w-full text-sm"
            />
          </div>
          <div className="col-span-6">
            <InputText
              {...register(
                index === undefined
                  ? "email"
                  : `additional_guests.${index}.email`,
              )}
              placeholder="Email"
              className="w-full text-sm"
            />
          </div>
          <div className="col-span-6">
            <Controller
              name={
                index === undefined
                  ? "department"
                  : `additional_guests.${index}.department`
              }
              control={control}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={colombiaData.map((d) => d.departamento)}
                  placeholder="Depto"
                  className="w-full text-sm"
                  onChange={(e) => {
                    field.onChange(e.value);
                    setValue(
                      index === undefined
                        ? "city"
                        : `additional_guests.${index}.city`,
                      "",
                    );
                  }}
                  filter
                />
              )}
            />
          </div>
          <div className="col-span-6">
            <Controller
              name={
                index === undefined ? "city" : `additional_guests.${index}.city`
              }
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
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <i className="pi pi-users text-gray-600"></i>
        <h3 className="font-bold text-gray-700">{formTitle}</h3>
      </div>
      <p className="text-xs text-gray-400 font-medium mb-6">
        Busque por número de documento o ingrese los datos del nuevo huésped
      </p>

      <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
        <div className="md:col-span-2">
          <Controller
            name={
              index === undefined
                ? "doc_type"
                : `additional_guests.${index}.doc_type`
            }
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
            {...register(
              index === undefined
                ? "doc_number"
                : `additional_guests.${index}.doc_number`,
              {
                required: true,
                validate: (value) => {
                  if (excludeDocNumber && value === excludeDocNumber) {
                    return "Este documento ya está siendo usado por el huésped principal";
                  }
                  return true;
                },
              },
            )}
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
            {...register(
              index === undefined
                ? "first_name"
                : `additional_guests.${index}.first_name`,
              { required: true },
            )}
            className="w-full bg-white "
          />
        </div>
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Apellidos *</label>
          <InputText
            {...register(
              index === undefined
                ? "last_name"
                : `additional_guests.${index}.last_name`,
              { required: true },
            )}
            className="w-full bg-white "
          />
        </div>
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Teléfono *</label>
          <InputText
            {...register(
              index === undefined
                ? "phone"
                : `additional_guests.${index}.phone`,
              { required: true },
            )}
            className="w-full bg-white "
          />
        </div>
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Correo Electrónico
          </label>
          <InputText
            {...register(
              index === undefined
                ? "email"
                : `additional_guests.${index}.email`,
            )}
            className="w-full bg-white "
          />
        </div>

        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">
            Departamento
          </label>
          <Controller
            name={
              index === undefined
                ? "department"
                : `additional_guests.${index}.department`
            }
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={colombiaData.map((d) => d.departamento)}
                placeholder="Seleccionar departamento"
                className="w-full bg-white "
                onChange={(e) => {
                  field.onChange(e.value);
                  setValue(
                    index === undefined
                      ? "city"
                      : `additional_guests.${index}.city`,
                    "",
                  );
                }}
                filter
              />
            )}
          />
        </div>
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Municipio</label>
          <Controller
            name={
              index === undefined ? "city" : `additional_guests.${index}.city`
            }
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
          <InputText
            {...register(
              index === undefined
                ? "address"
                : `additional_guests.${index}.address`,
            )}
            className="w-full bg-white "
          />
        </div>
      </div>
    </div>
  );
};

export default GuestDataForm;
