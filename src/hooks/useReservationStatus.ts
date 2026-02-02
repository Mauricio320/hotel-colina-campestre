import { Stay } from '@/types';

interface ReservationPaymentStatus {
  isFullyPaid: boolean;
  pendingAmount: number;
  canCheckIn: boolean;
  needsPayment: boolean;
}

export const useReservationStatus = () => {
  const getPaymentStatus = (stay: Stay | null): ReservationPaymentStatus => {
    if (!stay) {
      return {
        isFullyPaid: false,
        pendingAmount: 0,
        canCheckIn: false,
        needsPayment: false,
      };
    }

    const isFullyPaid = (stay.paid_amount || 0) >= (stay.total_price || 0);
    const pendingAmount = (stay.total_price || 0) - (stay.paid_amount || 0);

    return {
      isFullyPaid,
      pendingAmount,
      canCheckIn: isFullyPaid,
      needsPayment: !isFullyPaid,
    };
  };

  const getPendingAmount = (stay: Stay | null): number => {
    if (!stay) return 0;
    return stay.total_price - stay.paid_amount;
  };

  return {
    getPaymentStatus,
    getPendingAmount,
  };
};