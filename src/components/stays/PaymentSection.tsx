import React from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Controller } from "react-hook-form";

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
  isReservation: boolean;
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

  React.useEffect(() => {
    if (!isReservation) {
      setValue("paid_amount", priceInfo.total);
    }
  }, [priceInfo.total, setValue, isReservation]);

  const mattressTotal = settings.mat * extraMattressCount * nights;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
          <i className="pi pi-credit-card text-sm text-emerald-600"></i>
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-[#f5f2eb] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
              <i className="pi pi-users text-xs text-emerald-600"></i>
              <span className="text-xs font-semibold text-gray-700">{personCount}</span>
            </div>
            {extraMattressCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
                <i className="pi pi-circle-off text-xs text-amber-600"></i>
                <span className="text-xs font-semibold text-gray-700">{extraMattressCount}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
              <i className="pi pi-calendar text-xs text-blue-600"></i>
              <span className="text-xs font-semibold text-gray-700">
                {nights} noche{nights > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            {!isReservation && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tarifa/noche ({personCount} pers.)</span>
                <span className="font-medium text-gray-800">
                  ${priceInfo.rate.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Hospedaje{" "}
                <span className="text-gray-400">(${priceInfo.rate.toLocaleString()})</span>
              </span>
              <span className="font-medium text-gray-800">
                ${priceInfo.subtotalHospedaje.toLocaleString()}
              </span>
            </div>

            {extraMattressCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Colchonetas{" "}
                  <span className="text-gray-400">(${settings.mat.toLocaleString()})</span>
                </span>
                <span className="font-medium text-gray-800">${mattressTotal.toLocaleString()}</span>
              </div>
            )}

            <div className="my-2 h-px bg-gray-300"></div>

            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-gray-800">${priceInfo.subtotal.toLocaleString()}</span>
            </div>

            {invoiceRequested && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">IVA ({settings.iva}%)</span>
                <span className="font-medium text-gray-800">${priceInfo.iva.toLocaleString()}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Descuento</span>
              <span
                className={`font-medium ${priceInfo.discountAmount && priceInfo.discountAmount > 0 ? "text-red-600" : "text-gray-800"}`}
              >
                {priceInfo.discountAmount && priceInfo.discountAmount > 0
                  ? `-$${priceInfo.discountAmount.toLocaleString()}`
                  : "-"}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between border-t-2 border-gray-300 pt-2">
              <span className="font-bold text-gray-900">
                {isReservation ? "Total" : "Total a Pagar"}
              </span>
              <span className="text-xl font-black text-emerald-700">
                ${priceInfo.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide text-gray-600 uppercase">
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
                  placeholder="Seleccionar"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide text-gray-600 uppercase">
              {isReservation ? "Monto a Abonar" : "Monto Recibido"}
            </label>
            <Controller
              name="paid_amount"
              control={control}
              render={({ field }) => (
                <InputNumber
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  className="w-full"
                  inputClassName="w-full text-lg font-semibold"
                  mode="currency"
                  currency="COP"
                  minFractionDigits={0}
                  maxFractionDigits={0}
                  placeholder="$0"
                />
              )}
            />
          </div>

          {!isReservation && (
            <div className="mt-auto rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cambio/Pendiente:</span>
                <span
                  className={`font-bold ${
                    (watch("paid_amount") || 0) >= priceInfo.total
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  ${Math.abs((watch("paid_amount") || 0) - priceInfo.total).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
