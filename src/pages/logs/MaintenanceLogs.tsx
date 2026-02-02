
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { CATEGORIES } from '@/constants';
import { supabase } from '@/config/supabase';

const MaintenanceLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('room_history')
      .select('*, room:rooms!inner(*), employee:employees(*), stay:stays!inner(origin_was_reservation)')
      .eq('action_type', 'MANTENIMIENTO')
      .eq('room.category', CATEGORIES[activeTab])
      .eq('stay.origin_was_reservation', true)
      .order('timestamp', { ascending: false });

    if (!error) setLogs(data || []);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-800">Historial de Mantenimiento</h2>
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {CATEGORIES.map(cat => (
          <TabPanel key={cat} header={cat}>
            {loading ? (
              <div className="flex justify-center p-8"><ProgressSpinner /></div>
            ) : (
              <DataTable value={logs} responsiveLayout="scroll" className="mt-4" emptyMessage="No hay registros de mantenimiento para esta categoría.">
                <Column field="room.room_number" header="Habitación" sortable />
                <Column 
                  header="Encargado" 
                  body={(row) => row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : 'SISTEMA'} 
                  sortable 
                />
                <Column 
                  field="timestamp" 
                  header="Fecha y Hora" 
                  body={(row) => new Date(row.timestamp).toLocaleString()} 
                  sortable 
                />
                <Column field="observation" header="Observación" />
              </DataTable>
            )}
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default MaintenanceLogs;
