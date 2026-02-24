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
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <i className="pi pi-box text-gray-600"></i>
        <h3 className="font-bold text-gray-700">Información de la Habitación</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-[#f5f2eb] p-4">
          <span className="mb-1 block text-xs font-bold text-gray-400 uppercase">Camas Dobles</span>
          <span className="text-2xl font-black text-gray-800">{bedsDouble}</span>
        </div>
        <div className="rounded-xl bg-[#f5f2eb] p-4">
          <span className="mb-1 block text-xs font-bold text-gray-400 uppercase">
            Camas Sencillas
          </span>
          <span className="text-2xl font-black text-gray-800">{bedsSingle}</span>
        </div>
        <div className="rounded-xl bg-[#f5f2eb] p-4">
          <span className="mb-1 block text-xs font-bold text-gray-400 uppercase">
            Capacidad Máxima
          </span>
          <span className="text-2xl font-black text-gray-800">{maxCapacity} personas</span>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoCard;
