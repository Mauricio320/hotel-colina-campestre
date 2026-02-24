import { CATEGORIES } from "@/constants";
import { useRoomRateHistory } from "@/hooks/useRoomRateHistory";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import dayjs from "dayjs";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";

const RoomRateHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { data: history, isLoading } = useRoomRateHistory();

  const handleBack = () => {
    navigate(`/rooms?tab=${tabParam || CATEGORIES[0]}`);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-CO")}`;
  };

  const calculateDifference = (oldRate: number, newRate: number) => {
    const diff = newRate - oldRate;
    const percentage = ((diff / oldRate) * 100).toFixed(1);
    return { diff, percentage };
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto flex max-w-6xl flex-col gap-4 pb-12">
      <PageHeader
        title="Historial de Cambios de Tarifas"
        subtitle="Registro completo de actualizaciones de precios por habitación"
        icon="pi-money-bill"
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
          emptyMessage="No hay registros de cambios de tarifas."
          rowHover
          stripedRows
        >
          <Column
            header="Fecha"
            headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-bold text-gray-700">
                {dayjs(row.created_at).format("D [de] MMMM [de] YYYY")}
              </span>
            )}
            sortable
            field="created_at"
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
            header="Habitación"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="text-lg font-black text-emerald-600">
                {row.room?.room_number || "N/A"}
              </span>
            )}
          />
          <Column
            header="Personas"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <Tag
                value={`${row.person_count} ${row.person_count === 1 ? "persona" : "personas"}`}
                className="bg-blue-50 text-[10px] font-bold text-blue-700"
              />
            )}
          />
          <Column
            header="Tarifa Anterior"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-mono text-gray-600 line-through">
                {formatCurrency(row.old_rate)}
              </span>
            )}
          />
          <Column
            header="Nueva Tarifa"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => {
              const { diff, percentage } = calculateDifference(row.old_rate, row.new_rate);
              const isIncrease = diff > 0;

              return (
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-emerald-700">
                    {formatCurrency(row.new_rate)}
                  </span>
                  <span className={`text-xs ${isIncrease ? "text-green-600" : "text-red-500"}`}>
                    {isIncrease ? "↑" : "↓"} {formatCurrency(Math.abs(diff))} ({percentage}%)
                  </span>
                </div>
              );
            }}
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
        </DataTable>
      </div>
    </div>
  );
};

export default RoomRateHistoryPage;
