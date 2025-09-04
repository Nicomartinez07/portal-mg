// components/companies/UserFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createUser, updateUser } from "@/app/actions/companies";

// Define la estructura de un usuario
interface User {
  id: number;
  username: string;
  email: string;
  taller: boolean;
  concesionario: boolean;
  emailNotifications: boolean;
}

interface UserFormModalProps {
  companyId: number;
  onClose: () => void;
  onSuccess: () => void;
  user?: User; // La prop `user` es opcional
}

export function UserFormModal({ companyId, onClose, onSuccess, user }: UserFormModalProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    taller: false,
    concesionario: false,
    emailNotifications: false,
  });

  const isEditing = !!user; // true si existe la prop user, false si no

  useEffect(() => {
    if (isEditing && user) {
      setForm({
        username: user.username,
        email: user.email,
        password: "", // No precargamos la contraseña por seguridad
        confirmPassword: "",
        taller: user.taller,
        concesionario: user.concesionario,
        emailNotifications: user.emailNotifications,
      });
    }
  }, [isEditing, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden ❌");
      return;
    }

    // Datos a enviar (sin la confirmación de contraseña)
    const dataToSend = {
      username: form.username,
      email: form.email,
      taller: form.taller,
      concesionario: form.concesionario,
      emailNotifications: form.emailNotifications,
      // Solo incluimos la contraseña si es un usuario nuevo o si se actualizó
      ...(form.password && { password: form.password }),
    };

    try {
      if (isEditing) {
        // Llama a la acción de actualizar
        await updateUser(user!.id, dataToSend);
        alert("Usuario actualizado correctamente ✅");
      } else {
        // Llama a la acción de crear
        await createUser({ ...dataToSend, companyId });
        alert("Usuario creado correctamente ✅");
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al guardar usuario ❌");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>
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
                    checked={form.taller}
                    onChange={handleChange}
                  />
                  Taller
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="concesionario"
                    checked={form.concesionario}
                    onChange={handleChange}
                  />
                  Concesionario
                </label>
              </div>
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
              {isEditing ? "Aceptar" : "Aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}