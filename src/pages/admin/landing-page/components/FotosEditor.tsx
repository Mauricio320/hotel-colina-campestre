/**
 * Fotos Editor Component (Placeholder)
 */

import { useLandingPageSection } from "@/hooks/useLandingPageSection";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";

export const FotosEditor = () => {
  const { data: sectionData, isLoading } = useLandingPageSection("fotos");

  if (isLoading) {
    return <ProgressSpinner />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Editar Galería de Fotos</h2>
      <p className="text-gray-600">Administre las fotos de la galería aquí.</p>
      <Button label="Guardar" className="bg-[#006948] text-white" />
    </div>
  );
};
