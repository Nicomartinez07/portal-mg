// schemas/serviceSchema.ts
import { z } from "zod";

// Schema para validar archivos en el cliente
const fileSchema = z.instanceof(File, { message: "Debe ser un archivo válido" });

// ========== SCHEMA PARA SERVICIO COMPLETO (NO BORRADOR) ==========
export const serviceSchema = z.object({
  // Campos básicos
  vin: z.string().min(1, "El VIN es obligatorio"),
  orderNumber: z.string().optional(),
  service: z.string().min(1, "El servicio es obligatorio"),
  actualMileage: z.string().min(1, "El kilometraje es obligatorio"),
  additionalObservations: z.string().optional(),
  
  // Campos de solo lectura (opcionales)
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  creationDate: z.string().optional(),
  
  // Fotos obligatorias (2)
  vinPlatePhoto: fileSchema,
  orPhotos: z.array(fileSchema).min(1, "Debe subir al menos 1 foto OR"),
});

// ========== SCHEMA PARA BORRADOR (SIN FOTOS OBLIGATORIAS) ==========
export const draftServiceSchema = z.object({
  // Campos mínimos obligatorios para borrador
  vin: z.string().min(1, "El VIN es obligatorio"),
  
  // Campos opcionales
  orderNumber: z.string().optional(),
  service: z.string().optional(),
  actualMileage: z.string().optional(),
  additionalObservations: z.string().optional(),
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  creationDate: z.string().optional(),
  
  // TODAS las fotos son opcionales en borradores
  vinPlatePhoto: fileSchema.optional(),
  orPhotos: z.array(fileSchema).optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
export type DraftServiceFormData = z.infer<typeof draftServiceSchema>;

// Schema simplificado para validación inicial (sin fotos)
export const serviceSchemaWithoutPhotos = serviceSchema.omit({
  vinPlatePhoto: true,
  orPhotos: true,
});