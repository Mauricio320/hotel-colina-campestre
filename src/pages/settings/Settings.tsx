import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import PageHeader from "@/components/ui/PageHeader";
import { Role } from "@/types";
import { useSettings } from "@/hooks/useSettings";

interface SettingsProps {
  userRole: string | null;
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const { settings, isLoading, updateSetting } = useSettings();
  const { handleSubmit, setValue, watch, reset } = useForm();

  useEffect(() => {
    if (settings) {
      reset({ iva: settings.iva, extra_mattress: settings.mat });
    }
  }, [settings, reset]);

  if (userRole !== Role.Admin) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        Acceso denegado. Solo administradores.
      </div>
    );
  }

  const onSubmit = async (data: { iva: number; extra_mattress: number }) => {
    try {
      await updateSetting.mutateAsync({ key: "iva_percentage", value: data.iva });
      await updateSetting.mutateAsync({ key: "extra_mattress_price", value: data.extra_mattress });
      alert("Configuración actualizada con éxito");
    } catch (e) {
      alert("Error al guardar");
    }
  };

  if (isLoading) return <ProgressSpinner />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Parámetros Globales" icon="pi-cog" color="gray" variant="simple" />

      <Card className="max-w-xl border-t-4 border-emerald-600 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="iva" className="font-bold text-gray-700">
              Porcentaje IVA (%)
            </label>
            <InputNumber
              id="iva"
              value={watch("iva")}
              onValueChange={(e) => setValue("iva", e.value || 0)}
              suffix="%"
              showButtons
              min={0}
              max={100}
              minFractionDigits={0}
              maxFractionDigits={0}
            />
            <small className="text-gray-500">
              Este valor se sumará al total si el huésped solicita Factura Electrónica.
            </small>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="extra_mattress" className="font-bold text-gray-700">
              Costo Colchoneta Adicional (COP)
            </label>
            <InputNumber
              id="extra_mattress"
              value={watch("extra_mattress")}
              onValueChange={(e) => setValue("extra_mattress", e.value || 0)}
              mode="currency"
              currency="COP"
              locale="es-CO"
              showButtons
              minFractionDigits={0}
              maxFractionDigits={0}
            />
            <small className="text-gray-500">
              Costo fijo por noche al agregar una colchoneta extra a la habitación.
            </small>
          </div>

          <Button
            unstyled
            type="submit"
            label="Actualizar Parámetros"
            icon="pi pi-save"
            className="mt-2 bg-emerald-600 p-3 font-bold text-white"
          />
        </form>
      </Card>
    </div>
  );
};

export default Settings;
