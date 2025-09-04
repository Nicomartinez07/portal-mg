// components/companies/EditCompanyModal.tsx
"use client";

import { useEffect, useState } from "react";
import { getCompanyById, updateCompany } from "@/app/actions/companies"; // Asegúrate de que la ruta sea correcta

// Definir el tipo de datos de la empresa, puedes extenderlo si es necesario
type Company = {
  id: number;
  name: string;
  manager?: string | null;
  address?: string | null;
  state?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
};

interface EditCompanyModalProps {
  companyId: number;
  onClose: () => void;
}

export function EditCompanyModal({ companyId, onClose }: EditCompanyModalProps) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Company>>({});
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para el botón


  useEffect(() => {
    async function fetchCompany() {
      if (!companyId) return;

      setLoading(true);
      try {
        const companyData = await getCompanyById(companyId);
        if (companyData) {
          setForm({
            name: companyData.name,
            manager: companyData.manager,
            address: companyData.address,
            state: companyData.state,
            city: companyData.city,
            phone1: companyData.phone1,
            phone2: companyData.phone2,
            email: companyData.email,
          });
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateCompany(companyId, form);
      alert("Empresa actualizada correctamente ✅");
      onClose(); // Cierra la modal si la actualización fue exitosa
    } catch (error) {
      console.error("Error al actualizar la empresa:", error);
      alert("Error al actualizar la empresa ❌");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          Cargando detalles de la empresa...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          Cargando detalles de la empresa...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">Editar Empresa</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body - Usa el diseño que ya tienes */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-medium mb-1">Nombre *</label>
              <input
                type="text"
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                required
                className="border rounded w-full p-2"
              />
            </div>

            <h3 className="font-semibold text-gray-700">
              Datos de Contacto de Taller
            </h3>

            {/* Los siguientes campos se renderizan con los datos de `form` */}
            <label className="block font-medium mb-1">Nombre Encargado</label>
            <input
              type="text"
              name="manager"
              placeholder="Nombre Encargado"
              value={form.manager || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
            />

            <label className="block font-medium mb-1">Dirección</label>
            <input
              type="text"
              name="address"
              placeholder="Dirección"
              value={form.address || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
            />

            <label className="block font-medium mb-1">Provincia</label>
            <input
              type="text"
              name="state"
              placeholder="Provincia"
              value={form.state || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
            />

            <label className="block font-medium mb-1">Localidad</label>
            <input
              type="text"
              name="city"
              placeholder="Localidad"
              value={form.city || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
            />

            <label className="block font-medium mb-1">Teléfono 1</label>
            <input
              type="text"
              name="phone1"
              placeholder="Teléfono 1"
              value={form.phone1 || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
            />

            <label className="block font-medium mb-1">Teléfono 2</label>
            <input
              type="text"
              name="phone2"
              placeholder="Teléfono 2"
              value={form.phone2 || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
            />

            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email || ""}
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
              disabled={isSaving} // Deshabilitar mientras se guarda
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isSaving} // Deshabilitar mientras se guarda
            >
              {isSaving ? "Guardando..." : "Aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}