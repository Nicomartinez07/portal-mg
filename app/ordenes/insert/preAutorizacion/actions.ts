"use server";

import { prisma } from "@/lib/prisma";
import { CreateOrderData, CreateOrderResult } from "@/app/types";

// ✅ Reutilizamos tus helpers
async function findOrCreateCustomer(customerData: any) {
    let customer = await prisma.customer.findFirst({
        where: {
            firstName: { contains: customerData.firstName },
            lastName: { contains: customerData.lastName },
        },
    });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                email: customerData.email || "No proporcionado",
                phone: customerData.phone || "No proporcionado",
                address: customerData.address || "No proporcionado",
                state: customerData.state || "No proporcionado",
                city: customerData.city || "No proporcionado",
            },
        });
    }

    return customer;
}

async function findPartByCode(code: string) {
    return await prisma.part.findFirst({ where: { code } });
}

export async function savePreAuthorization(
    orderData: CreateOrderData,
    companyId: number,
    userId?: number,
    isDraft: boolean = false
): Promise<CreateOrderResult> {
    try {
        // Validaciones mínimas
        if (!orderData.vin) {
            return { success: false, errors: { vin: "El VIN es requerido" } };
        }

        // Verificar que el vehículo exista
        const vehicle = await prisma.vehicle.findUnique({
            where: { vin: orderData.vin },
        });

        if (!vehicle) {
            return { success: false, message: "Vehículo no encontrado" };
        }

        // Buscar o crear cliente
        const customer = await findOrCreateCustomer(orderData.customerName);

        // Si es una orden, generamos un número nuevo
        const orderNumber = isDraft
            ? 99999
            : (await prisma.order.findFirst({
                orderBy: { orderNumber: "desc" },
            }))?.orderNumber + 1 || 100000;

        // Crear o actualizar
        const order = await prisma.order.create({
            data: {
                orderNumber,
                type: "PRE_AUTORIZACION",
                creationDate: new Date(),
                draft: isDraft,
                customerId: customer.id,
                vehicleVin: orderData.vin,
                companyId,
                userId,
                status: "PENDIENTE",
                internalStatus: null,
                actualMileage: parseInt(orderData.actualMileage) || 0,
                diagnosis: orderData.diagnosis,
                additionalObservations: orderData.additionalObservations,
                tasks: {
                    create: await Promise.all(
                        orderData.tasks.map(async (task) => ({
                            description: task.description,
                            hoursCount: parseInt(task.hoursCount) || 0,
                            parts: {
                                create: await Promise.all(
                                    task.parts.map(async (partItem) => {
                                        const part = await findPartByCode(partItem.part.code);
                                        return {
                                            partId: part?.id || 0,
                                            quantity: 1,
                                            description: partItem.part.description,
                                        };
                                    })
                                ),
                            },
                        }))
                    ),
                },
                statusHistory: { create: [{ status: "PENDIENTE" }] },
            },
            include: {
                tasks: { include: { parts: { include: { part: true } } } },
                customer: true,
                vehicle: true,
            },
        });

        return {
            success: true,
            order,
            message: isDraft
                ? "Borrador guardado exitosamente"
                : "Orden creada exitosamente",
        };
    } catch (error) {
        console.error("Error en savePreAuthorization:", error);
        return {
            success: false,
            message: "Error interno del servidor",
        };
    }
}
