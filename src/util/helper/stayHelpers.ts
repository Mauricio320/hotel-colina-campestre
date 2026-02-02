interface ObservationParams {
  isCheckIn: boolean;
  paidAmount: number;
  totalAmount: number;
  discountAmount: number;
  authorizedBy?: { first_name: string; last_name: string } | null;
}

/**
 * Generates a descriptive observation string for a stay based on its status and payment details.
 * Optimized for both check-ins and reservations.
 */
export const generateStayObservation = ({
  isCheckIn,
  paidAmount,
  totalAmount,
  discountAmount,
  authorizedBy,
}: ObservationParams): string => {
  const actionLabel = isCheckIn ? "del ingreso" : "de la reserva";

  const getPaymentStatusSuffix = () => {
    if (paidAmount <= 0) return " (Pendiente de pago)";
    if (paidAmount >= totalAmount) return " (Saldado)";
    return " (Con anticipo)";
  };

  const statusSuffix = isCheckIn ? "" : getPaymentStatusSuffix();

  if (discountAmount > 0 && authorizedBy) {
    const authDetail = `autorizada por ${authorizedBy.first_name} ${authorizedBy.last_name}`;
    return `Tarifa preferencial ${actionLabel} ${authDetail}${statusSuffix}`;
  }

  if (isCheckIn) {
    return "Check-in realizado con éxito - Pago total recibido";
  }

  return `Reserva registrada${statusSuffix}`;
};
