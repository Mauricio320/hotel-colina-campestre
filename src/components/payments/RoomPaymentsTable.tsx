import { useStaysByAccommodationType } from "@/hooks/useStays";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface RoomPaymentsTableProps {
  accommodation_type_id: string;
  globalFilter: string;
  getPaymentStatus: (row: any) => { status: string; severity: string };
  calculatePending: (row: any) => number;
  activeTab: number;
}

const RoomPaymentsTable: React.FC<RoomPaymentsTableProps> = ({
  accommodation_type_id,
  getPaymentStatus,
  globalFilter,
  activeTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [orderNumberFilter, setOrderNumberFilter] = useState("");
  const [docNumberFilter, setDocNumberFilter] = useState("");
  const [isReservationFilter, setIsReservationFilter] = useState<
    boolean | null
  >(null);

  const originOptions = [
    { label: "Reserva", value: true },
    { label: "Directo", value: false },
  ];

  const { data: staysResult, isLoading: loading } = useStaysByAccommodationType(
    {
      accommodation_type_id,
      page: 0,
      pageSize: 200,
      orderNumber: orderNumberFilter,
      docNumber: docNumberFilter,
      isReservation: isReservationFilter,
    },
  );

  const stays = staysResult?.data || [];

  return (
    <div className="bg-white rounded-3xl border border-emerald-50 shadow-xl shadow-emerald-100/20 overflow-hidden mt-4">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 p-4 bg-gray-50 border-b border-gray-100">
        <span className="p-input-icon-left flex-1 sm:flex-none">
          <i className="pi pi-hashtag text-gray-400" />
          <InputText
            placeholder="Buscar por N° Orden"
            value={orderNumberFilter}
            onChange={(e) => setOrderNumberFilter(e.target.value)}
            className="p-inputtext-sm rounded-lg pl-10 w-full"
          />
        </span>
        <span className="p-input-icon-left flex-1 sm:flex-none">
          <i className="pi pi-id-card text-gray-400" />
          <InputText
            placeholder="Buscar por Documento"
            value={docNumberFilter}
            onChange={(e) => setDocNumberFilter(e.target.value)}
            className="p-inputtext-sm rounded-lg pl-10 w-full"
          />
        </span>
        <Dropdown
          value={isReservationFilter}
          options={originOptions}
          onChange={(e) => setIsReservationFilter(e.value)}
          placeholder="Todos"
          showClear
          className="p-inputtext-sm w-full sm:w-40 rounded-lg"
        />
      </div>
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
          globalFilter={globalFilter}
          breakpoint="640px"
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
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-800 leading-tight">
                  {row.guest
                    ? `${row.guest.first_name} ${row.guest.last_name} - ${row.guest.doc_number}`
                    : "N/A"}
                </span>
                <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                  <i className="pi pi-calendar text-[9px]" />
                  {row.check_in_date} al {row.check_out_date}
                </span>
                <div className="flex gap-1 items-center">
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                    {row.accommodation_type_id
                      ? "Alquiler completo"
                      : `Hab. ${row.room?.room_number}`}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${
                      row.origin_was_reservation
                        ? "text-purple-600 bg-purple-50"
                        : "text-blue-600 bg-blue-50"
                    }`}
                  >
                    {row.origin_was_reservation ? "Reserva" : "Check-in"}
                  </span>
                </div>
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
            className="hidden sm:table-cell"
            headerClassName="hidden sm:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
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
            className="hidden sm:table-cell"
            headerClassName="hidden sm:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-black text-green-600">
                $ {(row.paid_amount || 0).toLocaleString()}
              </span>
            )}
          />

          <Column
            header="Acciones"
            align="center"
            headerClassName="font-bold uppercase text-[10px] tracking-widest p-4 text-center"
            body={(row) => (
              <div className="flex justify-center">
                <Button
                  label="Ver factura"
                  icon="pi pi-file-pdf"
                  className="p-button-sm w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 font-semibold transition-all shadow-sm hover:shadow justify-center"
                  onClick={() =>
                    navigate(`/invoice/${row.id}`, {
                      state: {
                        from: location.pathname,
                        activeTab: activeTab,
                      },
                    })
                  }
                  tooltipOptions={{ position: "left" }}
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
