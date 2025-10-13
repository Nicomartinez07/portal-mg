// src/app/components/InsertClaimModal.tsx
import React, { useEffect, useState } from "react";
import { FaUpload, FaPlus, FaTrash } from "react-icons/fa";
import { getVehicleByVin } from "@/app/vehiculos/actions";
import { saveClaim, getPreAuthorizationDetails } from "@/app/ordenes/insert/claim/actions";
import type { Draft } from "@/app/types";
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { useUser } from "@/hooks/useUser";

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

// Estado inicial del formulario 
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
  // Archivos 
  badgePhoto: null as File | null,
  vinPhoto: null as File | null,
  milagePhoto: null as File | null,
  aditionalPartsPhoto: null as File | null,
  orPhoto: null as File | null,
  customerSignaturePhoto: null as File | null,
};

export default function InsertClaimModal({
  onClose,
  open,
  draft,
  isEditMode = false,
}: InsertClaimModalProps) {
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
      console.log("Cargando draft de reclamo:", draft);
      
      // Convertir tasks del draft al formato del formulario
      const draftTasks = (draft.tasks ?? []).length > 0 
        ? (draft.tasks ?? []).map(task => ({
            description: task.description || "",
            hoursCount: task.hoursCount?.toString() || "",
            parts: (task.parts ?? []).length > 0 
              ? (task.parts ?? []).map(part => ({
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
        badgePhoto: null,
        vinPhoto: null,
        milagePhoto: null,
        aditionalPartsPhoto: null,
        orPhoto: null,
        customerSignaturePhoto: null,
      };

      setFormData(draftFormData);
      console.log("FormData de reclamo cargado:", draftFormData);
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

  // Handler para buscar pre-autorización
  const handleSearchPreAuthorization = async () => {
    if (!formData.preAuthorizationNumber) {
      alert("Ingrese un ID de pre-autorización primero");
      return;
    }
    
    const result = await getPreAuthorizationDetails(formData.preAuthorizationNumber);
    
    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        customerName: result.data!.customerName,
        vin: result.data!.vin,
        model: result.data!.model,
        engineNumber: result.data!.engineNumber || "",
        actualMileage: result.data!.actualMileage?.toString() || "",
        diagnosis: result.data!.diagnosis || "",
        tasks: result.data!.tasks?.map(task => ({
          description: task.description,
          hoursCount: task.hoursCount.toString(),
          parts: task.parts.map(part => ({
            part: {
              code: part.part.code,
              description: part.part.description
            }
          }))
        })) || prev.tasks
      }));
      
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  // Handlers para archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
      if (fieldName === "badgePhoto") {
        setSelectedFile(file);
      }
    }
  };

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

  const handleClose = () => {
    onClose();
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('❌ No se pudo obtener la información del usuario');
      return;
    }

    // Validar que haya al menos una tarea
    const validTasks = formData.tasks.filter(task => 
      task.description.trim() !== "" &&           
      task.hoursCount.trim() !== "" &&            
      task.parts[0].part.code.trim() !== ""       

    );

    if (validTasks.length === 0) {
      alert("❌ Debe completar al menos una tarea con: descripción, horas y código de repuesto");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const dataToSubmit = {
        ...formData,
        tasks: validTasks,
      };

      const result = await saveClaim(
        dataToSubmit,
        user.companyId, 
        user.userId,     
        false,
        draft?.id
      );


      if (result.success) {
        alert(`✅ ${isEditMode ? "Borrador convertido a Reclamo" : "Reclamo enviado"} correctamente`);
        handleClose();
      } else {
        // Mostrar errores de validación de Zod si existen
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert("⚠️ " + result.message);
        }
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error inesperado al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraftSave = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!user) {
    alert('❌ No se pudo obtener la información del usuario');
    return;
  }
  
  // Validación mínima para borradores
  if (!formData.vin?.trim() || !formData.customerName?.trim()) {
    alert("❌ Para guardar borrador se requiere al menos: VIN y Nombre del cliente");
    return;
  }
  
  setIsSubmitting(true);
  setErrors({});

  try {
    // Para borradores, permitimos campos vacíos
    const draftData = {
      ...formData,
      tasks: formData.tasks.filter(
        (task) =>
          task.description.trim() !== "" ||
          task.hoursCount.trim() !== "" ||
          (task.parts[0]?.part.code.trim() !== "" || task.parts[0]?.part.description.trim() !== "")
      ),
    };

    const result = await saveClaim(
      draftData,
      user.companyId,  
      user.userId,
      true, // isDraft = true
      draft?.id
    );

    if (result.success) {
      alert(`✅ ${draft?.id ? "Borrador actualizado" : "Borrador guardado"} correctamente`);
      handleClose();
    } else {
      if (result.errors) {
        setErrors(result.errors);
        alert("❌ Por favor corrige los errores en el formulario");
      } else {
        alert("⚠️ " + result.message);
      }
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
      <div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto relative shadow-lg text-sm">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-4">
          {isEditMode ? "Editar Borrador - Reclamo" : "Ingreso de Reclamo"}
          {isEditMode && draft?.id && (
            <span className="text-sm text-gray-500 ml-2">(ID: {draft.id})</span>
          )}
        </h2>

        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-lg font-bold"
          disabled={isSubmitting}
        >
          ×
        </button>

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
                    onChange={(e) => handleFileChange(e, "badgePhoto")}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                {formData.badgePhoto && (
                  <span className="text-gray-600 truncate max-w-[150px] text-xs">
                    {formData.badgePhoto instanceof File 
                      ? formData.badgePhoto.name 
                      : "Archivo ya subido"}
                  </span>
                )}
              </div>

              <label>Foto chapa VIN</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 text-xs">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "vinPhoto")}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                {formData.vinPhoto && (
                  <span className="text-gray-600 truncate max-w-[150px] text-xs">
                    {formData.vinPhoto instanceof File 
                      ? formData.vinPhoto.name 
                      : "Archivo ya subido"}
                  </span>
                )}
              </div>

              <label>Foto Kilometros</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 text-xs">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "milagePhoto")}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                {formData.milagePhoto && (
                  <span className="text-gray-600 truncate max-w-[150px] text-xs">
                    {formData.milagePhoto instanceof File 
                      ? formData.milagePhoto.name 
                      : "Archivo ya subido"}
                  </span>
                )}
              </div>

              <label>Foto piezas adicionales</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 text-xs">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "aditionalPartsPhoto")}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                {formData.aditionalPartsPhoto && (
                  <span className="text-gray-600 truncate max-w-[150px] text-xs">
                    {formData.aditionalPartsPhoto instanceof File 
                      ? formData.aditionalPartsPhoto.name 
                      : "Archivo ya subido"}
                  </span>
                )}
              </div>

              <label>Foto Or</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 text-xs">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "orPhoto")}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                {formData.orPhoto && (
                  <span className="text-gray-600 truncate max-w-[150px] text-xs">
                    {formData.orPhoto instanceof File 
                      ? formData.orPhoto.name 
                      : "Archivo ya subido"}
                  </span>
                )}
              </div>

              {/* Foto firma conformidad cliente */}
              <label>Foto firma conformidad cliente</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 text-xs">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "customerSignaturePhoto")}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                {formData.customerSignaturePhoto && (
                  <span className="text-gray-600 truncate max-w-[150px] text-xs">
                    {formData.customerSignaturePhoto instanceof File 
                      ? formData.customerSignaturePhoto.name 
                      : "Archivo ya subido"}
                  </span>
                )}
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
              {isSubmitting ? "Enviando..." : isEditMode ? "Enviar Reclamo" : "Enviar Reclamo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}