"use client";

import { MGDashboard } from "../../components/mg-dashboard";

export default function RepuestosPage() {
  return (
    <MGDashboard>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-6">Stock de Repuestos</h1>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Listado de Repuestos</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Cargar Stock
            </button>
          </div>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Encargado</th>
                  <th className="px-4 py-3 text-left">Dirección</th>
                  <th className="px-4 py-3 text-left">Provincia</th>
                  <th className="px-4 py-3 text-left">Localidad</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Archivo de Repuestos</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-t">
                  <td className="px-4 py-3 font-semibold">CHIAMO MOTORS SRL</td>
                  <td className="px-4 py-3">Daniel Martinez</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Buenos Aires</td>
                  <td className="px-4 py-3">Lomas del Mirador</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-semibold">DALIAN S.A.</td>
                  <td className="px-4 py-3">Damian Rudaszewski</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Buenos Aires</td>
                  <td className="px-4 py-3">Florida</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-semibold">EXIMAR</td>
                  <td className="px-4 py-3">Hernán Ponce</td>
                  <td className="px-4 py-3">Av. del Libertador 1513</td>
                  <td className="px-4 py-3">Buenos Aires</td>
                  <td className="px-4 py-3">Vicente Lopez</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Descargar
                    </button>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-semibold">FICAR AUTOS SA</td>
                  <td className="px-4 py-3">Juan Pablo Ameri</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Chaco</td>
                  <td className="px-4 py-3">Resistencia</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-semibold">GEJACK SA</td>
                  <td className="px-4 py-3">Juan Bottino</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-semibold">GRUPO SCHOJ SA.</td>
                  <td className="px-4 py-3">Nicolas Schoj</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Entre Rios</td>
                  <td className="px-4 py-3">Paraná</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-semibold">PIHNOS SA</td>
                  <td className="px-4 py-3">Federico Caparros</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Buenos Aires</td>
                  <td className="px-4 py-3">La Plata</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-semibold">SABADEJO S.A.</td>
                  <td className="px-4 py-3">Jorge Torres</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Mendoza</td>
                  <td className="px-4 py-3">Mendoza</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MGDashboard>
  );
}
