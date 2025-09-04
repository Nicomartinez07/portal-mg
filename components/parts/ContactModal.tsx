"use client";
import { usePart } from "@/contexts/PartContext";

export const ContactModal = () => {
  const { selectedPart, setSelectedPart } = usePart();

  if (!selectedPart) return null;

  const contact = selectedPart.contact;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-auto relative">
        <h2 className="text-2xl font-bold mb-4">Información de Contacto</h2>
        <button
          onClick={() => setSelectedPart(null)}
          className="absolute top-4 right-4 text-xl font-bold"
        >
          ×
        </button>

        {/* Datos del Contacto */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto</label>
              <input 
                readOnly 
                value={contact.contactName || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                readOnly 
                value={contact.email || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input 
              readOnly 
              value={contact.address || "-"} 
              className="border rounded px-3 py-2 w-full bg-gray-100" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <input 
                readOnly 
                value={contact.state || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
              <input 
                readOnly 
                value={contact.city || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono 1</label>
              <input 
                readOnly 
                value={contact.phone1 || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono 2</label>
            <input 
              readOnly 
              value={contact.phone2 || "-"} 
              className="border rounded px-3 py-2 w-full bg-gray-100" 
            />
          </div>
        </div>

        {/* Botón de Cerrar */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setSelectedPart(null)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};