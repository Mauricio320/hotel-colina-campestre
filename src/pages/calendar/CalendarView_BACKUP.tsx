// Respaldo de 15 intentos para crear archivo nuevo limpio

# SECCIÓN ELIMINADA - Variables principales
  const [formObservation, setFormObservation] = useState<string>("");
  const [paymentObservation, setPaymentObservation] = useState(""); // Para abonos
  const [showObservationModal, setShowObservationModal] = useState(false); // Modal secundaria
  const [isFullPaymentFlow, setIsFullPaymentFlow] = useState(false);

# SECCIÓN 2 - Funciones principales
  // Función para evaluar el estado de pago
  const getReservationPaymentStatus = (stay: Stay | null) => {
    if (!stay) return { isFullyPaid: false, pendingAmount: 0, canCheckIn: false, needsPayment: false };
    
    const isFullyPaid = (stay.paid_amount || 0) >= (stay.total_price || 0);
    const pendingAmount = (stay.total_price || 0) - (stay.paid_amount || 0);
    
    return {
      isFullyPaid,
      pendingAmount,
      canCheckIn: isFullyPaid,
      needsPayment: !isFullyPaid
    };
  };

  // Función para obtener texto del botón dinámico
  const getPaymentButtonText = () => {
    const paymentStatus = getReservationPaymentStatus(activeStay);
    return paymentStatus.isFullyPaid ? "Check-in" : "Confirmar Abono";
  };

  // Función para obtener observación por defecto según el estado del pago
  const getPaymentDefaultObservation = () => {
    const isFullyPaid = activeStay 
      ? (activeStay.paid_amount || 0) >= (activeStay.total_price || 0)
      : false;
    
    return isFullyPaid ? 
      "Abono completo sin observación" : 
      "Abono parcial sin observación";
  };

  const pendingAmount = activeStay
    ? activeStay.total_price - activeStay.paid_amount
    : 0;

  // Validar que paymentMethodId sea válido
  const isPaymentMethodValid = paymentMethods.some(
    (pm) => pm.id === paymentMethodId,
  );