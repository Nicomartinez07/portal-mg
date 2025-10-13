// src/app/schemas/orderSchemas.ts
import { z } from 'zod';

export const PartSchema = z.object({
  part: z.object({
    code: z.string().min(1, "El código del repuesto es requerido"),
    description: z.string().optional(),
  }),
});

export const TaskSchema = z.object({
  description: z.string().min(1, "La descripción de la tarea es requerida"),
  hoursCount: z.string().min(1, "Las horas son requeridas").transform(val => parseFloat(val)),
  parts: z.array(PartSchema).min(1, "Debe haber al menos un repuesto"),
});

// Schema para borradores - campos más flexibles
export const DraftTaskSchema = z.object({
  description: z.string().optional(),
  hoursCount: z.string().optional().transform(val => val ? parseFloat(val) : 0),
  parts: z.array(z.object({
    part: z.object({
      code: z.string().optional(),
      description: z.string().optional(),
    })
  })).optional().default([]),
});

// Schema para reclamos completos - validación estricta
export const claimSchema = z.object({
  actualMileage: z.string()
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val >= 0, {
      message: "El kilometraje debe ser un número mayor o igual a 0"
    }),
  creationDate: z.string(),
  orderNumber: z.string().min(1, "El número de orden es requerido"),
  preAuthorizationNumber: z.string().optional(),
  customerName: z.string().min(1, "El nombre del cliente es requerido"),
  vin: z.string().min(1, "El VIN es requerido"),
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  diagnosis: z.string().min(1, "El diagnóstico es requerido"),
  additionalObservations: z.string().optional(),
  tasks: z.array(TaskSchema).min(1, "Debe haber al menos una tarea"),
});

// Schema para borradores - solo campos mínimos requeridos
export const draftClaimSchema = z.object({
  actualMileage: z.string()
    .optional()
    .transform(val => val ? parseFloat(val) : 0),
  creationDate: z.string().optional(),
  orderNumber: z.string().optional(),
  preAuthorizationNumber: z.string().optional(),
  customerName: z.string().min(1, "El nombre del cliente es requerido"),
  vin: z.string().min(1, "El VIN es requerido"),
  warrantyActivation: z.string().optional(),
  engineNumber: z.string().optional(),
  model: z.string().optional(),
  diagnosis: z.string().optional(),
  additionalObservations: z.string().optional(),
  tasks: z.array(DraftTaskSchema).optional().default([]),
});

export type ClaimSchema = z.infer<typeof claimSchema>;
export type DraftClaimSchema = z.infer<typeof draftClaimSchema>;