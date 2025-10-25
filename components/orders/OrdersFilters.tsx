"use client";
import { useOrder } from "@/contexts/OrdersContext";
import { useState, useEffect } from "react";
import { getCompanies } from "@/app/(dashboard)/actions/companies";

export const OrderFilters = () => {
  const { filters: appliedFilters, setFilters: setAppliedFilters } = useOrder();
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [localFilters, setLocalFilters] = useState(appliedFilters);

  // Obtener empresas al cargar el componente
  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);


  // handleSearch AHORA ES EL QUE ACTUALIZA EL ESTADO GLOBAL
  const handleSearch = () => {
    // Pasa el estado LOCAL al estado GLOBAL
    setAppliedFilters(localFilters);
    console.log("Búsqueda ejecutada con filtros:", localFilters);
  };

  // 5. handleChange AHORA ACTUALIZA EL ESTADO LOCAL
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Actualiza 'localFilters', no el global 'setFilters'
    setLocalFilters({ ...localFilters, [name]: value });
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
        className={`grid grid-cols-1 md:grid-cols-9 gap-3 transition-all duration-300 ${
          open ? "block" : "hidden md:grid"
        }`}
      >
        
        {/* Campo Desde */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Desde</label>
          <input
            type="date"
            name="fromDate" 
            value={localFilters.fromDate || ''}
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
            value={localFilters.toDate || ''}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo Tipo */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Tipo</label>
          <select
            name="type"
            value={localFilters.type || ""} // Lee de localFilters
            onChange={handleChange} // Actualiza localFilters
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
            value={localFilters.orderNumber || ""} // Lee de localFilters
            onChange={handleChange} // Actualiza localFilters
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        
        {/* Campo VIN */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">VIN</label>
          <input
            name="vin"
            value={localFilters.vin || ""} // Lee de localFilters
            onChange={handleChange} // Actualiza localFilters
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        {/* Campo Estado */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Estado</label>
          <select
            name="status"
            value={localFilters.status || ""} // Lee de localFilters
            onChange={handleChange} // Actualiza localFilters
            className="border rounded px-2 py-1 w-full"
          >
            <option value=""></option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="AUTORIZADO">Autorizada</option>
            <option value="RECHAZADO">Rechazada</option>
          </select>
        </div>

        {/* Campo Estado Interno */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Estado Interno</label>
          <select
            name="internalStatus"
            value={localFilters.internalStatus || ""} // Lee de localFilters
            onChange={handleChange} // Actualiza localFilters
            className="border rounded px-2 py-1 w-full"
          >
            <option value=""></option>
            <option value="PENDIENTE_RECLAMO">Pendiente Reclamo</option>
            <option value="RECLAMO_EN_ORIGEN">Reclamo en Origen</option>
            <option value="APROBADO_EN_ORIGEN">Aprobado en Origen</option>
            <option value="RECHAZADO_EN_ORIGEN">Rechazado en Origen</option>
            <option value="CARGADO">Cargado</option>
            <option value="NO_RECLAMABLE">No Reclamable</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-800 mb-1">Empresa</label>
          <select
            value={localFilters.companyId || ""} // Esto ya es un string
            onChange={(e) =>
                // QUITAR LA CONVERSIÓN A Number()
                setLocalFilters({ ...localFilters, companyId: e.target.value })
              }
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
        <div className="flex items-end">
          <button
            onClick={handleSearch} // 7. ESTE ES EL TRIGGER
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};