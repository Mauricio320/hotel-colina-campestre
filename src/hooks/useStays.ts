import { supabase } from "@/config/supabase";
import {
  CreatePayment,
  paymentApi,
  paymentHelpers,
} from "@/services/payment/paymentApi";
import { CreatePriceOverrides } from "@/services/price-overrides/priceOverridesApi";
import { CreateRoomHistory } from "@/services/room-history/roomHistoryApi";
import { StayCreateService } from "@/services/stays/staysApi";
import {
  CreatePaymentDto,
  Payment,
  PaymentType,
  PriceOverride,
  Stay,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStays = () => {
  const queryClient = useQueryClient();

  const staysQuery = useQuery({
    queryKey: ["stays"],
    queryFn: async ({ signal }) => {
      try {
        const { data, error } = await supabase
          .from("stays")
          .select("*, room:rooms(*), guest:guests(*)")
          .abortSignal(signal) // Vinculamos la señal de aborto de React Query
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Stay[];
      } catch (e: any) {
        // Captura silenciosa del error de aborto para evitar que la UI se bloquee
        if (e.name === "AbortError" || e.message?.includes("aborted")) {
          console.debug("Stays fetch aborted by system");
          return [];
        }
        throw e;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  const createStay = useMutation({
    mutationFn: async (stayData: any) => {
      const { data: availableStatus } = await supabase
        .from("room_statuses")
        .select("id")
        .eq("name", "Disponible")
        .single();
      const todayStr = new Date().toLocaleDateString("sv-SE");

      const { data: currentStay } = await supabase
        .from("stays")
        .select("id")
        .eq("room_id", stayData.room_id)
        .eq("status", "Active")
        .lte("check_in_date", todayStr)
        .gte("check_out_date", todayStr)
        .maybeSingle();

      const { data: roomBefore } = await supabase
        .from("rooms")
        .select("status_id")
        .eq("id", stayData.room_id)
        .single();
      const effectivePrevStatusId = currentStay
        ? roomBefore?.status_id
        : availableStatus?.id || roomBefore?.status_id;

      const stay = { id: 0 };

      const statusName = stayData.status === "Active" ? "Ocupado" : "Reservado";
      const { data: statusData } = await supabase
        .from("room_statuses")
        .select("id")
        .eq("name", statusName)
        .single();

      if (statusData) {
        if (
          stayData.check_in_date === todayStr ||
          stayData.status === "Active"
        ) {
          await supabase
            .from("rooms")
            .update({
              status_id: statusData.id,
              status_date: todayStr,
            })
            .eq("id", stayData.room_id);
        }

        await supabase.from("room_history").insert({
          room_id: stayData.room_id,
          stay_id: stay.id,
          previous_status_id: effectivePrevStatusId,
          new_status_id: statusData.id,
          employee_id: stayData.employee_id,
          action_type: stayData.status === "Active" ? "CHECK-IN" : "RESERVA",
          observation:
            stayData.observation ||
            `Registro de ${statusName} desde Calendario`,
        });
      }

      return stay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  const registerPayment = useMutation({
    mutationFn: async ({
      stayId,
      amount,
      paymentMethodId,
      employeeId,
      roomId,
      customObservation,
      status_id,
    }: {
      stayId: string;
      amount: number;
      paymentMethodId: string;
      employeeId?: string;
      roomId?: string;
      customObservation?: string;
      status_id?: string;
    }) => {
      const { data: stay, error: fetchErr } = await supabase
        .from("stays")
        .select("*, room:rooms(*)")
        .eq("id", stayId)
        .single();

      if (fetchErr || !stay)
        throw new Error("No se pudo encontrar la estancia");

      const todayStr = new Date().toLocaleDateString("sv-SE");
      const totalPrice = stay.total_price || 0;
      const checkInDate = new Date(stay.check_in_date);

      const paymentType = paymentHelpers.determinePaymentType(
        amount,
        totalPrice,
        "calendar_payment",
        checkInDate,
      );

      const observation =
        customObservation ||
        paymentHelpers.generateObservation(paymentType, amount, totalPrice);

      const paymentData: CreatePaymentDto = {
        stay_id: stayId,
        payment_method_id: paymentMethodId,
        employee_id: employeeId || "",
        amount,
        payment_type: paymentType,
        observation,
      };

      await paymentApi.createPayment(paymentData);

      const currentPaidAmount = await paymentApi.getStayPaymentSummary(stayId);
      const newPaidAmount = currentPaidAmount.totalPaid + amount;
      const pending = totalPrice - newPaidAmount;
      const isFullyPaid = pending <= 0;

      const { error: updateStayErr } = await supabase
        .from("stays")
        .update({
          paid_amount: newPaidAmount,
          status:
            isFullyPaid && stay.check_in_date <= todayStr
              ? "Active"
              : stay.status,
        })
        .eq("id", stayId);

      if (updateStayErr) throw updateStayErr;

      if (roomId && employeeId) {
        const { data: currentRoomStatus } = await supabase
          .from("rooms")
          .select("status_id")
          .eq("id", roomId)
          .single();

        const { data: reservedStatus } = await supabase
          .from("room_statuses")
          .select("id")
          .eq("name", "Reserved")
          .single();

        const { data: occupiedStatus } = await supabase
          .from("room_statuses")
          .select("id")
          .eq("name", "Ocupado")
          .single();

        await supabase.from("room_history").insert({
          room_id: roomId,
          stay_id: stayId,
          previous_status_id:
            status_id || currentRoomStatus?.status_id || reservedStatus?.id,
          new_status_id:
            status_id || currentRoomStatus?.status_id || reservedStatus?.id, // Keep same status after payment
          employee_id: employeeId,
          action_type:
            paymentType === PaymentType.ABONO_RESERVA
              ? "ABONO-RESERVA"
              : "PAGO-COMPLETO-RESERVA",
          observation:
            observation ||
            `${paymentType}: ${amount.toLocaleString()} de ${totalPrice.toLocaleString()}`,
        });
      }

      return {
        isFullyPaid,
        paymentType,
        newPaidAmount,
        pendingAmount: pending,
      };
    },
    onSuccess: (data, variables) => {
      // Invalidate all related queries
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
    mutationFn: async ({
      stayId,
      employeeId,
      roomId,
      previous_status_id,
    }: {
      stayId: string;
      employeeId?: string;
      roomId: string;
      previous_status_id: string;
    }) => {
      await supabase
        .from("stays")
        .update({
          status: "Active",
        })
        .eq("id", stayId);

      const { data: occupiedStatus } = await supabase
        .from("room_statuses")
        .select("id")
        .eq("name", "Ocupado")
        .single();

      await supabase.from("room_history").insert({
        observation: `Check-in de reserva realizado`,
        previous_status_id: previous_status_id,
        new_status_id: occupiedStatus?.id,
        action_type: "RESERVA CHECK IN",
        employee_id: employeeId,
        room_id: roomId,
        stay_id: stayId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  // Create stay with integrated payment system
  const createStayWithPayment = useMutation({
    mutationFn: async (data: {
      stayData: any;
      paymentData: {
        amount: number;
        payment_method_id: string;
        employee_id?: string;
        context?: "reservation" | "checkin_direct";
        customObservation?: string;
      };
    }) => {
      try {
        const paymentType = paymentHelpers.determinePaymentType(
          data.paymentData.amount,
          data.stayData.total_price || 0,
          data.paymentData.context || "reservation",
          data.stayData.check_in_date
            ? new Date(data.stayData.check_in_date)
            : undefined,
        );

        const observation =
          data.paymentData.customObservation ||
          paymentHelpers.generateObservation(
            paymentType,
            data.paymentData.amount,
            data.stayData.total_price || 0,
          );
        const statusName =
          data.stayData.status === "Active" ? "Ocupado" : "Reservado";
        const { data: statusData } = await supabase
          .from("room_statuses")
          .select("id")
          .eq("name", statusName)
          .single();

        const { data: stay, error: stayError } = await supabase
          .from("stays")
          .insert({
            ...data.stayData,
            room_status_id: statusData?.id,
          })
          .select()
          .single();

        if (stayError) throw stayError;

        const paymentData: CreatePaymentDto = {
          stay_id: stay.id,
          payment_method_id: data.paymentData.payment_method_id,
          employee_id: data.paymentData.employee_id || "",
          amount: data.paymentData.amount,
          payment_type: paymentType,
          observation,
        };

        await paymentApi.createPayment(paymentData);

        const todayStr = new Date().toLocaleDateString("sv-SE");
        const isRoomStay = !!data.stayData.room_id;
        const accommodationId =
          data.stayData.room_id || data.stayData.accommodation_type_id;

        if (statusData && accommodationId) {
          if (isRoomStay) {
            const shouldUpdateRoomStatus =
              data.stayData.check_in_date === todayStr ||
              data.stayData.status === "Active";

            if (shouldUpdateRoomStatus) {
              await supabase
                .from("rooms")
                .update({
                  status_id: statusData.id,
                  status_date: todayStr,
                })
                .eq("id", accommodationId);
            }
          }

          const { data: availableStatus } = await supabase
            .from("room_statuses")
            .select("id")
            .eq("name", "Disponible")
            .single();

          let previousStatusId = availableStatus?.id;
          if (isRoomStay) {
            const { data: currentRoomStatus } = await supabase
              .from("rooms")
              .select("status_id")
              .eq("id", accommodationId)
              .single();
            if (currentRoomStatus)
              previousStatusId = currentRoomStatus.status_id;
          }

          await supabase.from("room_history").insert({
            room_id: isRoomStay ? accommodationId : null,
            accommodation_type_id: isRoomStay ? null : accommodationId,
            stay_id: stay.id,
            previous_status_id: previousStatusId,
            new_status_id: statusData.id,
            employee_id: data.paymentData.employee_id,
            action_type:
              paymentType === PaymentType.PAGO_CHECKIN_DIRECTO
                ? "CHECK-IN"
                : "RESERVA",
            observation: observation || `Registro de ${statusName} con pago`,
          });
        }

        return { stay, paymentType };
      } catch (error) {
        console.error("Error in createStayWithPayment:", error);
        throw error;
      }
    },
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

  return {
    staysQuery,
    createStay,
    createStayWithPayment,
    registerPayment,
    registerCheckInReserva,
  };
};

const createStay = async ({
  new_status_id,
  staySet,
}: {
  staySet: Stay;
  new_status_id: string;
}) => {
  staySet.room_status_id = new_status_id;
  return StayCreateService(staySet);
};

export interface CreateOnStayWithPaymentParams {
  price_overrides?: { save: boolean } & PriceOverride;
  room_status_current_id: string;
  new_status_id: string;
  payment: Payment;
  stay: Stay;
  keyId:
    | {
        accommodation_type_id: string;
        room_id?: undefined;
      }
    | {
        room_id: string;
        accommodation_type_id?: undefined;
      };
}

export const useCreateOnStayWithPayment = async ({
  room_status_current_id,
  price_overrides,
  new_status_id,
  payment,
  keyId,
  stay,
}: CreateOnStayWithPaymentParams) => {
  const { data: stayData } = await createStay({
    staySet: { ...stay, ...keyId },
    new_status_id,
  });

  await CreatePayment({
    stay_id: stayData?.id,
    ...payment,
  });

  await CreateRoomHistory({
    ...keyId,
    stay_id: stayData?.id,
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
      stay_id: stayData?.id,
    });
  }

  return stayData;
};

// Ejemplo en JavaScript con Supabase client
export const CheckAvailability = async (
  accommodationTypeId: string,
  checkInDate: string,
  checkOutDate: string,
) => {
  // Buscar stays que tengan directamente el accommodation_type_id
  const { data: directStays, error: error1 } = await supabase
    .from("stays")
    .select(
      "id,check_in_date, check_out_date, order_number, accommodation_types!inner(name)",
    )
    .eq("active", true)
    .eq("accommodation_type_id", accommodationTypeId)
    .gte("check_out_date", checkInDate)
    .lte("check_in_date", checkOutDate);

  // Buscar stays cuya room tenga ese accommodation_type_id
  const { data: roomStays, error: error2 } = await supabase
    .from("stays")
    .select(
      `
      id,check_in_date, check_out_date, order_number,
      rooms!inner(
      room_number,
      accommodation_type_id
      )
    `,
    )
    .eq("active", true)
    .eq("rooms.accommodation_type_id", accommodationTypeId)
    .gte("check_out_date", checkInDate)
    .lte("check_in_date", checkOutDate);

  if (error1 || error2) {
    return { data: null, error: error1 || error2 };
  }

  // Combinar y eliminar duplicados
  const allStays = [...(directStays || []), ...(roomStays || [])];
  const uniqueStays = Array.from(
    new Map(allStays.map((stay) => [stay.id, stay])).values(),
  );

  return { data: uniqueStays, error: null };
};

export const UpdateStay = async ({
  id,
  ...updates
}: { id: string } & Partial<Stay>) => {
  const { data, error } = await supabase
    .from("stays")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

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
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_stays_paginated", {
        p_accommodation_type_id: accommodation_type_id,
        p_page: page,
        p_page_size: pageSize,
        p_order_number: orderNumber,
        p_doc_number: docNumber,
        p_is_reservation: isReservation,
      });

      if (error) throw error;

      const result = data as { data: any[]; count: number };
      return { data: result.data || [], count: result.count || 0 };
    },
    enabled: !!accommodation_type_id,
  });
};
