'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, startTransition } from 'react';
import { loginUser } from '@/app/login/actions';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const LoginForm = () => {
  const router = useRouter();
  const [state, formAction] = React.useActionState(loginUser, { error: '', success: false });
  const [showPassword, setShowPassword] = useState(false);

  // Efecto para chequear cuando el login fue exitoso
  useEffect(() => {
    console.log("[LoginForm] State cambiado:", state);
    if (state?.success) {
      router.push('/');
      console.log("[LoginForm] Login exitoso, redirigido...");
    }
  }, [state, router]);

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center px-4 sm:px-6"
      style={{ backgroundImage: "url('/fotito.png')" }}
    >
      {/* Overlay oscuro para mejorar contraste */}
      <div className="absolute inset-0 bg-black opacity-50 z-0" />

      <div className="relative z-10 bg-gray-700 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
        <h1 className="text-white text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Postventa MG
        </h1>
        <h2 className="text-white text-lg sm:text-xl mb-4 sm:mb-6 text-center">
          Inicia Sesión con tu cuenta
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("[LoginForm] Submit manual");

            const formData = new FormData(e.currentTarget);

            startTransition(() => {
              formAction(formData);
            });
          }}
        >
          {/* Usuario */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-300 text-sm font-bold mb-2"
            >
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Usuario"
              className="shadow appearance-none border rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-gray-700 bg-gray-200 placeholder-gray-500"
            />
          </div>

          {/* Contraseña */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-300 text-sm font-bold mb-2"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Contraseña"
                className="shadow appearance-none border rounded w-full py-2 sm:py-3 px-3 sm:px-4 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {state?.error && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {state.error}
            </p>
          )}

          {/* Recordarme + Botón */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <label className="flex items-center text-gray-300">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Recordarme</span>
            </label>
            <button
              type="submit"
              disabled={state?.isPending}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
            >
              {state?.isPending ? 'Cargando...' : 'Login'}
            </button>
          </div>

          {/* Mensaje final */}
          <div className="text-center text-gray-300 text-sm">
            <p>
              Si no tienes cuenta o olvidaste tu contraseña contacta a Soporte
              técnico.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
