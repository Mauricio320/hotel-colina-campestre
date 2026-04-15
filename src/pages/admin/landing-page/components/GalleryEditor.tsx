import { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import PageHeader from "@/components/ui/PageHeader";
import {
  useLandingContent,
  useLandingImages,
  useSaveLandingContent,
  useUploadLandingImage,
  useDeleteLandingImage,
  useUpdateLandingImage,
} from "@/hooks/useLandingPageCms";
import {
  useLandingImageCategories,
  useCreateLandingImageCategory,
  useUpdateLandingImageCategory,
  useDeleteLandingImageCategory,
} from "@/hooks/useLandingImageCategories";
import { useAuth } from "@/hooks/useAuth";
import { useBlockUI } from "@/context/BlockUIContext";
import { optimizeImage } from "@/util/helper/imageOptimizer";
import { GalleryContent, LandingPageImage, LandingImageCategory } from "@/types/landingPage";

const FEATURED_LIMIT = 7;

const positionOptions = [
  { label: "Sin destacar", value: "" },
  ...Array.from({ length: FEATURED_LIMIT }, (_, i) => ({
    label: `Posición ${i + 1}`,
    value: `${i}`,
  })),
];

export const GalleryEditor = () => {
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { employee } = useAuth();
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const {
    data: sectionData,
    isLoading: loadingContent,
    error: contentError,
  } = useLandingContent("gallery");
  const { data: images = [], isLoading: loadingImages } = useLandingImages("gallery");
  const { data: categories = [] } = useLandingImageCategories();

  const saveMutation = useSaveLandingContent();
  const uploadMutation = useUploadLandingImage();
  const deleteMutation = useDeleteLandingImage();
  const updateImageMutation = useUpdateLandingImage();

  const createCategoryMutation = useCreateLandingImageCategory();
  const updateCategoryMutation = useUpdateLandingImageCategory();
  const deleteCategoryMutation = useDeleteLandingImageCategory();

  const [formData, setFormData] = useState<GalleryContent>({
    title: "Galería de Fotos",
    description: "",
    featured_slots: [],
  });

  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (sectionData?.content) {
      const content = sectionData.content as GalleryContent;
      setFormData({
        title: content.title ?? "Galería de Fotos",
        description: content.description ?? "",
        featured_slots: content.featured_slots ?? [],
      });
    }
  }, [sectionData]);

  const handleSave = async () => {
    if (!employee?.id) return;
    try {
      await saveMutation.mutateAsync({
        sectionType: "gallery",
        content: formData,
        employeeId: employee.id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: "Galería actualizada",
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
        sectionType: "gallery",
        sectionId: sectionData.section.id,
        slot: `gallery_${crypto.randomUUID()}`,
        displayOrder: images.length,
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
        detail: err instanceof Error ? err.message : "No se pudo procesar la imagen.",
        life: 4000,
      });
    } finally {
      hideBlockUI();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (id: string, storagePath: string, slot?: string) => {
    try {
      showBlockUI("Eliminando imagen...");
      await deleteMutation.mutateAsync({ id, storagePath, sectionType: "gallery" });

      if (slot) {
        setFormData((prev) => ({
          ...prev,
          featured_slots: prev.featured_slots.filter((s) => s !== slot),
        }));
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

  const handleUpdateImage = async (
    id: string,
    patch: { alt_text?: string | null; category?: string | null }
  ) => {
    try {
      await updateImageMutation.mutateAsync({ id, ...patch });
      toast.current?.show({
        severity: "success",
        summary: "Imagen actualizada",
        detail: "",
        life: 2000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar la imagen.",
        life: 4000,
      });
    }
  };

  const getImagePosition = (slot?: string): string => {
    if (!slot) return "";
    const index = formData.featured_slots.indexOf(slot);
    return index === -1 ? "" : `${index}`;
  };

  const handlePositionChange = (slot: string | undefined, value: string) => {
    if (!slot) return;
    setFormData((prev) => {
      const withoutSlot = prev.featured_slots.filter((s) => s !== slot);

      if (value === "") {
        return { ...prev, featured_slots: withoutSlot };
      }

      const targetIndex = parseInt(value, 10);
      const next = [...withoutSlot];
      while (next.length < FEATURED_LIMIT) next.push("");
      next[targetIndex] = slot;
      return { ...prev, featured_slots: next.slice(0, FEATURED_LIMIT) };
    });
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await createCategoryMutation.mutateAsync({ name, displayOrder: categories.length });
      setNewCategoryName("");
      toast.current?.show({
        severity: "success",
        summary: "Categoría creada",
        detail: name,
        life: 2500,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err instanceof Error ? err.message : "No se pudo crear la categoría.",
        life: 4000,
      });
    }
  };

  const handleRenameCategory = async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await updateCategoryMutation.mutateAsync({ id, patch: { name: trimmed } });
      toast.current?.show({
        severity: "success",
        summary: "Categoría renombrada",
        detail: "",
        life: 2000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err instanceof Error ? err.message : "No se pudo renombrar.",
        life: 4000,
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast.current?.show({
        severity: "success",
        summary: "Categoría eliminada",
        detail: "",
        life: 2000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar la categoría.",
        life: 4000,
      });
    }
  };

  const featuredCount = formData.featured_slots.filter((s) => s).length;

  const categoryOptions = categories.map((cat) => ({ label: cat.name, value: cat.name }));

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

      <PageHeader
        variant="simple"
        title="Galería"
        subtitle="Fotos destacadas del bento grid de la landing"
        icon="pi-images"
        color="emerald"
      />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-gray-800">Encabezado</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Título</label>
            <InputText
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full"
              placeholder="Galería de Fotos"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripción</label>
            <InputTextarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full"
              rows={2}
              placeholder="Descubre los rincones y paisajes..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Categorías</h3>
        <p className="mb-4 text-xs text-gray-500">
          Categorías disponibles para etiquetar las imágenes. Se muestran como badge en la
          landing.
        </p>

        <div className="space-y-2">
          {categories.length === 0 && (
            <p className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center text-sm text-gray-500">
              No hay categorías. Crea la primera.
            </p>
          )}

          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onRename={handleRenameCategory}
              onDelete={handleDeleteCategory}
              pendingDelete={deleteCategoryMutation.isPending}
            />
          ))}

          <div className="flex items-center gap-2 pt-2">
            <InputText
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCategory();
              }}
              className="flex-1"
              placeholder="Nombre de la nueva categoría"
            />
            <Button
              label="Agregar"
              icon="pi pi-plus"
              outlined
              className="cursor-pointer border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed"
              onClick={handleCreateCategory}
              loading={createCategoryMutation.isPending}
              disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800">Imágenes</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Sube todas las fotos y marca hasta {FEATURED_LIMIT} como destacadas para el bento
              grid. Destacadas: {featuredCount}/{FEATURED_LIMIT}
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
              No hay imágenes. Sube la primera imagen de la galería.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <GalleryImageCard
                key={img.id}
                image={img}
                categoryOptions={categoryOptions}
                position={getImagePosition(img.slot)}
                onPositionChange={(value) => handlePositionChange(img.slot, value)}
                onUpdate={handleUpdateImage}
                onDelete={() => handleDeleteImage(img.id, img.storage_path, img.slot)}
                deleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
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

interface CategoryRowProps {
  category: LandingImageCategory;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  pendingDelete: boolean;
}

function CategoryRow({ category, onRename, onDelete, pendingDelete }: CategoryRowProps) {
  const [name, setName] = useState(category.name);

  useEffect(() => {
    setName(category.name);
  }, [category.name]);

  const handleBlur = () => {
    if (name.trim() && name.trim() !== category.name) {
      onRename(category.id, name);
    } else {
      setName(category.name);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2">
      <InputText
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="flex-1"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        size="small"
        className="cursor-pointer disabled:cursor-not-allowed"
        onClick={() => onDelete(category.id)}
        disabled={pendingDelete}
        tooltip="Eliminar categoría"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );
}

interface GalleryImageCardProps {
  image: LandingPageImage;
  categoryOptions: { label: string; value: string }[];
  position: string;
  onPositionChange: (value: string) => void;
  onUpdate: (
    id: string,
    patch: { alt_text?: string | null; category?: string | null }
  ) => Promise<void>;
  onDelete: () => void;
  deleting: boolean;
}

function GalleryImageCard({
  image,
  categoryOptions,
  position,
  onPositionChange,
  onUpdate,
  onDelete,
  deleting,
}: GalleryImageCardProps) {
  const [altText, setAltText] = useState(image.alt_text ?? "");

  useEffect(() => {
    setAltText(image.alt_text ?? "");
  }, [image.alt_text]);

  const handleAltBlur = () => {
    if (altText !== (image.alt_text ?? "")) {
      onUpdate(image.id, { alt_text: altText || null });
    }
  };

  const handleCategoryChange = (value: string | null) => {
    onUpdate(image.id, { category: value });
  };

  return (
    <div className="group flex flex-col gap-2 rounded-lg border border-gray-100 p-2">
      <div className="relative overflow-hidden rounded-md">
        <img
          src={image.public_url}
          alt={image.alt_text ?? "Imagen galería"}
          className="h-32 w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x200?text=Error";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            icon="pi pi-trash"
            rounded
            severity="danger"
            size="small"
            className="cursor-pointer"
            onClick={onDelete}
            loading={deleting}
            tooltip="Eliminar"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Nombre</label>
        <InputText
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          onBlur={handleAltBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-full"
          placeholder="Nombre de la imagen"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Categoría</label>
        <Dropdown
          value={image.category ?? null}
          options={categoryOptions}
          onChange={(e) => handleCategoryChange(e.value ?? null)}
          className="w-full"
          placeholder="Sin categoría"
          showClear
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Destacar</label>
        <Dropdown
          value={position}
          options={positionOptions}
          onChange={(e) => onPositionChange(e.value)}
          className="w-full"
          placeholder="Destacar en..."
        />
      </div>
    </div>
  );
}
