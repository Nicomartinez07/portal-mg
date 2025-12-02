// components/users/EditUserModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { getUserById, updateUser } from "@/app/(dashboard)/general/actions";

interface EditUserModalProps {
  userId: number;
  onClose: () => void;
}

export function EditUserModal({ userId, onClose }: EditUserModalProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    notifications: false,
    // Agregamos el estado para los roles
    isTaller: false,
    isConcesionario: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const user = await getUserById(userId);
      
      if (user) {
        const hasTaller = user.roles.some((r: any) => r.role.name === "WORKSHOP");
        const hasConcesionario = user.roles.some((r: any) => r.role.name === "DEALER");

        setForm({
          username: user.username,
          email: user.email,
          notifications: user.notifications || false,
          password: "",
          confirmPassword: "",
          isTaller: hasTaller,
          isConcesionario: hasConcesionario,
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden ❌");
      return;
    }

    // Estructuramos la data para enviar al backend
    const dataToSend = {
      username: form.username,
      email: form.email,
      notifications: form.notifications,
      roles: {
        taller: form.isTaller,
        concesionario: form.isConcesionario,
      },
      ...(form.password && { password: form.password }),
    };

    try {
      await updateUser(userId, dataToSend);
      alert("Usuario actualizado correctamente ✅");
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error al actualizar usuario ❌");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-lg p-6">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">Editar Usuario</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block font-medium mb-1">Nombre</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="border rounded w-full p-2"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="border rounded w-full p-2"
              />
            </div>

            {/* Roles - Checkboxes */}
            <div>
              <label className="block font-medium mb-1">Roles</label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isTaller"
                    name="isTaller"
                    checked={form.isTaller}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isTaller">Taller</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isConcesionario"
                    name="isConcesionario"
                    checked={form.isConcesionario}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isConcesionario">Concesionario</label>
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="flex items-center gap-3 p-2 border rounded">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={form.notifications}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="font-medium text-gray-700">
                Recibir notificaciones
              </label>
            </div>

            {/* Contraseñas */}
            <div>
              <label className="block font-medium mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="border rounded w-full p-2"
                placeholder="Dejar vacía para mantener actual"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Repetir contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="border rounded w-full p-2"
              />
            </div>
          </div>

          {/* Footer Botones */}
          <div className="bg-gray-100 px-4 py-3 flex justify-end gap-2 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}