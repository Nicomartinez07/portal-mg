// app/components/InsertServiceModal.tsx
import React, { useEffect, useState } from "react";
import { FaUpload, FaPlus, FaTrash } from "react-icons/fa";
import { saveService } from "@/app/(dashboard)/ordenes/insert/service/actions";
import { getVehicleByVin } from "@/app/(dashboard)/vehiculos/actions";
import { useUser } from '@/hooks/useUser';
import type { Draft } from "@/app/types";

interface InsertServiceModalProps {
  onClose: () => void;
  open: boolean;
  draft?: Draft;
  isEditMode?: boolean;
}
// Estado inicial del formulario
const initialFormData = {
  creationDate: "",
  orderNumber: "",
  vin: "",
  warrantyActivation: "",
  engineNumber: "",
  model: "",
  service: "",
  actualMileage: "",
  additionalObservations: "",
  badgePhoto: null as File | null,
  orPhoto: null as File | null,
};

export default function InsertServiceModal({
  onClose,
  open,
  draft,
  isEditMode = false,
}: InsertServiceModalProps) {
  // Estado unificado del formulario
  const [formData, setFormData] = useState(initialFormData);
  // Estados para UI y control
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user, loading } = useUser();

  // Cargar datos del draft cuando se abre el modal
  useEffect(() => {
    if (open && draft) {
      // Convertir tasks del draft al formato del formulario
      const draftFormData = {
        creationDate: draft.creationDate 
          ? (typeof draft.creationDate === 'string' 
             ? draft.creationDate 
             : new Date(draft.creationDate).toLocaleDateString())
          : new Date().toLocaleDateString(),
        orderNumber: draft.orderNumber?.toString() || "",
        vin: draft.vin || draft.vehicle?.vin || "",
        warrantyActivation: draft.warrantyActivation || "",
        engineNumber: draft.engineNumber || "",
        service: draft.service || "",
        actualMileage: draft.actualMileage?.toString() || "",
        model: draft.model || "",
        additionalObservations: draft.additionalObservations || "",
        badgePhoto: null,
        orPhoto: null,
      };

      setFormData(draftFormData);
      console.log("FormData cargado:", draftFormData);
    } else if (open) {
      // Resetear si no hay draft
      const date = new Date();
      setFormData({
        ...initialFormData,
        creationDate: date.toLocaleDateString(),
      });
    }
    
    setErrors({});
    setIsSubmitting(false);
  }, [open, draft]);

  // Handler único para todos los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  // Handler para buscar vehículo
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
        warrantyActivation: v.warranty?.activationDate
          ? new Date(v.warranty.activationDate).toISOString().split("T")[0]
          : "",
        model: v.model || "",
        engineNumber: v.engineNumber || "",
        customerID: v.warranty?.customerId?.toString() || "",
      }));
    } else {
      alert(result.message);
    }
  };

  // Handlers para archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {};

  // Handler para cerrar modal
  const handleClose = () => {
    onClose();
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('❌ No se pudo obtener la información del usuario');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const dataToSubmit = {
        ...formData,
      };

      const result = await saveService(
        dataToSubmit,
        user.companyId, 
        user.userId,     
        false,
        draft?.id
      );

      if (result.success) {
        alert(`✅ ${isEditMode ? "Borrador convertido a Servicio" : "Servicio enviado"} correctamente`);
        handleClose();
      } else {
        if (result.errors) {
          setErrors(result.errors); // ⬅️ Muestra los errores de Zod
        }
        alert("⚠️ " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error inesperado al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar borrador
  const handleDraftSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('❌ No se pudo obtener la información del usuario');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const draftData = {
        ...formData,
      };

      const result = await saveService(
        draftData,
        user.companyId,  
        user.userId,
        true,
        draft?.id
      );

      if (result.success) {
        alert(`✅ ${draft?.id ? "Borrador actualizado" : "Borrador guardado"} correctamente`);
        handleClose();
      } else {
        if (result.errors) {
          setErrors(result.errors); // ⬅️ Muestra los errores de Zod
        }
        alert("⚠️ " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar borrador");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-hidden flex flex-col shadow-lg text-sm">
      {/* Header fijo */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-semibold">
          {isEditMode ? "Editar Borrador - Servicio" : "Ingreso de Servicio"}
          {isEditMode && draft?.id && (
            <span className="text-sm text-gray-500 ml-2">(ID: {draft.id})</span>
          )}
        </h2>
        <button
          onClick={handleClose}
          className="text-lg font-bold text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          ×
        </button>
      </div>

      {/* Contenido scrollable */}
      <div className="overflow-y-auto flex-1 p-6">
        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha
              </label>
              <input
                readOnly
                value={formData.creationDate}
                className="border rounded px-2 py-1 w-full bg-gray-100"
              />
            </div>

            {/* OR interna */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Or interna
              </label>
              <div className="flex gap-2">
                <input
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  placeholder="Ingrese el numero interno de orden de reparacion"
                  className={`border rounded px-2 py-1 w-full ${
                    errors.orderNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.orderNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.orderNumber}
                </p>
              )}
            </div>
            
            {/* VIN + Buscar */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                VIN
              </label>
              <div className="flex gap-2">
                <input
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  placeholder="Ingrese VIN del vehículo"
                  className={`border rounded px-2 py-1 w-full ${
                    errors.vin ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSearchVehicle}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  Buscar
                </button>
              </div>
              {errors.vin && (
                <p className="text-red-500 text-xs mt-1">{errors.vin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Activación Garantía
              </label>
              <input
                value={formData.warrantyActivation}
                readOnly
                className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nro. Motor
              </label>
              <input
                value={formData.engineNumber}
                readOnly
                className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Modelo
              </label>
              <input
                value={formData.model}
                readOnly
                className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Servicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Servicio
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={`border rounded px-2 py-1 w-full ${
                  errors.service ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar...</option>
                {Array.from({ length: 13 }, (_, i) => i * 12000).map((km) => (
                  <option key={km} value={km}>
                    {km.toLocaleString("es-AR")} km
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="text-red-500 text-xs mt-1">{errors.service}</p>
              )}
            </div>

            {/* Kilometraje Real */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kilometraje Real del vehiculo
              </label>
              <input
                name="actualMileage"
                placeholder="Ingrese kilometraje"
                value={formData.actualMileage}
                onChange={handleChange}
                className={`border rounded px-2 py-1 w-full ${
                  errors.actualMileage ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.actualMileage && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.actualMileage}
                </p>
              )}
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Observaciones 
              </label>
              <textarea
                name="additionalObservations" 
                placeholder="Ingrese observaciones"
                value={formData.additionalObservations}
                onChange={handleChange}
                rows={3}
                className="border rounded px-2 py-1 w-full resize-none"
              />
            </div>
          </div>

          {/* Subida de archivo */}
          <div className="mt-6">
            <div className="grid grid-cols-[160px_1fr] gap-2 items-center text-sm">
              <label>Foto chapa VIN</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 text-xs">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              <label>Foto Or</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 text-xs">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDraftSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar Borrador" : "Guardar Borrador"}
            </button>
            <button
              type="submit"
              onClick={handleSubmitOrder}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : isEditMode ? "Enviar Pre-Autorización" : "Enviar Pre-Autorización"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}