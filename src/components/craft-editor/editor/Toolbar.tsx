import { useEditor } from "@craftjs/core";
import React, { useCallback, useState } from "react";
import { useSaveLandingPage } from "@/hooks/useLandingPage";
import { useAuth } from "@/hooks/useAuth";

interface ToolbarProps {
  onPreview?: () => void;
  isPreview?: boolean;
}

export const Toolbar = ({ onPreview, isPreview }: ToolbarProps) => {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const { employee } = useAuth();
  const saveMutation = useSaveLandingPage();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!employee?.id) return;

    setIsSaving(true);
    try {
      const json = query.serialize() as unknown as Record<string, unknown>;
      await saveMutation.mutateAsync({
        nodesJson: json,
        globalStyles: {},
        employeeId: employee.id,
      });
      actions.history.clear();
    } finally {
      setIsSaving(false);
    }
  }, [actions, query, saveMutation, employee]);

  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          disabled={!canUndo}
          onClick={() => actions.history.undo()}
          className={`rounded p-2 ${canUndo ? "hover:bg-gray-100" : "opacity-50"}`}
          title="Deshacer"
        >
          <i className="pi pi-undo" />
        </button>
        <button
          disabled={!canRedo}
          onClick={() => actions.history.redo()}
          className={`rounded p-2 ${canRedo ? "hover:bg-gray-100" : "opacity-50"}`}
          title="Rehacer"
        >
          <i className="pi pi-redo" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPreview}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          <i className={`pi ${isPreview ? "pi-pencil" : "pi-eye"}`} />
          {isPreview ? "Editar" : "Vista previa"}
        </button>
        <button
          disabled={isSaving}
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <i className="pi pi-save" />
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
};
