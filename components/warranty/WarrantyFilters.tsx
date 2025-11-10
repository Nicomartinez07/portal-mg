"use client";
import { useWarranty } from "@/contexts/WarrantyContext";
import { useState, useEffect } from "react";
import { getCompanies } from "@/app/(dashboard)/actions/companies";

export const WarrantyFilters = ({ onSearch }: { onSearch: () => void }) => {
  const { filters, setFilters } = useWarranty();
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  
  // Estado local para los filtros temporales
  const [localFilters, setLocalFilters] = useState({
    vin: "",
    model: "",
    certificateNumber: "",
    status: "",
    fromDate: "",
    toDate: "",
    licensePlate: "",
    customerName: "",
    companyId: undefined as number | undefined,
  });

  // Obtener empresas al cargar el componente
  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

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

  // Sincronizar el estado local con los filtros globales al cargar
  useEffect(() => {
    setLocalFilters({
      vin: filters.vin || "",
      model: filters.model || "",
      certificateNumber: filters.certificateNumber || "",
      status: filters.status || "",
      fromDate: filters.fromDate || getFirstDayOfMonth(),
      toDate: filters.toDate || getLastDayOfMonth(),
      licensePlate: filters.licensePlate || "",
      customerName: filters.customerName || "",
      companyId: filters.companyId,
    });
  }, []);

  // Manejar cambios en los campos de filtro (solo actualiza estado local)
  const handleFilterChange = (key: keyof typeof localFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Manejar la búsqueda: actualizar contexto global y ejecutar búsqueda
  const handleSearchClick = () => {
    // Actualizar los filtros globales con los valores locales
    setFilters(localFilters);
    // Ejecutar la búsqueda
    onSearch();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border mb-4">
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
        className={`grid grid-cols-1 md:grid-cols-8 gap-1 mt-2 transition-all duration-300 ${
          open ? "block" : "hidden md:grid"
        }`}
      >
        {/* Campo Desde con tipo date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Desde</label>
          <input
            type="date"
            value={localFilters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo Hasta con tipo date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Hasta</label>
          <input
            type="date"
            value={localFilters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo VIN */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">VIN</label>
          <input
            type="text"
            value={localFilters.vin}
            onChange={(e) => handleFilterChange('vin', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo Modelo */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Modelo</label>
          <input
            type="text"
            value={localFilters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo Patente */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Patente</label>
          <input
            type="text"
            value={localFilters.licensePlate}
            onChange={(e) => handleFilterChange('licensePlate', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        {/* Campo Nombre Cliente */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Nombre Cliente</label>
          <input
            type="text"
            value={localFilters.customerName}
            onChange={(e) => handleFilterChange('customerName', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        {/* Campo Empresa */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Empresa</label>
          <select
            value={localFilters.companyId || ""}
            onChange={(e) => handleFilterChange('companyId', e.target.value ? Number(e.target.value) : undefined)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value=""></option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Botón de búsqueda */}
        <button
          onClick={handleSearchClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full md:w-auto md:col-span-1"
        >
          Buscar
        </button>
      </div>
    </div>
  );
};