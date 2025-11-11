// components/orders/modals/ViewOrderModal.tsx
import React from 'react';
import OrderPhotosSection from '@/components/awss3/OrderPhotosSection';

interface ViewOrderModalProps {
  onClose: () => void;
  open: boolean;
  order: any; // Tu tipo de Order completo
}

export default function ViewOrderModal({
  onClose,
  open,
  order,
}: ViewOrderModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg w-[1000px] max-h-[90vh] overflow-hidden flex flex-col shadow-lg">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            Orden #{order.orderNumber} - Pre-Autorización
          </h2>
          <button
            onClick={onClose}
            className="text-lg font-bold text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Información de la orden */}
          <div className="space-y-6">
            {/* Datos básicos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Creación
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(order.creationDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <p className="mt-1 text-sm">
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {order.status}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cliente
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {order.customer?.firstName} {order.customer?.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  VIN
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {order.vehicleVin}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kilometraje
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {order.actualMileage} km
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Modelo
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {order.vehicle?.model || 'N/A'}
                </p>
              </div>
            </div>

            {/* Diagnóstico */}
            {order.diagnosis && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                  {order.diagnosis}
                </p>
              </div>
            )}

            {/* Observaciones */}
            {order.additionalObservations && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones Adicionales
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                  {order.additionalObservations}
                </p>
              </div>
            )}

            {/* Tareas */}
            {order.tasks && order.tasks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tareas
                </label>
                <div className="overflow-x-auto border border-gray-300 rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Descripción</th>
                        <th className="px-3 py-2 text-center">Horas</th>
                        <th className="px-3 py-2 text-left">Repuestos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.tasks.map((task: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{task.description}</td>
                          <td className="px-3 py-2 text-center">
                            {task.hoursCount}
                          </td>
                          <td className="px-3 py-2">
                            {task.parts?.map((p: any) => p.part.code).join(', ') || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECCIÓN DE FOTOS */}
            <div className="pt-6 border-t">
              <OrderPhotosSection orderId={order.id} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}