"use server";

import { prisma } from "@/lib/prisma";
import { CreateOrderData, CreateOrderResult } from "@/app/types";

async function findOrCreateCustomer(customerName: string) {
  // Si el modal manda un string (como "Juan Pérez"), lo separamos
  const [firstName, ...lastParts] = customerName.trim().split(" ");
  const lastName = lastParts.join(" ") || "Desconocido";

  // Buscar cliente existente
  let customer = await prisma.customer.findFirst({
    where: {
      firstName: { equals: firstName },
      lastName: { equals: lastName },
    },
  });
  // Crear si no existe
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: "No proporcionado",
        phone: "No proporcionado",
        address: "No proporcionado",
        state: "No proporcionado",
        city: "No proporcionado",
      },
    });
  }
  return customer;
}

async function findOrCreatePart(partData: { code: string; description: string; companyId: number }) {
  // Buscar parte existente
  let part = await prisma.part.findUnique({ where: { code: partData.code } });
  // Si no existe, crearla
  if (!part) {
    part = await prisma.part.create({
      data: {
        code: partData.code,
        description: partData.description || "Sin descripción",
        companyId: partData.companyId,
        contactId: 1, 
        loadDate: new Date(),
      },
    });
  }
  return part;
}

export async function savePreAuthorization(
  orderData: CreateOrderData,
  companyId: number,
  userId?: number,
  isDraft: boolean = false
): Promise<CreateOrderResult> {
  try {
    // 🧱 Validaciones mínimas
    if (!orderData.vin?.trim()) {
      return { success: false, errors: { vin: "El VIN es requerido" } };
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { vin: orderData.vin },
    });

    if (!vehicle) {
      return { success: false, message: "Vehículo no encontrado" };
    }

    // Buscar o crear cliente
    const customer = await findOrCreateCustomer(orderData.customerName);

    // Determinar número de orden
    let orderNumber = 99999;
    if (!isDraft) {
      const lastOrder = await prisma.order.findFirst({
        orderBy: { orderNumber: "desc" },
      });
      orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100000;
    }

    // 🔒 Transacción para mantener consistencia
    const order = await prisma.$transaction(async (tx) => {
      // Crear la orden
      
      console.log("Datos del usuario:", { userId, companyId });
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          type: "PRE_AUTORIZACION",
          creationDate: new Date(),
          draft: isDraft,
          customerId: customer.id,
          vehicleVin: orderData.vin,
          companyId,
          userId,
          status: isDraft ? "BORRADOR" : "PENDIENTE",
          internalStatus: null,
          actualMileage: Number(orderData.actualMileage) || 0,
          diagnosis: orderData.diagnosis || "",
          additionalObservations: orderData.additionalObservations || "",
          statusHistory: {
            create: [
              {
                status: isDraft ? "BORRADOR" : "PENDIENTE",
                changedAt: new Date(),
              },
            ],
          },
        },
      });

      // Crear las tareas y sus partes asociadas
      for (const task of orderData.tasks || []) {
        const createdTask = await tx.orderTask.create({
          data: {
            description: task.description || "",
            hoursCount: Number(task.hoursCount) || 0,
            orderId: newOrder.id,
          },
        });

        for (const partItem of task.parts || []) {
          const part = await findOrCreatePart({
            code: partItem.part.code,
            description: partItem.part.description,
            companyId,
          });

          await tx.orderTaskPart.create({
            data: {
              orderTaskId: createdTask.id,
              partId: part.id,
              quantity: 1,
              description: part.description,
            },
          });
        }
      }

      // Devolver la orden con relaciones completas
      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          tasks: { include: { parts: { include: { part: true } } } },
          customer: true,
          vehicle: true,
        },
      });
    });

    return {
      success: true,
      order,
      message: isDraft
        ? "✅ Borrador guardado correctamente"
        : "✅ Orden creada exitosamente",
    };
  } catch (error) {
    console.error("Error en savePreAuthorization:", error);
    return {
      success: false,
      message: "❌ Error interno del servidor",
    };
  }
}
