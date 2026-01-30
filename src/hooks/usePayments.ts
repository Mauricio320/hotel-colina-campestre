import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi, paymentHelpers } from '@/services/payment/paymentApi';
import { 
  Payment, 
  CreatePaymentDto, 
  StayWithPaymentDto, 
  PaymentSummary, 
  PaymentType 
} from '@/types';

/**
 * Custom hook for payment management with React Query
 * Provides all payment operations with proper caching and invalidation
 */
export const usePayments = () => {
  const queryClient = useQueryClient();

  // Query for getting payments by stay ID
  const getPaymentsByStay = (stayId: string) => {
    return useQuery({
      queryKey: ['payments', 'stay', stayId],
      queryFn: () => paymentApi.getPaymentsByStay(stayId),
      enabled: !!stayId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Query for payment summary by stay ID
  const getPaymentSummary = (stayId: string) => {
    return useQuery({
      queryKey: ['payments', 'summary', stayId],
      queryFn: () => paymentApi.getStayPaymentSummary(stayId),
      enabled: !!stayId,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  };

  // Query for payments by date range
  const getPaymentsByDateRange = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ['payments', 'daterange', startDate, endDate],
      queryFn: () => paymentApi.getPaymentsByDateRange(startDate, endDate),
      enabled: !!(startDate && endDate),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  // Mutation for creating a single payment
  const createPaymentMutation = useMutation({
    mutationFn: (paymentData: CreatePaymentDto) => paymentApi.createPayment(paymentData),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'stay', variables.stay_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'summary', variables.stay_id] 
      });
      
      // Also invalidate stays since paid_amount might change
      queryClient.invalidateQueries({ queryKey: ['stays'] });
      
      // Invalidate rooms for status updates
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error) => {
      console.error('Error creating payment:', error);
    },
  });

  // Mutation for creating stay with payment
  const createStayWithPaymentMutation = useMutation({
    mutationFn: (data: StayWithPaymentDto) => paymentApi.createStayWithPayment(data),
    onSuccess: () => {
      // Invalidate all major queries after creating a new stay with payment
      queryClient.invalidateQueries({ queryKey: ['stays'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room_history'] });
    },
    onError: (error) => {
      console.error('Error creating stay with payment:', error);
    },
  });

  // Mutation for updating a payment
  const updatePaymentMutation = useMutation({
    mutationFn: ({ paymentId, updates }: { paymentId: string; updates: Partial<CreatePaymentDto> }) =>
      paymentApi.updatePayment(paymentId, updates),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'stay', data.stay_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'summary', data.stay_id] 
      });
      queryClient.invalidateQueries({ queryKey: ['stays'] });
    },
    onError: (error) => {
      console.error('Error updating payment:', error);
    },
  });

  // Mutation for deleting a payment
  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => paymentApi.deletePayment(paymentId),
    onSuccess: () => {
      // Invalidate all payment-related queries
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['stays'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error) => {
      console.error('Error deleting payment:', error);
    },
  });

  /**
   * Helper function to create a payment with automatic type determination
   */
  const createPaymentWithAutoType = async (
    paymentData: Omit<CreatePaymentDto, 'payment_type' | 'observation'> & {
      totalPrice?: number;
      context?: 'reservation' | 'checkin_direct' | 'calendar_payment';
      checkInDate?: Date;
      customObservation?: string;
    }
  ) => {
    const { totalPrice, context = 'calendar_payment', checkInDate, customObservation, ...baseData } = paymentData;
    
    // Determine payment type
    const paymentType = paymentHelpers.determinePaymentType(
      baseData.amount,
      totalPrice || 0,
      context,
      checkInDate
    );

    // Generate observation
    const observation = customObservation || paymentHelpers.generateObservation(
      paymentType,
      baseData.amount,
      totalPrice || 0
    );

    return createPaymentMutation.mutateAsync({
      ...baseData,
      payment_type: paymentType,
      observation,
    });
  };

  /**
   * Helper function to create stay with payment with automatic type determination
   */
  const createStayWithPaymentWithAutoType = async (
    data: Omit<StayWithPaymentDto, 'paymentData'> & {
      paymentData: Omit<CreatePaymentDto, 'payment_type' | 'observation'> & {
        context?: 'reservation' | 'checkin_direct' | 'calendar_payment';
        customObservation?: string;
      };
    }
  ) => {
    const { paymentData, ...stayData } = data;
    
    // Determine payment type
    const paymentType = paymentHelpers.determinePaymentType(
      paymentData.amount,
      stayData.stayData.total_price || 0,
      paymentData.context || 'reservation',
      stayData.stayData.check_in_date ? new Date(stayData.stayData.check_in_date) : undefined
    );

    // Generate observation
    const observation = paymentData.customObservation || paymentHelpers.generateObservation(
      paymentType,
      paymentData.amount,
      stayData.stayData.total_price || 0
    );

    return createStayWithPaymentMutation.mutateAsync({
      stayData,
      paymentData: {
        ...paymentData,
        payment_type: paymentType,
        observation,
      },
    });
  };

  return {
    // Queries
    getPaymentsByStay,
    getPaymentSummary,
    getPaymentsByDateRange,

    // Mutations
    createPaymentMutation,
    createStayWithPaymentMutation,
    updatePaymentMutation,
    deletePaymentMutation,

    // Helper functions
    createPaymentWithAutoType,
    createStayWithPaymentWithAutoType,

    // Raw access to helpers for components
    paymentHelpers,
  };
};