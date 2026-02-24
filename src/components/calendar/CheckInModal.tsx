import { Room, Stay } from "@/types";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import React from "react";

interface CheckInModalProps {
  visible: boolean;
  onHide: () => void;
  selectedRoom: Room | null;
  activeStay: Stay | null;
  onConfirmCheckIn: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  onHide,
  selectedRoom,
  activeStay,
  onConfirmCheckIn,
}) => {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Confirmar Check-in"
      modal
      className="w-full max-w-md"
      resizable={false}
      draggable={false}
    >
      <div className="flex flex-col gap-4">
        <div className="mb-4 text-center">
          <div className="mb-2 text-2xl">🏨</div>
          <h3 className="text-lg font-bold text-gray-800">
            {selectedRoom?.room_number} - Check-in
          </h3>
          <p className="text-sm text-gray-600">
            {activeStay ? "Check-in de reserva" : "Check-in directo"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Button
            unstyled
            label="Cancelar"
            className="p-button-text p-button-plain font-bold"
            onClick={onHide}
          />
          <Button
            unstyled
            label="Confirmar Check-in"
            icon="pi pi-check"
            className="rounded-xl border-none bg-emerald-600 py-4 font-black text-white shadow-lg"
            onClick={onConfirmCheckIn}
          />
        </div>
      </div>
    </Dialog>
  );
};
