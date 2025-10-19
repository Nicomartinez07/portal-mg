"use server";

import { prisma } from "@/lib/prisma";

export async function getVehicleDetails(vin: string) {
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { vin },
            include: {
                warranty: { include: { company: true, customer: true } },
                orders: {
                    where: {
                        draft: { not: true } 
                    },
                    // -----------------------------
                    include: {
                        customer: true,
                        company: true,
                        tasks: { 
                            include: {
                                parts: { include: { part: true } }
                            }
                        },
                        photos: true,
                        statusHistory: true,
                        user: true,
                        vehicle: {
                          include: { warranty: true }
                        }
                    },
                    orderBy: {
                        creationDate: 'desc'
                    }
                },
            },
        });

        if (!vehicle) {
            return null;
        }

        // Corregimos los filtros a los tipos de tu base de datos
        const serviceOrders = vehicle.orders.filter(order => order.type === 'SERVICIO');
        const claimOrders = vehicle.orders.filter(order => order.type === 'RECLAMO');

        return {
            ...vehicle,
            serviceOrders,
            claimOrders,  
        };

    } catch (error) {
        console.error("Error fetching vehicle data:", error);
        throw new Error("Error al cargar la información del vehículo.");
    }
}