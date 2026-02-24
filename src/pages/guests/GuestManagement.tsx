import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dropdown } from "primereact/dropdown";
import { useForm, Controller } from "react-hook-form";
import { useGuests } from "@/hooks/useGuests";
import { useColombiaGeography } from "@/hooks/useColombiaGeography";
import { DocsTypesConst } from "@/util/const/types-docs.const";
import PageHeader from "@/components/ui/PageHeader";
import type { Guest } from "@/types";

interface GuestManagementProps {
  userRole: string | null;
}

const GuestManagement: React.FC<GuestManagementProps> = ({ userRole }) => {
  const [showModal, setShowModal] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const { guestsQuery, upsertGuest } = useGuests();
  const { colombiaData } = useColombiaGeography();
  const { register, handleSubmit, reset, setValue, watch, control, formState } = useForm({
    mode: "onChange",
  });

  // Derivar opciones de ciudad basado en departamento seleccionado
  const cityOptions = selectedDepartment
    ? colombiaData?.find((d: any) => d.departamento === selectedDepartment)?.ciudades || []
    : [];

  // Resetear departamento cuando se cierra el modal
  useEffect(() => {
    if (!showModal) {
      setSelectedDepartment(null);
      setEditingGuest(null);
    }
  }, [showModal]);

  if (guestsQuery.isLoading)
    return (
      <div className="flex justify-center p-12">
        <ProgressSpinner />
      </div>
    );

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);

    // Encontrar departamento basado en la ciudad del huésped
    let departmentValue = "";
    if (guest.city && colombiaData) {
      const dept = colombiaData.find((d: any) => d.ciudades.includes(guest.city));
      if (dept) {
        departmentValue = dept.departamento;
        setSelectedDepartment(dept.departamento);
      }
    }

    reset({
      doc_type: guest.doc_type,
      doc_number: guest.doc_number,
      first_name: guest.first_name,
      last_name: guest.last_name,
      phone: guest.phone,
      email: guest.email,
      department: departmentValue,
      city: guest.city,
      address: guest.address,
    });
    setShowModal(true);
  };

  const handleNewGuest = () => {
    setEditingGuest(null);
    setSelectedDepartment(null);
    reset({});
    setShowModal(true);
  };

  const onSubmit = async (data: any) => {
    try {
      await upsertGuest.mutateAsync(data);
      setShowModal(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const header = (
    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
      <h3 className="m-0 text-xl font-bold text-emerald-700">Listado de Huéspedes</h3>
      <span className="p-input-icon-left w-full sm:w-auto">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e: any) => setGlobalFilter(e.target.value)}
          placeholder="Buscar documento o nombre..."
          className="w-full sm:w-72"
        />
      </span>
    </div>
  );

  const headerRightContent = (
    <Button
      unstyled
      label="Nuevo Huésped"
      icon="pi pi-plus"
      className="w-full border-emerald-600 bg-emerald-600 px-4 py-2 text-white sm:w-auto"
      onClick={handleNewGuest}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gestión de Huéspedes"
        icon="pi-users"
        color="emerald"
        variant="simple"
        rightContent={headerRightContent}
      />

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <DataTable
          value={guestsQuery.data || []}
          header={header}
          globalFilter={globalFilter}
          scrollable
          scrollHeight="70vh"
          className="text-sm"
          rowHover
          stripedRows
          breakpoint="640px"
          emptyMessage="No hay huéspedes registrados."
        >
          <Column field="doc_type" header="Tipo" sortable style={{ width: "80px" }} />
          <Column field="doc_number" header="Documento" sortable />
          <Column field="first_name" header="Nombres" sortable />
          <Column
            field="last_name"
            header="Apellidos"
            sortable
            className="hidden sm:table-cell"
            headerClassName="hidden sm:table-cell"
          />
          <Column
            field="phone"
            header="Teléfono"
            className="hidden sm:table-cell"
            headerClassName="hidden sm:table-cell"
          />
          <Column
            field="email"
            header="Email"
            className="hidden md:table-cell"
            headerClassName="hidden md:table-cell"
          />
          <Column
            field="city"
            header="Municipio"
            className="hidden md:table-cell"
            headerClassName="hidden md:table-cell"
          />
          <Column
            header="Acciones"
            body={(rowData: Guest) => (
              <div className="flex justify-center gap-2">
                <Button
                  unstyled
                  icon="pi pi-pencil"
                  className="p-button-text p-button-sm p-button-warning"
                  onClick={() => handleEdit(rowData)}
                  tooltip="Editar"
                  tooltipOptions={{ position: "top" }}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingGuest ? "Editar Huésped" : "Registrar Huésped"}
        visible={showModal}
        onHide={() => setShowModal(false)}
        className="w-full max-w-2xl"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {/* Tipo de Documento */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">
              Tipo Documento <span className="text-amber-500">*</span>
            </label>
            <Controller
              name="doc_type"
              control={control}
              rules={{ required: "Campo requerido" }}
              render={({ field, fieldState }) => (
                <Dropdown
                  {...field}
                  options={DocsTypesConst}
                  placeholder="Seleccione"
                  className={`w-full ${fieldState.invalid ? "p-invalid" : ""}`}
                />
              )}
            />
            {formState.errors.doc_type && (
              <small className="text-xs text-red-500">
                {formState.errors.doc_type.message as string}
              </small>
            )}
          </div>

          {/* Número de Documento */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">
              No. Documento <span className="text-amber-500">*</span>
            </label>
            <InputText
              {...register("doc_number", { required: "Campo requerido" })}
              disabled={!!editingGuest}
              className={`w-full ${formState.errors.doc_number ? "p-invalid" : ""}`}
            />
            {formState.errors.doc_number && (
              <small className="text-xs text-red-500">
                {formState.errors.doc_number.message as string}
              </small>
            )}
          </div>

          {/* Nombres */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">
              Nombres <span className="text-amber-500">*</span>
            </label>
            <InputText
              {...register("first_name", { required: "Campo requerido" })}
              className={`w-full ${formState.errors.first_name ? "p-invalid" : ""}`}
            />
            {formState.errors.first_name && (
              <small className="text-xs text-red-500">
                {formState.errors.first_name.message as string}
              </small>
            )}
          </div>

          {/* Apellidos */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">
              Apellidos <span className="text-amber-500">*</span>
            </label>
            <InputText
              {...register("last_name", { required: "Campo requerido" })}
              className={`w-full ${formState.errors.last_name ? "p-invalid" : ""}`}
            />
            {formState.errors.last_name && (
              <small className="text-xs text-red-500">
                {formState.errors.last_name.message as string}
              </small>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">
              Teléfono <span className="text-amber-500">*</span>
            </label>
            <InputText
              {...register("phone", { required: "Campo requerido" })}
              className={`w-full ${formState.errors.phone ? "p-invalid" : ""}`}
            />
            {formState.errors.phone && (
              <small className="text-xs text-red-500">
                {formState.errors.phone.message as string}
              </small>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Email</label>
            <InputText {...register("email")} className="w-full" />
          </div>

          {/* Departamento */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Departamento</label>
            <Controller
              name="department"
              control={control}
              render={({ field, fieldState }) => (
                <Dropdown
                  {...field}
                  options={colombiaData?.map((d: any) => d.departamento) || []}
                  placeholder="Seleccione"
                  className={`w-full ${fieldState.invalid ? "p-invalid" : ""}`}
                  filter
                  onChange={(e) => {
                    field.onChange(e.value);
                    setSelectedDepartment(e.value);
                    setValue("city", "");
                  }}
                />
              )}
            />
          </div>

          {/* Ciudad/Municipio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">
              Municipio/Ciudad <span className="text-amber-500">*</span>
            </label>
            <Controller
              name="city"
              control={control}
              rules={{ required: "Campo requerido" }}
              render={({ field, fieldState }) => (
                <Dropdown
                  {...field}
                  options={cityOptions}
                  placeholder={selectedDepartment ? "Seleccione" : "Primero elija departamento"}
                  className={`w-full ${fieldState.invalid ? "p-invalid" : ""}`}
                  filter
                  disabled={!selectedDepartment}
                />
              )}
            />
            {formState.errors.city && (
              <small className="text-xs text-red-500">
                {formState.errors.city.message as string}
              </small>
            )}
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-semibold">Dirección</label>
            <InputText {...register("address")} className="w-full" />
          </div>

          {/* Botón Guardar */}
          <div className="mt-4 flex flex-col gap-1 md:col-span-2">
            <Button
              unstyled
              type="submit"
              label={editingGuest ? "Actualizar Huésped" : "Guardar Huésped"}
              className="w-full border-emerald-600 bg-emerald-600 py-3 text-base font-semibold text-white"
              loading={upsertGuest.isPending}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default GuestManagement;
