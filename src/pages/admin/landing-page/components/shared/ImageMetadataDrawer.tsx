import { useState, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { LandingPageImage } from "@/types/landingPage";
import { useUpdateLandingImage } from "@/hooks/useLandingPageCms";
import { useLandingImageCategories } from "@/hooks/useLandingImageCategories";

interface ImageMetadataDrawerProps {
  image: LandingPageImage | null;
  onHide: () => void;
}

export function ImageMetadataDrawer({ image, onHide }: ImageMetadataDrawerProps) {
  const [altText, setAltText] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const updateMutation = useUpdateLandingImage();
  const { data: categories = [] } = useLandingImageCategories();

  useEffect(() => {
    if (image) {
      setAltText(image.alt_text ?? "");
      setCategory(image.category ?? null);
    }
  }, [image]);

  const categoryOptions = [
    { label: "Sin categoría", value: null },
    ...categories.map((c) => ({ label: c.name, value: c.name })),
  ];

  const handleSave = async () => {
    if (!image) return;
    await updateMutation.mutateAsync({
      id: image.id,
      alt_text: altText || null,
      category: category,
    });
    onHide();
  };

  return (
    <Sidebar
      visible={!!image}
      onHide={onHide}
      position="right"
      className="w-full sm:w-[380px]"
      header="Metadatos de imagen"
    >
      {image && (
        <div className="flex flex-col gap-4 p-1">
          <div className="overflow-hidden rounded-lg">
            <img
              src={image.public_url}
              alt={image.alt_text ?? ""}
              className="aspect-video w-full object-cover"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Texto alternativo (SEO)
            </label>
            <InputText
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full"
              placeholder="Describe la imagen para accesibilidad y SEO"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Categoría</label>
            <Dropdown
              value={category}
              options={categoryOptions}
              onChange={(e) => setCategory(e.value)}
              placeholder="Sin categoría"
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              label="Cancelar"
              text
              className="cursor-pointer text-gray-600"
              onClick={onHide}
              type="button"
            />
            <Button
              label="Guardar"
              icon="pi pi-save"
              className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleSave}
              loading={updateMutation.isPending}
              type="button"
            />
          </div>
        </div>
      )}
    </Sidebar>
  );
}
