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
import { HeroContent } from "@/types/landingPage";

export const HeroEditor = () => {
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { employee } = useAuth();
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const {
    data: sectionData,
    isLoading: loadingContent,
    error: contentError,
  } = useLandingContent("hero");
  const { data: images = [], isLoading: loadingImages } = useLandingImages("hero");

  const saveMutation = useSaveLandingContent();
  const uploadMutation = useUploadLandingImage();
  const deleteMutation = useDeleteLandingImage();

  const [formData, setFormData] = useState<HeroContent>({
    title: "",
    subtitle: "",
    cta_text: "Reservar ahora",
    cta_link: "/reservar",
  });

  useEffect(() => {
    if (sectionData?.content) {
      const content = sectionData.content as HeroContent;
      setFormData({
        title: content.title ?? "",
        subtitle: content.subtitle ?? "",
        cta_text: content.cta_text ?? "Reservar ahora",
        cta_link: content.cta_link ?? "/reservar",
      });
    }
  }, [sectionData]);

  const handleSaveTexts = async () => {
    if (!employee?.id) return;
    try {
      await saveMutation.mutateAsync({
        sectionType: "hero",
        content: formData,
        employeeId: employee.id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: "Textos del hero actualizados",
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

    const nextOrder = images.length;

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
        sectionType: "hero",
        sectionId: sectionData.section.id,
        slot: "hero_bg",
        displayOrder: nextOrder,
        altText: optimized.name.replace(/\.[^/.]+$/, ""),
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
        detail:
          err instanceof Error
            ? err.message
            : "No se pudo procesar la imagen. Verifica el formato y tamaño (máx. 5MB).",
        life: 4000,
      });
    } finally {
      hideBlockUI();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (id: string, storagePath: string) => {
    try {
      showBlockUI("Eliminando imagen...");
      await deleteMutation.mutateAsync({ id, storagePath, sectionType: "hero" });
      toast.current?.show({
        severity: "success",
        summary: "Imagen eliminada",
        detail: "La imagen fue removida del carousel",
        life: 3000,
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
        <p className="text-sm font-semibold text-red-600">Error al cargar el contenido del hero</p>
        <p className="mt-1 text-xs text-red-500">{(contentError as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      <PageHeader
        variant="simple"
        title="Hero"
        subtitle="Título, subtítulo y carousel de fondo"
        icon="pi-home"
        color="emerald"
      />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-gray-800">Textos</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Título principal
            </label>
            <InputText
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full"
              placeholder="Hotel ideal para familias..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Subtítulo</label>
            <InputTextarea
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full"
              rows={3}
              placeholder="Experimente la serenidad..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Texto del botón
              </label>
              <InputText
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                className="w-full"
                placeholder="Reservar ahora"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Link del botón
              </label>
              <InputText
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                className="w-full"
                placeholder="/reservar"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              label="Guardar textos"
              icon="pi pi-save"
              className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed"
              onClick={handleSaveTexts}
              loading={saveMutation.isPending}
              disabled={saveMutation.isPending}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800">Imágenes de fondo</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Carousel del hero · máx. 5MB · jpeg, png, webp
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              label="Subir imagen"
              icon="pi pi-upload"
              className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed"
              onClick={() => fileInputRef.current?.click()}
              loading={uploadMutation.isPending}
              disabled={uploadMutation.isPending}
            />
          </div>
        </div>

        {loadingImages ? (
          <div className="flex justify-center py-8">
            <ProgressSpinner style={{ width: "32px", height: "32px" }} />
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
            <i className="pi pi-images mb-3 text-4xl text-gray-300"></i>
            <p className="text-sm text-gray-500">
              No hay imágenes. Sube la primera imagen del carousel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-lg border border-gray-100"
              >
                <img
                  src={img.public_url}
                  alt={img.alt_text ?? `Imagen ${index + 1}`}
                  className="h-28 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/200x112?text=Error";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    icon="pi pi-trash"
                    rounded
                    severity="danger"
                    size="small"
                    className="cursor-pointer disabled:cursor-not-allowed"
                    onClick={() => handleDeleteImage(img.id, img.storage_path)}
                    loading={deleteMutation.isPending}
                    tooltip="Eliminar imagen"
                    tooltipOptions={{ position: "top" }}
                  />
                </div>
                <div className="bg-gray-50 px-2 py-1">
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
