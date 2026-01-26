
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Role } from '../../types';
import { supabase } from '../../supabase';

interface ReportsProps {
  userRole: string | null;
}

const Reports: React.FC<ReportsProps> = ({ userRole }) => {
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Módulo de Reportes Administrativos</h2>
        {loading && <ProgressSpinner style={{width: '30px', height: '30px'}} />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Reporte Mensual de Ingresos" className="shadow-sm border-t-4 border-green-500">
          <p className="text-gray-600 mb-6">Detalle consolidado de todos los pagos, abonos y deudas por estadía a la fecha actual.</p>
          <Button label="Descargar Excel de Pagos" icon="pi pi-file-excel" className="p-button-success w-full font-bold p-3" onClick={handleMonthlyReport} disabled={loading} />
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
