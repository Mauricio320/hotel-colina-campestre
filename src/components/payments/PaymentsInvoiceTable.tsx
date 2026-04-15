import { PaymentWithRelations } from "@/services/payments/paymentsApi";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { usePaymentsByCategory } from "@/hooks/usePaymentsByCategory";
import { usePaymentMethods } from "@/hooks/useSettings";
import { useUpdatePaymentMethod } from "@/hooks/useUpdatePaymentMethod";

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
  const { paymentMethods } = usePaymentMethods();
  const updatePaymentMethod = useUpdatePaymentMethod(categoryId);

  const [changeMethodVisible, setChangeMethodVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithRelations | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
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
    <div className="flex flex-wrap items-center justify-between gap-4 p-2">
      <InputText
        type="search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Buscar por orden, huésped, habitación, método o empleado..."
        className="p-inputtext-sm w-full sm:w-80"
      />
    </div>
  );

  if (isLoading) return <ProgressSpinner className="h-8 w-8" strokeWidth="4" />;

  return (
    <>
      <DataTable
        value={payments}
        header={header}
        globalFilter={globalFilter}
        breakpoint="640px"
        scrollable
        scrollHeight="70vh"
        emptyMessage={emptyMessage}
      >
        <Column
          header="N° Orden"
          body={(row: PaymentWithRelations) => (
            <span className="font-black text-emerald-600">#{row.stay.order_number}</span>
          )}
        />
        <Column
          header="Habitación"
          className="hidden sm:table-cell"
          headerClassName="hidden sm:table-cell"
          body={(row: PaymentWithRelations) => (
            <span className="font-bold text-emerald-600">{row.stay.room.room_number}</span>
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
          className="hidden sm:table-cell"
          headerClassName="hidden sm:table-cell"
          body={(row: PaymentWithRelations) => (
            <span className="text-sm text-gray-600">
              {dayjs(row.payment_date).format("DD MMM YYYY")}
            </span>
          )}
        />
        <Column
          header="Método"
          className="hidden sm:table-cell"
          headerClassName="hidden sm:table-cell"
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
              ${Number(row.amount).toLocaleString()}
            </span>
          )}
        />
        <Column
          field="payment_type"
          header="Tipo de Pago"
          className="hidden sm:table-cell"
          headerClassName="hidden sm:table-cell"
          body={(row: PaymentWithRelations) => (
            <div
              className={`inline-block rounded-lg p-1 text-xs text-[10px] font-bold tracking-wide uppercase ${getPaymentTypeColor(row.payment_type)}`}
            >
              {getPaymentTypeDisplay(row.payment_type)}
            </div>
          )}
        />
        <Column
          header="Registrado por"
          className="hidden sm:table-cell"
          headerClassName="hidden sm:table-cell"
          body={(row: PaymentWithRelations) => (
            <span className="text-sm text-gray-600">
              {row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : "N/A"}
            </span>
          )}
        />
        <Column
          header="Acciones"
          body={(row: PaymentWithRelations) => (
            <div className="flex gap-2">
              <Button
                unstyled
                icon="pi pi-receipt"
                className="p-button-sm w-full justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-700 shadow-sm transition-all hover:bg-red-100 hover:shadow sm:w-auto"
                onClick={() =>
                  navigate(`/invoice/${row.stay_id}`, {
                    state: {
                      from: location.pathname + location.search,
                      activeTab: activeTab,
                    },
                  })
                }
                tooltip="Ver factura"
                tooltipOptions={{ position: "left" }}
              />
              <Button
                unstyled
                icon="pi pi-credit-card"
                className="p-button-sm w-full justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-100 hover:shadow sm:w-auto"
                onClick={() => {
                  setSelectedPayment(row);
                  setSelectedMethodId(row.payment_method_id);
                  setChangeMethodVisible(true);
                }}
                tooltip="Cambiar método de pago"
                tooltipOptions={{ position: "left" }}
              />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        header="Cambiar Método de Pago"
        visible={changeMethodVisible}
        onHide={() => setChangeMethodVisible(false)}
        className="w-full max-w-sm"
        draggable={false}
        resizable={false}
      >
        <div className="flex flex-col gap-4">
          <Dropdown
            value={selectedMethodId}
            options={paymentMethods}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setSelectedMethodId(e.value)}
            placeholder="Seleccionar método"
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              unstyled
              label="Cancelar"
              onClick={() => setChangeMethodVisible(false)}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            />
            <Button
              unstyled
              label="Actualizar"
              loading={updatePaymentMethod.isPending}
              onClick={async () => {
                if (!selectedPayment?.id || !selectedMethodId) return;
                await updatePaymentMethod.mutateAsync({
                  paymentId: selectedPayment.id,
                  paymentMethodId: selectedMethodId,
                });
                setChangeMethodVisible(false);
              }}
              className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PaymentsInvoiceTable;
