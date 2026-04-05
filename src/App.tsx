import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrimeReactProvider } from "primereact/api";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { lazy, Suspense } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

// Hooks
import { AuthProvider, useAuth } from "./hooks/useAuth";

// Components - Eager loaded (critical for first paint)
import Login from "@/pages/auth/Login";
import Layout from "./components/layout/Layout";

const CalendarView = lazy(() => import("@/pages/calendar/CalendarView"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const EmployeeManagement = lazy(() => import("@/pages/employees/EmployeeManagement"));
const GuestManagement = lazy(() => import("@/pages/guests/GuestManagement"));
const CleaningLogsPage = lazy(() => import("@/pages/logs/CleaningLogsPage"));
const CleaningTaskPage = lazy(() => import("@/pages/logs/CleaningTaskPage"));
const MaintenanceLogsPage = lazy(() => import("@/pages/logs/MaintenanceLogsPage"));
const MaintenanceTaskPage = lazy(() => import("@/pages/logs/MaintenanceTaskPage"));
const InvoiceDetailPage = lazy(() => import("@/pages/payments/InvoiceDetailPage"));
const PaymentsInvoice = lazy(() => import("@/pages/payments/PaymentsInvoice"));
const RoomPayments = lazy(() => import("@/pages/payments/RoomPayments"));
const MyProfile = lazy(() => import("@/pages/profile/MyProfile"));
const Reports = lazy(() => import("@/pages/reports/Reports"));
const RoomCleaningHistoryPage = lazy(() => import("@/pages/rooms/RoomCleaningHistoryPage"));
const RoomFormPage = lazy(() => import("@/pages/rooms/RoomFormPage"));
const RoomHistoryPage = lazy(() => import("@/pages/rooms/RoomHistoryPage"));
const RoomMaintenanceHistoryPage = lazy(() => import("@/pages/rooms/RoomMaintenanceHistoryPage"));
const RoomManagement = lazy(() => import("@/pages/rooms/RoomManagement"));
const RoomRateHistoryPage = lazy(() => import("@/pages/rooms/RoomRateHistoryPage"));
const Settings = lazy(() => import("@/pages/settings/Settings"));
const CancelReservationPage = lazy(() => import("@/pages/stays/CancelReservationPage"));
const CheckInPage = lazy(() => import("@/pages/stays/CheckInPage"));
const CheckOutPage = lazy(() => import("@/pages/stays/CheckOutPage"));
const MoveReservationPage = lazy(() => import("@/pages/stays/MoveReservationPage"));
const CheckInPayment = lazy(() => import("@/pages/stays/CheckInPayment"));
const CraftTutorialPage = lazy(() => import("@/pages/craft-tutorial/CraftTutorialPage"));
const CraftTutorialPreview = lazy(() => import("@/pages/craft-tutorial/CraftTutorialPreview"));

const LandingPage = lazy(() => import("@/pages/landing/LandingPage"));
const GaleriaPage = lazy(() => import("@/pages/landing/GaleriaPage"));
const LandingPageAdmin = lazy(() => import("@/pages/admin/landing-page/LandingPageAdmin"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <ProgressSpinner strokeWidth="4" fill="transparent" animationDuration=".5s" />
      <p className="animate-pulse font-medium text-gray-600">Cargando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, employee, loading, dbError, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-900">
        <div className="flex flex-col items-center gap-4">
          <ProgressSpinner strokeWidth="4" fill="transparent" animationDuration=".5s" />
          <p className="animate-pulse font-bold text-white">Iniciando sesión segura...</p>
        </div>
      </div>
    );
  }

  if (dbError === "DATABASE_NOT_READY") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-900 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl">
          <i className="pi pi-database mb-4 text-6xl text-amber-500"></i>
          <h2 className="mb-2 text-2xl font-black text-gray-800">Base de datos no configurada</h2>
          <p className="mb-6 text-gray-600">
            No se encontró la tabla de empleados. Por favor, asegúrate de haber ejecutado el
            contenido del archivo <b>database.sql</b> en el editor SQL de tu proyecto Supabase.
          </p>
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
            <ol className="ml-4 flex list-decimal flex-col gap-2 font-medium">
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
            className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700"
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
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/calendar" />} />

      {/* Public Landing Page */}
      <Route
        path="/"
        element={
          <Suspense fallback={<PageLoader />}>
            <LandingPage />
          </Suspense>
        }
      />

      {/* Public Gallery Page */}
      <Route
        path="/galeria"
        element={
          <Suspense fallback={<PageLoader />}>
            <GaleriaPage />
          </Suspense>
        }
      />

      <Route
        element={user ? <Layout employee={employee} onLogout={logout} /> : <Navigate to="/login" />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Route>

      {/* Lazy loaded routes with Suspense */}
      <Route
        element={user ? <Layout employee={employee} onLogout={logout} /> : <Navigate to="/login" />}
      >
        <Route
          path="/check-in/:roomId"
          element={
            <Suspense fallback={<PageLoader />}>
              <CheckInPage />
            </Suspense>
          }
        />
        <Route
          path="/booking/:roomId"
          element={
            <Suspense fallback={<PageLoader />}>
              <CheckInPage />
            </Suspense>
          }
        />
        <Route
          path="/check-out/:stayId"
          element={
            <Suspense fallback={<PageLoader />}>
              <CheckOutPage />
            </Suspense>
          }
        />
        <Route
          path="/rooms"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoomManagement userRole={roleName} />
            </Suspense>
          }
        />
        <Route
          path="/rooms/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoomFormPage />
            </Suspense>
          }
        />
        <Route
          path="/rooms/edit/:roomId"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoomFormPage />
            </Suspense>
          }
        />
        <Route
          path="/rooms/history/:roomId"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoomHistoryPage />
            </Suspense>
          }
        />
        <Route
          path="/rooms/cleaning-history/:roomId"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoomCleaningHistoryPage />
            </Suspense>
          }
        />
        <Route
          path="/rooms/maintenance-history/:roomId"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoomMaintenanceHistoryPage />
            </Suspense>
          }
        />
        <Route
          path="/rooms/rate-history"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoomRateHistoryPage />
            </Suspense>
          }
        />
        <Route
          path="/check-in-payment/:stayId"
          element={
            <Suspense fallback={<PageLoader />}>
              <CheckInPayment />
            </Suspense>
          }
        />
        <Route
          path="/room-payments"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoomPayments />
            </Suspense>
          }
        />
        <Route
          path="/payments-invoice"
          element={
            <Suspense fallback={<PageLoader />}>
              <PaymentsInvoice />
            </Suspense>
          }
        />
        <Route
          path="/invoice/:stayId"
          element={
            <Suspense fallback={<PageLoader />}>
              <InvoiceDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/guests"
          element={
            <Suspense fallback={<PageLoader />}>
              <GuestManagement userRole={roleName} />
            </Suspense>
          }
        />
        <Route
          path="/employees"
          element={
            <Suspense fallback={<PageLoader />}>
              <EmployeeManagement userRole={roleName} />
            </Suspense>
          }
        />
        <Route
          path="/logs/cleaning"
          element={
            <Suspense fallback={<PageLoader />}>
              <CleaningLogsPage />
            </Suspense>
          }
        />
        <Route
          path="/logs/maintenance"
          element={
            <Suspense fallback={<PageLoader />}>
              <MaintenanceLogsPage />
            </Suspense>
          }
        />
        <Route
          path="/limpieza/:room_id"
          element={
            <Suspense fallback={<PageLoader />}>
              <CleaningTaskPage />
            </Suspense>
          }
        />
        <Route
          path="/mantenimiento/:room_id"
          element={
            <Suspense fallback={<PageLoader />}>
              <MaintenanceTaskPage />
            </Suspense>
          }
        />
        <Route
          path="/cancelar-reserva/:stayId"
          element={
            <Suspense fallback={<PageLoader />}>
              <CancelReservationPage />
            </Suspense>
          }
        />
        <Route
          path="/mover-reserva/:stayId"
          element={
            <Suspense fallback={<PageLoader />}>
              <MoveReservationPage />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <Settings userRole={roleName} />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <MyProfile />
            </Suspense>
          }
        />
        <Route
          path="/reports"
          element={
            <Suspense fallback={<PageLoader />}>
              <Reports userRole={roleName} />
            </Suspense>
          }
        />

        <Route
          path="/craft-tutorial"
          element={
            <Suspense fallback={<PageLoader />}>
              <CraftTutorialPage />
            </Suspense>
          }
        />
        <Route
          path="/craft-tutorial/preview"
          element={
            <Suspense fallback={<PageLoader />}>
              <CraftTutorialPreview />
            </Suspense>
          }
        />
      </Route>

      {/* Admin Landing Page Configuration */}
      <Route
        path="/admin/landing-page/*"
        element={
          user ? (
            <Suspense fallback={<PageLoader />}>
              <LandingPageAdmin />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

import { BlockUIProvider } from "./context/BlockUIContext";

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
