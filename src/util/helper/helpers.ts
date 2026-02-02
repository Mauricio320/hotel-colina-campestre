import { Stay } from "@/types";

export const ObjectClone = <T>(myOriginal: T): T => {
  if (myOriginal) return JSON.parse(JSON.stringify(myOriginal)) as T;
  return myOriginal as T;
};

export const GetReservationPaymentStatus = (stay: Stay | null) => {
  if (!stay)
    return {
      isFullyPaid: false,
      pendingAmount: 0,
      canCheckIn: false,
      needsPayment: false,
    };

  const isFullyPaid = (stay.paid_amount || 0) >= (stay.total_price || 0);
  const pendingAmount = (stay.total_price || 0) - (stay.paid_amount || 0);

  return {
    isFullyPaid,
    pendingAmount,
    canCheckIn: isFullyPaid,
    needsPayment: !isFullyPaid,
  };
};
