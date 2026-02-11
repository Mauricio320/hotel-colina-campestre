import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";

const MoveReservationPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const navigate = useNavigate();
  const [newDates, setNewDates] = useState<Date[] | null>(null);

  const handleMove = () => {
    console.log("Mover reserva:", stayId, "Nuevas fechas:", newDates);
    navigate(-1);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card
        header={
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-t-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="pi pi-calendar-plus text-blue-600"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mover Reserva</h1>
              <p className="text-sm text-gray-500">Cambiar fechas de la reserva</p>
            </div>
          </div>
        }
      >
        <div className="p-4">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevas fechas de estadía
            </label>
            <Calendar
              value={newDates}
              onChange={(e) => setNewDates(e.value as Date[])}
              selectionMode="range"
              inline
              className="w-full"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              className="p-button-secondary"
              onClick={() => navigate(-1)}
            />
            <Button
              label="Guardar Cambios"
              icon="pi pi-check"
              className="p-button-primary"
              onClick={handleMove}
              disabled={!newDates || newDates.length < 2}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MoveReservationPage;
