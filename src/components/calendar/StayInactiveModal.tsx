import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Stay, Room, AccommodationType } from "@/types";
import { AccommodationTypeEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { RoomActionModalHeaderInfo } from "./RoomActionModalHeaderInfo";

interface StayInactiveModalProps {
  visible: boolean;
  onHide: () => void;
  stay: Stay;
  room?: Room;
  accommodationType?: AccommodationType;
  date: Date | null;
  activeTab: number;
}

export const StayInactiveModal: React.FC<StayInactiveModalProps> = ({
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

  // Verificar si es el día actual
  const isToday = date && dayjs(date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");

  // Verificar si ya tiene limpieza realizada
  const hasCleaning = room?.cleaning_log && room.cleaning_log.length > 0;

  const nights = dayjs(stay?.check_out_date).diff(dayjs(stay?.check_in_date), "day");

  const pendingAmount = (stay?.total_price || 0) - (stay?.paid_amount || 0);

  const handleVerOrden = () => {
    if (!stay?.id) return;

    navigate(`/invoice/${stay.id}`, {
      state: { from: location.pathname + location.search },
    });
    onHide();
  };

  const handleLimpieza = () => {
    const roomId =
      accommodationTypeEnum === AccommodationTypeEnum.HABITACION ? room?.id : accommodationType?.id;

    if (!roomId) return;

    const queryParams = stay?.id ? `?stay_id=${stay.id}&tab=${activeTab}` : `?tab=${activeTab}`;
    navigate(`/limpieza/${roomId}${queryParams}`);
    onHide();
  };

  const handleMantenimiento = () => {
    const roomId =
      accommodationTypeEnum === AccommodationTypeEnum.HABITACION ? room?.id : accommodationType?.id;

    if (!roomId) return;

    const queryParams = stay?.id ? `?stay_id=${stay.id}&tab=${activeTab}` : `?tab=${activeTab}`;
    navigate(`/mantenimiento/${roomId}${queryParams}`);
    onHide();
  };

  const modalHeader = (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
        <i className="pi pi-lock text-sm text-gray-600"></i>
      </div>
      <span className="font-bold text-gray-800">Estadía Finalizada</span>
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
        <div className="rounded-xl border border-gray-200 bg-[#f5f2eb] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <i className="pi pi-user text-sm text-gray-600"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {stay?.guest?.first_name} {stay?.guest?.last_name}
              </h3>
              <span className="text-xs text-gray-500">
                Estadía Finalizada - Orden #{stay?.order_number}
              </span>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
              <i className="pi pi-calendar text-xs text-blue-600"></i>
              <span className="text-xs font-semibold text-gray-700">
                Entrada: {stay?.check_in_date}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
              <i className="pi pi-calendar text-xs text-red-500"></i>
              <span className="text-xs font-semibold text-gray-700">
                Salida: {stay?.check_out_date}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
              <i className="pi pi-moon text-xs text-indigo-600"></i>
              <span className="text-xs font-semibold text-gray-700">
                {nights} noche{nights > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1">
              <i className="pi pi-users text-xs text-emerald-600"></i>
              <span className="text-xs font-semibold text-emerald-700">
                {stay?.person_count} pers.
              </span>
            </div>
            {stay?.extra_mattress_count > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1">
                <i className="pi pi-circle-off text-xs text-amber-600"></i>
                <span className="text-xs font-semibold text-amber-700">
                  {stay?.extra_mattress_count} colch.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Abonado</span>
              <span className="text-sm font-bold text-emerald-600">
                ${stay?.paid_amount?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
              <span className="text-sm font-bold text-gray-800">
                ${stay?.total_price?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Saldo</span>
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
            unstyled
            icon="pi pi-file"
            label="Ver Orden"
            className="flex h-auto w-full flex-col items-center gap-1 rounded-xl border-none bg-[#6366f1] p-3 font-bold text-white shadow-sm"
            onClick={handleVerOrden}
          />

          {/* Botones de Limpieza y Mantenimiento - solo visibles el día actual */}
          {isToday && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                unstyled
                icon="pi pi-sparkles"
                label={hasCleaning ? "Limpieza realizada" : "Limpieza"}
                className="flex h-auto flex-col items-center gap-1 rounded-xl border-none bg-[#2d79ff] p-3 font-bold text-white shadow-sm"
                hidden={accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO}
                disabled={hasCleaning}
                onClick={handleLimpieza}
              />
              <Button
                unstyled
                icon="pi pi-wrench"
                label="Mantenimiento"
                className="flex h-auto flex-col items-center gap-1 rounded-xl border-none bg-[#6e7687] p-3 font-bold text-white shadow-sm"
                hidden={accommodationTypeEnum === AccommodationTypeEnum.APARTAMENTO}
                onClick={handleMantenimiento}
              />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
