
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useForm, Controller } from 'react-hook-form';
import { Role } from '@/types';
import { useEmployees } from '@/hooks/useEmployees';
import { supabase } from '@/config/supabase';
import { DOC_TYPES } from '@/constants';

interface EmployeeManagementProps {
  userRole: string | null;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ userRole }) => {
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const { employeesQuery, createEmployee } = useEmployees();
  const { register, handleSubmit, control, reset } = useForm();

  useEffect(() => {
    supabase.from('roles').select('*').then(({ data }) => setRoles(data || []));
  }, []);

  if (userRole !== Role.Admin) {
    return <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200 font-bold">Acceso restringido solo para administradores.</div>;
  }

  const onSubmit = async (data: any) => {
    try {
      await createEmployee.mutateAsync(data);
      setShowModal(false);
      reset();
    } catch (error) { console.error(error); }
  };

  if (employeesQuery.isLoading) return <ProgressSpinner />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Talento Humano</h2>
        <Button label="Registrar Empleado" icon="pi pi-user-plus" className="bg-indigo-600 shadow-md" onClick={() => setShowModal(true)} />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <DataTable value={employeesQuery.data || []} responsiveLayout="scroll" className="text-sm" paginator rows={10}>
          <Column header="Empleado" body={(row) => `${row.first_name} ${row.last_name}`} sortable />
          <Column field="doc_number" header="Documento" />
          <Column field="role.name" header="Rol" sortable body={(row) => <span className="font-bold text-indigo-600">{row.role?.name}</span>} />
          <Column field="email" header="Email" />
          <Column field="phone" header="Teléfono" />
          <Column 
            header="Acciones" 
            body={() => (
              <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-text p-button-warning" />
                <Button icon="pi pi-key" className="p-button-text p-button-info" tooltip="Reset Password" />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog header="Nuevo Perfil de Empleado" visible={showModal} onHide={() => setShowModal(false)} className="w-full max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold">Tipo Doc.</label>
            <Controller name="doc_type" control={control} render={({field}) => <Dropdown {...field} options={DOC_TYPES} className="w-full" />} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold">Número Doc.</label>
            <InputText {...register('doc_number', { required: true })} className="w-full" />
          </div>
          <InputText {...register('first_name', { required: true })} placeholder="Nombres" className="w-full" />
          <InputText {...register('last_name', { required: true })} placeholder="Apellidos" className="w-full" />
          <div className="col-span-2 flex flex-col gap-1">
             <label className="text-xs font-bold">Rol en el Sistema</label>
             <Controller name="role_id" control={control} render={({field}) => <Dropdown {...field} options={roles} optionLabel="name" optionValue="id" className="w-full" />} />
          </div>
          <InputText {...register('email', { required: true })} placeholder="Correo Institucional" className="col-span-2 w-full" />
          <InputText {...register('phone')} placeholder="Teléfono de Contacto" className="col-span-2 w-full" />
          <div className="col-span-2 mt-4">
             <Button type="submit" label="Crear Perfil" className="bg-indigo-600 w-full p-3 font-bold" loading={createEmployee.isPending} />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
