import { ReactNode } from "react";
import { Button } from "primereact/button";

interface RepeaterProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove?: (from: number, to: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  addLabel?: string;
  emptyLabel?: string;
  compact?: boolean;
}

export function Repeater<T>({
  items,
  onAdd,
  onRemove,
  onMove,
  renderItem,
  addLabel = "Agregar",
  emptyLabel = "No hay elementos. Agrega el primero.",
  compact = false,
}: RepeaterProps<T>) {
  const moveButtons = (index: number) =>
    onMove ? (
      <>
        <Button
          icon="pi pi-chevron-up"
          rounded
          text
          size="small"
          className="cursor-pointer"
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
          tooltip="Subir"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-chevron-down"
          rounded
          text
          size="small"
          className="cursor-pointer"
          onClick={() => onMove(index, index + 1)}
          disabled={index === items.length - 1}
          tooltip="Bajar"
          tooltipOptions={{ position: "top" }}
        />
      </>
    ) : null;

  return (
    <div className={compact ? "space-y-1.5" : "space-y-3"}>
      {items.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
          <p className="text-sm text-gray-500">{emptyLabel}</p>
        </div>
      ) : compact ? (
        items.map((item, index) => (
          <div
            key={(item as unknown as { id: string }).id ?? index}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
          >
            <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
            <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
              {moveButtons(index)}
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
          </div>
        ))
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
              <div className="flex items-center gap-1">
                {moveButtons(index)}
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
