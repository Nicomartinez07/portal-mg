// actions/saveServiceWithPhotos.ts
"use server";

import { prisma } from "@/lib/prisma";

type ServiceDataWithPhotos = {
  vin: string;
  orderNumber?: string;
  service?: string;
  actualMileage: string;
  additionalObservations?: string;
  warrantyActivation?: string;
  engineNumber?: string;
  model?: string;
  // URLs de las fotos (ya subidas a S3)
  photoUrls: {
    vinPlate: string;
    or: string[];
  };
};

type SaveResult = {
  success: boolean;
  service?: any;
  message?: string;
  errors?: Record<string, string>;
};

export async function saveServiceWithPhotos(
  serviceData: ServiceDataWithPhotos,
  companyId: number,
  userId?: number,
  isDraft: boolean = false,
  draftId?: number
): Promise<SaveResult> {
  try {
    console.log("🚀 Iniciando guardado de servicio con fotos");

    // Validaciones básicas
    if (!serviceData.vin?.trim()) {
      return { success: false, errors: { vin: "El VIN es requerido" } };
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { vin: serviceData.vin },
    });

    if (!vehicle) {
      return { success: false, message: "Vehículo no encontrado" };
    }

    // Transacción para guardar servicio + fotos
    const service = await prisma.$transaction(async (tx) => {
      let savedOrder;

      // Actualizar borrador existente o crear nuevo servicio
      if (draftId) {
        console.log(`🔄 Actualizando borrador de servicio ID: ${draftId}`);

        // Eliminar fotos anteriores
        await tx.orderPhoto.deleteMany({
          where: { orderId: draftId },
        });

        // Actualizar orden
        savedOrder = await tx.order.update({
          where: { id: draftId },
          data: {
            draft: isDraft,
            vehicleVin: serviceData.vin,
            status: isDraft ? "BORRADOR" : "COMPLETADO",
            actualMileage: Number(serviceData.actualMileage) || 0,
            additionalObservations: serviceData.additionalObservations || "",
            service: serviceData.service || null,
            type: "SERVICIO",
          },
        });

        // Agregar historial si se convierte a orden
        if (!isDraft) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: draftId,
              status: "COMPLETADO",
              changedAt: new Date(),
            },
          });
        }
      } else {
        console.log("🆕 Creando nuevo servicio");

        // Determinar número de orden
        let orderNumber = 99999;
        if (!isDraft) {
          const lastOrder = await tx.order.findFirst({
            where: { draft: false },
            orderBy: { orderNumber: "desc" },
          });
          orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100000;
        }

        // Crear nuevo servicio
        savedOrder = await tx.order.create({
          data: {
            orderNumber,
            type: "SERVICIO",
            creationDate: new Date(),
            draft: isDraft,
            vehicleVin: serviceData.vin,
            companyId,
            userId,
            status: isDraft ? "BORRADOR" : "COMPLETADO",
            internalStatus: null,
            actualMileage: Number(serviceData.actualMileage) || 0,
            additionalObservations: serviceData.additionalObservations || "",
            service: serviceData.service || null,
            statusHistory: isDraft
              ? {
                  create: [
                    {
                      status: "BORRADOR",
                      changedAt: new Date(),
                    },
                  ],
                }
              : undefined,
          },
        });
      }

      // Guardar fotos en OrderPhoto
      console.log("📸 Guardando fotos en base de datos");

      const photosToCreate = [
        { type: "vin_plate", url: serviceData.photoUrls.vinPlate },
        ...serviceData.photoUrls.or.map((url, i) => ({
          type: `or_${i + 1}`,
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

      // Retornar servicio completo
      return tx.order.findUnique({
        where: { id: savedOrder.id },
        include: {
          vehicle: true,
          photos: true,
        },
      });
    });

    // Mensaje según operación
    let message = "";
    if (draftId) {
      message = isDraft
        ? "✅ Borrador de servicio actualizado correctamente"
        : "✅ Borrador convertido a servicio exitosamente";
    } else {
      message = isDraft
        ? "✅ Borrador de servicio guardado correctamente"
        : "✅ Servicio creado exitosamente";
    }

    return {
      success: true,
      service,
      message,
    };
  } catch (error) {
    console.error("❌ Error en saveServiceWithPhotos:", error);
    return {
      success: false,
      message: "❌ Error interno del servidor",
    };
  }
}