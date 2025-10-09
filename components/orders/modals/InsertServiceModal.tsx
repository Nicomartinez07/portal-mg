"use client";
import React from "react";

interface PreAutorizacionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PreAutorizacionModal: React.FC<PreAutorizacionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-semibold">Ingreso de Pre-Autorización</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm">
          {/* Fecha y campos principales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Fecha creación</label>
              <input
                type="text"
                disabled
                value={new Date().toLocaleString()}
                className="w-full border rounded-md p-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="font-medium">OR interna *</label>
              <input
                type="text"
                placeholder="Ingrese el número interno de orden de reparación"
                className="w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="font-medium">Nombre completo cliente *</label>
              <input
                type="text"
                placeholder="Ingrese el nombre completo del cliente"
                className="w-full border rounded-md p-2"
              />
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="font-medium">VIN *</label>
                <input
                  type="text"
                  placeholder="Ingrese el VIN del vehículo"
                  className="w-full border rounded-md p-2"
                />
              </div>
              <button className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
                Buscar
              </button>
            </div>

            <div>
              <label className="font-medium">Activación garantía</label>
              <input
                type="text"
                disabled
                className="w-full border rounded-md p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="font-medium">Nro. motor</label>
              <input type="text" className="w-full border rounded-md p-2 bg-gray-100" />
            </div>

            <div>
              <label className="font-medium">Modelo</label>
              <input type="text" className="w-full border rounded-md p-2 bg-gray-100" />
            </div>

            <div>
              <label className="font-medium">Kilometraje real *</label>
              <input
                type="text"
                placeholder="Ingrese el kilometraje real del vehículo"
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="font-medium">Diagnóstico *</label>
            <textarea
              placeholder="Ingrese el diagnóstico"
              className="w-full border rounded-md p-2 h-20"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="font-medium">Observaciones adicionales</label>
            <textarea
              placeholder="Ingrese observaciones adicionales"
              className="w-full border rounded-md p-2 h-20"
            />
          </div>

          {/* Tareas */}
          <div>
            <label className="font-medium flex items-center gap-1">
              Tareas <span className="text-blue-500 text-lg">+</span>
            </label>

            <div className="grid grid-cols-4 gap-2 mt-2 items-center">
              <button className="text-red-500 text-lg">−</button>
              <input type="text" placeholder="Tarea" className="border rounded-md p-2" />
              <input type="text" placeholder="Cant. horas" className="border rounded-md p-2" />
              <input type="text" placeholder="Nro. repuesto" className="border rounded-md p-2" />
              <input
                type="text"
                placeholder="Descripción repuesto"
                className="border rounded-md p-2 col-span-2"
              />
              <button className="text-blue-500 text-lg">+</button>
            </div>
          </div>

          {/* Fotos */}
          <div className="space-y-3">
            {[
              "Foto patente",
              "Foto chapa VIN",
              "Foto cuenta kilómetros",
              "Fotos piezas adicionales",
              "Fotos OR",
            ].map((label) => (
              <div key={label}>
                <label className="font-medium">{label}</label>
                <div className="flex">
                  <input
                    type="file"
                    className="flex-1 border rounded-l-md p-2 text-sm"
                  />
                  <button className="bg-gray-200 px-4 py-2 rounded-r-md hover:bg-gray-300">
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-2 bg-gray-100 p-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 flex items-center gap-2">
            <span>📄</span> Borrador
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
            <span>📤</span> Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreAutorizacionModal;
