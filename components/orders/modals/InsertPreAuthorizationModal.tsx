// src/app/components/InsertPreAuthorizationModal.tsx
import React, { useEffect, useState } from "react";
import { FaUpload, FaPlus, FaTrash } from "react-icons/fa";
import { getVehicleByVin } from "@/app/(dashboard)/vehiculos/actions";
import { savePreAuthorization } from "@/app/(dashboard)/ordenes/insert/preAutorizacion/actions";
import { useUser } from '@/hooks/useUser';
import type { Draft } from "@/app/types";

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

// Estado inicial del formulario
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
  badgePhoto: null as File | null,
  vinPhoto: null as File | null,
  milagePhoto: null as File | null,
  aditionalPartsPhoto: null as File | null,
  orPhoto: null as File | null,
};

export default function InsertPreAuthorizationModal({
  onClose,
  open,
  draft,
  isEditMode = false,
}: InsertPreAuthorizationModalProps) {
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
      console.log("Cargando draft:", draft);
      
      // --- CORRECCIÓN 1 ---
      // Convertir tasks del draft al formato del formulario
      const draftTasks = (draft.tasks && draft.tasks.length > 0) 
        ? draft.tasks.map(task => ({
            description: task.description || "",
            hoursCount: task.hoursCount?.toString() || "",
            
            // --- CORRECCIÓN 2 ---
            parts: (task.parts && task.parts.length > 0) 
              ? task.parts.map(part => ({
                  part: {
                    code: part.part?.code || "",
                    description: part.part?.description || ""
                  }
                }))
              : [{ part: { code: "", description: "" } }]
          }))
        : initialFormData.tasks;

      const draftFormData = {
        creationDate: draft.creationDate 
          ? (typeof draft.creationDate === 'string' 
             ? draft.creationDate 
             : new Date(draft.creationDate).toLocaleDateString())
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
        badgePhoto: null,
        vinPhoto: null,
        milagePhoto: null,
        aditionalPartsPhoto: null,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  // Funciones para manejar tareas
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
        tasks: formData.tasks.filter(
          (task) =>
            task.description.trim() !== "" ||
            task.hoursCount.trim() !== "" ||
            task.parts[0].part.code.trim() !== "" ||
            task.parts[0].part.description.trim() !== ""
        ),
      };

      const result = await savePreAuthorization(
        dataToSubmit,
        user.companyId, 
        user.userId,     
        false,
        draft?.id
      );

      if (result.success) {
        alert(`✅ ${isEditMode ? "Borrador convertido a orden" : "Pre-autorización enviada"} correctamente`);
        handleClose();
      } else {
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
        tasks: formData.tasks.filter(
          (task) =>
            task.description.trim() !== "" ||
            task.hoursCount.trim() !== "" ||
            task.parts[0].part.code.trim() !== "" ||
            task.parts[0].part.description.trim() !== ""
        ),
      };

      const result = await savePreAuthorization(
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
          {isEditMode ? "Editar Borrador - Pre-Autorización" : "Ingreso de Pre-Autorización"}
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

          {/* Subida de archivo */}
          <div className="mt-6">
            <div className="grid grid-cols-[160px_1fr] gap-2 items-center text-sm">
              <label>Foto Patente</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 text-xs">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                {selectedFile && (
                  <>
                    <span className="text-gray-600 truncate max-w-[150px] text-xs">
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 text-xs"
                      disabled={isSubmitting}
                    >
                      <FaUpload className="w-3 h-3" /> Subir
                    </button>
                  </>
                )}
              </div>
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
              <label>Foto Kilometros</label>
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
              <label>Foto piezas adicionales</label>
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