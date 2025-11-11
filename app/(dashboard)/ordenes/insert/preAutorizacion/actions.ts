// app/(dashboard)/ordenes/insert/preAutorizacion/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { uploadToS3, uploadMultipleToS3 } from "@/app/(dashboard)/actions/uploadToS3";
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

type OrderDataWithPhotos = {
  vin: string;
  orderNumber?: string;
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

async function findOrCreatePart(partData: { 
  code: string; 
  description: string; 
  companyId: number;
}) {
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

export async function savePreAuthorizationWithPhotos(
  orderData: OrderDataWithPhotos,
  companyId: number,
  userId?: number,
  isDraft: boolean = false,
  draftId?: number
): Promise<SaveResult> {
  try {
    console.log("🚀 Iniciando guardado de pre-autorización con fotos");

    // Validaciones básicas
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

    // Buscar nombre de usuario
    let creatorUsername = "Sistema";
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      if (user) creatorUsername = user.username;
    }

    // Transacción para guardar orden + fotos
    const order = await prisma.$transaction(async (tx) => {
      let savedOrder;

      // Actualizar borrador existente o crear nueva orden
      if (draftId) {
        console.log(`🔄 Actualizando borrador ID: ${draftId}`);

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
            vehicleVin: orderData.vin,
            status: isDraft ? "BORRADOR" : "PENDIENTE",
            actualMileage: Number(orderData.actualMileage) || 0,
            diagnosis: orderData.diagnosis || "",
            additionalObservations: orderData.additionalObservations || "",
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
        console.log("🆕 Creando nueva orden");

        // Determinar número de orden
        let orderNumber = 99999;
        if (!isDraft) {
          const lastOrder = await tx.order.findFirst({
            where: { draft: false },
            orderBy: { orderNumber: "desc" },
          });
          orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100000;
        }

        // Crear nueva orden
        savedOrder = await tx.order.create({
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
      }

      // Crear tareas
      const tasksToCreate = orderData.tasks?.filter(
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
      }

      // Guardar fotos en OrderPhoto
      console.log("📸 Guardando fotos en base de datos");

      const photosToCreate = [
        { type: "license_plate", url: orderData.photoUrls.licensePlate },
        { type: "vin_plate", url: orderData.photoUrls.vinPlate },
        { type: "odometer", url: orderData.photoUrls.odometer },
        ...orderData.photoUrls.additional.map((url, i) => ({
          type: `additional_${i + 1}`,
          url,
        })),
        ...orderData.photoUrls.or.map((url, i) => ({
          type: `or_${i + 1}`,
          url,
        })),
        ...orderData.photoUrls.reportPdfs.map((url, i) => ({
          type: `report_pdf_${i + 1}`,
          url,
        })),
      ];

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
        "PRE_AUTORIZACION"
      );
    }

    // Mensaje según operación
    let message = "";
    if (draftId) {
      message = isDraft
        ? "✅ Borrador actualizado correctamente"
        : "✅ Borrador convertido a orden exitosamente";
    } else {
      message = isDraft
        ? "✅ Borrador guardado correctamente"
        : "✅ Pre-autorización creada exitosamente";
    }

    return {
      success: true,
      order,
      message,
    };
  } catch (error) {
    console.error("❌ Error en savePreAuthorizationWithPhotos:", error);
    return {
      success: false,
      message: "❌ Error interno del servidor",
    };
  }
}