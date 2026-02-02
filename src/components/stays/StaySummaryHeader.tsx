import { Stay } from "@/types";
import React from "react";

interface StaySummaryHeaderProps {
  stay: Stay;
}

export const StaySummaryHeader: React.FC<StaySummaryHeaderProps> = ({
  stay,
}) => {
  return (
    <>
      <div>
        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
          Huésped
        </span>
        <h2 className="text-2xl font-black text-gray-800">
          {stay?.guest?.first_name} {stay?.guest?.last_name}
        </h2>
        <p className="text-gray-500 text-sm">
          {stay?.guest?.doc_type}: {stay?.guest?.doc_number}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-[#eeebe4] rounded-2xl">
          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">
            #Orden
          </span>
          <span className="text-xl font-black text-gray-700">
            {stay?.order_number}
          </span>
        </div>
        <div className="p-4 bg-[#eeebe4] rounded-2xl">
          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">
            Acomodación
          </span>
          <span className="text-xl font-black text-gray-700">
            {stay?.accommodation_type_id
              ? stay["accommodation_type"]?.name
              : `HAB ${stay?.room?.room_number} | ${stay?.room?.category}`}
          </span>
        </div>
        <div className="p-4 bg-[#eeebe4] rounded-2xl">
          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">
            Fecha Salida
          </span>
          <span className="text-xl font-black text-gray-700">
            {stay?.check_out_date}
          </span>
        </div>
      </div>
    </>
  );
};
