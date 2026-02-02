import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";
import { supabase } from "@/config/supabase";
import { usePayments } from "@/hooks/usePayments";
import { Payment } from "@/types";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const InvoiceDetailPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stay, setStay] = useState<any | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!stayId) return;
      setLoading(true);

      try {
        // Cargar datos de la estancia con todas las relaciones
        const { data: stayData, error: stayError } = await supabase
          .from("stays")
          .select(
            `
            *,
            guest:guests(*),
            room:rooms(*),
            payment_method:payment_methods(name),
            price_override:price_overrides(*,employee:employees(first_name, last_name))
          `,
          )
          .eq("id", stayId)
          .single();

        if (stayError) throw stayError;

        // Cargar todos los pagos reales de la estancia desde la tabla payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select(
            `
            *,
            payment_method:payment_methods(name),
            employee:employees(first_name, last_name)
          `,
          )
          .eq("stay_id", stayId)
          .order("payment_date", { ascending: true });

        if (paymentsError) throw paymentsError;

        setStay(stayData);
        setPayments(paymentsData || []);
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        setError(
          "No se pudo cargar la información de la factura. Es posible que la reserva no exista.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [stayId]);

  // Cálculos y formateo de fechas
  const nights = useMemo(() => {
    if (!stay?.check_in_date || !stay?.check_out_date) return 1;
    const inDate = new Date(stay.check_in_date + "T12:00:00");
    const outDate = new Date(stay.check_out_date + "T12:00:00");
    const diff = outDate.getTime() - inDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [stay]);

  const checkInDateFormatted = stay?.check_in_date
    ? new Date(stay.check_in_date + "T12:00:00").toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const checkOutDateFormatted = stay?.check_out_date
    ? new Date(stay.check_out_date + "T12:00:00").toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Función para calcular precio por noche
  const calculatePricePerNight = () => {
    if (!stay || nights <= 0) return 0;
    const basePrice =
      stay.total_price -
      (stay.iva_amount || 0) -
      (stay.extra_mattress_price || 0);
    return Math.round(basePrice / nights);
  };

  // Funciones para el estado y tipo de pago
  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Active":
        return "danger";
      case "Reserved":
        return "warning";
      default:
        return "info";
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ProgressSpinner className="w-12 h-12 mb-4" strokeWidth="4" />
          <p className="text-gray-600 font-medium">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error || !stay) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <i className="pi pi-exclamation-triangle text-red-600 text-4xl mb-3"></i>
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Error al cargar factura
          </h2>
          <p className="text-red-600 mb-4">
            {error || "No se encontró la información de la reserva."}
          </p>
          <Button
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
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in print:p-4">
      {/* Header de Navegación */}
      <div className="flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-4">
          <Button
            icon="pi pi-arrow-left"
            onClick={handleBack}
            className="p-button-text p-button-plain p-button-rounded text-gray-400"
          />
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
              Factura #{stay?.order_number || "N/A"}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {stay?.status === "Reserved"
                ? "Reserva"
                : stay?.status === "Active"
                  ? "En Curso"
                  : "Completada"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Info Cliente y Reserva */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Compacto */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center">
                  <i className="pi pi-building text-xl text-gray-600"></i>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Hotel Colina Campestre
                  </h1>
                  <p className="text-xs text-gray-600">NIT: 123.456.789-0</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Factura #{stay?.order_number || "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(
                    stay?.created_at || new Date(),
                  ).toLocaleDateString()}{" "}
                  - {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-500">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <i className="pi pi-user text-gray-600"></i>
              Datos del Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 uppercase block mb-1">
                  Nombre Completo
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.first_name} {stay.guest?.last_name}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block mb-1">
                  Identificación
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.doc_type}: {stay.guest?.doc_number}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block mb-1">
                  Contacto Principal
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.phone || "No especificado"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block mb-1">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.email || "No especificado"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block mb-1">
                  Dirección
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.address || "No especificada"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block mb-1">
                  Ciudad
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.guest?.city || "No especificada"}
                </p>
              </div>
            </div>
          </div>

          {/* Detalles de Reserva */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <i className="pi pi-calendar text-gray-600"></i>
              Detalles de Reserva
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border border-gray-100">
                <i className="pi pi-sign-in text-emerald-600 text-xl mb-2"></i>
                <span className="text-xs text-gray-500 uppercase block">
                  Entrada
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.check_in_date}
                </p>
              </div>
              <div className="text-center p-3 border border-gray-100">
                <i className="pi pi-sign-out text-emerald-600 text-xl mb-2"></i>
                <span className="text-xs text-gray-500 uppercase block">
                  Salida
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.check_out_date}
                </p>
              </div>
              <div className="text-center p-3 border border-gray-100">
                <i className="pi pi-home text-emerald-600 text-xl mb-2"></i>
                <span className="text-xs text-gray-500 uppercase block">
                  Habitación
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.room?.room_number}
                </p>
              </div>
              <div className="text-center p-3 border border-gray-100">
                <i className="pi pi-clock text-emerald-600 text-xl mb-2"></i>
                <span className="text-xs text-gray-500 uppercase block">
                  Noches
                </span>
                <p className="font-semibold text-gray-900">{nights}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 border border-gray-100">
                <i className="pi pi-users text-emerald-600 text-xl mb-2"></i>
                <span className="text-xs text-gray-500 uppercase block">
                  Personas
                </span>
                <p className="font-semibold text-gray-900">
                  {stay.person_count || "No especificado"}
                </p>
              </div>
              {stay.extra_mattress_count > 0 && (
                <div className="text-center p-3 border border-gray-100">
                  <i className="pi pi-th-large text-emerald-600 text-xl mb-2"></i>
                  <span className="text-xs text-gray-500 uppercase block">
                    Colchonetas
                  </span>
                  <p className="font-semibold text-gray-900">
                    {stay.extra_mattress_count}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Resumen Financiero */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <i className="pi pi-money-bill text-gray-600"></i>
              Resumen Financiero
            </h3>
            <div className="space-y-3">
              {stay.price_override && stay.price_override.length > 0 && (
                <>
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="text-sm">Precio Estándar</span>
                    <span className="text-sm font-medium line-through">
                      $ {stay.price_override[0].original_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm flex items-center gap-1 font-medium">
                      <i className="pi pi-tag text-xs" /> Descuento
                    </span>
                    <span className="text-sm font-bold">
                      - ${" "}
                      {stay.price_override[0].discount_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-right text-gray-400 italic border-b border-gray-100 pb-2">
                    Autorizado por:{" "}
                    {stay.price_override[0].employee?.first_name}{" "}
                    {stay.price_override[0].employee?.last_name}
                  </div>
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">
                  $ {(stay.total_price - stay.iva_amount).toLocaleString()}
                </span>
              </div>
              {stay.extra_mattress_count > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Colchonetas ({stay.extra_mattress_count})
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    $ {stay.extra_mattress_price.toLocaleString()}
                  </span>
                </div>
              )}
              {stay.is_invoice_requested && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">IVA (19%)</span>
                  <span className="text-sm font-medium text-gray-900">
                    $ {stay.iva_amount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900 uppercase">
                    Total Orden
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    $ {stay.total_price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Pagos Realizados
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    - $ {totalPaymentsVerified.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span
                    className={`text-sm font-medium uppercase flex items-center gap-2 ${pendingAmount > 0 ? "text-red-600" : "text-green-600"}`}
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
                <p className="text-blue-600 font-medium">
                  Se requiere factura electrónica
                </p>
              </div>
            )}

            {stay.payment_method && (
              <p className="text-xs text-gray-500 text-right mt-3 uppercase">
                Método de pago: {stay.payment_method.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Conceptos Detallada */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-500 mt-[24px]">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <i className="pi pi-file-text text-gray-600"></i>
          Detalle de Servicios
        </h3>
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Concepto
                </th>
                <th className="py-2 px-3 text-center text-xs font-medium text-gray-600 uppercase">
                  Cant.
                </th>
                <th className="py-2 px-3 text-right text-xs font-medium text-gray-600 uppercase">
                  Unit.
                </th>
                <th className="py-2 px-3 text-right text-xs font-medium text-gray-600 uppercase">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 px-3">
                  <p className="font-medium text-sm text-gray-900">
                    Servicio de Hospedaje
                  </p>
                  <p className="text-xs text-gray-500">{stay.room?.category}</p>
                </td>
                <td className="py-2 px-3 text-center text-sm text-gray-700">
                  {nights}
                </td>
                <td className="py-2 px-3 text-right text-sm text-gray-700">
                  ${calculatePricePerNight().toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right font-medium text-sm text-gray-900">
                  ${(calculatePricePerNight() * nights).toLocaleString()}
                </td>
              </tr>
              {stay.has_extra_mattress && stay.extra_mattress_count > 0 && (
                <tr>
                  <td className="py-2 px-3">
                    <p className="font-medium text-sm text-gray-900">
                      Colchoneta Adicional
                    </p>
                    <p className="text-xs text-gray-500">
                      Servicio extra por noche
                    </p>
                  </td>
                  <td className="py-2 px-3 text-center text-sm text-gray-700">
                    {stay.extra_mattress_count}
                  </td>
                  <td className="py-2 px-3 text-right text-sm text-gray-700">
                    $
                    {(
                      stay.extra_mattress_price / stay.extra_mattress_count
                    ).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-sm text-gray-900">
                    ${stay.extra_mattress_price.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección Inferior - Detalle de Servicios y Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        {/* Pagos y Observaciones */}
        <div className="space-y-6">
          {/* Tabla de Pagos/Abonos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <i className="pi pi-history text-gray-600"></i>
              Historial de Pagos
            </h3>
            <PaymentHistoryTable payments={payments} />
          </div>

          {/* Información Adicional */}
          {stay && stay.person_count > 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <i className="pi pi-users text-gray-600"></i>
                Resumen Ocupación
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border border-gray-100">
                  <i className="pi pi-user text-emerald-600 text-2xl mb-2"></i>
                  <span className="text-xs text-gray-500 uppercase block">
                    Personas
                  </span>
                  <p className="text-xl font-bold text-gray-900">
                    {stay.person_count}
                  </p>
                </div>
                <div className="text-center p-3 border border-gray-100">
                  <i className="pi pi-calendar text-emerald-600 text-2xl mb-2"></i>
                  <span className="text-xs text-gray-500 uppercase block">
                    Noches
                  </span>
                  <p className="text-xl font-bold text-gray-900">{nights}</p>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {stay && stay.observation && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <i className="pi pi-comment text-gray-600"></i>
                Observaciones
              </h3>
              <div className="flex items-start gap-3">
                <i className="pi pi-info-circle text-amber-600 mt-1"></i>
                <p className="text-sm text-gray-700 italic">
                  "{stay.observation}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer de Factura */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <i className="pi pi-heart-fill text-red-500"></i>
          <p className="text-sm text-gray-600 font-medium">
            Gracias por elegir Hotel Colina Campestre
          </p>
        </div>
        <p className="text-xs text-gray-500">
          Documento de control interno. Generado el{" "}
          {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
