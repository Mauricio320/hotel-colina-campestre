import { supabase } from "@/config/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { BlockUIProvider, useBlockUI } from "@/context/BlockUIContext";
import { DocsTypesConst } from "@/util/const/types-docs.const";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import React from "react";
import { useForm, Controller } from "react-hook-form";

const MyProfileContent: React.FC = () => {
  const { employee, user } = useAuth();
  const { data: roles } = useRoles();
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const userRole = roles?.find((r) => r.id === employee?.role_id)?.name || "Empleado";

  const profileForm = useForm({
    mode: "onChange",
    defaultValues: {
      first_name: employee?.first_name || "",
      last_name: employee?.last_name || "",
      email: employee?.email || user?.email || "",
      phone: employee?.phone || "",
      doc_type: employee?.doc_type || "",
      doc_number: employee?.doc_number || "",
      city: employee?.city || "",
      address: employee?.address || "",
    },
  });

  const passwordForm = useForm({
    mode: "onChange",
  });

  const {
    formState: { errors: profileErrors },
  } = profileForm;
  const {
    formState: { errors: passwordErrors },
  } = passwordForm;

  const onUpdateProfile = async (data: any) => {
    showBlockUI("Actualizando perfil...");
    try {
      const { error } = await supabase
        .from("employees")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          city: data.city,
          address: data.address,
        })
        .eq("auth_id", user?.id);

      if (error) throw error;
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      hideBlockUI();
    }
  };

  const onChangePassword = async (data: any) => {
    if (data.new_password !== data.confirm_password) {
      alert("Las contraseñas no coinciden");
      return;
    }

    showBlockUI("Cambiando contraseña...");
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.new_password,
      });
      if (error) throw error;
      alert("Contraseña actualizada con éxito");
      passwordForm.reset();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      hideBlockUI();
    }
  };

  const getInitials = () => {
    const first = employee?.first_name?.charAt(0) || "";
    const last = employee?.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header con avatar */}
      <div className="bg-linear-to-r from-emerald-600 to-emerald-500 rounded-2xl p-8 mb-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar
            label={getInitials()}
            shape="circle"
            className="bg-white text-emerald-600 font-black text-4xl"
            style={{ width: "100px", height: "100px" }}
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black mb-1">
              {employee?.first_name} {employee?.last_name}
            </h1>
            <p className="text-emerald-100 mb-3">{employee?.email || user?.email}</p>
            <Badge
              value={userRole}
              className="bg-white text-emerald-600 font-bold px-3 py-1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <Card
          className="lg:col-span-2 shadow-sm border-0"
          pt={{
            root: { className: "rounded-2xl overflow-hidden" },
            header: {
              className:
                "bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2",
            },
          }}
          header={
            <>
              <i className="pi pi-user text-emerald-600 text-xl"></i>
              <span className="font-bold text-gray-800">Información Personal</span>
            </>
          }
        >
          <form
            onSubmit={profileForm.handleSubmit(onUpdateProfile)}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombres */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Nombres <span className="text-amber-500">*</span>
                </label>
                <InputText
                  {...profileForm.register("first_name", {
                    required: "Campo requerido",
                  })}
                  className={`w-full bg-gray-50/50 border-gray-200 rounded-lg ${
                    profileErrors.first_name ? "p-invalid" : ""
                  }`}
                  placeholder="Ingrese sus nombres"
                />
                {profileErrors.first_name && (
                  <small className="text-red-500 text-xs">
                    {profileErrors.first_name.message as string}
                  </small>
                )}
              </div>

              {/* Apellidos */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Apellidos <span className="text-amber-500">*</span>
                </label>
                <InputText
                  {...profileForm.register("last_name", {
                    required: "Campo requerido",
                  })}
                  className={`w-full bg-gray-50/50 border-gray-200 rounded-lg ${
                    profileErrors.last_name ? "p-invalid" : ""
                  }`}
                  placeholder="Ingrese sus apellidos"
                />
                {profileErrors.last_name && (
                  <small className="text-red-500 text-xs">
                    {profileErrors.last_name.message as string}
                  </small>
                )}
              </div>

              {/* Tipo de Documento */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Tipo de Documento
                </label>
                <Controller
                  name="doc_type"
                  control={profileForm.control}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={DocsTypesConst}
                      disabled
                      className="w-full bg-gray-100 border-gray-200 rounded-lg"
                    />
                  )}
                />
              </div>

              {/* Número de Documento */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Número de Documento
                </label>
                <InputText
                  {...profileForm.register("doc_number")}
                  disabled
                  className="w-full bg-gray-100 border-gray-200 rounded-lg"
                />
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Teléfono <span className="text-amber-500">*</span>
                </label>
                <InputText
                  {...profileForm.register("phone", {
                    required: "Campo requerido",
                  })}
                  className={`w-full bg-gray-50/50 border-gray-200 rounded-lg ${
                    profileErrors.phone ? "p-invalid" : ""
                  }`}
                  placeholder="300 123 4567"
                />
                {profileErrors.phone && (
                  <small className="text-red-500 text-xs">
                    {profileErrors.phone.message as string}
                  </small>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Correo Electrónico
                </label>
                <InputText
                  {...profileForm.register("email")}
                  disabled
                  className="w-full bg-gray-100 border-gray-200 rounded-lg"
                />
                <small className="text-gray-400 text-xs">
                  El correo no se puede modificar
                </small>
              </div>

              {/* Ciudad */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Ciudad</label>
                <InputText
                  {...profileForm.register("city")}
                  className="w-full bg-gray-50/50 border-gray-200 rounded-lg"
                  placeholder="Ciudad de residencia"
                />
              </div>

              {/* Dirección */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Dirección
                </label>
                <InputText
                  {...profileForm.register("address")}
                  className="w-full bg-gray-50/50 border-gray-200 rounded-lg"
                  placeholder="Dirección de residencia"
                />
              </div>
            </div>

            <Divider className="my-2" />

            <Button
              type="submit"
              label="Guardar Cambios"
              icon="pi pi-save"
              className="bg-emerald-600 border-emerald-600 text-white w-full md:w-auto px-6 py-3 font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            />
          </form>
        </Card>

        {/* Seguridad */}
        <Card
          className="shadow-sm border-0 h-fit"
          pt={{
            root: { className: "rounded-2xl overflow-hidden" },
            header: {
              className:
                "bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-2",
            },
          }}
          header={
            <>
              <i className="pi pi-shield text-amber-600 text-xl"></i>
              <span className="font-bold text-gray-800">Seguridad</span>
            </>
          }
        >
          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            className="flex flex-col gap-5"
          >
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <p className="text-sm text-gray-600 mb-0">
                <i className="pi pi-info-circle text-amber-500 mr-2"></i>
                Para cambiar tu contraseña, introduce la nueva contraseña y
                confírmala.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Nueva Contraseña <span className="text-amber-500">*</span>
              </label>
              <Controller
                name="new_password"
                control={passwordForm.control}
                rules={{
                  required: "Campo requerido",
                  minLength: {
                    value: 6,
                    message: "Mínimo 6 caracteres",
                  },
                }}
                render={({ field, fieldState }) => (
                  <Password
                    {...field}
                    toggleMask
                    feedback
                    className={`w-full ${fieldState.invalid ? "p-invalid" : ""}`}
                    inputClassName="w-full bg-gray-50/50 border-gray-200 rounded-lg"
                    placeholder="Mínimo 6 caracteres"
                  />
                )}
              />
              {passwordErrors.new_password && (
                <small className="text-red-500 text-xs">
                  {passwordErrors.new_password.message as string}
                </small>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Confirmar Contraseña{" "}
                <span className="text-amber-500">*</span>
              </label>
              <Controller
                name="confirm_password"
                control={passwordForm.control}
                rules={{ required: "Campo requerido" }}
                render={({ field, fieldState }) => (
                  <Password
                    {...field}
                    toggleMask
                    feedback={false}
                    className={`w-full ${fieldState.invalid ? "p-invalid" : ""}`}
                    inputClassName="w-full bg-gray-50/50 border-gray-200 rounded-lg"
                    placeholder="Repita la contraseña"
                  />
                )}
              />
            </div>

            <Button
              type="submit"
              label="Cambiar Contraseña"
              icon="pi pi-key"
              className="bg-amber-500 border-amber-500 text-white w-full py-3 font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            />
          </form>
        </Card>
      </div>
    </div>
  );
};

const MyProfile: React.FC = () => {
  return (
    <BlockUIProvider>
      <MyProfileContent />
    </BlockUIProvider>
  );
};

export default MyProfile;
