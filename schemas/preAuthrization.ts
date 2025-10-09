import { z } from "zod";

// Define el esquema de Zod para la pre-autorización
export const preAuthorizationSchema = z.object({
    vin: z.string().min(1, "El VIN es obligatorio"),
    orderNumber: z.string().min(1, "La orden interna es obligatoria"),
    customerName: z.string().min(1, "El nombre del cliente es obligatorio"),
    diagnosis: z.string().min(1, "El diagnóstico es obligatorio"),

    licensePlate: z.string().min(1, "La patente es obligatoria."),
});

// Inferir el tipo de TypeScript a partir del esquema de Zod
export type PreAuthorizationInput = z.infer<typeof preAuthorizationSchema>;