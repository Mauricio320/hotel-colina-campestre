/**
 * Hotel Editor Component (Placeholder)
 *
 * Admin form for editing Hotel section.
 */

import { HotelContent, ServiceItem } from "@/types/landingPage";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useState, useEffect } from "react";

// Servicios por defecto del hotel (usando iconos PrimeIcons)
const defaultServices: ServiceItem[] = [
  { id: "1", icon: "pi-clock", title: "Recepción 24 horas" },
  { id: "2", icon: "pi-home", title: "Habitaciones equipadas" },
  { id: "3", icon: "pi-desktop", title: "TV Cable" },
  { id: "4", icon: "pi-cog", title: "Aire acondicionado" },
  { id: "5", icon: "pi-heart", title: "Bar" },
  { id: "6", icon: "pi-briefcase", title: "Guarda equipaje" },
  { id: "7", icon: "pi-star", title: "Zona de juegos" },
  { id: "8", icon: "pi-globe", title: "Zonas de aire libre" },
  { id: "9", icon: "pi-car", title: "Parqueadero gratuito" },
  { id: "10", icon: "pi-wifi", title: "Wifi" },
];

export const HotelEditor = () => {
  const [formData, setFormData] = useState<Partial<HotelContent>>({
    services: {
      title: "Servicios Exclusivos",
      items: defaultServices,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Cargar desde localStorage para persistencia de sesión
    const saved = localStorage.getItem("hotel_editor_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch {
        // Si hay error, usar defaults
      }
    }
    setIsLoading(false);
  }, []);

  // Guardar en localStorage cuando cambie el formData
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem("hotel_editor_data", JSON.stringify(formData));
    }
  }, [formData]);

  const handleSave = () => {
    setIsSaving(true);
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false);
      alert("Cambios guardados exitosamente");
    }, 500);
  };

  const addService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      icon: "pi-star",
      title: "Nuevo servicio",
    };
    setFormData({
      ...formData,
      services: {
        title: formData.services?.title || "Servicios Exclusivos",
        items: [...(formData.services?.items || []), newService],
      },
    });
  };

  const updateService = (id: string, field: keyof ServiceItem, value: string) => {
    setFormData({
      ...formData,
      services: {
        title: formData.services?.title || "Servicios Exclusivos",
        items:
          formData.services?.items.map((s) => (s.id === id ? { ...s, [field]: value } : s)) || [],
      },
    });
  };

  const removeService = (id: string) => {
    setFormData({
      ...formData,
      services: {
        title: formData.services?.title || "Servicios Exclusivos",
        items: formData.services?.items.filter((s) => s.id !== id) || [],
      },
    });
  };

  if (isLoading) {
    return <ProgressSpinner />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Editar Sección Hotel</h2>

      {/* Hero Section */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Hero</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm">Título</label>
            <InputText
              value={formData.hero?.title || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, title: e.target.value } as HotelContent["hero"],
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">Subtítulo</label>
            <InputTextarea
              value={formData.hero?.subtitle || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, subtitle: e.target.value } as HotelContent["hero"],
                })
              }
              className="w-full"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Acerca de</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm">Título</label>
            <InputText
              value={formData.about?.title || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  about: { ...formData.about, title: e.target.value } as HotelContent["about"],
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">Descripción</label>
            <InputTextarea
              value={formData.about?.description_1 || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  about: {
                    ...formData.about,
                    description_1: e.target.value,
                  } as HotelContent["about"],
                })
              }
              className="w-full"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Servicios</h3>
          <Button
            label="Agregar Servicio"
            icon="pi pi-plus"
            className="bg-[#006948] p-2 text-sm text-white"
            onClick={addService}
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm">Título de la sección</label>
          <InputText
            value={formData.services?.title || "Servicios Exclusivos"}
            onChange={(e) =>
              setFormData({
                ...formData,
                services: {
                  ...formData.services,
                  title: e.target.value,
                  items: formData.services?.items || [],
                },
              })
            }
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          {formData.services?.items.map((service, index) => (
            <div key={service.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
              <div className="flex flex-1 gap-3">
                <div className="w-40">
                  <label className="mb-1 block text-xs text-gray-500">Icono PrimeIcons</label>
                  <InputText
                    value={service.icon}
                    onChange={(e) => updateService(service.id, "icon", e.target.value)}
                    className="w-full text-sm"
                    placeholder="Ej: pi-wifi"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500">Nombre del servicio</label>
                  <InputText
                    value={service.title}
                    onChange={(e) => updateService(service.id, "title", e.target.value)}
                    className="w-full text-sm"
                    placeholder="Ej: Wifi gratuito"
                  />
                </div>
              </div>
              <Button
                icon="pi pi-trash"
                className="p-button-danger p-button-text"
                onClick={() => removeService(service.id)}
                tooltip="Eliminar"
              />
            </div>
          ))}
        </div>

        {formData.services?.items.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            No hay servicios. Haz clic en "Agregar Servicio" para comenzar.
          </p>
        )}
      </div>

      <Button
        label="Guardar Cambios"
        icon="pi pi-save"
        className="bg-[#006948] text-white"
        onClick={handleSave}
        loading={isSaving}
      />
    </div>
  );
};
