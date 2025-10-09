"use server";

import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/schemas/vehicle";

export async function getVehicleByVin(vin: string) {
  if (!vin) return { success: false, message: "VIN vacío" };

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { vin },
      include: {
        warranty: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!vehicle) {
      return { success: false, message: "No se encontró vehículo con ese VIN" };
    }

    return { success: true, vehicle };
  } catch (error) {
    console.error("Error buscando vehículo:", error);
    return { success: false, message: "Error al buscar vehículo" };
  }
}

export async function createVehicle(data: unknown): Promise<{
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
  vehicle?: any;
}> {
  try {
    console.log("Datos recibidos:", data);

    // ✅ Validar con safeParse
    const parsed = vehicleSchema.safeParse(data);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const field = iss.path[0] as string;
        errors[field] = iss.message;
      });
      console.log("Errores de validación:", errors);
      return { success: false, errors };
    }

    // Validación de negocio: VIN duplicado
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vin: parsed.data.vin },
    });

    if (existingVehicle) {
      return {
        success: false,
        errors: { vin: "Ya existe un vehículo con este VIN." },
      };
    }

    // Crear en DB
    const newVehicle = await prisma.vehicle.create({
      data: parsed.data,
    });

    return { success: true, vehicle: newVehicle };
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
