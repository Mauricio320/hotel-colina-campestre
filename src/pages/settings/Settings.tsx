
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Role } from '@/types';
import { supabase } from '@/config/supabase';

interface SettingsProps {
  userRole: string | null;
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, setValue, watch, reset } = useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const iva = data.find(s => s.key === 'iva_percentage')?.value || 19;
      const mat = data.find(s => s.key === 'extra_mattress_price')?.value || 30000;
      reset({ iva, extra_mattress: mat });
    }
    setLoading(false);
  };

  if (userRole !== Role.Admin) {
    return <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">Acceso denegado. Solo administradores.</div>;
  }

  const onSubmit = async (data: any) => {
    try {
      await supabase.from('settings').update({ value: data.iva }).eq('key', 'iva_percentage');
      await supabase.from('settings').update({ value: data.extra_mattress }).eq('key', 'extra_mattress_price');
      alert('Configuración actualizada con éxito');
    } catch (e) { alert('Error al guardar'); }
  };

  if (loading) return <ProgressSpinner />;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-800">Parámetros Globales (Módulo Otros)</h2>
      
      <Card className="shadow-sm max-w-xl border-t-4 border-indigo-600">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="iva" className="font-bold text-gray-700">Porcentaje IVA (%)</label>
            <InputNumber 
              id="iva" 
              value={watch('iva')} 
              onValueChange={(e) => setValue('iva', e.value || 0)} 
              suffix="%" 
              showButtons 
              min={0} 
              max={100}
            />
            <small className="text-gray-500">Este valor se sumará al total si el huésped solicita Factura Electrónica.</small>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="extra_mattress" className="font-bold text-gray-700">Costo Colchoneta Adicional (COP)</label>
            <InputNumber 
              id="extra_mattress" 
              value={watch('extra_mattress')} 
              onValueChange={(e) => setValue('extra_mattress', e.value || 0)} 
              mode="currency" 
              currency="COP" 
              locale="es-CO" 
              showButtons
            />
            <small className="text-gray-500">Costo fijo por noche al agregar una colchoneta extra a la habitación.</small>
          </div>

          <Button type="submit" label="Actualizar Parámetros" icon="pi pi-save" className="bg-indigo-600 mt-2 p-3 font-bold" />
        </form>
      </Card>
    </div>
  );
};

export default Settings;
