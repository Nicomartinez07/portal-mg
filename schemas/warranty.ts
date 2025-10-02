import { z } from "zod";

export const activateWarrantySchema = z.object({
  // Fechas: coerce para convertir strings a Date
  date: z.coerce.date(),

  vin: z
    .string()
    .min(1, "Campo requerido.")
    .length(17, "El VIN debe tener exactamente 17 caracteres."),

  clientName: z.string().min(1, "Campo requerido."),

  clientSurname: z.string().min(1, "Campo requerido."),

  clientEmail: z.string().min(1, "Campo requerido."),

  clientPhone: z.string().min(1, "Campo requerido."),

  clientDirection: z.string().min(1, "Campo requerido."),

  clientProvince: z.string().min(1, "Campo requerido."),

  clientLocality: z.string().min(1, "Campo requerido."),
});

export type WarrantyActivationInput = z.infer<typeof activateWarrantySchema>;
