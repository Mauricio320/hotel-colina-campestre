import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "@/styles/animations.css";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
      navigate("/calendar");
    } catch (err: any) {
      console.error("Login error detail:", err);

      if (err.message === "Invalid login credentials") {
        setErrorMsg(
          "Correo o contraseña incorrectos. Si aún no tienes cuenta, regístrate como administrador."
        );
      } else if (err.message?.includes("Email not confirmed")) {
        setErrorMsg(
          "Tu correo no ha sido confirmado. Revisa tu bandeja de entrada o desactiva la confirmación en Supabase."
        );
      } else {
        setErrorMsg("Error al intentar acceder: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      {/* Left Side - Branding */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-emerald-600 p-12 lg:flex lg:w-1/2">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 opacity-50"></div>
        <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-700 opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 opacity-20"></div>

        <div className="relative z-10 max-w-md text-center">
          <img
            src="/images/img-name-hotel-log.png"
            alt="Hotel Colina Campestre"
            className="mx-auto mb-8 h-auto w-48 brightness-0 invert"
          />
          <h1 className="mb-4 text-4xl font-bold text-white">Bienvenido</h1>
          <p className="text-lg leading-relaxed text-emerald-100">
            Sistema de gestión hotelera para el control de reservas, habitaciones y pagos.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center p-6 md:p-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <img
              src="/images/img-name-hotel-log.png"
              alt="Hotel Colina Campestre"
              className="mx-auto h-auto w-32"
            />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
              <p className="text-sm text-gray-500">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {errorMsg && (
              <div className="animate-shake mb-6">
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  <i className="pi pi-exclamation-circle mt-0.5 text-red-500"></i>
                  <span className="text-sm">{errorMsg}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-bold text-gray-700"
                >
                  <i className="pi pi-envelope text-emerald-600"></i>
                  Correo Electrónico
                </label>
                <InputText
                  id="email"
                  {...register("email", { required: "El correo es obligatorio" })}
                  className={`w-full rounded-xl border px-4 py-3 transition-all ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  }`}
                  placeholder="correo@hotel.com"
                  autoComplete="off"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <i className="pi pi-lock text-emerald-600"></i>
                  Contraseña
                </label>
                <div className="relative">
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: "La contraseña es obligatoria" }}
                    render={({ field }) => (
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className={`w-full rounded-xl border px-4 py-3 pr-12 transition-all outline-none ${
                            errors.password
                              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                              : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-emerald-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`}></i>
                        </button>
                      </div>
                    )}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                unstyled
                type="submit"
                label="Iniciar Sesión"
                icon="pi pi-arrow-right"
                className="w-full rounded-xl border-0 bg-emerald-600 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg"
                loading={loading}
              />
            </form>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>© Hotel Colina Campestre</span>
                <span>•</span>
                <span>Todos los derechos reservados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
