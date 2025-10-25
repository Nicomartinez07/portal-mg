// src/app/ordenes/insert/reclamo/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { CreateOrderResult } from "@/app/types";
import { claimSchema, draftClaimSchema } from '@/schemas/claim';
import { z } from 'zod';
import { triggerNewOrderNotification } from "@/lib/email";

// Reutilizamos las mismas funciones auxiliares
async function findOrCreateCustomer(customerName: string) {
  const [firstName, ...lastParts] = customerName.trim().split(" ");
  const lastName = lastParts.join(" ") || "";

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

// En tu actions.ts - modificar la función saveClaim
export async function saveClaim(
  orderData: any,
  companyId: number,
  userId?: number,
  isDraft: boolean = false,
  draftId?: number
): Promise<CreateOrderResult> {
  try {
    // 1. VALIDAR CON ZOD - usar schema diferente para borradores
    const validatedData = isDraft 
      ? draftClaimSchema.parse(orderData)  // Schema flexible para borradores
      : claimSchema.parse(orderData);      // Schema estricto para reclamos

    // Buscar Creador de orden
    let creatorUsername = "Sistema"; // Default
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
      });
      if (user) creatorUsername = user.username;
    }

    // 2. VALIDAR QUE EL VEHÍCULO EXISTA (solo si hay VIN)
    if (validatedData.vin && validatedData.vin.trim() !== "") {
      const vehicle = await prisma.vehicle.findUnique({
        where: { vin: validatedData.vin },
      });

      if (!vehicle) {
        return { success: false, message: "Vehículo no encontrado" };
      }
    }

    // 3. PARA RECLAMOS COMPLETOS: VALIDAR QUE TODOS LOS REPUESTOS EXISTAN
    // Para borradores, no validamos la existencia de repuestos
    if (!isDraft) {
      const missingParts: string[] = [];
      
      for (const task of validatedData.tasks || []) {
        for (const partItem of task.parts || []) {
          if (partItem.part.code && partItem.part.code.trim()) {
            const existingPart = await prisma.part.findUnique({
              where: { code: partItem.part.code }
            });
            
            if (!existingPart) {
              missingParts.push(partItem.part.code);
            }
          }
        }
      }

      if (missingParts.length > 0) {
        return {
          success: false,
          message: `❌ Los siguientes repuestos no existen en la base de datos: ${missingParts.join(', ')}`
        };
      }
    }

    // 4. BUSCAR O CREAR CLIENTE (solo si hay nombre de cliente)
    let customer = null;
    if (validatedData.customerName && validatedData.customerName.trim() !== "") {
      customer = await findOrCreateCustomer(validatedData.customerName);
    }

    // 🔒 TRANSACCIÓN
    const order = await prisma.$transaction(async (tx) => {
      if (draftId) {
        console.log(`🔄 Actualizando borrador de reclamo ID: ${draftId}, isDraft: ${isDraft}`);
        
        // 1. Eliminar tareas y partes existentes
        await tx.orderTaskPart.deleteMany({
          where: { orderTask: { orderId: draftId } }
        });
        await tx.orderTask.deleteMany({ where: { orderId: draftId } });

        // 2. Actualizar orden existente
        const updateData: any = {
          draft: isDraft,
          status: isDraft ? "BORRADOR" : "PENDIENTE",
          actualMileage: validatedData.actualMileage || 0,
          diagnosis: validatedData.diagnosis || "",
          additionalObservations: validatedData.additionalObservations || "",
          preAuthorizationNumber: validatedData.preAuthorizationNumber || null,
        };

        // Solo conectar customer y vehicle si existen
        if (customer) {
          updateData.customer = { connect: { id: customer.id } };
        }
        if (validatedData.vin && validatedData.vin.trim() !== "") {
          updateData.vehicle = { connect: { vin: validatedData.vin } };
        }

        const updatedOrder = await tx.order.update({
          where: { id: draftId },
          data: updateData,
        });

        // 3. Agregar historial si se convierte a orden
        if (!isDraft) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: draftId,
              status: "PENDIENTE",
              changedAt: new Date(),
            },
          });
        }

        // 4. Crear nuevas tareas y partes (solo si existen)
        for (const task of validatedData.tasks || []) {
          // Para borradores, crear tareas aunque estén incompletas
          if (isDraft || (task.description && task.hoursCount)) {
            const createdTask = await tx.orderTask.create({
              data: {
                description: task.description || "",
                hoursCount: task.hoursCount || 0,
                orderId: draftId,
              },
            });

            for (const partItem of task.parts || []) {
              if (partItem.part.code) {
                // Buscar el repuesto (para borradores no validamos existencia)
                const part = await prisma.part.findUnique({
                  where: { code: partItem.part.code }
                });
                
                // Si el repuesto existe o es borrador, creamos la relación
                if (part || isDraft) {
                  await tx.orderTaskPart.create({
                    data: {
                      orderTaskId: createdTask.id,
                      partId: part?.id || 0, // Para borradores con repuestos no existentes
                      quantity: 1,
                      description: part?.description || partItem.part.description || "",
                    },
                  });
                }
              }
            }
          }
        }

        return tx.order.findUnique({
          where: { id: draftId },
          include: {
            tasks: { include: { parts: { include: { part: true } } } },
            customer: true,
            vehicle: true,
          },
        });

      } else {
        // 👇 CREAR NUEVA ORDEN
        console.log("🆕 Creando nuevo reclamo/borrador");

        // Determinar número de orden (solo para reclamos completos)
        let orderNumber = 99999;
        if (!isDraft) {
          const lastOrder = await tx.order.findFirst({
            where: { draft: false },
            orderBy: { orderNumber: "desc" },
          });
          orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100000;
        }

        // Validaciones mínimas para creación
        if (!customer) {
          throw new Error("Cliente es requerido");
        }
        if (!validatedData.vin || validatedData.vin.trim() === "") {
          throw new Error("VIN es requerido");
        }

        // Crear nueva orden
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            type: "RECLAMO",
            creationDate: new Date(),
            draft: isDraft,
            customer: { connect: { id: customer.id } },   
            vehicle: { connect: { vin: validatedData.vin } },
            company: { connect: { id: companyId } },
            user: userId ? { connect: { id: userId } } : undefined,
            status: isDraft ? "BORRADOR" : "PENDIENTE",
            internalStatus: null,
            actualMileage: validatedData.actualMileage || 0,
            diagnosis: validatedData.diagnosis || "",
            additionalObservations: validatedData.additionalObservations || "",
            preAuthorizationNumber: validatedData.preAuthorizationNumber || null,
            statusHistory: {
              create: [{
                status: isDraft ? "BORRADOR" : null,
                changedAt: new Date(),
              }],
            },
          },
        });

        // Crear tareas y partes (solo si existen)
        for (const task of validatedData.tasks || []) {
          // Para borradores, crear tareas aunque estén incompletas
          if (isDraft || (task.description && task.hoursCount)) {
            const createdTask = await tx.orderTask.create({
              data: {
                description: task.description || "",
                hoursCount: task.hoursCount || 0,
                orderId: newOrder.id,
              },
            });

            for (const partItem of task.parts || []) {
              if (partItem.part.code) {
                // Buscar el repuesto (para borradores no validamos existencia)
                const part = await prisma.part.findUnique({
                  where: { code: partItem.part.code }
                });
                
                // Si el repuesto existe o es borrador, creamos la relación
                if (part || isDraft) {
                  await tx.orderTaskPart.create({
                    data: {
                      orderTaskId: createdTask.id,
                      partId: part?.id || 0, // Para borradores con repuestos no existentes
                      quantity: 1,
                      description: part?.description || partItem.part.description || "",
                    },
                  });
                }
              }
            }
          }
        }

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

    // Disparar evento, Lo hacemos *después* de que la transacción fue exitosa
    // y SÓLO si NO es un borrador.
    if (order && !isDraft) {
      triggerNewOrderNotification(
        order.orderNumber, 
        order.vehicle.vin, 
        creatorUsername,   // El nombre que buscamos arriba
        "RECLAMO"          // El tipo de orden
      );
    }

    // Mensaje de éxito
    let message = draftId
      ? (isDraft 
          ? "✅ Borrador de reclamo actualizado correctamente" 
          : "✅ Borrador convertido a reclamo exitosamente")
      : (isDraft
          ? "✅ Borrador de reclamo guardado correctamente"
          : "✅ Reclamo creado exitosamente");

    return { success: true, order, message };

  } catch (error) {
    // Manejar errores de Zod
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach(err => {
        if (err.path && err.path[0]) {
          const fieldName = err.path.join('.');
          errors[fieldName] = err.message;
        }
      });
      return {
        success: false,
        errors,
        message: "❌ Errores de validación en el formulario"
      };
    }

    console.error("Error en saveClaim:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "❌ Error interno del servidor",
    };
  }
}

export async function getPreAuthorizationDetails(preAuthorizationId: string) {
  try {
    const id = parseInt(preAuthorizationId);
    
    if (isNaN(id)) {
      return {
        success: false,
        message: "❌ El ID de pre-autorización debe ser un número"
      };
    }

    const preAuthorization = await prisma.order.findFirst({
      where: {
        id: id,
        type: "PRE_AUTORIZACION"
      },
      include: {
        customer: true,
        vehicle: true,
        tasks: {
          include: {
            parts: {
              include: {
                part: true
              }
            }
          }
        }
      }
    });

    if (!preAuthorization) {
      return {
        success: false,
        message: "❌ Pre-autorización no encontrada"
      };
    }

    // Validar que tenga customer y vehicle
    if (!preAuthorization.customer || !preAuthorization.vehicle) {
      return {
        success: false,
        message: "❌ Pre-autorización incompleta - falta cliente o vehículo"
      };
    }

    const currentStatus = preAuthorization.status;
    
    if (currentStatus !== "AUTORIZADO" && currentStatus !== "PENDIENTE") {
      const statusText = currentStatus?.toLowerCase() || "sin estado definido";
      
      return {
        success: false,
        message: `❌ Pre-autorización ${statusText} - debe estar PENDIENTE o AUTORIZADO`
      };
    }

    return {
      success: true,
      data: {
        customerName: `${preAuthorization.customer.firstName} ${preAuthorization.customer.lastName}`,
        vin: preAuthorization.vehicle.vin,
        model: preAuthorization.vehicle.model,
        engineNumber: preAuthorization.vehicle.engineNumber,
        tasks: preAuthorization.tasks,
        diagnosis: preAuthorization.diagnosis,
        actualMileage: preAuthorization.actualMileage
      },
      message: "✅ Pre-autorización encontrada y autorizada"
    };

  } catch (error) {
    console.error("Error buscando pre-autorización:", error);
    return {
      success: false,
      message: "❌ Error al buscar pre-autorización"
    };
  }
}