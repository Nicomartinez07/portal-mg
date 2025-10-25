// components/companies/UserFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createUser, updateUser } from "@/app/(dashboard)/actions/companies";

// Define la estructura de un usuario, incluyendo los roles
interface User {
  id: number;
  username: string;
  email: string;
  roles: { role: { name: string } }[]; // Arreglo de roles
  notifications: boolean;
}

interface UserFormModalProps {
  companyId: number;
  onClose: () => void;
  onSuccess: () => void;
  user?: User;
}

export function UserFormModal({
  companyId,
  onClose,
  onSuccess,
  user,
}: UserFormModalProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Usamos un objeto para gestionar los roles
    roles: {
      taller: false,
      concesionario: false,
    },
    notifications: false,
  });

  const isEditing = !!user;

  useEffect(() => {
    if (isEditing && user) {
      const userRoles = user.roles.map((ur) => ur.role.name);
      setForm({
        username: user.username,
        email: user.email,
        password: "",
        confirmPassword: "",
        roles: {
          taller: userRoles.includes("WORKSHOP"),
          concesionario: userRoles.includes("DEALER"),
        },
        notifications: user.notifications, // Corrected from user.emailNotifications
      });
    }
  }, [isEditing, user]);

  // handleChange function
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === "taller" || name === "concesionario") {
      setForm((prev) => ({
        ...prev,
        roles: {
          ...prev.roles,
          [name]: checked,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden ❌");
      return;
    }

    // Prepara los datos a enviar
    const dataToSend = {
      username: form.username,
      email: form.email,
      roles: form.roles, 
      notifications: form.notifications,
      ...(form.password && { password: form.password }),
    };

    try {
      if (isEditing) {
        await updateUser(user!.id, dataToSend);
        alert("Usuario actualizado correctamente ✅");
      } else {
        await createUser({ ...dataToSend, companyId });
        alert("Usuario creado correctamente ✅");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      alert("Error al guardar usuario ❌");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            &times;
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
            {/* Roles Checkboxes */}
            <div className="space-y-2">
              <label className="block font-medium mb-1">Roles</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="taller"
                    checked={form.roles.taller}
                    onChange={handleChange}
                  />
                  Taller
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="concesionario"
                    checked={form.roles.concesionario}
                    onChange={handleChange}
                  />
                  Concesionario
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 border rounded">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={form.notifications}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="notifications"
                className="font-medium text-gray-700"
              >
                Recibir notificaciones
              </label>
            </div>
            {/* Contraseña fields */}
            <div>
              <label className="block font-medium mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required={!isEditing}
                className="border rounded w-full p-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Repetir contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required={!isEditing}
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
              {isEditing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}