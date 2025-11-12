// actions/saveClaimWithPhotos.ts
"use server";

import { prisma } from "@/lib/prisma";
import { triggerNewOrderNotification } from "@/lib/email";

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
  // URLs de las fotos (ya subidas a S3)
  photoUrls: {
    licensePlate: string;
    vinPlate: string;
    odometer: string;
    customerSignature?: string; // Opcional
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
        console.log("🆕 Creando nuevo reclamo");

        // Determinar número de orden
        let orderNumber = 99999;
        if (!isDraft) {
          const lastOrder = await tx.order.findFirst({
            where: { draft: false },
            orderBy: { orderNumber: "desc" },
          });
          orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100000;
        }

        // Crear nuevo reclamo
        savedOrder = await tx.order.create({
          data: {
            orderNumber,
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

    // Enviar notificación si no es borrador
    if (order && !isDraft) {
      triggerNewOrderNotification(
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