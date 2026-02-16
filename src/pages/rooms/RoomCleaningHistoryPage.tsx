import { CATEGORIES } from "@/constants";
import { useCleaningLogsByRoom } from "@/hooks/useCleaningLogs";
import { useRoomById } from "@/hooks/useRooms";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import dayjs from "dayjs";
import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const RoomCleaningHistoryPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { data: room, isLoading: loadingRoom } = useRoomById(roomId || null);
  const { data: cleaningLogs, isLoading: loadingLogs } = useCleaningLogsByRoom(
    roomId || null,
  );

  const loading = loadingRoom || loadingLogs;

  const handleBack = () => {
    navigate(`/rooms?tab=${tabParam || CATEGORIES[0]}`);
  };

  const getCleaningTypeSeverity = (type: string) => {
    switch (type) {
      case "Aseo general":
        return "success";
      case "Aseo parcial":
        return "info";
      default:
        return null;
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
              Historial de Aseo - Habitación {room?.room_number}
            </h1>
            <p className="text-gray-500 font-medium">
              Registro completo de limpiezas realizadas.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-1 shadow-xl border border-gray-100 overflow-hidden">
        <DataTable
          value={cleaningLogs || []}
          responsiveLayout="stack"
          breakpoint="960px"
          className="text-sm"
          scrollable
          scrollHeight="75vh"
          emptyMessage="No hay registros de aseo para esta habitación."
          rowHover
          stripedRows
        >
          <Column
            header="Fecha"
            headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-bold text-gray-700">
                {dayjs(row.date).format("D [de] MMMM [de] YYYY")}
              </span>
            )}
            sortable
            field="date"
          />
          <Column
            header="Hora"
            headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-medium text-gray-600">
                {dayjs(row.created_at).format("HH:mm")}
              </span>
            )}
          />
          <Column
            header="Tipo de Aseo"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <Tag
                value={row.cleaning_type}
                severity={getCleaningTypeSeverity(row.cleaning_type)}
                className="text-[10px] font-bold uppercase"
              />
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
            header="Orden"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span
                className={`font-bold ${row.stay?.order_number ? "text-emerald-600" : "text-gray-400"}`}
              >
                {row.stay?.order_number ? `# ${row.stay.order_number}` : "-"}
              </span>
            )}
          />
          <Column
            field="observation"
            header="Observaciones"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="text-gray-600 italic text-xs">
                {row.observation || "-"}
              </span>
            )}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default RoomCleaningHistoryPage;
