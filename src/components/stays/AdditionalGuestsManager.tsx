import React, { useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import GuestDataForm from "./GuestDataForm";
import { Guest } from "@/types";
import { useBlockUI } from "@/context/BlockUIContext";

interface ColombiaData {
  departamento: string;
  ciudades: string[];
}

interface AdditionalGuestsManagerProps {
  count: number;
  onGuestDataChange: (index: number, data: Partial<Guest>) => void;
  primaryGuestDoc: string;
  primaryGuestData: Partial<Guest>;
  selectedDepartment: string | null;
  colombiaData: ColombiaData[];
  cityOptions: string[];
  register: any;
  control: any;
  setValue: any;
  watch: any;
  findGuestByDoc: (docNumber: string) => Promise<Guest | null>;
}

interface GuestSearchState {
  searching: boolean;
  notFound: boolean;
  found: boolean;
  message: { type: "success" | "info" | null; text: string };
}

export const AdditionalGuestsManager: React.FC<AdditionalGuestsManagerProps> = ({
  count,
  onGuestDataChange,
  primaryGuestDoc,
  primaryGuestData,
  selectedDepartment,
  colombiaData,
  cityOptions,
  register,
  control,
  setValue,
  watch,
  findGuestByDoc,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const [searchStates, setSearchStates] = useState<Record<number, GuestSearchState>>({});

  const defaultSearchState: GuestSearchState = {
    searching: false,
    notFound: false,
    found: false,
    message: { type: null, text: "" },
  };

  const getSearchState = (index: number): GuestSearchState => {
    return searchStates[index] || defaultSearchState;
  };

  const updateSearchState = (index: number, state: Partial<GuestSearchState>) => {
    setSearchStates((prev) => ({
      ...prev,
      [index]: { ...(prev[index] || defaultSearchState), ...state },
    }));
  };

  const handleGuestDataChange = (index: number, data: Partial<Guest>) => {
    onGuestDataChange(index, data);
  };

  const searchGuest = async (index: number) => {
    const docNumber = watch(`additional_guests.${index}.doc_number`);

    if (!docNumber || docNumber.length < 5) return;

    updateSearchState(index, {
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
          const deptFound = colombiaData.find((d) =>
            d.ciudades.includes(guest.city),
          );
          if (deptFound) {
            setValue(`additional_guests.${index}.department`, deptFound.departamento);
            setTimeout(() => {
              setValue(`additional_guests.${index}.city`, guest.city);
            }, 0);
          } else {
            setValue(`additional_guests.${index}.city`, guest.city);
          }
        }

        updateSearchState(index, {
          found: true,
          message: {
            type: "success",
            text: `Huésped ${guest.first_name} ${guest.last_name} encontrado.`,
          },
        });
      } else {
        updateSearchState(index, {
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
      updateSearchState(index, { searching: false });
    }
  };

  if (count === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <i className="pi pi-users text-gray-600 text-sm"></i>
          <h3 className="font-bold text-gray-700 text-sm">
            Huéspedes Adicionales ({count})
          </h3>
        </div>
        <span className="text-xs text-gray-400">Opcional</span>
      </div>

      <Accordion activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(Array.isArray(e.index) ? e.index[0] : e.index)} className="compact-accordion">
        {Array.from({ length: count }).map((_, index) => {
          const searchState = getSearchState(index);

          return (
            <AccordionTab
              key={`guest-${index}`}
              header={`Huésped ${index + 1}`}
            >
              <div className="pt-2">
                <GuestDataForm
                  index={index}
                  initialData={primaryGuestData}
                  excludeDocNumber={primaryGuestDoc}
                  selectedDepartment={selectedDepartment}
                  colombiaData={colombiaData}
                  cityOptions={cityOptions}
                  searching={searchState.searching}
                  searchGuest={() => searchGuest(index)}
                  guestNotFound={searchState.notFound}
                  guestFound={searchState.found}
                  searchMessage={searchState.message}
                  register={register}
                  control={control}
                  setValue={setValue}
                  watchDocNumber={watch(`additional_guests.${index}.doc_number`)}
                  compact
                />
              </div>
            </AccordionTab>
          );
        })}
      </Accordion>
    </div>
  );
};

export default AdditionalGuestsManager;
