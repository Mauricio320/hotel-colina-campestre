import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Room, Stay } from '@/types';

interface CheckInModalProps {
  visible: boolean;
  onHide: () => void;
  selectedRoom: Room | null;
  activeStay: Stay | null;
  checkInObservation: string;
  onCheckInObservationChange: (value: string) => void;
  onConfirmCheckIn: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  onHide,
  selectedRoom,
  activeStay,
  checkInObservation,
  onCheckInObservationChange,
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
            {activeStay ? 'Check-in de reserva' : 'Check-in directo'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-black text-gray-700">
            Observación del Check-in (Opcional)
          </label>
          <InputTextarea
            value={checkInObservation}
            onChange={(e) => onCheckInObservationChange(e.target.value)}
            placeholder="Agregar observación del check-in..."
            rows={3}
            className="w-full bg-gray-50 border-gray-100"
            autoFocus
          />
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