
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';

import { useRooms } from '../../hooks/useRooms';
import { useGuests } from '../../hooks/useGuests';
import { useStays } from '../../hooks/useStays';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabase';
import { DOC_TYPES } from '../../constants';
import { Room } from '../../types';

interface ColombiaData {
  id: number;
  departamento: string;
  ciudades: string[];
}

const CheckInPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const { roomsQuery } = useRooms();
  const { findGuestByDoc, upsertGuest } = useGuests();
  const { createStay } = useStays();

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [settings, setSettings] = useState({ iva: 19, mat: 30000 });
  
  // Estado para la geografía de Colombia
  const [colombiaData, setColombiaData] = useState<ColombiaData[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(true);

  const selectedRoom = useMemo(() => 
    roomsQuery.data?.find(r => r.id === roomId), 
  [roomsQuery.data, roomId]);

  // Cálculo de capacidad máxima basado en camas
  const maxCapacity = useMemo(() => {
    if (!selectedRoom) return 1;
    return (selectedRoom.beds_double * 2) + selectedRoom.beds_single;
  }, [selectedRoom]);

  const { control, register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      doc_type: 'Cédula de Ciudadanía',
      doc_number: '',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      department: '',
      city: '',
      address: '',
      check_in_date: searchParams.get('date') ? new Date(searchParams.get('date')! + 'T12:00:00') : new Date(),
      check_out_date: null as Date | null,
      person_count: 1,
      extra_mattress_count: 0,
      is_invoice_requested: false,
      observation: '',
      payment_method_id: '',
      paid_amount: 0
    }
  });

  const personCount = watch('person_count');
  const checkInDate = watch('check_in_date');
  const checkOutDate = watch('check_out_date');
  const extraMattressCount = watch('extra_mattress_count');
  const invoiceRequested = watch('is_invoice_requested');
  const watchDocNumber = watch('doc_number');
  const selectedDepartment = watch('department');

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Cargar datos de Colombia y configuraciones iniciales
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json');
        const data = await response.json();
        setColombiaData(data);
      } catch (error) {
        console.error('Error cargando geografía:', error);
      } finally {
        setLoadingGeo(false);
      }
    };

    fetchGeoData();

    supabase.from('settings').select('*').then(({ data }) => {
      if (data) {
        setSettings({
          iva: data.find(s => s.key === 'iva_percentage')?.value || 19,
          mat: data.find(s => s.key === 'extra_mattress_price')?.value || 30000
        });
      }
    });
    supabase.from('payment_methods').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setPaymentMethods(data);
        setValue('payment_method_id', data[0].id);
      }
    });
  }, [setValue]);

  // Opciones de municipios basadas en departamento
  const cityOptions = useMemo(() => {
    if (!selectedDepartment || !colombiaData.length) return [];
    const dept = colombiaData.find(d => d.departamento === selectedDepartment);
    return dept ? dept.ciudades : [];
  }, [selectedDepartment, colombiaData]);

  const searchGuest = async () => {
    if (watchDocNumber.length < 5) return;
    setSearching(true);
    const guest = await findGuestByDoc(watchDocNumber);
    if (guest) {
      setValue('first_name', guest.first_name);
      setValue('last_name', guest.last_name);
      setValue('phone', guest.phone || '');
      setValue('email', guest.email || '');
      setValue('address', guest.address || '');
      setValue('doc_type', guest.doc_type);
      
      // Intentar encontrar el departamento basado en la ciudad guardada
      if (guest.city) {
        const deptFound = colombiaData.find(d => d.ciudades.includes(guest.city));
        if (deptFound) {
          setValue('department', deptFound.departamento);
          // Esperar un tick para que se actualicen las opciones del municipio
          setTimeout(() => setValue('city', guest.city), 0);
        } else {
            setValue('city', guest.city);
        }
      }
    }
    setSearching(false);
  };

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const diff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkInDate, checkOutDate]);

  const priceInfo = useMemo(() => {
    if (!selectedRoom) return { rate: 0, subtotalHospedaje: 0, subtotal: 0, iva: 0, total: 0 };
    
    const roomRates = selectedRoom.rates || [];
    const rateObj = roomRates
      .filter(r => r.person_count <= personCount)
      .sort((a, b) => b.person_count - a.person_count)[0];
    
    const rate = rateObj?.rate || (selectedRoom.category === 'Hotel' ? 80000 : 90000);
    const subtotalHospedaje = rate * nights;
    let subtotal = subtotalHospedaje;
    
    if (extraMattressCount > 0) subtotal += (settings.mat * extraMattressCount * nights);
    
    let iva = 0;
    if (invoiceRequested) iva = Math.round(subtotal * (settings.iva / 100));
    
    const total = subtotal + iva;

    return { rate, subtotalHospedaje, subtotal, iva, total };
  }, [selectedRoom, personCount, nights, extraMattressCount, invoiceRequested, settings]);

  useEffect(() => {
      setValue('paid_amount', priceInfo.total);
  }, [priceInfo.total, setValue]);

  const onSubmit = async (data: any) => {
    if (!data.check_out_date) {
        alert("Seleccione una fecha de salida");
        return;
    }
    setLoading(true);
    try {
      const guest = await upsertGuest.mutateAsync({
        doc_type: data.doc_type,
        doc_number: data.doc_number,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        address: data.address
      });

      await createStay.mutateAsync({
        room_id: roomId,
        guest_id: guest.id,
        employee_id: employee?.id || null,
        check_in_date: data.check_in_date.toLocaleDateString('sv-SE'),
        check_out_date: data.check_out_date.toLocaleDateString('sv-SE'),
        status: 'Active',
        total_price: priceInfo.total,
        paid_amount: data.paid_amount,
        payment_method_id: data.payment_method_id,
        has_extra_mattress: data.extra_mattress_count > 0,
        extra_mattress_price: data.extra_mattress_count * settings.mat,
        is_invoice_requested: data.is_invoice_requested,
        iva_amount: priceInfo.iva,
        observation: data.observation,
        origin_was_reservation: false // Check-in directo no nace como reserva
      });

      navigate('/calendar');
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRoom && !roomsQuery.isLoading) return <div className="p-8">Habitación no encontrada</div>;
  if (roomsQuery.isLoading || loadingGeo) return <div className="flex justify-center p-24"><ProgressSpinner /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          icon="pi pi-arrow-left" 
          onClick={() => navigate('/calendar')} 
          className="p-button-text p-button-plain p-button-rounded text-gray-400" 
        />
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Check-in</h1>
          <p className="text-gray-500 font-medium">Habitación {selectedRoom?.room_number} - {selectedRoom?.observation || 'Sin observación'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        
        {/* Información de la Habitación */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <i className="pi pi-box text-gray-600"></i>
            <h3 className="font-bold text-gray-700">Información de la Habitación</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#f5f2eb] p-4 rounded-xl">
              <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Camas Dobles</span>
              <span className="text-2xl font-black text-gray-800">{selectedRoom?.beds_double}</span>
            </div>
            <div className="bg-[#f5f2eb] p-4 rounded-xl">
              <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Camas Sencillas</span>
              <span className="text-2xl font-black text-gray-800">{selectedRoom?.beds_single}</span>
            </div>
            <div className="bg-[#f5f2eb] p-4 rounded-xl">
              <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Capacidad Máxima</span>
              <span className="text-2xl font-black text-gray-800">{maxCapacity} personas</span>
            </div>
          </div>
        </div>

        {/* Datos del Huésped */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <i className="pi pi-users text-gray-600"></i>
            <h3 className="font-bold text-gray-700">Datos del Huésped</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mb-6">Busque por número de documento o ingrese los datos del nuevo huésped</p>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2">
              <Controller
                name="doc_type"
                control={control}
                render={({ field }) => (
                  <Dropdown {...field} options={['CC', 'CE', 'PAS', 'NIT']} className="w-full bg-gray-50 border-gray-200" />
                )}
              />
            </div>
            <div className="md:col-span-10 p-inputgroup">
              <InputText 
                {...register('doc_number', { required: true })} 
                placeholder="Número de documento" 
                className="w-full bg-gray-50 border-gray-200" 
              />
              <Button 
                type="button" 
                icon={searching ? "pi pi-spin pi-spinner" : "pi pi-search"} 
                label="Buscar" 
                className="p-button-outlined p-button-plain border-gray-200 text-gray-600 font-bold bg-gray-50 px-6" 
                onClick={searchGuest} 
                disabled={searching}
              />
            </div>
            
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Nombres *</label>
              <InputText {...register('first_name', { required: true })} className="w-full bg-white border-gray-200" />
            </div>
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Apellidos *</label>
              <InputText {...register('last_name', { required: true })} className="w-full bg-white border-gray-200" />
            </div>
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Teléfono *</label>
              <InputText {...register('phone', { required: true })} className="w-full bg-white border-gray-200" />
            </div>
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Correo Electrónico</label>
              <InputText {...register('email')} className="w-full bg-white border-gray-200" />
            </div>
            
            {/* Campos de ubicación dinámica */}
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Departamento</label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Dropdown 
                    {...field} 
                    options={colombiaData.map(d => d.departamento)} 
                    placeholder="Seleccionar departamento" 
                    className="w-full bg-white border-gray-200" 
                    onChange={(e) => {
                        field.onChange(e.value);
                        setValue('city', ''); // Reset city on department change
                    }}
                    filter
                  />
                )}
              />
            </div>
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Municipio</label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Dropdown 
                    {...field} 
                    options={cityOptions} 
                    placeholder={selectedDepartment ? "Seleccionar municipio" : "Primero elija departamento"} 
                    className="w-full bg-white border-gray-200" 
                    disabled={!selectedDepartment}
                    filter
                  />
                )}
              />
            </div>
            <div className="md:col-span-12 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Dirección</label>
              <InputText {...register('address')} className="w-full bg-white border-gray-200" />
            </div>
          </div>
        </div>

        {/* Detalles de la Estadía */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <i className="pi pi-calendar text-gray-600"></i>
            <h3 className="font-bold text-gray-700">Detalles de la Estadía</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Fecha de Entrada *</label>
              <Controller
                name="check_in_date"
                control={control}
                render={({ field }) => (
                  <Calendar 
                    value={field.value} 
                    onChange={(e) => field.onChange(e.value)} 
                    showIcon 
                    dateFormat="dd/mm/yy" 
                    className="w-full" 
                    readOnlyInput 
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Fecha de Salida *</label>
              <Controller
                name="check_out_date"
                control={control}
                render={({ field }) => (
                  <Calendar 
                    value={field.value} 
                    onChange={(e) => field.onChange(e.value)} 
                    showIcon 
                    dateFormat="dd/mm/yy" 
                    className="w-full" 
                    placeholder="dd/mm/aaaa"
                    minDate={checkInDate}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Número de Huéspedes *</label>
              <Controller
                name="person_count"
                control={control}
                render={({ field }) => (
                  <Dropdown 
                    value={field.value} 
                    onChange={(e) => field.onChange(e.value)} 
                    options={Array.from({length: maxCapacity}, (_, i) => ({ label: `${i + 1} persona${i > 0 ? 's' : ''}`, value: i + 1 }))} 
                    className="w-full" 
                  />
                )}
              />
            </div>
            
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Colchonetas Adicionales</label>
              <Controller
                name="extra_mattress_count"
                control={control}
                render={({ field }) => (
                  <Dropdown 
                    value={field.value} 
                    onChange={(e) => field.onChange(e.value)} 
                    options={Array.from({length: 7}, (_, i) => ({ 
                        label: `${i} ($ ${(i * settings.mat).toLocaleString()})`, 
                        value: i 
                    }))} 
                    className="w-full max-w-xs" 
                  />
                )}
              />
            </div>
            
            <div className="md:col-span-3 flex items-center gap-2 mt-2">
                <Controller
                    name="is_invoice_requested"
                    control={control}
                    render={({ field }) => (
                        <Checkbox inputId="iva" checked={field.value} onChange={(e) => field.onChange(e.checked)} />
                    )}
                />
                <label htmlFor="iva" className="text-sm font-medium text-gray-600">Requiere factura electrónica (+19% IVA)</label>
            </div>
            
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Observación (opcional)</label>
              <InputTextarea {...register('observation')} placeholder="Agregar observación..." rows={3} className="w-full bg-gray-50 border-gray-100" />
            </div>
          </div>
        </div>

        {/* Pago */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <i className="pi pi-credit-card text-gray-600"></i>
            <h3 className="font-bold text-gray-700">Pago</h3>
          </div>
          
          <div className="bg-[#f5f2eb] rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">Tarifa por noche ({personCount} persona{personCount > 1 ? 's' : ''})</span>
                  <span className="text-sm font-bold text-gray-800">$ {priceInfo.rate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">Número de noches</span>
                  <span className="text-sm font-bold text-gray-800">{nights} noche{nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center py-1 font-bold">
                  <span className="text-sm text-gray-800">Subtotal hospedaje ({nights} x $ {priceInfo.rate.toLocaleString()})</span>
                  <span className="text-sm text-gray-800">$ {priceInfo.subtotalHospedaje.toLocaleString()}</span>
              </div>
              {extraMattressCount > 0 && (
                <div className="flex justify-between items-center py-1 text-sm">
                  <span className="text-gray-600">Colchonetas adicionales ({extraMattressCount} x $ {settings.mat.toLocaleString()} x {nights} nch)</span>
                  <span className="font-bold text-gray-800">$ {(settings.mat * extraMattressCount * nights).toLocaleString()}</span>
                </div>
              )}
              <Divider className="my-3 opacity-50" />
              <div className="flex justify-between items-center py-1 font-bold">
                  <span className="text-sm text-gray-800">Subtotal</span>
                  <span className="text-sm text-gray-800">$ {priceInfo.subtotal.toLocaleString()}</span>
              </div>
              {invoiceRequested && (
                  <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">IVA (19%)</span>
                      <span className="text-sm font-bold text-gray-800">$ {priceInfo.iva.toLocaleString()}</span>
                  </div>
              )}
              <div className="flex justify-between items-center py-2 mt-2">
                  <span className="text-lg font-black text-gray-900">Total</span>
                  <span className="text-xl font-black text-gray-900">$ {priceInfo.total.toLocaleString()}</span>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Método de Pago</label>
                  <Controller
                    name="payment_method_id"
                    control={control}
                    render={({ field }) => (
                      <Dropdown 
                        {...field} 
                        options={paymentMethods} 
                        optionLabel="name" 
                        optionValue="id" 
                        className="w-full" 
                      />
                    )}
                  />
              </div>
              <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Monto a Pagar</label>
                  <Controller
                    name="paid_amount"
                    control={control}
                    render={({ field }) => (
                      <InputNumber 
                        value={field.value} 
                        onValueChange={(e) => field.onChange(e.value)} 
                        className="w-full" 
                        inputClassName="w-full"
                      />
                    )}
                  />
              </div>
          </div>
        </div>

        {/* Footer Actions */} 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button 
              type="button" 
              label="Cancelar" 
              className="p-button-outlined p-button-plain w-full py-4 rounded-xl font-bold border-gray-200 text-gray-600 bg-white" 
              onClick={() => navigate('/calendar')}
            />
            <Button 
              type="submit" 
              label="Confirmar Check-in" 
              className="w-full py-4 rounded-xl font-bold bg-[#008f51] hover:bg-[#007a44] border-none shadow-lg text-white" 
              loading={loading}
            />
        </div>

      </form>
    </div>
  );
};

export default CheckInPage;
