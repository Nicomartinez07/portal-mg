"use client";

import { useEffect, useState } from "react";
import { MGDashboard } from "../../components/mg-dashboard";
import { FaInfoCircle, FaTrashAlt, FaPlus, FaUpload } from "react-icons/fa";
import { getUsers, deleteUser, updateUser } from "../general/actions";
import { NewUserModal } from "../../components/general/users/NewUserModal";
import { EditUserModal } from "../../components/general/users/EditUserModal";

interface User {
  id: number;
  username: string;
  email: string;
  notifications: boolean;
  roles: { role: { name: string } }[];
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 📌 Handler para elegir archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 📌 Handler para subir archivo al backend
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Por favor selecciona un archivo primero");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    // ⚠️ Tenés que crear una ruta de API en tu Next.js (ej: /api/upload-tarifario)
    const res = await fetch("/api/upload-tarifario", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Tarifario actualizado ✅");
    } else {
      alert("Error al subir el tarifario ❌");
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  function handleEdit(id: number) {
    setEditingUserId(id);
  }

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

  function handleCloseEditModal() {
    setEditingUserId(null);
    loadUsers();
  }

  const handleToggleNotifications = async (user: User) => {
    const newValue = !user.notifications;

    // Actualización optimista: Cambia el estado local al instante
    setUsuarios((prevUsuarios) =>
      prevUsuarios.map((u) =>
        u.id === user.id ? { ...u, notifications: newValue } : u
      )
    );

    // Llamada al servidor en segundo plano
    try {
      await updateUser(user.id, {
        notifications: newValue,
      });
    } catch (error) {
      console.error("Error al actualizar notificaciones:", error);
      alert("Error al actualizar ❌");
      // Si falla, revierte el cambio
      loadUsers();
    }
  };

  return (
    <MGDashboard>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configuración de Administradores</h1>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <FaPlus /> Nuevo Usuario
          </button>
        </div>

        {/* Tabla */}
        <div className="border rounded-lg overflow-auto">
          {loading ? (
            <p className="p-4">Cargando usuarios...</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Notificaciones
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{usuario.username}</td>
                    <td className="px-4 py-3">{usuario.email}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={usuario.notifications}
                        onChange={() => handleToggleNotifications(usuario)}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleEdit(usuario.id)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm flex items-center gap-1"
                        >
                          <FaInfoCircle className="text-sm" /> Detalles
                        </button>
                        <button
                          onClick={async () => {
                            handleDelete(usuario.id);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm flex items-center gap-1"
                        >
                          <FaTrashAlt className="text-sm" /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-center text-gray-500"
                    >
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Configuración de Archivos</h2>

          {/* Subida de tarifario */}
          <div className="flex items-center gap-4 mb-4">
            <a
            href="/archivos/tarifario.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Archivo del tarifario
          </a>
            {/* Botón estilizado para seleccionar archivo */}
            <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded cursor-pointer hover:bg-gray-300">
              Seleccionar archivo
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Mostrar el nombre del archivo si se seleccionó */}
            {selectedFile && (
              <>
                <span className="text-gray-600">{selectedFile.name}</span>
                <button
                  onClick={handleUpload}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <FaUpload className="w-4 h-4" /> Subir
                </button>
              </>
            )}
          </div>


        </div>
      </div>
      {/* Nueva sección: Configuración de Archivos */}
      
      {/* Modales */}
      {showNewModal && (
        <NewUserModal onClose={() => setShowNewModal(false)} onSuccess={loadUsers} />
      )}
      {editingUserId !== null && (
        <EditUserModal userId={editingUserId} onClose={handleCloseEditModal} />
      )}
    </MGDashboard>
  );
}
