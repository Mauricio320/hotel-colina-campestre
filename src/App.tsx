import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrimeReactProvider } from "primereact/api";
import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Hooks
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// Components
import Layout from "@/components/layout/Layout";
import Login from "@/pages/auth/Login";
import RegisterAdmin from "@/pages/auth/RegisterAdmin";
import BookingMovements from "@/pages/bookings/BookingMovements";
import CalendarView from "@/pages/calendar/CalendarView";
import Dashboard from "@/pages/dashboard/Dashboard";
import EmployeeManagement from "@/pages/employees/EmployeeManagement";
import GuestManagement from "@/pages/guests/GuestManagement";
import CleaningLogs from "./pages/logs/CleaningLogs.tsx";
import MaintenanceLogs from "./pages/logs/MaintenanceLogs.tsx";
import InvoiceDetailPage from "@/pages/payments/InvoiceDetailPage";
import PaymentsInvoice from "@/pages/payments/PaymentsInvoice";
import RoomPayments from "@/pages/payments/RoomPayments";
import MyProfile from "@/pages/profile/MyProfile";
import Reports from "@/pages/reports/Reports";
import RoomFormPage from "@/pages/rooms/RoomFormPage";
import RoomHistoryPage from "@/pages/rooms/RoomHistoryPage";
import RoomManagement from "@/pages/rooms/RoomManagement";
import Settings from "@/pages/settings/Settings";
import CheckInPage from "@/pages/stays/CheckInPage";
import CheckOutPage from "@/pages/stays/CheckOutPage";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, employee, loading, dbError, logout } = useAuth();

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
        <Route path="/booking/:roomId" element={<CheckInPage />} />
        <Route path="/check-out/:stayId" element={<CheckOutPage />} />
        <Route path="/rooms" element={<RoomManagement userRole={roleName} />} />
        <Route path="/rooms/new" element={<RoomFormPage />} />
        <Route path="/rooms/edit/:roomId" element={<RoomFormPage />} />
        <Route path="/rooms/history/:roomId" element={<RoomHistoryPage />} />
        <Route path="/check-in-payment/:stayId" element={<CheckInPayment />} />
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
import { CheckInPayment } from "@/pages/stays/CheckInPayment";

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
