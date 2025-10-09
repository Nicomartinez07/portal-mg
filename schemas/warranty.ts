import { z } from "zod";

export const activateWarrantySchema = z.object({
  date: z.coerce.date(),

  vin: z
    .string()
    .min(1, "Campo requerido."),

  company: z.string().min(1, "Campo requerido."),

  user: z.string().min(1, "Campo requerido."),

  clientName: z.string().min(1, "Campo requerido."),

  clientSurname: z.string().min(1, "Campo requerido."),

  clientEmail: z.string().min(1, "Campo requerido."),

  clientPhone: z.string().min(1, "Campo requerido."),

  clientDirection: z.string().min(1, "Campo requerido."),

  clientProvince: z.string().min(1, "Campo requerido."),

  clientLocality: z.string().min(1, "Campo requerido."),

  companyId: z.coerce.number().min(1, "La compañía es obligatoria."),

});

export type WarrantyActivationInput = z.infer<typeof activateWarrantySchema>;
