import React, { useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Controller } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DocsTypesConst } from "@/util/const/types-docs.const";
import { Guest } from "@/types";
import { useBlockUI } from "@/context/BlockUIContext";

interface ColombiaData {
  departamento: string;
  ciudades: string[];
}

interface GuestSearchState {
  searching: boolean;
  notFound: boolean;
  found: boolean;
  message: { type: "success" | "info" | null; text: string };
}

interface AllGuestsFormProps {
  searching: boolean;
  searchGuest: () => void;
  guestNotFound: boolean;
  guestFound: boolean;
  searchMessage: { type: "success" | "info" | null; text: string };
  watchDocNumber: string;
  personCount: number;
  selectedDepartment: string | null;
  colombiaData: ColombiaData[];
  cityOptions: string[];
  register: any;
  control: any;
  setValue: any;
  watch: any;
  findGuestByDoc: (docNumber: string) => Promise<Guest | null>;
}

const defaultSearchState: GuestSearchState = {
  searching: false,
  notFound: false,
  found: false,
  message: { type: null, text: "" },
};

const CompactGuestForm: React.FC<{
  index: number;
  isPrimary: boolean;
  searchState: GuestSearchState;
  onSearch: () => void;
  selectedDepartment: string | null;
  colombiaData: ColombiaData[];
  cityOptions: string[];
  register: any;
  control: any;
  setValue: any;
  watch: any;
  watchDocNumber: string;
  excludeDocNumber?: string;
}> = ({
  index,
  isPrimary,
  searchState,
  onSearch,
  selectedDepartment,
  colombiaData,
  cityOptions,
  register,
  control,
  setValue,
  watch,
  watchDocNumber,
  excludeDocNumber,
}) => {
  const fieldPrefix = isPrimary ? "" : `additional_guests.${index}.`;

  return (
    <div className="rounded-xl border border-gray-200 bg-[#f5f2eb] p-3">
      <div className="mb-2 flex items-center gap-2">
        <i className="pi pi-user text-xs text-gray-500"></i>
        <span className="text-xs font-semibold text-gray-600">
          {isPrimary ? "Huésped Principal" : `Huésped ${index + 1}`}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-3">
          <Controller
            name={`${fieldPrefix}doc_type`}
            control={control}
            render={({ field }) => (
              <Dropdown {...field} options={DocsTypesConst} className="w-full text-sm" />
            )}
          />
        </div>
        <div className="col-span-7">
          <InputText
            {...register(`${fieldPrefix}doc_number`, {
              required: true,
              validate: (value: string) => {
                if (excludeDocNumber && value === excludeDocNumber) {
                  return "Documento ya usado";
                }
                return true;
              },
            })}
            placeholder="Documento"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-2">
          <Button
            unstyled
            type="button"
            icon={searchState.searching ? "pi pi-spin pi-spinner" : "pi pi-search"}
            className="p-button-plain h-full w-full border bg-white text-xs"
            onClick={onSearch}
            disabled={searchState.searching || watchDocNumber?.length < 5}
          />
        </div>

        {searchState.message.type && (
          <div className="col-span-12">
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                searchState.message.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <i
                className={`${
                  searchState.message.type === "success" ? "pi pi-check" : "pi pi-info"
                } text-xs`}
              ></i>
              {searchState.message.text}
            </div>
          </div>
        )}

        <div className="col-span-6">
          <InputText
            {...register(`${fieldPrefix}first_name`, { required: true })}
            placeholder="Nombres *"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-6">
          <InputText
            {...register(`${fieldPrefix}last_name`, { required: true })}
            placeholder="Apellidos *"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-6">
          <InputText
            {...register(`${fieldPrefix}phone`, { required: true })}
            placeholder="Teléfono *"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-6">
          <InputText
            {...register(`${fieldPrefix}email`)}
            placeholder="Email"
            className="w-full text-sm"
          />
        </div>
        <div className="col-span-6">
          <Controller
            name={`${fieldPrefix}department`}
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={colombiaData.map((d) => d.departamento)}
                placeholder="Depto"
                className="w-full text-sm"
                onChange={(e) => {
                  field.onChange(e.value);
                  setValue(`${fieldPrefix}city`, "");
                }}
                filter
              />
            )}
          />
        </div>
        <div className="col-span-6">
          <Controller
            name={`${fieldPrefix}city`}
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
        <div className="col-span-12">
          <InputText
            {...register(`${fieldPrefix}address`)}
            placeholder="Dirección"
            className="w-full text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export const AllGuestsForm: React.FC<AllGuestsFormProps> = ({
  searching,
  searchGuest,
  guestNotFound,
  guestFound,
  searchMessage,
  watchDocNumber,
  personCount,
  selectedDepartment,
  colombiaData,
  cityOptions,
  register,
  control,
  setValue,
  watch,
  findGuestByDoc,
}) => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const [additionalSearchStates, setAdditionalSearchStates] = useState<
    Record<number, GuestSearchState>
  >({});

  const getAdditionalSearchState = (index: number): GuestSearchState => {
    return additionalSearchStates[index] || defaultSearchState;
  };

  const updateAdditionalSearchState = (index: number, state: Partial<GuestSearchState>) => {
    setAdditionalSearchStates((prev) => ({
      ...prev,
      [index]: { ...(prev[index] || defaultSearchState), ...state },
    }));
  };

  const primarySearchState: GuestSearchState = {
    searching,
    notFound: guestNotFound,
    found: guestFound,
    message: searchMessage,
  };

  const searchAdditionalGuest = async (index: number) => {
    const docNumber = watch(`additional_guests.${index}.doc_number`);

    if (!docNumber || docNumber.length < 5) return;

    updateAdditionalSearchState(index, {
      searching: true,
      notFound: false,
      found: false,
      message: { type: null, text: "" },
    });

    const fieldsToReset = [
      "first_name",
      "last_name",
      "phone",
      "email",
      "address",
      "department",
      "city",
      "doc_type",
    ];

    fieldsToReset.forEach((field) => {
      setValue(`additional_guests.${index}.${field}`, field === "doc_type" ? "CC" : "");
    });

    showBlockUI("Buscando huésped...");

    try {
      const guest = await findGuestByDoc(docNumber);

      if (guest) {
        setValue(`additional_guests.${index}.first_name`, guest.first_name);
        setValue(`additional_guests.${index}.last_name`, guest.last_name);
        setValue(`additional_guests.${index}.phone`, guest.phone || "");
        setValue(`additional_guests.${index}.email`, guest.email || "");
        setValue(`additional_guests.${index}.address`, guest.address || "");
        setValue(`additional_guests.${index}.doc_type`, guest.doc_type);

        if (guest.city) {
          const deptFound = colombiaData.find((d) => d.ciudades.includes(guest.city));
          if (deptFound) {
            setValue(`additional_guests.${index}.department`, deptFound.departamento);
            setTimeout(() => {
              setValue(`additional_guests.${index}.city`, guest.city);
            }, 0);
          } else {
            setValue(`additional_guests.${index}.city`, guest.city);
          }
        }

        updateAdditionalSearchState(index, {
          found: true,
          message: {
            type: "success",
            text: `Huésped ${guest.first_name} ${guest.last_name} encontrado.`,
          },
        });
      } else {
        updateAdditionalSearchState(index, {
          notFound: true,
          message: {
            type: "info",
            text: "No se encontró huésped con ese documento. Ingrese los datos manualmente.",
          },
        });
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
    } finally {
      hideBlockUI();
      updateAdditionalSearchState(index, { searching: false });
    }
  };

  const additionalCount = Math.max(0, personCount - 1);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
          <i className="pi pi-users text-sm text-emerald-600"></i>
        </div>
        <h3 className="font-bold text-gray-800">Datos de los Huéspedes ({personCount})</h3>
      </div>

      <div className="flex flex-col gap-3">
        <CompactGuestForm
          index={0}
          isPrimary={true}
          searchState={primarySearchState}
          onSearch={searchGuest}
          selectedDepartment={selectedDepartment}
          colombiaData={colombiaData}
          cityOptions={cityOptions}
          register={register}
          control={control}
          setValue={setValue}
          watch={watch}
          watchDocNumber={watchDocNumber}
        />

        {additionalCount > 0 && (
          <Accordion className="compact-guests-accordion">
            {Array.from({ length: additionalCount }).map((_, index) => (
              <AccordionTab key={`guest-${index}`} header={`Huésped ${index + 2}`}>
                <CompactGuestForm
                  index={index}
                  isPrimary={false}
                  searchState={getAdditionalSearchState(index)}
                  onSearch={() => searchAdditionalGuest(index)}
                  selectedDepartment={selectedDepartment}
                  colombiaData={colombiaData}
                  cityOptions={cityOptions}
                  register={register}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  watchDocNumber={watch(`additional_guests.${index}.doc_number`)}
                  excludeDocNumber={watchDocNumber}
                />
              </AccordionTab>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default AllGuestsForm;
