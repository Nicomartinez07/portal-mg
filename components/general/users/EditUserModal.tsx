// components/users/EditUserModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { getUserById, updateUser } from "@/app/general/actions" // 📌 Asegúrate de que estas acciones existen y funcionan

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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const user = await getUserById(userId);
      if (user) {
        setForm({
          username: user.username,
          email: user.email,
          password: "",
          confirmPassword: "",
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

    const dataToSend = {
      username: form.username,
      email: form.email,
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
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 text-center">
          Cargando datos del usuario...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">Editar Usuario</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
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
            <div>
              <label className="block font-medium mb-1">Nueva Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="border rounded w-full p-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Dejar en blanco para no cambiar
              </p>
            </div>
            <div>
              <label className="block font-medium mb-1">Repetir Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="border rounded w-full p-2"
              />
            </div>
          </div>
          <div className="bg-gray-100 px-4 py-3 flex justify-end gap-2">
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