"use client";

import { useState, useEffect } from "react";

interface Usuario {
  nombre: string;
  email: string;
  notificaciones: boolean;
}

interface ModalCuentaProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCuenta({ isOpen, onClose }: ModalCuentaProps) {
  const [usuario, setUsuario] = useState<Usuario>({
    nombre: "",
    email: "",
    notificaciones: false,
  });

  // Traer datos del usuario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetch("/api/me")
        .then(res => res.json())
        .then(data => setUsuario({
          nombre: data.username,
          email: data.email,
          notificaciones: data.notificaciones,
        }));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUsuario(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/update-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    });
    onClose(); // cerrar modal al guardar
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Editar Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nombre *</label>
            <input
              name="nombre"
              value={usuario.nombre}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="notificaciones"
              checked={usuario.notificaciones}
              onChange={handleChange}
            />
            <label>vía e-mail</label>
          </div>
          <div>
            <label className="block text-sm mb-1">Email *</label>
            <input
              name="email"
              value={usuario.email}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Repetir contraseña</label>
            <input
              type="password"
              name="passwordConfirm"
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-1 border rounded">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-1 bg-blue-500 text-white rounded">
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
