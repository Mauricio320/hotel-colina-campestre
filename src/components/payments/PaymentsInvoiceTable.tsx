import { PaymentWithRelations } from "@/services/payments/paymentsApi";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import dayjs from "dayjs";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { usePaymentsByCategory } from "@/hooks/usePaymentsByCategory";

interface PaymentsInvoiceTableProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  emptyMessage: string;
  categoryId: string;
  activeTab: number;
}

const PaymentsInvoiceTable: React.FC<PaymentsInvoiceTableProps> = ({
  globalFilter,
  setGlobalFilter,
  emptyMessage,
  categoryId,
  activeTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: payments, isLoading } = usePaymentsByCategory(categoryId);
  const getPaymentTypeDisplay = (type: string) => {
    switch (type) {
      case "ABONO_RESERVA":
        return "Abono";
      case "PAGO_COMPLETO_RESERVA":
        return "Pago Completo";
      case "PAGO_CHECKIN_DIRECTO":
        return "Check‑in Directo";
      case "ANTICIPADO_COMPLETO":
        return "Anticipado";
      default:
        return type;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "ABONO_RESERVA":
        return "bg-blue-50 text-blue-700";
      case "PAGO_COMPLETO_RESERVA":
        return "bg-green-50 text-green-700";
      case "PAGO_CHECKIN_DIRECTO":
        return "bg-emerald-50 text-emerald-700";
      case "ANTICIPADO_COMPLETO":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const header = (
    <div className="flex flex-wrap gap-4 justify-between items-center p-2">
      <InputText
        type="search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Buscar por orden, huésped, habitación, método o empleado..."
        className="p-inputtext-sm w-80"
      />
    </div>
  );

  if (isLoading) return <ProgressSpinner className="w-8 h-8" strokeWidth="4" />;

  return (
    <DataTable
      value={payments}
      header={header}
      globalFilter={globalFilter}
      responsiveLayout="stack"
      scrollable
      scrollHeight="70vh"
      emptyMessage={emptyMessage}
    >
      <Column
        header="N° Orden"
        body={(row: PaymentWithRelations) => (
          <span className="font-black text-emerald-600">
            #{row.stay.order_number}
          </span>
        )}
      />
      <Column
        header="Habitación"
        body={(row: PaymentWithRelations) => (
          <span className="font-bold text-emerald-600">
            {row.stay.room.room_number}
          </span>
        )}
      />
      <Column
        header="Huésped"
        body={(row: PaymentWithRelations) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">
              {row.stay.guest
                ? `${row.stay.guest.first_name} ${row.stay.guest.last_name}`
                : "N/A"}
            </span>
          </div>
        )}
      />
      <Column
        field="payment_date"
        header="Fecha"
        body={(row: PaymentWithRelations) => (
          <span className="text-sm text-gray-600">
            {dayjs(row.payment_date).format("DD MMM YYYY")}
          </span>
        )}
      />
      <Column
        header="Método"
        body={(row: PaymentWithRelations) => (
          <Tag
            value={row.payment_method?.name || "N/A"}
            severity="info"
            className="text-xs font-bold uppercase"
          />
        )}
      />
      <Column
        field="amount"
        header="Monto"
        body={(row: PaymentWithRelations) => (
          <span className="font-black text-emerald-700">
            $ {Number(row.amount).toLocaleString()}
          </span>
        )}
      />
      <Column
        field="payment_type"
        header="Tipo de Pago"
        body={(row: PaymentWithRelations) => (
          <Tag
            value={getPaymentTypeDisplay(row.payment_type)}
            className={`text-xs font-bold uppercase ${getPaymentTypeColor(row.payment_type)}`}
          />
        )}
      />
      <Column
        header="Registrado por"
        body={(row: PaymentWithRelations) => (
          <span className="text-sm text-gray-600">
            {row.employee
              ? `${row.employee.first_name} ${row.employee.last_name}`
              : "N/A"}
          </span>
        )}
      />
      <Column
        header="Acciones"
        body={(row: PaymentWithRelations) => (
          <Button
            label="Ver Factura"
            icon="pi pi-file-pdf"
            className="p-button-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 font-semibold transition-all shadow-sm hover:shadow"
            onClick={() =>
              navigate(`/invoice/${row.stay_id}`, {
                state: {
                  from: location.pathname + location.search,
                  activeTab: activeTab,
                },
              })
            }
            tooltip="Ver factura en PDF"
            tooltipOptions={{ position: "left" }}
          />
        )}
      />
    </DataTable>
  );
};

export default PaymentsInvoiceTable;
