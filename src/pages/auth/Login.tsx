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
          "Correo o contraseña incorrectos. Si aún no tienes cuenta, regístrate como administrador.",
        );
      } else if (err.message?.includes("Email not confirmed")) {
        setErrorMsg(
          "Tu correo no ha sido confirmado. Revisa tu bandeja de entrada o desactiva la confirmación en Supabase.",
        );
      } else {
        setErrorMsg("Error al intentar acceder: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-700 rounded-full translate-x-1/3 translate-y-1/3 opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>

        <div className="relative z-10 text-center max-w-md">
          <img
            src="/images/img-name-hotel-log.png"
            alt="Hotel Colina Campestre"
            className="w-48 h-auto mb-8 mx-auto brightness-0 invert"
          />
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenido
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Sistema de gestión hotelera para el control de reservas, habitaciones y pagos.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/images/img-name-hotel-log.png"
              alt="Hotel Colina Campestre"
              className="w-32 h-auto mx-auto"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-gray-500 text-sm">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 animate-shake">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
                  <i className="pi pi-exclamation-circle text-red-500 mt-0.5"></i>
                  <span className="text-sm">{errorMsg}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <i className="pi pi-envelope text-emerald-600"></i>
                  Correo Electrónico
                </label>
                <InputText
                  id="email"
                  {...register("email", { required: "El correo es obligatorio" })}
                  className={`w-full px-4 py-3 border rounded-xl transition-all ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  }`}
                  placeholder="correo@hotel.com"
                  autoComplete="off"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
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
                          className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all outline-none ${
                            errors.password
                              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                              : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`}></i>
                        </button>
                      </div>
                    )}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                label="Iniciar Sesión"
                icon="pi pi-arrow-right"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200"
                loading={loading}
              />
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
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
