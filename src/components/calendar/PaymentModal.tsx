import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { PaymentMethod } from "@/types";

interface PaymentModalProps {
  visible: boolean;
  onHide: () => void;
  pendingAmount: number;
  paymentMethods: PaymentMethod[];
  paymentMethodId: string;
  newPaymentAmount: number;
  isProcessingPayment: boolean;
  isPaymentMethodValid: boolean;
  onPaymentMethodChange: (value: string) => void;
  onNewPaymentAmountChange: (value: number) => void;
  onConfirmNewPayment: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onHide,
  pendingAmount,
  paymentMethods,
  paymentMethodId,
  newPaymentAmount,
  isProcessingPayment,
  isPaymentMethodValid,
  onPaymentMethodChange,
  onNewPaymentAmountChange,
  onConfirmNewPayment,
}) => {
  return (
    <Dialog
      header="Registrar Abono"
      visible={visible}
      onHide={onHide}
      className="w-full max-w-md rounded-2xl"
    >
      <div className="flex flex-col gap-5 py-2">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <p className="text-emerald-800 text-sm font-medium">
            <i className="pi pi-info-circle mr-2"></i>
            Para proceder con el check-in de una reserva, el saldo pendiente
            debe ser cero.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm font-bold text-gray-500">
            <span>SALDO PENDIENTE:</span>
            <span className="text-red-600 font-black text-xl">
              $ {pendingAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-gray-700">
              Método de Pago
            </label>
            <Dropdown
              value={paymentMethodId}
              options={paymentMethods}
              optionLabel="name"
              optionValue="id"
              onChange={(e) => onPaymentMethodChange(e.value)}
              placeholder="Seleccionar método de pago"
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-gray-700">
              Monto a Abonar
            </label>
            <InputNumber
              value={newPaymentAmount}
              onValueChange={(e) => onNewPaymentAmountChange(e.value || 0)}
              mode="currency"
              currency="COP"
              className="w-full"
              inputClassName="text-2xl font-black py-4 border-emerald-200"
              autoFocus
              minFractionDigits={0}
              maxFractionDigits={0}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            label="Volver"
            className="p-button-text p-button-plain font-bold"
            onClick={onHide}
          />
          <Button
            label="Confirmar Abono"
            icon="pi pi-money-bill"
            className="bg-green-600 border-none text-white font-black py-4 rounded-xl shadow-lg"
            onClick={onConfirmNewPayment}
            loading={isProcessingPayment}
            disabled={
              newPaymentAmount <= 0 || !paymentMethodId || !isPaymentMethodValid
            }
          />
        </div>
      </div>
    </Dialog>
  );
};
