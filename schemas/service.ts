// src/app/schemas/serviceSchemas.ts
import { z } from 'zod';

// Opciones de servicio por kilometraje
export const SERVICE_TYPES = [
  { value: "", label: "" },
  { value: "12000", label: "12,000 km" },
  { value: "24000", label: "24,000 km" },
  { value: "36000", label: "36,000 km" },
  { value: "48000", label: "48,000 km" },
  { value: "60000", label: "60,000 km" },
  { value: "72000", label: "72,000 km" },
  { value: "84000", label: "84,000 km" },
  { value: "96000", label: "96,000 km" },
  { value: "108000", label: "108,000 km" },
  { value: "120000", label: "120,000 km" },
  { value: "132000", label: "132,000 km" },
  { value: "144000", label: "144,000 km" }
] as const;

// Schema para servicios completos
export const serviceSchema = z.object({
  orderNumber: z.string().min(1, "La OR interna es requerida"),
  vin: z.string().min(1, "El VIN es requerido"),
  service: z.string().min(1, "El tipo de servicio es requerido"), 
  actualMileage: z.string()
    .min(1, "El kilometraje real es requerido")
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val >= 0, {
      message: "El kilometraje debe ser un número mayor o igual a 0"
    }),
  serviceMileage: z.string().optional(),
  additionalObservations: z.string().optional(), 
  photos: z.object({
    vinPlate: z.string().optional(),
    orPhoto: z.string().optional(),
  }).optional(),
  creationDate: z.string().optional(),
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
});

// Schema para borradores (solo VIN requerido)
export const draftServiceSchema = z.object({
  orderNumber: z.string().optional(),
  vin: z.string().min(1, "El VIN es requerido para el borrador"),
  service: z.string().optional(), 
  actualMileage: z.string()
    .optional()
    .transform(val => val ? parseFloat(val) : 0),
  serviceMileage: z.string().optional(),
  additionalObservations: z.string().optional(), 
  photos: z.object({
    vinPlate: z.string().optional(),
    orPhoto: z.string().optional(),
  }).optional(),
  creationDate: z.string().optional(),
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;
export type DraftServiceSchema = z.infer<typeof draftServiceSchema>;