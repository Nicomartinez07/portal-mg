"use client";

import { useState, useEffect } from "react";
import { createVehicle } from "@/app/vehiculos/actions";
import provinciasData from "@/data/provincias.json";

export function ActivationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    vin: "",
    brand: "",
    model: "",
    engineNumber: "",
    type: "",
    year: "",
    company: "",
    seller: "",
    clientName: "",
    clientSurname: "",
    clientEmail: "",
    clientPhone: "",
    clientDirection: "",
    clientProvince: "",
    clientLocality: "",
  });

  const [provincias, setProvincias] = useState<any[]>([]);
  const [localidades, setLocalidades] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Cargar provincias desde el JSON
  useEffect(() => {
    setProvincias(provinciasData);
  }, []);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvince = e.target.value;
    setFormData((prev) => ({
      ...prev,
      clientProvince: selectedProvince,
    }));

    // Obtener las localidades de la provincia seleccionada
    const selectedProvincia = provinciasData.find(
      (prov) => prov.provincia === selectedProvince
    );
    setLocalidades(selectedProvincia ? selectedProvincia.localidades : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await createVehicle(formData);

      if (result.success) {
        alert("✅ Garantia Activada correctamente");
        onClose();
        // Resetear formulario
        setFormData({
          date: new Date().toISOString().slice(0, 10),
          vin: "",
          brand: "",
          model: "",
          engineNumber: "",
          type: "",
          year: "",
          company: "",
          seller: "",
          clientName: "",
          clientSurname: "",
          clientEmail: "",
          clientPhone: "",
          clientDirection: "",
          clientProvince: "",
          clientLocality: "",
        });
      } else {
        // Mostrar errores específicos de campos
        if (result.errors) {
          setErrors(result.errors);
          console.log("Esta mostrando estos errores");
        }
        // Mostrar error general
        else if (result.message) {
          console.log("Entra a mandar la alerta");
          alert(`❌ ${result.message}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error inesperado al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-4">Activar Garantia</h2>
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehículo */}
          <div className="border-b border-gray-300 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Vehiculo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  className="border px-3 py-2 w-full rounded bg-gray-100"
                  readOnly
                />
              </div>

              {/* VIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  VIN *
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  className={`border px-3 py-2 w-full rounded ${
                    errors.vin ? "border-red-500" : "border-gray-300"
                  }`}
                  maxLength={17}
                />
                {errors.vin && (
                  <p className="text-red-500 text-xs mt-1">{errors.vin}</p>
                )}
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marca
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  className="border px-3 py-2 w-full rounded bg-gray-100"
                  readOnly
                />
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Modelo
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  className="border px-3 py-2 w-full rounded bg-gray-100"
                  readOnly
                />
              </div>

              {/* Motor */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número de motor
                </label>
                <input
                  type="text"
                  name="engineNumber"
                  value={formData.engineNumber}
                  className="border px-3 py-2 w-full rounded bg-gray-100"
                  readOnly
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  className="border px-3 py-2 w-full rounded bg-gray-100"
                  readOnly
                />
              </div>

              {/* Año */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Año
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  className="border px-3 py-2 w-full rounded bg-gray-100"
                  readOnly
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Empresa
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  className="border px-3 py-2 w-full rounded bg-gray-100"
                  readOnly
                />
              </div>

              {/* Vendedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vendedor
                </label>
                <input
                  type="text"
                  name="seller"
                  value={formData.seller}
                  onChange={handleChange}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>
            </div>
          </div>

          {/* Separador */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  type="text"
                  name="clientSurname"
                  value={formData.clientSurname}
                  onChange={handleChange}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefono
                </label>
                <input
                  type="text"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Direccion
                </label>
                <input
                  type="text"
                  name="clientDirection"
                  value={formData.clientDirection}
                  onChange={handleChange}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Provincia */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provincia
                </label>
                <select
                  name="clientProvince"
                  value={formData.clientProvince}
                  onChange={handleProvinceChange}
                  className="border px-3 py-2 w-full rounded"
                >
                  <option value="">Seleccione una provincia</option>
                  {provincias.map((prov, index) => (
                    <option key={index} value={prov.provincia}>
                      {prov.provincia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Localidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Localidad
                </label>
                <select
                  name="clientLocality"
                  value={formData.clientLocality}
                  onChange={handleChange}
                  className="border px-3 py-2 w-full rounded"
                  disabled={!formData.clientProvince}
                >
                  <option value="">Seleccione una localidad</option>
                  {localidades.map((localidad, index) => (
                    <option key={index} value={localidad}>
                      {localidad}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
