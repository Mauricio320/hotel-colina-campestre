
import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useForm } from 'react-hook-form';
import { useGuests } from '@/hooks/useGuests';

interface GuestManagementProps {
  userRole: string | null;
}

const GuestManagement: React.FC<GuestManagementProps> = ({ userRole }) => {
  const [showModal, setShowModal] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const { guestsQuery, upsertGuest } = useGuests();
  const { register, handleSubmit, reset } = useForm();

  if (guestsQuery.isLoading) return <div className="flex justify-center p-12"><ProgressSpinner /></div>;

  const onSubmit = async (data: any) => {
    try {
      await upsertGuest.mutateAsync(data);
      setShowModal(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const header = (
    <div className="flex flex-wrap gap-2 justify-between items-center">
      <h3 className="m-0 text-xl font-bold text-emerald-700">Listado de Huéspedes</h3>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onInput={(e: any) => setGlobalFilter(e.target.value)} placeholder="Buscar documento o nombre..." />
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Huéspedes</h2>
        <Button label="Nuevo Huésped" icon="pi pi-plus" className="bg-emerald-600" onClick={() => setShowModal(true)} />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <DataTable 
          value={guestsQuery.data || []} 
          header={header} 
          globalFilter={globalFilter}
          responsiveLayout="scroll" 
          className="text-sm"
          paginator 
          rows={10}
        >
          <Column field="doc_number" header="Documento" sortable />
          <Column field="first_name" header="Nombres" sortable />
          <Column field="last_name" header="Apellidos" sortable />
          <Column field="phone" header="Teléfono" />
          <Column field="email" header="Email" />
          <Column field="city" header="Municipio" />
          <Column 
            header="Acciones" 
            body={() => (
              <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-text p-button-sm p-button-warning" />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog header="Registrar Huésped" visible={showModal} onHide={() => setShowModal(false)} className="w-full max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">No. Documento</label>
            <InputText {...register('doc_number', { required: true })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Tipo Doc</label>
            <InputText {...register('doc_type', { required: true })} placeholder="CC, CE, etc" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Nombres</label>
            <InputText {...register('first_name', { required: true })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Apellidos</label>
            <InputText {...register('last_name', { required: true })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Teléfono</label>
            <InputText {...register('phone')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Municipio</label>
            <InputText {...register('city')} />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-semibold">Email</label>
            <InputText {...register('email')} />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2 mt-4">
            <Button type="submit" label="Guardar Huésped" className="bg-emerald-600" loading={upsertGuest.isPending} />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default GuestManagement;
