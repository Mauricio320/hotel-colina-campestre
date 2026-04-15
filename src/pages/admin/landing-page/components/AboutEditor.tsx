import { useCallback, useEffect, useRef, useState } from "react";
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
} from "@/hooks/useLandingPageCms";
import { useAuth } from "@/hooks/useAuth";
import { AboutContent, AboutFeature, AboutGalleryItem } from "@/types/landingPage";
import { DEFAULT_PRIME_ICON } from "@/util/primeIcons";
import { Repeater } from "./shared/Repeater";
import { SlotImageUploader } from "./shared/SlotImageUploader";
import { IconPicker } from "./shared/IconPicker";

export const AboutEditor = () => {
  const toast = useRef<Toast>(null);
  const { employee } = useAuth();

  const {
    data: sectionData,
    isLoading: loadingContent,
    error: contentError,
  } = useLandingContent("about");
  const { data: images = [] } = useLandingImages("about");

  const saveMutation = useSaveLandingContent();

  const [formData, setFormData] = useState<AboutContent>({
    label: "Nuestra Esencia",
    title: "",
    description: "",
    cta_text: "Reservar Apartamento",
    cta_link: "/reservar",
    features: [],
    gallery_items: [],
  });

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    if (sectionData?.content) {
      const content = sectionData.content as AboutContent;
      setFormData({
        label: content.label ?? "Nuestra Esencia",
        title: content.title ?? "",
        description: content.description ?? "",
        cta_text: content.cta_text ?? "Reservar Apartamento",
        cta_link: content.cta_link ?? "/reservar",
        features: content.features ?? [],
        gallery_items: content.gallery_items ?? [],
      });
    }
  }, [sectionData]);

  const handleSave = async () => {
    if (!employee?.id) return;
    try {
      await saveMutation.mutateAsync({
        sectionType: "about",
        content: formData,
        employeeId: employee.id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: "Sección 'Acerca de' actualizada",
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

  const autoSaveContent = useCallback(async () => {
    if (!employee?.id) return;
    await saveMutation.mutateAsync({
      sectionType: "about",
      content: formDataRef.current,
      employeeId: employee.id,
    });
  }, [employee?.id, saveMutation]);

  const handleAddFeature = () => {
    const newItem: AboutFeature = {
      id: crypto.randomUUID(),
      icon: DEFAULT_PRIME_ICON,
      label: "",
    };
    setFormData({ ...formData, features: [...formData.features, newItem] });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleFeatureChange = (index: number, field: keyof AboutFeature, value: string) => {
    const updated = formData.features.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, features: updated });
  };

  const handleAddGalleryItem = () => {
    const id = crypto.randomUUID();
    const newItem: AboutGalleryItem = {
      id,
      slot: `about_gallery_${id}`,
      title: "",
      description: "",
    };
    setFormData({ ...formData, gallery_items: [...formData.gallery_items, newItem] });
  };

  const handleRemoveGalleryItem = (index: number) => {
    setFormData({
      ...formData,
      gallery_items: formData.gallery_items.filter((_, i) => i !== index),
    });
  };

  const handleGalleryItemChange = (
    index: number,
    field: keyof AboutGalleryItem,
    value: string
  ) => {
    const updated = formData.gallery_items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, gallery_items: updated });
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

      <PageHeader
        variant="simple"
        title="Acerca de"
        subtitle="Apartamentos, características y galería"
        icon="pi-info-circle"
        color="emerald"
      />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-gray-800">Textos principales</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Etiqueta</label>
            <InputText
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full"
              placeholder="Nuestra Esencia"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Título</label>
            <InputText
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full"
              placeholder="Nuestros Apartamentos"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripción</label>
            <InputTextarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full"
              rows={3}
              placeholder="Contamos con 2 amplios apartamentos familiares..."
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
                placeholder="Reservar Apartamento"
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
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Características</h3>
        <p className="mb-4 text-xs text-gray-500">
          Lista de features con icono + texto (ej. "Cocina equipada"). Se muestran en grilla 2x3
          en la landing.
        </p>

        <Repeater
          items={formData.features}
          onAdd={handleAddFeature}
          onRemove={handleRemoveFeature}
          addLabel="Agregar característica"
          emptyLabel="No hay características. Agrega la primera."
          renderItem={(item, index) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[240px_1fr]">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Icono</label>
                <IconPicker
                  value={item.icon}
                  onChange={(value) => handleFeatureChange(index, "icon", value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Texto</label>
                <InputText
                  value={item.label}
                  onChange={(e) => handleFeatureChange(index, "label", e.target.value)}
                  className="w-full"
                  placeholder="Cocina equipada"
                />
              </div>
            </div>
          )}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Galería de apartamentos</h3>
        <p className="mb-4 text-xs text-gray-500">
          Cada elemento tiene imagen, badge, título y descripción. Se muestran en un carrusel
          navegable en la landing.
        </p>

        <Repeater
          items={formData.gallery_items}
          onAdd={handleAddGalleryItem}
          onRemove={handleRemoveGalleryItem}
          addLabel="Agregar imagen"
          emptyLabel="No hay imágenes. Agrega la primera."
          renderItem={(item, index) => (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SlotImageUploader
                slot={item.slot}
                sectionType="about"
                sectionId={sectionData?.section?.id}
                images={images}
                label="Imagen"
                aspectClassName="h-64"
                onChange={autoSaveContent}
              />

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Título</label>
                  <InputText
                    value={item.title}
                    onChange={(e) => handleGalleryItemChange(index, "title", e.target.value)}
                    className="w-full"
                    placeholder="Apartamento Familiar Grande"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Descripción
                  </label>
                  <InputTextarea
                    value={item.description}
                    onChange={(e) => handleGalleryItemChange(index, "description", e.target.value)}
                    className="w-full"
                    rows={6}
                    placeholder="Amplio apartamento con capacidad..."
                  />
                </div>
              </div>
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
