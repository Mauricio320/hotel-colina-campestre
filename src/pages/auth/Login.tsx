
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error detail:', err);
      
      if (err.message === 'Invalid login credentials') {
        setErrorMsg('Correo o contraseña incorrectos. Si aún no tienes cuenta, regístrate como administrador.');
      } else if (err.message?.includes('Email not confirmed')) {
        setErrorMsg('Tu correo no ha sido confirmado. Revisa tu bandeja de entrada o desactiva la confirmación en Supabase.');
      } else {
        setErrorMsg('Error al intentar acceder: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-indigo-500 rounded-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4 shadow-inner">
            <i className="pi pi-building text-4xl text-indigo-600"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Acceso al Sistema</h2>
          <p className="text-gray-500 text-sm font-medium">Hotel Colina Campestre</p>
        </div>

        {errorMsg && (
          <div className="mb-6 animate-fade-in">
            <Message className="w-full justify-start border-l-4" severity="error" text={errorMsg} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-bold text-gray-700">Correo Electrónico</label>
            <span className="p-input-icon-left">
              <i className="pi pi-envelope text-indigo-400" />
              <InputText 
                id="email" 
                {...register('email', { required: 'El correo es obligatorio' })}
                className={`w-full p-inputtext-lg ${errors.email ? 'p-invalid' : ''}`}
                placeholder="ejemplo@hotel.com"
              />
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Contraseña</label>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'La contraseña es obligatoria' }}
              render={({ field, fieldState }) => (
                <Password 
                  id={field.name}
                  {...field}
                  toggleMask
                  className="w-full"
                  inputClassName={`w-full p-inputtext-lg ${fieldState.invalid ? 'p-invalid' : ''}`}
                  placeholder="********"
                  feedback={false}
                />
              )}
            />
          </div>

          <Button 
            type="submit" 
            label="Entrar" 
            icon="pi pi-sign-in" 
            className="mt-4 p-button-lg bg-indigo-600 hover:bg-indigo-700 border-none transition-all shadow-lg font-bold py-3" 
            loading={loading} 
          />
          
          <div className="mt-8 text-center text-sm border-t pt-6">
            <p className="text-gray-500 mb-2">¿Es tu primera vez o perdiste el acceso?</p>
            <Link to="/register-admin" className="text-indigo-600 font-black hover:underline text-base">
              Crear Nueva Cuenta de Admin
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
