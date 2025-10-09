"use server";

import { prisma } from "@/lib/prisma";
import { activateWarrantySchema } from "@/schemas/warranty";
import { CreateOrderData, CreateOrderResult } from '@/app/types';

// Función auxiliar para buscar o crear customer
async function findOrCreateCustomer(
    customerData: {
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        address?: string;
        state?: string;
        city?: string;
    },
) {
    // Buscar customer por nombre y apellido
    let customer = await prisma.customer.findFirst({
        where: {
            AND: [
                {
                    firstName: {
                        contains: customerData.firstName,
                        mode: 'insensitive'
                    }
                },
                {
                    lastName: {
                        contains: customerData.lastName,
                        mode: 'insensitive'
                    }
                },
            ]
        }
    });

    // Si no existe, crear uno nuevo con datos mínimos requeridos
    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                email: customerData.email || `temp-${Date.now()}@example.com`, // Email temporal
                phone: customerData.phone || "No proporcionado",
                address: customerData.address || "No proporcionado",
                state: customerData.state || "No proporcionado",
                city: customerData.city || "No proporcionado",
            }
        });
    }

    return customer;
}

// Función auxiliar para buscar parts por código
async function findPartByCode(code: string) {
    return await prisma.part.findFirst({
        where: {
            code: code
        }
    });
}

// Función para crear orden (draft: false)
export async function createOrder(
    orderData: CreateOrderData,
    companyId: number,
    userId?: number
): Promise<CreateOrderResult> {
    try {
        // Validaciones básicas
        if (!orderData.vin) {
            return {
                success: false,
                errors: { vin: 'El VIN es requerido' }
            };
        }

        // Verificar que el vehículo existe
        const vehicle = await prisma.vehicle.findUnique({
            where: { vin: orderData.vin }
        });

        if (!vehicle) {
            return {
                success: false,
                message: 'Vehículo no encontrado'
            };
        }

        // Buscar o crear customer
        const customer = await findOrCreateCustomer(orderData.customerName);

        // Generar número de orden (podrías tener una lógica más sofisticada)
        const lastOrder = await prisma.order.findFirst({
            orderBy: { orderNumber: 'desc' }
        });

        const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100000;

        // Crear la orden
        const order = await prisma.order.create({
            data: {
                orderNumber: orderNumber,
                type: 'PRE_AUTORIZACION', // o el tipo que corresponda
                creationDate: new Date(),
                draft: false, // ← NO es borrador
                customerId: customer.id,
                vehicleVin: orderData.vin,
                companyId: companyId,
                userId: userId,
                status: 'PENDIENTE', // estado inicial
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
                                        // Buscar el part por código
                                        const part = await findPartByCode(partItem.part.code);

                                        return {
                                            partId: part?.id || 0, // Si no existe, podrías crear uno o manejar error
                                            quantity: 1, // Por defecto 1, podrías agregar campo quantity
                                            description: partItem.part.description
                                        };
                                    })
                                )
                            }
                        }))
                    )
                },
                statusHistory: {
                    create: [{
                        status: 'PENDIENTE'
                    }]
                }
            },
            include: {
                tasks: {
                    include: {
                        parts: {
                            include: {
                                part: true
                            }
                        }
                    }
                },
                customer: true,
                vehicle: true
            }
        });

        return {
            success: true,
            order: order,
            message: 'Orden creada exitosamente'
        };

    } catch (error) {
        console.error('Error creating order:', error);
        return {
            success: false,
            message: 'Error interno del servidor'
        };
    }
}

// Función para guardar borrador (draft: true)
export async function saveOrderDraft(
    orderData: CreateOrderData,
    companyId: number,
    userId?: number
): Promise<CreateOrderResult> {
    try {
        // Para borradores, las validaciones son más flexibles
        if (!orderData.vin) {
            return {
                success: false,
                errors: { vin: 'El VIN es requerido' }
            };
        }

        // Verificar que el vehículo existe
        const vehicle = await prisma.vehicle.findUnique({
            where: { vin: orderData.vin }
        });

        if (!vehicle) {
            return {
                success: false,
                message: 'Vehículo no encontrado'
            };
        }

        // Buscar o crear customer
        const customer = await findOrCreateCustomer(orderData.customerName);

        // Para borradores, podrías usar un número temporal o null
        const draftOrderNumber = 99999; // O tu valor default del schema

        // Crear el borrador
        const draft = await prisma.order.create({
            data: {
                orderNumber: draftOrderNumber,
                type: 'PRE_AUTORIZACION',
                creationDate: new Date(),
                draft: true,
                customerId: customer.id,
                vehicleVin: orderData.vin,
                companyId: companyId,
                userId: userId,
                status: 'PENDIENTE',
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
                                            description: partItem.part.description
                                        };
                                    })
                                )
                            }
                        }))
                    )
                },
                statusHistory: {
                    create: [{
                        status: 'PENDIENTE'
                    }]
                }
            },
            include: {
                tasks: {
                    include: {
                        parts: {
                            include: {
                                part: true
                            }
                        }
                    }
                },
                customer: true,
                vehicle: true
            }
        });

        return {
            success: true,
            order: draft,
            message: 'Borrador guardado exitosamente'
        };

    } catch (error) {
        console.error('Error saving draft:', error);
        return {
            success: false,
            message: 'Error al guardar borrador'
        };
    }
}

// Función para actualizar un borrador existente
export async function updateOrderDraft(
    orderId: number,
    orderData: CreateOrderData
): Promise<CreateOrderResult> {
    try {
        // Primero eliminar tasks existentes para recrearlas
        await prisma.orderTask.deleteMany({
            where: { orderId: orderId }
        });

        // Actualizar el borrador
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
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
                                            description: partItem.part.description
                                        };
                                    })
                                )
                            }
                        }))
                    )
                }
            },
            include: {
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

        return {
            success: true,
            order: updatedOrder,
            message: 'Borrador actualizado exitosamente'
        };

    } catch (error) {
        console.error('Error updating draft:', error);
        return {
            success: false,
            message: 'Error al actualizar borrador'
        };
    }
}