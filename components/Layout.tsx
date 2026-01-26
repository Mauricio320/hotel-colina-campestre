
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Role } from '../types';

interface LayoutProps {
  userRole: string | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ userRole, onLogout }) => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', path: '/', roles: [Role.Admin, Role.Recepcionista, Role.Limpieza, Role.Mantenimiento] },
    { label: 'Calendario', icon: 'pi pi-calendar', path: '/calendar', roles: [Role.Admin, Role.Recepcionista, Role.Limpieza, Role.Mantenimiento] },
    { label: 'Habitaciones', icon: 'pi pi-building', path: '/rooms', roles: [Role.Admin, Role.Recepcionista] },
    { label: 'Movimiento Reservas', icon: 'pi pi-directions', path: '/booking-movements', roles: [Role.Admin, Role.Recepcionista] },
    { label: 'Pagos Habitaciones', icon: 'pi pi-money-bill', path: '/room-payments', roles: [Role.Admin, Role.Recepcionista] },
    { label: 'Huéspedes', icon: 'pi pi-users', path: '/guests', roles: [Role.Admin, Role.Recepcionista] },
    { label: 'Empleados', icon: 'pi pi-user-plus', path: '/employees', roles: [Role.Admin] },
    { label: 'Limpieza', icon: 'pi pi-star', path: '/logs/cleaning', roles: [Role.Admin, Role.Recepcionista, Role.Limpieza] },
    { label: 'Mantenimiento', icon: 'pi pi-cog', path: '/logs/maintenance', roles: [Role.Admin, Role.Recepcionista, Role.Mantenimiento] },
    { label: 'Reportes', icon: 'pi pi-chart-bar', path: '/reports', roles: [Role.Admin] },
    { label: 'Configuración', icon: 'pi pi-sliders-h', path: '/settings', roles: [Role.Admin] },
    { label: 'Mis Datos', icon: 'pi pi-user', path: '/profile', roles: [Role.Admin, Role.Recepcionista, Role.Limpieza, Role.Mantenimiento] },
  ];

  const filteredMenu = userRole 
    ? menuItems.filter(item => item.roles.includes(userRole as Role))
    : menuItems.filter(item => item.path === '/profile' || item.path === '/');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button icon="pi pi-bars" onClick={() => setVisible(true)} className="p-button-text lg:hidden" />
          <div className="flex items-center gap-2">
            <i className="pi pi-building text-indigo-600 text-2xl"></i>
            <h1 className="text-xl font-black text-gray-800 hidden sm:block">Hotel Colina Campestre</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-tighter">Rol Actual</span>
            <span className="text-sm font-medium text-gray-700">{userRole || 'Perfil No Sincronizado'}</span>
          </div>
          <div className="hidden md:block h-8 w-px mx-4 bg-gray-200" />
          <Button 
            icon="pi pi-sign-out" 
            className="p-button-rounded p-button-danger p-button-text" 
            onClick={onLogout}
            tooltip="Cerrar Sesión"
          />
        </div>
      </header>

      {!userRole && (
        <div className="bg-amber-100 p-2 text-center text-amber-800 text-xs font-bold border-b border-amber-200">
          <i className="pi pi-exclamation-triangle mr-2"></i>
          Atención: No se encontró tu perfil de empleado. Algunas funciones pueden estar limitadas. Contacta al administrador.
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r bg-white p-4 gap-2">
          {filteredMenu.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-bold' 
                  : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>

        {/* Mobile Sidebar */}
        <Sidebar visible={visible} onHide={() => setVisible(false)} className="w-full sm:w-80">
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center gap-3 px-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <i className="pi pi-user text-indigo-600 text-xl"></i>
                </div>
                <div>
                    <p className="font-bold text-gray-800">{userRole || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">Sistema de Gestión</p>
                </div>
            </div>
            {filteredMenu.map(item => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setVisible(false)}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  location.pathname === item.path ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={item.icon}></i>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <Divider />
            <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-text p-button-danger w-full justify-start p-4" onClick={onLogout} />
          </div>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50/50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
