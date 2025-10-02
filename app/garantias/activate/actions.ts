"use server";

import { prisma } from "@/lib/prisma";
import { activateWarrantySchema } from "@/schemas/warranty";

export async function activateWarranty(data: unknown): Promise<{
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
  vehicle?: any;
  Warranty?: any;
}> {
  try {
    console.log("Datos recibidos:", data);

    // ✅ Validar con safeParse
    const parsed = activateWarrantySchema.safeParse(data);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const field = iss.path[0] as string;
        errors[field] = iss.message;
      });
      console.log("Errores de validación:", errors);
      return { success: false, errors };
    }

    // Validación: VIN CON GARANTIA ACTIVA
    const existingWarranty = await prisma.vehicle.findUnique({
      where: { vin: parsed.data.vin },
    });

    if (existingVehicle) {
      return {
        success: false,
        errors: { vin: "Ese VIN ya tiene una garantia Activada." },
      };
    }

    // Crear Warranty en la tabla warranty y insertar bien los datos
    const newWarranty = await prisma.warranty.create({
      data: parsed.data,
    });

    //VER QUE ONDA PORQUE HAY CAMPOS EN LOS QUE NADA Q VER LO Q MANDO A LO QUE CONTIENE WARRANTY
    return { success: true, warranty: newWarranty };
  } catch (error) {
    console.error("Error completo:", error);

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "Ocurrió un error desconocido en el servidor.",
    };
  }
}
