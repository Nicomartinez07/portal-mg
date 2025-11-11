// lib/schemas/preAuthorizationSchema.ts
import { z } from "zod";

// Schema para una tarea
const taskSchema = z.object({
  description: z.string().optional(),
  hoursCount: z.string().optional(),
  parts: z.array(
    z.object({
      part: z.object({
        code: z.string().optional(),
        description: z.string().optional(),
      }),
    })
  ),
});

// Schema para validar archivos en el cliente
const fileSchema = z.instanceof(File, { message: "Debe ser un archivo válido" });

// Schema completo de pre-autorización con fotos
export const preAuthorizationSchema = z.object({
  // Campos básicos
  vin: z.string().min(1, "El VIN es obligatorio"),
  orderNumber: z.string().optional(),
  customerName: z.string().min(1, "El nombre del cliente es obligatorio"),
  actualMileage: z.string().min(1, "El kilometraje es obligatorio"),
  diagnosis: z.string().min(1, "El diagnóstico es obligatorio"),
  additionalObservations: z.string().optional(),
  
  // Campos de solo lectura (opcionales porque se completan automáticamente)
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  creationDate: z.string().optional(),
  
  // Tareas
  tasks: z.array(taskSchema).optional(),
  
  // Fotos obligatorias (3)
  licensePlatePhoto: fileSchema,
  vinPlatePhoto: fileSchema,
  odometerPhoto: fileSchema,
  
  // Fotos/videos opcionales (múltiples)
  additionalPhotos: z.array(fileSchema).optional(),
  orPhotos: z.array(fileSchema).optional(),
  
  // PDFs opcionales (máximo 2)
  reportPdfs: z.array(fileSchema).max(2, "Máximo 2 PDFs permitidos").optional(),
});

export type PreAuthorizationFormData = z.infer<typeof preAuthorizationSchema>;

// Schema simplificado para validación inicial (sin fotos)
// Útil para validar antes de que el usuario agregue fotos
export const preAuthorizationSchemaWithoutPhotos = preAuthorizationSchema.omit({
  licensePlatePhoto: true,
  vinPlatePhoto: true,
  odometerPhoto: true,
  additionalPhotos: true,
  orPhotos: true,
  reportPdfs: true,
});