"use client";

import { MGDashboard } from "../../components/mg-dashboard";
import {
  FaUser,
  FaInfoCircle,
  FaTrashAlt,
  FaPlus,
  FaFileDownload,
} from "react-icons/fa";

export default function EmpresasPage() {
  const empresas = [
    { name: "ANDINA" },
    { name: "CHIAMO MOTORS SRL" },
    { name: "DALIAN S.A." },
    { name: "DCV MOTOR GROUP SA" },
    { name: "EXIMAR" },
    { name: "FICAR AUTOS SA" },
    { name: "GE MOTORS COMPANY S." },
    { name: "GEJACK SA" },
  ];

  return (
    <MGDashboard>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configuración de Empresas</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> Nueva Empresa
          </button>
        </div>

        {/* Search and filter section */}
        <div className="mb-6 flex items-center gap-4">
          <input
            type="text"
            placeholder="Nombre"
            className="border rounded px-3 py-2 w-full max-w-md"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Buscar
          </button>
        </div>

        {/* Table section */}
        <div className="border rounded-lg overflow-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Nombre
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empresas.map((empresa, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-left">{empresa.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      {empresa.name === "EXIMAR" && (
                        <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm flex items-center gap-1">
                          <FaFileDownload className="text-sm" /> repuestos
                        </button>
                      )}
                      <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm flex items-center gap-1">
                        <FaUser className="text-sm" /> usuarios
                      </button>
                      <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm flex items-center gap-1">
                        <FaInfoCircle className="text-sm" /> detalles
                      </button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm flex items-center gap-1">
                        <FaTrashAlt className="text-sm" /> eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MGDashboard>
  );
}
