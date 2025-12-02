// components/orders/modals/EditObservedClaimModal.tsx
import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { updateObservedClaim } from "@/app/(dashboard)/ordenes/insert/claim/actions";
import { uploadClaimPhotos } from "@/lib/uploadClaimPhotos";
import { useUser } from "@/hooks/useUser";
import type { Order } from "@/app/types";

// Importar componentes de upload
import ImageUploadField from "@/components/awss3/ImageUploadField";
import MultipleMediaUploadField from "@/components/awss3/MultipleMediaUploadField";
import PDFUploadField from "@/components/awss3/PDFUploadField";

interface EditObservedClaimModalProps {
  order: Order;
  onClose: () => void;
  onOrderUpdated: () => void;
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

export default function EditObservedClaimModal({
  order,
  onClose,
  onOrderUpdated,
}: EditObservedClaimModalProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data - solo campos editables
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [actualMileage, setActualMileage] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [additionalObservations, setAdditionalObservations] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // Estados para fotos NUEVAS
  const [licensePlatePhoto, setLicensePlatePhoto] = useState<File | null>(null);
  const [vinPlatePhoto, setVinPlatePhoto] = useState<File | null>(null);
  const [odometerPhoto, setOdometerPhoto] = useState<File | null>(null);
  const [customerSignaturePhoto, setCustomerSignaturePhoto] = useState<File | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [orPhotos, setOrPhotos] = useState<File[]>([]);
  const [reportPdfs, setReportPdfs] = useState<File[]>([]);

  // URLs de fotos ACTUALES
  const [currentPhotos, setCurrentPhotos] = useState({
    licensePlate: "",
    vinPlate: "",
    odometer: "",
    customerSignature: "",
    additional: [] as string[],
    or: [] as string[],
    reportPdfs: [] as string[],
  });

  // Obtener la observación del estado OBSERVADO
  const observationComment = order.statusHistory
    ?.filter((h) => h.status === "OBSERVADO")
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())[0]
    ?.observation || order.internalStatusObservation || "Sin comentario";

  // Cargar datos iniciales
  useEffect(() => {
    setOrderNumber(order.orderNumber?.toString() || "");
    setCustomerName(
      order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : ""
    );
    setActualMileage(order.actualMileage?.toString() || "");
    setDiagnosis(order.diagnosis || "");
    setAdditionalObservations(order.additionalObservations || "");

    // Cargar tareas
    const loadedTasks =
      order.tasks && order.tasks.length > 0
        ? order.tasks.map((task) => ({
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
        : [
            {
              description: "",
              hoursCount: "",
              parts: [{ part: { code: "", description: "" } }],
            },
          ];

    setTasks(loadedTasks);

    // Cargar fotos actuales
    if (order.photos) {
      const photos = {
        licensePlate: order.photos.find((p) => p.type === "license_plate")?.url || "",
        vinPlate: order.photos.find((p) => p.type === "vin_plate")?.url || "",
        odometer: order.photos.find((p) => p.type === "odometer")?.url || "",
        customerSignature: order.photos.find((p) => p.type === "customer_signature")?.url || "",
        additional: order.photos
          .filter((p) => p.type.startsWith("additional_"))
          .map((p) => p.url),
        or: order.photos.filter((p) => p.type.startsWith("or_")).map((p) => p.url),
        reportPdfs: order.photos
          .filter((p) => p.type.startsWith("report_pdf_"))
          .map((p) => p.url),
      };
      setCurrentPhotos(photos);
    }
  }, [order]);

  const handleAddTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        description: "",
        hoursCount: "",
        parts: [{ part: { code: "", description: "" } }],
      },
    ]);
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleTaskChange = (index: number, field: string, value: string) => {
    setTasks((prev) => {
      const newTasks = [...prev];

      if (field === "description") {
        newTasks[index].description = value;
      } else if (field === "hoursCount") {
        newTasks[index].hoursCount = value;
      } else if (field === "partCode") {
        newTasks[index].parts[0].part.code = value;
      } else if (field === "partDescription") {
        newTasks[index].parts[0].part.description = value;
      }

      return newTasks;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("❌ No se pudo obtener la información del usuario");
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrls = undefined;

      // Si el usuario subió nuevas fotos, subirlas
      if (licensePlatePhoto || vinPlatePhoto || odometerPhoto) {
        console.log("📤 Subiendo nuevas fotos...");

        // Validar que estén las 3 obligatorias
        if (!licensePlatePhoto || !vinPlatePhoto || !odometerPhoto) {
          alert("❌ Debes subir las 3 fotos obligatorias (Patente, VIN, Kilómetros)");
          setIsSubmitting(false);
          return;
        }

        const uploadResult = await uploadClaimPhotos(order.id, {
          licensePlatePhoto,
          vinPlatePhoto,
          odometerPhoto,
          customerSignaturePhoto: customerSignaturePhoto || undefined,
          additionalPhotos,
          orPhotos,
          reportPdfs,
        });

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Error al subir fotos");
        }

        photoUrls = {
          licensePlate: uploadResult.photoUrls!.licensePlate?.url || "",
          vinPlate: uploadResult.photoUrls!.vinPlate?.url || "",
          odometer: uploadResult.photoUrls!.odometer?.url || "",
          customerSignature: uploadResult.photoUrls!.customerSignature?.url,
          additional: uploadResult.photoUrls!.additional?.map(p => p?.url || "") || [],
          or: uploadResult.photoUrls!.or?.map(p => p?.url || "") || [],
          reportPdfs: uploadResult.photoUrls!.reportPdfs?.map(p => p?.url || "") || [],
        };

        console.log("✅ Fotos subidas exitosamente");
      }

      // Preparar datos
      const dataToSubmit = {
        orderNumber,
        customerName,
        actualMileage,
        diagnosis,
        additionalObservations,
        tasks: tasks.filter(
          (task) =>
            task.description.trim() !== "" ||
            task.hoursCount.trim() !== "" ||
            task.parts[0].part.code.trim() !== "" ||
            task.parts[0].part.description.trim() !== ""
        ),
        photoUrls,
      };

      console.log("💾 Actualizando reclamo...");

      const result = await updateObservedClaim(
        order.id,
        dataToSubmit,
        user.userId
      );

      if (result.success) {
        alert("✅ Reclamo actualizado y reenviado correctamente");
        onOrderUpdated();
        onClose();
      } else {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-hidden flex flex-col shadow-lg text-sm">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            Editar Reclamo Observado
            <span className="text-sm text-gray-500 ml-2">(ID: {order.id})</span>
          </h2>
          <button
            onClick={onClose}
            className="text-lg font-bold text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {/* Banner de Observación */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Motivo de la observación:
              </p>
              <p className="mt-1 text-sm text-yellow-700">{observationComment}</p>
            </div>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit}>
            {/* Campos del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* READONLY - Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  readOnly
                  value={new Date(order.creationDate).toLocaleDateString()}
                  className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* EDITABLE - OR Interna */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  OR Interna
                </label>
                <input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Ingrese el numero interno de orden"
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              {/* READONLY - Pre-autorización */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pre-autorización
                </label>
                <input
                  readOnly
                  value={order.preAuthorizationNumber || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* EDITABLE - Nombre Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre Cliente
                </label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ingrese nombre completo"
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              {/* READONLY - VIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  VIN
                </label>
                <input
                  readOnly
                  value={order.vehicle?.vin || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* READONLY - Activación Garantía */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activación Garantía
                </label>
                <input
                  readOnly
                  value={
                    order.vehicle?.warranty?.activationDate
                      ? new Date(
                          order.vehicle.warranty.activationDate
                        ).toLocaleDateString()
                      : "-"
                  }
                  className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* READONLY - Nro. Motor */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nro. Motor
                </label>
                <input
                  readOnly
                  value={order.vehicle?.engineNumber || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* READONLY - Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Modelo
                </label>
                <input
                  readOnly
                  value={order.vehicle?.model || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* EDITABLE - Kilometraje Real */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kilometraje Real del vehículo
                </label>
                <input
                  value={actualMileage}
                  onChange={(e) => setActualMileage(e.target.value)}
                  placeholder="Ingrese kilometraje"
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              {/* EDITABLE - Diagnóstico */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Diagnóstico
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Ingrese el diagnóstico"
                  rows={3}
                  className="border rounded px-2 py-1 w-full resize-none"
                />
              </div>

              {/* EDITABLE - Observaciones */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones adicionales
                </label>
                <textarea
                  value={additionalObservations}
                  onChange={(e) => setAdditionalObservations(e.target.value)}
                  placeholder="Ingrese observaciones"
                  rows={3}
                  className="border rounded px-2 py-1 w-full resize-none"
                />
              </div>
            </div>

            {/* EDITABLE - SECCIÓN DE TAREAS */}
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

              {tasks.length > 0 ? (
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
                      {tasks.map((task, index) => (
                        <tr key={index} className="odd:bg-white even:bg-gray-50">
                          <td className="px-3 py-2 border">
                            <input
                              value={task.description}
                              onChange={(e) =>
                                handleTaskChange(index, "description", e.target.value)
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
                                handleTaskChange(index, "hoursCount", e.target.value)
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
                                handleTaskChange(index, "partCode", e.target.value)
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
                            {tasks.length > 1 && (
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

            {/* EDITABLE - SECCIÓN DE FOTOS */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Fotos y Documentos
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Las imagenes de la orden son las que se muestran podes mantenerlas o subir nuevas para reemplazarlas.
              </p>

              <div className="space-y-6">
                {/* Fotos obligatorias */}
                <ImageUploadField
                  label="Foto de Patente"
                  value={licensePlatePhoto}
                  onChange={setLicensePlatePhoto}
                  currentUrl={currentPhotos.licensePlate}
                />

                <ImageUploadField
                  label="Foto de Chapa VIN"
                  value={vinPlatePhoto}
                  onChange={setVinPlatePhoto}
                  currentUrl={currentPhotos.vinPlate}
                />

                <ImageUploadField
                  label="Foto de Kilómetros"
                  value={odometerPhoto}
                  onChange={setOdometerPhoto}
                  currentUrl={currentPhotos.odometer}
                />

                {/* Foto Firma Cliente */}
                <ImageUploadField
                  label="Foto Firma Conformidad Cliente"
                  value={customerSignaturePhoto}
                  onChange={setCustomerSignaturePhoto}
                  currentUrl={currentPhotos.customerSignature}
                />

                <MultipleMediaUploadField
                  label="Piezas Adicionales (Fotos/Videos)"
                  value={additionalPhotos}
                  onChange={setAdditionalPhotos}
                  currentUrls={currentPhotos.additional}
                  maxFiles={10}
                />

                <MultipleMediaUploadField
                  label="Fotos OR (Fotos/Videos)"
                  value={orPhotos}
                  onChange={setOrPhotos}
                  currentUrls={currentPhotos.or}
                  maxFiles={10}
                />

                <PDFUploadField
                  label="Reportes PDF"
                  value={reportPdfs}
                  onChange={setReportPdfs}
                  currentUrls={currentPhotos.reportPdfs}
                  maxFiles={2}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Reenviar Reclamo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}