// components/orders/modals/InsertServiceModal.tsx
import React, { useEffect, useState } from "react";
import { saveServiceWithPhotos } from "@/app/(dashboard)/ordenes/insert/service/actions";
import { uploadServicePhotos } from "@/lib/uploadServicePhotos";
import { getVehicleByVin } from "@/app/(dashboard)/vehiculos/actions";
import { useUser } from "@/hooks/useUser";
import type { Draft } from "@/app/types";
import {
  serviceDraftSchema,
  serviceFinalSchema,
} from "@/schemas/service";

// Importar componentes de upload
import ImageUploadField from "@/components/awss3/ImageUploadField";
import MultipleMediaUploadField from "@/components/awss3/MultipleMediaUploadField";

interface InsertServiceModalProps {
  onClose: () => void;
  open: boolean;
  draft?: Draft;
  isEditMode?: boolean;
}

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
};

export default function InsertServiceModal({
  onClose,
  open,
  draft,
  isEditMode = false,
}: InsertServiceModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useUser();

  // Estados para fotos
  const [vinPlatePhoto, setVinPlatePhoto] = useState<File | null>(null);
  const [orPhotos, setOrPhotos] = useState<File[]>([]);

  useEffect(() => {
    if (open && draft) {
      const draftFormData = {
        creationDate: draft.creationDate
          ? typeof draft.creationDate === "string"
            ? draft.creationDate
            : new Date(draft.creationDate).toLocaleDateString()
          : new Date().toLocaleDateString(),
        orderNumber: draft.orderNumber?.toString() || "",
        vin: draft.vin || draft.vehicle?.vin || "",
        warrantyActivation: draft.warrantyActivation || "",
        engineNumber: draft.engineNumber || "",
        service: draft.service || "",
        actualMileage: draft.actualMileage?.toString() || "",
        model: draft.model || "",
        additionalObservations: draft.additionalObservations || "",
      };

      setFormData(draftFormData);

      // Limpiar fotos
      setVinPlatePhoto(null);
      setOrPhotos([]);
    } else if (open) {
      const date = new Date();
      setFormData({
        ...initialFormData,
        creationDate: date.toLocaleDateString(),
      });

      setVinPlatePhoto(null);
      setOrPhotos([]);
    }

    setErrors({});
    setIsSubmitting(false);
  }, [open, draft]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSearchVehicle = async () => {
    if (!formData.vin) {
      setErrors({ vin: "Ingrese un VIN primero" });
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
      }));
    } else {
      setErrors({ vin: result.message || "Vehículo no encontrado" });
    }
  };

  const handleClose = () => {
    onClose();
  };

  // ==================== VALIDACIÓN CON ZOD ====================
  const validateForm = (isDraft: boolean) => {
    const dataToValidate = {
      ...formData,
      vinPlatePhoto,
      orPhotos,
    };

    // Usar schema según si es borrador o no
    const schema = isDraft ? serviceDraftSchema : serviceFinalSchema;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });

      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // ==================== SUBMIT ORDEN FINAL ====================
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrors({ general: "No se pudo obtener la información del usuario" });
      return;
    }

    // Validar con schema estricto
    if (!validateForm(false)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tempOrderId = draft?.id || Date.now();

      console.log("📤 Paso 1: Subiendo fotos a S3...");

      const uploadResult = await uploadServicePhotos(tempOrderId, {
        vinPlatePhoto: vinPlatePhoto!,
        orPhotos,
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Error al subir fotos");
      }

      console.log("✅ Fotos subidas exitosamente");
      console.log("💾 Paso 2: Guardando servicio en base de datos...");

      const dataToSubmit = {
        ...formData,
        photoUrls: uploadResult.photoUrls!,
      };

      const result = await saveServiceWithPhotos(
        dataToSubmit,
        user.companyId,
        user.userId,
        false,
        draft?.id
      );

      if (result.success) {
        alert(
          `✅ ${
            isEditMode ? "Borrador convertido a servicio" : "Servicio creado"
          } correctamente`
        );
        handleClose();
      } else {
        setErrors({ general: result.message || "Error al guardar el servicio" });
      }
    } catch (error) {
      console.error(error);
      setErrors({
        general: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== GUARDAR BORRADOR ====================
  const handleDraftSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrors({ general: "No se pudo obtener la información del usuario" });
      return;
    }

    // Validar con schema permisivo
    if (!validateForm(true)) {
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrls: any = {
        vinPlate: "",
        or: [],
      };

      // Si hay fotos, subirlas
      if (vinPlatePhoto && orPhotos.length > 0) {
        console.log("📤 Subiendo fotos del borrador...");

        const tempOrderId = draft?.id || Date.now();
        const uploadResult = await uploadServicePhotos(tempOrderId, {
          vinPlatePhoto,
          orPhotos,
        });

        if (uploadResult.success) {
          photoUrls = uploadResult.photoUrls!;
        }
      }

      const draftData = {
        ...formData,
        photoUrls,
      };

      const result = await saveServiceWithPhotos(
        draftData,
        user.companyId,
        user.userId,
        true,
        draft?.id
      );

      if (result.success) {
        alert(
          `✅ ${
            draft?.id ? "Borrador actualizado" : "Borrador guardado"
          } correctamente`
        );
        handleClose();
      } else {
        setErrors({ general: result.message || "Error al guardar borrador" });
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: "Error al guardar borrador" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-hidden flex flex-col shadow-lg text-sm">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            {isEditMode ? "Editar Borrador - Servicio" : "Ingreso de Servicio"}
            {isEditMode && draft?.id && (
              <span className="text-sm text-gray-500 ml-2">
                (ID: {draft.id})
              </span>
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
            {/* Error general */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            {/* Campos del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Or interna <span className="text-red-500">*</span>
                </label>
                <input
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  placeholder="Ingrese el numero interno"
                  className={`border rounded px-2 py-1 w-full ${
                    errors.orderNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.orderNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.orderNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  VIN <span className="text-red-500">*</span>
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
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nro. Motor
                </label>
                <input
                  value={formData.engineNumber}
                  readOnly
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Modelo
                </label>
                <input
                  value={formData.model}
                  readOnly
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Servicio <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kilometraje Real del vehiculo <span className="text-red-500">*</span>
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

            {/* ========== SECCIÓN DE FOTOS ========== */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Fotos
              </h3>
              <div className="space-y-6">
                <div className="p-4 rounded-lg space-y-4">
                  
                  <div>
                    <ImageUploadField
                      label="Foto de Chapa VIN"
                      value={vinPlatePhoto}
                      onChange={(file) => {
                        setVinPlatePhoto(file);
                        if (errors.vinPlatePhoto) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.vinPlatePhoto;
                            return newErrors;
                          });
                        }
                      }}
                      required
                    />
                    {errors.vinPlatePhoto && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.vinPlatePhoto}
                      </p>
                    )}
                  </div>

                  <div>
                    <MultipleMediaUploadField
                      label="Fotos OR (Fotos/Videos)"
                      value={orPhotos}
                      onChange={(files) => {
                        setOrPhotos(files);
                        if (errors.orPhotos) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.orPhotos;
                            return newErrors;
                          });
                        }
                      }}
                      maxFiles={10}
                      required
                    />
                    {errors.orPhotos && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.orPhotos}
                      </p>
                    )}
                  </div>
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
                {isSubmitting
                  ? "Guardando..."
                  : isEditMode
                  ? "Actualizar Borrador"
                  : "Guardar Borrador"}
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Enviando..."
                  : isEditMode
                  ? "Enviar Servicio"
                  : "Enviar Servicio"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}