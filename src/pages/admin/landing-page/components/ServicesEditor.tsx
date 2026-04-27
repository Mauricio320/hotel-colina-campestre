import { useAuth } from "@/hooks/useAuth";
import {
  useLandingContent,
  useLandingImages,
  useSaveLandingContent,
} from "@/hooks/useLandingPageCms";
import { ServiceItem, ServicesContent } from "@/types/landingPage";
import { DEFAULT_PRIME_ICON } from "@/util/primeIcons";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { IconPicker } from "./shared/IconPicker";
import { Repeater } from "./shared/Repeater";
import { SlotImageUploader } from "./shared/SlotImageUploader";

const COMFABOY_SLOT = "comfaboy_featured";

export const ServicesEditor = () => {
  const toast = useRef<Toast>(null);
  const { employee } = useAuth();

  const {
    data: sectionData,
    isLoading: loadingContent,
    error: contentError,
  } = useLandingContent("services");
  const { data: images = [] } = useLandingImages("services");

  const saveMutation = useSaveLandingContent();

  const [formData, setFormData] = useState<ServicesContent>({
    title: "Nuestros Servicios",
    description: "",
    featured_image_slot: COMFABOY_SLOT,
    featured_alt: "Convenio Comfaboy",
    items: [],
  });

  useEffect(() => {
    if (sectionData?.content) {
      const content = sectionData.content as ServicesContent;
      setFormData({
        title: content.title ?? "Nuestros Servicios",
        description: content.description ?? "",
        featured_image_slot: content.featured_image_slot ?? COMFABOY_SLOT,
        featured_alt: content.featured_alt ?? "Convenio Comfaboy",
        items: content.items ?? [],
      });
    }
  }, [sectionData]);

  const handleSave = async () => {
    if (!employee?.id) return;
    try {
      await saveMutation.mutateAsync({
        sectionType: "services",
        content: formData,
        employeeId: employee.id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: "Sección de servicios actualizada",
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

  const handleAddItem = () => {
    const newItem: ServiceItem = {
      id: crypto.randomUUID(),
      icon: DEFAULT_PRIME_ICON,
      title: "",
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: keyof ServiceItem, value: string) => {
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
              placeholder="Servicios"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripción</label>
            <InputTextarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full"
              rows={2}
              placeholder="Todo lo que necesitas para una estancia cómoda..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Imagen destacada</h3>
        <p className="mb-4 text-xs text-gray-500">
          Imagen grande del convenio Comfaboy (columna izquierda en la landing)
        </p>

        {(() => {
          const featuredImg = images.find((img) => img.slot === formData.featured_image_slot);
          const hasImg = Boolean(featuredImg);
          const hasItems = formData.items.length > 0;

          if (!hasImg && !hasItems) return null;

          return (
            <div className="mb-6">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Vista previa · así se ve en la landing
              </p>
              <div
                className={`grid gap-4 rounded-xl bg-[#f4f3f0] p-4 ${hasImg && hasItems ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}
              >
                {hasImg && featuredImg && (
                  <div className="h-64 overflow-hidden rounded-2xl shadow-xl lg:h-auto">
                    <img
                      src={featuredImg.public_url}
                      alt={formData.featured_alt || "Imagen destacada"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {hasItems && (
                  <div
                    className={`${hasImg ? "lg:col-span-2" : ""} grid grid-cols-2 gap-3 self-start`}
                  >
                    {formData.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006948]/10">
                          <i className={`pi ${item.icon} text-[#006948]`} aria-hidden="true" />
                        </div>
                        <span className="text-sm font-medium text-[#1a1c1a]">
                          {item.title || <span className="text-gray-400 italic">Sin título</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SlotImageUploader
            slot={formData.featured_image_slot}
            sectionType="services"
            sectionId={sectionData?.section?.id}
            images={images}
            label="Imagen Comfaboy"
            aspectClassName="h-52"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Texto alternativo (alt)
            </label>
            <InputText
              value={formData.featured_alt}
              onChange={(e) => setFormData({ ...formData, featured_alt: e.target.value })}
              className="w-full"
              placeholder="Convenio Comfaboy"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Servicios ofrecidos</h3>
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
                placeholder="WiFi gratis"
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
