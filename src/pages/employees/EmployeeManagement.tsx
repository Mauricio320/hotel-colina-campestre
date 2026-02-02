import { BlockUIProvider, useBlockUI } from "@/context/BlockUIContext";
import { useEmployees } from "@/hooks/useEmployees";
import { useRoles } from "@/hooks/useRoles";
import { Role } from "@/types";
import { DocsTypesConst } from "@/util/const/types-docs.const";
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

interface EmployeeManagementProps {
  userRole: string | null;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  userRole,
}) => {
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employeesQuery, createEmployee } = useEmployees();
  const { data: roles = [] } = useRoles();
  const { register, handleSubmit, control, reset, formState } = useForm();
  const [showModal, setShowModal] = useState(false);

  if (userRole !== Role.Admin) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200 font-bold">
        Acceso restringido solo para administradores.
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    showBlockUI(
      "Procesando registro del empleado en el sistema y en autenticación.",
    );
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
        },
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp(
        {
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
        },
      );

      if (authError) throw authError;
      delete data.password;

      await createEmployee.mutateAsync({
        ...data,
        id: authData.user?.id,
        auth_id: authData.user?.id,
      });

      setShowModal(false);
      reset();
      showBlockUI(
        "Empleado registrado exitosamente en el sistema y en autenticación.",
      );
    } catch (error: any) {
      let errorMessage = "Ocurrió un error inesperado.";

      if (error.status === 422 || error.code === "user_already_exists") {
        errorMessage =
          "El correo electrónico ya se encuentra registrado en el sistema.";
      } else if (error.code === "23505") {
        errorMessage =
          "El número de documento ya está asignado a otro empleado.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert("Error: " + errorMessage);
    } finally {
      hideBlockUI();
    }
  };

  if (employeesQuery.isLoading) return <ProgressSpinner />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Talento Humano
        </h2>
        <Button
          label="Registrar Empleado"
          icon="pi pi-user-plus"
          className="bg-emerald-600 shadow-md"
          onClick={() => setShowModal(true)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-emerald-50 shadow-xl shadow-emerald-100/20 overflow-hidden">
        <DataTable
          value={employeesQuery.data || []}
          responsiveLayout="stack"
          breakpoint="960px"
          className="text-sm"
          paginator
          rows={10}
          rowHover
          stripedRows
        >
          <Column
            header="Empleado"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">
                  {row.first_name} {row.last_name}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {row.email}
                </span>
              </div>
            )}
            sortable
          />
          <Column
            field="doc_number"
            header="Documento"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
          />
          <Column
            field="role.name"
            header="Rol"
            sortable
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-black text-emerald-600 uppercase text-[10px] bg-emerald-50 px-2 py-1 rounded-lg">
                {row.role?.name}
              </span>
            )}
          />
          <Column
            field="password"
            header="Contraseña"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
            body={(row) => (
              <span className="font-mono text-gray-400">
                {row.password || "********"}
              </span>
            )}
          />
          <Column
            header="Acciones"
            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4 text-center"
            body={() => (
              <div className="flex justify-center gap-1">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-text p-button-warning p-button-sm"
                />
                <Button
                  icon="pi pi-key"
                  className="p-button-text p-button-info p-button-sm"
                  tooltip="Reset Password"
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <i className="pi pi-user-plus text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">
                Nuevo Perfil de Empleado
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Complete la información para registrar un nuevo colaborador
              </p>
            </div>
          </div>
        }
        visible={showModal}
        onHide={() => setShowModal(false)}
        className="w-full max-w-2xl"
        contentClassName="p-0"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-b-2xl p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">
                Tipo Documento
              </label>
              <Controller
                name="doc_type"
                control={control}
                rules={{ required: "Campo requerido" }}
                render={({ field, fieldState }) => (
                  <Dropdown
                    {...field}
                    options={DocsTypesConst}
                    className={`w-full bg-gray-50/50 border-gray-100 ${
                      fieldState.invalid ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              {formState.errors.doc_type && (
                <small className="p-error">
                  {formState.errors.doc_type.message as string}
                </small>
              )}
            </div>
            <div className="md:col-span-8 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">
                Número de Documento
              </label>
              <InputText
                {...register("doc_number", {
                  required: "Campo requerido",
                  minLength: {
                    value: 4,
                    message:
                      "El número de documento debe tener al menos 4 caracteres.",
                  },
                })}
                className={`w-full bg-gray-50/50 border-gray-100 ${
                  formState.errors.doc_number ? "p-invalid" : ""
                }`}
                placeholder="Ej: 10203040"
                autoComplete="off"
              />
              {formState.errors.doc_number && (
                <small className="p-error">
                  {formState.errors.doc_number.message as string}
                </small>
              )}
            </div>

            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Nombres</label>
              <InputText
                {...register("first_name", { required: "Campo requerido" })}
                className={`w-full bg-gray-50/50 border-gray-100 ${
                  formState.errors.first_name ? "p-invalid" : ""
                }`}
              />
              {formState.errors.first_name && (
                <small className="p-error">
                  {formState.errors.first_name.message as string}
                </small>
              )}
            </div>
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">
                Apellidos
              </label>
              <InputText
                {...register("last_name", { required: "Campo requerido" })}
                className={`w-full bg-gray-50/50 border-gray-100 ${
                  formState.errors.last_name ? "p-invalid" : ""
                }`}
              />
              {formState.errors.last_name && (
                <small className="p-error">
                  {formState.errors.last_name.message as string}
                </small>
              )}
            </div>

            <div className="md:col-span-12 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">
                Rol en el Sistema
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
                    className={`w-full bg-gray-50/50 border-gray-100 ${
                      fieldState.invalid ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              {formState.errors.role_id && (
                <small className="p-error">
                  {formState.errors.role_id.message as string}
                </small>
              )}
            </div>

            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">
                Correo Institucional
              </label>
              <InputText
                {...register("email", { required: "Campo requerido" })}
                className={`w-full bg-gray-50/50 border-gray-100 ${
                  formState.errors.email ? "p-invalid" : ""
                }`}
                placeholder="empleado@hotel.com"
              />
              {formState.errors.email && (
                <small className="p-error">
                  {formState.errors.email.message as string}
                </small>
              )}
            </div>
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">
                Teléfono
              </label>
              <InputText
                {...register("phone")}
                className="w-full bg-gray-50/50 border-gray-100"
                placeholder="300 123 4567"
              />
            </div>

            <div className="md:col-span-12 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">
                Contraseña de Acceso
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
                    className={`w-full bg-gray-50/50 border-gray-100 font-mono ${
                      fieldState.invalid ? "p-invalid" : ""
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                )}
              />
              {formState.errors.password && (
                <small className="p-error">
                  {formState.errors.password.message as string}
                </small>
              )}
            </div>

            <div className="md:col-span-12 mt-4 pt-4 border-t border-gray-50">
              <Button
                type="submit"
                label="Registrar Colaborador"
                icon="pi pi-check"
                className="bg-emerald-600 text-white w-full p-4 font-black rounded-2xl shadow-lg hover:bg-emerald-700 transition-all border-none"
                loading={createEmployee.isPending}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
