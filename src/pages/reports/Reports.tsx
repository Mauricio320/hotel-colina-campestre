
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Role, Payment } from '@/types';
import { usePayments } from '@/hooks/usePayments';
import { supabase } from '@/config/supabase';

interface ReportsProps {
  userRole: string | null;
}

const Reports: React.FC<ReportsProps> = ({ userRole }) => {
  const [loading, setLoading] = useState(false);
  const { getPaymentsByDateRange } = usePayments();

  if (userRole !== Role.Admin) {
    return <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200 font-bold">Acceso denegado. Solo administradores.</div>;
  }

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data.length) return alert('No hay datos para exportar');
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        const escaped = ('' + val).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = "data:text/csv;charset=utf-8,\ufeff" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMonthlyReport = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stays')
      .select('order_number, check_in_date, total_price, paid_amount, status, guest:guests(first_name, last_name), room:rooms(room_number)')
      .order('check_in_date', { ascending: false });

    if (data) {
      const formatted = data.map(s => ({
        Orden: s.order_number,
        Fecha: s.check_in_date,
        Habitacion: (s.room as any)?.room_number,
        Huesped: `${(s.guest as any)?.first_name} ${(s.guest as any)?.last_name}`,
        Total: s.total_price,
        Abonado: s.paid_amount,
        Estado: s.status
      }));
      exportToCSV(formatted, `reporte_pagos_${new Date().toISOString().slice(0,7)}.csv`);
    }
    setLoading(false);
  };

  const handleHistoryReport = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('room_history')
      .select('timestamp, action_type, observation, room:rooms(room_number), employee:employees(first_name, last_name)')
      .order('timestamp', { ascending: false });

    if (data) {
      const formatted = data.map(h => ({
        Fecha: new Date(h.timestamp).toLocaleString(),
        Habitacion: (h.room as any)?.room_number,
        Accion: h.action_type,
        Encargado: h.employee ? `${(h.employee as any)?.first_name} ${(h.employee as any)?.last_name}` : 'Sistema',
        Observacion: h.observation || ''
      }));
      exportToCSV(formatted, 'historial_completo_habitaciones.csv');
    }
    setLoading(false);
  };

  const handlePaymentsReport = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const { data: paymentsData } = await supabase
        .from('payments')
        .select(`
          payment_date,
          amount,
          payment_type,
          observation,
          payment_method:payment_methods(name),
          employee:employees(first_name, last_name),
          stay:stays(order_number, check_in_date, check_out_date),
          guest:guests(first_name, last_name)
        `)
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString())
        .order('payment_date', { ascending: false });

      if (paymentsData) {
        const formatted = paymentsData.map(p => ({
          'Fecha Pago': new Date(p.payment_date).toLocaleString(),
          'Monto': Number(p.amount),
          'Método Pago': (p.payment_method as any)?.name || 'No especificado',
          'Tipo Pago': p.payment_type === 'ABONO_RESERVA' ? 'Abono Parcial' :
                      p.payment_type === 'PAGO_COMPLETO_RESERVA' ? 'Pago Completo Reserva' :
                      p.payment_type === 'PAGO_CHECKIN_DIRECTO' ? 'Check-in Directo' :
                      p.payment_type === 'ANTICIPADO_COMPLETO' ? 'Anticipado' : p.payment_type,
          'Orden': (p.stay as any)?.order_number,
          'Huesped': (p.guest as any) ? `${(p.guest as any).first_name} ${(p.guest as any).last_name}` : 'No especificado',
          'Check-in': (p.stay as any)?.check_in_date || '',
          'Check-out': (p.stay as any)?.check_out_date || '',
          'Registrado por': p.employee ? `${(p.employee as any).first_name} ${(p.employee as any).last_name}` : 'Sistema',
          'Observación': p.observation || ''
        }));
        exportToCSV(formatted, `reporte_pagos_detallado_${new Date().toISOString().slice(0,7)}.csv`);
      }
    } catch (error) {
      console.error('Error generating payments report:', error);
      alert('Error al generar reporte de pagos');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Módulo de Reportes Administrativos</h2>
        {loading && <ProgressSpinner style={{width: '30px', height: '30px'}} />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Reporte Mensual de Ingresos" className="shadow-sm border-t-4 border-green-500">
          <p className="text-gray-600 mb-6">Detalle consolidado de todos los pagos, abonos y deudas por estadía a la fecha actual.</p>
          <Button label="Descargar Excel de Pagos" icon="pi pi-file-excel" className="p-button-success w-full font-bold p-3" onClick={handleMonthlyReport} disabled={loading} />
        </Card>

        <Card title="Reporte Detallado de Pagos" className="shadow-sm border-t-4 border-emerald-500">
          <p className="text-gray-600 mb-6">Historial completo de pagos y abonos con método, tipo y empleado que registró.</p>
          <Button label="Descargar Pagos Detallados" icon="pi pi-money-bill" className="p-button-warning w-full font-bold p-3" onClick={handlePaymentsReport} disabled={loading} />
        </Card>

        <Card title="Reporte Histórico Operativo" className="shadow-sm border-t-4 border-blue-500">
          <p className="text-gray-600 mb-6">Registro detallado de cambios de estado, limpiezas y mantenimientos realizados en todas las áreas.</p>
          <Button label="Descargar Histórico General" icon="pi pi-clock" className="p-button-info w-full font-bold p-3" onClick={handleHistoryReport} disabled={loading} />
        </Card>
      </div>
    </div>
  );
};

export default Reports;
