import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Stay } from "@/types";

type ConflictContext = "check-in" | "move" | "reservation";

interface AvailabilityConflictModalProps {
  visible: boolean;
  onHide: () => void;
  conflicts: any[];
  context?: ConflictContext;
}

const AvailabilityConflictModal: React.FC<AvailabilityConflictModalProps> = ({
  visible,
  onHide,
  conflicts,
  context = "check-in",
}) => {
  // Mensajes según el contexto
  const messages = {
    "check-in": {
      title: "No se puede proceder con el Check-in total.",
      description: "Se encontraron los siguientes registros ocupando el espacio físico solicitado:",
    },
    move: {
      title: "No se puede mover la reserva.",
      description: "La habitación seleccionada no está disponible para las fechas indicadas:",
    },
    reservation: {
      title: "No se puede crear la reserva.",
      description: "El alojamiento seleccionado no está disponible para las fechas indicadas:",
    },
  };

  const currentMessage = messages[context];

  const header = (
    <div className="flex items-center gap-3">
      <i className="pi pi-exclamation-triangle text-2xl text-red-500"></i>
      <span className="text-xl font-black tracking-tight text-gray-800">
        Conflicto de Disponibilidad
      </span>
    </div>
  );

  const footer = (
    <div className="mt-4 flex justify-end">
      <Button
        unstyled
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
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          <p className="flex items-center gap-2 font-bold">
            <i className="pi pi-info-circle"></i>
            {currentMessage.title}
          </p>
          <p className="mt-1 text-sm">{currentMessage.description}</p>
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
                {row.room
                  ? `HAB ${row.room.room_number}`
                  : row.rooms
                    ? `HAB ${row.rooms.room_number}`
                    : row.accommodation_types?.name || "Alojamiento Completo"}
              </span>
            )}
          />

          <Column
            header="Huésped"
            body={(row) => {
              const firstName = row.guest?.first_name || row.guests?.first_name;
              const lastName = row.guest?.last_name || row.guests?.last_name;
              const fullName = [firstName, lastName].filter(Boolean).join(" ");
              return <span className="text-gray-700">{fullName || "Sin huésped"}</span>;
            }}
          />

          <Column
            header="Entrada"
            field="check_in_date"
            body={(row) => new Date(row.check_in_date + "T12:00:00").toLocaleDateString()}
          />
          <Column
            header="Salida"
            field="check_out_date"
            body={(row) => new Date(row.check_out_date + "T12:00:00").toLocaleDateString()}
          />
        </DataTable>
      </div>
    </Dialog>
  );
};

export default AvailabilityConflictModal;
