// lib/schemas/serviceSchema.ts
import { z } from "zod";

// Schema para validar archivos en el cliente
const fileSchema = z.instanceof(File, { message: "Debe ser un archivo válido" });

// ==================== SCHEMA PARA BORRADORES ====================
// Más permisivo: solo VIN obligatorio, todo lo demás opcional
export const serviceDraftSchema = z.object({
  // Campo obligatorio
  vin: z.string().min(1, "Campo requerido."),
  
  // Campos opcionales
  orderNumber: z.string().optional(),
  service: z.string().optional(),
  actualMileage: z.string().optional(),
  additionalObservations: z.string().optional(),
  
  // Campos de solo lectura
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  creationDate: z.string().optional(),
  
  // Fotos OPCIONALES en borradores
  vinPlatePhoto: z.instanceof(File).nullable().optional(),
  orPhotos: z.array(fileSchema).optional(),
});

// ==================== SCHEMA PARA ÓRDENES FINALES ====================
// Estricto: requiere todos los campos obligatorios y las fotos
export const serviceFinalSchema = z.object({
  // Campos OBLIGATORIOS
  vin: z.string().min(1, "Campo requerido."),
  orderNumber: z.string().min(1, "Campo requerido."),
  service: z.string().min(1, "Campo requerido."),
  actualMileage: z.string().min(1, "Campo requerido."),
  additionalObservations: z.string().optional(),
  
  // Campos de solo lectura
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  creationDate: z.string().optional(),
  
  // Fotos OBLIGATORIAS en órdenes finales
  vinPlatePhoto: z.instanceof(File, { 
    message: "Campo requerido." 
  }),
  orPhotos: z.array(fileSchema).min(1, "Campo requerido."),
});

// Tipos exportados
export type ServiceDraftData = z.infer<typeof serviceDraftSchema>;
export type ServiceFinalData = z.infer<typeof serviceFinalSchema>;