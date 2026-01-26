
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Stay } from '../types';

export const useStays = () => {
  const queryClient = useQueryClient();

  const staysQuery = useQuery({
    queryKey: ['stays'],
    queryFn: async ({ signal }) => {
      try {
        const { data, error } = await supabase
          .from('stays')
          .select('*, room:rooms(*), guest:guests(*)')
          .abortSignal(signal) // Vinculamos la señal de aborto de React Query
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Stay[];
      } catch (e: any) {
        // Captura silenciosa del error de aborto para evitar que la UI se bloquee
        if (e.name === 'AbortError' || e.message?.includes('aborted')) {
          console.debug('Stays fetch aborted by system');
          return [];
        }
        throw e;
      }
    },
    refetchOnWindowFocus: false, // Evita cancelaciones accidentales al cambiar de ventana
    staleTime: 1000 * 60 * 2, // 2 minutos de validez
    retry: 1
  });

  const createStay = useMutation({
    mutationFn: async (stayData: any) => {
      const { data: availableStatus } = await supabase.from('room_statuses').select('id').eq('name', 'Disponible').single();
      const todayStr = new Date().toLocaleDateString('sv-SE');
      
      const { data: currentStay } = await supabase
        .from('stays')
        .select('id')
        .eq('room_id', stayData.room_id)
        .eq('status', 'Active')
        .lte('check_in_date', todayStr)
        .gte('check_out_date', todayStr)
        .maybeSingle();

      const { data: roomBefore } = await supabase.from('rooms').select('status_id').eq('id', stayData.room_id).single();
      const effectivePrevStatusId = currentStay ? roomBefore?.status_id : (availableStatus?.id || roomBefore?.status_id);

      const { data: stay, error: stayError } = await supabase.from('stays').insert(stayData).select().single();
      if (stayError) throw stayError;
      
      const statusName = stayData.status === 'Active' ? 'Ocupado' : 'Reservado';
      const { data: statusData } = await supabase.from('room_statuses').select('id').eq('name', statusName).single();
      
      if (statusData) {
        if (stayData.check_in_date === todayStr || stayData.status === 'Active') {
            await supabase.from('rooms').update({ 
                status_id: statusData.id,
                status_date: todayStr
            }).eq('id', stayData.room_id);
        }

        await supabase.from('room_history').insert({
          room_id: stayData.room_id,
          stay_id: stay.id,
          previous_status_id: effectivePrevStatusId,
          new_status_id: statusData.id,
          employee_id: stayData.employee_id,
          action_type: stayData.status === 'Active' ? 'CHECK-IN' : 'RESERVA',
          observation: stayData.observation || `Registro de ${statusName} desde Calendario`
        });
      }

      return stay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stays'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room_history'] });
    },
  });

  const registerPayment = useMutation({
    mutationFn: async ({ stayId, amount, employeeId, roomId }: { stayId: string, amount: number, employeeId?: string, roomId: string }) => {
      const { data: stay, error: fetchErr } = await supabase
        .from('stays')
        .select('*, room:rooms(*)')
        .eq('id', stayId)
        .single();
      
      if (fetchErr || !stay) throw new Error("No se pudo encontrar la estancia");

      const todayStr = new Date().toLocaleDateString('sv-SE');
      const newPaidAmount = (stay.paid_amount || 0) + amount;
      const totalPrice = stay.total_price || 0;
      const pending = totalPrice - newPaidAmount;
      const isFullyPaid = pending <= 0;

      const { error: updateStayErr } = await supabase
        .from('stays')
        .update({ 
          paid_amount: newPaidAmount,
          status: isFullyPaid ? 'Active' : stay.status 
        })
        .eq('id', stayId);
      
      if (updateStayErr) throw updateStayErr;

      if (isFullyPaid && stay.check_in_date <= todayStr) {
        const { data: occupiedStatus } = await supabase.from('room_statuses').select('id').eq('name', 'Ocupado').single();
        if (occupiedStatus) {
          await supabase.from('rooms').update({ 
            status_id: occupiedStatus.id,
            status_date: todayStr
          }).eq('id', roomId);
        }
      }

      const { data: reservedStatus } = await supabase.from('room_statuses').select('id').eq('name', 'Reserved').single();
      const { data: occupiedStatus } = await supabase.from('room_statuses').select('id').eq('name', 'Ocupado').single();

      await supabase.from('room_history').insert({
        room_id: roomId,
        stay_id: stayId,
        previous_status_id: reservedStatus?.id,
        new_status_id: (isFullyPaid && stay.check_in_date <= todayStr) ? occupiedStatus?.id : reservedStatus?.id,
        employee_id: employeeId,
        action_type: 'ABONO-RESERVA',
        observation: `se abona ${amount.toLocaleString()}, valor total de la habitacion ${totalPrice.toLocaleString()} y lo que hace falta pagar ${pending.toLocaleString()}`
      });

      return { isFullyPaid };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stays'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room_history'] });
    }
  });

  return { staysQuery, createStay, registerPayment };
};
