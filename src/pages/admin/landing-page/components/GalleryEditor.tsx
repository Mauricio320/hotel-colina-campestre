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
import { ImageEditOverlay } from "./shared/ImageEditOverlay";
import { ImageMetadataDrawer } from "./shared/ImageMetadataDrawer";

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
  const [selectedImage, setSelectedImage] = useState<LandingPageImage | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string | null>(null);

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
        category: uploadCategory,
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
      if (value === "") return { ...prev, featured_slots: withoutSlot };
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
        detail: "No se pudo eliminar.",
        life: 4000,
      });
    }
  };

  const featuredCount = formData.featured_slots.filter((s) => s).length;
  const categoryOptions = categories.map((cat) => ({ label: cat.name, value: cat.name }));
  const categorizedImages = images.filter((img) => img.category);

  const resolvedBento = (formData.featured_slots ?? [])
    .map((slot): { img: LandingPageImage; slot: string } | null => {
      const found = images.find((img) => img.slot === slot);
      if (!found) return null;
      return { img: found, slot };
    })
    .filter((item): item is { img: LandingPageImage; slot: string } => item !== null);

  const isBento = resolvedBento.length >= 7;
  const topRow = isBento ? resolvedBento.slice(0, 4) : resolvedBento;
  const bottomRow = isBento ? resolvedBento.slice(4, 7) : [];

  const adaptiveCols =
    topRow.length === 1
      ? "grid-cols-1"
      : topRow.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : topRow.length === 3
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          : "grid-cols-2 md:grid-cols-4";

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

      <ImageMetadataDrawer image={selectedImage} onHide={() => setSelectedImage(null)} />

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
          Etiquetas que se muestran como badge sobre cada imagen en la landing.
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

      {resolvedBento.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800">Vista previa del bento</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Así se ve en la landing · {featuredCount}/{FEATURED_LIMIT} posiciones asignadas · pasa
              el cursor para editar
            </p>
          </div>

          <div className="space-y-3">
            <div className={`grid gap-3 ${adaptiveCols}`}>
              {topRow.map(({ img, slot }) => (
                <BentoPreviewTile
                  key={img.id}
                  img={img}
                  onDelete={() => handleDeleteImage(img.id, img.storage_path, slot)}
                  onEditMeta={() => setSelectedImage(img)}
                />
              ))}
            </div>

            {isBento && bottomRow.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {bottomRow[0] && (
                  <BentoPreviewTile
                    img={bottomRow[0].img}
                    className="col-span-2"
                    onDelete={() =>
                      handleDeleteImage(
                        bottomRow[0].img.id,
                        bottomRow[0].img.storage_path,
                        bottomRow[0].slot
                      )
                    }
                    onEditMeta={() => setSelectedImage(bottomRow[0].img)}
                  />
                )}
                {bottomRow[1] && (
                  <BentoPreviewTile
                    img={bottomRow[1].img}
                    onDelete={() =>
                      handleDeleteImage(
                        bottomRow[1].img.id,
                        bottomRow[1].img.storage_path,
                        bottomRow[1].slot
                      )
                    }
                    onEditMeta={() => setSelectedImage(bottomRow[1].img)}
                  />
                )}
                {bottomRow[2] && (
                  <BentoPreviewTile
                    img={bottomRow[2].img}
                    onDelete={() =>
                      handleDeleteImage(
                        bottomRow[2].img.id,
                        bottomRow[2].img.storage_path,
                        bottomRow[2].slot
                      )
                    }
                    onEditMeta={() => setSelectedImage(bottomRow[2].img)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800">Todas las imágenes</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              {categorizedImages.length} fotos · asigna la posición destacada para el bento
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              value={uploadCategory}
              options={categoryOptions}
              onChange={(e) => setUploadCategory(e.value)}
              placeholder="Categoría para nuevas subidas"
              className="text-sm"
            />
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
              disabled={uploadMutation.isPending || !uploadCategory}
            />
          </div>
        </div>

        {loadingImages ? (
          <div className="flex justify-center py-8">
            <ProgressSpinner style={{ width: "32px", height: "32px" }} />
          </div>
        ) : categorizedImages.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
            <i className="pi pi-images mb-3 text-4xl text-gray-300"></i>
            <p className="text-sm text-gray-500">
              No hay imágenes con categoría. Selecciona una categoría y sube la primera imagen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categorizedImages.map((img) => (
              <div key={img.id} className="flex flex-col gap-1.5">
                <ImageEditOverlay
                  className="overflow-hidden rounded-lg"
                  onDelete={() => handleDeleteImage(img.id, img.storage_path, img.slot)}
                  onEditMeta={() => setSelectedImage(img)}
                >
                  <img
                    src={img.public_url}
                    alt={img.alt_text ?? ""}
                    className="aspect-video w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x225?text=Error";
                    }}
                  />
                </ImageEditOverlay>
                <Dropdown
                  value={getImagePosition(img.slot)}
                  options={positionOptions}
                  onChange={(e) => handlePositionChange(img.slot, e.value)}
                  className="w-full text-xs"
                  placeholder="Sin destacar"
                />
                <Dropdown
                  value={img.category ?? null}
                  options={categoryOptions}
                  onChange={(e) => handleUpdateImage(img.id, { category: e.value })}
                  className="w-full text-xs"
                  placeholder="Sin categoría"
                />
              </div>
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

interface BentoPreviewTileProps {
  img: LandingPageImage;
  className?: string;
  onDelete: () => void;
  onEditMeta: () => void;
}

function BentoPreviewTile({ img, className = "", onDelete, onEditMeta }: BentoPreviewTileProps) {
  return (
    <ImageEditOverlay
      className={`overflow-hidden rounded-2xl ${className}`}
      onDelete={onDelete}
      onEditMeta={onEditMeta}
    >
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        <img
          src={img.public_url}
          alt={img.alt_text ?? ""}
          className="h-full w-full object-cover transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          {img.category && (
            <span className="mb-2 inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              {img.category}
            </span>
          )}
          {img.alt_text && <p className="text-lg font-semibold text-white">{img.alt_text}</p>}
        </div>
      </div>
    </ImageEditOverlay>
  );
}
