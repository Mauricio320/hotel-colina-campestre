/**
 * Comfaboy Editor Component (Placeholder)
 */

import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";

export const ComfaboyEditor = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Editar Sección Comfaboy</h2>
      <p className="text-gray-600">Configure el contenido de la sección Comfaboy aquí.</p>
      <Button label="Guardar" className="bg-[#006948] text-white" />
    </div>
  );
};
