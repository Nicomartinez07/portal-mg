// actions/saveClaimWithPhotos.ts
"use server";

import { prisma } from "@/lib/prisma";
import { triggerNewOrderNotification } from "@/lib/email";
import { getImporterEmailsForNotification } from "@/app/(dashboard)/general/actions";

type TaskData = {
  description: string;
  hoursCount: string;
  parts: {
    part: {
      code: string;
      description: string;
    };
  }[];
};

type ClaimDataWithPhotos = {
  vin: string;
  orderNumber?: string;
  preAuthorizationNumber?: string;
  customerName: string;
  actualMileage: string;
  diagnosis: string;
  additionalObservations?: string;
  warrantyActivation?: string;
  engineNumber?: string;
  model?: string;
  tasks?: TaskData[];
  photoUrls: {
    licensePlate: string;
    vinPlate: string;
    odometer: string;
    customerSignature?: string; 
    additional: string[];
    or: string[];
    reportPdfs: string[];
  };
};

type SaveResult = {
  success: boolean;
  order?: any;
  message?: string;
  errors?: Record<string, string>;
};


type UpdateObservedClaimData = {
  orderNumber?: string;
  customerName: string;
  actualMileage: string;
  diagnosis: string;
  additionalObservations?: string;
  tasks?: TaskData[];
  photoUrls?: {
    licensePlate?: string;
    vinPlate?: string;
    odometer?: string;
    customerSignature?: string;
    additional?: string[];
    or?: string[];
    reportPdfs?: string[];
  };
};

type UpdateResult = {
  success: boolean;
  order?: any;
  message?: string;
  errors?: Record<string, string>;
};


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

export async function saveClaimWithPhotos(
  claimData: ClaimDataWithPhotos,
  companyId: number,
  userId?: number,
  isDraft: boolean = false,
  draftId?: number
): Promise<SaveResult> {
  try {
    console.log("🚀 Iniciando guardado de reclamo con fotos");

    // Validaciones básicas
    if (!claimData.vin?.trim()) {
      return { success: false, errors: { vin: "El VIN es requerido" } };
    }

    // ✏️ NUEVA VALIDACIÓN: El número de orden es obligatorio y manual
    if (!claimData.orderNumber) {
      return { 
        success: false, 
        message: "El número de orden (reclamo) es requerido" 
      };
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { vin: claimData.vin },
    });

    if (!vehicle) {
      return { success: false, message: "Vehículo no encontrado" };
    }

    // Buscar o crear cliente
    const customer = await findOrCreateCustomer(claimData.customerName);

    // Buscar nombre de usuario
    let creatorUsername = "Sistema";
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      if (user) creatorUsername = user.username;
    }

    // Validar repuestos (solo para reclamos completos, no borradores)
    if (!isDraft && claimData.tasks) {
      const missingParts: string[] = [];
      
      for (const task of claimData.tasks) {
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
          message: `❌ Los siguientes repuestos no existen: ${missingParts.join(', ')}`
        };
      }
    }

    // Transacción para guardar reclamo + fotos
    const order = await prisma.$transaction(async (tx) => {
      let savedOrder;

      // Actualizar borrador existente o crear nuevo reclamo
      if (draftId) {
        console.log(`🔄 Actualizando borrador de reclamo ID: ${draftId}`);

        // Eliminar tareas anteriores
        await tx.orderTaskPart.deleteMany({
          where: { orderTask: { orderId: draftId } },
        });
        await tx.orderTask.deleteMany({
          where: { orderId: draftId },
        });

        // Eliminar fotos anteriores
        await tx.orderPhoto.deleteMany({
          where: { orderId: draftId },
        });

        // Actualizar orden
        savedOrder = await tx.order.update({
          where: { id: draftId },
          data: {
            // ✏️ CAMBIO: Se actualiza con el número manual
            orderNumber: Number(claimData.orderNumber),
            draft: isDraft,
            customerId: customer.id,
            vehicleVin: claimData.vin,
            status: isDraft ? "BORRADOR" : "PENDIENTE",
            actualMileage: Number(claimData.actualMileage) || 0,
            diagnosis: claimData.diagnosis || "",
            additionalObservations: claimData.additionalObservations || "",
            preAuthorizationNumber: claimData.preAuthorizationNumber || null,
          },
        });

        // Agregar historial si se convierte a orden
        if (!isDraft) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: draftId,
              status: "PENDIENTE",
              changedAt: new Date(),
            },
          });
        }
      } else {
        console.log("🆕 Creando nuevo reclamo manual");

        // ✏️ CAMBIO: Eliminada lógica de cálculo automático (99999 / lastOrder)
        
        // Crear nuevo reclamo
        savedOrder = await tx.order.create({
          data: {
            // ✏️ CAMBIO: Asignación directa del form
            orderNumber: Number(claimData.orderNumber),
            type: "RECLAMO",
            creationDate: new Date(),
            draft: isDraft,
            customerId: customer.id,
            vehicleVin: claimData.vin,
            companyId,
            userId,
            status: isDraft ? "BORRADOR" : "PENDIENTE",
            internalStatus: null,
            actualMileage: Number(claimData.actualMileage) || 0,
            diagnosis: claimData.diagnosis || "",
            additionalObservations: claimData.additionalObservations || "",
            preAuthorizationNumber: claimData.preAuthorizationNumber || null,
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
      }

      // Crear tareas
      const tasksToCreate = claimData.tasks?.filter(
        (task) =>
          task.description?.trim() ||
          task.hoursCount?.trim() ||
          task.parts[0]?.part?.code?.trim() ||
          task.parts[0]?.part?.description?.trim()
      ) || [];

      for (const task of tasksToCreate) {
        const createdTask = await tx.orderTask.create({
          data: {
            description: task.description || "",
            hoursCount: Number(task.hoursCount) || 0,
            orderId: savedOrder.id,
          },
        });

        for (const partItem of task.parts || []) {
          if (partItem.part.code?.trim()) {
            const part = await prisma.part.findUnique({
              where: { code: partItem.part.code }
            });

            if (part) {
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
        }
      }

      // Guardar fotos en OrderPhoto
      console.log("📸 Guardando fotos en base de datos");

      const photosToCreate = [
        { type: "license_plate", url: claimData.photoUrls.licensePlate },
        { type: "vin_plate", url: claimData.photoUrls.vinPlate },
        { type: "odometer", url: claimData.photoUrls.odometer },
      ];

      // Agregar firma del cliente si existe
      if (claimData.photoUrls.customerSignature) {
        photosToCreate.push({
          type: "customer_signature",
          url: claimData.photoUrls.customerSignature,
        });
      }

      // Agregar fotos adicionales
      photosToCreate.push(
        ...claimData.photoUrls.additional.map((url, i) => ({
          type: `additional_${i + 1}`,
          url,
        })),
        ...claimData.photoUrls.or.map((url, i) => ({
          type: `or_${i + 1}`,
          url,
        })),
        ...claimData.photoUrls.reportPdfs.map((url, i) => ({
          type: `report_pdf_${i + 1}`,
          url,
        }))
      );

      await tx.orderPhoto.createMany({
        data: photosToCreate.map((photo) => ({
          orderId: savedOrder.id,
          type: photo.type,
          url: photo.url,
        })),
      });

      console.log(`✅ ${photosToCreate.length} fotos guardadas`);

      // Retornar orden completa
      return tx.order.findUnique({
        where: { id: savedOrder.id },
        include: {
          tasks: { include: { parts: { include: { part: true } } } },
          customer: true,
          vehicle: true,
          photos: true,
        },
      });
    });
    const toEmails = await getImporterEmailsForNotification();
    // Enviar notificación si no es borrador
    if (order && !isDraft) {
      triggerNewOrderNotification(
        toEmails ?? [],
        order.orderNumber,
        order.vehicle.vin,
        creatorUsername,
        "RECLAMO"
      );
    }

    // Mensaje según operación
    let message = "";
    if (draftId) {
      message = isDraft
        ? "✅ Borrador de reclamo actualizado correctamente"
        : "✅ Borrador convertido a reclamo exitosamente";
    } else {
      message = isDraft
        ? "✅ Borrador de reclamo guardado correctamente"
        : "✅ Reclamo creado exitosamente";
    }

    return {
      success: true,
      order,
      message,
    };
  } catch (error) {
    console.error("❌ Error en saveClaimWithPhotos:", error);
    return {
      success: false,
      message: "❌ Error interno del servidor",
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
    
    if (currentStatus !== "AUTORIZADO") {
      const statusText = currentStatus?.toLowerCase() || "sin estado definido";
      
      return {
        success: false,
        message: `❌ Pre-autorización ${statusText} - debe estar AUTORIZADO`
      };
    }

    return {
      success: true,
      data: {
        orderNumber: preAuthorization.orderNumber,
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

export async function updateObservedClaim(
  orderId: number,
  claimData: UpdateObservedClaimData,
  userId: number
): Promise<UpdateResult> {
  try {
    console.log("🔄 Actualizando reclamo observado ID:", orderId);

    // 1. Validar que la orden existe y está OBSERVADA
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { company: true },
    });

    if (!existingOrder) {
      return { success: false, message: "❌ Reclamo no encontrado" };
    }

    if (existingOrder.status !== "OBSERVADO") {
      return { 
        success: false, 
        message: "❌ Solo se pueden editar reclamos en estado OBSERVADO" 
      };
    }

    // 2. Validar que el usuario es el creador
    if (existingOrder.userId !== userId) {
      return { 
        success: false, 
        message: "❌ No tienes permiso para editar este reclamo" 
      };
    }

    // 3. Buscar o crear cliente
    const customer = await findOrCreateCustomer(claimData.customerName);

    // 4. Validar repuestos si hay tareas
    if (claimData.tasks) {
      const missingParts: string[] = [];
      
      for (const task of claimData.tasks) {
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
          message: `❌ Los siguientes repuestos no existen: ${missingParts.join(', ')}`
        };
      }
    }

    // 5. Transacción para actualizar reclamo
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Eliminar tareas anteriores
      await tx.orderTaskPart.deleteMany({
        where: { orderTask: { orderId } },
      });
      await tx.orderTask.deleteMany({
        where: { orderId },
      });

      // Si hay nuevas fotos, eliminar las anteriores
      if (claimData.photoUrls) {
        await tx.orderPhoto.deleteMany({
          where: { orderId },
        });
      }

      // Actualizar la orden
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          orderNumber: claimData.orderNumber ? Number(claimData.orderNumber) : existingOrder.orderNumber,
          customerId: customer.id,
          status: "PENDIENTE", // ✅ Vuelve a PENDIENTE
          internalStatusObservation: null, // ✅ Limpia la observación
          actualMileage: Number(claimData.actualMileage) || 0,
          diagnosis: claimData.diagnosis || "",
          additionalObservations: claimData.additionalObservations || "",
        },
      });

      // Crear nuevas tareas
      const tasksToCreate = claimData.tasks?.filter(
        (task) =>
          task.description?.trim() ||
          task.hoursCount?.trim() ||
          task.parts[0]?.part?.code?.trim() ||
          task.parts[0]?.part?.description?.trim()
      ) || [];

      for (const task of tasksToCreate) {
        const createdTask = await tx.orderTask.create({
          data: {
            description: task.description || "",
            hoursCount: Number(task.hoursCount) || 0,
            orderId: updated.id,
          },
        });

        for (const partItem of task.parts || []) {
          if (partItem.part.code?.trim()) {
            const part = await prisma.part.findUnique({
              where: { code: partItem.part.code }
            });

            if (part) {
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
        }
      }

      // Guardar nuevas fotos si existen
      if (claimData.photoUrls) {
        const photosToCreate = [];

        if (claimData.photoUrls.licensePlate) {
          photosToCreate.push({ type: "license_plate", url: claimData.photoUrls.licensePlate });
        }
        if (claimData.photoUrls.vinPlate) {
          photosToCreate.push({ type: "vin_plate", url: claimData.photoUrls.vinPlate });
        }
        if (claimData.photoUrls.odometer) {
          photosToCreate.push({ type: "odometer", url: claimData.photoUrls.odometer });
        }
        if (claimData.photoUrls.customerSignature) {
          photosToCreate.push({ type: "customer_signature", url: claimData.photoUrls.customerSignature });
        }

        claimData.photoUrls.additional?.forEach((url, i) => {
          photosToCreate.push({ type: `additional_${i + 1}`, url });
        });

        claimData.photoUrls.or?.forEach((url, i) => {
          photosToCreate.push({ type: `or_${i + 1}`, url });
        });

        claimData.photoUrls.reportPdfs?.forEach((url, i) => {
          photosToCreate.push({ type: `report_pdf_${i + 1}`, url });
        });

        if (photosToCreate.length > 0) {
          await tx.orderPhoto.createMany({
            data: photosToCreate.map((photo) => ({
              orderId: updated.id,
              type: photo.type,
              url: photo.url,
            })),
          });
        }
      }

      // Agregar al historial el cambio a PENDIENTE
      await tx.orderStatusHistory.create({
        data: {
          orderId: updated.id,
          status: "PENDIENTE",
          changedAt: new Date(),
          observation: "Reclamo modificado y reenviado",
        },
      });

      // Retornar orden completa
      return tx.order.findUnique({
        where: { id: updated.id },
        include: {
          tasks: { include: { parts: { include: { part: true } } } },
          customer: true,
          vehicle: true,
          photos: true,
          statusHistory: true,
        },
      });
    });

    console.log("✅ Reclamo actualizado y reenviado correctamente");

    return {
      success: true,
      order: updatedOrder,
      message: "✅ Reclamo actualizado y reenviado correctamente",
    };
  } catch (error) {
    console.error("❌ Error en updateObservedClaim:", error);
    return {
      success: false,
      message: "❌ Error interno del servidor",
    };
  }
}