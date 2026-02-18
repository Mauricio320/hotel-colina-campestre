import { supabase } from "@/config/supabase";
import { MaintenanceLog, CreateMaintenanceLogDto } from "@/types";

export const createMaintenanceLog = async (
  dto: CreateMaintenanceLogDto,
): Promise<MaintenanceLog> => {
  const { data, error } = await supabase
    .from("maintenance_logs")
    .insert({
      room_id: dto.room_id,
      stay_id: dto.stay_id,
      employee_id: dto.employee_id,
      category_id: dto.category_id,
      subcategory_id: dto.subcategory_id,
      observation: dto.observation,
      date: dto.date,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const fetchMaintenanceLogsByRoom = async (
  roomId: string,
): Promise<MaintenanceLog[]> => {
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select(`
      *,
      category:maintenance_categories(*),
      subcategory:maintenance_subcategories(*),
      employee:employees(*),
      room:rooms(*),
      stay:stays(*)
    `)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchMaintenanceLogsByDate = async (
  date: string,
): Promise<MaintenanceLog[]> => {
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select(`
      *,
      category:maintenance_categories(*),
      subcategory:maintenance_subcategories(*),
      employee:employees(*),
      room:rooms(*)
    `)
    .eq("date", date)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchAllMaintenanceLogs = async (): Promise<MaintenanceLog[]> => {
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select(`
      *,
      category:maintenance_categories(*),
      subcategory:maintenance_subcategories(*),
      employee:employees(*),
      room:rooms(*),
      stay:stays(*, guest:guests!stays_guest_id_fkey(*))
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};
