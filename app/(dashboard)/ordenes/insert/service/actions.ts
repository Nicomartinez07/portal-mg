// app/ordenes/insert/servicio/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { CreateServiceResult } from "@/app/types";
import { serviceSchema, draftServiceSchema } from '@/schemas/service';
import { z } from 'zod';

// Guardar servicio (completo o borrador)
export async function saveService(
  serviceData: any,
  companyId: number,
  userId?: number,
  isDraft: boolean = false,
  draftId?: number
): Promise<CreateServiceResult> {
  try {
    // 1. VALIDAR CON ZOD - schema diferente para borradores
    const validatedData = isDraft 
      ? draftServiceSchema.parse(serviceData)
      : serviceSchema.parse(serviceData);

    // 2. VALIDAR QUE EL VEHÍCULO EXISTA
    const vehicle = await prisma.vehicle.findUnique({
      where: { vin: validatedData.vin },
    });

    if (!vehicle) {
      return { success: false, message: "Vehículo no encontrado" };
    }

    // 🔒 TRANSACCIÓN
    const service = await prisma.$transaction(async (tx) => {
      if (draftId) {
        console.log(`🔄 Actualizando borrador de servicio ID: ${draftId}, isDraft: ${isDraft}`);
        
        // Actualizar orden existente
        const updateData: any = {
          draft: isDraft,
          status: isDraft ? "BORRADOR" : "COMPLETADO",
          actualMileage: validatedData.actualMileage || 0,
          additionalObservations: validatedData.additionalObservations || "",
          service: validatedData.service || null,
          type: "SERVICIO",
        };
        if (validatedData.vin) {
          updateData.vehicle = { connect: { vin: validatedData.vin } };
        }

        const updatedOrder = await tx.order.update({
          where: { id: draftId },
          data: updateData,
        });

        // Agregar historial si se convierte a orden completa
        if (!isDraft) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: draftId,
              status: "PENDIENTE",
              changedAt: new Date(),
            },
          });
        }

        return tx.order.findUnique({
          where: { id: draftId },
          include: {
            customer: true,
            vehicle: true,
          },
        });

      } else {
        // 👇 CREAR NUEVO SERVICIO
        console.log("🆕 Creando nuevo servicio/borrador");

        // Determinar número de orden (solo para servicios completos)
        let orderNumber = 99999;
        if (!isDraft) {
          const lastOrder = await tx.order.findFirst({
            where: { draft: false },
            orderBy: { orderNumber: "desc" },
          });
          orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100000;
        }
        // Crear nueva orden de servicio
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            type: "SERVICIO",
            creationDate: new Date(),
            draft: isDraft,
            vehicle: { connect: { vin: validatedData.vin } },
            company: { connect: { id: companyId } },
            user: userId ? { connect: { id: userId } } : undefined,
            status: isDraft ? "BORRADOR" : "COMPLETADO",
            internalStatus: null,
            actualMileage: validatedData.actualMileage || 0,
            additionalObservations: validatedData.additionalObservations || "",
            statusHistory: isDraft
              ? {
                  create: [{
                    status: "BORRADOR",
                    changedAt: new Date(),
                  }],
                }
              : undefined,
            service: validatedData.service || null,
          },
        });

        return tx.order.findUnique({
          where: { id: newOrder.id },
          include: {
            customer: true,
            vehicle: true,
          },
        });
      }
    });

    // Mensaje de éxito
    let message = draftId
      ? (isDraft 
          ? "✅ Borrador de servicio actualizado correctamente" 
          : "✅ Borrador convertido a servicio exitosamente")
      : (isDraft
          ? "✅ Borrador de servicio guardado correctamente"
          : "✅ Servicio creado exitosamente");

    return { success: true, service, message };

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

    console.error("Error en saveService:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "❌ Error interno del servidor",
    };
  }
}