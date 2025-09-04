// components/companies/UsersModal.tsx
"use client";

import { useEffect, useState } from "react";
import { FaUser, FaInfoCircle, FaTrashAlt } from "react-icons/fa";
import { getUsersByCompany, deleteUser } from "@/app/actions/companies";
import { UserFormModal } from "./UserFormModal";

// Define la estructura para el estado de los usuarios
interface User {
  id: number;
  username: string;
  email: string;
  taller: boolean;
  concesionario: boolean;
  emailNotifications: boolean;
}

interface UsersModalProps {
  companyId: number;
  companyName: string;
  onClose: () => void;
}

export function UsersModal({ companyId, companyName, onClose }: UsersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [companyId]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsersByCompany(companyId);
    setUsers(data);
    setLoading(false);
  };

  const handleDelete = async (userId: number) => {
    const confirmDelete = window.confirm("¿Estás seguro que quieres eliminar este usuario?");
    if (!confirmDelete) return;

    try {
      await deleteUser(userId);
      alert("Usuario eliminado correctamente ✅");
      loadUsers();
    } catch (error) {
      alert("Error al eliminar el usuario ❌");
    }
  };

  const handleShowUserForm = (user?: User) => {
    setEditingUser(user || null);
    setShowUserFormModal(true);
  };

  const handleCloseUserForm = () => {
    setShowUserFormModal(false);
    setEditingUser(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">Usuarios de {companyName}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => handleShowUserForm()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + Nuevo Usuario
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center">Cargando usuarios...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">No se encontraron usuarios</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{user.username}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => handleShowUserForm(user)}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                          >
                            Detalles
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showUserFormModal && (
        <UserFormModal
          companyId={companyId}
          onClose={handleCloseUserForm}
          onSuccess={loadUsers}
          user={editingUser || undefined}
        />
      )}
    </div>
  );
}