import React from "react";
import type { Order } from "../../../app/types";

interface ServiceModalProps {
  order: Order;
  onClose: () => void;
  onShowHistory: (order: Order) => void;
}

export default function ServiceModal({ order, onClose, onShowHistory }: ServiceModalProps) {
  const getPhotoUrl = (type: string) =>
    order.photos?.find((p) => p.type === type)?.url || "-";

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-lg w-[90%] sm:w-[70%] md:w-[700px] lg:w-[750px] max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header fijo */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-2xl font-bold">Ingreso de Servicio</h2>
        <button
          onClick={onClose}
          className="text-xl font-bold text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Contenido scrollable */}
      <div className="overflow-y-auto flex-1 p-6">
        {/* Datos de la Orden */}
        <div className="mb-4 text-xs">
          <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
            {/* Campos de la orden */}
            <label className="text-gray-800">Id</label>
            <input readOnly value={order.id} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Fecha</label>
            <input readOnly value={new Date(order.creationDate).toLocaleDateString()} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">OR Interna</label>
            <input readOnly value={order.orderNumber} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">VIN</label>
            <input readOnly value={order.vehicle?.vin || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Activacion Garantia</label>
            <input readOnly value={order.vehicle?.warranty?.activationDate ? new Date(order.vehicle.warranty.activationDate).toLocaleDateString() : "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Nro. Motor</label>
            <input readOnly value={order.vehicle?.engineNumber || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Modelo</label>
            <input readOnly value={order.vehicle?.model || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Servicio</label>
            <input readOnly value={order.type || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Kilometraje real</label>
            <input readOnly value={order.actualMileage || "-"} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Observaciones</label>
            <textarea readOnly value={order.additionalObservations || ""} rows={4} className="w-full border rounded px-2 py-1 bg-gray-100 resize-none" />
          </div>
        </div>

        {/* Fotos */}
        <div className="mt-4 text-xs">
          <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
            <label className="text-gray-800">Foto Chapa VIN</label>
            <input readOnly value={getPhotoUrl("vin_plate")} className="border rounded px-2 py-1 w-full bg-gray-100" />
            <label className="text-gray-800">Fotos OR</label>
            <input readOnly value={getPhotoUrl("or_photo")} className="border rounded px-2 py-1 w-full bg-gray-100" />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 sm:px-4 sm:py-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
);
}