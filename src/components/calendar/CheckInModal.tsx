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
        <div className="text-center mb-4">
          <div className="text-2xl mb-2">🏨</div>
          <h3 className="text-lg font-bold text-gray-800">
            {selectedRoom?.room_number} - Check-in
          </h3>
          <p className="text-sm text-gray-600">
            {activeStay ? "Check-in de reserva" : "Check-in directo"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            label="Cancelar"
            className="p-button-text p-button-plain font-bold"
            onClick={onHide}
          />
          <Button
            label="Confirmar Check-in"
            icon="pi pi-check"
            className="bg-emerald-600 border-none text-white font-black py-4 rounded-xl shadow-lg"
            onClick={onConfirmCheckIn}
          />
        </div>
      </div>
    </Dialog>
  );
};
