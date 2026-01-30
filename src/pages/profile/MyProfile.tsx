
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/config/supabase';

const MyProfile: React.FC = () => {
  const { employee, user } = useAuth();
  
  const profileForm = useForm({
    defaultValues: {
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      email: employee?.email || user?.email || '',
      phone: employee?.phone || '',
      doc_number: employee?.doc_number || ''
    }
  });

  const passwordForm = useForm();

  const onUpdateProfile = async (data: any) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone
        })
        .eq('auth_id', user?.id);
        
      if (error) throw error;
      alert('Perfil actualizado correctamente');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const onChangePassword = async (data: any) => {
    if (data.new_password !== data.confirm_password) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.new_password
      });
      if (error) throw error;
      alert('Contraseña actualizada con éxito');
      passwordForm.reset();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Mis Datos Personales" className="shadow-sm border-t-4 border-emerald-500">
        <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nombres</label>
              <InputText {...profileForm.register('first_name')} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Apellidos</label>
              <InputText {...profileForm.register('last_name')} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Email (No editable)</label>
            <InputText {...profileForm.register('email')} disabled className="bg-gray-50" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Documento</label>
            <InputText {...profileForm.register('doc_number')} disabled className="bg-gray-50" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
            <InputText {...profileForm.register('phone')} />
          </div>
          <Button type="submit" label="Actualizar Perfil" icon="pi pi-save" className="bg-emerald-600 mt-2" />
        </form>
      </Card>

      <Card title="Seguridad" className="shadow-sm border-t-4 border-amber-500">
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 mb-2">Para cambiar tu contraseña, introduce la nueva a continuación.</p>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nueva Contraseña</label>
            <Password {...passwordForm.register('new_password', { required: true, minLength: 6 })} toggleMask className="w-full" inputClassName="w-full" feedback />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Confirmar Contraseña</label>
            <Password {...passwordForm.register('confirm_password', { required: true })} toggleMask feedback={false} className="w-full" inputClassName="w-full" />
          </div>
          <Button type="submit" label="Cambiar Contraseña" icon="pi pi-key" className="p-button-warning mt-2" />
        </form>
      </Card>
    </div>
  );
};

export default MyProfile;
