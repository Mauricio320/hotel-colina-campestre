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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className={`p-3 rounded-xl ${hasDiscount ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-600"}`}
          >
            <i
              className={`pi ${hasDiscount ? "pi-percentage" : "pi-briefcase"} text-xl`}
            ></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-700">Cliente Empresarial</h3>
            <p className="text-sm text-gray-400">
              {hasDiscount
                ? `Descuento de ${discountAmount.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })} aplicado`
                : "¿Aplica tarifa especial para empresas?"}
            </p>
          </div>
        </div>

        {hasDiscount ? (
          <Button
            label="Restablecer Tarifa"
            icon="pi pi-refresh"
            className="p-button-outlined p-button-danger p-button-sm rounded-xl w-full sm:w-auto"
            onClick={onResetDiscount}
          />
        ) : (
          <Button
            label="Autorizar Tarifa"
            icon="pi pi-lock"
            type="button"
            className="p-button-outlined p-button-warning rounded-xl w-full sm:w-auto"
            onClick={onOpenModal}
          />
        )}
      </div>
    </div>
  );
};

export default CorporateClientSelector;
