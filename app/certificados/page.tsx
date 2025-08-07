"use client";

import { MGDashboard } from "../../components/mg-dashboard";

export default function CertficadosPage() {
  return (
    <MGDashboard>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-6">Consulta de Certificados</h1>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="VIN"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="text"
            placeholder="Modelo"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="text"
            placeholder="Nro. Certificado"
            className="border rounded px-3 py-2 w-full"
          />
          <select className="border rounded px-3 py-2 w-full">
            <option value="">Garantía</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
          <select className="border rounded px-3 py-2 w-full">
            <option value="">Estado</option>
            <option value="activa">Activa</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">Total: 2</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Importar CSV
          </button>
        </div>

        {/* Tabla */}
        <div className="border rounded-lg overflow-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">VIN</th>
                <th className="px-4 py-2 text-left">Modelo</th>
                <th className="px-4 py-2 text-left">Nro. Certificado</th>
                <th className="px-4 py-2 text-left">F. Importación</th>
                <th className="px-4 py-2 text-left">Garantía</th>
                <th className="px-4 py-2 text-left">Venta</th>
                <th className="px-4 py-2 text-left">Empresa</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-t">
                <td className="px-4 py-2">L67775258KN405696</td>
                <td className="px-4 py-2">GEELY EM-X7-B</td>
                <td className="px-4 py-2">33-0002980/2020</td>
                <td className="px-4 py-2">20/12/2020</td>
                <td className="px-4 py-2">
                  <input type="checkbox" checked readOnly />
                </td>
                <td className="px-4 py-2">30/12/2020</td>
                <td className="px-4 py-2">GRUPO SCHOJ SA.</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm">
                    🛡️ Garantía
                  </button>
                  <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm">
                    📄 Certificado
                  </button>
                </td>
              </tr>
              {/* Otro ejemplo */}
              <tr className="border-t">
                <td className="px-4 py-2">LB3774251KH001085</td>
                <td className="px-4 py-2">GEELY EM-GS-B</td>
                <td className="px-4 py-2">49-0000488/2019</td>
                <td className="px-4 py-2">04/09/2019</td>
                <td className="px-4 py-2">
                  <input type="checkbox" checked readOnly />
                </td>
                <td className="px-4 py-2">13/05/2021</td>
                <td className="px-4 py-2">GLOKER TRUCKS SA</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm">
                    🛡️ Garantía
                  </button>
                  <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm">
                    📄 Certificado
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
            &laquo;
          </button>
          <button className="px-3 py-1 border rounded text-sm bg-blue-100 text-blue-700">
            1
          </button>
          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
            2
          </button>
          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
            3
          </button>
          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
            &raquo;
          </button>
        </div>
      </div>
    </MGDashboard>
  );
}
