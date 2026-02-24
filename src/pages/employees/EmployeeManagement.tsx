import { BlockUIProvider, useBlockUI } from "@/context/BlockUIContext";
import { useEmployees } from "@/hooks/useEmployees";
import { useRoles } from "@/hooks/useRoles";
import PageHeader from "@/components/ui/PageHeader";
import { Employee, Role } from "@/types";
import { DocsTypesConst } from "@/util/const/types-docs.const";
import { supabase } from "@/config/supabase";
import { createClient } from "@supabase/supabase-js";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

interface EmployeeManagementProps {
  userRole: string | null;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ userRole }) => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employeesQuery, createEmployee } = useEmployees();
  const { data: roles = [] } = useRoles();
  const { register, handleSubmit, control, reset, formState } = useForm({
    mode: "onChange",
  });
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedEmployeeForReset, setSelectedEmployeeForReset] = useState<Employee | null>(null);

  if (userRole !== Role.Admin) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 font-bold text-red-700">
        Acceso restringido solo para administradores.
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    // Si estamos editando
    if (editingEmployee) {
      showBlockUI("Actualizando información del Personal...");
      try {
        const { error } = await supabase
          .from("employees")
          .update({
            doc_type: data.doc_type,
            doc_number: data.doc_number,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            city: data.city,
            address: data.address,
            role_id: data.role_id,
          })
          .eq("id", editingEmployee.id);

        if (error) throw error;

        // Invalidar la caché para refrescar la tabla
        queryClient.invalidateQueries({ queryKey: ["employees"] });

        setShowModal(false);
        reset();
        setEditingEmployee(null);
        showBlockUI("Personal actualizado exitosamente.");
      } catch (error: any) {
        alert("Error: " + (error.message || "No se pudo actualizar el Personal"));
      } finally {
        hideBlockUI();
      }
      return;
    }

    // Crear nuevo Personal
    showBlockUI("Procesando registro del Personal en el sistema y en autenticación.");
    try {
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            doc_type: data.doc_type,
            doc_number: data.doc_number,
          },
        },
      });

      if (authError) throw authError;
      delete data.password;

      await createEmployee.mutateAsync({
        ...data,
        id: authData.user?.id,
        auth_id: authData.user?.id,
      });

      setShowModal(false);
      reset();
      showBlockUI("Personal registrado exitosamente en el sistema y en autenticación.");
    } catch (error: any) {
      let errorMessage = "Ocurrió un error inesperado.";

      if (error.status === 422 || error.code === "user_already_exists") {
        errorMessage = "El correo electrónico ya se encuentra registrado en el sistema.";
      } else if (error.code === "23505") {
        errorMessage = "El número de documento ya está asignado a otro Personal.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert("Error: " + errorMessage);
    } finally {
      hideBlockUI();
    }
  };

  if (employeesQuery.isLoading) return <ProgressSpinner />;

  const handleNewEmployee = () => {
    setEditingEmployee(null);
    reset({});
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    reset({
      doc_type: employee.doc_type,
      doc_number: employee.doc_number,
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone,
      city: employee.city,
      address: employee.address,
      email: employee.email,
      role_id: employee.role_id,
    });
    setShowModal(true);
  };

  const handleOpenResetPassword = (employee: Employee) => {
    setSelectedEmployeeForReset(employee);
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!selectedEmployeeForReset?.email) return;

    showBlockUI("Enviando email de recuperación...");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(selectedEmployeeForReset.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      alert(`Se ha enviado un email de recuperación a ${selectedEmployeeForReset.email}`);
      setShowResetPasswordModal(false);
      setSelectedEmployeeForReset(null);
    } catch (error: any) {
      alert("Error: " + (error.message || "No se pudo enviar el email"));
    } finally {
      hideBlockUI();
    }
  };

  const headerRightContent = (
    <Button
      unstyled
      label="Registrar Personal"
      icon="pi pi-user-plus"
      className="w-full bg-emerald-600 px-4 py-2 text-white shadow-md sm:w-auto"
      onClick={handleNewEmployee}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Personal"
        icon="pi-users"
        variant="simple"
        rightContent={headerRightContent}
      />

      <div className="overflow-hidden rounded-3xl border border-emerald-50 bg-white shadow-xl shadow-emerald-100/20">
        <DataTable
          value={employeesQuery.data || []}
          breakpoint="640px"
          className="text-sm"
          scrollable
          scrollHeight="70vh"
          rowHover
          stripedRows
          emptyMessage="No hay personal registrado."
        >
          <Column
            header="Personal"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">
                  {row.first_name} {row.last_name}
                </span>
                <span className="text-[10px] font-medium text-gray-400">{row.email}</span>
              </div>
            )}
            sortable
          />
          <Column
            field="doc_type"
            header="Tipo"
            sortable
            className="hidden sm:table-cell"
            headerClassName="hidden sm:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
          />
          <Column
            field="doc_number"
            header="Documento"
            sortable
            className="hidden sm:table-cell"
            headerClassName="hidden sm:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
          />
          <Column
            field="role.name"
            header="Rol"
            sortable
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600 uppercase">
                {row.role?.name}
              </span>
            )}
          />
          <Column
            field="phone"
            header="Teléfono"
            className="hidden md:table-cell"
            headerClassName="hidden md:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
          />
          <Column
            field="city"
            header="Ciudad"
            sortable
            className="hidden md:table-cell"
            headerClassName="hidden md:table-cell bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
          />
          <Column
            header="Acciones"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4 text-center"
            body={(rowData: Employee) => (
              <div className="flex justify-center gap-1">
                <Button
                  unstyled
                  icon="pi pi-pencil"
                  className="p-button-text p-button-warning p-button-sm"
                  onClick={() => handleEdit(rowData)}
                  tooltip="Editar"
                  tooltipOptions={{ position: "top" }}
                />
                <Button
                  unstyled
                  icon="pi pi-key"
                  className="p-button-text p-button-info p-button-sm"
                  tooltip="Reset Password"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => handleOpenResetPassword(rowData)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <i className={`pi ${editingEmployee ? "pi-user-edit" : "pi-user-plus"} text-xl`}></i>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-gray-800">
                {editingEmployee ? "Editar Personal" : "Agregar Personal"}
              </h3>
              <p className="text-xs font-medium text-gray-400">
                {editingEmployee
                  ? "Modifique la información del colaborador"
                  : "Complete la información para registrar un nuevo colaborador"}
              </p>
            </div>
          </div>
        }
        visible={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingEmployee(null);
          reset({});
        }}
        className="w-full max-w-2xl"
        contentClassName="p-0"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-b-2xl bg-white p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
            <div className="flex flex-col gap-1 md:col-span-4">
              <label className="text-xs font-bold text-gray-700">
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
                    className={`w-full border-gray-100 bg-gray-50/50 ${
                      fieldState.invalid ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              {formState.errors.doc_type && (
                <small className="p-error text-xs">
                  {formState.errors.doc_type.message as string}
                </small>
              )}
            </div>
            <div className="flex flex-col gap-1 md:col-span-8">
              <label className="text-xs font-bold text-gray-700">
                Número de Documento <span className="text-amber-500">*</span>
              </label>
              <InputText
                {...register("doc_number", {
                  required: "Campo requerido",
                  minLength: {
                    value: 4,
                    message: "El número de documento debe tener al menos 4 caracteres.",
                  },
                })}
                disabled={!!editingEmployee}
                className={`w-full border-gray-100 bg-gray-50/50 ${
                  formState.errors.doc_number ? "p-invalid" : ""
                }`}
                placeholder="Ej: 10203040"
                autoComplete="off"
              />
              {formState.errors.doc_number && (
                <small className="p-error text-xs">
                  {formState.errors.doc_number.message as string}
                </small>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-6">
              <label className="text-xs font-bold text-gray-700">
                Nombres <span className="text-amber-500">*</span>
              </label>
              <InputText
                {...register("first_name", { required: "Campo requerido" })}
                className={`w-full border-gray-100 bg-gray-50/50 ${
                  formState.errors.first_name ? "p-invalid" : ""
                }`}
              />
              {formState.errors.first_name && (
                <small className="p-error text-xs">
                  {formState.errors.first_name.message as string}
                </small>
              )}
            </div>
            <div className="flex flex-col gap-1 md:col-span-6">
              <label className="text-xs font-bold text-gray-700">
                Apellidos <span className="text-amber-500">*</span>
              </label>
              <InputText
                {...register("last_name", { required: "Campo requerido" })}
                className={`w-full border-gray-100 bg-gray-50/50 ${
                  formState.errors.last_name ? "p-invalid" : ""
                }`}
              />
              {formState.errors.last_name && (
                <small className="p-error text-xs">
                  {formState.errors.last_name.message as string}
                </small>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-12">
              <label className="text-xs font-bold text-gray-700">
                Rol en el Sistema <span className="text-amber-500">*</span>
              </label>
              <Controller
                name="role_id"
                control={control}
                rules={{ required: "Campo requerido" }}
                render={({ field, fieldState }) => (
                  <Dropdown
                    {...field}
                    options={roles}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Seleccione el cargo"
                    className={`w-full border-gray-100 bg-gray-50/50 ${
                      fieldState.invalid ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              {formState.errors.role_id && (
                <small className="p-error text-xs">
                  {formState.errors.role_id.message as string}
                </small>
              )}
            </div>

            {!editingEmployee && (
              <div className="flex flex-col gap-1 md:col-span-6">
                <label className="text-xs font-bold text-gray-700">
                  Correo Institucional <span className="text-amber-500">*</span>
                </label>
                <InputText
                  {...register("email", { required: "Campo requerido" })}
                  className={`w-full border-gray-100 bg-gray-50/50 ${
                    formState.errors.email ? "p-invalid" : ""
                  }`}
                  placeholder="Personal@hotel.com"
                />
                {formState.errors.email && (
                  <small className="p-error text-xs">
                    {formState.errors.email.message as string}
                  </small>
                )}
              </div>
            )}
            <div
              className={
                editingEmployee
                  ? "flex flex-col gap-1 md:col-span-12"
                  : "flex flex-col gap-1 md:col-span-6"
              }
            >
              <label className="text-xs font-bold text-gray-700">
                Teléfono <span className="text-amber-500">*</span>
              </label>
              <InputText
                {...register("phone", { required: "Campo requerido" })}
                className={`w-full border-gray-100 bg-gray-50/50 ${
                  formState.errors.phone ? "p-invalid" : ""
                }`}
                placeholder="300 123 4567"
              />
              {formState.errors.phone && (
                <small className="p-error text-xs">
                  {formState.errors.phone.message as string}
                </small>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-6">
              <label className="text-xs font-bold text-gray-700">Ciudad</label>
              <InputText
                {...register("city")}
                className="w-full border-gray-100 bg-gray-50/50"
                placeholder="Ciudad de residencia"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-6">
              <label className="text-xs font-bold text-gray-700">Dirección</label>
              <InputText
                {...register("address")}
                className="w-full border-gray-100 bg-gray-50/50"
                placeholder="Dirección de residencia"
              />
            </div>

            {!editingEmployee && (
              <div className="flex flex-col gap-1 md:col-span-12">
                <label className="text-xs font-bold text-gray-700">
                  Contraseña de Acceso <span className="text-amber-500">*</span>
                </label>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Campo requerido",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  }}
                  render={({ field, fieldState }) => (
                    <InputText
                      {...field}
                      type="text"
                      className={`w-full border-gray-100 bg-gray-50/50 font-mono ${
                        fieldState.invalid ? "p-invalid" : ""
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                  )}
                />
                {formState.errors.password && (
                  <small className="p-error text-xs">
                    {formState.errors.password.message as string}
                  </small>
                )}
              </div>
            )}

            <div className="mt-4 border-t border-gray-50 pt-4 md:col-span-12">
              <Button
                unstyled
                type="submit"
                label={editingEmployee ? "Actualizar Colaborador" : "Registrar Colaborador"}
                icon="pi pi-check"
                className="w-full rounded-2xl border-none bg-emerald-600 p-4 font-black text-white shadow-lg transition-all hover:bg-emerald-700"
                loading={createEmployee.isPending}
              />
            </div>
          </div>
        </form>
      </Dialog>

      {/* Modal de Reset Password */}
      <Dialog
        header="Restablecer Contraseña"
        visible={showResetPasswordModal}
        onHide={() => {
          setShowResetPasswordModal(false);
          setSelectedEmployeeForReset(null);
        }}
        className="w-full max-w-md"
      >
        <div className="p-4">
          {selectedEmployeeForReset && (
            <>
              <p className="mb-4 text-gray-600">
                ¿Desea enviar un email de recuperación de contraseña a:
              </p>
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <p className="font-bold text-gray-800">
                  {selectedEmployeeForReset.first_name} {selectedEmployeeForReset.last_name}
                </p>
                <p className="text-sm text-gray-500">{selectedEmployeeForReset.email}</p>
              </div>
              <p className="mb-4 text-xs text-gray-400">
                El Personal recibirá un email con un enlace para establecer una nueva contraseña.
              </p>
              <div className="flex gap-2">
                <Button
                  unstyled
                  label="Cancelar"
                  icon="pi pi-times"
                  className="p-button-secondary flex-1"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedEmployeeForReset(null);
                  }}
                />
                <Button
                  unstyled
                  label="Enviar Email"
                  icon="pi pi-send"
                  className="flex-1 bg-emerald-600 text-white"
                  onClick={handleResetPassword}
                />
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
