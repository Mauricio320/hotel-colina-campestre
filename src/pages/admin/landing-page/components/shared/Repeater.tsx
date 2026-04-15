import { ReactNode } from "react";
import { Button } from "primereact/button";

interface RepeaterProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  addLabel?: string;
  emptyLabel?: string;
}

export function Repeater<T>({
  items,
  onAdd,
  onRemove,
  renderItem,
  addLabel = "Agregar",
  emptyLabel = "No hay elementos. Agrega el primero.",
}: RepeaterProps<T>) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
          <p className="text-sm text-gray-500">{emptyLabel}</p>
        </div>
      ) : (
        items.map((item, index) => (
          <div
            key={(item as unknown as { id: string }).id ?? index}
            className="relative rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                #{index + 1}
              </span>
              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                size="small"
                className="cursor-pointer"
                onClick={() => onRemove(index)}
                tooltip="Eliminar"
                tooltipOptions={{ position: "top" }}
              />
            </div>
            {renderItem(item, index)}
          </div>
        ))
      )}

      <Button
        label={addLabel}
        icon="pi pi-plus"
        outlined
        className="cursor-pointer border-emerald-600 text-emerald-600 hover:bg-emerald-50"
        onClick={onAdd}
      />
    </div>
  );
}
