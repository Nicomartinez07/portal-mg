// app/reset-password/page.tsx
'use client';

import React, { useState, startTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/app/(auth)/login/password/actions';
import { Eye, EyeOff } from 'lucide-react';

type ActionState = {
  error?: string;
  success?: string;
};

const initialState: ActionState = {};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<ActionState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Si no hay token, mostramos error
  if (!token) {
    return (
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Token Inválido</h2>
        <p className="text-red-400">
          El enlace de reseteo es inválido o ha expirado.
        </p>
      </div>
    );
  }
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('token', token); // Agregamos el token al form data
    
    // Simple validación de cliente
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setState({ error: 'Las contraseñas no coinciden.' });
      return;
    }

    setIsPending(true);
    startTransition(async () => {
      const result = await resetPassword(formData);
      setState(result);
      if (result.success) {
        // Si fue exitoso, lo mandamos al login después de 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
      setIsPending(false);
    });
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-white text-3xl font-bold mb-6 text-center">
        Crear nueva contraseña
      </h2>

      {state.success ? (
        <div className="text-center">
          <p className="text-green-400 text-lg mb-4">{state.success}</p>
          <p className="text-gray-300">Serás redirigido al login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Nueva Contraseña */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-300 text-sm font-bold mb-2"
            >
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Nueva Contraseña"
                required
                className="shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 pr-10 text-white bg-gray-700 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-300 text-sm font-bold mb-2"
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              required
              className="shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white bg-gray-700 placeholder-gray-500"
            />
          </div>

          {state.error && (
            <p className="text-red-400 text-sm mb-4 text-center">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : 'Establecer nueva contraseña'}
          </button>
        </form>
      )}
    </div>
  );
}

// Página principal que envuelve el formulario
export default function ResetPasswordPage() {
  return (
    // Usamos <Suspense> porque `useSearchParams` lo requiere
    <Suspense fallback={<div className="text-white">Cargando...</div>}>
      <div
        className="relative flex items-center justify-center min-h-screen bg-cover bg-center px-4"
        style={{ backgroundImage: "url('/fotito.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 z-0" />
        <div className="relative z-10 bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
          <ResetPasswordForm />
        </div>
      </div>
    </Suspense>
  );
}