// src/app/components/ClaimModal.tsx

import React, { useState } from "react";
import type { Order } from "../../../app/types"; 
import { updateOrderInternalStatus } from "@/app/ordenes/actions";
interface ClaimModalProps {
  order: Order;
  onClose: () => void;
  onShowHistory: (order: Order) => void;
  onOrderUpdated: () => void;
}

export default function ClaimModal({
  order,
  onClose,
  onShowHistory,
  onOrderUpdated,
}: ClaimModalProps) {
  // Inicializa el estado con el valor del internalStatus de la orden
  const [currentInternalStatus, setCurrentInternalStatus] = useState(order.internalStatus || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Lógica para actualizar el estado interno del reclamo
  const handleUpdateInternalStatus = async () => {
    setIsUpdating(true);
    const statusToUpdate = currentInternalStatus === "" ? null : currentInternalStatus;
    const result = await updateOrderInternalStatus(order.id, statusToUpdate);
    setIsUpdating(false);

    if (result.success) {
      alert("Estado interno del reclamo actualizado con éxito");
      onOrderUpdated();
      onClose();
    } else {
      alert("Error al actualizar el estado interno: " + result.error);
    }
  };

  // Función para obtener la URL de una foto por tipo
  const getPhotoUrl = (type: string) =>
    order.photos?.find((p) => p.type === type)?.url || "-";

  // Función para manejar fotos que pueden ser múltiples
  const getMultiplePhotosUrls = (type: string) =>
    order.photos?.filter((p) => p.type === type).map((p) => p.url).join(", ") || "-";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 z-50">
      <div className="bg-white p-6 rounded-lg w-2/3 max-h-[80vh] overflow-auto relative">
        <h2 className="text-2xl font-bold mb-4">Solicitud de Reclamo</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold"
        >
          ×
        </button>

        {/* Datos del Reclamo */}
        <div className="mb-4 text-xs">
          <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
            <label className="text-gray-800">ID</label>
            <input readOnly value={order.id} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Fecha de Creación</label>
            <input readOnly value={new Date(order.creationDate).toLocaleDateString()} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Empresa</label>
            <input readOnly value={order.company?.name || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Usuario</label>
            <input readOnly value={order.user?.username || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">OR Interna</label>
            <input readOnly value={order.orderNumber} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Pre-autorización</label>
            {/* Asume que existe un campo `preAuthorizationNumber` o similar para conectar con el paso previo */}
            <input readOnly value={order.preAuthorizationNumber || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            
            <div className="flex items-center gap-0.5">
              <label className="text-gray-800">Estado</label>
              <button
                onClick={() => onShowHistory(order)}
                className="text-blue-600 hover:underline text-xs whitespace-nowrap"
              >
                (historial)
              </button>
            </div>
            <input readOnly value={order.status} className="border rounded px-2 py-1 w-full bg-gray-100" />
            
            <label className="text-gray-800">Estado Interno</label>
            <select
              value={currentInternalStatus}
              onChange={(e) => setCurrentInternalStatus(e.target.value as any)}
              className="border rounded px-2 py-1 w-full bg-white text-gray-800"
            >
              <option value=""></option>
              <option value="PENDIENTE_RECLAMO">Pendiente de reclamo</option>
              <option value="RECLAMO_EN_ORIGEN">Reclamada al origen</option>
              <option value="APROBADO_EN_ORIGEN">Aprobada por origen</option>
              <option value="RECHAZADO_EN_ORIGEN">Rechazada por origen</option>
              <option value="CARGADO">Cobrada</option>
              <option value="NO_RECLAMABLE">No reclamable</option>
            </select>
            
            <label className="text-gray-800">Nombre Completo Cliente</label>
            <input readOnly value={`${order.customer?.firstName} ${order.customer?.lastName}`} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">VIN</label>
            <input readOnly value={order.vehicle?.vin || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Activación Garantía</label>
            <input readOnly value={order.vehicle?.warranty?.activationDate ? new Date(order.vehicle.warranty.activationDate).toLocaleDateString() : "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Nro. Motor</label>
            <input readOnly value={order.vehicle?.engineNumber || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Modelo</label>
            <input readOnly value={order.vehicle?.model || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Kilometraje Real</label>
            <input readOnly value={order.actualMileage || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Diagnóstico</label>
            <textarea readOnly value={order.diagnosis || ""} rows={4} className="w-full border rounded px-2 py-1 bg-gray-100 resize-none" />
            <label className="text-gray-800">Observaciones Adicionales</label>
            <textarea readOnly value={order.additionalObservations || ""} rows={4} className="w-full border rounded px-2 py-1 bg-gray-100 resize-none" />
          </div>
        </div>

        {/* Tareas */}
        <div className="text-xs mt-4">
          <h3 className="font-semibold mb-2">Tareas</h3>
          {order.tasks && order.tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="px-3 py-2 border">Tarea</th>
                    <th className="px-3 py-2 border text-center">Cant. horas</th>
                    <th className="px-3 py-2 border text-center">Nro. repuesto</th>
                    <th className="px-3 py-2 border">Descripción repuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {order.tasks.map((task, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50">
                      <td className="px-3 py-1 border">
                        <input
                          readOnly
                          value={task.description || "-"}
                          className="w-full bg-gray-100 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-1 border text-center">
                        <input
                          readOnly
                          value={task.hoursCount || "-"}
                          className="w-full bg-gray-100 border rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-3 py-1 border text-center">
                        <input
                          readOnly
                          value={task.parts?.[0]?.part?.code || "-"}
                          className="w-full bg-gray-100 border rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          readOnly
                          value={task.parts?.[0]?.part?.description || "-"}
                          className="w-full bg-gray-100 border rounded px-2 py-1"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No hay tareas asociadas a esta orden.
            </div>
          )}
        </div>


        {/* Fotos */}
        <div className="mt-4 text-xs">
          <h3 className="font-semibold mb-2">Fotos</h3>
          <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
            <label className="text-gray-800">Foto Patente</label>
            <input readOnly value={getPhotoUrl("license_plate")} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Foto Chapa VIN</label>
            <input readOnly value={getPhotoUrl("vin_plate")} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Foto Cuenta Kilómetros</label>
            <input readOnly value={getPhotoUrl("odometer")} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Fotos Piezas Adicionales</label>
            {/* Como pueden ser varias fotos, se muestran todas las URLs separadas por coma */}
            <input readOnly value={getMultiplePhotosUrls("additional_parts")} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Foto Firma Conformidad Cliente</label>
            <input readOnly value={getPhotoUrl("customer_signature")} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Fotos OR</label>
            {/* Como pueden ser varias fotos, se muestran todas las URLs separadas por coma */}
            <input readOnly value={getMultiplePhotosUrls("or_photo")} className="border rounded px-2 py-1 w-full bg-gray-100" />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleUpdateInternalStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUpdating}
          >
            {isUpdating ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 sm:px-4 sm:py-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}