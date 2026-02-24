import React from "react";
import { Button } from "primereact/button";
import { Room, Stay } from "@/types";
import { GetReservationPaymentStatus } from "@/util/helper/helpers";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

interface StayInfoCardProps {
  activeStay: Stay;
  onGoToCheckOut: () => void;
  onCheckInAction: () => void;
  onConfirmCheckIn: () => void;
  selectedDate?: Date | null;
  activeTab: number;
  room?: Room;
}

export const StayInfoCard: React.FC<StayInfoCardProps> = ({
  activeStay,
  onGoToCheckOut,
  onCheckInAction,
  onConfirmCheckIn,
  activeTab,
  selectedDate,
  room,
}) => {
  const navigate = useNavigate();
  const paymentStatus = GetReservationPaymentStatus(activeStay);
  const pendingAmount = activeStay.total_price - activeStay.paid_amount;

  const nights = dayjs(activeStay.check_out_date).diff(dayjs(activeStay.check_in_date), "day");

  const isToday = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
    : true;

  // Verificar si ya tiene limpieza realizada
  const hasCleaning = room?.cleaning_log && room.cleaning_log.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 bg-[#f5f2eb] p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <i className="pi pi-user text-sm text-emerald-600"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">
              {activeStay.guest?.first_name} {activeStay.guest?.last_name}
            </h3>
            <span className="text-xs text-gray-500">
              {activeStay.status === "Active" ? "Estadía Activa" : "Reserva"}
            </span>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
            <i className="pi pi-calendar text-xs text-blue-600"></i>
            <span className="text-xs font-semibold text-gray-700">
              Entrada: {activeStay.check_in_date}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
            <i className="pi pi-calendar text-xs text-red-500"></i>
            <span className="text-xs font-semibold text-gray-700">
              Salida: {activeStay.check_out_date}
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
              {activeStay.person_count} pers.
            </span>
          </div>
          {activeStay.extra_mattress_count > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1">
              <i className="pi pi-circle-off text-xs text-amber-600"></i>
              <span className="text-xs font-semibold text-amber-700">
                {activeStay.extra_mattress_count} colch.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Abonado</span>
            <span className="text-sm font-bold text-emerald-600">
              ${activeStay.paid_amount?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
            <span className="text-sm font-bold text-gray-800">
              ${activeStay.total_price?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Saldo</span>
            <span
              className={`text-sm font-bold ${pendingAmount > 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              ${pendingAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {activeStay.status === "Active" ? (
          <Button
            unstyled
            icon="pi pi-sign-out"
            label="Realizar Check-out"
            className="flex h-auto w-full flex-col items-center gap-1 rounded-xl border-none bg-[#ff3d47] p-3 font-bold text-white shadow-sm"
            onClick={onGoToCheckOut}
          />
        ) : (
          <>
            {paymentStatus?.canCheckIn ? (
              isToday && (
                <Button
                  unstyled
                  icon="pi pi-sign-in"
                  label="Check-in"
                  className="flex h-auto w-full flex-col items-center gap-1 rounded-xl border-none bg-yellow-500 p-3 font-bold text-white shadow-sm"
                  onClick={onConfirmCheckIn}
                />
              )
            ) : (
              <Button
                unstyled
                icon="pi pi-dollar"
                label="Abonar"
                className="flex h-auto w-full flex-col items-center gap-1 rounded-xl border-none bg-orange-500 p-3 font-bold text-white shadow-sm"
                onClick={onCheckInAction}
              />
            )}
          </>
        )}

        {isToday && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              unstyled
              icon="pi pi-sparkles"
              label={hasCleaning ? "Limpieza realizada" : "Limpieza"}
              className="flex h-auto flex-col items-center gap-1 rounded-xl border-none bg-[#2d79ff] p-3 font-bold text-white shadow-sm"
              disabled={hasCleaning}
              onClick={() =>
                navigate(
                  `/limpieza/${activeStay.room_id}?stay_id=${activeStay.id}&tab=${activeTab}`
                )
              }
            />
            <Button
              unstyled
              icon="pi pi-wrench"
              label="Mantenimiento"
              className="flex h-auto flex-col items-center gap-1 rounded-xl border-none bg-[#6e7687] p-3 font-bold text-white shadow-sm"
              onClick={() =>
                navigate(
                  `/mantenimiento/${activeStay.room_id}?stay_id=${activeStay.id}&tab=${activeTab}`
                )
              }
            />
          </div>
        )}

        {activeStay?.origin_was_reservation && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              unstyled
              icon="pi pi-times-circle"
              label="Cancelar Reserva"
              className="flex h-auto flex-col items-center gap-1 rounded-xl border-none bg-red-500 p-3 font-bold text-white shadow-sm"
              onClick={() =>
                navigate(
                  `/cancelar-reserva/${activeStay.id}?room_id=${activeStay.room_id}&tab=${activeTab}`
                )
              }
            />
            <Button
              unstyled
              icon="pi pi-calendar-plus"
              label="Mover Reserva"
              className="flex h-auto flex-col items-center gap-1 rounded-xl border-none bg-cyan-600 p-3 font-bold text-white shadow-sm"
              onClick={() =>
                navigate(
                  `/mover-reserva/${activeStay.id}?room_id=${activeStay.room_id}&accommodation_type_id=${activeStay?.room?.accommodation_type_id}&tab=${activeTab}`
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
