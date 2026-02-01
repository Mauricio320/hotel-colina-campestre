import { supabase } from "@/config/supabase";
import { paymentApi, paymentHelpers } from "@/services/payment/paymentApi";
import { CreatePaymentDto, PaymentType, Stay } from "@/types";
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
    refetchOnWindowFocus: false, // Evita cancelaciones accidentales al cambiar de ventana
    staleTime: 1000 * 60 * 2, // 2 minutos de validez
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

      const { data: stay, error: stayError } = await supabase
        .from("stays")
        .insert(stayData)
        .select()
        .single();
      if (stayError) throw stayError;

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
