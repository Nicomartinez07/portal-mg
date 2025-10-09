"use client";

import { useState } from "react";
import { createCompany } from "@/app/actions/companies";

export const NewCompanyModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [form, setForm] = useState({
    name: "",
    manager: "",
    address: "",
    state: "",
    city: "",
    phone1: "",
    phone2: "",
    email: "",
    companyType: "",
    showParts: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCompany(form);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-blue-500 text-white px-4 py-2 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Crear Empresa</h2>
          <button type="button" onClick={onClose} className="text-white hover:text-gray-200">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="border rounded w-full p-2"
            />
          </div>

          <h3 className="font-semibold text-gray-700">Datos de Contacto de Taller</h3>
          <label className="block font-medium mb-1">Nombre encargado</label>
          <input
            type="text"
            name="manager"
            placeholder="Nombre Encargado"
            value={form.manager}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />

          <label className="block font-medium mb-1">Direccion</label>
          <input
            type="text"
            name="address"
            placeholder="Dirección"
            value={form.address}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />

          <label className="block font-medium mb-1">Provincia</label>
          <input
            type="text"
            name="state"
            placeholder="Provincia"
            value={form.state}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />

          <label className="block font-medium mb-1">Ciudad</label>
          <input
            type="text"
            name="city"
            placeholder="Localidad"
            value={form.city}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />

          <label className="block font-medium mb-1">Teléfono 1</label>
          <input
            type="text"
            name="phone1"
            placeholder="Teléfono 1"
            value={form.phone1}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />

          <label className="block font-medium mb-1">Teléfono 2</label>
          <input
            type="text"
            name="phone2"
            placeholder="Teléfono 2"
            value={form.phone2}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />

          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </div>

        {/* Footer */}
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
            Aceptar
          </button>
        </div>
      </form>
    </div>
  );
};
