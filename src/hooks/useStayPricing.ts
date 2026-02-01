import { useMemo } from "react";
import { AccommodationType, Room } from "@/types";

export interface StayPricingParams {
  room: Room | AccommodationType;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  personCount: number;
  extraMattressCount: number;
  invoiceRequested: boolean;
  settings: {
    iva: number;
    mat: number;
  };
}

export interface StayPricingReturn {
  nights: number;
  priceInfo: {
    rate: number;
    subtotalHospedaje: number;
    subtotal: number;
    iva: number;
    total: number;
  };
}

export const useStayPricing = (
  params: StayPricingParams,
): StayPricingReturn => {
  const {
    room,
    checkInDate,
    checkOutDate,
    personCount,
    extraMattressCount,
    invoiceRequested,
    settings,
  } = params;

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    return Math.max(1, Math.ceil(timeDifference / millisecondsPerDay));
  }, [checkInDate, checkOutDate]);

  const priceInfo = useMemo(() => {
    if (!room) {
      return { rate: 0, subtotalHospedaje: 0, subtotal: 0, iva: 0, total: 0 };
    }

    let dailyRate: number;

    if ("room_number" in room) {
      const roomRates = room.rates || [];
      const applicableRate = roomRates
        .filter((rate) => rate.person_count <= personCount)
        .sort((a, b) => b.person_count - a.person_count)[0];

      const defaultBaseRate = room.category === "Hotel" ? 80000 : 90000;
      dailyRate = applicableRate?.rate || defaultBaseRate;
    } else {
      dailyRate = (room as AccommodationType).price || 0;
    }

    const accommodationSubtotal = dailyRate * nights;
    let totalBeforeTax = accommodationSubtotal;

    if (extraMattressCount > 0) {
      const mattressTotalCost = settings.mat * extraMattressCount * nights;
      totalBeforeTax += mattressTotalCost;
    }

    let taxAmount = 0;
    if (invoiceRequested) {
      taxAmount = Math.round(totalBeforeTax * (settings.iva / 100));
    }

    const finalTotal = totalBeforeTax + taxAmount;

    return {
      rate: dailyRate,
      subtotalHospedaje: accommodationSubtotal,
      subtotal: totalBeforeTax,
      iva: taxAmount,
      total: finalTotal,
    };
  }, [
    room,
    personCount,
    nights,
    extraMattressCount,
    invoiceRequested,
    settings,
  ]);

  return { nights, priceInfo };
};
