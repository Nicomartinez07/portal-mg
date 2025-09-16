"use server";

import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/schemas/vehicle";
import { z } from "zod";

export async function createVehicle(data: unknown): Promise<{ 
  success: boolean; 
  errors?: Record<string, string>; 
  message?: string;
  vehicle?: any;
}> {
  try {
    console.log("Datos recibidos:", data);
    
    // 1. Validar los datos con Zod
    const parsed = vehicleSchema.parse(data);
    console.log("Datos validados:", parsed);

    // 2. Validación de lógica de negocio
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vin: parsed.vin },
    });

    if (existingVehicle) {
      console.log("VIN duplicado:", parsed.vin);
      return { 
        success: false, 
        errors: { vin: "Ya existe un vehículo con este VIN." } 
      };
    }

    // 3. Crear el vehículo
    const newVehicle = await prisma.vehicle.create({
      data: parsed,
    });
    
    console.log("Vehículo creado:", newVehicle);
    return { success: true, vehicle: newVehicle };

  } catch (error) {
    console.error("Error completo:", error);
    
    // Manejo de errores de Zod
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      return { success: false, errors };
    } 
    
    // Manejar otros errores
    else if (error instanceof Error) {
      return { success: false, message: error.message };
    } 
    
    // Error completamente desconocido
    else {
      return { success: false, message: "Ocurrió un error desconocido al procesar la solicitud." };
    }
  }
}