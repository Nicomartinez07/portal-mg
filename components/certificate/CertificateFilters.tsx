"use client";
// Importamos 'useState' y 'useEffect' para el estado local
import { useCertificate } from "@/contexts/CertificateContext";
import { useState, useEffect } from "react";
import { getCompanies } from "@/app/(dashboard)/actions/companies";
// ⛔ YA NO importamos getCertificates aquí, eso lo hace la tabla.

export const CertificateFilters = () => {
  // 1. Obtenemos SÓLO 'filters' y 'setFilters' del contexto
  const { filters, setFilters } = useCertificate();
  
  // 2. Creamos un ESTADO LOCAL para los filtros
  //    Esto evita que la tabla se recargue con cada tecla que presionas
  const [localFilters, setLocalFilters] = useState(filters);
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  // 3. Este useEffect opcional mantiene el estado local
  //    sincronizado si los filtros se resetean desde otro lugar.
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);


  // 4. Esta función AHORA actualiza el estado LOCAL
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let finalValue: string | number | null = value;
    if (name === "garantia" || name === "blocked") {
      finalValue = value === "" ? null : value;
    }

    setLocalFilters({ ...localFilters, [name]: finalValue });
  };

  // 5. El botón de búsqueda AHORA solo actualiza el CONTEXTO
  //    con los filtros locales. La tabla reaccionará a este cambio.
  const handleSearch = () => {
    setFilters(localFilters);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md shadow-sm bg-white">
      {/* Botón solo visible en mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden bg-gray-200 px-4 py-2 rounded-lg w-full text-left flex justify-between items-center"
      >
        <span>Filtros</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      
      {/* Contenedor plegable */}
      <div className={`flex flex-col gap-4 ${open ? "flex" : "hidden md:flex"}`}>

        {/* --- PRIMERA FILA --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">Empadronamiento desde</label>
            <input
              type="date"
              name="fromDate" 
              value={localFilters.fromDate || ''} // <-- Usa localFilters
              onChange={handleChange} 
              className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">Empadronamiento hasta</label>
            <input
              type="date"
              name="toDate" 
              value={localFilters.toDate || ''} // <-- Usa localFilters
              onChange={handleChange} 
              className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">VIN</label>
            <input
              type="text"
              name="vin" 
              value={localFilters.vin || ''} // <-- Usa localFilters
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">Modelo</label>
            <input
              type="text"
              name="model" 
              value={localFilters.model || ''} // <-- Usa localFilters
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">Nro. Certificado</label>
            <input
              type="text"
              name="certificateNumber" 
              value={localFilters.certificateNumber || ''} // <-- Usa localFilters
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
              value={localFilters.importDateFrom || ''} // <-- Usa localFilters
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">F. Importación hasta</label>
            <input
              type="date"
              name="importDateTo" 
              value={localFilters.importDateTo || ''} // <-- Usa localFilters
              onChange={handleChange} 
              className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">Nro. Certificado/F. Importacion</label>
            <select
              name="combinacion" 
              value={localFilters.combinacion || ""} // <-- Usa localFilters
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
              value={localFilters.garantia || ""} // <-- Usa localFilters
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
                value={localFilters.blocked || ""} // <-- Usa localFilters
                onChange={handleChange} 
                className="border rounded-md px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value=""></option>
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="NO_BLOQUEADO">No bloqueado</option>
              </select>
              <button
                onClick={handleSearch} // <-- Llama al nuevo handleSearch
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
    </div>
  );
};