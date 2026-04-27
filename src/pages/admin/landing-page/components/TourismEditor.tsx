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
import { TourismContent, AttractionItem, LandingPageImage } from "@/types/landingPage";
import { Repeater } from "./shared/Repeater";
import { SlotImageUploader } from "./shared/SlotImageUploader";

interface ResolvedAttraction extends AttractionItem {
  image: LandingPageImage;
}

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

  const handleMoveAttraction = (from: number, to: number) => {
    const list = [...formData.attractions];
    if (to < 0 || to >= list.length) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setFormData({ ...formData, attractions: list });
  };

  const handleAttractionChange = (index: number, field: keyof AttractionItem, value: string) => {
    const updated = formData.attractions.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, attractions: updated });
  };

  const resolvedAttractions: ResolvedAttraction[] = formData.attractions
    .map((item) => {
      const image = images.find((img) => img.slot === item.slot);
      if (!image) return null;
      return { ...item, image };
    })
    .filter((item): item is ResolvedAttraction => item !== null);

  const [featured, ...rest] = resolvedAttractions;

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

      {resolvedAttractions.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800">Vista previa</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Así se verá en la landing · la primera atracción ocupa la tarjeta grande
            </p>
          </div>

          <div className="rounded-xl bg-[#f4f3f0] p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative h-96 overflow-hidden rounded-2xl md:h-[520px]">
                <img
                  src={featured.image.public_url}
                  alt={featured.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {featured.category && (
                    <span className="mb-2 w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wider text-white backdrop-blur-sm">
                      {featured.category}
                    </span>
                  )}
                  <h3 className="mb-1 text-2xl font-bold text-white">{featured.name}</h3>
                  {featured.description && (
                    <p className="max-w-sm text-sm text-white/80">{featured.description}</p>
                  )}
                </div>
              </div>

              {rest.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:h-[520px] md:grid-rows-2">
                  {rest.map((item, index) => (
                    <div
                      key={item.id}
                      className={`relative overflow-hidden rounded-2xl ${
                        rest.length % 2 === 1 && index === rest.length - 1 ? "col-span-2" : ""
                      }`}
                    >
                      <div className="relative h-56 w-full overflow-hidden md:h-full">
                        <img
                          src={item.image.public_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-4">
                          {item.category && (
                            <span className="mb-1 w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium tracking-wider text-white/90 backdrop-blur-sm">
                              {item.category}
                            </span>
                          )}
                          <h3 className="text-lg font-bold text-white">{item.name}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Atracciones</h3>
        <p className="mb-4 text-xs text-gray-500">
          La primera atracción se muestra como tarjeta destacada (grande). Las siguientes van en la
          grilla secundaria.
        </p>

        <Repeater
          items={formData.attractions}
          onAdd={handleAddAttraction}
          onRemove={handleRemoveAttraction}
          onMove={handleMoveAttraction}
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
