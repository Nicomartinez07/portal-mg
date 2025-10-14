// app/components/ImportButtonAndModal.tsx
'use client';

import { useState } from 'react';
// 🚨 Importa tu componente de modal de importación aquí
import  ImportPartModal  from '@/components/parts/ImportPartsModal';
export function ImportButtonAndModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Botón "Importar Stock" */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6-6m-6 6l-6-6M9 10h6" />
        </svg>
        Importar Stock
      </button>

      {/* Modal de Importación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center bg-black/50 z-[60]"> 
            {/* 🚨 ImportPartModal es el componente Server Component que trae las empresas y renderiza el formulario */}
            <ImportPartModal 
                // La función para cerrar el modal se pasa al componente de formulario interno (ImportPartForm)
                // para que pueda cerrarse al terminar la importación o al presionar "Cancelar".
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
      )}
    </>
  );
}