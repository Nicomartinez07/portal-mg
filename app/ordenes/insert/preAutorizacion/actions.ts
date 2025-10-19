"use server";

import { prisma } from "@/lib/prisma";
import { CreateOrderData, CreateOrderResult } from "@/app/types";
import { triggerNewOrderNotification } from "@/lib/email";

async function findOrCreateCustomer(customerName: string) {
  const [firstName, ...lastParts] = customerName.trim().split(" ");
  const lastName = lastParts.join(" ") || "Desconocido";

  let customer = await prisma.customer.findFirst({
    where: {
      firstName: { equals: firstName },
      lastName: { equals: lastName },
    },
  });

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
  let part = await prisma.part.findUnique({ where: { code: partData.code } });
  
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
  isDraft: boolean = false,
  draftId?: number  // 👈 Nuevo parámetro para identificar borrador existente
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

    // Buscar Creador de orden
    let creatorUsername = "Sistema"; // Default
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
      });
      if (user) creatorUsername = user.username;
    }

    // 🔒 Transacción para mantener consistencia
    const order = await prisma.$transaction(async (tx) => {
      
      // 👇 SI EXISTE DRAFT ID, ACTUALIZAR EL BORRADOR EXISTENTE
      if (draftId) {
        console.log(`🔄 Actualizando borrador existente ID: ${draftId}, isDraft: ${isDraft}`);
        
        // 1. Primero eliminar las tareas y partes existentes
        await tx.orderTaskPart.deleteMany({
          where: {
            orderTask: {
              orderId: draftId
            }
          }
        });
        
        await tx.orderTask.deleteMany({
          where: {
            orderId: draftId
          }
        });

        // 2. Actualizar la orden existente
        const updatedOrder = await tx.order.update({
          where: { id: draftId },
          data: {
            draft: isDraft,
            customerId: customer.id,
            vehicleVin: orderData.vin,
            status: isDraft ? "BORRADOR" : "PENDIENTE",
            actualMileage: Number(orderData.actualMileage) || 0,
            diagnosis: orderData.diagnosis || "",
            additionalObservations: orderData.additionalObservations || "",
          },
        });

        // 3. Si se está convirtiendo de borrador a orden, agregar historial
        if (!isDraft) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: draftId,
              status: "PENDIENTE",
              changedAt: new Date(),
            },
          });
        }

        // 4. Crear las nuevas tareas y partes
        for (const task of orderData.tasks || []) {
          const createdTask = await tx.orderTask.create({
            data: {
              description: task.description || "",
              hoursCount: Number(task.hoursCount) || 0,
              orderId: draftId,
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

        // Devolver la orden actualizada
        return tx.order.findUnique({
          where: { id: draftId },
          include: {
            tasks: { include: { parts: { include: { part: true } } } },
            customer: true,
            vehicle: true,
          },
        });

      } else {
        // 👇 SI NO EXISTE DRAFT ID, CREAR NUEVA ORDEN (CÓDIGO ORIGINAL)
        console.log("🆕 Creando nueva orden/borrador");

        // Determinar número de orden solo para órdenes finales
        let orderNumber = 99999;
        if (!isDraft) {
          const lastOrder = await tx.order.findFirst({
            where: { draft: false },
            orderBy: { orderNumber: "desc" },
          });
          orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100000;
        }

        // Crear la nueva orden
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
      }
    });

    if (order && !isDraft) {
      triggerNewOrderNotification(
        order.orderNumber, 
        order.vehicle.vin,
        creatorUsername,   // El nombre que buscamos arriba
        "PRE_AUTORIZACION" // El tipo
      );
    }

    // Mensajes diferentes según la operación
    let message = "";
    if (draftId) {
      message = isDraft 
        ? "✅ Borrador actualizado correctamente" 
        : "✅ Borrador convertido a orden exitosamente";
    } else {
      message = isDraft
        ? "✅ Borrador guardado correctamente"
        : "✅ Orden creada exitosamente";
    }

    return {
      success: true,
      order,
      message,
    };

  } catch (error) {
    console.error("Error en savePreAuthorization:", error);
    return {
      success: false,
      message: "❌ Error interno del servidor",
    };
  }
}