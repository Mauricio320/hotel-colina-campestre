import { useMaintenanceLogs } from "@/hooks/useMaintenanceLogs";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import PageHeader from "@/components/ui/PageHeader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabPanel, TabView } from "primereact/tabview";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useState } from "react";
import dayjs from "dayjs";

const MaintenanceLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { data: maintenanceLogs, isLoading } = useMaintenanceLogs();
  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

  if (isLoading || accommodationTypesQuery.isLoading) {
    return (
      <div className="flex justify-center p-12">
        <ProgressSpinner />
      </div>
    );
  }

  const dateBodyTemplate = (rowData: any) => {
    return dayjs(rowData.date).format("DD/MM/YYYY");
  };

  const roomBodyTemplate = (rowData: any) => {
    return (
      <div className="flex flex-col">
        <span className="font-bold">{rowData.room?.room_number}</span>
        <span className="text-xs text-gray-400">
          {rowData.room?.accommodation_types?.name || "Habitación"}
        </span>
      </div>
    );
  };

  const employeeBodyTemplate = (rowData: any) => {
    return (
      <span>
        {rowData.employee?.first_name} {rowData.employee?.last_name}
      </span>
    );
  };

  const categoryBodyTemplate = (rowData: any) => {
    return (
      <div className="flex flex-col">
        <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-600 uppercase">
          {rowData.category?.name}
        </span>
      </div>
    );
  };

  const subcategoryBodyTemplate = (rowData: any) => {
    return <span className="text-sm text-gray-600">{rowData.subcategory?.name || "-"}</span>;
  };

  const stayBodyTemplate = (rowData: any) => {
    if (!rowData.stay?.guest) return <span className="text-gray-400">-</span>;
    return (
      <div className="flex flex-col">
        <span>
          {rowData.stay.guest?.first_name} {rowData.stay.guest?.last_name}
        </span>
      </div>
    );
  };

  const observationBodyTemplate = (rowData: any) => {
    return <span className="text-sm text-gray-600">{rowData.observation || "-"}</span>;
  };

  // Filtrar logs por tipo de alojamiento
  const getFilteredLogs = (accommodationTypeId: string) => {
    return (
      maintenanceLogs?.filter(
        (log) =>
          log.room?.accommodation_type_id === accommodationTypeId ||
          log.room?.accommodation_types?.id === accommodationTypeId
      ) || []
    );
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <PageHeader
        title="Historial de Mantenimiento"
        icon="pi-wrench"
        color="amber"
        variant="simple"
      />

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {accommodationTypesQuery.data?.map((type) => (
          <TabPanel key={type.id} header={type.name}>
            <div className="mt-4 overflow-hidden rounded-3xl border border-amber-50 bg-white shadow-xl shadow-amber-100/20">
              <DataTable
                value={getFilteredLogs(type.id)}
                className="text-sm"
                scrollable
                scrollHeight="70vh"
                breakpoint="640px"
                rowHover
                stripedRows
                emptyMessage={`No hay registros de mantenimiento para ${type.name}.`}
              >
                <Column
                  field="date"
                  header="Fecha"
                  body={dateBodyTemplate}
                  sortable
                  headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                />
                <Column
                  field="room.room_number"
                  header="Habitación"
                  body={roomBodyTemplate}
                  sortable
                  headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                />
                <Column
                  header="Huésped"
                  body={stayBodyTemplate}
                  className="hidden sm:table-cell"
                  headerClassName="hidden sm:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                />
                <Column
                  field="category"
                  header="Categoría"
                  body={categoryBodyTemplate}
                  sortable
                  headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                />
                <Column
                  field="subcategory"
                  header="Subcategoría"
                  body={subcategoryBodyTemplate}
                  sortable
                  className="hidden sm:table-cell"
                  headerClassName="hidden sm:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                />
                <Column
                  field="employee"
                  header="Empleado"
                  body={employeeBodyTemplate}
                  sortable
                  className="hidden md:table-cell"
                  headerClassName="hidden md:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                />
                <Column
                  field="observation"
                  header="Observación"
                  body={observationBodyTemplate}
                  className="hidden md:table-cell"
                  headerClassName="hidden md:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                />
              </DataTable>
            </div>
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default MaintenanceLogsPage;
