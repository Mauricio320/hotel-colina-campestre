import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";
import PageHeader from "@/components/ui/PageHeader";
import { useStayInvoice } from "@/hooks/useStayInvoice";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const InvoiceDetailPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { stay, payments, isLoading: loading, error } = useStayInvoice(stayId);

  // Cálculos y formateo de fechas
  const nights = useMemo(() => {
    if (!stay?.check_in_date || !stay?.check_out_date) return 1;
    const inDate = new Date(stay.check_in_date + "T12:00:00");
    const outDate = new Date(stay.check_out_date + "T12:00:00");
    const diff = outDate.getTime() - inDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [stay]);

  // Función para calcular precio por noche
  const calculatePricePerNight = () => {
    if (!stay || nights <= 0) return 0;
    const basePrice = stay.total_price - (stay.iva_amount || 0) - (stay.extra_mattress_price || 0);
    return Math.round(basePrice / nights);
  };

  // Calcular totales de pagos
  const totalPaymentsVerified =
    payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
  const pendingAmount = (stay?.total_price || 0) - totalPaymentsVerified;

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from, {
        state: { activeTab: location.state.activeTab },
      });
    } else {
      navigate("/room-payments");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <ProgressSpinner className="mb-4 h-12 w-12" strokeWidth="4" />
          <p className="font-medium text-gray-600">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error || !stay) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <i className="pi pi-exclamation-triangle mb-3 text-4xl text-red-600"></i>
          <h2 className="mb-2 text-xl font-bold text-red-800">Error al cargar factura</h2>
          <p className="mb-4 text-red-600">
            {error || "No se encontró la información de la reserva."}
          </p>
          <Button
            unstyled
            label="Volver a Pagos"
            icon="pi pi-arrow-left"
            onClick={handleBack}
            className="p-button-outlined"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-6xl pb-12 print:p-4">
      <PageHeader
        title={`Factura #${stay?.order_number || "N/A"}`}
        subtitle={
          stay?.status === "Reserved"
            ? "Reserva"
            : stay?.status === "Active"
              ? "En Curso"
              : "Completada"
        }
        icon="pi-file-text"
        color="emerald"
        onBack={handleBack}
        backTooltip="Volver a pagos"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna Izquierda - Info Cliente y Reserva */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header Compacto */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-300">
                  <i className="pi pi-building text-xl text-gray-600"></i>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Hotel Colina Campestre</h1>
                  <p className="text-xs text-gray-600">NIT: 123.456.789-0</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Factura #{stay?.order_number || "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(stay?.created_at || new Date()).toLocaleDateString()} -{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-gray-500 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <i className="pi pi-user text-gray-600"></i>
              Datos del Cliente
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs text-gray-500 uppercase">Nombre Completo</span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.first_name} {stay.guest?.last_name}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-500 uppercase">Identificación</span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.doc_type}: {stay.guest?.doc_number}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-500 uppercase">
                  Contacto Principal
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.phone || "No especificado"}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-500 uppercase">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.email || "No especificado"}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-500 uppercase">Dirección</span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.address || "No especificada"}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-500 uppercase">Ciudad</span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.city || "No especificada"}
                </p>
              </div>
            </div>
          </div>

          {/* Detalles de Reserva */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <i className="pi pi-calendar text-gray-600"></i>
              Detalles de Reserva
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="border border-gray-100 p-3 text-center">
                <i className="pi pi-sign-in mb-2 text-xl text-emerald-600"></i>
                <span className="block text-xs text-gray-500 uppercase">Entrada</span>
                <p className="font-semibold text-gray-900">{stay.check_in_date}</p>
              </div>
              <div className="border border-gray-100 p-3 text-center">
                <i className="pi pi-sign-out mb-2 text-xl text-emerald-600"></i>
                <span className="block text-xs text-gray-500 uppercase">Salida</span>
                <p className="font-semibold text-gray-900">{stay.check_out_date}</p>
              </div>
              <div className="border border-gray-100 p-3 text-center">
                <i className="pi pi-home mb-2 text-xl text-emerald-600"></i>
                <span className="block text-xs text-gray-500 uppercase">Habitación</span>
                <p className="font-semibold text-gray-900">{stay.room?.room_number}</p>
              </div>
              <div className="border border-gray-100 p-3 text-center">
                <i className="pi pi-clock mb-2 text-xl text-emerald-600"></i>
                <span className="block text-xs text-gray-500 uppercase">Noches</span>
                <p className="font-semibold text-gray-900">{nights}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-2">
              <div className="border border-gray-100 p-3 text-center">
                <i className="pi pi-users mb-2 text-xl text-emerald-600"></i>
                <span className="block text-xs text-gray-500 uppercase">Personas</span>
                <p className="font-semibold text-gray-900">
                  {stay.person_count || "No especificado"}
                </p>
              </div>
              {stay.extra_mattress_count > 0 && (
                <div className="border border-gray-100 p-3 text-center">
                  <i className="pi pi-th-large mb-2 text-xl text-emerald-600"></i>
                  <span className="block text-xs text-gray-500 uppercase">Colchonetas</span>
                  <p className="font-semibold text-gray-900">{stay.extra_mattress_count}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Resumen Financiero */}
        <div className="space-y-6">
          <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <i className="pi pi-money-bill text-gray-600"></i>
              Resumen Financiero
            </h3>
            <div className="space-y-3">
              {stay.price_override && stay.price_override.length > 0 && (
                <>
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-sm">Precio Estándar</span>
                    <span className="text-sm font-medium line-through">
                      $ {stay.price_override[0].original_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-green-600">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <i className="pi pi-tag text-xs" /> Descuento
                    </span>
                    <span className="text-sm font-bold">
                      - $ {stay.price_override[0].discount_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-b border-gray-100 pb-2 text-right text-[10px] text-gray-400 italic">
                    Autorizado por: {stay.price_override[0].employee?.first_name}{" "}
                    {stay.price_override[0].employee?.last_name}
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">
                  $ {(stay.total_price - stay.iva_amount).toLocaleString()}
                </span>
              </div>
              {stay.extra_mattress_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Colchonetas ({stay.extra_mattress_count})
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    $ {stay.extra_mattress_price.toLocaleString()}
                  </span>
                </div>
              )}
              {stay.is_invoice_requested && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">IVA (19%)</span>
                  <span className="text-sm font-medium text-gray-900">
                    $ {stay.iva_amount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 uppercase">Total Orden</span>
                  <span className="text-lg font-bold text-gray-900">
                    $ {stay.total_price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pagos Realizados</span>
                  <span className="text-sm font-medium text-red-600">
                    - $ {totalPaymentsVerified.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`flex items-center gap-2 text-sm font-medium uppercase ${pendingAmount > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    <i
                      className={`pi ${pendingAmount > 0 ? "pi-exclamation-circle" : "pi-check-circle"}`}
                    ></i>
                    Saldo
                  </span>
                  <span
                    className={`text-lg font-bold ${pendingAmount > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    $ {pendingAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {stay.is_invoice_requested && (
              <div className="mt-4 flex items-center gap-2 text-xs">
                <i className="pi pi-file-text text-blue-600"></i>
                <p className="font-medium text-blue-600">Se requiere factura electrónica</p>
              </div>
            )}

            {stay.payment_method && (
              <p className="mt-3 text-right text-xs text-gray-500 uppercase">
                Método de pago: {stay.payment_method.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Conceptos Detallada */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 text-gray-500 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <i className="pi pi-file-text text-gray-600"></i>
          Detalle de Servicios
        </h3>
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Concepto
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                  Cant.
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">
                  Unit.
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">Servicio de Hospedaje</p>
                  <p className="text-xs text-gray-500">{stay.room?.category}</p>
                </td>
                <td className="px-3 py-2 text-center text-sm text-gray-700">{nights}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-700">
                  ${calculatePricePerNight().toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                  ${(calculatePricePerNight() * nights).toLocaleString()}
                </td>
              </tr>
              {stay.has_extra_mattress && stay.extra_mattress_count > 0 && (
                <tr>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">Colchoneta Adicional</p>
                    <p className="text-xs text-gray-500">Servicio extra por noche</p>
                  </td>
                  <td className="px-3 py-2 text-center text-sm text-gray-700">
                    {stay.extra_mattress_count}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-gray-700">
                    ${(stay.extra_mattress_price / stay.extra_mattress_count).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                    ${stay.extra_mattress_price.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección Inferior - Detalle de Servicios y Pagos */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-1">
        {/* Pagos y Observaciones */}
        <div className="space-y-6">
          {/* Tabla de Pagos/Abonos */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <i className="pi pi-history text-gray-600"></i>
              Historial de Pagos
            </h3>
            <PaymentHistoryTable payments={payments} />
          </div>

          {/* Información Adicional */}
          {stay && stay.person_count > 1 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <i className="pi pi-users text-gray-600"></i>
                Resumen Ocupación
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 p-3 text-center">
                  <i className="pi pi-user mb-2 text-2xl text-emerald-600"></i>
                  <span className="block text-xs text-gray-500 uppercase">Personas</span>
                  <p className="text-xl font-bold text-gray-900">{stay.person_count}</p>
                </div>
                <div className="border border-gray-100 p-3 text-center">
                  <i className="pi pi-calendar mb-2 text-2xl text-emerald-600"></i>
                  <span className="block text-xs text-gray-500 uppercase">Noches</span>
                  <p className="text-xl font-bold text-gray-900">{nights}</p>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {stay && stay.observation && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <i className="pi pi-comment text-gray-600"></i>
                Observaciones
              </h3>
              <div className="flex items-start gap-3">
                <i className="pi pi-info-circle mt-1 text-amber-600"></i>
                <p className="text-sm text-gray-700 italic">"{stay.observation}"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer de Factura */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <div className="mb-2 flex items-center justify-center gap-2">
          <i className="pi pi-heart-fill text-red-500"></i>
          <p className="text-sm font-medium text-gray-600">Gracias por elegir</p>
        </div>
        <p className="text-xs text-gray-500">
          Documento de control interno. Generado el {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
