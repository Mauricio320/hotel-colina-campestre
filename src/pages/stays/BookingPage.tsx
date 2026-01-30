
import React, { useState, useEffect, useMemo } from 'react';
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

import { useRooms } from '@/hooks/useRooms';
import { useGuests } from '@/hooks/useGuests';
import { useStays } from '@/hooks/useStays';
import { useAuth } from '@/hooks/useAuth';
import { useStayPricing } from '@/hooks/useStayPricing';
import { useBlockUI } from '@/context/BlockUIContext';
import { supabase } from '@/config/supabase';
import GuestDataForm from '@/components/stays/GuestDataForm';
import StayDetailsForm from '@/components/stays/StayDetailsForm';
import PaymentSection from '@/components/stays/PaymentSection';

interface ColombiaData {
  id: number;
  departamento: string;
  ciudades: string[];
}

const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab');
  const { employee } = useAuth();
  const { roomsQuery } = useRooms();
  const { findGuestByDoc, upsertGuest } = useGuests();
  const { createStayWithPayment } = useStays();
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [guestNotFound, setGuestNotFound] = useState(false);
  const [guestFound, setGuestFound] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{
    type: 'success' | 'info' | null;
    text: string;
  }>({ type: null, text: '' });
  const [settings, setSettings] = useState({ iva: 19, mat: 30000 });
  
  const [colombiaData, setColombiaData] = useState<ColombiaData[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(true);

  const selectedRoom = useMemo(() => 
    roomsQuery.data?.find(r => r.id === roomId), 
  [roomsQuery.data, roomId]);

  const maxCapacity = useMemo(() => {
    if (!selectedRoom) return 1;
    return (selectedRoom.beds_double * 2) + selectedRoom.beds_single;
  }, [selectedRoom]);

  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      doc_type: 'CC',
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

  const cityOptions = useMemo(() => {
    if (!selectedDepartment || !colombiaData.length) return [];
    const dept = colombiaData.find(d => d.departamento === selectedDepartment);
    return dept ? dept.ciudades : [];
  }, [selectedDepartment, colombiaData]);

  

  const searchGuest = async () => {
    // Validaciones iniciales
    if (searching) return;
    if (watchDocNumber.length < 5) return;
    
    // 1. Limpiar siempre al inicio de CADA búsqueda
    setGuestNotFound(false);
    setGuestFound(false);
    setSearchMessage({ type: null, text: '' });
    
    setValue('first_name', '');
    setValue('last_name', '');
    setValue('phone', '');
    setValue('email', '');
    setValue('address', '');
    setValue('department', '');
    setValue('city', '');
    setValue('doc_type', 'CC');
    
    // 2. Ejecutar búsqueda
    setSearching(true);
    showBlockUI("Buscando huésped...");
    
    try {
      const guest = await findGuestByDoc(watchDocNumber);
      if (guest) {
        setValue('first_name', guest.first_name);
        setValue('last_name', guest.last_name);
        setValue('phone', guest.phone || '');
        setValue('email', guest.email || '');
        setValue('address', guest.address || '');
        setValue('doc_type', guest.doc_type);
        
        if (guest.city) {
          const deptFound = colombiaData.find(d => d.ciudades.includes(guest.city));
          if (deptFound) {
            setValue('department', deptFound.departamento);
            setTimeout(() => setValue('city', guest.city), 0);
          } else {
              setValue('city', guest.city);
          }
        }
        
        // Establecer estado de éxito y mensaje
        setGuestFound(true);
        setSearchMessage({
          type: 'success',
          text: `Huésped ${guest.first_name} ${guest.last_name} encontrado. Puede actualizar su información si es necesario.`
        });
      } else {
        setGuestNotFound(true);
        setSearchMessage({
          type: 'info',
          text: 'No se encontró ningún huésped con ese número de documento. Por favor llene los demás campos para registrar un nuevo huésped.'
        });
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      showBlockUI("Error al buscar huésped");
      setTimeout(hideBlockUI, 2000);
    } finally {
      hideBlockUI();
      // Asegurar que searching se resetee siempre
      setTimeout(() => setSearching(false), 0);
    }
  };

  // Use the centralized pricing hook
  const { nights, priceInfo } = useStayPricing({
    room: selectedRoom,
    checkInDate,
    checkOutDate,
    personCount,
    extraMattressCount,
    invoiceRequested,
    settings
  });

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

      await createStayWithPayment.mutateAsync({
        stayData: {
          room_id: roomId,
          guest_id: guest.id,
          employee_id: employee?.id || null,
          check_in_date: data.check_in_date.toLocaleDateString('sv-SE'),
          check_out_date: data.check_out_date.toLocaleDateString('sv-SE'),
          status: 'Reserved',
          total_price: priceInfo.total,
          paid_amount: data.paid_amount,
          payment_method_id: data.payment_method_id,
          has_extra_mattress: data.extra_mattress_count > 0,
          extra_mattress_price: data.extra_mattress_count * settings.mat,
          is_invoice_requested: data.is_invoice_requested,
          iva_amount: priceInfo.iva,
          observation: data.observation,
          origin_was_reservation: true, // Marcamos que esta orden nació como reserva
          // New configuration fields
          iva_percentage: settings.iva,
          person_count: data.person_count,
          extra_mattress_count: data.extra_mattress_count,
          extra_mattress_unit_price: settings.mat,
        },
        paymentData: {
          amount: data.paid_amount,
          payment_method_id: data.payment_method_id,
          employee_id: employee?.id || null,
          context: 'reservation',
          customObservation: data.paid_amount > 0 
            ? `Reserva${data.paid_amount >= priceInfo.total ? ' (pagada completamente)' : ' (con abono parcial)'}`
            : 'Reserva sin abono inicial'
        }
      });

      const tabParam = searchParams.get('tab');
      navigate(tabParam ? `/calendar?tab=${tabParam}` : '/calendar');
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
      <div className="flex items-center gap-4 mb-8">
        <Button 
          icon="pi pi-arrow-left" 
          onClick={() => navigate(tabParam ? `/calendar?tab=${tabParam}` : '/calendar')} 
          className="p-button-text p-button-plain p-button-rounded text-gray-400" 
        />
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Reservar Habitación</h1>
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

        <GuestDataForm
          register={register}
          control={control}
          setValue={setValue}
          searching={searching}
          searchGuest={searchGuest}
          cityOptions={cityOptions}
          selectedDepartment={selectedDepartment}
          colombiaData={colombiaData}
          guestNotFound={guestNotFound}
          guestFound={guestFound}
          searchMessage={searchMessage}
          watchDocNumber={watchDocNumber}
        />

        <StayDetailsForm
          title="Detalles de la Reserva"
          control={control}
          register={register}
          setValue={setValue}
          watch={watch}
          checkInDate={checkInDate}
          maxCapacity={maxCapacity}
          settings={settings}
        />

        <PaymentSection
          title="Pago / Anticipo"
          priceInfo={priceInfo}
          nights={nights}
          personCount={personCount}
          extraMattressCount={extraMattressCount}
          settings={settings}
          paymentMethods={paymentMethods}
          control={control}
          setValue={setValue}
          watch={watch}
          isReservation={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button 
              type="button" 
              label="Cancelar" 
              className="p-button p-button-outlined w-full"
              onClick={() => navigate(tabParam ? `/calendar?tab=${tabParam}` : '/calendar')}
            />
            <Button 
              type="submit" 
              label="Confirmar Reserva" 
              className="p-button p-button-warning w-full"
              loading={loading}
            />
        </div>

      </form>
    </div>
  );
};

export default BookingPage;
