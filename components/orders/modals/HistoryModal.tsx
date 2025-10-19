// src/app/components/HistoryModal.tsx
"use client";

import React from "react";

// Definimos un tipo para la entrada del historial (basado en tu schema)
interface HistoryEntry {
  id: number;
  status: string | null;
  changedAt: string | Date; // Prisma devuelve string o Date
    observation?: string;
}

interface HistoryModalProps {
  history: HistoryEntry[];
  onClose: () => void;
}

/**
 * Devuelve el estilo de la "píldora" (badge) para cada estado.
 * Ajusta los colores y texto según tus estados.
 */
const StatusBadge = ({ status }: { status: string | null }) => {
  const normalizedStatus = status || "PENDIENTE"; // Asumir PENDIENTE si es nulo

  switch (normalizedStatus) {
    case "AUTORIZADO":
      return (
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-green-400 text-white-700">
          AUTORIZADO
        </span>
      );
    case "RECHAZADO":
      return (
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-red-400 text-white-700">
          RECHAZADO
        </span>
      );
    case "PENDIENTE":
      // Esto simula el rectángulo verde de tu imagen
      return (
        <span className="block w-8 h-5 rounded bg-green-500" title="Pendiente"></span>
      );
    default:
      return (
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
          {normalizedStatus}
        </span>
      );
  }
};


export default function HistoryModal({ history, onClose }: HistoryModalProps) {
  
  // Ordenamos del más reciente al más antiguo
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
      {/* Contenedor del Modal */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Historial de Estados</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold leading-none text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        {/* Contenedor de la tabla (con scroll si es necesario) */}
        <div className="max-h-[60vh] overflow-y-auto border-t border-b border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Observación
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedHistory.length > 0 ? (
                sortedHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {new Date(entry.changedAt).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {entry.observation || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    No hay historial de estados para esta orden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con el botón */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}