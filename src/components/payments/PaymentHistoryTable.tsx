import React from "react";
import { Payment } from "@/types";

interface PaymentHistoryTableProps {
  payments: Payment[];
  variant?: "table" | "compact";
}

const getPaymentTypeDisplay = (type: string) => {
  switch (type) {
    case "ABONO_RESERVA":
      return "Abono";
    case "PAGO_COMPLETO_RESERVA":
      return "Completo";
    case "PAGO_CHECKIN_DIRECTO":
      return "Check-in";
    case "ANTICIPADO_COMPLETO":
      return "Anticipado";
    default:
      return type;
  }
};

const getPaymentTypeColor = (type: string) => {
  switch (type) {
    case "ABONO_RESERVA":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "PAGO_COMPLETO_RESERVA":
      return "bg-green-100 text-green-700 border-green-200";
    case "PAGO_CHECKIN_DIRECTO":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "ANTICIPADO_COMPLETO":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const CompactPaymentCard: React.FC<{ payment: Payment }> = ({ payment }) => {
  const typeColor = getPaymentTypeColor(payment.payment_type);
  const employeeName = payment.employee?.first_name
    ? `${payment.employee.first_name} ${payment.employee.last_name || ""}`.trim()
    : "Sistema";

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-2 py-1 ${typeColor} transition-all hover:shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wide uppercase">
            {getPaymentTypeDisplay(payment.payment_type)}
          </span>
          <span className="text-[10px] opacity-70">
            {new Date(payment.payment_date).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
            })}{" "}
            • {payment.payment_method?.name || "N/A"} • {employeeName}
          </span>
        </div>
      </div>
      <span className="text-sm font-black">$ {Number(payment.amount).toLocaleString()}</span>
    </div>
  );
};

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  variant = "table",
}) => {
  if (!payments || payments.length === 0) {
    return null;
  }

  // Versión compacta con cards
  if (variant === "compact") {
    return (
      <div className="flex flex-col gap-2">
        <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
          <i className="pi pi-money-bill text-xs"></i>
          Pagos Registrados ({payments.length})
        </h4>
        <div className="flex flex-col gap-2">
          {payments.map((payment) => (
            <CompactPaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      </div>
    );
  }

  // Versión tabla (por defecto)
  return (
    <div className="mb-12">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <i className="pi pi-money-bill text-gray-600"></i>
        Historial de Pagos y Abonos
      </h3>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Fecha y Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Método de Pago
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                Monto
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Registrado por
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Observación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(payment.payment_date).toLocaleTimeString()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">
                    {payment.payment_method?.name || "No especificado"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {Number(payment.amount).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${getPaymentTypeColor(payment.payment_type)}`}
                  >
                    {getPaymentTypeDisplay(payment.payment_type)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">
                    {payment.employee?.first_name} {payment.employee?.last_name || "Sistema"}
                  </span>
                </td>
                <td className="px-4 py-3">
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
  );
};

export default PaymentHistoryTable;
