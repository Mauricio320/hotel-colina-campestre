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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasDiscount ? "bg-orange-100" : "bg-blue-100"}`}>
          <i className={`pi ${hasDiscount ? "pi-percentage text-orange-600" : "pi-briefcase text-blue-600"} text-sm`}></i>
        </div>
        <h3 className="font-bold text-gray-800">Cliente Empresarial</h3>
      </div>

      <div className="bg-[#f5f2eb] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {hasDiscount ? (
              <>
                <div className="flex items-center gap-1.5 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200">
                  <i className="pi pi-tag text-orange-600 text-xs"></i>
                  <span className="text-sm font-bold text-orange-700">
                    -${discountAmount.toLocaleString()}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Descuento aplicado</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
                  <i className="pi pi-info-circle text-blue-600 text-xs"></i>
                  <span className="text-sm text-gray-600">¿Tarifa especial?</span>
                </div>
              </>
            )}
          </div>

          {hasDiscount ? (
            <Button
              label="Restablecer"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-danger p-button-sm rounded-lg w-full sm:w-auto"
              onClick={onResetDiscount}
            />
          ) : (
            <Button
              label="Autorizar"
              icon="pi pi-lock"
              type="button"
              className="p-button-outlined p-button-warning p-button-sm rounded-lg w-full sm:w-auto"
              onClick={onOpenModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateClientSelector;
