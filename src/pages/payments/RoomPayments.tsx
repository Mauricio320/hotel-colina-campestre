import RoomPaymentsTable from "@/components/payments/RoomPaymentsTable";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import { Payment } from "@/types";
import { InputText } from "primereact/inputtext";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomPayments: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const [payments, setPayments] = useState<{ [key: string]: Payment[] }>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

  const getPaymentStatus = (row: any) => {
    const pending = (row.total_price || 0) - (row.paid_amount || 0);
    if (pending > 0) {
      return {
        status: "Pendiente de Pago",
        severity: "warning",
      };
    } else {
      return {
        status: "Pago Completo",
        severity: "success",
      };
    }
  };

  const header = (
    <div className="flex flex-wrap gap-4 justify-between items-center p-2">
      <div>
        <h3 className="m-0 text-xl font-black text-emerald-900 tracking-tight">
          Registro de Pagos por Habitación
        </h3>
      </div>
      <span className="p-input-icon-left w-full sm:w-72">
        <i className="pi pi-search text-emerald-400" />
        <InputText
          type="search"
          onInput={(e: any) => setGlobalFilter(e.target.value)}
          placeholder="Buscar por orden, huésped o habitación..."
          className="p-inputtext-sm w-full rounded-xl border-emerald-100"
        />
      </span>
    </div>
  );

  const calculatePending = (row: any) => {
    const stayPayments = payments[row.id] || [];
    const totalPaid = stayPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );
    return (row.total_price || 0) - totalPaid;
  };

  const getTotalPaidFromPayments = (row: any) => {
    const stayPayments = payments[row.id] || [];
    return stayPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );
  };

  const getPaymentTypeDisplay = (type: string) => {
    switch (type) {
      case "ABONO_RESERVA":
        return "Abono";
      case "PAGO_COMPLETO_RESERVA":
        return "Pago Completo";
      case "PAGO_CHECKIN_DIRECTO":
        return "Check-in Directo";
      case "ANTICIPADO_COMPLETO":
        return "Anticipado";
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-2xl text-green-600 shadow-sm">
            <i className="pi pi-money-bill text-xl"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter">
            Pagos Habitaciones
          </h2>
        </div>
      </div>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {accommodationTypesQuery?.data?.map((cat, index) => (
          <TabPanel key={cat.id} header={cat.name}>
            <RoomPaymentsTable
              getPaymentStatus={getPaymentStatus}
              calculatePending={calculatePending}
              accommodation_type_id={cat.id}
              globalFilter={globalFilter}
              header={header}
            />
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default RoomPayments;
