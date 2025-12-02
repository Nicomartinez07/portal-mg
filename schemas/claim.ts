// lib/schemas/claimSchema.ts
import { z } from "zod";

// Schema para validar archivos en el cliente
const fileSchema = z.instanceof(File, { message: "Debe ser un archivo válido" });

// Schema para una tarea en BORRADOR (todo opcional)
const taskDraftSchema = z.object({
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

// Schema para una tarea en RECLAMO FINAL (campos obligatorios)
const taskFinalSchema = z.object({
  description: z.string().min(1, "Campo requerido."),
  hoursCount: z.string().min(1, "Campo requerido."),
  parts: z.array(
    z.object({
      part: z.object({
        code: z.string().min(1, "Campo requerido."),
        description: z.string().optional(),
      }),
    })
  ).min(1, "Campo requerido."),
});

// ==================== SCHEMA PARA BORRADORES ====================
// Más permisivo: solo VIN obligatorio
export const claimDraftSchema = z.object({
  // Campo obligatorio
  vin: z.string().min(1, "Campo requerido."),
  
  // Campos opcionales
  orderNumber: z.string().optional(),
  preAuthorizationNumber: z.string().optional(),
  customerName: z.string().optional(),
  actualMileage: z.string().optional(),
  diagnosis: z.string().optional(),
  additionalObservations: z.string().optional(),
  
  // Campos de solo lectura
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  creationDate: z.string().optional(),
  
  // Tareas (opcional en borradores)
  tasks: z.array(taskDraftSchema).optional(),
  
  // Fotos OPCIONALES en borradores
  licensePlatePhoto: z.instanceof(File).nullable().optional(),
  vinPlatePhoto: z.instanceof(File).nullable().optional(),
  odometerPhoto: z.instanceof(File).nullable().optional(),
  customerSignaturePhoto: z.instanceof(File).nullable().optional(),
  
  // Arrays opcionales
  additionalPhotos: z.array(fileSchema).optional(),
  orPhotos: z.array(fileSchema).optional(),
  reportPdfs: z.array(fileSchema).max(2, "Máximo 2 PDFs permitidos").optional(),
});

// ==================== SCHEMA PARA RECLAMOS FINALES ====================
// Estricto: requiere todos los campos obligatorios, 3 fotos y al menos 1 tarea
export const claimFinalSchema = z.object({
  // Campos OBLIGATORIOS
  vin: z.string().min(1, "Campo requerido."),
  orderNumber: z.string().min(1, "Campo requerido."),
  preAuthorizationNumber: z.string().min(1, "Campo requerido."),
  customerName: z.string().min(1, "Campo requerido."),
  actualMileage: z.string().min(1, "Campo requerido."),
  diagnosis: z.string().min(1, "Campo requerido."),
  additionalObservations: z.string().optional(),
  
  // Campos de solo lectura
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  creationDate: z.string().optional(),
  
  // Tareas (al menos una tarea válida obligatoria)
  tasks: z.array(taskFinalSchema).min(1, "Campo requerido."),
  
  // Fotos OBLIGATORIAS (3)
  licensePlatePhoto: z.instanceof(File, { 
    message: "Campo requerido." 
  }),
  vinPlatePhoto: z.instanceof(File, { 
    message: "Campo requerido." 
  }),
  odometerPhoto: z.instanceof(File, { 
    message: "Campo requerido." 
  }),
  
  // Firma del cliente (opcional)
  customerSignaturePhoto: z.instanceof(File).nullable().optional(),
  
  // Arrays opcionales
  additionalPhotos: z.array(fileSchema).optional(),
  orPhotos: z.array(fileSchema).optional(),
  reportPdfs: z.array(fileSchema).max(2, "Máximo 2 PDFs permitidos").optional(),
});

// Tipos exportados
export type ClaimDraftData = z.infer<typeof claimDraftSchema>;
export type ClaimFinalData = z.infer<typeof claimFinalSchema>;