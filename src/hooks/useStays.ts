import { CreatePayment, paymentApi, paymentHelpers } from "@/services/payment/paymentApi";
import { CreatePriceOverrides } from "@/services/price-overrides/priceOverridesApi";
import { CreateRoomHistory } from "@/services/room-history/roomHistoryApi";
import { StayCreateService, cancelStay, staysApi } from "@/services/stays/staysApi";
import { staysActionsApi } from "@/services/stays/staysActionsApi";
import { stayGuestsApi } from "@/services/stay-guests/stayGuestsApi";
import { Payment, PriceOverride, Stay } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStays = () => {
  const queryClient = useQueryClient();

  const staysQuery = useQuery({
    queryKey: ["stays"],
    queryFn: ({ signal }) => staysApi.fetchStays(signal),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: 1,
  });

  const createStay = useMutation({
    mutationFn: (stayData: Partial<Stay>) => staysApi.createStay(stayData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  const registerPayment = useMutation({
    mutationFn: staysActionsApi.registerPayment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({
        queryKey: ["payments", "summary", variables.stayId],
      });
    },
    onError: (error) => {
      console.error("Error in registerPayment:", error);
    },
  });

  const registerCheckInReserva = useMutation({
    mutationFn: staysActionsApi.registerCheckInReserva,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  // Create stay with integrated payment system
  const createStayWithPayment = useMutation({
    mutationFn: staysActionsApi.createStayWithPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      console.error("Error in createStayWithPayment:", error);
    },
  });

  const cancelStayMutation = useMutation({
    mutationFn: cancelStay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  return {
    staysQuery,
    createStay,
    createStayWithPayment,
    registerPayment,
    registerCheckInReserva,
    cancelStay: cancelStayMutation,
  };
};

const createStay = async ({ new_status_id, staySet }: { staySet: Stay; new_status_id: string }) => {
  staySet.room_status_id = new_status_id;
  return StayCreateService(staySet);
};

export interface CreateOnStayWithPaymentParams {
  price_overrides?: { save: boolean } & PriceOverride;
  room_status_current_id: string;
  new_status_id: string;
  payment: Payment;
  stay: Partial<Stay>;
  keyId:
    | {
        accommodation_type_id: string;
        room_id?: undefined;
      }
    | {
        room_id: string;
        accommodation_type_id?: undefined;
      };
  additionalGuestIds?: string[];
}

// Hook para crear stay con pago y actualización optimista
export const useCreateStayWithPaymentComplex = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      room_status_current_id,
      price_overrides,
      new_status_id,
      payment,
      keyId,
      stay,
      additionalGuestIds = [],
    }: CreateOnStayWithPaymentParams) => {
      // Llamada al servicio de creación
      const { data: stayData } = await StayCreateService({
        ...stay,
        ...keyId,
        room_status_id: new_status_id,
      } as Stay);

      if (!stayData?.id) {
        throw new Error("Error al crear la estadía");
      }

      // Crear pago
      await CreatePayment({
        stay_id: stayData.id,
        ...payment,
      });

      // Crear historial
      await CreateRoomHistory({
        ...keyId,
        stay_id: stayData.id,
        previous_status_id: room_status_current_id,
        new_status_id,
        employee_id: payment.employee_id,
        action_type: payment.payment_type,
        observation: payment.observation,
      });

      // Guardar price overrides si aplica
      if (price_overrides?.save) {
        const { save, ...priceData } = price_overrides;
        await CreatePriceOverrides({
          ...priceData,
          stay_id: stayData.id,
        });
      }

      // Agregar huéspedes adicionales
      if (additionalGuestIds.length > 0) {
        const stayGuests = additionalGuestIds.map((guestId) => ({
          guest_id: guestId,
          is_primary_guest: false,
        }));
        await stayGuestsApi.addMultipleGuests(stayData.id, stayGuests);
      }

      return stayData;
    },

    onMutate: async (variables) => {
      const { stay, keyId } = variables;

      await queryClient.cancelQueries({ queryKey: ["stays"] });
      await queryClient.cancelQueries({ queryKey: ["rooms"] });

      const previousStays = queryClient.getQueryData<Stay[]>(["stays"]);

      const tempStay: Stay = {
        id: `temp-${Date.now()}`,
        ...stay,
        ...keyId,
        created_at: new Date().toISOString(),
        active: stay.status === "Active",
        paid_amount: stay.paid_amount || 0,
        guest: null,
        room: null,
      } as Stay;

      queryClient.setQueryData<Stay[]>(["stays"], (old) => {
        if (!old) return [tempStay];
        return [tempStay, ...old];
      });

      return { previousStays, tempStayId: tempStay.id };
    },

    onSuccess: (newStay, _variables, context) => {
      queryClient.setQueryData<Stay[]>(["stays"], (old) => {
        if (!old) return [newStay];
        return old.map((stay) => (stay.id === context?.tempStayId ? newStay : stay));
      });
    },

    onError: (_err, _variables, context) => {
      if (context?.previousStays) {
        queryClient.setQueryData(["stays"], context.previousStays);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

// Función legacy (deprecada, usar useCreateStayWithPaymentComplex)
export const useCreateOnStayWithPayment = async ({
  room_status_current_id,
  price_overrides,
  new_status_id,
  payment,
  keyId,
  stay,
  additionalGuestIds = [],
}: CreateOnStayWithPaymentParams) => {
  const { data: stayData } = await StayCreateService({
    ...stay,
    ...keyId,
    room_status_id: new_status_id,
  } as Stay);

  if (!stayData?.id) {
    throw new Error("Error al crear la estadía");
  }

  await CreatePayment({
    stay_id: stayData.id,
    ...payment,
  });

  await CreateRoomHistory({
    ...keyId,
    stay_id: stayData.id,
    previous_status_id: room_status_current_id,
    new_status_id,
    employee_id: payment.employee_id,
    action_type: payment.payment_type,
    observation: payment.observation,
  });

  if (price_overrides?.save) {
    delete price_overrides.save;

    await CreatePriceOverrides({
      ...price_overrides,
      stay_id: stayData.id,
    });
  }

  if (additionalGuestIds.length > 0) {
    const stayGuests = additionalGuestIds.map((guestId) => ({
      guest_id: guestId,
      is_primary_guest: false,
    }));
    await stayGuestsApi.addMultipleGuests(stayData.id, stayGuests);
  }

  return stayData;
};

// Re-export desde servicios para mantener compatibilidad
export const CheckAvailability = staysApi.checkAvailability;

// Hook para actualizar stay con actualización optimista
export const useUpdateStay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Stay> }) =>
      staysActionsApi.updateStay(id, updates),

    // Actualización optimista: actualiza la cache inmediatamente
    onMutate: async ({ id, updates }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["stays"] });
      await queryClient.cancelQueries({ queryKey: ["stay", id] });

      // Guardar estado anterior
      const previousStays = queryClient.getQueryData<Stay[]>(["stays"]);
      const previousStay = queryClient.getQueryData<Stay>(["stay", id]);

      // Actualizar lista de stays
      queryClient.setQueryData<Stay[]>(["stays"], (old) => {
        if (!old) return old;
        return old.map((stay) => (stay.id === id ? { ...stay, ...updates } : stay));
      });

      // Actualizar stay individual
      queryClient.setQueryData<Stay>(["stay", id], (old) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      return { previousStays, previousStay };
    },

    // Revertir en caso de error
    onError: (_err, variables, context) => {
      if (context?.previousStays) {
        queryClient.setQueryData(["stays"], context.previousStays);
      }
      if (context?.previousStay) {
        queryClient.setQueryData(["stay", variables.id], context.previousStay);
      }
    },

    // Refetch al finalizar para consistencia
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["stay", variables.id] });
      // Invalidar todas las queries de rooms (incluyendo las del calendario con fechas)
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
        exact: false,
        refetchType: "active",
      });
    },
  });
};

// Re-export legado para compatibilidad (usar useUpdateStay en su lugar)
export const UpdateStay = staysActionsApi.updateStay;

export const useStaysByAccommodationType = ({
  accommodation_type_id,
  page = 0,
  pageSize = 10,
  orderNumber = "",
  docNumber = "",
  isReservation = null,
}: {
  accommodation_type_id: string;
  page?: number;
  pageSize?: number;
  orderNumber?: string;
  docNumber?: string;
  isReservation?: boolean | null;
}) => {
  return useQuery({
    queryKey: [
      "stays",
      "accommodation_type_id",
      accommodation_type_id,
      page,
      pageSize,
      orderNumber,
      docNumber,
      isReservation,
    ],
    queryFn: () =>
      staysApi.fetchStaysByAccommodationType({
        accommodation_type_id,
        page,
        pageSize,
        orderNumber,
        docNumber,
        isReservation,
      }),
    enabled: !!accommodation_type_id,
  });
};
