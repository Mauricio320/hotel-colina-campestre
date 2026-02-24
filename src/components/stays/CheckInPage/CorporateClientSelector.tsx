import React from "react";
import { Button } from "primereact/button";

interface CorporateClientSelectorProps {
  onOpenModal: () => void;
  hasDiscount: boolean;
  discountAmount: number;
  onResetDiscount: () => void;
}

const CorporateClientSelector: React.FC<CorporateClientSelectorProps> = ({
  onOpenModal,
  hasDiscount,
  discountAmount,
  onResetDiscount,
}) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${hasDiscount ? "bg-orange-100" : "bg-blue-100"}`}
        >
          <i
            className={`pi ${hasDiscount ? "pi-percentage text-orange-600" : "pi-briefcase text-blue-600"} text-sm`}
          ></i>
        </div>
        <h3 className="font-bold text-gray-800">Cliente Empresarial</h3>
      </div>

      <div className="rounded-xl bg-[#f5f2eb] p-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full items-center gap-3 sm:w-auto">
            {hasDiscount ? (
              <>
                <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-100 px-3 py-1.5">
                  <i className="pi pi-tag text-xs text-orange-600"></i>
                  <span className="text-sm font-bold text-orange-700">
                    -${discountAmount.toLocaleString()}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Descuento aplicado</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-3 py-1.5">
                  <i className="pi pi-info-circle text-xs text-blue-600"></i>
                  <span className="text-sm text-gray-600">¿Tarifa especial?</span>
                </div>
              </>
            )}
          </div>

          {hasDiscount ? (
            <Button
              unstyled
              label="Restablecer"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-danger p-button-sm w-full rounded-lg sm:w-auto"
              onClick={onResetDiscount}
            />
          ) : (
            <Button
              unstyled
              label="Autorizar"
              icon="pi pi-lock"
              type="button"
              className="p-button-outlined p-button-warning p-button-sm w-full rounded-lg sm:w-auto"
              onClick={onOpenModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateClientSelector;
