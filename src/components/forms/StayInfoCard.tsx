import React from "react";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Stay } from "@/types";
import { GetReservationPaymentStatus } from "@/util/helper/helpers";

interface StayInfoCardProps {
  activeStay: Stay;
  onGoToCheckOut: () => void;
  onCheckInAction: () => void;
  onConfirmCheckIn: () => void;
}

export const StayInfoCard: React.FC<StayInfoCardProps> = ({
  activeStay,
  onGoToCheckOut,
  onCheckInAction,
  onConfirmCheckIn,
}) => {
  const paymentStatus = GetReservationPaymentStatus(activeStay);
  const pendingAmount = activeStay.total_price - activeStay.paid_amount;

  return (
    <div className="flex flex-col gap-4">
      <div className="p-6 border border-emerald-200 rounded-3xl bg-white shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">
              Huésped
            </span>
            <p className="text-2xl font-black text-gray-800 leading-tight">
              {activeStay.guest?.first_name} {activeStay.guest?.last_name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">
              Salida
            </span>
            <p className="text-base font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
              {activeStay.check_out_date}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
            <span className="text-[9px] font-black text-gray-400 uppercase">
              Abonado
            </span>
            <span className="text-sm font-black text-emerald-600">
              $ {activeStay.paid_amount?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
            <span className="text-[9px] font-black text-gray-400 uppercase">
              Total
            </span>
            <span className="text-sm font-black text-emerald-800">
              $ {activeStay.total_price?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex flex-col p-3 bg-red-50 rounded-xl">
            <span className="text-[9px] font-black text-red-400 uppercase">
              Saldo
            </span>
            <span className="text-sm font-black text-red-600">
              $ {pendingAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {activeStay.status === "Active" ? (
        <Button
          label="Realizar Check-out"
          className="bg-[#ff3d47] border-none text-white w-full py-4 text-lg font-black rounded-2xl"
          onClick={onGoToCheckOut}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {paymentStatus?.canCheckIn ? (
            <Button
              label="Check-in"
              className="bg-emerald-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg"
              onClick={onConfirmCheckIn}
            />
          ) : (
            <Button
              label="Abonar"
              className="bg-orange-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg"
              onClick={onCheckInAction}
            />
          )}
        </div>
      )}
    </div>
  );
};
