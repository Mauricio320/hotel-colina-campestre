import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Employee, Role } from "@/types";
import { AuthUser } from "@supabase/supabase-js";

const wccLogo = new URL("/images/wcc_logo-u12188.png", import.meta.url);

interface LayoutProps {
  employee: Employee;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ employee, onLogout }) => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      icon: "pi pi-home",
      path: "/",
      roles: [
        Role.Admin,
        Role.Recepcionista,
        Role.Limpieza,
        Role.Mantenimiento,
      ],
    },
    {
      label: "Calendario",
      icon: "pi pi-calendar",
      path: "/calendar",
      roles: [
        Role.Admin,
        Role.Recepcionista,
        Role.Limpieza,
        Role.Mantenimiento,
      ],
    },
    {
      label: "Habitaciones",
      icon: "pi pi-building",
      path: "/rooms",
      roles: [Role.Admin, Role.Recepcionista],
    },
    {
      label: "Movimiento Reservas",
      icon: "pi pi-directions",
      path: "/booking-movements",
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
      label: "Empleados",
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
    {
      label: "Mis Datos",
      icon: "pi pi-user",
      path: "/profile",
      roles: [
        Role.Admin,
        Role.Recepcionista,
        Role.Limpieza,
        Role.Mantenimiento,
      ],
    },
  ];

  const filteredMenu = employee?.role?.name
    ? menuItems.filter((item) =>
        item.roles.includes(employee?.role?.name as Role),
      )
    : menuItems.filter((item) => item.path === "/profile" || item.path === "/");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}

      {!employee?.role?.name && (
        <div className="bg-amber-100 p-2 text-center text-amber-800 text-xs font-bold border-b border-amber-200">
          Atención: No se encontró tu perfil de empleado. Algunas funciones
          pueden estar limitadas. Contacta al administrador.
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}

        <aside className="hidden lg:flex flex-col w-64 border-r bg-white p-4 gap-2 w-[290px] max-w-full">
          <div className="flex items-center gap-2 h-16 m-[-1rem] p-2 border-b border-emerald-800 bg-emerald-600 mb-1">
            <img src={wccLogo.href} alt="Logo" className="max-w-full" />
          </div>
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-emerald-600 text-white shadow-lg  font-bold"
                  : "hover:bg-emerald-50 hover:text-emerald-600 text-gray-600"
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
          className="w-full sm:w-80 bg-white max-w-[80%]"
        >
          <div className="flex items-center gap-2 h-16 m-[-1rem] p-2 border-b border-emerald-800 bg-emerald-600 mb-1">
            <img src={wccLogo.href} alt="Logo" className="max-w-full" />
          </div>
          <div className="flex flex-col gap-2 mt-4 ">
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setVisible(false)}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  location.pathname === item.path
                    ? "bg-emerald-600 text-white shadow-lg  font-bold"
                    : "hover:bg-emerald-50 hover:text-emerald-600 text-gray-600"
                }`}
              >
                <i className={item.icon}></i>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <Divider />
            <Button
              label="Cerrar Sesión"
              icon="pi pi-sign-out"
              className="p-button-text p-button-danger w-full justify-start p-4"
              onClick={onLogout}
            />
          </div>
        </Sidebar>

        <div className="w-full h-screen flex flex-col">
          <header className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-4">
              <Button
                icon="pi pi-bars"
                onClick={() => setVisible(true)}
                className="p-button-text lg:hidden"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">
                  {employee?.role?.name || "Perfil No Sincronizado"}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {employee?.first_name || ""} {employee?.last_name || ""}
                </span>
              </div>
              <div className="hidden md:block h-8 w-px mx-4 bg-gray-200" />
              <Button
                icon="pi pi-sign-out"
                className="p-button-rounded p-button-text"
                onClick={onLogout}
              />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 bg-[#faf8f5] overflow-y-auto ">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
