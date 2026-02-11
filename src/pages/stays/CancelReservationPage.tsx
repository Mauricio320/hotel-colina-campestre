import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

const CancelReservationPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const navigate = useNavigate();

  const handleCancel = () => {
    console.log("Cancelar reserva:", stayId);
    navigate(-1);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card
        header={
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-t-xl">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <i className="pi pi-times-circle text-red-600"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Cancelar Reserva</h1>
              <p className="text-sm text-gray-500">Confirmar cancelación de la reserva</p>
            </div>
          </div>
        }
      >
        <div className="p-4">
          <p className="text-gray-600 mb-6">
            ¿Está seguro que desea cancelar esta reserva? Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              className="p-button-secondary"
              onClick={() => navigate(-1)}
            />
            <Button
              label="Confirmar Cancelación"
              icon="pi pi-times-circle"
              className="p-button-danger"
              onClick={handleCancel}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CancelReservationPage;
