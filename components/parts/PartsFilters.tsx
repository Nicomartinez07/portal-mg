"use client";
import { useState, useEffect } from "react";
import { useRepuestos } from "@/contexts/PartsContext";

// Definimos el tipo Company para las props
type Company = {
  id: number;
  name: string;
};

// Recibe las compañías como prop
export const RepuestosFilters = ({ companies }: { companies: Company[] }) => {
  const { filters, setFilters } = useRepuestos();

  // Usamos estado local para los filtros (como en Certificados)
  const [localFilters, setLocalFilters] = useState(filters);

  // Sincroniza el estado local si los filtros globales cambian
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocalFilters({
      ...localFilters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(localFilters); // Envía los filtros al contexto
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-wrap items-end gap-4 mb-6"
    >
      {/* Empresa */}
      <div className="flex flex-col flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Empresa
        </label>
        <select
          name="companyId"
          value={localFilters.companyId}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg"
        >
          <option value=""></option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {/* Codigo */}
      <div className="flex flex-col flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Código
        </label>
        <input
          type="text"
          name="code"
          placeholder="Buscar por código"
          value={localFilters.code}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg"
        />
      </div>
      {/* Modelo */}
      <div className="flex flex-col flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Modelo
        </label>
        <input
          type="text"
          name="model" 
          placeholder="Buscar por Modelo"
          value={localFilters.model}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg"
        />
      </div>
      {/* Botón Buscar */}
      <div className="flex items-end">
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
            />
          </svg>
          Buscar
        </button>
      </div>
    </form>
  );
};