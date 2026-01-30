import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrimeReactProvider } from "primereact/api";
import { ProgressSpinner } from "primereact/progressspinner";

// Hooks
import { useAuth, AuthProvider } from "@/hooks/useAuth";

// Components
import Layout from "@/components/layout/Layout";
import Login from "@/pages/auth/Login";
import RegisterAdmin from "@/pages/auth/RegisterAdmin";
import Dashboard from "@/pages/dashboard/Dashboard";
import CalendarView from "@/pages/calendar/CalendarView";
import CheckInPage from "@/pages/stays/CheckInPage";
import BookingPage from "@/pages/stays/BookingPage";
import CheckOutPage from "@/pages/stays/CheckOutPage";
import RoomManagement from "@/pages/rooms/RoomManagement";
import GuestManagement from "@/pages/guests/GuestManagement";
import EmployeeManagement from "@/pages/employees/EmployeeManagement";
import CleaningLogs from "@/pages/logs/CleaningLogs";
import MaintenanceLogs from "@/pages/logs/MaintenanceLogs";
import Settings from "@/pages/settings/Settings";
import MyProfile from "@/pages/profile/MyProfile";
import Reports from "@/pages/reports/Reports";
import BookingMovements from "@/pages/bookings/BookingMovements";
import RoomPayments from "@/pages/payments/RoomPayments";
import PaymentsInvoice from "@/pages/payments/PaymentsInvoice";
import InvoiceDetailPage from "@/pages/payments/InvoiceDetailPage";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, employee, loading, dbError, logout } = useAuth();

  console.log({ user, employee });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-900">
        <div className="flex flex-col items-center gap-4">
          <ProgressSpinner
            strokeWidth="4"
            fill="transparent"
            animationDuration=".5s"
          />
          <p className="text-white font-bold animate-pulse">
            Iniciando sesión segura...
          </p>
        </div>
      </div>
    );
  }

  if (dbError === "DATABASE_NOT_READY") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-900 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
          <i className="pi pi-database text-6xl text-amber-500 mb-4"></i>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Base de datos no configurada
          </h2>
          <p className="text-gray-600 mb-6">
            No se encontró la tabla de empleados. Por favor, asegúrate de haber
            ejecutado el contenido del archivo <b>database.sql</b> en el editor
            SQL de tu proyecto Supabase.
          </p>
          <div className="p-4 bg-amber-50 rounded-lg text-amber-800 text-sm border border-amber-200 mb-6 text-left">
            <ol className="list-decimal ml-4 flex flex-col gap-2 font-medium">
              <li>
                Ve a tu proyecto en <b>supabase.com</b>
              </li>
              <li>
                Haz clic en <b>SQL Editor</b>
              </li>
              <li>
                Pega el contenido del archivo <b>database.sql</b>
              </li>
              <li>
                Haz clic en <b>Run</b>
              </li>
              <li>Recarga esta página</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Ya ejecuté el script, recargar
          </button>
        </div>
      </div>
    );
  }

  const roleName = employee?.role?.name || null;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/register-admin"
        element={!user ? <RegisterAdmin /> : <Navigate to="/" />}
      />

      {/* Protected Routes */}
      <Route
        element={
          user ? (
            <Layout employee={employee} onLogout={logout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/check-in/:roomId" element={<CheckInPage />} />
        <Route path="/booking/:roomId" element={<BookingPage />} />
        <Route path="/check-out/:roomId" element={<CheckOutPage />} />
        <Route path="/rooms" element={<RoomManagement userRole={roleName} />} />
        <Route path="/booking-movements" element={<BookingMovements />} />
        <Route path="/room-payments" element={<RoomPayments />} />
        <Route path="/payments-invoice" element={<PaymentsInvoice />} />
        <Route path="/invoice/:stayId" element={<InvoiceDetailPage />} />
        <Route
          path="/guests"
          element={<GuestManagement userRole={roleName} />}
        />
        <Route
          path="/employees"
          element={<EmployeeManagement userRole={roleName} />}
        />
        <Route path="/logs/cleaning" element={<CleaningLogs />} />
        <Route path="/logs/maintenance" element={<MaintenanceLogs />} />
        <Route path="/settings" element={<Settings userRole={roleName} />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/reports" element={<Reports userRole={roleName} />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

import { BlockUIProvider } from "@/context/BlockUIContext";

const App: React.FC = () => {
  return (
    <PrimeReactProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BlockUIProvider>
            <Router>
              <AppContent />
            </Router>
          </BlockUIProvider>
        </AuthProvider>
      </QueryClientProvider>
    </PrimeReactProvider>
  );
};

export default App;
