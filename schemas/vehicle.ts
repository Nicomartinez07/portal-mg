import { z } from "zod";

export const vehicleSchema = z.object({
  // Fechas: coerce para convertir strings a Date
  date: z.coerce.date(),

  vin: z
    .string()
    .min(1, "El VIN es obligatorio.")
    .length(17, "El VIN debe tener exactamente 17 caracteres."),

  brand: z.string().min(1, "La marca es obligatoria."),
  model: z.string().min(1, "El modelo es obligatorio."),

  engineNumber: z.string().optional().nullable().default(""),
  type: z.string().optional().nullable().default(""),

  year: z.coerce
    .number()
    .int()
    .min(1900, "El año debe ser mayor a 1900")
    .max(new Date().getFullYear() + 1, "El año no puede ser futuro")
    .nullable()
    .optional(),

  certificateNumber: z.string().optional().nullable().default(""),

  saleDate: z.coerce
    .string()
    .optional()
    .nullable()
    .transform((str) => (str ? new Date(str) : null)),

  importDate: z.coerce
    .string()
    .optional()
    .nullable()
    .transform((str) => (str ? new Date(str) : null)),

  licensePlate: z.string().min(1, "La patente es obligatoria."),
  companyId: z.coerce.number().positive("La compañía es obligatoria."),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
