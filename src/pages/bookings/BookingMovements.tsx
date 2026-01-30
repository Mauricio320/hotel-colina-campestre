
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { supabase } from '@/config/supabase';

const BookingMovements: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    // Consultamos el historial filtrando por acciones críticas y SOLAMENTE para estancias que nacieron como reserva
    const { data, error } = await supabase
      .from('room_history')
      .select(`
        id,
        timestamp,
        action_type,
        observation,
        room:rooms(room_number),
        employee:employees(first_name, last_name),
        stay:stays!inner(
          order_number,
          check_in_date,
          check_out_date,
          origin_was_reservation,
          iva_percentage,
          person_count,
          extra_mattress_count,
          extra_mattress_unit_price,
          guest:guests(first_name, last_name)
        )
      `)
      .in('action_type', ['CANCELACION-RESERVA', 'TRASLADO-RESERVA', 'RESERVA', 'CHECK-OUT'])
      .eq('stay.origin_was_reservation', true) // Filtro crítico para mostrar solo órdenes nacidas de reservas
      .order('timestamp', { ascending: false });

    if (!error) setLogs(data || []);
    setLoading(false);
  };

  const getActionSeverity = (action: string) => {
    switch (action) {
      case 'CANCELACION-RESERVA': return 'danger';
      case 'TRASLADO-RESERVA': return 'info';
      case 'RESERVA': return 'warning';
      case 'CHECK-OUT': return 'success';
      default: return 'secondary';
    }
  };

  const header = (
    <div className="flex flex-wrap gap-4 justify-between items-center p-2">
      <div>
        <h3 className="m-0 text-xl font-black text-emerald-900 tracking-tight">Registro Detallado de Movimientos</h3>
        <p className="text-sm text-gray-500 font-medium">Historial exclusivo de órdenes iniciadas como reservas</p>
      </div>
      <span className="p-input-icon-left w-full sm:w-72">
        <i className="pi pi-search text-emerald-400" />
        <InputText 
            type="search" 
            onInput={(e: any) => setGlobalFilter(e.target.value)} 
            placeholder="Buscar por orden, huésped o motivo..." 
            className="p-inputtext-sm w-full rounded-xl border-emerald-100"
        />
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600 shadow-sm">
                <i className="pi pi-directions text-xl"></i>
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter">Movimientos Operativos</h2>
        </div>
        <button 
            onClick={fetchMovements} 
            className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-all font-bold shadow-sm"
            title="Refrescar datos"
        >
            <i className={`pi pi-refresh ${loading ? 'pi-spin' : ''}`}></i>
            <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-50 shadow-xl shadow-emerald-100/20 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 gap-4">
            <ProgressSpinner strokeWidth="4" style={{width: '50px'}} />
            <p className="text-indigo-400 font-bold animate-pulse">Cargando bitácora...</p>
          </div>
        ) : (
          <DataTable 
            value={logs} 
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
            emptyMessage="No se han registrado movimientos bajo estos criterios (Solo reservas)."
            dataKey="id"
          >
            <Column 
                header="Registro" 
                sortable 
                field="timestamp"
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                body={(row) => (
                    <div className="flex flex-col gap-1">
                        <span className="font-black text-gray-700">{new Date(row.timestamp).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-full w-fit">{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                )} 
            />
            
            <Column 
                header="N° Orden" 
                field="stay.order_number"
                sortable
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                body={(row) => (
                    <span className="font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg">
                        #{row.stay?.order_number || 'N/A'}
                    </span>
                )}
            />

            <Column 
                header="Huésped" 
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                body={(row) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">
                            {row.stay?.guest ? `${row.stay.guest.first_name} ${row.stay.guest.last_name}` : 'N/A'}
                        </span>
                        <span className="text-[10px] text-gray-400 italic">Cliente Registrado</span>
                    </div>
                )}
            />

            <Column 
                header="Hab. / Acción" 
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                body={(row) => (
                    <div className="flex flex-col gap-2">
                        <span className="font-black text-emerald-900 text-lg">Hab. {row.room?.room_number}</span>
                        <Tag value={row.action_type.replace('-', ' ')} severity={getActionSeverity(row.action_type)} className="text-[9px] font-black uppercase px-2" />
                    </div>
                )}
            />

            <Column 
                header="Periodo Seleccionado" 
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                body={(row) => row.stay ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400 font-bold">IN:</span>
                            <span className="text-gray-700 font-medium">{row.stay.check_in_date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400 font-bold">OUT:</span>
                            <span className="text-gray-700 font-medium">{row.stay.check_out_date}</span>
                        </div>
                    </div>
                ) : <span className="text-gray-300">No disponible</span>}
            />

            <Column 
                header="Configuración" 
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                body={(row) => row.stay ? (
                    <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-bold">Personas:</span>
                            <span className="text-gray-700 font-medium">{row.stay.person_count || 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-bold">Colchonetas:</span>
                            <span className="text-gray-700 font-medium">{row.stay.extra_mattress_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-bold">IVA:</span>
                            <span className="text-gray-700 font-medium">{row.stay.iva_percentage || 19}%</span>
                        </div>
                        {row.stay.extra_mattress_count > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">Precio/Colchoneta:</span>
                                <span className="text-gray-700 font-medium">${(row.stay.extra_mattress_unit_price || 0).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                ) : <span className="text-gray-300">No disponible</span>}
            />

            <Column 
                header="Responsable" 
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                body={(row) => (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-400 border border-emerald-100">
                            <i className="pi pi-user text-xs"></i>
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                            {row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : 'SISTEMA'}
                        </span>
                    </div>
                )} 
            />

            <Column 
                field="observation" 
                header="Motivo Completo" 
                headerClassName="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest p-4"
                body={(row) => (
                    <div className="p-3 bg-amber-50/30 border border-amber-100/50 rounded-xl">
                        <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                            {row.observation || 'Sin comentarios registrados.'}
                        </p>
                    </div>
                )}
            />
          </DataTable>
        )}
      </div>
    </div>
  );
};

export default BookingMovements;
