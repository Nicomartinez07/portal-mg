// components/orders/modals/InsertClaimModal.tsx
import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { getVehicleByVin } from "@/app/(dashboard)/vehiculos/actions";
import { getPreAuthorizationDetails } from "@/app/(dashboard)/ordenes/insert/claim/actions";
import { saveClaimWithPhotos } from "@/app/(dashboard)/ordenes/insert/claim/actions";
import { uploadClaimPhotos } from "@/lib/uploadClaimPhotos";
import { useUser } from "@/hooks/useUser";
import type { Draft } from "@/app/types";

// Importar componentes de upload
import ImageUploadField from "@/components/awss3/ImageUploadField";
import MultipleMediaUploadField from "@/components/awss3/MultipleMediaUploadField";
import PDFUploadField from "@/components/awss3/PDFUploadField";

interface InsertClaimModalProps {
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
  preAuthorizationNumber: "",
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

export default function InsertClaimModal({
  onClose,
  open,
  draft,
  isEditMode = false,
}: InsertClaimModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useUser();

  // Estados para fotos
  const [licensePlatePhoto, setLicensePlatePhoto] = useState<File | null>(null);
  const [vinPlatePhoto, setVinPlatePhoto] = useState<File | null>(null);
  const [odometerPhoto, setOdometerPhoto] = useState<File | null>(null);
  const [customerSignaturePhoto, setCustomerSignaturePhoto] = useState<File | null>(null);
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
        preAuthorizationNumber: draft.preAuthorizationNumber || "",
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

      // TODO: Cargar fotos del borrador desde S3
      // Por ahora, limpiar fotos
      setLicensePlatePhoto(null);
      setVinPlatePhoto(null);
      setOdometerPhoto(null);
      setCustomerSignaturePhoto(null);
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
      setCustomerSignaturePhoto(null);
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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
        warrantyActivation: v.warranty?.activationDate
          ? new Date(v.warranty.activationDate).toISOString().split("T")[0]
          : "",
        model: v.model || "",
        engineNumber: v.engineNumber || "",
      }));
    } else {
      alert(result.message);
    }
  };

  const handleSearchPreAuthorization = async () => {
    if (!formData.preAuthorizationNumber) {
      alert("Ingrese un ID de pre-autorización primero");
      return;
    }

    const result = await getPreAuthorizationDetails(
      formData.preAuthorizationNumber
    );

    if (result.success && result.data) {
      setFormData((prev) => ({
        ...prev,
        customerName: result.data!.customerName,
        vin: result.data!.vin,
        model: result.data!.model,
        engineNumber: result.data!.engineNumber || "",
        actualMileage: result.data!.actualMileage?.toString() || "",
        diagnosis: result.data!.diagnosis || "",
        tasks:
          result.data!.tasks?.map((task) => ({
            description: task.description,
            hoursCount: task.hoursCount.toString(),
            parts: task.parts.map((part) => ({
              part: {
                code: part.part.code,
                description: part.part.description,
              },
            })),
          })) || prev.tasks,
      }));

      alert(result.message);
    } else {
      alert(result.message);
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

  // Validar fotos antes de enviar
  const validatePhotos = (): boolean => {
    if (!licensePlatePhoto) {
      alert("❌ Debes subir la foto de patente");
      return false;
    }
    if (!vinPlatePhoto) {
      alert("❌ Debes subir la foto de VIN");
      return false;
    }
    if (!odometerPhoto) {
      alert("❌ Debes subir la foto de kilómetros");
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("❌ No se pudo obtener la información del usuario");
      return;
    }

    // Validar fotos obligatorias
    if (!validatePhotos()) {
      return;
    }

    // Validar tareas
    const validTasks = formData.tasks.filter(
      (task) =>
        task.description.trim() !== "" &&
        task.hoursCount.trim() !== "" &&
        task.parts[0].part.code.trim() !== ""
    );

    if (validTasks.length === 0) {
      alert(
        "❌ Debe completar al menos una tarea con: descripción, horas y código de repuesto"
      );
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // 1. Generar ID temporal para subir fotos
      const tempOrderId = draft?.id || Date.now();

      console.log("📤 Paso 1: Subiendo fotos a S3...");

      // 2. Subir todas las fotos a S3
      const uploadResult = await uploadClaimPhotos(tempOrderId, {
        licensePlatePhoto: licensePlatePhoto!,
        vinPlatePhoto: vinPlatePhoto!,
        odometerPhoto: odometerPhoto!,
        customerSignaturePhoto: customerSignaturePhoto || undefined,
        additionalPhotos,
        orPhotos,
        reportPdfs,
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Error al subir fotos");
      }

      console.log("✅ Fotos subidas exitosamente");
      console.log("💾 Paso 2: Guardando reclamo en base de datos...");

      // 3. Preparar datos del reclamo
      const photoUrls = uploadResult.photoUrls!;
      const dataToSubmit = {
        ...formData,
        tasks: validTasks,
        photoUrls: {
          licensePlate: photoUrls.licensePlate?.url || "",
          vinPlate: photoUrls.vinPlate?.url || "",
          odometer: photoUrls.odometer?.url || "",
          customerSignature: photoUrls.customerSignature?.url,
          additional: photoUrls.additional?.map(p => p?.url || "") || [],
          or: photoUrls.or?.map(p => p?.url || "") || [],
          reportPdfs: photoUrls.reportPdfs?.map(p => p?.url || "") || [],
        },
      };

      // 4. Guardar reclamo con fotos
      const result = await saveClaimWithPhotos(
        dataToSubmit,
        user.companyId,
        user.userId,
        false, // No es borrador
        draft?.id
      );

      if (result.success) {
        alert(
          `✅ ${
            isEditMode ? "Borrador convertido a reclamo" : "Reclamo creado"
          } correctamente`
        );
        handleClose();
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        alert("⚠️ " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert(
        "❌ Error: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraftSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("❌ No se pudo obtener la información del usuario");
      return;
    }

    // Para borradores, validación mínima
    if (!formData.vin?.trim() || !formData.customerName?.trim()) {
      alert("❌ Para guardar borrador se requiere: VIN y Nombre del cliente");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Si hay fotos, subirlas
      let photoUrls: any = {
        licensePlate: "",
        vinPlate: "",
        odometer: "",
        customerSignature: undefined,
        additional: [],
        or: [],
        reportPdfs: [],
      };

      if (licensePlatePhoto && vinPlatePhoto && odometerPhoto) {
        console.log("📤 Subiendo fotos del borrador...");

        const tempOrderId = draft?.id || Date.now();
        const uploadResult = await uploadClaimPhotos(tempOrderId, {
          licensePlatePhoto,
          vinPlatePhoto,
          odometerPhoto,
          customerSignaturePhoto: customerSignaturePhoto || undefined,
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
            task.parts[0]?.part.code.trim() !== "" ||
            task.parts[0]?.part.description.trim() !== ""
        ),
        photoUrls,
      };

      const result = await saveClaimWithPhotos(
        draftData,
        user.companyId,
        user.userId,
        true, // Es borrador
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
        if (result.errors) {
          setErrors(result.errors);
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
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            {isEditMode ? "Editar Borrador - Reclamo" : "Ingreso de Reclamo"}
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

              {/* Pre-autorización */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pre-autorización
                </label>
                <div className="flex gap-2">
                  <input
                    name="preAuthorizationNumber"
                    value={formData.preAuthorizationNumber}
                    onChange={handleChange}
                    placeholder="Ingrese ID de pre-autorización"
                    className={`border rounded px-2 py-1 w-full ${
                      errors.preAuthorizationNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSearchPreAuthorization}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    Buscar
                  </button>
                </div>
                {errors.preAuthorizationNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.preAuthorizationNumber}
                  </p>
                )}
              </div>

              {/* Nombre Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre Cliente
                </label>
                <div className="flex gap-2">
                  <input
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Ingrese nombre completo del cliente"
                    className={`border rounded px-2 py-1 w-full ${
                      errors.customerName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerName}
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

              {/* Diagnóstico */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Diagnóstico
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
                <h3 className="font-semibold text-gray-700">Tareas</h3>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 text-xs"
                  disabled={isSubmitting}
                >
                  <FaPlus className="w-3 h-3" /> Agregar Tarea
                </button>
              </div>

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
                              className="w-full border rounded px-2 py-1 text-xs"
                              disabled={isSubmitting}
                            />
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
                              className="w-full border rounded px-2 py-1 text-xs text-center"
                              disabled={isSubmitting}
                            />
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
                              className="w-full border rounded px-2 py-1 text-xs text-center"
                              disabled={isSubmitting}
                            />
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

            {/* ========== NUEVA SECCIÓN DE FOTOS ========== */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📸 Fotos y Documentos
              </h3>

              <div className="space-y-6">
                {/* Fotos obligatorias */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <p className="text-sm text-blue-800 font-medium">
                    Fotos Obligatorias *
                  </p>

                  <ImageUploadField
                    label="Foto de Patente"
                    value={licensePlatePhoto}
                    onChange={setLicensePlatePhoto}
                    required
                  />

                  <ImageUploadField
                    label="Foto de Chapa VIN"
                    value={vinPlatePhoto}
                    onChange={setVinPlatePhoto}
                    required
                  />

                  <ImageUploadField
                    label="Foto de Kilómetros"
                    value={odometerPhoto}
                    onChange={setOdometerPhoto}
                    required
                  />
                </div>

                {/* Fotos opcionales */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <p className="text-sm text-gray-700 font-medium">
                    Material Adicional (Opcional)
                  </p>

                  {/* Firma del cliente */}
                  <ImageUploadField
                    label="Foto Firma Conformidad Cliente"
                    value={customerSignaturePhoto}
                    onChange={setCustomerSignaturePhoto}
                  />

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
                  ? "Enviar Reclamo"
                  : "Enviar Reclamo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}