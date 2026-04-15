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
import { TourismContent, AttractionItem } from "@/types/landingPage";
import { Repeater } from "./shared/Repeater";
import { SlotImageUploader } from "./shared/SlotImageUploader";

export const TourismEditor = () => {
  const toast = useRef<Toast>(null);
  const { employee } = useAuth();

  const {
    data: sectionData,
    isLoading: loadingContent,
    error: contentError,
  } = useLandingContent("tourism");
  const { data: images = [] } = useLandingImages("tourism");

  const saveMutation = useSaveLandingContent();

  const [formData, setFormData] = useState<TourismContent>({
    title: "",
    subtitle: "",
    attractions: [],
  });

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    if (sectionData?.content) {
      const content = sectionData.content as TourismContent;
      setFormData({
        title: content.title ?? "",
        subtitle: content.subtitle ?? "",
        attractions: content.attractions ?? [],
      });
    }
  }, [sectionData]);

  const handleSave = async () => {
    if (!employee?.id) return;
    try {
      await saveMutation.mutateAsync({
        sectionType: "tourism",
        content: formData,
        employeeId: employee.id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: "Sección de turismo actualizada",
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
      sectionType: "tourism",
      content: formDataRef.current,
      employeeId: employee.id,
    });
  }, [employee?.id, saveMutation]);

  const handleAddAttraction = () => {
    const id = crypto.randomUUID();
    const newItem: AttractionItem = {
      id,
      slot: `attraction_${id}`,
      name: "",
      description: "",
      category: "",
      cta_link: "",
    };
    setFormData({ ...formData, attractions: [...formData.attractions, newItem] });
  };

  const handleRemoveAttraction = (index: number) => {
    setFormData({
      ...formData,
      attractions: formData.attractions.filter((_, i) => i !== index),
    });
  };

  const handleAttractionChange = (
    index: number,
    field: keyof AttractionItem,
    value: string
  ) => {
    const updated = formData.attractions.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, attractions: updated });
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
        title="Turismo"
        subtitle="Atracciones cercanas y experiencias"
        icon="pi-map"
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
              placeholder="Experiencias Inolvidables de Turismo"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Subtítulo</label>
            <InputTextarea
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full"
              rows={2}
              placeholder="Curamos las mejores rutas y actividades..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Atracciones</h3>
        <p className="mb-4 text-xs text-gray-500">
          La primera atracción se muestra como tarjeta destacada (grande). Las siguientes van en
          la grilla secundaria.
        </p>

        <Repeater
          items={formData.attractions}
          onAdd={handleAddAttraction}
          onRemove={handleRemoveAttraction}
          addLabel="Agregar atracción"
          emptyLabel="No hay atracciones. Agrega la primera."
          renderItem={(item, index) => (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SlotImageUploader
                slot={item.slot}
                sectionType="tourism"
                sectionId={sectionData?.section?.id}
                images={images}
                label="Imagen de la atracción"
                aspectClassName="h-72"
                onChange={autoSaveContent}
              />

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Nombre</label>
                  <InputText
                    value={item.name}
                    onChange={(e) => handleAttractionChange(index, "name", e.target.value)}
                    className="w-full"
                    placeholder="Villa de Leyva"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Categoría</label>
                  <InputText
                    value={item.category}
                    onChange={(e) => handleAttractionChange(index, "category", e.target.value)}
                    className="w-full"
                    placeholder="HISTORIA"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Descripción
                  </label>
                  <InputTextarea
                    value={item.description}
                    onChange={(e) => handleAttractionChange(index, "description", e.target.value)}
                    className="w-full"
                    rows={3}
                    placeholder="Explore la plaza empedrada..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Link al hacer click (opcional)
                  </label>
                  <InputText
                    value={item.cta_link ?? ""}
                    onChange={(e) => handleAttractionChange(index, "cta_link", e.target.value)}
                    className="w-full"
                    placeholder="https://ejemplo.com/atraccion"
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
