import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Stay } from "@/types";

interface AvailabilityConflictModalProps {
  visible: boolean;
  onHide: () => void;
  conflicts: any[];
}

const AvailabilityConflictModal: React.FC<AvailabilityConflictModalProps> = ({
  visible,
  onHide,
  conflicts,
}) => {
  const header = (
    <div className="flex items-center gap-3">
      <i className="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
      <span className="text-xl font-black text-gray-800 tracking-tight">
        Conflicto de Disponibilidad
      </span>
    </div>
  );

  const footer = (
    <div className="flex justify-end mt-4">
      <Button
        label="Entendido"
        icon="pi pi-check"
        onClick={onHide}
        className="p-button-danger rounded-xl font-bold"
      />
    </div>
  );

  return (
    <Dialog
      header={header}
      visible={visible}
      onHide={onHide}
      footer={footer}
      className="w-full max-w-2xl"
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
          <p className="font-bold flex items-center gap-2">
            <i className="pi pi-info-circle"></i>
            No se puede proceder con el Check-in total.
          </p>
          <p className="text-sm mt-1">
            Se encontraron los siguientes registros ocupando el espacio físico
            solicitado:
          </p>
        </div>

        <DataTable
          value={conflicts}
          className="text-sm"
          responsiveLayout="stack"
          breakpoint="641px"
        >
          <Column
            header="N°"
            field="order_number"
            body={(row) => <span># {row.order_number}</span>}
          />
          <Column
            header="Alojamiento"
            body={(row) => (
              <span className="font-bold text-gray-700">
                {row.rooms
                  ? `HAB ${row.rooms.room_number}`
                  : row.accommodation_types?.name || "Alojamiento Completo"}
              </span>
            )}
          />

          <Column
            header="Entrada"
            field="check_in_date"
            body={(row) =>
              new Date(row.check_in_date + "T12:00:00").toLocaleDateString()
            }
          />
          <Column
            header="Salida"
            field="check_out_date"
            body={(row) =>
              new Date(row.check_out_date + "T12:00:00").toLocaleDateString()
            }
          />
        </DataTable>
      </div>
    </Dialog>
  );
};

export default AvailabilityConflictModal;
