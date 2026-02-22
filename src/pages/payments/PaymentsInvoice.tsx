import PaymentsInvoiceTable from "@/components/payments/PaymentsInvoiceTable";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import PageHeader from "@/components/ui/PageHeader";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PaymentsInvoice: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");

  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

  // Restaurar el tab activo al volver desde la factura
  useEffect(() => {
    if (location.state?.activeTab !== undefined) {
      setActiveTab(location.state.activeTab);
      // Limpiar el state para evitar bucles
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="p-4 animate-fade-in">
      <div className="mb-4">
        <PageHeader
          title="Pagos de facturas"
          icon="pi-file-pdf"
          color="red"
          variant="simple"
        />
      </div>
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
              activeTab={activeTab}
            />
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default PaymentsInvoice;
