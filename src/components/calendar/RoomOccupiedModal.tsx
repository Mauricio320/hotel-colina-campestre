import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Stay, Room, AccommodationType } from "@/types";
import { AccommodationTypeEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { RoomActionModalHeaderInfo } from "./RoomActionModalHeaderInfo";

interface RoomOccupiedModalProps {
  visible: boolean;
  onHide: () => void;
  stay: Stay;
  room?: Room;
  accommodationType?: AccommodationType;
  date: Date | null;
  activeTab: number;
}

export const RoomOccupiedModal: React.FC<RoomOccupiedModalProps> = ({
  visible,
  onHide,
  stay,
  room,
  accommodationType,
  date,
  activeTab,
}) => {
  const navigate = useNavigate();

  const accommodationTypeEnum = room
    ? AccommodationTypeEnum.HABITACION
    : AccommodationTypeEnum.APARTAMENTO;

  const nights = dayjs(stay?.check_out_date).diff(
    dayjs(stay?.check_in_date),
    "day"
  );

  const pendingAmount = stay?.total_price - (stay?.paid_amount || 0);

  const handleGoToCheckOut = () => {
    if (!stay?.id) return;

    const params = [`tab=${activeTab}`, `action=${accommodationTypeEnum}`];
    const url = `/check-out/${stay?.id}?${params.join("&")}`;
    navigate(url);
    onHide();
  };

  const handleLimpieza = () => {
    const roomId =
      accommodationTypeEnum === AccommodationTypeEnum.HABITACION
        ? room?.id
        : accommodationType?.id;

    if (!roomId) return;

    const queryParams = stay?.id
      ? `?stay_id=${stay?.id}&tab=${activeTab}`
      : `?tab=${activeTab}`;
    navigate(`/limpieza/${roomId}${queryParams}`);
    onHide();
  };

  const handleMantenimiento = () => {
    const roomId =
      accommodationTypeEnum === AccommodationTypeEnum.HABITACION
        ? room?.id
        : accommodationType?.id;

    if (!roomId) return;

    const queryParams = stay?.id
      ? `?stay_id=${stay?.id}&tab=${activeTab}`
      : `?tab=${activeTab}`;
    navigate(`/mantenimiento/${roomId}${queryParams}`);
    onHide();
  };

  const modalHeader = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
        <i className="pi pi-sign-out text-red-600 text-sm"></i>
      </div>
      <span className="font-bold text-gray-800">Habitación Ocupada</span>
    </div>
  );

  return (
    <Dialog
      header={modalHeader}
      visible={visible}
      onHide={onHide}
      className="w-full max-w-[500px]"
      breakpoints={{ "960px": "90vw", "641px": "95vw" }}
      dismissableMask
    >
      <div className="flex flex-col gap-5 py-2">
        <RoomActionModalHeaderInfo
          accommodationTypeEnum={accommodationTypeEnum}
          date={date}
          room={room}
        />

        {/* Información del huésped y estadía */}
        <div className="bg-[#f5f2eb] rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <i className="pi pi-user text-emerald-600 text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {stay?.guest?.first_name} {stay?.guest?.last_name}
              </h3>
              <span className="text-xs text-gray-500">
                Estadía Activa - Orden #{stay?.order_number}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200">
              <i className="pi pi-calendar text-blue-600 text-xs"></i>
              <span className="text-xs font-semibold text-gray-700">
                Entrada: {stay?.check_in_date}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200">
              <i className="pi pi-calendar text-red-500 text-xs"></i>
              <span className="text-xs font-semibold text-gray-700">
                Salida: {stay?.check_out_date}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200">
              <i className="pi pi-moon text-indigo-600 text-xs"></i>
              <span className="text-xs font-semibold text-gray-700">
                {nights} noche{nights > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
              <i className="pi pi-users text-emerald-600 text-xs"></i>
              <span className="text-xs font-semibold text-emerald-700">
                {stay?.person_count} pers.
              </span>
            </div>
            {stay?.extra_mattress_count > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                <i className="pi pi-circle-off text-amber-600 text-xs"></i>
                <span className="text-xs font-semibold text-amber-700">
                  {stay?.extra_mattress_count} colch.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col p-2 bg-white rounded-lg border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Abonado
              </span>
              <span className="text-sm font-bold text-emerald-600">
                ${stay?.paid_amount?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex flex-col p-2 bg-white rounded-lg border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Total
              </span>
              <span className="text-sm font-bold text-gray-800">
                ${stay?.total_price?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex flex-col p-2 bg-white rounded-lg border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Saldo
              </span>
              <span
                className={`text-sm font-bold ${
                  pendingAmount > 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                ${pendingAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          <Button
            icon="pi pi-sign-out"
            label="Realizar Check-out"
            className="p-3 bg-[#ff3d47] border-none text-white w-full font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
            onClick={handleGoToCheckOut}
          />

          <div className="grid grid-cols-2 gap-3">
            <Button
              icon="pi pi-sparkles"
              label="Limpieza"
              className="p-3 bg-[#2d79ff] border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
              hidden={accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO}
              onClick={handleLimpieza}
            />
            <Button
              icon="pi pi-wrench"
              label="Mantenimiento"
              className="p-3 bg-[#6e7687] border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
              hidden={accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO}
              onClick={handleMantenimiento}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
