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
import { ContactContent } from "@/types/landingPage";

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
    whatsapp: "",
    map_lat: 0,
    map_lng: 0,
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
        whatsapp: content.whatsapp ?? "",
        map_lat: content.map_lat ?? 0,
        map_lng: content.map_lng ?? 0,
      });
    }
  }, [sectionData]);

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

      <PageHeader
        variant="simple"
        title="Contacto"
        subtitle="Información de contacto, mapa y canales"
        icon="pi-envelope"
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Dirección</label>
            <InputText
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full"
              placeholder="Vía Paipa - Tunja, Kilómetro 15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Teléfono principal
            </label>
            <InputText
              value={formData.phone1}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
              className="w-full"
              placeholder="+57 312 456 7890"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Teléfono secundario
            </label>
            <InputText
              value={formData.phone2}
              onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
              className="w-full"
              placeholder="(608) 740 0000"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <InputText
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
              placeholder="recepcion@hotelcolinacampestre.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              WhatsApp (con código país)
            </label>
            <InputText
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full"
              placeholder="+573124567890"
            />
          </div>

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
