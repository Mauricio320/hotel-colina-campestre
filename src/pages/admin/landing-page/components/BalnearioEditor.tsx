import { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import PageHeader from "@/components/ui/PageHeader";
import {
  useLandingContent,
  useLandingImages,
  useSaveLandingContent,
  useUploadLandingImage,
  useDeleteLandingImage,
} from "@/hooks/useLandingPageCms";
import { useAuth } from "@/hooks/useAuth";
import { useBlockUI } from "@/context/BlockUIContext";
import { optimizeImage } from "@/util/helper/imageOptimizer";
import { BalnearioContent, BalnearioItem, LandingPageImage } from "@/types/landingPage";
import { DEFAULT_PRIME_ICON } from "@/util/primeIcons";
import { Repeater } from "./shared/Repeater";
import { IconPicker } from "./shared/IconPicker";
import { ImageEditOverlay } from "./shared/ImageEditOverlay";

export const BalnearioEditor = () => {
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { employee } = useAuth();
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const {
    data: sectionData,
    isLoading: loadingContent,
    error: contentError,
  } = useLandingContent("balneario");
  const { data: images = [] } = useLandingImages("balneario");

  const saveMutation = useSaveLandingContent();
  const uploadMutation = useUploadLandingImage();
  const deleteMutation = useDeleteLandingImage();

  const [formData, setFormData] = useState<BalnearioContent>({
    title: "Balneario",
    description: "",
    gallery_alt: "Balneario del hotel",
    items: [],
  });

  useEffect(() => {
    if (sectionData?.content) {
      const content = sectionData.content as BalnearioContent;
      setFormData({
        title: content.title ?? "Balneario",
        description: content.description ?? "",
        gallery_alt: content.gallery_alt ?? "Balneario del hotel",
        items: content.items ?? [],
      });
    }
  }, [sectionData]);

  const handleSave = async () => {
    if (!employee?.id) return;
    try {
      await saveMutation.mutateAsync({
        sectionType: "balneario",
        content: formData,
        employeeId: employee.id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: "Sección Balneario actualizada",
        life: 3000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo guardar. Intenta de nuevo.",
        life: 4000,
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sectionData?.section?.id) return;
    try {
      showBlockUI("Optimizando imagen...");
      const {
        file: optimized,
        originalSizeKB,
        optimizedSizeKB,
      } = await optimizeImage(file, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 0.5,
      });
      showBlockUI("Subiendo imagen...");
      await uploadMutation.mutateAsync({
        file: optimized,
        sectionType: "balneario",
        sectionId: sectionData.section.id,
        slot: `balneario_${crypto.randomUUID()}`,
        displayOrder: images.length,
        altText: formData.gallery_alt,
      });
      const savedKB = Math.max(0, Math.round(originalSizeKB - optimizedSizeKB));
      toast.current?.show({
        severity: "success",
        summary: "Imagen subida",
        detail: `Optimizada de ${Math.round(originalSizeKB)} KB a ${Math.round(optimizedSizeKB)} KB (-${savedKB} KB)`,
        life: 3500,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error al subir",
        detail: err instanceof Error ? err.message : "No se pudo procesar la imagen.",
        life: 4000,
      });
    } finally {
      hideBlockUI();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReplaceImage = async (image: LandingPageImage, file: File) => {
    if (!sectionData?.section?.id) return;
    try {
      showBlockUI("Optimizando imagen...");
      const {
        file: optimized,
        originalSizeKB,
        optimizedSizeKB,
      } = await optimizeImage(file, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 0.5,
      });
      showBlockUI("Reemplazando imagen...");
      await deleteMutation.mutateAsync({
        id: image.id,
        storagePath: image.storage_path,
        sectionType: "balneario",
      });
      await uploadMutation.mutateAsync({
        file: optimized,
        sectionType: "balneario",
        sectionId: sectionData.section.id,
        slot: image.slot ?? `balneario_${crypto.randomUUID()}`,
        displayOrder: image.display_order,
        altText: formData.gallery_alt,
      });
      const savedKB = Math.max(0, Math.round(originalSizeKB - optimizedSizeKB));
      toast.current?.show({
        severity: "success",
        summary: "Imagen reemplazada",
        detail: `Optimizada de ${Math.round(originalSizeKB)} KB a ${Math.round(optimizedSizeKB)} KB (-${savedKB} KB)`,
        life: 3500,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error al reemplazar",
        detail: err instanceof Error ? err.message : "No se pudo reemplazar la imagen.",
        life: 4000,
      });
    } finally {
      hideBlockUI();
    }
  };

  const handleDeleteImage = async (id: string, storagePath: string) => {
    try {
      showBlockUI("Eliminando imagen...");
      await deleteMutation.mutateAsync({ id, storagePath, sectionType: "balneario" });
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

  const handleAddItem = () => {
    const newItem: BalnearioItem = {
      id: crypto.randomUUID(),
      icon: DEFAULT_PRIME_ICON,
      title: "",
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleItemChange = (index: number, field: keyof BalnearioItem, value: string) => {
    const updated = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updated });
  };

  if (loadingContent) {
    return (
      <div className="flex justify-center py-16">
        <ProgressSpinner style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  if (contentError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <i className="pi pi-exclamation-triangle mb-3 text-4xl text-red-400"></i>
        <p className="text-sm font-semibold text-red-600">Error al cargar el contenido</p>
        <p className="mt-1 text-xs text-red-500">{(contentError as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-gray-800">Encabezado</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Título</label>
            <InputText
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full"
              placeholder="Balneario"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripción</label>
            <InputTextarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full"
              rows={2}
              placeholder="Disfruta de nuestras instalaciones acuáticas..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Texto alternativo de imágenes (alt)
            </label>
            <InputText
              value={formData.gallery_alt}
              onChange={(e) => setFormData({ ...formData, gallery_alt: e.target.value })}
              className="w-full"
              placeholder="Balneario del hotel"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Galería de imágenes</h3>
        <p className="mb-4 text-xs text-gray-500">
          Imágenes del balneario (columna derecha en la landing). Pasa el cursor sobre cada imagen
          para reemplazar o eliminar.
        </p>

        <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-emerald-400 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
          <i className="pi pi-plus-circle text-base" />
          Agregar imagen
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...images]
              .sort((a, b) => a.display_order - b.display_order)
              .map((image) => (
                <ImageEditOverlay
                  key={image.id}
                  className="overflow-hidden rounded-xl"
                  onReplace={(file) => handleReplaceImage(image, file)}
                  onDelete={() => handleDeleteImage(image.id, image.storage_path)}
                >
                  <img
                    src={image.public_url}
                    alt={image.alt_text ?? formData.gallery_alt}
                    className="aspect-square w-full object-cover"
                  />
                </ImageEditOverlay>
              ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
            No hay imágenes. Agrega la primera con el botón de arriba.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Servicios del balneario</h3>
        <p className="mb-4 text-xs text-gray-500">
          Cada servicio se muestra en la grilla con su icono y título.
        </p>

        <Repeater
          items={formData.items}
          onAdd={handleAddItem}
          onRemove={handleRemoveItem}
          addLabel="Agregar servicio"
          emptyLabel="No hay servicios. Agrega el primero."
          compact
          renderItem={(item, index) => (
            <div className="flex min-w-0 items-center gap-2">
              <div className="w-52 shrink-0">
                <IconPicker
                  value={item.icon}
                  onChange={(value) => handleItemChange(index, "icon", value)}
                />
              </div>
              <InputText
                value={item.title}
                onChange={(e) => handleItemChange(index, "title", e.target.value)}
                className="w-full"
                placeholder="Piscina temperada"
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button
          label="Guardar"
          icon="pi pi-save"
          className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed"
          onClick={handleSave}
          loading={saveMutation.isPending}
          disabled={saveMutation.isPending}
        />
      </div>
    </div>
  );
};
