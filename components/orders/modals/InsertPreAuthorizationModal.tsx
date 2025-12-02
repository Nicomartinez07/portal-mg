// components/orders/modals/InsertPreAuthorizationModal.tsx
import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { getVehicleByVin } from "@/app/(dashboard)/vehiculos/actions";
import { savePreAuthorizationWithPhotos } from "@/app/(dashboard)/ordenes/insert/preAutorizacion/actions";
import { uploadOrderPhotos } from "@/lib/uploadOrderPhotos";
import { useUser } from "@/hooks/useUser";
import type { Draft } from "@/app/types";
import { 
  preAuthorizationDraftSchema, 
  preAuthorizationFinalSchema 
} from "@/schemas/preAuthorization";

// Importar componentes de upload
import ImageUploadField from "@/components/awss3/ImageUploadField";
import MultipleMediaUploadField from "@/components/awss3/MultipleMediaUploadField";
import PDFUploadField from "@/components/awss3/PDFUploadField";

interface InsertPreAuthorizationModalProps {
  onClose: () => void;
  open: boolean;
  draft?: Draft;
  isEditMode?: boolean;
}

interface Task {
  description: string;
  hoursCount: string;
  parts: {
    part: {
      code: string;
      description: string;
    };
  }[];
}

const initialFormData = {
  creationDate: "",
  orderNumber: "",
  customerName: "",
  vin: "",
  warrantyActivation: "",
  engineNumber: "",
  model: "",
  actualMileage: "",
  diagnosis: "",
  additionalObservations: "",
  tasks: [
    {
      description: "",
      hoursCount: "",
      parts: [{ part: { code: "", description: "" } }],
    },
  ] as Task[],
};

export default function InsertPreAuthorizationModal({
  onClose,
  open,
  draft,
  isEditMode = false,
}: InsertPreAuthorizationModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useUser();

  // Estados para fotos
  const [licensePlatePhoto, setLicensePlatePhoto] = useState<File | null>(null);
  const [vinPlatePhoto, setVinPlatePhoto] = useState<File | null>(null);
  const [odometerPhoto, setOdometerPhoto] = useState<File | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [orPhotos, setOrPhotos] = useState<File[]>([]);
  const [reportPdfs, setReportPdfs] = useState<File[]>([]);

  // Cargar datos del draft
  useEffect(() => {
    if (open && draft) {
      const draftTasks =
        draft.tasks && draft.tasks.length > 0
          ? draft.tasks.map((task) => ({
              description: task.description || "",
              hoursCount: task.hoursCount?.toString() || "",
              parts:
                task.parts && task.parts.length > 0
                  ? task.parts.map((part) => ({
                      part: {
                        code: part.part?.code || "",
                        description: part.part?.description || "",
                      },
                    }))
                  : [{ part: { code: "", description: "" } }],
            }))
          : initialFormData.tasks;

      const draftFormData = {
        creationDate: draft.creationDate
          ? typeof draft.creationDate === "string"
            ? draft.creationDate
            : new Date(draft.creationDate).toLocaleDateString()
          : new Date().toLocaleDateString(),
        orderNumber: draft.orderNumber?.toString() || "",
        customerName: draft.customerName || draft.customer?.firstName || "",
        vin: draft.vin || draft.vehicle?.vin || "",
        warrantyActivation: draft.warrantyActivation || "",
        engineNumber: draft.engineNumber || "",
        model: draft.model || "",
        actualMileage: draft.actualMileage?.toString() || "",
        diagnosis: draft.diagnosis || "",
        additionalObservations: draft.additionalObservations || "",
        tasks: draftTasks,
      };

      setFormData(draftFormData);
      
      // Limpiar fotos
      setLicensePlatePhoto(null);
      setVinPlatePhoto(null);
      setOdometerPhoto(null);
      setAdditionalPhotos([]);
      setOrPhotos([]);
      setReportPdfs([]);
    } else if (open) {
      const date = new Date();
      setFormData({
        ...initialFormData,
        creationDate: date.toLocaleDateString(),
      });
      
      // Limpiar fotos
      setLicensePlatePhoto(null);
      setVinPlatePhoto(null);
      setOdometerPhoto(null);
      setAdditionalPhotos([]);
      setOrPhotos([]);
      setReportPdfs([]);
    }

    setErrors({});
    setIsSubmitting(false);
  }, [open, draft]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleAddTask = () => {
    setFormData((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          description: "",
          hoursCount: "",
          parts: [{ part: { code: "", description: "" } }],
        },
      ],
    }));
  };

  const handleRemoveTask = (index: number) => {
    if (formData.tasks.length > 1) {
      setFormData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== index),
      }));
    }
  };

  const handleTaskChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newTasks = [...prev.tasks];

      if (field === "description") {
        newTasks[index].description = value;
      } else if (field === "hoursCount") {
        newTasks[index].hoursCount = value;
      } else if (field === "partCode") {
        newTasks[index].parts[0].part.code = value;
      } else if (field === "partDescription") {
        newTasks[index].parts[0].part.description = value;
      }

      return { ...prev, tasks: newTasks };
    });
  };

  const handleClose = () => {
    onClose();
  };

  // ==================== VALIDACIÓN CON ZOD ====================
  const validateForm = (isDraft: boolean) => {
    const dataToValidate = {
      ...formData,
      licensePlatePhoto,
      vinPlatePhoto,
      odometerPhoto,
      additionalPhotos,
      orPhotos,
      reportPdfs,
    };

    // Usar schema según si es borrador o no
    const schema = isDraft ? preAuthorizationDraftSchema : preAuthorizationFinalSchema;
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

      const uploadResult = await uploadOrderPhotos(tempOrderId, {
        licensePlatePhoto: licensePlatePhoto!,
        vinPlatePhoto: vinPlatePhoto!,
        odometerPhoto: odometerPhoto!,
        additionalPhotos,
        orPhotos,
        reportPdfs,
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Error al subir fotos");
      }

      console.log("✅ Fotos subidas exitosamente");
      console.log("💾 Paso 2: Guardando orden en base de datos...");

      const dataToSubmit = {
        ...formData,
        tasks: formData.tasks.filter(
          (task) =>
            task.description.trim() !== "" ||
            task.hoursCount.trim() !== "" ||
            task.parts[0].part.code.trim() !== "" ||
            task.parts[0].part.description.trim() !== ""
        ),
        photoUrls: uploadResult.photoUrls!,
      };

      const result = await savePreAuthorizationWithPhotos(
        dataToSubmit,
        user.companyId,
        user.userId,
        false,
        draft?.id
      );

      if (result.success) {
        alert(
          `✅ ${
            isEditMode
              ? "Borrador convertido a orden"
              : "Pre-autorización creada"
          } correctamente`
        );
        handleClose();
      } else {
        setErrors({ general: result.message || "Error al guardar la orden" });
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
      let photoUrls: {
        licensePlate: string;
        vinPlate: string;
        odometer: string;
        additional: string[];
        or: string[];
        reportPdfs: string[];
      } = {
        licensePlate: "",
        vinPlate: "",
        odometer: "",
        additional: [],
        or: [],
        reportPdfs: [],
      };

      // Si hay fotos, subirlas
      if (licensePlatePhoto && vinPlatePhoto && odometerPhoto) {
        console.log("📤 Subiendo fotos del borrador...");
        
        const tempOrderId = draft?.id || Date.now();
        const uploadResult = await uploadOrderPhotos(tempOrderId, {
          licensePlatePhoto,
          vinPlatePhoto,
          odometerPhoto,
          additionalPhotos,
          orPhotos,
          reportPdfs,
        });

        if (uploadResult.success) {
          photoUrls = uploadResult.photoUrls!;
        }
      }

      const draftData = {
        ...formData,
        tasks: formData.tasks.filter(
          (task) =>
            task.description.trim() !== "" ||
            task.hoursCount.trim() !== "" ||
            task.parts[0].part.code.trim() !== "" ||
            task.parts[0].part.description.trim() !== ""
        ),
        photoUrls,
      };

      const result = await savePreAuthorizationWithPhotos(
        draftData,
        user.companyId,
        user.userId,
        true,
        draft?.id
      );

      if (result.success) {
        alert(
          `✅ ${draft?.id ? "Borrador actualizado" : "Borrador guardado"} correctamente`
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
            {isEditMode
              ? "Editar Borrador - Pre-Autorización"
              : "Ingreso de Pre-Autorización"}
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
                  placeholder="Ingrese el numero interno de orden"
                  className={`border rounded px-2 py-1 w-full ${
                    errors.orderNumber ? "border-red-500" : ""
                  }`}
                />
                {errors.orderNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.orderNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre Cliente <span className="text-red-500">*</span>
                </label>
                <input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Ingrese nombre completo"
                  className={`border rounded px-2 py-1 w-full ${
                    errors.customerName ? "border-red-500" : ""
                  }`}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                )}
              </div>

              {/* VIN + Buscar */}
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

              {/* Diagnóstico */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Diagnóstico <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="diagnosis"
                  placeholder="Ingrese el diagnóstico"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows={3}
                  className={`border rounded px-2 py-1 w-full resize-none ${
                    errors.diagnosis ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.diagnosis && (
                  <p className="text-red-500 text-xs mt-1">{errors.diagnosis}</p>
                )}
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones adicionales
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

            {/* SECCIÓN DE TAREAS */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">
                  Tareas <span className="text-red-500">*</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 text-xs"
                  disabled={isSubmitting}
                >
                  <FaPlus className="w-3 h-3" /> Agregar Tarea
                </button>
              </div>

              {/* Error general de tareas */}
              {errors.tasks && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                  {errors.tasks}
                </div>
              )}

              {formData.tasks.length > 0 ? (
                <div className="overflow-x-auto border border-gray-300 rounded">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 text-left text-xs">
                        <th className="px-3 py-2 border">Tarea</th>
                        <th className="px-3 py-2 border text-center w-24">
                          Cant. horas
                        </th>
                        <th className="px-3 py-2 border text-center w-32">
                          Código repuesto
                        </th>
                        <th className="px-3 py-2 border">Descripción repuesto</th>
                        <th className="px-3 py-2 border text-center w-16">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.tasks.map((task, index) => (
                        <tr key={index} className="odd:bg-white even:bg-gray-50">
                          <td className="px-3 py-2 border">
                            <input
                              value={task.description}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Descripción de la tarea"
                              className={`w-full border rounded px-2 py-1 text-xs ${
                                errors[`tasks.${index}.description`] ? "border-red-500" : ""
                              }`}
                              disabled={isSubmitting}
                            />
                            {errors[`tasks.${index}.description`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`tasks.${index}.description`]}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2 border">
                            <input
                              type="number"
                              value={task.hoursCount}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "hoursCount",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className={`w-full border rounded px-2 py-1 text-xs text-center ${
                                errors[`tasks.${index}.hoursCount`] ? "border-red-500" : ""
                              }`}
                              disabled={isSubmitting}
                            />
                            {errors[`tasks.${index}.hoursCount`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`tasks.${index}.hoursCount`]}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2 border">
                            <input
                              value={task.parts[0].part.code}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "partCode",
                                  e.target.value
                                )
                              }
                              placeholder="Código repuesto"
                              className={`w-full border rounded px-2 py-1 text-xs text-center ${
                                errors[`tasks.${index}.parts.0.part.code`] ? "border-red-500" : ""
                              }`}
                              disabled={isSubmitting}
                            />
                            {errors[`tasks.${index}.parts.0.part.code`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`tasks.${index}.parts.0.part.code`]}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2 border">
                            <input
                              value={task.parts[0].part.description}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "partDescription",
                                  e.target.value
                                )
                              }
                              placeholder="Descripción del repuesto"
                              className="w-full border rounded px-2 py-1 text-xs"
                              disabled={isSubmitting}
                            />
                          </td>
                          <td className="px-3 py-2 border text-center">
                            {formData.tasks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTask(index)}
                                className="text-red-500 hover:text-red-700"
                                title="Eliminar tarea"
                                disabled={isSubmitting}
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 border border-gray-300 rounded py-4">
                  No hay tareas agregadas
                </div>
              )}
            </div>

            {/* ========== SECCIÓN DE FOTOS ========== */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Fotos y Documentos
              </h3>

              <div className="space-y-6">
                <div className="p-4 rounded-lg space-y-4">

                  <div>
                    <ImageUploadField
                      label="Foto de Patente"
                      value={licensePlatePhoto}
                      onChange={(file) => {
                        setLicensePlatePhoto(file);
                        if (errors.licensePlatePhoto) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.licensePlatePhoto;
                            return newErrors;
                          });
                        }
                      }}
                      required
                    />
                    {errors.licensePlatePhoto && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.licensePlatePhoto}
                      </p>
                    )}
                  </div>

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
                    <ImageUploadField
                      label="Foto de Kilómetros"
                      value={odometerPhoto}
                      onChange={(file) => {
                        setOdometerPhoto(file);
                        if (errors.odometerPhoto) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.odometerPhoto;
                            return newErrors;
                          });
                        }
                      }}
                      required
                    />
                    {errors.odometerPhoto && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.odometerPhoto}
                      </p>
                    )}
                  </div>

                  <MultipleMediaUploadField
                    label="Piezas Adicionales (Fotos/Videos)"
                    value={additionalPhotos}
                    onChange={setAdditionalPhotos}
                    maxFiles={10}
                  />

                  <MultipleMediaUploadField
                    label="Fotos OR (Fotos/Videos)"
                    value={orPhotos}
                    onChange={setOrPhotos}
                    maxFiles={10}
                  />

                  <PDFUploadField
                    label="Reportes PDF"
                    value={reportPdfs}
                    onChange={setReportPdfs}
                    maxFiles={2}
                  />
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
                  ? "Enviar Pre-Autorización"
                  : "Enviar Pre-Autorización"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}