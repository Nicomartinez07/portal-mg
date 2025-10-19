// components/auth/ForgotPasswordModal.tsx (o donde pongas tus componentes)
'use client';

import React, { useState, startTransition } from 'react';
// Importaremos la nueva action
import { requestPasswordReset } from '@/app/login/password/actions'; 
import { ArrowLeft, Send } from 'lucide-react';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

// Define el estado inicial
type ActionState = {
  error?: string;
  success?: string;
};

const initialState: ActionState = {};

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  // Usamos un estado simple para el modal, `useActionState` es más para formularios
  const [state, setState] = useState<ActionState>(initialState);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    setIsPending(true);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      setState(result);
      setIsPending(false);
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="relative z-10 bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        
        <h2 className="text-white text-3xl font-bold mb-2 text-center">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Ingresá tu e-mail debajo para resetear tu contraseña.
        </p>
        
        {/* Si el envío fue exitoso, mostramos mensaje y ocultamos el form */}
        {state.success ? (
          <div className="text-center">
            <p className="text-green-400 mb-6">{state.success}</p>
            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="shadow-sm appearance-none border border-gray-600 rounded w-full py-3 px-4 pl-10 text-white bg-gray-700 placeholder-gray-500 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Email"
                />
              </div>
            </div>
            
            {state.error && (
              <p className="text-red-400 text-sm mb-4 text-center">
                {state.error}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2"
                disabled={isPending}
              >
                <ArrowLeft size={20} />
                Atrás
              </button>
              <button
                type="submit"
                className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? 'Enviando...' : (
                  <>
                    Resetear
                    <Send size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}