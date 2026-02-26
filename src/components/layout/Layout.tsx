import { Employee, Role } from "@/types";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Sidebar } from "primereact/sidebar";
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const wccLogo = new URL("/images/wcc_logo-u12188.png", import.meta.url);

interface LayoutProps {
  employee: Employee;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ employee, onLogout }) => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  const menuItems = [
    // {
    //   label: "Dashboard",
    //   icon: "pi pi-home",
    //   path: "/",
    //   roles: [
    //     Role.Admin,
    //     Role.Recepcionista,
    //     Role.Limpieza,
    //     Role.Mantenimiento,
    //   ],
    // },
    {
      label: "Calendario",
      icon: "pi pi-calendar",
      path: "/calendar",
      roles: [Role.Admin, Role.Recepcionista, Role.Limpieza, Role.Mantenimiento],
    },
    {
      label: "Habitaciones",
      icon: "pi pi-building",
      path: "/rooms",
      roles: [Role.Admin, Role.Recepcionista],
    },
    {
      label: "Fact Habitaciones",
      icon: "pi pi-receipt",
      path: "/room-payments",
      roles: [Role.Admin, Role.Recepcionista],
    },
    {
      label: "Pagos Facturas",
      icon: "pi pi-money-bill",
      path: "/payments-invoice",
      roles: [Role.Admin, Role.Recepcionista],
    },
    {
      label: "Huéspedes",
      icon: "pi pi-users",
      path: "/guests",
      roles: [Role.Admin, Role.Recepcionista],
    },
    {
      label: "Personal",
      icon: "pi pi-user-plus",
      path: "/employees",
      roles: [Role.Admin],
    },
    {
      label: "Limpieza",
      icon: "pi pi-star",
      path: "/logs/cleaning",
      roles: [Role.Admin, Role.Recepcionista, Role.Limpieza],
    },
    {
      label: "Mantenimiento",
      icon: "pi pi-cog",
      path: "/logs/maintenance",
      roles: [Role.Admin, Role.Recepcionista, Role.Mantenimiento],
    },
    {
      label: "Reportes",
      icon: "pi pi-chart-bar",
      path: "/reports",
      roles: [Role.Admin],
    },
    {
      label: "Configuración",
      icon: "pi pi-sliders-h",
      path: "/settings",
      roles: [Role.Admin],
    },
    // {
    //   label: "Landing Page",
    //   icon: "pi pi-globe",
    //   path: "/landing-editor",
    //   roles: [Role.Admin],
    // },
    {
      label: "Mis Datos",
      icon: "pi pi-user",
      path: "/profile",
      roles: [Role.Admin, Role.Recepcionista, Role.Limpieza, Role.Mantenimiento],
    },
  ];

  const filteredMenu = employee?.role?.name
    ? menuItems.filter((item) => item.roles.includes(employee?.role?.name as Role))
    : menuItems.filter((item) => item.path === "/profile" || item.path === "/");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}

      {!employee?.role?.name && (
        <div className="border-b border-amber-200 bg-amber-100 p-2 text-center text-xs font-bold text-amber-800">
          Atención: No se encontró tu perfil de empleado. Algunas funciones pueden estar limitadas.
          Contacta al administrador.
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}

        <aside className="hidden w-64 w-[290px] max-w-full flex-col gap-2 bg-white p-4 lg:flex">
          <div className="m-[-1rem] mb-1 flex h-16 items-center gap-2 border-b border-emerald-800 bg-emerald-600 p-2">
            <img src={wccLogo.href} alt="Logo" className="max-w-full" />
          </div>
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-emerald-600 font-bold text-white shadow-lg"
                  : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>

        {/* Mobile Sidebar */}
        <Sidebar
          visible={visible}
          onHide={() => setVisible(false)}
          className="w-full max-w-[80%] bg-white sm:w-80"
          showCloseIcon={false}
          pt={{
            header: { className: "hidden" },
            content: { className: "p-0" },
          }}
          header={() => (
            <div className="s hidden">
              <div className="relative mb-1 flex h-16 items-center justify-center border-b border-emerald-800 bg-emerald-600 px-3">
                <img src={wccLogo.href} alt="Logo" className="max-h-full" />
                <button
                  onClick={() => setVisible(false)}
                  className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 text-white transition-colors hover:bg-white/50"
                >
                  <i className="pi pi-times text-sm font-bold"></i>
                </button>
              </div>
            </div>
          )}
        >
          <div className="relative mb-1 flex h-16 items-center justify-center border-b border-emerald-800 bg-emerald-600 px-3">
            <img src={wccLogo.href} alt="Logo" className="max-h-full" />
            <button
              onClick={() => setVisible(false)}
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 text-white transition-colors hover:bg-white/50"
            >
              <i className="pi pi-times text-sm font-bold"></i>
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2 px-3">
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setVisible(false)}
                className={`flex items-center gap-3 rounded-xl p-4 ${
                  location.pathname === item.path
                    ? "bg-emerald-600 font-bold text-white shadow-lg"
                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                }`}
              >
                <i className={item.icon}></i>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <Divider />
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl p-4 text-left text-red-500 transition-colors hover:bg-red-50"
            >
              <i className="pi pi-sign-out text-base"></i>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </Sidebar>

        <div className="flex h-screen w-full flex-col">
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between bg-white px-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                unstyled
                icon="pi pi-bars"
                onClick={() => setVisible(true)}
                className="p-button-text lg:hidden"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end md:flex">
                <span className="text-xs font-bold tracking-tighter text-emerald-500 uppercase">
                  {employee?.role?.name || "Perfil No Sincronizado"}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {employee?.first_name || ""} {employee?.last_name || ""}
                </span>
              </div>
              <div className="mx-4 hidden h-8 w-px bg-gray-200 md:block" />
              <Button
                unstyled
                icon="pi pi-sign-out"
                className="p-button-rounded p-button-text"
                onClick={onLogout}
              />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-[#faf8f5] p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
