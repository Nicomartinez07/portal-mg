// app/empresas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { MGDashboard } from "../../components/mg-dashboard";
import {
  FaUser,
  FaInfoCircle,
  FaTrashAlt,
  FaFileDownload,
} from "react-icons/fa";
import { getCompanies, deleteCompany } from "../actions/companies";
import { NewCompanyModal } from "../../components/companies/NewCompanyModal";
import { EditCompanyModal } from "../../components/companies/EditCompanyModal";
import { UsersModal } from "../../components/companies/users/UsersModal"; 

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [showUsersModal, setShowUsersModal] = useState<{ id: number; name: string } | null>(null); // ⬅️ Estado para el modal de usuarios

  function handleEdit(id: number) {
    setEditingCompanyId(id);
  }

  function handleCloseEditModal() {
    setEditingCompanyId(null);
  }

  function handleShowUsers(id: number, name: string) { // ⬅️ Nueva función para abrir el modal de usuarios
    setShowUsersModal({ id, name });
  }

  function handleCloseUsersModal() { // ⬅️ Nueva función para cerrar el modal de usuarios
    setShowUsersModal(null);
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    const data = await getCompanies();
    setEmpresas(data);
    setLoading(false);
  };

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "¿Estás seguro que querés eliminar esta empresa?"
    );
    if (!confirmDelete) return;

    try {
      await deleteCompany(id);
      alert("Empresa eliminada correctamente ✅");
      loadCompanies();
    } catch (error: any) {
      alert(error.message || "Error al eliminar la empresa ❌");
    }
  }

  const filteredEmpresas = empresas.filter((empresa) =>
    searchTerm === "" ? true : empresa.name === searchTerm
  );

  return (
    <MGDashboard>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configuración de Empresas</h1>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Nueva Empresa
          </button>
          {showNewModal && (
            <NewCompanyModal
              onClose={() => setShowNewModal(false)}
              onSuccess={loadCompanies}
            />
          )}
          {editingCompanyId !== null && (
            <EditCompanyModal
              companyId={editingCompanyId}
              onClose={handleCloseEditModal}
            />
          )}
        </div>

        <div className="mb-6 flex items-center gap-4">
          <select
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-md"
          >
            <option value="">Todas las empresas</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.name}>
                {empresa.name}
              </option>
            ))}
          </select>
        </div>

        <div className="border rounded-lg overflow-auto">
          {loading ? (
            <p className="p-4">Cargando empresas...</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">{empresa.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleShowUsers(empresa.id, empresa.name)} // ⬅️ Llama a la nueva función
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm flex items-center gap-1"
                        >
                          <FaUser className="text-sm" /> Usuarios
                        </button>
                        <button
                          onClick={() => handleEdit(empresa.id)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm flex items-center gap-1"
                        >
                          <FaInfoCircle className="text-sm" /> Detalles
                        </button>
                        <button
                          onClick={() => handleDelete(empresa.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm flex items-center gap-1"
                        >
                          <FaTrashAlt className="text-sm" /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmpresas.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-center text-gray-500"
                    >
                      No se encontraron empresas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showUsersModal && ( // ⬅️ Renderiza el modal si `showUsersModal` tiene un valor
        <UsersModal
          companyId={showUsersModal.id}
          companyName={showUsersModal.name}
          onClose={handleCloseUsersModal}
        />
      )}
    </MGDashboard>
  );
}