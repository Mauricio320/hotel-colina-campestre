import { supabase } from "@/config/supabase";
import { CleaningLog, CleaningType } from "@/types";

export interface CreateCleaningLogDto {
  room_id: string;
  stay_id?: string;
  employee_id: string;
  cleaning_type: CleaningType;
  date: string;
  observation?: string;
}

export const fetchCleaningLogs = async (): Promise<CleaningLog[]> => {
  const { data, error } = await supabase
    .from("cleaning_logs")
    .select(`
      *,
      room:rooms!inner(*, status:room_statuses(*)),
      stay:stays!cleaning_logs_stay_id_fkey(*, guest:guests!stays_guest_id_fkey(*)),
      employee:employees!inner(*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchCleaningLogsByRoom = async (roomId: string): Promise<CleaningLog[]> => {
  const { data, error } = await supabase
    .from("cleaning_logs")
    .select(`
      *,
      room:rooms!inner(*),
      stay:stays!cleaning_logs_stay_id_fkey(*, guest:guests!stays_guest_id_fkey(*)),
      employee:employees!inner(*)
    `)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createCleaningLog = async (dto: CreateCleaningLogDto): Promise<CleaningLog> => {
  const { data, error } = await supabase
    .from("cleaning_logs")
    .insert({
      room_id: dto.room_id,
      stay_id: dto.stay_id || null,
      employee_id: dto.employee_id,
      cleaning_type: dto.cleaning_type,
      date: dto.date,
      observation: dto.observation || null,
    })
    .select(`
      *,
      room:rooms!inner(*),
      stay:stays!cleaning_logs_stay_id_fkey(*, guest:guests!stays_guest_id_fkey(*)),
      employee:employees!inner(*)
    `)
    .single();

  if (error) throw error;
  return data;
};
