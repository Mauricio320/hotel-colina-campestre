import React from "react";

interface RoomInfoCardProps {
  bedsDouble?: number;
  bedsSingle?: number;
  maxCapacity: number;
}

const RoomInfoCard: React.FC<RoomInfoCardProps> = ({
  bedsDouble = 0,
  bedsSingle = 0,
  maxCapacity,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <i className="pi pi-box text-gray-600"></i>
        <h3 className="font-bold text-gray-700">
          Información de la Habitación
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#f5f2eb] p-4 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">
            Camas Dobles
          </span>
          <span className="text-2xl font-black text-gray-800">
            {bedsDouble}
          </span>
        </div>
        <div className="bg-[#f5f2eb] p-4 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">
            Camas Sencillas
          </span>
          <span className="text-2xl font-black text-gray-800">
            {bedsSingle}
          </span>
        </div>
        <div className="bg-[#f5f2eb] p-4 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">
            Capacidad Máxima
          </span>
          <span className="text-2xl font-black text-gray-800">
            {maxCapacity} personas
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoCard;
