"use client";
import { useCertificate } from "@/contexts/CertificateContext";
import { useState, useEffect } from "react";
import { getCompanies } from "@/app/actions/companies";

export const CertificateFilters = ({ onSearch }: { onSearch: () => void }) => {
  const { filters, setFilters } = useCertificate();
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  const getFirstDayOfMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}-01`;
  };

  const getLastDayOfMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!filters.fromDate) {
      setFilters(prevFilters => ({ ...prevFilters, fromDate: getFirstDayOfMonth() }));
    }
    if (!filters.toDate) {
      setFilters(prevFilters => ({ ...prevFilters, toDate: getLastDayOfMonth() }));
    }
  }, [filters, setFilters]);

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md shadow-sm bg-white">
      {/* Primera fila de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Empadronamiento desde</label>
          <input
            type="date"
            value={filters.fromDate || ''}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Empadronamiento hasta</label>
          <input
            type="date"
            value={filters.toDate || ''}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">VIN</label>
          <input
            type="text"
            value={filters.vin}
            onChange={(e) => setFilters({ ...filters, vin: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Modelo</label>
          <input
            type="text"
            value={filters.model}
            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Nro. Certificado</label>
          <input
            type="text"
            value={filters.certificateNumber}
            onChange={(e) => setFilters({ ...filters, certificateNumber: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>
      
      {/* Segunda fila de filtros y botón */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">F. Importación desde</label>
          <input
            type="date"
            value={filters.importDateFrom || ''}
            onChange={(e) => setFilters({ ...filters, importDateFrom: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">F. Importación hasta</label>
          <input
            type="date"
            value={filters.importDateTo || ''}
            onChange={(e) => setFilters({ ...filters, importDateTo: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Nro. Certificado/F. Importacion</label>
          <select
            name="bothfilters"
            value={filters.combinacion || ""}
            onChange={(e) => setFilters({ ...filters, combinacion: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value=""></option>
            <option value="AMBOS">Nro Certificado y F.Importacion</option>
            <option value="NRO_CERTIFICADO">Solo Nro Certificado</option>
            <option value="F_IMPORTACION">Solo F Importacion</option>
            <option value="NINGUNO">Ninguno</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Garantía</label>
          <select
            name="garantia"
            value={filters.garantia || ""}
            onChange={(e) => setFilters({ ...filters, garantia: e.target.value })}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value=""></option>
            <option value="PENDIENTE_RECLAMO">Activa</option>
            <option value="RECLAMO_EN_ORIGEN">No Activa</option>
          </select>
        </div>

        {/* Campo Estado y botón de búsqueda */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Estado</label>
          <div className="flex items-end gap-2">
            <select
              name="blockedStatus"
              value={filters.blocked || ""}
              onChange={(e) => setFilters({ ...filters, blocked: e.target.value })}
              className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value=""></option>
              <option value="PENDIENTE_RECLAMO">Bloqueado</option>
              <option value="RECLAMO_EN_ORIGEN">No bloqueado</option>
            </select>
            <button
              onClick={onSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};