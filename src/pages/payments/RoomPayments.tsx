
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { CATEGORIES } from '@/constants';
import { supabase } from '@/config/supabase';

const RoomPayments: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  const fetchPayments = async () => {
    setLoading(true);
    // Consultamos estancias con la información del huésped y habitación, filtrando por categoría
    // Se añade el filtro origin_was_reservation para mostrar solo órdenes nacidas de reservas
    const { data, error } = await supabase
      .from('stays')
      .select('*, room:rooms!inner(*), guest:guests(*)')
      .eq('room.category', CATEGORIES[activeTab])
      .eq('origin_was_reservation', true)
      .order('created_at', { ascending: false });

    if (!error) setStays(data || []);
    setLoading(false);
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Active': return 'danger';
      case 'Reserved': return 'warning';
      case 'Cancelled': return 'secondary';
      default: return 'info';
    }
  };

  const header = (
    <div className="flex flex-wrap gap-4 justify-between items-center p-2">
      <div>
        <h3 className="m-0 text-xl font-black text-indigo-900 tracking-tight">Registro de Pagos por Habitación</h3>
        <p className="text-sm text-gray-500 font-medium">Control financiero detallado por categoría (Solo Reservas)</p>
      </div>
      <span className="p-input-icon-left w-full sm:w-72">
        <i className="pi pi-search text-indigo-400" />
        <InputText 
            type="search" 
            onInput={(e: any) => setGlobalFilter(e.target.value)} 
            placeholder="Buscar por orden, huésped o habitación..." 
            className="p-inputtext-sm w-full rounded-xl border-indigo-100"
        />
      </span>
    </div>
  );

  const calculatePending = (row: any) => {
    return (row.total_price || 0) - (row.paid_amount || 0);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-2xl text-green-600 shadow-sm">
                <i className="pi pi-money-bill text-xl"></i>
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter">Pagos Habitaciones</h2>
        </div>
        <button 
            onClick={fetchPayments} 
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all font-bold shadow-sm"
            title="Refrescar datos"
        >
            <i className={`pi pi-refresh ${loading ? 'pi-spin' : ''}`}></i>
            <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {CATEGORIES.map((cat, index) => (
          <TabPanel key={cat} header={cat}>
            <div className="bg-white rounded-3xl border border-indigo-50 shadow-xl shadow-indigo-100/20 overflow-hidden mt-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-24 gap-4">
                        <ProgressSpinner strokeWidth="4" style={{width: '50px'}} />
                        <p className="text-indigo-400 font-bold animate-pulse">Cargando pagos de {cat}...</p>
                    </div>
                ) : (
                    <DataTable 
                        value={stays} 
                        header={header}
                        globalFilter={globalFilter}
                        responsiveLayout="stack" 
                        breakpoint="960px"
                        className="text-sm"
                        paginator 
                        rows={10}
                        rowsPerPageOptions={[10, 20, 50]}
                        rowHover
                        stripedRows
                        emptyMessage={`No hay registros de pagos para la categoría ${cat} que sean originados por reserva.`}
                    >
                        <Column 
                            header="N° Orden" 
                            sortable
                            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                            body={(row) => <span className="font-black text-indigo-600">#{row.order_number}</span>}
                        />

                        <Column 
                            header="Huésped" 
                            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                            body={(row) => (
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800">
                                        {row.guest ? `${row.guest.first_name} ${row.guest.last_name}` : 'N/A'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">Hab. {row.room?.room_number}</span>
                                </div>
                            )}
                        />

                        <Column 
                            header="Estado" 
                            sortable 
                            field="status"
                            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                            body={(row) => <Tag value={row.status} severity={getStatusSeverity(row.status)} className="text-[10px] font-black uppercase" />} 
                        />

                        <Column 
                            header="Valor Total" 
                            sortable 
                            field="total_price"
                            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                            body={(row) => <span className="font-black text-gray-800">$ {(row.total_price || 0).toLocaleString()}</span>}
                        />

                        <Column 
                            header="Abonado" 
                            sortable 
                            field="paid_amount"
                            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                            body={(row) => <span className="font-black text-green-600">$ {(row.paid_amount || 0).toLocaleString()}</span>}
                        />

                        <Column 
                            header="Pendiente" 
                            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                            body={(row) => {
                                const pending = calculatePending(row);
                                return (
                                    <span className={`font-black px-2 py-1 rounded-lg ${pending > 0 ? 'text-red-600 bg-red-50' : 'text-gray-400 bg-gray-50'}`}>
                                        $ {pending.toLocaleString()}
                                    </span>
                                );
                            }}
                        />

                        <Column 
                            header="Acciones" 
                            headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4 text-center"
                            body={(row) => (
                                <div className="flex justify-center">
                                    <Button 
                                        label="Ver Factura" 
                                        icon="pi pi-file-pdf" 
                                        className="p-button-text p-button-sm font-bold text-indigo-600" 
                                        onClick={() => navigate(`/invoice/${row.id}`)}
                                    />
                                </div>
                            )}
                        />
                    </DataTable>
                )}
            </div>
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default RoomPayments;
