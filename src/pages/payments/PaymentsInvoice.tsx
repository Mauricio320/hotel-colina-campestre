import PaymentsInvoiceTable from "@/components/payments/PaymentsInvoiceTable";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useState } from "react";

const PaymentsInvoice: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");

  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

  return (
    <div className="p-4 animate-fade-in">
      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {accommodationTypesQuery?.data?.map((dt) => (
          <TabPanel key={dt.id} header={dt.name}>
            <PaymentsInvoiceTable
              emptyMessage={`No hay registros de pagos para la categoría ${dt.name}.`}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              categoryId={dt.id}
            />
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default PaymentsInvoice;
