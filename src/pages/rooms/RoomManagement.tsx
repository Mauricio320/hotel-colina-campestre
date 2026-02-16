import BulkRateUpdateModal from "@/components/rooms/BulkRateUpdateModal";
import { CATEGORIES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRooms } from "@/hooks/useRooms";
import { Role, Room, RoomRate } from "@/types";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { SplitButton } from "primereact/splitbutton";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface RoomManagementProps {
  userRole: string | null;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ userRole }) => {
  const { employee } = useAuth();
  const isAdmin = userRole === Role.Admin;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(() => {
    const idx = CATEGORIES.findIndex((c) => c === tabParam);
    return idx >= 0 ? idx : 0;
  });
  const [showBulkRateModal, setShowBulkRateModal] = useState(false);

  useEffect(() => {
    const idx = CATEGORIES.findIndex((c) => c === tabParam);
    if (idx >= 0 && idx !== activeTab) setActiveTab(idx);
  }, [tabParam]);

  const { roomsQuery } = useRooms(CATEGORIES[activeTab]);

  const openCreate = () => {
    navigate(`/rooms/new?tab=${CATEGORIES[activeTab]}`);
  };

  const openEdit = (room: Room) => {
    navigate(`/rooms/edit/${room.id}?tab=${CATEGORIES[activeTab]}`);
  };

  const openHistory = (room: Room) => {
    navigate(`/rooms/history/${room.id}?tab=${CATEGORIES[activeTab]}`);
  };

  const openCleaningHistory = (room: Room) => {
    navigate(`/rooms/cleaning-history/${room.id}?tab=${CATEGORIES[activeTab]}`);
  };

  const openMaintenanceHistory = (room: Room) => {
    navigate(
      `/rooms/maintenance-history/${room.id}?tab=${CATEGORIES[activeTab]}`,
    );
  };

  const formatRates = (rates: RoomRate[]): string => {
    if (!rates || rates.length === 0) return "Sin tarifas";

    return rates
      .sort((a, b) => a.person_count - b.person_count)
      .map((rate) => `${rate.rate / 1000}k`)
      .join(" ∙ ");
  };

  const getRoomCapacity = (room: Room): string => {
    const total = room.beds_double * 2 + room.beds_single;
    const details = [];
    if (room.beds_double > 0) details.push(`${room.beds_double}D`);
    if (room.beds_single > 0) details.push(`${room.beds_single}S`);
    return `${total} pers. (${details.join("+")})`;
  };

  const handleTabChange = (e: any) => {
    setActiveTab(e.index);
    setSearchParams({ tab: CATEGORIES[e.index] });
  };

  if (roomsQuery.isLoading)
    return (
      <div className="flex justify-center p-12">
        <ProgressSpinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm">
            <i className="pi pi-building text-xl"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter">
            Gestión de Habitaciones
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <Button
                label="Actualizar Tarifas"
                icon="pi pi-money-bill"
                className="bg-amber-500 text-white border-none rounded-xl font-bold shadow-sm hover:bg-amber-600 transition-all py-2 px-4"
                onClick={() => setShowBulkRateModal(true)}
              />
              <Button
                label="Historial Tarifas"
                icon="pi pi-history"
                className="bg-blue-500 text-white border-none rounded-xl font-bold shadow-sm hover:bg-blue-600 transition-all py-2 px-4"
                onClick={() =>
                  navigate(`/rooms/rate-history?tab=${CATEGORIES[activeTab]}`)
                }
              />
              <Button
                label="Nueva Habitación"
                icon="pi pi-plus"
                className="bg-emerald-600 text-white border-none rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-all py-2 px-4"
                onClick={openCreate}
              />
            </>
          )}
        </div>
      </div>

      <TabView activeIndex={activeTab} onTabChange={handleTabChange}>
        {CATEGORIES.map((cat) => (
          <TabPanel key={cat} header={cat}>
            <div className="bg-white rounded-3xl border border-emerald-50 shadow-xl shadow-emerald-100/20 overflow-hidden mt-4">
              <DataTable
                value={
                  roomsQuery.data?.sort((a, b) => {
                    const aNum = parseInt(a.room_number);
                    const bNum = parseInt(b.room_number);

                    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                    if (!isNaN(aNum) && isNaN(bNum)) return -1;
                    if (isNaN(aNum) && !isNaN(bNum)) return 1;

                    return a.room_number.localeCompare(b.room_number);
                  }) || []
                }
                scrollable
                scrollHeight="70vh"
                responsiveLayout="stack"
                breakpoint="960px"
                className="text-sm"
                rowHover
                stripedRows
                emptyMessage="No hay habitaciones registradas."
              >
                <Column
                  field="room_number"
                  header="No."
                  sortable
                  headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4"
                  body={(row) => (
                    <span className="font-black text-emerald-600 text-lg">
                      {row.room_number}
                    </span>
                  )}
                />
                <Column
                  header="Capacidad"
                  headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                  body={(rowData) => (
                    <div className="font-bold text-gray-700">
                      {getRoomCapacity(rowData)}
                    </div>
                  )}
                />
                <Column
                  header="Descripción"
                  field="observation"
                  headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                  body={(rowData) => (
                    <div
                      className="text-xs text-gray-500 italic font-medium"
                      title={rowData.observation || "Sin descripción"}
                    >
                      {rowData.observation ? (
                        rowData.observation.length > 30 ? (
                          `${rowData.observation.substring(0, 30)}...`
                        ) : (
                          rowData.observation
                        )
                      ) : (
                        <span className="opacity-50">Sin descripción</span>
                      )}
                    </div>
                  )}
                />
                <Column
                  header="Tarifas"
                  headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                  body={(rowData) => (
                    <div className="font-black text-emerald-700 text-sm">
                      {formatRates(rowData.rates || [])}
                    </div>
                  )}
                />
                <Column
                  header="Acciones"
                  headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4 text-center"
                  body={(rowData) => {
                    const historyItems: any[] = [
                      {
                        label: "Historial General",
                        icon: "pi pi-history",
                        command: () => openHistory(rowData),
                      },
                      {
                        label: "Historial de Aseo",
                        icon: "pi pi-sparkles",
                        command: () => openCleaningHistory(rowData),
                      },
                      {
                        label: "Historial de Mantenimiento",
                        icon: "pi pi-wrench",
                        command: () => openMaintenanceHistory(rowData),
                      },
                    ];

                    if (isAdmin) {
                      historyItems.push({ separator: true });
                      historyItems.push({
                        label: "Editar",
                        icon: "pi pi-pencil",
                        command: () => openEdit(rowData),
                      });
                    }

                    return (
                      <div className="flex justify-center">
                        <SplitButton
                          label="Historial"
                          icon="pi pi-history"
                          className="p-button-sm"
                          buttonClassName="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-l-lg px-3 py-1.5 font-semibold transition-all"
                          menuButtonClassName="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 border-l-0 rounded-r-lg px-2 transition-all"
                          tooltip="Ver historial de la habitación"
                          tooltipOptions={{ position: "top" }}
                          onClick={() => openHistory(rowData)}
                          model={historyItems}
                        />
                      </div>
                    );
                  }}
                />
              </DataTable>
            </div>
          </TabPanel>
        ))}
      </TabView>

      <BulkRateUpdateModal
        visible={showBulkRateModal}
        onHide={() => setShowBulkRateModal(false)}
      />
    </div>
  );
};

export default RoomManagement;
