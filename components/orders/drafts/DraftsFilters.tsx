"use client";
import { useDraft } from "@/contexts/DraftContext";
import { useState, useEffect } from "react";

export const DraftFilters = () => {
  const { filters, setFilters } = useDraft();
  const [open, setOpen] = useState(false);

  // Estado local para los filtros temporales
  const [localFilters, setLocalFilters] = useState({
    orderNumber: "",
    vin: "",
    status: "",
    type: "",
    fromDate: "",
    toDate: "",
  });
  // Función para obtener el primer día del mes actual
  const getFirstDayOfMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}-01`;
  };

  // Función para obtener el último día del mes actual
  const getLastDayOfMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  };

  // Sincronizar el estado local con los filtros globales al cargar
  useEffect(() => {
    setLocalFilters({
      orderNumber: filters.orderNumber || "",
      vin: filters.vin || "",
      status: filters.status || "",
      type: filters.type || "",
      fromDate: filters.fromDate || getFirstDayOfMonth(),
      toDate: filters.toDate || getLastDayOfMonth(),
    });
  }, []);

  // Manejar cambios en los campos de filtro (solo actualiza estado local)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar la búsqueda: SOLO actualizar contexto global
  const handleSearchClick = () => {
    setFilters(localFilters);
  };
  return (
    <div className="p-4 bg-white rounded-lg shadow border mb-4">
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
        {/* Campos de filtro usando localFilters */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Desde</label>
          <input
            type="date"
            name="fromDate" 
            value={localFilters.fromDate}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Hasta</label>
          <input
            type="date"
            name="toDate" 
            value={localFilters.toDate}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Tipo</label>
          <select
            name="type"
            value={localFilters.type}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value=""></option>
            <option value="PRE_AUTORIZACION">Pre-autorización</option>
            <option value="RECLAMO">Reclamo</option>
            <option value="SERVICIO">Servicio</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Número</label>
          <input
            name="orderNumber"
            value={localFilters.orderNumber}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">VIN</label>
          <input
            name="vin"
            value={localFilters.vin}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Estado</label>
          <select
            name="status"
            value={localFilters.status}
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
            onClick={handleSearchClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};