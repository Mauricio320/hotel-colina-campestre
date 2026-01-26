
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { DOC_TYPES } from '@/constants';

const RegisterAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { 
    control, 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      doc_type: '',
      doc_number: '',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log('Iniciando registro para:', data.email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            doc_type: data.doc_type,
            doc_number: data.doc_number,
            phone: data.phone
          }
        }
      });

      if (authError) {
        console.error('Error de Supabase Auth:', authError);
        throw authError;
      }

      console.log('Resultado del registro:', authData);

      // Si el usuario se creó correctamente
      if (authData.user) {
        // En Supabase, si la confirmación de email está DESACTIVADA, 'session' vendrá poblado.
        // Si está ACTIVADA, session será null.
        if (authData.session) {
          alert('¡Registro exitoso! Ya puedes usar el sistema.');
          navigate('/');
        } else {
          alert('¡Registro exitoso! Aunque la confirmación esté desactivada en tus ajustes, si no puedes entrar, verifica si Supabase envió un correo de confirmación por defecto.');
          navigate('/login');
        }
      } else {
        throw new Error('No se pudo crear el usuario.');
      }
      
    } catch (err: any) {
      console.error('Captura de error en registro:', err);
      // El mensaje "Database error saving new user" viene del trigger de Postgres.
      // Hemos actualizado el trigger para que no sea fatal (EXCEPTION WHEN OTHERS THEN RETURN new).
      if (err.message?.includes('Database error saving new user')) {
        setErrorMsg('Error interno del servidor al crear el perfil. Es posible que el usuario se haya creado en la lista de Autenticación pero el perfil de Empleado falló. Intenta iniciar sesión.');
      } else {
        setErrorMsg(err.message || 'Error inesperado durante el registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900 p-4 py-12">
      <Card className="w-full max-w-2xl shadow-2xl border-t-4 border-indigo-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Registro de Administrador</h2>
          <p className="text-gray-500 font-medium">Crea una nueva cuenta administrativa</p>
        </div>

        {errorMsg && (
          <div className="mb-6">
            <Message className="w-full justify-start p-3" severity="error" text={errorMsg} />
            <div className="mt-2 p-3 bg-indigo-50 text-indigo-800 text-xs rounded border border-indigo-200">
              <i className="pi pi-info-circle mr-1"></i>
              Si ves un error de base de datos persistente, asegúrate de haber ejecutado el script SQL en el editor de Supabase.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Tipo Documento</label>
            <Controller
              name="doc_type"
              control={control}
              rules={{ required: 'Campo requerido' }}
              render={({ field, fieldState }) => (
                <Dropdown 
                  id={field.name}
                  value={field.value}
                  options={DOC_TYPES}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="Seleccione"
                  className={`w-full ${fieldState.invalid ? 'p-invalid' : ''}`}
                />
              )}
            />
            {errors.doc_type && <small className="p-error">{errors.doc_type.message as string}</small>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Número Documento</label>
            <InputText 
              {...register('doc_number', { required: 'Campo requerido' })} 
              className={`w-full ${errors.doc_number ? 'p-invalid' : ''}`} 
              placeholder="Ej: 10203040"
            />
            {errors.doc_number && <small className="p-error">{errors.doc_number.message as string}</small>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Nombres</label>
            <InputText 
              {...register('first_name', { required: 'Campo requerido' })} 
              className={`w-full ${errors.first_name ? 'p-invalid' : ''}`} 
            />
            {errors.first_name && <small className="p-error">{errors.first_name.message as string}</small>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Apellidos</label>
            <InputText 
              {...register('last_name', { required: 'Campo requerido' })} 
              className={`w-full ${errors.last_name ? 'p-invalid' : ''}`} 
            />
            {errors.last_name && <small className="p-error">{errors.last_name.message as string}</small>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Correo Electrónico</label>
            <InputText 
              {...register('email', { 
                required: 'Campo requerido', 
                pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
              })} 
              className={`w-full ${errors.email ? 'p-invalid' : ''}`} 
              placeholder="admin@hotel.com"
            />
            {errors.email && <small className="p-error">{errors.email.message as string}</small>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Teléfono</label>
            <InputText {...register('phone')} className="w-full" placeholder="300 123 4567" />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-bold text-gray-700">Contraseña</label>
            <Controller
              name="password"
              control={control}
              rules={{ 
                required: 'La contraseña es obligatoria', 
                minLength: { value: 6, message: 'Mínimo 6 caracteres' } 
              }}
              render={({ field, fieldState }) => (
                <Password 
                  id={field.name}
                  {...field}
                  toggleMask 
                  className="w-full"
                  inputClassName={`w-full ${fieldState.invalid ? 'p-invalid' : ''}`}
                  feedback
                  placeholder="Mínimo 6 caracteres"
                />
              )}
            />
            {errors.password && <small className="p-error">{errors.password.message as string}</small>}
          </div>

          <div className="md:col-span-2 flex flex-col gap-4 mt-6">
            <Button type="submit" label="Crear Cuenta de Administrador" icon="pi pi-user-plus" className="bg-indigo-600 p-3 border-none shadow-md hover:bg-indigo-700 transition-all" loading={loading} />
            <div className="text-center text-sm">
               <span className="text-gray-500 font-medium">¿Ya tienes cuenta? </span>
               <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                 Inicia sesión aquí
               </Link>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterAdmin;
