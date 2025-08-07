"use client"

import { MGDashboard } from "../../components/mg-dashboard"

export default function GarantiasPage() {
  return (
    <MGDashboard>
      <div className="bg-white rounded-lg shadow-sm h-full p-6">
        <h1 className="text-3xl font-bold mb-6">Gestión de Garantías</h1>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lista de Garantías</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Nueva Garantía</button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">#001</td>
                  <td className="px-4 py-3">Juan Pérez</td>
                  <td className="px-4 py-3">MG ZS 2023</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Activa</span>
                  </td>
                  <td className="px-4 py-3">15/01/2024</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">#002</td>
                  <td className="px-4 py-3">María García</td>
                  <td className="px-4 py-3">MG HS 2022</td>
                  <td className="px-4 py-3">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">Pendiente</span>
                  </td>
                  <td className="px-4 py-3">12/01/2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MGDashboard>
  )
}
