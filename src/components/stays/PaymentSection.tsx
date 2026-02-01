import React from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";
import { Controller } from "react-hook-form";
import { PaymentType, PaymentMethod } from "@/types";

export interface PaymentSectionProps {
  title: string;
  priceInfo: {
    rate: number;
    subtotalHospedaje: number;
    subtotal: number;
    iva: number;
    total: number;
    discountAmount?: number;
  };
  nights: number;
  personCount: number;
  extraMattressCount: number;
  settings: {
    iva: number;
    mat: number;
  };
  paymentMethods: any[];
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: any;
  isReservation: boolean; // true=Booking, false=CheckIn
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  title,
  priceInfo,
  nights,
  personCount,
  extraMattressCount,
  settings,
  paymentMethods,
  control,
  setValue,
  watch,
  isReservation,
}) => {
  const invoiceRequested = watch("is_invoice_requested");

  // Auto-set paid_amount when priceInfo changes
  React.useEffect(() => {
    if (!isReservation) {
      setValue("paid_amount", priceInfo.total);
    }
  }, [priceInfo.total, setValue, isReservation]);

  const renderCompleteBreakdown = () => (
    <>
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600">
          Tarifa por noche ({personCount} persona
          {personCount > 1 ? "s" : ""})
        </span>
        <span className="text-sm font-bold text-gray-800">
          $ {priceInfo.rate.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600">Número de noches</span>
        <span className="text-sm font-bold text-gray-800">
          {nights} noche{nights > 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex justify-between items-center py-1 font-bold">
        <span className="text-sm text-gray-800">
          Subtotal hospedaje ({nights} x $ {priceInfo.rate.toLocaleString()})
        </span>
        <span className="text-sm text-gray-800">
          $ {priceInfo.subtotalHospedaje.toLocaleString()}
        </span>
      </div>
      {extraMattressCount > 0 && (
        <div className="flex justify-between items-center py-1 text-sm">
          <span className="text-gray-600">
            Colchonetas adicionales ({extraMattressCount} x ${" "}
            {settings.mat.toLocaleString()} x {nights} nch)
          </span>
          <span className="font-bold text-gray-800">
            $ {(settings.mat * extraMattressCount * nights).toLocaleString()}
          </span>
        </div>
      )}
    </>
  );

  const renderSimplifiedBreakdown = () => (
    <>
      <div className="flex justify-between items-center py-1 font-bold">
        <span className="text-sm text-gray-800">
          Subtotal hospedaje ({nights} nch)
        </span>
        <span className="text-sm text-gray-800">
          $ {priceInfo.subtotalHospedaje.toLocaleString()}
        </span>
      </div>
      {extraMattressCount > 0 && (
        <div className="flex justify-between items-center py-1 text-sm">
          <span className="text-gray-600">Colchonetas adicionales</span>
          <span className="font-bold text-gray-800">
            $ {(settings.mat * extraMattressCount * nights).toLocaleString()}
          </span>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <i className="pi pi-credit-card text-gray-600"></i>
        <h3 className="font-bold text-gray-700">{title}</h3>
      </div>

      <div className="bg-[#f5f2eb] rounded-2xl p-6 mb-8">
        {isReservation
          ? renderSimplifiedBreakdown()
          : renderCompleteBreakdown()}

        <Divider className="my-3 opacity-50" />

        <div className="flex justify-between items-center py-1 font-bold">
          <span className="text-sm text-gray-800">Subtotal</span>
          <span className="text-sm text-gray-800">
            $ {priceInfo.subtotal.toLocaleString()}
          </span>
        </div>

        {invoiceRequested && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-600">IVA (19%)</span>
            <span className="text-sm font-bold text-gray-800">
              $ {priceInfo.iva.toLocaleString()}
            </span>
          </div>
        )}

        {priceInfo.discountAmount && priceInfo.discountAmount > 0 ? (
          <div className="flex justify-between items-center py-1 text-red-600 font-bold">
            <span className="text-sm">Descuento</span>
            <span className="text-sm">
              - $ {priceInfo.discountAmount.toLocaleString()}
            </span>
          </div>
        ) : null}

        <div className="flex justify-between items-center py-2 mt-2">
          <span className="text-lg font-black text-gray-900">
            {isReservation ? "Total Reserva" : "Total"}
          </span>
          <span className="text-xl font-black text-gray-900">
            $ {priceInfo.total.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700 uppercase">
            Método de Pago
          </label>
          <Controller
            name="payment_method_id"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={paymentMethods}
                optionLabel="name"
                optionValue="id"
                className="w-full"
                placeholder="Seleccionar método de pago"
                filter
              />
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700 uppercase">
            {isReservation ? "Abono Inicial" : "Monto a Pagar"}
          </label>
          <Controller
            name="paid_amount"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                className="w-full"
                inputClassName="w-full"
                mode={isReservation ? "currency" : undefined}
                currency={isReservation ? "COP" : undefined}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
