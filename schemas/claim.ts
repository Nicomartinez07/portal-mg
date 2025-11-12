// schemas/claimSchema.ts
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

// ========== SCHEMA PARA RECLAMO COMPLETO (NO BORRADOR) ==========
export const claimSchema = z.object({
  // Campos básicos
  vin: z.string().min(1, "El VIN es obligatorio"),
  orderNumber: z.string().optional(),
  preAuthorizationNumber: z.string().optional(),
  customerName: z.string().min(1, "El nombre del cliente es obligatorio"),
  actualMileage: z.string().min(1, "El kilometraje es obligatorio"),
  diagnosis: z.string().min(1, "El diagnóstico es obligatorio"),
  additionalObservations: z.string().optional(),
  
  // Campos de solo lectura (opcionales)
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
  
  // Foto opcional única (firma cliente)
  customerSignaturePhoto: fileSchema.optional(),
  
  // Fotos/videos opcionales (múltiples)
  additionalPhotos: z.array(fileSchema).optional(),
  orPhotos: z.array(fileSchema).optional(),
  
  // PDFs opcionales (máximo 2)
  reportPdfs: z.array(fileSchema).max(2, "Máximo 2 PDFs permitidos").optional(),
});

// ========== SCHEMA PARA BORRADOR (SIN FOTOS OBLIGATORIAS) ==========
export const draftClaimSchema = z.object({
  // Campos mínimos obligatorios para borrador
  vin: z.string().min(1, "El VIN es obligatorio"),
  customerName: z.string().min(1, "El nombre del cliente es obligatorio"),
  
  // Campos opcionales
  orderNumber: z.string().optional(),
  preAuthorizationNumber: z.string().optional(),
  actualMileage: z.string().optional(),
  diagnosis: z.string().optional(),
  additionalObservations: z.string().optional(),
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  creationDate: z.string().optional(),
  
  // Tareas opcionales
  tasks: z.array(taskSchema).optional(),
  
  // TODAS las fotos son opcionales en borradores
  licensePlatePhoto: fileSchema.optional(),
  vinPlatePhoto: fileSchema.optional(),
  odometerPhoto: fileSchema.optional(),
  customerSignaturePhoto: fileSchema.optional(),
  additionalPhotos: z.array(fileSchema).optional(),
  orPhotos: z.array(fileSchema).optional(),
  reportPdfs: z.array(fileSchema).optional(),
});

export type ClaimFormData = z.infer<typeof claimSchema>;
export type DraftClaimFormData = z.infer<typeof draftClaimSchema>;

// Schema simplificado para validación inicial (sin fotos)
export const claimSchemaWithoutPhotos = claimSchema.omit({
  licensePlatePhoto: true,
  vinPlatePhoto: true,
  odometerPhoto: true,
  customerSignaturePhoto: true,
  additionalPhotos: true,
  orPhotos: true,
  reportPdfs: true,
});