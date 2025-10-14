// components/StatusObservationModal.tsx
import React, { useState } from "react";

interface StatusObservationModalProps {
  newStatus: string; 
  onConfirm: (observation: string) => void;
  onClose: () => void;
}

export default function StatusObservationModal({
  newStatus,
  onConfirm,
  onClose,
}: StatusObservationModalProps) {
  const [observation, setObservation] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-1/3 shadow">
        <h3 className="text-lg font-bold mb-2">
          {newStatus === "RECHAZADA"
            ? "Rechazo de Reclamo"
            : "Aprobación de Reclamo"}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Ingresá un mensaje (opcional) para {newStatus === "RECHAZADA" ? "rechazar" : "aprobar"} esta solicitud:
        </p>
        <textarea
          className="w-full border rounded p-2 mb-4 resize-none"
          rows={4}
          placeholder="Podés dejarlo vacío si querés..."
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(observation)}
            className={`px-3 py-1 rounded text-white ${
              newStatus === "RECHAZADA"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {newStatus === "RECHAZADA" ? "Rechazar" : "Aprobar"}
          </button>
        </div>
      </div>
    </div>
  );
}
