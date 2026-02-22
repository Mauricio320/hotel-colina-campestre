import { useCleaningLogs } from "@/hooks/useCleaningLogs";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import PageHeader from "@/components/ui/PageHeader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabPanel, TabView } from "primereact/tabview";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useState } from "react";
import dayjs from "dayjs";

const CleaningLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { data: cleaningLogs, isLoading } = useCleaningLogs();
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

  const cleaningTypeBodyTemplate = (rowData: any) => {
    const isGeneral = rowData.cleaning_type === "Aseo general";
    return (
      <span
        className={`font-black uppercase text-[10px] px-2 py-1 rounded-lg ${
          isGeneral
            ? "text-blue-600 bg-blue-50"
            : "text-emerald-600 bg-emerald-50"
        }`}
      >
        {rowData.cleaning_type}
      </span>
    );
  };

  const observationBodyTemplate = (rowData: any) => {
    return (
      <span className="text-sm text-gray-600">
        {rowData.observation || "-"}
      </span>
    );
  };

  // Filtrar logs por tipo de alojamiento
  const getFilteredLogs = (accommodationTypeId: string) => {
    return (
      cleaningLogs?.filter(
        (log) =>
          log.room?.accommodation_type_id === accommodationTypeId ||
          log.room?.accommodation_types?.id === accommodationTypeId,
      ) || []
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Historial de Limpieza"
        icon="pi-shield"
        color="blue"
        variant="simple"
      />
      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {accommodationTypesQuery.data?.map((type) => (
          <TabPanel key={type.id} header={type.name}>
            <div className="bg-white rounded-3xl border border-blue-50 shadow-xl shadow-blue-100/20 overflow-hidden mt-4">
              <DataTable
                value={getFilteredLogs(type.id)}
                className="text-sm"
                scrollable
                scrollHeight="70vh"
                breakpoint="640px"
                rowHover
                stripedRows
                emptyMessage={`No hay registros de limpieza para ${type.name}.`}
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
                  field="cleaning_type"
                  header="Tipo de Aseo"
                  body={cleaningTypeBodyTemplate}
                  sortable
                  headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                />
                <Column
                  field="employee"
                  header="Empleado"
                  body={employeeBodyTemplate}
                  sortable
                  className="hidden sm:table-cell"
                  headerClassName="hidden sm:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
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

export default CleaningLogsPage;
