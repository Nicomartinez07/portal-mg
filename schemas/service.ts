// src/app/schemas/serviceSchemas.ts
import { z } from 'zod';
// Schema para servicios completos
export const serviceSchema = z.object({
  orderNumber: z.string().min(1, "La OR interna es requerida"),
  vin: z.string().min(1, "El VIN es requerido"),
  service: z.string().min(1, "El servicio es requerido"), 
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