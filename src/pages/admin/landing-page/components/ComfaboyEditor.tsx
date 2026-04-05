/**
 * Comfaboy Editor Component (Placeholder)
 */

import { useLandingPageSection } from "@/hooks/useLandingPageSection";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";

export const ComfaboyEditor = () => {
  const { data: sectionData, isLoading } = useLandingPageSection("comfaboy");

  if (isLoading) {
    return <ProgressSpinner />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Editar Sección Comfaboy</h2>
      <p className="text-gray-600">Configure el contenido de la sección Comfaboy aquí.</p>
      <Button label="Guardar" className="bg-[#006948] text-white" />
    </div>
  );
};
