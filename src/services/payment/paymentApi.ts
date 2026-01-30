import { supabase } from '@/config/supabase';
import { 
  Payment, 
  CreatePaymentDto, 
  StayWithPaymentDto, 
  PaymentSummary, 
  PaymentType 
} from '@/types';

/**
 * Pure API functions for payment management
 * These functions handle all Supabase interactions for the payments table
 */
export const paymentApi = {
  /**
   * Create a single payment record
   */
  createPayment: async (paymentData: CreatePaymentDto): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select(`
        *,
        payment_method:payment_methods(name),
        employee:employees(first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      throw new Error(`Error al crear pago: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all payments for a specific stay
   */
  getPaymentsByStay: async (stayId: string): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        payment_method:payment_methods(name),
        employee:employees(first_name, last_name)
      `)
      .eq('stay_id', stayId)
      .order('payment_date', { ascending: true });

    if (error) {
      console.error('Error fetching payments:', error);
      throw new Error(`Error al obtener pagos: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get payment summary for a stay (total paid, pending, etc.)
   */
  getStayPaymentSummary: async (stayId: string): Promise<PaymentSummary> => {
    const payments = await paymentApi.getPaymentsByStay(stayId);
    
    // Get stay details to get total price
    const { data: stay, error: stayError } = await supabase
      .from('stays')
      .select('total_price')
      .eq('id', stayId)
      .single();

    if (stayError) {
      console.error('Error fetching stay for summary:', stayError);
      throw new Error(`Error al obtener datos de estancia: ${stayError.message}`);
    }

    const totalAmount = stay?.total_price || 0;
    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const pendingAmount = totalAmount - totalPaid;
    const isFullyPaid = pendingAmount <= 0;

    return {
      totalPaid,
      totalAmount,
      pendingAmount,
      payments,
      isFullyPaid
    };
  },

  /**
   * Create a stay with an initial payment in a transaction-like operation
   */
  createStayWithPayment: async (data: StayWithPaymentDto) => {
    try {
      // First, create the stay
      const { data: stay, error: stayError } = await supabase
        .from('stays')
        .insert(data.stayData)
        .select()
        .single();

      if (stayError) {
        console.error('Error creating stay:', stayError);
        throw new Error(`Error al crear estancia: ${stayError.message}`);
      }

      // Then create the payment record
      const paymentData = {
        ...data.paymentData,
        stay_id: stay.id
      };

      await paymentApi.createPayment(paymentData);

      return stay;
    } catch (error) {
      console.error('Error in createStayWithPayment:', error);
      throw error;
    }
  },

  /**
   * Update payment record
   */
  updatePayment: async (paymentId: string, updates: Partial<CreatePaymentDto>): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select(`
        *,
        payment_method:payment_methods(name),
        employee:employees(first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw new Error(`Error al actualizar pago: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete a payment record
   */
  deletePayment: async (paymentId: string): Promise<void> => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) {
      console.error('Error deleting payment:', error);
      throw new Error(`Error al eliminar pago: ${error.message}`);
    }
  },

  /**
   * Get payment history for a date range
   */
  getPaymentsByDateRange: async (startDate: string, endDate: string): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        payment_method:payment_methods(name),
        employee:employees(first_name, last_name),
        stay:stays(id, order_number, check_in_date, check_out_date, guest:guests(first_name, last_name))
      `)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments by date range:', error);
      throw new Error(`Error al obtener pagos por rango de fechas: ${error.message}`);
    }

    return data || [];
  }
};

/**
 * Helper functions for payment type determination
 */
export const paymentHelpers = {
  /**
   * Determine payment type based on amount, total price, and context
   */
  determinePaymentType: (
    paidAmount: number, 
    totalPrice: number, 
    context: 'reservation' | 'checkin_direct' | 'calendar_payment',
    checkInDate?: Date
  ): PaymentType => {
    // Check-in direct is always complete payment
    if (context === 'checkin_direct') {
      return PaymentType.PAGO_CHECKIN_DIRECTO;
    }

    // For reservations and calendar payments
    if (paidAmount >= totalPrice) {
      if (checkInDate && checkInDate > new Date()) {
        return PaymentType.ANTICIPADO_COMPLETO;
      }
      return PaymentType.PAGO_COMPLETO_RESERVA;
    }

    return PaymentType.ABONO_RESERVA;
  },

  /**
   * Generate automatic observation based on payment type and context
   */
  generateObservation: (
    paymentType: PaymentType,
    paidAmount: number,
    totalPrice: number
  ): string => {
    switch (paymentType) {
      case PaymentType.ABONO_RESERVA:
        return `Abono parcial de reserva: $${paidAmount.toLocaleString()} de $${totalPrice.toLocaleString()}`;
      
      case PaymentType.PAGO_COMPLETO_RESERVA:
        return 'Liquidación completa de reserva';
      
      case PaymentType.PAGO_CHECKIN_DIRECTO:
        return 'Pago completo check-in directo';
      
      case PaymentType.ANTICIPADO_COMPLETO:
        return 'Pago completo anticipado de reserva';
      
      default:
        return 'Pago registrado';
    }
  }
};