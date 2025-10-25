"use client";

import { useState, useEffect } from "react";
import { getVehicleByVin } from "@/app/(dashboard)/vehiculos/actions";
import { activateWarranty } from "@/app/(dashboard)/garantias/activate/actions";
import provinciasData from "@/data/provincias.json";

export function ActivationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Provincias
  useEffect(() => {
    setProvincias(provinciasData);
  }, []);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    vin: "",
    brand: "",
    model: "",
    engineNumber: "",
    type: "",
    year: "",
    licensePlate: "",
    companyName: "",
    companyId: "",
    user: "",
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

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvince = e.target.value;
    setFormData((prev) => ({
      ...prev,
      clientProvince: selectedProvince,
    }));

    const selectedProvincia = provinciasData.find(
      (prov) => prov.provincia === selectedProvince
    );
    setLocalidades(selectedProvincia ? selectedProvincia.localidades : []);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await activateWarranty(formData);

      if (result.success) {
        alert("✅ Garantía activada correctamente");
        onClose();
        resetForm();
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else if (result.message) {
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      vin: "",
      brand: "",
      model: "",
      engineNumber: "",
      type: "",
      year: "",
      licensePlate: "",
      companyName: "",
      companyId: "",
      user: "",
      clientName: "",
      clientSurname: "",
      clientEmail: "",
      clientPhone: "",
      clientDirection: "",
      clientProvince: "",
      clientLocality: "",
    });
    setErrors({});
    setLocalidades([]);
  };

  const handleSearchVehicle = async () => {
    if (!formData.vin) {
      alert("Ingrese un VIN primero");
      return;
    }

    const result = await getVehicleByVin(formData.vin);

    if (result.success && result.vehicle) {
      const v = result.vehicle;
      setFormData((prev) => ({
        ...prev,
        brand: v.brand || "",
        model: v.model || "",
        engineNumber: v.engineNumber || "",
        type: v.type || "",
        year: v.year?.toString() || "",
        licensePlate: v.licensePlate || "",
        companyName: v.company?.name || "",
        companyId: v.company?.id.toString() || "", 
      }));
    } else {
      alert(result.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-4">Activar Garantia</h2>
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  VIN *
                </label>
                <div className="flex gap-2">
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
                  <button
                    type="button"
                    data-testid="search-vehicle-button" 
                    onClick={handleSearchVehicle}
                    className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                  >
                    Buscar
                  </button>
                </div>
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

              {/* Patente */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Patente
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
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
                  name="companyName" // Nombre para mostrar el valor
                  value={formData.companyName}
                  className="border px-3 py-2 w-full rounded bg-gray-100"
                  readOnly
                />
                
                {/* Campo oculto con el ID */}
                <input
                  type="hidden" // Escondido, pero su valor será enviado en el submit
                  name="companyId" 
                  value={formData.companyId}
                />

                {errors.companyId && ( 
                  <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>
                )}
              </div>


              {/* Vendedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vendedor
                </label>
                <input
                  type="text"
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  className={`border px-3 py-2 w-full rounded ${
                    errors.user ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.user && (
                  <p className="text-red-500 text-xs mt-1">{errors.user}</p>
                )}
              </div>
            </div>
          </div>

          {/* Separador */}
          {/* ================= CLIENTE ================= */}
          <div className="grid grid-cols-2 gap-4">
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
                className={`border px-3 py-2 w-full rounded ${
                  errors.clientName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.clientName && (
                <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
              )}
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
                className={`border px-3 py-2 w-full rounded ${
                  errors.clientSurname ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.clientSurname && (
                <p className="text-red-500 text-xs mt-1">{errors.clientSurname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                className={`border px-3 py-2 w-full rounded ${
                  errors.clientEmail ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.clientEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="text"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                className={`border px-3 py-2 w-full rounded ${
                  errors.clientPhone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.clientPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                name="clientDirection"
                value={formData.clientDirection}
                onChange={handleChange}
                className={`border px-3 py-2 w-full rounded ${
                  errors.clientDirection ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.clientDirection && (
                <p className="text-red-500 text-xs mt-1">{errors.clientDirection}</p>
              )}
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


          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
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
