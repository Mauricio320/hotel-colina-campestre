import { CATEGORIES } from "@/constants";
import { useRoomById, useRoomHistory } from "@/hooks/useRooms";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import dayjs from "dayjs";
import React from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";

const RoomHistoryPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { data: room, isLoading: loadingRoom } = useRoomById(roomId || null);
  const { data: history, isLoading: loadingHistory } = useRoomHistory(roomId || null);

  const loading = loadingRoom || loadingHistory;

  const handleBack = () => {
    navigate(`/rooms?tab=${tabParam || CATEGORIES[0]}`);
  };

  const getStatusSeverity = (name: string) => {
    switch (name) {
      case "Disponible":
        return null;
      case "Ocupado":
        return "success";
      case "Reservado":
        return "warning";
      case "Limpieza":
        return "info";
      case "Mantenimiento":
        return null;
      default:
        return "danger";
    }
  };

  const getStatusClassName = (name?: string) =>
    name === "Mantenimiento" || name === "Disponible" ? "bg-gray-500! text-white!" : "";

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto flex max-w-6xl flex-col gap-2 pb-12">
      <PageHeader
        title={`Historial de Habitación ${room?.room_number || ""}`}
        subtitle="Registro completo de cambios de estado y eventos"
        icon="pi-history"
        color="emerald"
        onBack={handleBack}
      />

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-1 shadow-xl">
        <DataTable
          value={history || []}
          responsiveLayout="stack"
          breakpoint="960px"
          className="text-sm"
          scrollable
          scrollHeight="75vh"
          emptyMessage="No hay historial registrado para esta habitación."
          rowHover
          stripedRows
        >
          <Column
            header="Fecha"
            headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-bold text-gray-700">
                {dayjs(row.timestamp).format("D [de] MMMM [de] YYYY, HH:mm")}
              </span>
            )}
            sortable
            field="timestamp"
          />
          <Column
            header="Orden"
            headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span
                className={`font-bold ${row.stay?.order_number ? "cursor-pointer text-emerald-600 hover:text-emerald-800 hover:underline" : "text-gray-700"}`}
                onClick={() => {
                  if (row.stay?.id) {
                    navigate(`/invoice/${row.stay.id}`, {
                      state: { from: location.pathname + location.search },
                    });
                  }
                }}
              >
                {row.stay?.order_number ? `# ${row.stay.order_number}` : "-"}
              </span>
            )}
            sortable
            field="timestamp"
          />
          <Column
            header="Transición"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <div className="flex items-center gap-2">
                <Tag
                  value={row.prev_status?.name || "N/A"}
                  severity={getStatusSeverity(row.prev_status?.name)}
                  className={`text-[10px] font-bold uppercase ${getStatusClassName(row.prev_status?.name)}`}
                />
                <i className="pi pi-arrow-right text-xs text-gray-400"></i>
                <Tag
                  value={row.new_status?.name}
                  severity={getStatusSeverity(row.new_status?.name)}
                  className={`text-[10px] font-bold uppercase ${getStatusClassName(row.new_status?.name)}`}
                />
              </div>
            )}
          />
          <Column
            header="Responsable"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {row.employee ? row.employee.first_name[0] : "S"}
                </div>
                <span className="font-medium text-gray-700">
                  {row.employee
                    ? `${row.employee.first_name} ${row.employee.last_name}`
                    : "SISTEMA"}
                </span>
              </div>
            )}
          />
          <Column
            field="observation"
            header="Notas"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => <span className="text-xs text-gray-600 italic">{row.observation}</span>}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default RoomHistoryPage;
