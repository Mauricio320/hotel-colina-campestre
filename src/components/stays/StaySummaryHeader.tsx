import { Stay } from "@/types";
import React from "react";

interface StaySummaryHeaderProps {
  stay: Stay;
}

export const StaySummaryHeader: React.FC<StaySummaryHeaderProps> = ({ stay }) => {
  return (
    <>
      <div>
        <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
          Huésped
        </span>
        <h2 className="text-2xl font-black text-gray-800">
          {stay?.guest?.first_name} {stay?.guest?.last_name}
        </h2>
        <p className="text-sm text-gray-500">
          {stay?.guest?.doc_type}: {stay?.guest?.doc_number}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl bg-[#eeebe4] p-3 sm:p-4">
          <span className="mb-1 block text-[10px] font-bold text-gray-400 uppercase sm:text-xs">
            #Orden
          </span>
          <span className="text-base font-black break-words text-gray-700 sm:text-xl">
            {stay?.order_number}
          </span>
        </div>
        <div className="rounded-2xl bg-[#eeebe4] p-3 sm:p-4">
          <span className="mb-1 block text-[10px] font-bold text-gray-400 uppercase sm:text-xs">
            Acomodación
          </span>
          <span className="text-base leading-tight font-black break-words text-gray-700 sm:text-xl">
            {stay?.accommodation_type_id
              ? stay["accommodation_type"]?.name
              : `HAB ${stay?.room?.room_number} | ${stay?.room?.category}`}
          </span>
        </div>
        <div className="col-span-2 rounded-2xl bg-[#eeebe4] p-3 sm:col-span-1 sm:p-4">
          <span className="mb-1 block text-[10px] font-bold text-gray-400 uppercase sm:text-xs">
            Fecha Salida
          </span>
          <span className="text-base font-black break-words text-gray-700 sm:text-xl">
            {stay?.check_out_date}
          </span>
        </div>
      </div>
    </>
  );
};
