"use client";

import { useState } from "react";
import { createVehicle } from "@/app/vehiculos/actions";

export function VehicleModal({
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
    certificateNumber: "",
    saleDate: "",
    importDate: "",
    licensePlate: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await createVehicle(formData);

      if (result.success) {
        alert("✅ Vehículo insertado correctamente");
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
          certificateNumber: "",
          saleDate: "",
          importDate: "",
          licensePlate: "",
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
        <h2 className="text-lg font-bold mb-4">Cargar Auto</h2>
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de carga */}
            <div>
              <label className="block text-sm font-medium">
                Fecha de carga
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
              <label className="block text-sm font-medium">VIN *</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className={`border px-3 py-2 w-full rounded ${
                  errors.vin ? "border-red-500" : ""
                }`}
                maxLength={17}
              />
              {errors.vin && (
                <p className="text-red-500 text-xs mt-1">{errors.vin}</p>
              )}
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium">Marca *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={`border px-3 py-2 w-full rounded ${
                  errors.brand ? "border-red-500" : ""
                }`}
              />
              {errors.brand && (
                <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
              )}
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium">Modelo *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`border px-3 py-2 w-full rounded ${
                  errors.model ? "border-red-500" : ""
                }`}
              />
              {errors.model && (
                <p className="text-red-500 text-xs mt-1">{errors.model}</p>
              )}
            </div>

            {/* Patente */}
            <div>
              <label className="block text-sm font-medium">Patente *</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                className={`border px-3 py-2 w-full rounded ${
                  errors.licensePlate ? "border-red-500" : ""
                }`}
              />
              {errors.licensePlate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.licensePlate}
                </p>
              )}
            </div>

            {/* Año */}
            <div>
              <label className="block text-sm font-medium">Año</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="border px-3 py-2 w-full rounded"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            {/* Nº de Motor */}
            <div>
              <label className="block text-sm font-medium">
                Número de motor
              </label>
              <input
                type="text"
                name="engineNumber"
                value={formData.engineNumber}
                onChange={handleChange}
                className="border px-3 py-2 w-full rounded"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium">Tipo</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="border px-3 py-2 w-full rounded"
              />
            </div>

            {/* Nº de Certificado */}
            <div>
              <label className="block text-sm font-medium">
                Número de certificado
              </label>
              <input
                type="text"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleChange}
                className="border px-3 py-2 w-full rounded"
              />
            </div>

            {/* Fecha de venta */}
            <div>
              <label className="block text-sm font-medium">
                Fecha de venta
              </label>
              <input
                type="date"
                name="saleDate"
                value={formData.saleDate}
                onChange={handleChange}
                className="border px-3 py-2 w-full rounded"
              />
            </div>

            {/* Fecha de importación */}
            <div>
              <label className="block text-sm font-medium">
                Fecha de importación
              </label>
              <input
                type="date"
                name="importDate"
                value={formData.importDate}
                onChange={handleChange}
                className="border px-3 py-2 w-full rounded"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
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
