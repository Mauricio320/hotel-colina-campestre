import { useRef } from "react";
import { Button } from "primereact/button";

interface ImageEditOverlayProps {
  onDelete?: () => void;
  onReplace?: (file: File) => void;
  onEditMeta?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ImageEditOverlay({
  onDelete,
  onReplace,
  onEditMeta,
  children,
  className = "",
}: ImageEditOverlayProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReplace) onReplace(file);
    e.target.value = "";
  };

  return (
    <div className={`group relative ${className}`}>
      {children}

      <div className="pointer-events-none absolute inset-0 rounded-inherit bg-black/40 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100" />

      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {onEditMeta && (
          <Button
            icon="pi pi-pencil"
            rounded
            size="small"
            className="cursor-pointer bg-white/90 text-gray-800 hover:bg-white"
            onClick={onEditMeta}
            tooltip="Editar metadatos"
            tooltipOptions={{ position: "top" }}
            type="button"
          />
        )}
        {onReplace && (
          <Button
            icon="pi pi-refresh"
            rounded
            size="small"
            className="cursor-pointer bg-white/90 text-gray-800 hover:bg-white"
            onClick={() => fileRef.current?.click()}
            tooltip="Reemplazar"
            tooltipOptions={{ position: "top" }}
            type="button"
          />
        )}
        {onDelete && (
          <Button
            icon="pi pi-trash"
            rounded
            size="small"
            severity="danger"
            className="cursor-pointer bg-red-500/90 hover:bg-red-500"
            onClick={onDelete}
            tooltip="Eliminar"
            tooltipOptions={{ position: "top" }}
            type="button"
          />
        )}
      </div>

      {onReplace && (
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}
