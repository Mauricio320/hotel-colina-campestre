import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import PageHeader from "@/components/ui/PageHeader";
import { PaymentMethod, Role } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";

interface SettingsProps {
  userRole: string | null;
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const { settings, isLoading, updateSetting } = useSettings();
  const { fetchAll, create, update, remove } = usePaymentMethods();
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const {
    handleSubmit: handleSettingsSubmit,
    setValue: setSettingsValue,
    watch: watchSettings,
  } = useForm({
    defaultValues: { iva: 0, extra_mattress: 0 },
  });

  const {
    control: paymentControl,
    handleSubmit: handlePaymentSubmit,
    reset: resetPaymentForm,
    formState: { errors: paymentErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (settings) {
      setSettingsValue("iva", settings.iva);
      setSettingsValue("extra_mattress", settings.mat);
    }
  }, [settings]);

  if (userRole !== Role.Admin) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        Acceso denegado. Solo administradores.
      </div>
    );
  }

  const onSettingsSubmit = async (data: { iva: number; extra_mattress: number }) => {
    try {
      await updateSetting.mutateAsync({ key: "iva_percentage", value: data.iva });
      await updateSetting.mutateAsync({ key: "extra_mattress_price", value: data.extra_mattress });
      alert("Configuración actualizada con éxito");
    } catch (e) {
      alert("Error al guardar");
    }
  };

  const handleNewMethod = () => {
    setEditingMethod(null);
    resetPaymentForm({ name: "" });
    setShowModal(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    resetPaymentForm({ name: method.name });
    setShowModal(true);
  };

  const confirmDeleteMethod = (method: PaymentMethod) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar el método de pago "${method.name}"?`,
      header: "Confirmar eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "Cancelar",
      acceptIcon: "pi pi-check",
      rejectIcon: "pi pi-times",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await remove.mutateAsync(method.id);
        } catch (error: any) {
          alert("Error: " + (error.message || "No se pudo eliminar el método de pago"));
        }
      },
    });
  };

  const onPaymentSubmit = async (data: { name: string }) => {
    try {
      if (editingMethod) {
        await update.mutateAsync({ id: editingMethod.id, name: data.name });
      } else {
        await create.mutateAsync(data.name);
      }
      setShowModal(false);
      resetPaymentForm();
      setEditingMethod(null);
    } catch (error: any) {
      alert("Error: " + (error.message || "No se pudo guardar el método de pago"));
    }
  };

  if (isLoading || fetchAll.isLoading) return <ProgressSpinner />;

  const actionsTemplate = (rowData: PaymentMethod) => (
    <div className="flex justify-center gap-1">
      <Button
        unstyled
        icon="pi pi-pencil"
        className="p-button-text p-button-warning p-button-sm"
        onClick={() => handleEditMethod(rowData)}
        tooltip="Editar"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        unstyled
        icon="pi pi-trash"
        className="p-button-text p-button-danger p-button-sm"
        onClick={() => confirmDeleteMethod(rowData)}
        tooltip="Eliminar"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );

  const paymentMethodsHeader = (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-gray-500">Listado de métodos disponibles</span>
      <Button
        unstyled
        label="Nuevo Método"
        icon="pi pi-plus"
        className="bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
        onClick={handleNewMethod}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <ConfirmDialog />
      <PageHeader title="Configuración" icon="pi-cog" color="gray" variant="simple" />

      <TabView className="settings-tabview">
        <TabPanel header="Métodos de Pago" leftIcon="pi pi-credit-card mr-2">
          <Card className="border-t-4 border-emerald-600 shadow-sm">
            <DataTable
              value={fetchAll.data || []}
              header={paymentMethodsHeader}
              breakpoint="640px"
              className="text-sm"
              scrollable
              scrollHeight="50vh"
              rowHover
              stripedRows
              emptyMessage="No hay métodos de pago registrados."
            >
              <Column
                field="name"
                header="Nombre"
                sortable
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
              />
              <Column
                header="Acciones"
                body={actionsTemplate}
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4 text-center"
                className="w-32"
              />
            </DataTable>
          </Card>
        </TabPanel>

        <TabPanel header="Parámetros Globales" leftIcon="pi pi-cog mr-2">
          <Card className="max-w-xl border-t-4 border-emerald-600 shadow-sm">
            <form onSubmit={handleSettingsSubmit(onSettingsSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="iva" className="font-bold text-gray-700">
                  Porcentaje IVA (%)
                </label>
                <InputNumber
                  id="iva"
                  value={watchSettings("iva")}
                  onValueChange={(e) => setSettingsValue("iva", e.value || 0)}
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
                  value={watchSettings("extra_mattress")}
                  onValueChange={(e) => setSettingsValue("extra_mattress", e.value || 0)}
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
                loading={updateSetting.isPending}
              />
            </form>
          </Card>
        </TabPanel>
      </TabView>

      <Dialog
        header={
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <i className={`pi ${editingMethod ? "pi-pencil" : "pi-plus"} text-xl`}></i>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-gray-800">
                {editingMethod ? "Editar Método de Pago" : "Nuevo Método de Pago"}
              </h3>
              <p className="text-xs font-medium text-gray-400">
                {editingMethod
                  ? "Modifique el nombre del método de pago"
                  : "Ingrese el nombre del nuevo método de pago"}
              </p>
            </div>
          </div>
        }
        visible={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingMethod(null);
          resetPaymentForm();
        }}
        className="w-full max-w-md"
        contentClassName="p-0"
      >
        <form onSubmit={handlePaymentSubmit(onPaymentSubmit)} className="rounded-b-2xl bg-white p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">
                Nombre del Método <span className="text-amber-500">*</span>
              </label>
              <Controller
                name="name"
                control={paymentControl}
                rules={{
                  required: "Campo requerido",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                }}
                render={({ field, fieldState }) => (
                  <InputText
                    {...field}
                    className={`w-full border-gray-100 bg-gray-50/50 ${fieldState.invalid ? "p-invalid" : ""}`}
                    placeholder="Ej: Efectivo, Tarjeta, Transferencia"
                    autoComplete="off"
                  />
                )}
              />
              {paymentErrors.name && (
                <small className="p-error text-xs">{paymentErrors.name.message as string}</small>
              )}
            </div>

            <div className="border-t border-gray-50 pt-4">
              <Button
                unstyled
                type="submit"
                label={editingMethod ? "Actualizar" : "Crear"}
                icon="pi pi-check"
                className="w-full rounded-2xl border-none bg-emerald-600 p-4 font-black text-white shadow-lg transition-all hover:bg-emerald-700"
                loading={create.isPending || update.isPending}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Settings;
