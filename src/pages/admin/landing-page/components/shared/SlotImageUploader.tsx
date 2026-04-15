import { useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {
  useUploadLandingImage,
  useDeleteLandingImage,
} from "@/hooks/useLandingPageCms";
import { useBlockUI } from "@/context/BlockUIContext";
import { optimizeImage } from "@/util/helper/imageOptimizer";
import { LandingPageImage, SectionType } from "@/types/landingPage";

interface SlotImageUploaderProps {
  slot: string;
  sectionType: SectionType;
  sectionId: string | undefined;
  images: LandingPageImage[];
  label?: string;
  altText?: string;
  aspectClassName?: string;
  onChange?: () => void | Promise<void>;
}

export const SlotImageUploader = ({
  slot,
  sectionType,
  sectionId,
  images,
  label = "Imagen",
  altText,
  aspectClassName = "h-40",
  onChange,
}: SlotImageUploaderProps) => {
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const uploadMutation = useUploadLandingImage();
  const deleteMutation = useDeleteLandingImage();

  const existing = images.find((img) => img.slot === slot);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sectionId) return;

    try {
      showBlockUI("Optimizando imagen...");
      const { file: optimized } = await optimizeImage(file, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 0.5,
      });

      if (existing) {
        showBlockUI("Reemplazando imagen...");
        await deleteMutation.mutateAsync({
          id: existing.id,
          storagePath: existing.storage_path,
          sectionType,
        });
      }

      showBlockUI("Subiendo imagen...");
      await uploadMutation.mutateAsync({
        file: optimized,
        sectionType,
        sectionId,
        slot,
        displayOrder: 0,
        altText: altText ?? optimized.name.replace(/\.[^/.]+$/, ""),
      });

      if (onChange) {
        showBlockUI("Sincronizando...");
        await onChange();
      }

      toast.current?.show({
        severity: "success",
        summary: "Imagen guardada",
        detail: `Slot: ${slot}`,
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err instanceof Error ? err.message : "No se pudo subir la imagen.",
        life: 4000,
      });
    } finally {
      hideBlockUI();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    try {
      showBlockUI("Eliminando imagen...");
      await deleteMutation.mutateAsync({
        id: existing.id,
        storagePath: existing.storage_path,
        sectionType,
      });

      if (onChange) {
        showBlockUI("Sincronizando...");
        await onChange();
      }

      toast.current?.show({
        severity: "success",
        summary: "Imagen eliminada",
        detail: "",
        life: 2500,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar la imagen.",
        life: 4000,
      });
    } finally {
      hideBlockUI();
    }
  };

  return (
    <div className="space-y-2">
      <Toast ref={toast} />
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />

      {existing ? (
        <div className="group relative overflow-hidden rounded-lg border border-gray-200">
          <img
            src={existing.public_url}
            alt={existing.alt_text ?? label}
            className={`w-full object-cover ${aspectClassName}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/400x200?text=Error";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              icon="pi pi-refresh"
              rounded
              size="small"
              className="cursor-pointer"
              tooltip="Reemplazar"
              tooltipOptions={{ position: "top" }}
              onClick={() => fileInputRef.current?.click()}
            />
            <Button
              icon="pi pi-trash"
              rounded
              severity="danger"
              size="small"
              className="cursor-pointer"
              tooltip="Eliminar"
              tooltipOptions={{ position: "top" }}
              onClick={handleDelete}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!sectionId}
          className={`flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 ${aspectClassName}`}
        >
          <div className="flex flex-col items-center gap-1">
            <i className="pi pi-upload text-2xl"></i>
            <span className="text-xs font-medium">Subir imagen</span>
          </div>
        </button>
      )}
    </div>
  );
};
