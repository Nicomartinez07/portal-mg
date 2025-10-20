"use client";
import { useCertificate } from "@/contexts/CertificateContext";
import { useState, useEffect } from "react";
import { getCompanies } from "@/app/actions/companies";
import { getCertificate } from "@/app/certificados/actions"; // <-- 1. IMPORTA LA ACTION

export const CertificateFilters = () => {
  const { filters, setFilters, setLoading, setResults } = useCertificate();
  
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  // 3. ESTA ES LA FUNCIÓN QUE BUSCA
  const handleSearch = async () => {
    setLoading(true);
    try {
      // Llama a la action con los filtros del estado
      const results = await getCertificate(filters);
      setResults(results);
    } catch (error) {
      console.error("Error al buscar certificados:", error);
      alert("Error al buscar. Intente de nuevo.");
      setResults([]); 
    } finally {
      setLoading(false);
    }
  };

  // ESTA FUNCIÓN SOLO GUARDA EL ESTADO, NO BUSCA
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let finalValue: string | number | null = value;
    if (name === "garantia" || name === "blocked") {
      finalValue = value === "" ? null : value;
    }

    setFilters({ ...filters, [name]: finalValue });
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md shadow-sm bg-white">
      {/* Botón solo visible en mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden bg-gray-200 px-4 py-2 rounded-lg w-full text-left flex justify-between items-center mb-3"
      >
        <span>Filtros</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {/* --- PRIMERA FILA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Empadronamiento desde</label>
          <input
            type="date"
            name="fromDate" 
            value={filters.fromDate || ''}
            onChange={handleChange} 
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Empadronamiento hasta</label>
          <input
            type="date"
            name="toDate" 
            value={filters.toDate || ''}
            onChange={handleChange} 
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">VIN</label>
          <input
            type="text"
            name="vin" 
            value={filters.vin || ''} 
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Modelo</label>
          <input
            type="text"
            name="model" 
            value={filters.model || ''} 
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Nro. Certificado</label>
          <input
            type="text"
            name="certificateNumber" 
            value={filters.certificateNumber || ''}
            onChange={handleChange} 
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>
      
      {/* --- SEGUNDA FILA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">F. Importación desde</label>
          <input
            type="date"
            name="importDateFrom" 
            value={filters.importDateFrom || ''}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">F. Importación hasta</label>
          <input
            type="date"
            name="importDateTo" 
            value={filters.importDateTo || ''}
            onChange={handleChange} 
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Nro. Certificado/F. Importacion</label>
          {/* Este filtro 'combinacion' no lo usé en la action, 
              pero no molesta dejarlo. Avísame si quieres implementar esa lógica. */}
          <select
            name="combinacion" 
            value={filters.combinacion || ""}
            onChange={handleChange} 
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
            onChange={handleChange} 
            className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value=""></option>
            <option value="ACTIVA">Activa</option>
            <option value="NO_ACTIVA">No Activa</option>
          </select>
        </div>

        {/* Campo Estado y botón de búsqueda */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Estado</label>
          <div className="flex items-end gap-2">
            <select
              name="blocked" 
              value={filters.blocked || ""} 
              onChange={handleChange} 
              className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value=""></option>
              <option value="BLOQUEADO">Bloqueado</option>
              <option value="NO_BLOQUEADO">No bloqueado</option>
            </select>
           <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};