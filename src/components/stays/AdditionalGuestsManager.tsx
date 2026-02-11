import React, { useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import GuestDataForm from "./GuestDataForm";
import { Guest } from "@/types";

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
  searching: boolean;
  register: any;
  control: any;
  setValue: any;
  watch: any;
}

export const AdditionalGuestsManager: React.FC<AdditionalGuestsManagerProps> = ({
  count,
  onGuestDataChange,
  primaryGuestDoc,
  primaryGuestData,
  selectedDepartment,
  colombiaData,
  cityOptions,
  searching,
  register,
  control,
  setValue,
  watch,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleGuestDataChange = (index: number, data: Partial<Guest>) => {
    onGuestDataChange(index, data);
  };

  const searchGuest = () => {
    // Implementar búsqueda para huéspedes adicionales si es necesario
    console.log("Buscar huésped adicional");
  };

  if (count === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <i className="pi pi-users text-gray-600"></i>
        <h3 className="font-bold text-gray-700">
          Huéspedes Adicionales ({count})
        </h3>
      </div>
      <p className="text-xs text-gray-400 font-medium mb-6">
        Complete los datos de los huéspedes adicionales (opcional)
      </p>

      <Accordion activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(Array.isArray(e.index) ? e.index[0] : e.index)}>
        {Array.from({ length: count }).map((_, index) => (
          <AccordionTab
            key={`guest-${index}`}
            header={`Huésped ${index + 1}`}
          >
            <div className="pt-4">
              <GuestDataForm
                index={index}
                initialData={primaryGuestData}
                excludeDocNumber={primaryGuestDoc}
                title={`Datos del Huésped ${index + 1}`}
                selectedDepartment={selectedDepartment}
                colombiaData={colombiaData}
                cityOptions={cityOptions}
                searching={searching}
                searchGuest={searchGuest}
                guestNotFound={false}
                register={register}
                control={control}
                setValue={setValue}
                watchDocNumber={watch(`additional_guests.${index}.doc_number`)}
              />
            </div>
          </AccordionTab>
        ))}
      </Accordion>
    </div>
  );
};

export default AdditionalGuestsManager;