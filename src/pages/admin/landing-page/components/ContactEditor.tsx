import { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import PageHeader from "@/components/ui/PageHeader";
import { useLandingContent, useSaveLandingContent } from "@/hooks/useLandingPageCms";
import { useAuth } from "@/hooks/useAuth";
import { ContactContent, SocialLink } from "@/types/landingPage";
import { DEFAULT_PRIME_ICON } from "@/util/primeIcons";
import { Repeater } from "./shared/Repeater";
import { IconPicker } from "./shared/IconPicker";

export const ContactEditor = () => {
  const toast = useRef<Toast>(null);
  const { employee } = useAuth();

  const {
    data: sectionData,
    isLoading: loadingContent,
    error: contentError,
  } = useLandingContent("contact");

  const saveMutation = useSaveLandingContent();

  const [formData, setFormData] = useState<ContactContent>({
    title: "Contacto",
    description: "",
    address: "",
    phone1: "",
    phone2: "",
    email: "",
    hours: "",
    map_lat: 0,
    map_lng: 0,
    social_links: [],
  });

  useEffect(() => {
    if (sectionData?.content) {
      const content = sectionData.content as ContactContent;
      setFormData({
        title: content.title ?? "Contacto",
        description: content.description ?? "",
        address: content.address ?? "",
        phone1: content.phone1 ?? "",
        phone2: content.phone2 ?? "",
        email: content.email ?? "",
        hours: content.hours ?? "",
        map_lat: content.map_lat ?? 0,
        map_lng: content.map_lng ?? 0,
        social_links: content.social_links ?? [],
      });
    }
  }, [sectionData]);

  const handleAddSocial = () => {
    const newItem: SocialLink = {
      id: crypto.randomUUID(),
      icon: DEFAULT_PRIME_ICON,
      label: "",
      url: "",
      color: "",
      subtitle: "",
    };
    setFormData({ ...formData, social_links: [...(formData.social_links ?? []), newItem] });
  };

  const handleRemoveSocial = (index: number) => {
    setFormData({
      ...formData,
      social_links: (formData.social_links ?? []).filter((_, i) => i !== index),
    });
  };

  const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
    const updated = (formData.social_links ?? []).map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, social_links: updated });
  };

  const handleMoveSocial = (from: number, to: number) => {
    const list = [...(formData.social_links ?? [])];
    if (to < 0 || to >= list.length) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setFormData({ ...formData, social_links: list });
  };

  const handleSave = async () => {
    if (!employee?.id) return;
    try {
      await saveMutation.mutateAsync({
        sectionType: "contact",
        content: formData,
        employeeId: employee.id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: "Información de contacto actualizada",
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
              placeholder="Contacto"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripción</label>
            <InputTextarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full"
              rows={2}
              placeholder="Estamos aquí para ayudarte..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-gray-800">Datos de contacto</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Horario de atención
            </label>
            <InputText
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              className="w-full"
              placeholder="Todos los días de 7:00 AM a 9:00 PM"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Redes sociales</h3>
        <p className="mb-4 text-xs text-gray-500">
          Se muestran en el panel de contacto, debajo de los teléfonos y el email. Si eliges un
          color de marca, la fila usa ese color en fondo, icono y texto.
        </p>

        <Repeater
          items={formData.social_links ?? []}
          onAdd={handleAddSocial}
          onRemove={handleRemoveSocial}
          onMove={handleMoveSocial}
          addLabel="Agregar red social"
          emptyLabel="No hay redes sociales. Agrega la primera."
          compact
          renderItem={(item, index) => (
            <div className="space-y-2 py-1">
              <div className="flex items-center gap-2">
                <div className="w-44 shrink-0">
                  <IconPicker
                    value={item.icon}
                    onChange={(value) => handleSocialChange(index, "icon", value)}
                  />
                </div>
                <InputText
                  value={item.label}
                  onChange={(e) => handleSocialChange(index, "label", e.target.value)}
                  className="min-w-0 flex-2"
                  placeholder="Nombre"
                />
                <InputText
                  value={item.url}
                  onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                  className="min-w-0 flex-3"
                  placeholder="https://..."
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={item.color || "#E1306C"}
                  onChange={(e) => handleSocialChange(index, "color", e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-gray-300"
                  aria-label="Color de marca"
                />
                <InputText
                  value={item.color ?? ""}
                  onChange={(e) => handleSocialChange(index, "color", e.target.value)}
                  className="w-28 shrink-0"
                  placeholder="#E1306C"
                />
                {item.color && (
                  <Button
                    icon="pi pi-times"
                    rounded
                    text
                    size="small"
                    className="cursor-pointer"
                    onClick={() => handleSocialChange(index, "color", "")}
                    tooltip="Quitar color"
                    tooltipOptions={{ position: "top" }}
                  />
                )}
                <InputText
                  value={item.subtitle ?? ""}
                  onChange={(e) => handleSocialChange(index, "subtitle", e.target.value)}
                  className="min-w-0 flex-1"
                  placeholder="Subtítulo (opcional)"
                />
              </div>
            </div>
          )}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Ubicación en el mapa</h3>
        <p className="mb-4 text-xs text-gray-500">
          Coordenadas del hotel (latitud y longitud en formato decimal)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Latitud</label>
            <InputNumber
              value={formData.map_lat}
              onValueChange={(e) => setFormData({ ...formData, map_lat: e.value ?? 0 })}
              className="w-full"
              mode="decimal"
              minFractionDigits={6}
              maxFractionDigits={15}
              placeholder="4.820884"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Longitud</label>
            <InputNumber
              value={formData.map_lng}
              onValueChange={(e) => setFormData({ ...formData, map_lng: e.value ?? 0 })}
              className="w-full"
              mode="decimal"
              minFractionDigits={6}
              maxFractionDigits={15}
              placeholder="-73.169656"
            />
          </div>
        </div>
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
