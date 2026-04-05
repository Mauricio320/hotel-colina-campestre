/**
 * Turismo Editor Component (Placeholder)
 */

import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";

export const TurismoEditor = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Editar Sección Turismo</h2>
      <p className="text-gray-600">Configure las atracciones turísticas aquí.</p>
      <Button label="Guardar" className="bg-[#006948] text-white" />
    </div>
  );
};
