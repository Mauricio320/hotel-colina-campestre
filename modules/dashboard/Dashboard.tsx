
import React from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { CATEGORIES, STATUS_MAP } from '../../constants';
import { useRooms } from '../../hooks/useRooms';

const MetricCard: React.FC<{ label: string, value: number, color: string, icon: string }> = ({ label, value, color, icon }) => (
  <Card className="shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 uppercase font-bold">{label}</p>
        <p className="text-3xl font-black mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-full ${color} text-white`}>
        <i className={`pi ${icon} text-xl`}></i>
      </div>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
  const { roomsQuery } = useRooms();

  if (roomsQuery.isLoading) return <div className="flex justify-center p-12"><ProgressSpinner /></div>;

  const allRooms = roomsQuery.data || [];
  
  const getStats = (rooms: any[]) => ({
    disponible: rooms.filter(r => r.status?.name === 'Disponible').length,
    ocupado: rooms.filter(r => r.status?.name === 'Ocupado').length,
    reservado: rooms.filter(r => r.status?.name === 'Reservado').length,
    limpieza: rooms.filter(r => r.status?.name === 'Limpieza').length,
    mantenimiento: rooms.filter(r => r.status?.name === 'Mantenimiento').length,
  });

  const globalStats = getStats(allRooms);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Resumen del Hotel</h2>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border">
          <i className="pi pi-calendar mr-2"></i>
          Hoy: {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard label="Disponible" value={globalStats.disponible} color={STATUS_MAP['Disponible'].color} icon="pi-check-circle" />
        <MetricCard label="Ocupado" value={globalStats.ocupado} color={STATUS_MAP['Ocupado'].color} icon="pi-user" />
        <MetricCard label="Reservado" value={globalStats.reservado} color={STATUS_MAP['Reservado'].color} icon="pi-bookmark" />
        <MetricCard label="Limpieza" value={globalStats.limpieza} color={STATUS_MAP['Limpieza'].color} icon="pi-star" />
        <MetricCard label="Mantenimiento" value={globalStats.mantenimiento} color={STATUS_MAP['Mantenimiento'].color} icon="pi-cog" />
      </div>

      <Card title="Ocupación por Categoría" className="shadow-sm">
        <TabView>
          {CATEGORIES.map(cat => {
            const catRooms = allRooms.filter(r => r.category === cat);
            const catStats = getStats(catRooms);
            return (
              <TabPanel key={cat} header={cat}>
                <div className="py-4">
                  <div className="flex flex-wrap gap-6 justify-center">
                     {Object.keys(STATUS_MAP).map(statusKey => (
                       <div key={statusKey} className="flex flex-col items-center gap-2 p-4 border rounded-xl w-32 bg-white">
                          <span className={`w-3 h-3 rounded-full ${STATUS_MAP[statusKey].color}`}></span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{statusKey}</span>
                          <span className="text-2xl font-black text-gray-700">
                            {(catStats as any)[statusKey.toLowerCase()]}
                          </span>
                       </div>
                     ))}
                  </div>
                </div>
              </TabPanel>
            );
          })}
        </TabView>
      </Card>
    </div>
  );
};

export default Dashboard;
