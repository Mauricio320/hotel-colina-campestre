
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { supabase } from '@/config/supabase';
import { Stay } from '@/types';

const InvoiceDetailPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stay, setStay] = useState<any | null>(null);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!stayId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('stays')
        .select('*, guest:guests(*), room:rooms(*), payment_method:payment_methods(name)')
        .eq('id', stayId)
        .single();
      
      if (data) setStay(data);
      setLoading(false);
    };

    fetchInvoiceData();
  }, [stayId]);

  const nights = useMemo(() => {
    if (!stay?.check_in_date || !stay?.check_out_date) return 1;
    const inDate = new Date(stay.check_in_date + 'T12:00:00');
    const outDate = new Date(stay.check_out_date + 'T12:00:00');
    const diff = outDate.getTime() - inDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [stay]);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Active': return 'danger';
      case 'Reserved': return 'warning';
      default: return 'info';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 gap-4">
      <ProgressSpinner strokeWidth="4" />
      <p className="text-indigo-600 font-bold animate-pulse">Cargando detalle de orden...</p>
    </div>
  );

  if (!stay) return (
    <div className="p-12 text-center">
      <i className="pi pi-exclamation-circle text-4xl text-red-500 mb-4"></i>
      <h2 className="text-xl font-bold">Orden no encontrada</h2>
      <Button label="Volver a Pagos" className="mt-4 p-button-text" onClick={() => navigate('/room-payments')} />
    </div>
  );

  const pendingAmount = stay.total_price - stay.paid_amount;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-4">
            <Button 
                icon="pi pi-arrow-left" 
                onClick={() => navigate('/room-payments')} 
                className="p-button-text p-button-plain p-button-rounded text-gray-400" 
            />
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Detalle de Factura</h1>
        </div>
        <Button label="Imprimir Recibo" icon="pi pi-print" className="bg-indigo-600 font-bold" onClick={() => window.print()} />
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 print:shadow-none print:border-none print:p-4">
        {/* Header de Factura */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <i className="pi pi-building text-3xl text-indigo-600"></i>
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Hotel Colina Campestre</h2>
                </div>
                <p className="text-sm text-gray-500 font-medium">NIT: 123.456.789-0</p>
                <p className="text-sm text-gray-500 font-medium">Dir: Sector Campestre, La Ceja - Antioquia</p>
                <p className="text-sm text-gray-500 font-medium">Cel: +57 300 123 4567</p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
                <Tag value={stay.status} severity={getStatusSeverity(stay.status)} className="text-xs uppercase font-black" />
                <div className="mt-2">
                    <span className="text-xs text-gray-400 font-bold uppercase block">Número de Orden</span>
                    <span className="text-3xl font-black text-indigo-600">#{stay.order_number}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-400 font-bold uppercase block">Fecha Emisión</span>
                    <span className="text-sm font-bold text-gray-700">{new Date(stay.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Huésped */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="pi pi-user text-[10px]"></i> Datos del Huésped
                </h3>
                <div className="flex flex-col gap-2">
                    <p className="text-xl font-black text-gray-800 leading-tight">
                        {stay.guest?.first_name} {stay.guest?.last_name}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                        <span className="text-gray-400">{stay.guest?.doc_type}:</span> {stay.guest?.doc_number}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                        <span className="text-gray-400">Tel:</span> {stay.guest?.phone}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                        <span className="text-gray-400">Email:</span> {stay.guest?.email}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                        <span className="text-gray-400">Ubicación:</span> {stay.guest?.city}
                    </p>
                </div>
            </div>

            {/* Estadía */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="pi pi-calendar text-[10px]"></i> Detalles de Reserva
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Entrada</span>
                        <span className="text-base font-black text-gray-700">{stay.check_in_date}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Salida</span>
                        <span className="text-base font-black text-gray-700">{stay.check_out_date}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Habitación</span>
                        <span className="text-base font-black text-indigo-600">{stay.room?.room_number}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Noches</span>
                        <span className="text-base font-black text-gray-700">{nights} {nights > 1 ? 'noches' : 'noche'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabla de Conceptos */}
        <div className="mb-12">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-100">
                        <th className="py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Descripción</th>
                        <th className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Cant.</th>
                        <th className="py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Valor Unit.</th>
                        <th className="py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Subtotal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    <tr>
                        <td className="py-6">
                            <p className="font-black text-gray-800">Servicio de Hospedaje</p>
                            <p className="text-xs text-gray-400 font-medium">Categoría: {stay.room?.category}</p>
                        </td>
                        <td className="py-6 text-center font-bold text-gray-700">{nights} nch</td>
                        <td className="py-6 text-right font-bold text-gray-700">$ {Math.round((stay.total_price - stay.iva_amount - (stay.has_extra_mattress ? stay.extra_mattress_price : 0)) / nights).toLocaleString()}</td>
                        <td className="py-6 text-right font-black text-gray-800">$ {(stay.total_price - stay.iva_amount - (stay.has_extra_mattress ? stay.extra_mattress_price : 0)).toLocaleString()}</td>
                    </tr>
                    {stay.has_extra_mattress && (
                        <tr>
                            <td className="py-6">
                                <p className="font-black text-gray-800">Colchoneta Adicional</p>
                                <p className="text-xs text-gray-400 font-medium">Servicio extra por noche</p>
                            </td>
                            <td className="py-6 text-center font-bold text-gray-700">{nights} nch</td>
                            <td className="py-6 text-right font-bold text-gray-700">$ {(stay.extra_mattress_price / nights).toLocaleString()}</td>
                            <td className="py-6 text-right font-black text-gray-800">$ {stay.extra_mattress_price.toLocaleString()}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Resumen Financiero */}
        <div className="flex justify-end mb-12">
            <div className="w-full max-w-sm flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-800">$ {(stay.total_price - stay.iva_amount).toLocaleString()}</span>
                </div>
                {stay.is_invoice_requested && (
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                        <span>IVA (19%)</span>
                        <span className="font-bold text-gray-800">$ {stay.iva_amount.toLocaleString()}</span>
                    </div>
                )}
                <div className="p-4 bg-indigo-600 rounded-2xl flex justify-between items-center text-white shadow-lg shadow-indigo-100">
                    <span className="text-sm font-black uppercase tracking-widest">Total Orden</span>
                    <span className="text-2xl font-black">$ {stay.total_price.toLocaleString()}</span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-medium text-green-600">
                        <span>Abonos / Pagos Realizados</span>
                        <span className="font-bold">- $ {stay.paid_amount.toLocaleString()}</span>
                    </div>
                    <Divider className="my-1" />
                    <div className={`flex justify-between items-center p-4 rounded-xl ${pendingAmount > 0 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                        <span className="text-xs font-black uppercase">Saldo Pendiente</span>
                        <span className="text-xl font-black">$ {pendingAmount.toLocaleString()}</span>
                    </div>
                </div>
                
                {stay.payment_method && (
                  <p className="text-[10px] text-gray-400 text-right mt-2 uppercase font-black tracking-tighter">
                    Medio de pago principal: {stay.payment_method.name}
                  </p>
                )}
            </div>
        </div>

        {/* Observaciones */}
        {stay.observation && (
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 mb-8">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Observaciones</span>
                <p className="text-sm text-amber-800 font-medium italic">"{stay.observation}"</p>
            </div>
        )}

        {/* Footer de Factura */}
        <div className="text-center border-t border-gray-100 pt-8">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Gracias por elegir Hotel Colina Campestre</p>
            <p className="text-[10px] text-gray-300 mt-2">Documento de control interno. Generado el {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
