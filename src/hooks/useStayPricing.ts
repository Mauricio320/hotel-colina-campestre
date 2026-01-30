import { useMemo } from 'react';
import { Room } from '@/types';

export interface StayPricingParams {
  room: Room | null;
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

export const useStayPricing = (params: StayPricingParams): StayPricingReturn => {
  const {
    room,
    checkInDate,
    checkOutDate,
    personCount,
    extraMattressCount,
    invoiceRequested,
    settings
  } = params;

  // Calculate number of nights
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const diff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkInDate, checkOutDate]);

  // Calculate pricing information
  const priceInfo = useMemo(() => {
    if (!room) {
      return { rate: 0, subtotalHospedaje: 0, subtotal: 0, iva: 0, total: 0 };
    }

    const roomRates = room.rates || [];
    const rateObj = roomRates
      .filter((r) => r.person_count <= personCount)
      .sort((a, b) => b.person_count - a.person_count)[0];

    const rate = rateObj?.rate || (room.category === 'Hotel' ? 80000 : 90000);
    const subtotalHospedaje = rate * nights;
    let subtotal = subtotalHospedaje;

    // Add extra mattress cost
    if (extraMattressCount > 0) {
      subtotal += settings.mat * extraMattressCount * nights;
    }

    // Calculate IVA if invoice is requested
    let iva = 0;
    if (invoiceRequested) {
      iva = Math.round(subtotal * (settings.iva / 100));
    }

    const total = subtotal + iva;

    return { rate, subtotalHospedaje, subtotal, iva, total };
  }, [
    room,
    personCount,
    nights,
    extraMattressCount,
    invoiceRequested,
    settings
  ]);

  return { nights, priceInfo };
};