import React from "react";
import { Button } from "primereact/button";
import { Stay } from "@/types";
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
}

export const StayInfoCard: React.FC<StayInfoCardProps> = ({
  activeStay,
  onGoToCheckOut,
  onCheckInAction,
  onConfirmCheckIn,
  activeTab,
  selectedDate,
}) => {
  const navigate = useNavigate();
  const paymentStatus = GetReservationPaymentStatus(activeStay);
  const pendingAmount = activeStay.total_price - activeStay.paid_amount;

  const nights = dayjs(activeStay.check_out_date).diff(
    dayjs(activeStay.check_in_date),
    "day",
  );

  const isToday = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
    : true;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#f5f2eb] rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <i className="pi pi-user text-emerald-600 text-sm"></i>
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

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200">
            <i className="pi pi-calendar text-blue-600 text-xs"></i>
            <span className="text-xs font-semibold text-gray-700">
              Entrada: {activeStay.check_in_date}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200">
            <i className="pi pi-calendar text-red-500 text-xs"></i>
            <span className="text-xs font-semibold text-gray-700">
              Salida: {activeStay.check_out_date}
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
              {activeStay.person_count} pers.
            </span>
          </div>
          {activeStay.extra_mattress_count > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
              <i className="pi pi-circle-off text-amber-600 text-xs"></i>
              <span className="text-xs font-semibold text-amber-700">
                {activeStay.extra_mattress_count} colch.
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
              ${activeStay.paid_amount?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Total
            </span>
            <span className="text-sm font-bold text-gray-800">
              ${activeStay.total_price?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Saldo
            </span>
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
            icon="pi pi-sign-out"
            label="Realizar Check-out"
            className="p-3 bg-[#ff3d47] border-none text-white w-full font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
            onClick={onGoToCheckOut}
          />
        ) : (
          <>
            {paymentStatus?.canCheckIn ? (
              <Button
                icon="pi pi-sign-in"
                label="Check-in"
                className="p-3 bg-yellow-500 border-none text-white w-full font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
                onClick={onConfirmCheckIn}
              />
            ) : (
              <Button
                icon="pi pi-dollar"
                label="Abonar"
                className="p-3 bg-orange-500 border-none text-white w-full font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
                onClick={onCheckInAction}
              />
            )}
          </>
        )}

        {isToday && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              icon="pi pi-sparkles"
              label="Limpieza"
              className="p-3 bg-[#2d79ff] border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
              onClick={() =>
                navigate(
                  `/limpieza/${activeStay.room_id}?stay_id=${activeStay.id}&tab=${activeTab}`,
                )
              }
            />
            <Button
              icon="pi pi-wrench"
              label="Mantenimiento"
              className="p-3 bg-[#6e7687] border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
              onClick={() =>
                navigate(
                  `/mantenimiento/${activeStay.room_id}?stay_id=${activeStay.id}&tab=${activeTab}`,
                )
              }
            />
          </div>
        )}

        {activeStay?.origin_was_reservation && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              icon="pi pi-times-circle"
              label="Cancelar Reserva"
              className="p-3 bg-red-500 border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
              onClick={() =>
                navigate(
                  `/cancelar-reserva/${activeStay.id}?room_id=${activeStay.room_id}&tab=${activeTab}`,
                )
              }
            />
            <Button
              icon="pi pi-calendar-plus"
              label="Mover Reserva"
              className="p-3 bg-cyan-600 border-none text-white font-bold rounded-xl shadow-sm flex flex-col items-center gap-1 h-auto"
              onClick={() =>
                navigate(
                  `/mover-reserva/${activeStay.id}?room_id=${activeStay.room_id}&accommodation_type_id=${activeStay?.room?.accommodation_type_id}&tab=${activeTab}`,
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
