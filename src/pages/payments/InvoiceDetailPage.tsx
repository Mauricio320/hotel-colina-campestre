import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { supabase } from "@/config/supabase";
import { Stay, Payment } from "@/types";
import { usePayments } from "@/hooks/usePayments";

const InvoiceDetailPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stay, setStay] = useState<any | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { getPaymentsByStay } = usePayments();

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
            payment_method:payment_methods(name)
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

  const getPaymentTypeDisplay = (type: string) => {
    switch (type) {
      case "ABONO_RESERVA":
        return "Abono Parcial";
      case "PAGO_COMPLETO_RESERVA":
        return "Pago Completo";
      case "PAGO_CHECKIN_DIRECTO":
        return "Pago Check-in Directo";
      case "ANTICIPADO_COMPLETO":
        return "Pago Anticipado";
      default:
        return type;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "ABONO_RESERVA":
        return "bg-blue-50 text-blue-700";
      case "PAGO_COMPLETO_RESERVA":
        return "bg-green-50 text-green-700";
      case "PAGO_CHECKIN_DIRECTO":
        return "bg-emerald-50 text-emerald-700";
      case "ANTICIPADO_COMPLETO":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  // Calcular totales de pagos
  const totalPaymentsVerified =
    payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
  const pendingAmount = (stay?.total_price || 0) - totalPaymentsVerified;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ProgressSpinner className="w-12 h-12 mb-4" strokeWidth="4" />
          <p className="text-gray-600 font-medium">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error || !stay) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
            <i className="pi pi-exclamation-triangle text-red-600 text-4xl mb-3"></i>
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Error al cargar factura
            </h2>
            <p className="text-red-600">
              {error || "No se encontró la información de la reserva."}
            </p>
          </div>
          <Button
            label="Volver a Pagos"
            icon="pi pi-arrow-left"
            onClick={() => navigate("/room-payments")}
            className="p-button-outlined"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in print:p-4 print:bg-white">
      {/* Header de Navegación Mejorado */}
      <div className="flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-4">
          <Button
            icon="pi pi-arrow-left"
            onClick={() => navigate("/room-payments")}
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
        <div className="flex gap-2">
          <Button
            label="Imprimir Factura"
            icon="pi pi-print"
            className="bg-emerald-600 text-white font-bold"
            onClick={() => window.print()}
          />
          <Button
            label="Ir a Pagos"
            icon="pi pi-money-bill"
            className="bg-blue-600 text-white font-bold"
            onClick={() => navigate("/room-payments")}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-4">
        {/* Header Profesional de Factura */}
        <div className="border-b border-gray-300 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className="pi pi-building text-2xl text-gray-600"></i>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Hotel Colina Campestre
                </h1>
                <p className="text-sm text-gray-600">NIT: 123.456.789-0</p>
                <p className="text-sm text-gray-600">
                  Sector Campestre, La Ceja - Antioquia
                </p>
                <p className="text-sm text-gray-600">Tel: +57 300 123 4567</p>
              </div>
            </div>
            <div className="text-right">
              <div className="border border-gray-300 px-4 py-2 rounded">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Factura
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  #{stay?.order_number || "N/A"}
                </p>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <p>
                  Fecha:{" "}
                  {new Date(
                    stay?.created_at || new Date(),
                  ).toLocaleDateString()}
                </p>
                <p>Hora: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="mb-8">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i className="pi pi-user text-gray-600"></i>
              Datos del Cliente
            </h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Nombre Completo
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {stay.guest?.first_name} {stay.guest?.last_name}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Identificación
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {stay.guest?.doc_type}: {stay.guest?.doc_number}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Contacto Principal
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {stay.guest?.phone || "No especificado"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Correo Electrónico
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {stay.guest?.email || "No especificado"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Dirección Completa
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {stay.guest?.address || "No especificada"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Ciudad
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {stay.guest?.city || "No especificada"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadía */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <i className="pi pi-calendar text-gray-600"></i> Detalles de Reserva
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase block">
                Entrada
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {stay.check_in_date}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase block">
                Salida
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {stay.check_out_date}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase block">
                Habitación
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {stay.room?.room_number}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase block">
                Noches
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {nights} {nights > 1 ? "noches" : "noche"}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase block">
                Personas
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {stay.person_count || "No especificado"}
              </span>
            </div>
            {stay.extra_mattress_count > 0 && (
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase block">
                  Colchonetas
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {stay.extra_mattress_count}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Conceptos Detallada */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="pi pi-file-text text-gray-600"></i>
            Detalle de Servicios
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">
                    Concepto
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase">
                    Cant.
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 uppercase">
                    Valor Unit.
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 uppercase">
                    Días
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 uppercase">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      Servicio de Hospedaje
                    </p>
                    <p className="text-xs text-gray-500">
                      {stay.room?.category}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {nights}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    ${calculatePricePerNight().toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {nights}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    ${(calculatePricePerNight() * nights).toLocaleString()}
                  </td>
                </tr>
                {stay.has_extra_mattress && stay.extra_mattress_count > 0 && (
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        Colchoneta Adicional
                      </p>
                      <p className="text-xs text-gray-500">
                        Servicio extra por noche
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {stay.extra_mattress_count}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      $
                      {(
                        stay.extra_mattress_price / stay.extra_mattress_count
                      ).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {nights}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      ${stay.extra_mattress_price.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="flex justify-end mb-12">
          <div className="w-full max-w-sm border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">
                $ {(stay.total_price - stay.iva_amount).toLocaleString()}
              </span>
            </div>
            {stay.extra_mattress_count > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">
                  Colchonetas Adicionales ({stay.extra_mattress_count})
                </span>
                <span className="text-sm font-medium text-gray-900">
                  $ {stay.extra_mattress_price.toLocaleString()}
                </span>
              </div>
            )}
            {stay.is_invoice_requested && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">IVA (19%)</span>
                <span className="text-sm font-medium text-gray-900">
                  $ {stay.iva_amount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900 uppercase">
                  Total Orden
                </span>
                <span className="text-lg font-bold text-gray-900">
                  $ {stay.total_price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4 mt-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">
                  Abonos / Pagos Realizados
                </span>
                <span className="text-sm font-medium text-red-600">
                  - $ {totalPaymentsVerified.toLocaleString()}
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 rounded ${pendingAmount > 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
              >
                <span className="text-sm font-medium uppercase">
                  Saldo Pendiente
                </span>
                <span className="text-lg font-bold">
                  $ {pendingAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {stay.is_invoice_requested && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 font-medium flex items-center gap-2">
                  <i className="pi pi-file-text text-sm"></i>
                  Se requiere factura electrónica
                </p>
              </div>
            )}

            {stay.payment_method && (
              <p className="text-xs text-gray-500 text-right mt-2 uppercase">
                Medio de pago principal: {stay.payment_method.name}
              </p>
            )}
          </div>
        </div>

        {/* Tabla de Pagos/Abonos */}
        {payments && payments.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="pi pi-money-bill text-gray-600"></i>
              Historial de Pagos y Abonos
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">
                      Fecha y Hora
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">
                      Método de Pago
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 uppercase">
                      Monto
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase">
                      Tipo
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">
                      Registrado por
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">
                      Observación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {new Date(
                              payment.payment_date,
                            ).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(
                              payment.payment_date,
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {payment.payment_method?.name || "No especificado"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          $ {Number(payment.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${getPaymentTypeColor(payment.payment_type)}`}
                        >
                          {getPaymentTypeDisplay(payment.payment_type)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {payment.employee?.first_name}{" "}
                          {payment.employee?.last_name || "Sistema"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 italic">
                          {payment.observation || "Sin observación"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Información Adicional */}
        {stay && stay.person_count > 1 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <span className="text-xs font-medium text-gray-600 uppercase block mb-3">
              Ocupación
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Personas Totales</span>
                <p className="text-xl font-semibold text-gray-900">
                  {stay.person_count}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Noches</span>
                <p className="text-xl font-semibold text-gray-900">{nights}</p>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones */}
        {stay && stay.observation && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <span className="text-xs font-medium text-gray-600 uppercase block mb-2">
              Observaciones
            </span>
            <p className="text-sm text-gray-700 italic">"{stay.observation}"</p>
          </div>
        )}

        {/* Footer de Factura */}
        <div className="text-center border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-600 uppercase">
            Gracias por elegir Hotel Colina Campestre
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Documento de control interno. Generado el{" "}
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
