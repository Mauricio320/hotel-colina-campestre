import { useStaysByAccommodationType } from "@/hooks/useStays";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import React from "react";
import { useNavigate } from "react-router-dom";

interface RoomPaymentsTableProps {
  accommodation_type_id: string;
  header: React.ReactNode;
  globalFilter: string;
  getPaymentStatus: (row: any) => { status: string; severity: string };
  calculatePending: (row: any) => number;
}

const RoomPaymentsTable: React.FC<RoomPaymentsTableProps> = ({
  accommodation_type_id,
  calculatePending,
  getPaymentStatus,
  globalFilter,
  header,
}) => {
  const navigate = useNavigate();

  const { data: stays = [], isLoading: loading } = useStaysByAccommodationType(
    accommodation_type_id,
  );

  return (
    <div className="bg-white rounded-3xl border border-emerald-50 shadow-xl shadow-emerald-100/20 overflow-hidden mt-4">
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <ProgressSpinner strokeWidth="4" style={{ width: "50px" }} />
          <p className="text-emerald-400 font-bold animate-pulse">
            Cargando facturas...
          </p>
        </div>
      ) : (
        <DataTable
          value={stays}
          header={header}
          globalFilter={globalFilter}
          responsiveLayout="stack"
          breakpoint="960px"
          className="text-sm"
          scrollable
          scrollHeight="70vh"
          rowHover
          stripedRows
          emptyMessage={`No hay registros de facturas`}
        >
          <Column
            header="N° Orden"
            sortable
            headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-black text-emerald-600">
                #{row.order_number}
              </span>
            )}
          />

          <Column
            header="Huésped"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">
                  {row.guest
                    ? `${row.guest.first_name} ${row.guest.last_name}`
                    : "N/A"}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Hab. {row.room?.room_number}
                </span>
              </div>
            )}
          />

          <Column
            header="Estado"
            sortable
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => {
              const paymentStatus = getPaymentStatus(row);
              return (
                <Tag
                  value={paymentStatus.status}
                  severity={paymentStatus?.severity as unknown as any}
                  className="text-[10px] font-black uppercase"
                />
              );
            }}
          />

          <Column
            header="Valor Total"
            sortable
            field="total_price"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-black text-gray-800">
                $ {(row.total_price || 0).toLocaleString()}
              </span>
            )}
          />

          <Column
            header="Abonado"
            sortable
            field="paid_amount"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-black text-green-600">
                $ {(row.paid_amount || 0).toLocaleString()}
              </span>
            )}
          />

          <Column
            header="Pendiente"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => {
              const pending = calculatePending(row);
              return (
                <span
                  className={`font-black px-2 py-1 rounded-lg ${
                    pending > 0
                      ? "text-red-600 bg-red-50"
                      : "text-gray-400 bg-gray-50"
                  }`}
                >
                  $ {pending.toLocaleString()}
                </span>
              );
            }}
          />

          <Column
            header="Acciones"
            headerClassName="bg-gray-50/50 text-emerald-400 font-bold uppercase text-[10px] tracking-widest p-4 text-center"
            body={(row) => (
              <div className="flex justify-center">
                <Button
                  label="Ver Factura"
                  icon="pi pi-file-pdf"
                  className="p-button-text p-button-sm font-bold text-emerald-600"
                  onClick={() => navigate(`/invoice/${row.id}`)}
                />
              </div>
            )}
          />
        </DataTable>
      )}
    </div>
  );
};

export default RoomPaymentsTable;
