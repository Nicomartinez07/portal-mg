"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { createUser } from "../../../app/general/actions";
import { getCompanies } from "@/app/actions/companies";

interface NewUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Company {
  id: number;
  name: string;
}

export function NewUserModal({ onClose, onSuccess }: NewUserModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyId: "", // 👈 nuevo campo
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const data = await getCompanies();
      setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden ❌");
      return;
    }

    try {
      await createUser({
        username: form.username,
        email: form.email,
        password: form.password,
        companyId: Number(form.companyId), 
        notifications: true, 
      });
      alert("Usuario creado correctamente ✅");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error al crear usuario ❌");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">Nuevo Usuario</h2>
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

            {/* Selector de Empresa */}
            <div>
              <label className="block font-medium mb-1">Empresa</label>
              <select
                name="companyId"
                value={form.companyId}
                onChange={handleChange}
                required
                className="border rounded w-full p-2"
              >
                <option value="">Seleccione una empresa</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="border rounded w-full p-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Repetir contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
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
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
