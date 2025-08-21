"use client";
import { useWarranty } from "@/contexts/WarrantyContext";
import { useState, useEffect } from "react";

export const WarrantyFilters = ({ onSearch }: { onSearch: () => void }) => {
  const { filters, setFilters } = useWarranty();
  const [open, setOpen] = useState(false);

  // Función para obtener el primer día del mes actual en formato YYYY-MM-DD
  const getFirstDayOfMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}-01`;
  };

  // Función para obtener el último día del mes actual en formato YYYY-MM-DD
  const getLastDayOfMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  };

  // Establecer valores por defecto al cargar el componente
  useEffect(() => {
    if (!filters.fromDate) {
      setFilters({ ...filters, fromDate: getFirstDayOfMonth() });
    }
    if (!filters.toDate) {
      setFilters({ ...filters, toDate: getLastDayOfMonth() });
    }
  }, []);

  return (
    <div className="mb-4">
      {/* Botón solo visible en mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden bg-gray-200 px-4 py-2 rounded-lg w-full text-left flex justify-between items-center"
      >
        <span>Filtros</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {/* Contenedor de filtros */}
      <div
        className={`grid grid-cols-1 md:grid-cols-7 gap-2 mt-2 transition-all duration-300 ${
          open ? "block" : "hidden md:grid"
        }`}
      >
        {/* Campo Desde con tipo date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Desde</label>
          <input
            type="date"
            value={filters.fromDate || getFirstDayOfMonth()}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo Hasta con tipo date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Hasta</label>
          <input
            type="date"
            value={filters.toDate || getLastDayOfMonth()}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        <div className="flex flex-col">
            <label className="text-sm text-gray-800">VIN</label>
            <input
              type="text"
              value={filters.vin}
              onChange={(e) => setFilters({ ...filters, vin: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Modelo</label>
           <input
          type="text"
          value={filters.model}
          onChange={(e) => setFilters({ ...filters, model: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Patente</label>
          <input
          type="text"
          value={filters.plate}
          onChange={(e) => setFilters({ ...filters, plate: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Nombre Cliente</label>
            <input
          type="text"
          value={filters.clientName}
          onChange={(e) => setFilters({ ...filters, clientName: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Empresa</label>
          <input
          type="text"
          value={filters.company}
          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
        
        </div>
        <button
          onClick={onSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 col-span-full md:col-span-1"
        >
          Buscar
        </button>
      </div>
    </div>
  );
};