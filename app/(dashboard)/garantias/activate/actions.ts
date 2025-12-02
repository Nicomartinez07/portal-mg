"use server";

import { prisma } from "@/lib/prisma";
import { activateWarrantySchema } from "@/schemas/warranty";

export async function activateWarranty(data: unknown): Promise<{
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
  warranty?: any;
}> {
  try {
    // ✅ Validar con Zod
    const parsed = activateWarrantySchema.safeParse(data);
    console.log("Parsed data:", parsed);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const field = iss.path[0] as string;
        errors[field] = iss.message;
      });
      return { success: false, errors };
    }

    const {
      date,
      vin,
      companyId,
      user,
      clientName,
      clientSurname,
      clientEmail,
      clientPhone,
      clientDirection,
      clientProvince,
      clientLocality,
      licensePlate,
    } = parsed.data;

    // ✅ 1. Verificar si ya existe garantía para ese VIN
    const existingWarranty = await prisma.warranty.findUnique({
      where: { vehicleVin: vin },
    });

    if (existingWarranty) {
      return {
        success: false,
        errors: { vin: "Ese VIN ya tiene una garantía activada." },
      };
    }

    // ✅ 2. Verificar que el vehículo exista
    const vehicle = await prisma.vehicle.findUnique({ where: { vin } });
    if (!vehicle) {
      return {
        success: false,
        errors: { vin: "No se encontro un vehiculo con ese VIN." },
      };
    }

    // Buscar o crear cliente
    let customer = await prisma.customer.findFirst({
      where: { email: clientEmail },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName: clientName,
          lastName: clientSurname,
          email: clientEmail,
          phone: clientPhone,
          address: clientDirection,
          state: clientProvince,
          city: clientLocality,
        },
      });
    }

    // ✅ 3. Buscar usuario por nombre
    const userRecord = await prisma.user.findFirst({
      where: { username: user },
    });

    if (!userRecord) {
      return {
        success: false,
        errors: { user: "El usuario especificado no existe." },
      };
    }

    await prisma.vehicle.update({
      where: { vin: vin },
      data: {
        licensePlate: licensePlate, // Guardamos la patente en el vehículo
      },
    });

    // ✅ 5. Crear la Warranty vinculada a Vehicle, Customer y Company
    const newWarranty = await prisma.warranty.create({
    data: {
      activationDate: new Date(date),
      vehicleVin: vin,
      companyId: companyId,
      customerId: customer.id,
      userId: userRecord.id,
    },
    include: {
      vehicle: true,
      company: true,
      customer: true,
      user: true,
    },
  });

  console.log("Nueva garantía creada:", newWarranty);
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

