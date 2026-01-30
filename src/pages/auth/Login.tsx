import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "@/styles/animations.css";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      navigate("/");
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
    <div className="min-h-screen relative overflow-hidden bg-emerald-900">

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-emerald-300 rounded-full blur-3xl opacity-10 animate-pulse delay-500"></div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-6 animate-slide-in-left">
            <div className="inline-block">
              <img
                src="/images/img-name-hotel-log.png"
                alt="Hotel Colina Campestre"
                className="w-64 h-auto mb-8 mx-auto lg:mx-0 drop-shadow-2xl animate-float"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                  Bienvenido
                </span>
                <br />
                <span className="text-3xl lg:text-4xl text-emerald-100 font-light">
                  a tu Experiencia
                </span>
              </h1>

              <p className="text-emerald-100 text-lg lg:text-xl font-light leading-relaxed max-w-md mx-auto lg:mx-0">
                Descubre la elegancia y confort que solo Hotel Colina Campestre puede ofrecer
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                  <span className="text-emerald-200 text-sm">Naturaleza</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse delay-300"></div>
                  <span className="text-emerald-200 text-sm">Comodidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse delay-600"></div>
                  <span className="text-emerald-200 text-sm">Tranquilidad</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="animate-slide-in-right">
            <div className="backdrop-blur-xl bg-white/10 border border-emerald-400/30 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Acceso Exclusivo
                </h2>
                <p className="text-emerald-200 text-sm">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 animate-shake">
                  <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl flex items-center gap-3">
                    <i className="pi pi-exclamation-circle text-red-300"></i>
                    <span className="text-sm">{errorMsg}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-emerald-200 text-sm font-medium flex items-center gap-2">
                    <i className="pi pi-envelope text-emerald-400"></i>
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <InputText
                      id="email"
                      {...register("email", { required: "El correo es obligatorio" })}
                      className={`w-full px-4 py-3 bg-white/10 border ${errors.email ? 'border-red-400' : 'border-emerald-400/30'} rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all backdrop-blur-sm`}
                      placeholder="correo@hotel.com"
                      autoComplete="off"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1 animate-fade-in">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-emerald-200 text-sm font-medium flex items-center gap-2">
                    <i className="pi pi-lock text-emerald-400"></i>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Controller
                      name="password"
                      control={control}
                      rules={{ required: "La contraseña es obligatoria" }}
                      render={({ field, fieldState }) => (
                        <div className="relative">
                          <input
                            type={fieldState.invalid ? "text" : "password"}
                            {...field}
                            className={`w-full px-4 py-3 pr-12 bg-white/10 border ${fieldState.invalid ? 'border-red-400' : 'border-emerald-400/30'} rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all backdrop-blur-sm`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              input.type = input.type === 'password' ? 'text' : 'password';
                            }}
                          >
                            <i className="pi pi-eye"></i>
                          </button>
                        </div>
                      )}
                    />
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1 animate-fade-in">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  label="Iniciar Sesión"
                  icon="pi pi-arrow-right"
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-lg"
                  loading={loading}
                />
              </form>

              <div className="mt-8 pt-6 border-t border-emerald-400/20">
                <div className="flex items-center justify-center gap-4 text-xs text-emerald-200/60">
                  <span>© Hotel Colina Campestre</span>
                  <span>•</span>
                  <span>Todos los derechos reservados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
