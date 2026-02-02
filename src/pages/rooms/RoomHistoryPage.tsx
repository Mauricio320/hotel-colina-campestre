import { CATEGORIES } from "@/constants";
import { useRoomById, useRoomHistory } from "@/hooks/useRooms";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import React from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

const RoomHistoryPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { data: room, isLoading: loadingRoom } = useRoomById(roomId || null);
  const { data: history, isLoading: loadingHistory } = useRoomHistory(
    roomId || null,
  );

  const loading = loadingRoom || loadingHistory;

  const handleBack = () => {
    navigate(`/rooms?tab=${tabParam || CATEGORIES[0]}`);
  };

  const getStatusSeverity = (name: string) => {
    switch (name) {
      case "Disponible":
        return "success";
      case "Ocupado":
        return "danger";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon="pi pi-arrow-left"
            className="p-button-text p-button-rounded p-button-secondary bg-white shadow-sm"
            onClick={handleBack}
            tooltip="Volver"
          />
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              Historial de Habitación {room?.room_number}
            </h1>
            <p className="text-gray-500 font-medium">
              Registro completo de cambios de estado y eventos.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-1 shadow-xl border border-gray-100 overflow-hidden">
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
                {new Date(row.timestamp).toLocaleString()}
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
                className={`font-bold ${row.stay?.order_number ? "text-emerald-600 cursor-pointer hover:text-emerald-800 hover:underline" : "text-gray-700"}`}
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
                  className={`text-[10px] font-bold uppercase ${row.prev_status?.name === "Mantenimiento" ? "!bg-gray-500 !text-white" : ""}`}
                />
                <i className="pi pi-arrow-right text-xs text-gray-400"></i>
                <Tag
                  value={row.new_status?.name}
                  severity={getStatusSeverity(row.new_status?.name)}
                  className={`text-[10px] font-bold uppercase ${row.new_status?.name === "Mantenimiento" ? "!bg-gray-500 !text-white" : ""}`}
                />
              </div>
            )}
          />
          <Column
            header="Responsable"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
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
            body={(row) => (
              <span className="text-gray-600 italic text-xs">
                {row.observation}
              </span>
            )}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default RoomHistoryPage;
