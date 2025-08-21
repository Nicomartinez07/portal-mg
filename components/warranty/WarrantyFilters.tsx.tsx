"use client";
import { useWarranty } from "@/contexts/WarrantyContext";

export const WarrantyFilters = ({ onSearch }: { onSearch: () => void }) => {
  const { filters, setFilters } = useWarranty();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <input
        type="text"
        placeholder="VIN"
        value={filters.vin}
        onChange={(e) => setFilters({ ...filters, vin: e.target.value })}
        className="border rounded px-3 py-2 w-full"
      />
      <input
        type="text"
        placeholder="Modelo"
        value={filters.model}
        onChange={(e) => setFilters({ ...filters, model: e.target.value })}
        className="border rounded px-3 py-2 w-full"
      />
      <input
        type="text"
        placeholder="Nro. Certificado"
        value={filters.certificateNumber}
        onChange={(e) =>
          setFilters({ ...filters, certificateNumber: e.target.value })
        }
        className="border rounded px-3 py-2 w-full"
      />
      <select
        value={filters.hasWarranty}
        onChange={(e) => setFilters({ ...filters, hasWarranty: e.target.value })}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="">Garantía</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select>
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="">Estado</option>
        <option value="activa">Activa</option>
        <option value="pendiente">Pendiente</option>
      </select>

      <button
        onClick={onSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 col-span-full md:col-span-1"
      >
        Buscar
      </button>
    </div>
  );
};
