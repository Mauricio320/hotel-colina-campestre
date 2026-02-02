import { supabase } from '@/config/supabase';
import { PaymentMethod } from '@/types';

export const paymentMethodsApi = {
  fetchAll: async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  }
};