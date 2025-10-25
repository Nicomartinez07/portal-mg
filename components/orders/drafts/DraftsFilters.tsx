"use client";
import { useDraft } from "@/contexts/DraftContext";
import { useState, useEffect } from "react";
import { getCompanies } from "@/app/(dashboard)/actions/companies";

export const DraftFilters = () => {
  const { filters, setFilters } = useDraft();
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

  const handleSearch = () => {
    console.log("Búsqueda ejecutada");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border mb-4"> {/* Fondo blanco, borde y sombra */}
      {/* Botón solo visible en mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden bg-gray-200 px-4 py-2 rounded-lg w-full text-left flex justify-between items-center mb-3"
      >
        <span>Filtros</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {/* Contenedor de filtros */}
      <div
        className={`grid grid-cols-1 md:grid-cols-7 gap-3 transition-all duration-300 ${
          open ? "block" : "hidden md:grid"
        }`}
      >
        {/* Campo Desde */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Desde</label>
          <input
            type="date"
            name="fromDate" 
            value={filters.fromDate || getFirstDayOfMonth()}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        {/* Campo Hasta */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Hasta</label>
          <input
            type="date"
            name="toDate" 
            value={filters.toDate || getLastDayOfMonth()}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo Tipo */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Tipo</label>
          <select
            name="type"
            value={filters.type || ""}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value=""></option>
            <option value="PRE_AUTORIZACION">Pre-autorización</option>
            <option value="RECLAMO">Reclamo</option>
            <option value="SERVICIO">Servicio</option>
          </select>
        </div>
        
        {/* Campo Número */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Número</label>
          <input
            name="orderNumber"
            value={filters.orderNumber || ""}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo VIN */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">VIN</label>
          <input
            name="vin"
            value={filters.vin || ""}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        {/* Campo Estado */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Estado</label>
          <select
            name="status"
            value={filters.status || ""}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value=""></option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="AUTORIZADO">Autorizada</option>
            <option value="RECHAZADO">Rechazada</option>
            <option value="BORRADOR">Borrador</option>
          </select>
        </div>

      
        
        {/* Botón de búsqueda */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};