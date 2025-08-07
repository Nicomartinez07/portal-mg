"use client";

import { MGDashboard } from "../../components/mg-dashboard";
import { FaPlus, FaInfoCircle, FaTrashAlt, FaCheck } from "react-icons/fa";

export default function GeneralPage() {
  const administradores = [
    { nombre: "Admin", email: "info@styfish.com", notificaciones: false },
    {
      nombre: "Florencia",
      email: "mflobalzo@geelyargentina.com",
      notificaciones: false,
    },
    {
      nombre: "Federico Paterno",
      email: "fpaterno@geelyargentina.com",
      notificaciones: true,
    },
    {
      nombre: "EXIMAR",
      email: "postventa@geelyargentina.com",
      notificaciones: false,
    },
    {
      nombre: "Carlos Martinez",
      email: "cmartinez@eximar.com.ar",
      notificaciones: true,
    },
    {
      nombre: "Hernan Ponce",
      email: "hponce@eximar.com.ar",
      notificaciones: false,
    },
    {
      nombre: "Valentin Devries",
      email: "vdevries@eximar.com.ar",
      notificaciones: true,
    },
    {
      nombre: "Gastón Santillan",
      email: "gsantillan@eximar.com.ar",
      notificaciones: false,
    },
  ];

  return (
    <MGDashboard>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configuración General</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> Nuevo Usuario
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          Configuración de Administradores
        </h2>

        {/* Search input for Name/Email */}
        <div className="mb-6 flex items-center gap-4">
          <input
            type="text"
            placeholder="Nombre"
            className="border rounded px-3 py-2 w-full max-w-sm"
          />
          <input
            type="text"
            placeholder="Email"
            className="border rounded px-3 py-2 w-full max-w-sm"
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
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Notificaciones E-mail
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {administradores.map((admin, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-left">{admin.nombre}</td>
                  <td className="px-4 py-3 text-left">{admin.email}</td>
                  <td className="px-4 py-3 text-left">
                    {admin.notificaciones ? (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-sm text-white">
                        <FaCheck className="text-sm" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border rounded-sm bg-gray-200"></div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center space-x-2">
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
