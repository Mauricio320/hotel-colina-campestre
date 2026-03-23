import RoomPaymentsTable from "@/components/payments/RoomPaymentsTable";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import { Payment } from "@/types";
import { InputText } from "primereact/inputtext";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RoomPayments: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 0);

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

  const calculatePending = (row: any) => {
    const stayPayments = payments[row.id] || [];
    const totalPaid = stayPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    return (row.total_price || 0) - totalPaid;
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-green-100 p-3 text-green-600 shadow-sm">
            <i className="pi pi-money-bill text-xl"></i>
          </div>
          <h2 className="text-xl font-black tracking-tighter text-gray-800 sm:text-3xl">
            Pagos Habitaciones
          </h2>
        </div>
      </div>

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {accommodationTypesQuery?.data?.map((cat, index) => (
          <TabPanel key={cat.id} header={cat.name}>
            <RoomPaymentsTable
              getPaymentStatus={getPaymentStatus}
              calculatePending={calculatePending}
              accommodation_type_id={cat.id}
              globalFilter={globalFilter}
              activeTab={activeTab} // Pasamos la tab activa
            />
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default RoomPayments;
